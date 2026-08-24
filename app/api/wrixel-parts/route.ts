import { auth } from "../../../auth";
import { supabase } from "../../../lib/supabase";

export const GET = auth(async (request) => {
  const email = typeof request.auth?.user?.email === "string" ? request.auth.user.email : null;
  if (!email) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!supabase) return Response.json({ error: "Supabase no configurado" }, { status: 503 });
  const { data, error } = await supabase.from("user_wrixel_parts").select("part_key").eq("email", email).eq("collected", true);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ parts: (data ?? []).map(({ part_key }) => part_key) });
});

export const POST = auth(async (request) => {
  const email = typeof request.auth?.user?.email === "string" ? request.auth.user.email : null;
  if (!email) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!supabase) return Response.json({ error: "Supabase no configurado" }, { status: 503 });
  const body = await request.json();
  const partKey = String(body.partKey ?? "").trim().toLowerCase();
  const collected = Boolean(body.collected);
  if (!/^[a-z0-9-]{3,80}$/.test(partKey)) return Response.json({ error: "Pieza inválida" }, { status: 400 });
  const result = collected
    ? await supabase.from("user_wrixel_parts").upsert({ email, part_key: partKey, collected: true, updated_at: new Date().toISOString() }, { onConflict: "email,part_key" })
    : await supabase.from("user_wrixel_parts").delete().eq("email", email).eq("part_key", partKey);
  if (result.error) return Response.json({ error: result.error.message }, { status: 500 });
  return Response.json({ ok: true });
});
