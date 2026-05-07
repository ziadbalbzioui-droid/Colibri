import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const QONTO_BASE_URL = "https://thirdparty-sandbox.staging.qonto.co/v2";
const QONTO_TOKEN_URL = "https://oauth-sandbox.staging.qonto.co/oauth2/token";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

// Lit les tokens depuis la base et rafraîchit l'access_token
async function getValidAccessToken(): Promise<string> {
  const { data, error } = await supabase
    .from("qonto_tokens")
    .select("access_token, refresh_token")
    .eq("id", 1)
    .single();

  if (error || !data) throw new Error("Impossible de lire qonto_tokens");

  // Rafraîchit toujours avant chaque dispatch pour éviter l'expiration
  const res = await fetch(QONTO_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Qonto-Staging-Token": Deno.env.get("QONTO_STAGING_TOKEN")!,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: data.refresh_token,
      client_id: Deno.env.get("QONTO_CLIENT_ID")!,
      client_secret: Deno.env.get("QONTO_CLIENT_SECRET")!,
    }),
  });

  const tokens = await res.json();
  if (!res.ok) throw new Error(`Refresh token → ${res.status}: ${JSON.stringify(tokens)}`);

  // Sauvegarde les nouveaux tokens AVANT d'utiliser l'access token
  // Si cette sauvegarde échoue, on arrête tout pour éviter un état incohérent
  const { error: saveError } = await supabase
    .from("qonto_tokens")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (saveError) throw new Error(`Sauvegarde tokens échouée: ${saveError.message}`);

  return tokens.access_token;
}

function qontoHeaders(accessToken: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    "X-Qonto-Staging-Token": Deno.env.get("QONTO_STAGING_TOKEN")!,
    ...extra,
  };
}

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

async function verifyPayee(accessToken: string, iban: string, name: string): Promise<string> {
  const res = await fetch(`${QONTO_BASE_URL}/sepa/verify_payee`, {
    method: "POST",
    headers: qontoHeaders(accessToken),
    body: JSON.stringify({ iban, beneficiary_name: name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`verify_payee → ${res.status}: ${JSON.stringify(data)}`);
  if (data.match_result && data.match_result !== "MATCH_RESULT_MATCH") {
    console.warn(`verify_payee warning pour ${name}: ${data.match_result}`);
  }
  return data.proof_token?.token ?? data.proof_token;
}

async function createTransfer(accessToken: string, params: {
  proofToken: string;
  iban: string;
  name: string;
  amount: number;
  reference: string;
  idempotencyKey: string;
}): Promise<string> {
  const body = {
    vop_proof_token: params.proofToken,
    transfer: {
      beneficiary: { iban: params.iban, name: params.name },
      bank_account_id: Deno.env.get("QONTO_BANK_ACCOUNT_ID")!,
      amount: params.amount.toFixed(2),
      reference: params.reference,
    },
  };

  const doTransfer = async (scaToken?: string) => {
    const extra: Record<string, string> = {
      "X-Qonto-Idempotency-Key": params.idempotencyKey,
      "X-Qonto-2fa-Preference": "mock",
    };
    if (scaToken) extra["X-Qonto-Sca-Session-Token"] = scaToken;

    return await fetch(`${QONTO_BASE_URL}/sepa/transfers`, {
      method: "POST",
      headers: qontoHeaders(accessToken, extra),
      body: JSON.stringify(body),
    });
  };

  let res = await doTransfer();
  let data = await res.json();

  if (data.sca_session_token) {
    const scaToken: string = data.sca_session_token;

    const scaRes = await fetch(
      `${QONTO_BASE_URL}/mocked_sca_sessions/${scaToken}/allow`,
      { method: "POST", headers: qontoHeaders(accessToken) },
    );
    if (!scaRes.ok) {
      const scaErr = await scaRes.json();
      throw new Error(`SCA allow → ${scaRes.status}: ${JSON.stringify(scaErr)}`);
    }

    res = await doTransfer(scaToken);
    data = await res.json();
  }

  if (!res.ok) throw new Error(`sepa/transfers → ${res.status}: ${JSON.stringify(data)}`);

  return data?.transfer?.id ?? "unknown";
}

interface GrilleRow {
  tarif_palier: number;
  multiplicateur_brut: number;
}

function getMultiplicateurBrut(grille: GrilleRow[], tarifHeure: number): number {
  const sorted = [...grille].sort((a, b) => b.tarif_palier - a.tarif_palier);
  const match = sorted.find((g) => g.tarif_palier <= tarifHeure);
  // Fallback : multiplicateur 1.25 net → brut si aucun palier trouvé
  return match?.multiplicateur_brut ?? 1.5272;
}

interface RecapRow {
  id: string;
  prof_id: string;
  mois: number;
  annee: number;
  profiles: { prenom: string; nom: string; iban: string | null };
  cours: { montant: number; multiplicateur_brut: number | null; eleves: { tarif_heure: number } | null }[];
}

async function dispatchPaymentsToTutors(profIdFilter?: string): Promise<{
  success: string[];
  errors: { prof_id: string; error: string }[];
}> {
  // Renouvelle le token une fois pour tous les virements du batch
  const accessToken = await getValidAccessToken();

  // Charge la grille de commission (fallback si cours.multiplicateur_brut est null)
  const { data: grille, error: grilleError } = await supabase
    .from("grille_commission")
    .select("tarif_palier, multiplicateur_brut");
  if (grilleError) throw new Error(`Supabase fetch grille_commission: ${grilleError.message}`);

  let query = supabase
    .from("recap_mensuel")
    .select(`
      id, prof_id, mois, annee,
      profiles!inner ( prenom, nom, iban ),
      cours ( montant, multiplicateur_brut, eleves ( tarif_heure ) )
    `)
    .eq("statut", "valide");

  if (profIdFilter) query = query.eq("prof_id", profIdFilter);

  const { data: recaps, error } = await query;

  if (error) throw new Error(`Supabase fetch recaps: ${error.message}`);
  if (!recaps || recaps.length === 0) {
    console.log("Aucun recap validé à dispatcher.");
    return { success: [], errors: [] };
  }

  const byProf = new Map<string, {
    recapIds: string[];
    totalVirement: number;
    iban: string;
    nom: string;
    moisAnnee: string;
  }>();

  for (const recap of recaps as unknown as RecapRow[]) {
    const iban = recap.profiles?.iban;
    if (!iban) {
      console.warn(`Prof ${recap.prof_id} sans IBAN, ignoré`);
      continue;
    }

    // Utilise le multiplicateur figé sur le cours ; fallback grille si null
    let virementRecap = 0;
    for (const cours of recap.cours ?? []) {
      const multi = cours.multiplicateur_brut != null
        ? Number(cours.multiplicateur_brut)
        : getMultiplicateurBrut(grille as GrilleRow[], Number(cours.eleves?.tarif_heure ?? 0));
      virementRecap += Number(cours.montant) * multi;
    }

    const label = `${String(recap.mois).padStart(2, "0")}/${recap.annee}`;
    const entry = byProf.get(recap.prof_id);

    if (entry) {
      entry.recapIds.push(recap.id);
      entry.totalVirement += virementRecap;
      entry.moisAnnee += `, ${label}`;
    } else {
      byProf.set(recap.prof_id, {
        recapIds: [recap.id],
        totalVirement: virementRecap,
        iban,
        nom: `${recap.profiles.prenom} ${recap.profiles.nom}`,
        moisAnnee: label,
      });
    }
  }

  const successes: string[] = [];
  const errors: { prof_id: string; error: string }[] = [];

  for (const [profId, { recapIds, totalVirement, iban, nom, moisAnnee }] of byProf) {
    const montantNet = Math.round(totalVirement * 100) / 100;
    const idempotencyKey = crypto.randomUUID();

    try {
      const { data: transfer, error: insertErr } = await supabase
        .from("qonto_bulk_transfers")
        .insert({
          prof_id: profId,
          montant: montantNet,
          iban,
          statut: "pending",
          idempotency_key: idempotencyKey,
        })
        .select("id")
        .single();

      if (insertErr) throw new Error(`Insert qonto_bulk_transfers: ${insertErr.message}`);

      const proofToken = await verifyPayee(accessToken, iban, nom);

      const qontoTransferId = await createTransfer(accessToken, {
        proofToken,
        iban,
        name: nom,
        amount: montantNet,
        reference: `Colibri ${moisAnnee}`,
        idempotencyKey,
      });

      await supabase
        .from("qonto_bulk_transfers")
        .update({ statut: "sent", qonto_transfer_id: qontoTransferId })
        .eq("id", transfer.id);

      await supabase
        .from("recap_mensuel")
        .update({ statut: "paye" })
        .in("id", recapIds);

      successes.push(profId);
      console.log(`✓ ${nom} → ${montantNet}€ (${qontoTransferId})`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({ prof_id: profId, error: msg });
      console.error(`✗ Échec ${profId}: ${msg}`);

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
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
  }

  try {
    await assertAdmin(req);
    const body = req.headers.get("Content-Length") !== "0"
      ? await req.json().catch(() => ({}))
      : {};
    const profIdFilter: string | undefined = body?.prof_id ?? undefined;
    const result = await dispatchPaymentsToTutors(profIdFilter);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Fatal:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
