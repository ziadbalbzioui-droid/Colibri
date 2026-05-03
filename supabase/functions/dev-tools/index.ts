import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { dispatchPaymentsToTutors } from "../dispatch-payments/index.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // POST /dev-tools/trigger-dispatch
  if (req.method === "POST" && url.pathname.endsWith("/trigger-dispatch")) {
    try {
      const result = await dispatchPaymentsToTutors();
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // POST /dev-tools/fake-virement
  if (req.method === "POST" && url.pathname.endsWith("/fake-virement")) {
    const body = await req.json().catch(() => ({}));
    const montant: number = body.montant ?? 1000;

    const { data, error } = await supabase
      .from("urssaf_virements_recus")
      .insert({
        montant,
        qonto_tx_id: `fake-${crypto.randomUUID()}`,
        dispatche: false,
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ inserted: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
});
