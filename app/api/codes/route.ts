import { auth } from "../../../auth";
import { supabase } from "../../../lib/supabase";

const getEmail = (request: Request & { auth?: { user?: { email?: string | null } } }) => typeof request.auth?.user?.email === "string" ? request.auth.user.email : null;

export const GET = auth(async (request) => {
  const email = getEmail(request);
  if (!email) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!supabase) return Response.json({ error: "Supabase no configurado" }, { status: 503 });
  const [{ data: codes, error: codesError }, { data: used, error: usedError }] = await Promise.all([
    supabase.from("fortnite_codes").select("id, code, reward").eq("active", true).order("created_at", { ascending: true }),
    supabase.from("user_used_fortnite_codes").select("code_id").eq("email", email),
  ]);
  if (codesError || usedError) return Response.json({ error: codesError?.message || usedError?.message }, { status: 500 });
  return Response.json({ codes: codes ?? [], usedCodeIds: (used ?? []).map(({ code_id }) => code_id) });
});

export const POST = auth(async (request) => {
  const email = getEmail(request);
  if (!email) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!supabase) return Response.json({ error: "Supabase no configurado" }, { status: 503 });
  const body = await request.json();
  const codeId = Number(body.codeId);
  const used = Boolean(body.used);
  if (!Number.isInteger(codeId) || codeId < 1) return Response.json({ error: "Código inválido" }, { status: 400 });
  const { data: code } = await supabase.from("fortnite_codes").select("id").eq("id", codeId).eq("active", true).single();
  if (!code) return Response.json({ error: "Código no encontrado" }, { status: 404 });
  const result = used
    ? await supabase.from("user_used_fortnite_codes").upsert({ email, code_id: codeId }, { onConflict: "email,code_id" })
    : await supabase.from("user_used_fortnite_codes").delete().eq("email", email).eq("code_id", codeId);
  if (result.error) return Response.json({ error: result.error.message }, { status: 500 });
  return Response.json({ ok: true });
});
