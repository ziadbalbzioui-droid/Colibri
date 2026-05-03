import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const QONTO_BASE_URL = "https://thirdparty-sandbox.staging.qonto.co/v2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function assertAdmin(req: Request): Promise<void> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Non autorisé");

  const jwt = authHeader.slice(7);
  const caller = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error } = await caller.auth.getUser(jwt);
  if (error || !user) throw new Error("Token invalide");

  const { data: profile, error: pe } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (pe || profile?.role !== "admin") throw new Error("Accès refusé : rôle admin requis");
}

interface RecapRow {
  id: string;
  prof_id: string;
  mois: number;
  annee: number;
  profiles: {
    prenom: string;
    nom: string;
    iban: string | null;
  };
  cours: { montant: number }[];
}

async function qontoPost(path: string, body: unknown) {
  const res = await fetch(`${QONTO_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Qonto-Staging-Token": Deno.env.get("QONTO_STAGING_TOKEN")!,
      Authorization: `${Deno.env.get("QONTO_LOGIN")}:${Deno.env.get("QONTO_SECRET_KEY")}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Qonto ${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// Gère le flow SCA mock sandbox : approve + replay automatiquement
async function handleSca(transferId: string) {
  try {
    await qontoPost(`/external_transfers/${transferId}/approve`, {});
    await qontoPost(`/external_transfers/${transferId}/replay`, {});
  } catch (e) {
    console.warn(`SCA mock failed for ${transferId}:`, e);
  }
}

export async function dispatchPaymentsToTutors(): Promise<{
  success: string[];
  errors: { prof_id: string; error: string }[];
}> {
  const profMultiplier = parseFloat(Deno.env.get("COLIBRI_PROF_MULTIPLIER") ?? "1.25");

  // Récupère tous les recaps validés non encore payés
  const { data: recaps, error } = await supabase
    .from("recap_mensuel")
    .select(`
      id,
      prof_id,
      mois,
      annee,
      profiles!inner ( prenom, nom, iban ),
      cours ( montant )
    `)
    .eq("statut", "valide");

  if (error) throw new Error(`Supabase fetch recaps: ${error.message}`);
  if (!recaps || recaps.length === 0) {
    console.log("Aucun recap validé à dispatcher.");
    return { success: [], errors: [] };
  }

  // Regroupe par prof_id
  const byProf = new Map<string, { recapIds: string[]; totalBrut: number; iban: string; nom: string }>();

  for (const recap of recaps as unknown as RecapRow[]) {
    const iban = recap.profiles?.iban;
    if (!iban) {
      console.warn(`Prof ${recap.prof_id} n'a pas d'IBAN, recap ${recap.id} ignoré`);
      continue;
    }

    const montantRecap = (recap.cours ?? []).reduce((sum, c) => sum + Number(c.montant), 0);
    const entry = byProf.get(recap.prof_id);

    if (entry) {
      entry.recapIds.push(recap.id);
      entry.totalBrut += montantRecap;
    } else {
      byProf.set(recap.prof_id, {
        recapIds: [recap.id],
        totalBrut: montantRecap,
        iban,
        nom: `${recap.profiles.prenom} ${recap.profiles.nom}`,
      });
    }
  }

  const successes: string[] = [];
  const errors: { prof_id: string; error: string }[] = [];

  for (const [profId, { recapIds, totalBrut, iban, nom }] of byProf) {
    const montantNet = Math.round(totalBrut * profMultiplier * 100) / 100;

    try {
      // Enregistre le transfert en base avant l'appel Qonto
      const { data: transfer, error: insertErr } = await supabase
        .from("qonto_bulk_transfers")
        .insert({
          prof_id: profId,
          montant: montantNet,
          iban,
          statut: "pending",
        })
        .select("id")
        .single();

      if (insertErr) throw new Error(`Insert qonto_bulk_transfers: ${insertErr.message}`);

      // Appel Qonto créer virement
      const payload = {
        external_transfer: {
          beneficiary_name: nom,
          beneficiary_iban: iban,
          amount: montantNet,
          currency: "EUR",
          reference: `Colibri - paiement prof ${nom} - ${new Date().toISOString().slice(0, 7)}`,
        },
      };

      const result = await qontoPost("/external_transfers", payload);
      const qontoTransferId: string = result?.external_transfer?.id ?? result?.id;

      // Flow SCA mock sandbox
      if (qontoTransferId) await handleSca(qontoTransferId);

      // Met à jour qonto_bulk_transfers → sent
      await supabase
        .from("qonto_bulk_transfers")
        .update({ statut: "sent", qonto_transfer_id: qontoTransferId })
        .eq("id", transfer.id);

      // Met à jour les recap_mensuel concernés → paye
      await supabase
        .from("recap_mensuel")
        .update({ statut: "paye" })
        .in("id", recapIds);

      successes.push(profId);
      console.log(`✓ Virement ${montantNet}€ envoyé à ${nom} (${profId})`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({ prof_id: profId, error: msg });
      console.error(`✗ Échec prof ${profId}: ${msg}`);

      // Marque le transfert en erreur si il a été créé
      await supabase
        .from("qonto_bulk_transfers")
        .update({ statut: "failed" })
        .eq("prof_id", profId)
        .eq("statut", "pending");
    }
  }

  return { success: successes, errors };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    await assertAdmin(req);
    const result = await dispatchPaymentsToTutors();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("dispatchPaymentsToTutors fatal:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
