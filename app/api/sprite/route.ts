export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get("url");
  if (!source) return new Response("Falta la imagen", { status: 400 });
  let url: URL;
  try { url = new URL(source); } catch { return new Response("URL inválida", { status: 400 }); }
  if (url.origin !== "https://fortnite.gg") return new Response("Origen no permitido", { status: 403 });
  const response = await fetch(url);
  if (!response.ok || !response.body) return new Response("Imagen no encontrada", { status: 404 });
  return new Response(response.body, { headers: { "Content-Type": response.headers.get("content-type") || "image/webp", "Cache-Control": "public, max-age=86400" } });
}
