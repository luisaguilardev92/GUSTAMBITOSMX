import { auth } from "../../../auth";
import { supabase } from "../../../lib/supabase";

export const GET = auth(async (request) => {
  const session = request.auth;
  const email = session?.user?.email;
  if (!email) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!supabase) return Response.json({ error: "Supabase no configurado" }, { status: 503 });
  await supabase.from("user_profiles").upsert({ email, name: session.user?.name, image: session.user?.image, updated_at: new Date().toISOString() });
  const { data: profile, error: profileError } = await supabase.from("user_profiles").select("email, name, image, friend_code").eq("email", email).single();
  if (profileError) return Response.json({ error: profileError.message }, { status: 500 });
  const { data: links, error: linksError } = await supabase.from("user_friends").select("friend_email").eq("owner_email", email);
  if (linksError) return Response.json({ error: linksError.message }, { status: 500 });
  const friends = await Promise.all((links ?? []).map(async ({ friend_email }) => {
    const { data: friend } = await supabase.from("user_profiles").select("email, name, image, friend_code").eq("email", friend_email).single();
    const { data: progress } = await supabase.from("gustambito_progress").select("gustambito_id, variant_label, level").eq("email", friend_email);
    return { ...friend, progress: progress ?? [] };
  }));
  return Response.json({ profile, friends });
});

export const POST = auth(async (request) => {
  const email = request.auth?.user?.email;
  if (!email) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!supabase) return Response.json({ error: "Supabase no configurado" }, { status: 503 });
  const code = String((await request.json()).friendCode ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(code)) return Response.json({ error: "El ID debe tener 8 caracteres" }, { status: 400 });
  const { data: friend } = await supabase.from("user_profiles").select("email").eq("friend_code", code).single();
  if (!friend) return Response.json({ error: "No encontramos ese ID" }, { status: 404 });
  if (friend.email === email) return Response.json({ error: "No puedes agregarte a ti mismo" }, { status: 400 });
  const { error } = await supabase.from("user_friends").upsert([{ owner_email: email, friend_email: friend.email }, { owner_email: friend.email, friend_email: email }]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
});
