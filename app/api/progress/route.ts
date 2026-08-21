import { auth } from "../../../auth";
import { supabase } from "../../../lib/supabase";

export async function GET(request: Request) {
  const session = await auth(request);
  const email = session?.user?.email;
  if (!email) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!supabase) return Response.json({ error: "Supabase no configurado" }, { status: 503 });

  await supabase.from("user_profiles").upsert({ email, name: session.user.name, image: session.user.image, updated_at: new Date().toISOString() });
  const { data, error } = await supabase.from("gustambito_progress").select("gustambito_id, variant_label, level").eq("email", email);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ progress: data });
}

export async function PUT(request: Request) {
  const session = await auth(request);
  const email = session?.user?.email;
  if (!email) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!supabase) return Response.json({ error: "Supabase no configurado" }, { status: 503 });

  const body = await request.json();
  const level = Number(body.level);
  const gustambitoId = Number(body.gustambitoId);
  const variantLabel = String(body.variantLabel);
  if (!Number.isInteger(gustambitoId) || !variantLabel || !Number.isInteger(level) || level < 0 || level > 5) return Response.json({ error: "Datos inválidos" }, { status: 400 });

  await supabase.from("user_profiles").upsert({ email, name: session.user.name, image: session.user.image, updated_at: new Date().toISOString() });
  const { error } = await supabase.from("gustambito_progress").upsert({ email, gustambito_id: gustambitoId, variant_label: variantLabel, level, updated_at: new Date().toISOString() });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
