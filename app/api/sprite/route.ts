export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get("url");
  if (!source) return new Response("Falta la imagen", { status: 400 });
  let url: URL;
  try { url = new URL(source); } catch { return new Response("URL inválida", { status: 400 }); }
  if (url.origin !== "https://fortnite.gg") return new Response("Origen no permitido", { status: 403 });
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; GustambitosMX/1.0)",
      Referer: "https://fortnite.gg/",
    },
    next: { revalidate: 86400 },
  });
  if (!response.ok || !response.body) return new Response("Imagen no encontrada", { status: 404 });
  return new Response(response.body, { headers: { "Content-Type": response.headers.get("content-type") || "image/webp", "Cache-Control": "public, max-age=86400" } });
}
