"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Variant = { label: string; image: string; level: number; available?: boolean };
type Gustambito = { id: number; name: string; subtitle: string; rarity: "Mítico" | "Épico" | "Raro"; color: string; image: string; season: string; variants: Variant[] };
type VariantCard = { item: Gustambito; variant: Variant; variantIndex: number };
type Friend = { email: string; name: string | null; image: string | null; friend_code: string; progress: { gustambito_id: number; variant_label: string; level: number }[] };

const spriteUrl = (key: string, variant = "") => `https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_${key}${variant ? `_${variant}` : ""}_L.webp`;
const makeVariants = (key: string, levels: number[] = [0, 0, 0], variantKeys: [string, string][] = [["Base", ""], ["Dorado", "Gold"], ["Cheat Master", "Cheatmaster"]]): Variant[] => variantKeys.map(([label, suffix], index) => ({ label, image: spriteUrl(key, suffix), level: levels[index] ?? 0 }));
const withLootHacker = (key: string, variants: Variant[], available = false): Variant[] => [...variants, { label: "Loot Hacker", image: spriteUrl(key, "Hacker"), level: 0, available }];
const initialGustambitos: Gustambito[] = [
  { id: 1, name: "Jackrabbit", subtitle: "Salta más lejos", rarity: "Raro", color: "#8ed35b", image: spriteUrl("JazzJackrabbit"), season: "GLITCH · Capítulo 7", variants: withLootHacker("DoubleJump", makeVariants("JazzJackrabbit")) },
  { id: 2, name: "Shadow", subtitle: "Se mueve entre las sombras", rarity: "Épico", color: "#5b4e74", image: spriteUrl("NarrowFlea_Scribe"), season: "GLITCH · Capítulo 7", variants: withLootHacker("ReloadOverTime", makeVariants("NarrowFlea_Scribe")) },
  { id: 3, name: "Bush", subtitle: "Se camufla en la isla", rarity: "Raro", color: "#79c85b", image: spriteUrl("BushRanger"), season: "GLITCH · Capítulo 7", variants: withLootHacker("BushRanger", makeVariants("BushRanger")) },
  { id: 4, name: "Tails", subtitle: "El compañero volador", rarity: "Épico", color: "#e98b42", image: spriteUrl("NarrowFlea_Monkey"), season: "GLITCH · Capítulo 7", variants: withLootHacker("NarrowFlea_Monkey", makeVariants("NarrowFlea_Monkey")) },
  { id: 5, name: "Killswitch", subtitle: "Controla el sistema", rarity: "Épico", color: "#94a5a1", image: spriteUrl("Killswitch"), season: "GLITCH · Capítulo 7", variants: withLootHacker("Killswitch", makeVariants("Killswitch")) },
  { id: 6, name: "Adventure", subtitle: "Siempre busca el siguiente nivel", rarity: "Épico", color: "#c47f48", image: spriteUrl("Dwarf"), season: "GLITCH · Capítulo 7", variants: withLootHacker("Dwarf", makeVariants("Dwarf")) },
  { id: 7, name: "Klombo", subtitle: "El gigante amistoso", rarity: "Mítico", color: "#ef63c4", image: spriteUrl("Klombo"), season: "GLITCH · Capítulo 7", variants: withLootHacker("Klombo", makeVariants("Klombo")) },
  { id: 8, name: "Jonesy", subtitle: "El héroe de siempre", rarity: "Épico", color: "#ef7b5b", image: spriteUrl("Jonesy"), season: "GLITCH · Capítulo 7", variants: withLootHacker("Jonesy", makeVariants("Jonesy")) },
  { id: 9, name: "Sonic", subtitle: "Corre a velocidad sónica", rarity: "Mítico", color: "#55b7ed", image: spriteUrl("NarrowFlea_Obsidian"), season: "GLITCH · Capítulo 7", variants: withLootHacker("NarrowFlea", makeVariants("NarrowFlea_Obsidian")) },
  { id: 10, name: "Crown", subtitle: "Realeza en el lobby", rarity: "Mítico", color: "#e6534e", image: spriteUrl("Crown"), season: "GLITCH · Capítulo 7", variants: makeVariants("Crown", [0, 0, 0], [["Base", ""], ["Dorado", "Gold"], ["Cheat Master", "Cheatmaster"]]).concat({ label: "Loot Hacker", image: spriteUrl("Crown", "Hacker"), level: 0, available: true }) },
  { id: 11, name: "8-Bit", subtitle: "Directo desde el arcade", rarity: "Épico", color: "#e86552", image: spriteUrl("EightBitBlaster"), season: "GLITCH · Capítulo 7", variants: withLootHacker("EightBitBlaster", makeVariants("EightBitBlaster")) },
  { id: 12, name: "Storm Scout", subtitle: "Descubre el siguiente círculo", rarity: "Raro", color: "#a775dd", image: spriteUrl("StormScout"), season: "GLITCH · Capítulo 7", variants: makeVariants("StormScout") },
  { id: 13, name: "Overshield", subtitle: "Otorga escudo adicional según el nivel", rarity: "Raro", color: "#68d8ee", image: spriteUrl("Overshield"), season: "GLITCH · Capítulo 7", variants: withLootHacker("Overshield", makeVariants("Overshield")) },
  { id: 14, name: "Mega Man", subtitle: "Se desliza con menos fricción", rarity: "Raro", color: "#4c9bf5", image: spriteUrl("ImprovedSlide"), season: "GLITCH · Capítulo 7", variants: makeVariants("ImprovedSlide", [0], [["Base", ""]]) },
  { id: 15, name: "X-Ray", subtitle: "Marca enemigos cercanos periódicamente", rarity: "Épico", color: "#f0d94d", image: spriteUrl("WinnerB"), season: "GLITCH · Capítulo 7", variants: withLootHacker("WinnerB", makeVariants("WinnerB")) },
  { id: 16, name: "Onigiri", subtitle: "Activa Overdrive al consumir", rarity: "Raro", color: "#f29a5b", image: spriteUrl("WinnerC"), season: "GLITCH · Capítulo 7", variants: withLootHacker("WinnerC", makeVariants("WinnerC")) },
];

const wrixelStyles = [
  ["Bananín", "Compra o mejora ocho hackeos de botín."],
  ["Líder del equipo cariñoso", "Usa cualquier hack de sala."],
  ["Miaúsculos", "Adquiere ocho potenciadores a lo largo de diferentes partidas."],
  ["Palito de pez", "Activa ocho glitches en consolas a lo largo de diferentes partidas."],
  ["Lince", "Activa el código de hackeo en Sociedad Sofisticada."],
  ["Acrobático", "Activa el código de hackeo en Santuario Solitario."],
  ["Aura", "Activa el código de hackeo en Wonkeelandia."],
  ["Espíritu maligno", "Activa el código de hackeo en Boulevard Boscoso."],
  ["Jonesy", "Habla con Jones y pregúntale por su estilo Wrixel."],
  ["Hope", "Habla con Hope y pregúntale por su estilo Wrixel."],
  ["Ziggy", "Completa nueve misiones de Ziggy."],
] as const;

const migrate = (value: Gustambito[]): Gustambito[] => value.map((item) => ({ ...item, variants: item.variants.map((variant) => ({ ...variant, level: typeof variant.level === "number" ? variant.level : ("obtained" in variant && variant.obtained ? 1 : 0) })) }));

const loadExportImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src.startsWith("http") ? `/api/sprite?url=${encodeURIComponent(src)}` : src;
});

async function downloadCollectionImage(items: Gustambito[], friendCode: string) {
  const cards = items.flatMap((item) => item.variants.map((variant) => ({ item, variant })));
  const columns = 6;
  const cellWidth = 190;
  const cellHeight = 184;
  const canvas = document.createElement("canvas");
  canvas.width = columns * cellWidth;
  canvas.height = 190 + Math.ceil(cards.length / columns) * cellHeight + 86;
  const context = canvas.getContext("2d");
  if (!context) return;
  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#09093b");
  background.addColorStop(1, "#06182f");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(57,232,255,.12)";
  for (let x = 0; x < canvas.width; x += 28) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); }
  for (let y = 0; y < canvas.height; y += 28) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); }
  context.fillStyle = "#fff";
  context.font = "900 32px Arial";
  context.fillText("gustambitosmx.vercel.app", 34, 55);
  const collected = cards.filter(({ variant }) => variant.level > 0).length;
  const mastered = cards.filter(({ variant }) => variant.level === 5).length;
  context.fillStyle = "#ff36ba";
  context.font = "900 18px Arial";
  context.fillText(`${collected}/${cards.length} CONSEGUIDOS · ${mastered} DOMINADOS`, 36, 105);
  const crown = await loadExportImage("/mastered-crown.png");
  for (const [index, { item, variant }] of cards.entries()) {
    const x = (index % columns) * cellWidth + 10;
    const y = 166 + Math.floor(index / columns) * cellHeight;
    context.strokeStyle = "rgba(57,232,255,.9)";
    context.strokeRect(x - 4, y + 3, cellWidth - 20, cellHeight - 12);
    context.strokeStyle = "rgba(255,54,186,.9)";
    context.strokeRect(x + 4, y - 3, cellWidth - 20, cellHeight - 12);
    context.fillStyle = variant.level > 0 ? "#0d3267" : "#101d35";
    context.fillRect(x, y, cellWidth - 20, cellHeight - 12);
    context.strokeStyle = variant.level > 0 ? "#277bad" : "#31435d";
    context.strokeRect(x, y, cellWidth - 20, cellHeight - 12);
    const sprite = await loadExportImage(variant.image);
    context.save();
    context.filter = variant.level === 0 ? "grayscale(1) brightness(.42)" : "none";
    if (variant.level > 0) {
      context.globalAlpha = .28;
      context.filter = "hue-rotate(130deg) saturate(2)";
      context.drawImage(sprite, x + 31, y + 8, 100, 110);
      context.globalAlpha = 1;
      context.filter = "none";
    }
    context.drawImage(sprite, x + 35, y + 8, 100, 110);
    context.restore();
    if (variant.level === 5) context.drawImage(crown, x + 72, y - 2, 40, 30);
    context.fillStyle = variant.level > 0 ? "#fff" : "#6d7e9b";
    context.font = "900 11px Arial";
    context.fillText(item.name.toUpperCase(), x + 10, y + 133);
    context.font = "10px Arial";
    context.fillText(variant.label, x + 10, y + 149);
    context.fillStyle = variant.level > 0 ? "#39e8ff" : "#687a95";
    context.font = "900 11px Arial";
    context.fillText(`NIVEL ${variant.level}/5`, x + 10, y + 166);
  }
  const footerY = canvas.height - 31;
  context.strokeStyle = "#39e8ff";
  context.beginPath(); context.moveTo(30, footerY - 28); context.lineTo(canvas.width - 30, footerY - 28); context.stroke();
  context.fillStyle = "#ffd84d";
  context.font = "900 22px Arial";
  context.fillText(`ID AMIGO: ${friendCode || "--------"}`, 30, footerY);
  const link = document.createElement("a");
  link.download = "gustambitosmx-coleccion.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const startLogin = () => { setLoading(true); void signIn("google").catch(() => setLoading(false)); };
  return <main className="login-screen"><div className="login-glow" /><div className="login-card"><div className="brand login-brand"><span className="brand-mark">G</span><span>GUSTAMBITOSMX</span></div><p className="eyebrow">GLITCH · TEMPORADA 04</p><div className="login-mascot"><img src="/mastered-crown.png" alt="Dominado" /></div><h1>Tu colección<br /><em>empieza aquí.</em></h1><p className="login-copy">Inicia sesión para guardar tus niveles, variantes y Gustambitos dominados.</p><button className="google-button" onClick={startLogin} disabled={loading}><span className="google-icon">G</span>{loading ? "Conectando..." : "Continuar con Google"}</button><small className="login-note">Tu progreso quedará asociado a tu cuenta.</small></div><div className="login-ad-slot" aria-label="Publicidad"><span>PUBLICIDAD</span><div>ESPACIO PUBLICITARIO</div></div>{loading && <div className="login-loader" role="status" aria-live="polite"><div className="loader-orbit"><span>G</span></div><p>INICIALIZANDO CUENTA<span className="loader-dots">...</span></p><small>CONEXIÓN GLITCH SEGURA</small></div>}</main>;
}

export default function Home() {
  const { status, data: session } = useSession();
  const [gustambitos, setGustambitos] = useState(initialGustambitos);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [hydrated, setHydrated] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myFriendCode, setMyFriendCode] = useState("");
  const [friendInput, setFriendInput] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [friendError, setFriendError] = useState("");
  const [refreshingFriend, setRefreshingFriend] = useState("");
  const [friendFilter, setFriendFilter] = useState<"Todos" | "Conseguidos" | "Faltantes">("Todos");
  const [exporting, setExporting] = useState(false);
  const accountStorageKey = `gustambitos-glitch-v4-${session?.user?.email ?? "guest"}`;
  useEffect(() => { if (status !== "authenticated" || !session?.user?.email) return; const sync = async () => { const response = await fetch("/api/progress"); if (response.ok) { const { progress } = await response.json(); if (progress.length) setGustambitos((current) => current.map((item) => ({ ...item, variants: item.variants.map((variant) => { const saved = progress.find((entry: { gustambito_id: number; variant_label: string; level: number }) => entry.gustambito_id === item.id && entry.variant_label === variant.label); return saved ? { ...variant, level: saved.level } : variant; }) }))); } else { const saved = window.localStorage.getItem(accountStorageKey); if (saved) setGustambitos(migrate(JSON.parse(saved))); } window.requestAnimationFrame(() => setHydrated(true)); }; sync(); }, [status, session?.user?.email, accountStorageKey]);
  useEffect(() => { if (!hydrated || !gustambitos.some((item) => item.variants.some((variant) => variant.level > 0))) return; const timer = window.setTimeout(() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 180); return () => window.clearTimeout(timer); }, [hydrated, accountStorageKey]);
  useEffect(() => { if (status === "authenticated") void fetch("/api/progress").then(() => fetch("/api/friends")).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "No se pudo cargar tu ID"); setMyFriendCode(data.profile.friend_code); setFriends(data.friends); }).catch((error: Error) => setFriendError(error.message)); }, [status]);
  useEffect(() => { if (!supabaseBrowser || !friends.length) return; const friendEmails = new Set(friends.map((friend) => friend.email)); const channel = supabaseBrowser.channel("friend-progress").on("postgres_changes", { event: "*", schema: "public", table: "gustambito_progress" }, (payload) => { const changed = (payload.new ?? payload.old) as { email: string; gustambito_id: number; variant_label: string; level: number }; if (!friendEmails.has(changed.email) || !changed.gustambito_id) return; const update = (progress: Friend["progress"]) => payload.eventType === "DELETE" ? progress.filter((item) => !(item.gustambito_id === changed.gustambito_id && item.variant_label === changed.variant_label)) : [...progress.filter((item) => !(item.gustambito_id === changed.gustambito_id && item.variant_label === changed.variant_label)), { gustambito_id: changed.gustambito_id, variant_label: changed.variant_label, level: changed.level }]; setFriends((current) => current.map((entry) => entry.email === changed.email ? { ...entry, progress: update(entry.progress) } : entry)); setSelectedFriend((current) => current?.email === changed.email ? { ...current, progress: update(current.progress) } : current); }).subscribe((subscriptionStatus) => console.info(`[realtime] ${subscriptionStatus}`)); return () => { void supabaseBrowser.removeChannel(channel); }; }, [friends.map((friend) => friend.email).join(",")]);
  const visible = hydrated ? gustambitos : initialGustambitos;
  const setLevel = (id: number, variantIndex: number, level: number) => { const item = gustambitos.find((entry) => entry.id === id); const variant = item?.variants[variantIndex]; if (!variant || variant.available === false) return; const next = gustambitos.map((entry) => entry.id !== id ? entry : { ...entry, variants: entry.variants.map((current, index) => index === variantIndex ? { ...current, level } : current) }); setGustambitos(next); window.localStorage.setItem(accountStorageKey, JSON.stringify(next)); void fetch("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gustambitoId: id, variantLabel: variant.label, level }) }); };
  const cards = useMemo<VariantCard[]>(() => visible.flatMap((item) => item.variants.map((variant, variantIndex) => ({ item, variant, variantIndex }))), [visible]);
  const trackableCards = cards.filter(({ variant }) => variant.available !== false);
  const filtered = useMemo(() => cards.filter(({ item, variant }) => (filter === "Todos" || (filter === "No conseguidos" ? variant.level === 0 : filter === "Conseguidos" ? variant.level > 0 : true)) && `${item.name} ${variant.label}`.toLowerCase().includes(query.toLowerCase())), [cards, filter, query]);
  const collected = trackableCards.filter(({ variant }) => variant.level > 0).length;
  const mastered = trackableCards.filter(({ variant }) => variant.level === 5).length;
  const progress = Math.round((collected / trackableCards.length) * 100);
  const addFriend = async () => { setFriendError(""); const response = await fetch("/api/friends", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ friendCode: friendInput }) }); const data = await response.json(); if (!response.ok) return setFriendError(data.error); setFriendInput(""); const refreshed = await fetch("/api/friends").then((result) => result.json()); setMyFriendCode(refreshed.profile.friend_code); setFriends(refreshed.friends); };
  const refreshFriend = async (friend: Friend) => { setRefreshingFriend(friend.email); const response = await fetch("/api/friends"); if (response.ok) { const data = await response.json(); setMyFriendCode(data.profile.friend_code); setFriends(data.friends); setSelectedFriend(data.friends.find((entry: Friend) => entry.email === friend.email) ?? friend); } setRefreshingFriend(""); };
  const friendVariants = selectedFriend ? initialGustambitos.flatMap((item) => item.variants.map((variant) => ({ item, variant, level: selectedFriend.progress.find((entry) => entry.gustambito_id === item.id && entry.variant_label === variant.label)?.level ?? 0 }))).filter(({ level }) => friendFilter === "Todos" || (friendFilter === "Conseguidos" ? level > 0 : level === 0)) : [];
  const exportCollection = async () => { setExporting(true); try { await downloadCollectionImage(visible, myFriendCode); } finally { setExporting(false); } };
  useEffect(() => { const toolbar = document.querySelector(".toolbar"); if (!toolbar) return; const button = document.createElement("button"); button.className = "export-button"; button.textContent = exporting ? "GENERANDO..." : "DESCARGAR IMAGEN"; button.disabled = exporting; button.onclick = () => void exportCollection(); toolbar.append(button); return () => button.remove(); }, [visible, myFriendCode, exporting]);
  useEffect(() => { document.querySelectorAll<HTMLElement>(".gustambito-card").forEach((card) => { const level = card.querySelector(".level-badge")?.textContent; card.classList.toggle("missing-card", level === "NIVEL 0/5"); }); }, [visible, filter, query]);
  useEffect(() => {
    const actions = document.querySelector(".top-actions");
    if (!actions || document.querySelector(".codes-button")) return;
    const button = document.createElement("button");
    button.className = "codes-button";
    button.textContent = "CÓDIGOS";
    const overlay = document.createElement("div");
    overlay.className = "codes-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Códigos de Fortnite");
    const usedCodes = new Set<number>();
    overlay.innerHTML = `<div class="codes-panel"><button class="codes-close" aria-label="Cerrar">×</button><p class="eyebrow">PANEL DE ADMINISTRACIÓN DE FORTNITE</p><h2>CÓDIGOS</h2><p class="codes-terminal">.../rootUser $ ingresa_hack_de_sala</p><p class="codes-intro">Introduce estos códigos en el panel de administración dentro de Fortnite y marca los que ya usaste.</p><div class="codes-list"><div class="codes-empty"><span>...</span><h3>CARGANDO CÓDIGOS</h3></div></div><small class="codes-source">Consulta actualizada · Temporada GLITCH</small></div>`;
    const toast = document.createElement("div");
    toast.className = "codes-toast";
    toast.setAttribute("role", "status");
    toast.textContent = "CÓDIGO COPIADO";
    document.body.append(toast);
    const list = overlay.querySelector<HTMLElement>(".codes-list");
    const renderCodes = (codes: { id: number; code: string; reward: string }[]) => {
      if (!list) return;
      const orderedCodes = [...codes].sort((a, b) => Number(usedCodes.has(a.id)) - Number(usedCodes.has(b.id)));
      list.innerHTML = orderedCodes.length ? orderedCodes.map(({ id, code, reward }) => `<article class="code-card" data-code-id="${id}"><div class="code-value">${code}</div><strong>${reward}</strong></article>`).join("") : `<div class="codes-empty"><span>∅</span><h3>NO HAY CÓDIGOS ACTIVOS</h3></div>`;
      list.querySelectorAll<HTMLElement>(".code-card").forEach((card) => {
        const code = card.querySelector(".code-value")?.textContent?.trim() || "";
        const codeId = Number(card.dataset.codeId);
        const copy = document.createElement("button"); copy.className = "code-copy"; copy.type = "button"; copy.textContent = "COPIAR";
        copy.onclick = async () => { await navigator.clipboard?.writeText(code); toast.textContent = "CÓDIGO COPIADO"; toast.classList.add("show"); window.setTimeout(() => toast.classList.remove("show"), 1500); };
        card.querySelector(".code-value")?.after(copy);
        const mark = document.createElement("button"); mark.className = "code-used"; mark.type = "button";
        const update = () => { const used = usedCodes.has(codeId); card.classList.toggle("used", used); mark.textContent = used ? "✓ USADO" : "MARCAR COMO USADO"; };
        mark.onclick = async () => { const nextUsed = !usedCodes.has(codeId); nextUsed ? usedCodes.add(codeId) : usedCodes.delete(codeId); update(); const response = await fetch("/api/codes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codeId, used: nextUsed }) }); if (!response.ok) { nextUsed ? usedCodes.delete(codeId) : usedCodes.add(codeId); update(); toast.textContent = "NO SE PUDO GUARDAR"; } else { nextUsed ? list?.append(card) : list?.prepend(card); toast.textContent = nextUsed ? "CÓDIGO MARCADO" : "MARCA QUITADA"; } toast.classList.add("show"); window.setTimeout(() => toast.classList.remove("show"), 1500); };
        card.append(mark); update();
      });
    };
    void fetch("/api/codes").then(async (response) => { if (!response.ok) throw new Error(); const data = await response.json(); (data.usedCodeIds ?? []).forEach((id: number) => usedCodes.add(id)); renderCodes(data.codes ?? []); }).catch(() => { if (list) list.innerHTML = `<div class="codes-empty"><span>!</span><h3>NO SE PUDO CARGAR</h3><p>Revisa tu conexión e inténtalo de nuevo.</p></div>`; });
    actions.append(button);
    document.body.append(overlay);
    const close = overlay.querySelector(".codes-close");
    const hide = () => overlay.classList.remove("open");
    button.onclick = () => overlay.classList.add("open");
    close?.addEventListener("click", hide);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) hide(); });
    return () => { button.remove(); overlay.remove(); toast.remove(); };
  }, [status]);

  useEffect(() => {
    const actions = document.querySelector(".top-actions");
    if (!actions || document.querySelector(".map-button")) return;
    const button = document.createElement("button");
    button.className = "map-button";
    button.textContent = "MAPA";
    const overlay = document.createElement("div");
    overlay.className = "map-screen";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Mapa de Fortnite Override");
    const markers = [
      { id: "drift-legs", x: 28.0304, y: 48.8749, name: "DERIVA · PIERNAS", kind: "wrixel", detail: "Sobre el loop en el centro de la zona" }, { id: "drift-accessory", x: 26.8126, y: 47.9234, name: "DERIVA · ACCESORIO", kind: "wrixel", detail: "En la parte central de la zona, al lado del río" }, { id: "drift-hat", x: 28.5633, y: 46.5152, name: "DERIVA · GORRA", kind: "wrixel", detail: "Al oeste del punto de extracción, cerca de la parte donde aparece el NPC Sonic" }, { id: "drift-torso", x: 31.0371, y: 48.7988, name: "DERIVA · TORSO", kind: "wrixel", detail: "Sobre esta montaña en la parte noreste de Colina Verde" },
      { id: "luxe-accessory", x: 65.6327, y: 82.519, name: "LUJO · ACCESORIO", kind: "wrixel", detail: "Dentro del bote con forma de pato" }, { id: "luxe-torso", x: 68.373, y: 83.4705, name: "LUJO · TORSO", kind: "wrixel", detail: "Dentro del sauna en medio de la zona. Es el edificio con el logo del patito con gafas oscuras en la puerta" }, { id: "luxe-legs", x: 68.6394, y: 84.46, name: "LUJO · PIERNAS", kind: "wrixel", detail: "En un balcón de la parte sur de la zona urbanizada de Puerto Pacífico" }, { id: "luxe-hat", x: 69.8953, y: 82.9757, name: "LUJO · GORRA", kind: "wrixel", detail: "En la parte este de Puerto Pacífico, cerca de los contenedores de basura" },
      { id: "skull-ranger-accessory", x: 50.1978, y: 71.862, name: "GUARDA CALAVERA · ACCESORIO", kind: "wrixel", detail: "En la parte noreste del laberinto" }, { id: "skull-ranger-hat", x: 49.2175, y: 72.4963, name: "GUARDA CALAVERA · GORRA", kind: "wrixel", detail: "En la zona centro-norte del laberinto" }, { id: "skull-ranger-torso", x: 48.2398, y: 72.0147, name: "GUARDA CALAVERA · TORSO", kind: "wrixel", detail: "Al oeste de la parte anterior de Wrixel" }, { id: "skull-ranger-legs", x: 48.1637, y: 74.0319, name: "GUARDA CALAVERA · PIERNAS", kind: "wrixel", detail: "En la parte suroeste del laberinto" },
      { id: "ruby-torso", x: 36.8194, y: 39.973, name: "RUBÍ · TORSO", kind: "wrixel", detail: "En la parte suroeste de la zona" }, { id: "ruby-legs", x: 39.1837, y: 38.8197, name: "RUBÍ · PIERNAS", kind: "wrixel", detail: "Entre los árboles del parque cerca al teatro Golden Reel" }, { id: "ruby-hat", x: 39.1837, y: 34.6101, name: "RUBÍ · GORRA", kind: "wrixel", detail: "Dentro de este edificio en la parte norte de la zona" }, { id: "ruby-accessory", x: 39.9333, y: 36.4554, name: "RUBÍ · ACCESORIO", kind: "wrixel", detail: "Bajando por las escaleras al lado del canal en la parte noreste de la zona" },
    ];
    const guideImages = ["https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820104024.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820104014.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820104307.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820104345.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074159.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074208.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074241.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074256.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820082834.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820082846.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820083332.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820083357.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820075529.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820075608.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820075529.jpg?resize=1024%2C576&ssl=1", "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820075608.jpg?resize=1024%2C576&ssl=1"];
    const markerNumbers: Record<string, number> = { "drift-torso": 1, "drift-accessory": 2, "drift-hat": 3, "drift-legs": 4, "luxe-torso": 1, "luxe-hat": 2, "luxe-legs": 3, "luxe-accessory": 4, "ruby-hat": 1, "ruby-legs": 2, "ruby-accessory": 3, "ruby-torso": 4, "skull-ranger-hat": 1, "skull-ranger-torso": 2, "skull-ranger-legs": 3, "skull-ranger-accessory": 4 };
    const wrixelStylesHtml = wrixelStyles.map(([name, requirement], index) => `<article class="wrixel-style-card"><span class="wrixel-style-index">${String(index + 1).padStart(2, "0")}</span><h3>${name}</h3><p>${requirement}</p></article>`).join("");
    const guideImagesById: Record<string, string> = {
      "drift-legs": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820105001.jpg?resize=1024%2C576&ssl=1",
      "drift-accessory": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820104307.jpg?resize=1024%2C576&ssl=1",
      "drift-hat": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820104345.jpg?resize=1024%2C576&ssl=1",
      "drift-torso": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820104014.jpg?resize=1024%2C576&ssl=1",
      "luxe-accessory": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074447.jpg?resize=1024%2C576&ssl=1",
      "luxe-torso": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074159.jpg?resize=1024%2C576&ssl=1",
      "luxe-legs": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074256.jpg?resize=1024%2C576&ssl=1",
      "luxe-hat": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074241.jpg?resize=1024%2C576&ssl=1",
      "ruby-torso": "/Fortnite_20260820083430-scaled.webp",
      "ruby-legs": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820083332.jpg?resize=1024%2C576&ssl=1",
      "ruby-hat": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820082834.jpg?resize=1024%2C576&ssl=1",
      "ruby-accessory": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820083357.jpg?resize=1024%2C576&ssl=1",
      "skull-ranger-accessory": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820075709.jpg?resize=1024%2C576&ssl=1",
      "skull-ranger-hat": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820075529.jpg?resize=1024%2C576&ssl=1",
      "skull-ranger-torso": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820075608.jpg?resize=1024%2C576&ssl=1",
      "skull-ranger-legs": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820075623.jpg?resize=1024%2C576&ssl=1",
    };
    const markerHtml = markers.map((marker, index) => {
      const markerNumber = marker.kind === "wrixel" ? (markerNumbers[marker.id] || (index % 4) + 1) : "";
      const secondImages: Record<string, string> = { "drift-torso": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820104024.jpg?resize=1024%2C576&ssl=1", "luxe-torso": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074208.jpg?resize=1024%2C576&ssl=1", "luxe-accessory": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820074433.jpg?resize=1024%2C576&ssl=1", "ruby-hat": "https://i0.wp.com/www.gamerfocus.co/wp-content/uploads/2026/08/Fortnite_20260820082846.jpg?resize=1024%2C576&ssl=1" };
      const secondImage = secondImages[marker.id] || "";
      const guideImage = guideImagesById[marker.id] || guideImages[index] || "";
      return `<button class="map-marker ${marker.kind}" data-map-kind="${marker.kind}" data-marker-id="${marker.id}" data-guide-image="${guideImage}" data-guide-image-two="${secondImage}" data-guide-detail="${marker.detail}" data-part-id="${marker.kind === "wrixel" ? marker.id : ""}" title="${marker.name} · ${marker.detail}" aria-label="${marker.name}" style="left:${marker.x}%;top:${marker.y}%"><span class="map-marker-dot">${markerNumber}</span></button>`;
    }).join("");
    overlay.innerHTML = `<div class="map-panel"><button class="map-close" aria-label="Regresar a la pantalla principal">← REGRESAR A INICIO</button><div class="map-heading"><div><p class="eyebrow">GLITCH · ISLA OVERRIDE</p><h2>MAPA</h2><p>Pellizca con dos dedos para acercar o alejar. Toca un punto para ver la caja.</p></div></div><div class="map-viewport"><div class="map-canvas"><img src="https://fortnite-api.com/images/map.png" alt="Mapa de la isla Fortnite Override" /><div class="map-markers">${markerHtml}</div></div></div><aside class="map-detail" hidden><button class="map-detail-close" aria-label="Cerrar imagen">×</button><h3 data-map-detail-title></h3><p class="eyebrow" data-map-detail-zone>PARTE</p><div class="map-detail-images"><img data-map-detail-image alt="Captura de ubicación de Wrixel" /><img data-map-detail-image-two alt="Segunda captura de ubicación de Wrixel" hidden /></div><p class="codes-intro" data-map-detail-copy></p><button class="map-detail-action" data-map-mark-collected>MARCAR COMO CONSEGUIDO</button></aside><div class="map-legend"><span class="map-key"><i class="map-key-dot pending"></i> AMARILLO · WRIXEL PENDIENTE</span><span class="map-key"><i class="map-key-dot collected"></i> VERDE · WRIXEL CONSEGUIDO</span><small data-map-status>Toca un punto para ver la ubicación de la caja</small></div><button class="wrixel-info-button" type="button">ⓘ INFO · OTROS ESTILOS WRIXEL</button><div class="wrixel-info-overlay" role="dialog" aria-label="Otros estilos desbloqueables de Wrixel" hidden><section class="wrixel-info-panel"><button class="wrixel-info-close" type="button" aria-label="Cerrar información">×</button><div class="section-heading"><div><p class="eyebrow">WRIXEL · DESBLOQUEABLES</p><h2>Otros estilos</h2></div><span class="count-badge">11 ESTILOS</span></div><p class="wrixel-styles-intro">Completa misiones, habla con NPC o activa códigos de hackeo para desbloquear más estilos de Wrixel.</p><div class="wrixel-styles-grid">${wrixelStylesHtml}</div><small class="wrixel-styles-note">Las ubicaciones de códigos y NPC aparecen en el mapa cuando rastreas la misión correspondiente.</small></section></div></div>`;
    const info = overlay.querySelector<HTMLElement>(".wrixel-info-overlay");
    const infoButton = overlay.querySelector<HTMLButtonElement>(".wrixel-info-button");
    const infoClose = overlay.querySelector<HTMLButtonElement>(".wrixel-info-close");
    infoButton?.addEventListener("click", () => { if (info) info.hidden = false; });
    infoClose?.addEventListener("click", () => { if (info) info.hidden = true; });
    info?.addEventListener("click", (event) => { if (event.target === info) info.hidden = true; });
    document.body.append(overlay);
    const canvas = overlay.querySelector<HTMLElement>(".map-canvas");
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let pinchDistance = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;
    let dragging = false;
    const viewport = overlay.querySelector<HTMLElement>(".map-viewport");
    const clampPan = () => {
      if (!canvas || !viewport) return;
      const viewportRect = viewport.getBoundingClientRect();
      const maxX = Math.max(0, (canvas.clientWidth * zoom - viewportRect.width) / 2);
      const maxY = Math.max(0, (canvas.clientHeight * zoom - viewportRect.height) / 2);
      panX = Math.max(-maxX, Math.min(maxX, panX));
      panY = Math.max(-maxY, Math.min(maxY, panY));
    };
    const renderMap = () => { if (!canvas) return; clampPan(); canvas.style.width = "100%"; canvas.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`; canvas.style.setProperty("--map-marker-scale", String(1 / zoom)); };
    const setZoom = (next: number) => { zoom = Math.max(0.75, Math.min(8, next)); renderMap(); };
    const getPinchDistance = (touches: TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) { pinchDistance = getPinchDistance(event.touches); lastTouchX = (event.touches[0].clientX + event.touches[1].clientX) / 2; lastTouchY = (event.touches[0].clientY + event.touches[1].clientY) / 2; event.preventDefault(); }
      else if (event.touches.length === 1 && zoom > 1 && !(event.target as HTMLElement).closest(".map-marker")) { dragging = true; lastTouchX = event.touches[0].clientX; lastTouchY = event.touches[0].clientY; }
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && pinchDistance) {
        const nextDistance = getPinchDistance(event.touches);
        const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
        const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
        panX += centerX - lastTouchX; panY += centerY - lastTouchY;
        setZoom(zoom * (nextDistance / pinchDistance));
        pinchDistance = nextDistance; lastTouchX = centerX; lastTouchY = centerY; event.preventDefault();
      } else if (event.touches.length === 1 && dragging) {
        panX += event.touches[0].clientX - lastTouchX; panY += event.touches[0].clientY - lastTouchY;
        lastTouchX = event.touches[0].clientX; lastTouchY = event.touches[0].clientY; renderMap(); event.preventDefault();
      }
    };
    const onTouchEnd = () => { pinchDistance = 0; dragging = false; };
    const onWheel = (event: WheelEvent) => { event.preventDefault(); setZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25)); };
    const onPointerDown = (event: PointerEvent) => { if (event.pointerType === "mouse" && zoom > 1 && !(event.target as HTMLElement).closest(".map-marker")) { dragging = true; lastTouchX = event.clientX; lastTouchY = event.clientY; viewport?.setPointerCapture(event.pointerId); event.preventDefault(); } };
    const onPointerMove = (event: PointerEvent) => { if (!dragging || event.pointerType !== "mouse") return; panX += event.clientX - lastTouchX; panY += event.clientY - lastTouchY; lastTouchX = event.clientX; lastTouchY = event.clientY; renderMap(); };
    const onPointerUp = (event?: PointerEvent) => { dragging = false; if (event && viewport?.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId); };
    viewport?.addEventListener("wheel", onWheel, { passive: false });
    viewport?.addEventListener("pointerdown", onPointerDown);
    viewport?.addEventListener("pointermove", onPointerMove);
    viewport?.addEventListener("pointerup", onPointerUp);
    viewport?.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    viewport?.addEventListener("touchstart", onTouchStart, { passive: false });
    viewport?.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport?.addEventListener("touchend", onTouchEnd);
    viewport?.addEventListener("touchstart", onTouchStart, { passive: false });
    viewport?.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport?.addEventListener("touchend", onTouchEnd);
    const mapStatus = overlay.querySelector<HTMLElement>("[data-map-status]");
    const mapDetail = overlay.querySelector<HTMLElement>(".map-detail");
    const mapDetailImage = overlay.querySelector<HTMLImageElement>("[data-map-detail-image]");
    const mapDetailImageTwo = overlay.querySelector<HTMLImageElement>("[data-map-detail-image-two]");
    const mapDetailTitle = overlay.querySelector<HTMLElement>("[data-map-detail-title]");
    const mapDetailZone = overlay.querySelector<HTMLElement>("[data-map-detail-zone]");
    const mapDetailCopy = overlay.querySelector<HTMLElement>("[data-map-detail-copy]");
    const mapDetailAction = overlay.querySelector<HTMLButtonElement>("[data-map-mark-collected]");
    let activeMarker: HTMLElement | null = null;
    const openGuide = (marker: HTMLElement) => { if (!mapDetail || !mapDetailImage) return; activeMarker = marker; mapDetail.hidden = false; mapDetail.classList.remove("detail-glitch"); void mapDetail.offsetWidth; mapDetail.classList.add("detail-glitch"); mapDetailImage.classList.add("image-skeleton"); mapDetailImage.src = marker.dataset.guideImage || ""; if (mapDetailImageTwo) { mapDetailImageTwo.classList.toggle("image-skeleton", Boolean(marker.dataset.guideImageTwo)); mapDetailImageTwo.hidden = !marker.dataset.guideImageTwo; mapDetailImageTwo.src = marker.dataset.guideImageTwo || ""; } const titleParts = marker.title.split(" · "); mapDetailTitle!.textContent = titleParts[0] || "WRIXEL"; mapDetailZone!.textContent = titleParts[1] || "PARTE"; mapDetailCopy!.textContent = marker.dataset.guideDetail || ""; if (mapDetailAction) mapDetailAction.textContent = marker.classList.contains("collected") ? "MARCADO COMO CONSEGUIDO" : "MARCAR COMO CONSEGUIDO"; };
    mapDetailImage?.addEventListener("load", () => mapDetailImage.classList.remove("image-skeleton"));
    mapDetailImageTwo?.addEventListener("load", () => mapDetailImageTwo.classList.remove("image-skeleton"));
    overlay.querySelector<HTMLButtonElement>(".map-detail-close")?.addEventListener("click", () => { if (mapDetail) mapDetail.hidden = true; });
    const setCollected = (marker: HTMLElement, collected: boolean) => marker.classList.toggle("collected", collected);
    void fetch("/api/wrixel-parts").then(async (response) => { if (!response.ok) throw new Error(); const data = await response.json(); const collected = new Set<string>(data.parts ?? []); overlay.querySelectorAll<HTMLElement>(".map-marker.wrixel").forEach((marker) => setCollected(marker, collected.has(marker.dataset.partId || ""))); }).catch(() => { if (mapStatus) mapStatus.textContent = "No se pudo cargar tu progreso del mapa"; });
    const saveCollected = async () => { if (!activeMarker) return; const marker = activeMarker; const partKey = marker.dataset.partId || ""; const next = !marker.classList.contains("collected"); setCollected(marker, next); if (mapDetailAction) mapDetailAction.textContent = next ? "MARCADO COMO CONSEGUIDO" : "MARCAR COMO CONSEGUIDO"; const response = await fetch("/api/wrixel-parts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partKey, collected: next }) }); if (!response.ok) { setCollected(marker, !next); if (mapDetailAction) mapDetailAction.textContent = next ? "MARCAR COMO CONSEGUIDO" : "MARCADO COMO CONSEGUIDO"; if (mapStatus) mapStatus.textContent = "No se pudo guardar la pieza"; } else if (mapStatus) mapStatus.textContent = next ? "Pieza guardada en tu cuenta" : "Pieza marcada como pendiente"; };
    mapDetailAction?.addEventListener("click", () => void saveCollected());
    overlay.querySelectorAll<HTMLElement>(".map-marker.wrixel").forEach((marker) => marker.addEventListener("click", () => openGuide(marker)));
    const close = overlay.querySelector(".map-close");
    const hide = () => overlay.classList.remove("open");
    button.onclick = () => overlay.classList.add("open");
    close?.addEventListener("click", hide);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) hide(); });
    actions.append(button);
    return () => { viewport?.removeEventListener("wheel", onWheel); viewport?.removeEventListener("pointerdown", onPointerDown); viewport?.removeEventListener("pointermove", onPointerMove); viewport?.removeEventListener("pointerup", onPointerUp); viewport?.removeEventListener("pointercancel", onPointerUp); window.removeEventListener("pointerup", onPointerUp); window.removeEventListener("pointercancel", onPointerUp); viewport?.removeEventListener("touchstart", onTouchStart); viewport?.removeEventListener("touchmove", onTouchMove); viewport?.removeEventListener("touchend", onTouchEnd); button.remove(); overlay.remove(); };
  }, [status]);

  if (status !== "authenticated") return <LoginScreen />;

  return <main className="shell">
    {exporting && <div className="export-loader" role="status" aria-live="polite"><div className="export-loader-box"><div className="export-loader-mark">G</div><p className="eyebrow">GLITCH · EXPORT SYSTEM</p><h2>GENERANDO<br /><em>COLECCIÓN</em></h2><div className="export-progress"><span /></div><p className="export-loader-status">CAPTURANDO SPRITES<span className="loader-dots">...</span></p><small>NO CIERRES ESTA VENTANA</small></div></div>}
    <nav className="topbar"><div className="brand"><span className="brand-mark">G</span><span>GUSTAMBITOSMX</span></div><div className="season-pill"><span className="live-dot" /> GLITCH · TEMPORADA 04 <span className="season-arrow">⌄</span></div><div className="top-actions"><button className="friends-button" onClick={() => setShowFriends(true)}>AMIGOS <span>{friends.length}</span></button><button className="profile" onClick={() => setShowProfile(true)} aria-label="Abrir perfil de usuario">{session?.user?.image ? <img src={session.user.image} alt={session.user.name ? `Foto de ${session.user.name}` : "Foto de perfil"} /> : "L"}<span /></button></div></nav>
    {showProfile && <div className="profile-overlay" role="dialog" aria-modal="true" aria-label="Perfil de usuario" onClick={() => setShowProfile(false)}><aside className="profile-drawer" onClick={(event) => event.stopPropagation()}><button className="close-friends" onClick={() => setShowProfile(false)} aria-label="Cerrar">×</button><p className="eyebrow">CUENTA · GLITCH</p><div className="drawer-avatar">{session?.user?.image ? <img src={session.user.image} alt="" /> : "L"}</div><h2>{session?.user?.name || "Jugador"}</h2><p className="drawer-email">{session?.user?.email}</p><div className="drawer-id-label">TU ID DE GUSTAMBITOSMX</div><div className="friend-code drawer-code">{myFriendCode || "--------"}<button onClick={() => navigator.clipboard?.writeText(myFriendCode)}>COPIAR</button></div>{friendError && <p className="friend-error">{friendError}</p>}<p className="friend-help">Comparte este ID para que tus amigos vean tu colección.</p><button className="signout-button" onClick={() => signOut({ callbackUrl: "/" })}>CERRAR SESIÓN</button></aside></div>}
     {showFriends && <div className="friends-overlay" role="dialog" aria-modal="true" aria-label="Amigos"><div className="friends-panel"><button className="close-friends" onClick={() => setShowFriends(false)} aria-label="Cerrar">×</button><p className="eyebrow">CONEXIONES · GLITCH</p><h2>Tu ID de amigo</h2><div className="friend-code">{myFriendCode || "--------"}<button onClick={() => navigator.clipboard?.writeText(myFriendCode)}>COPIAR</button></div><p className="friend-help">Comparte este código por WhatsApp, Facebook o donde quieras.</p><div className="add-friend"><input value={friendInput} onChange={(event) => setFriendInput(event.target.value.toUpperCase())} maxLength={8} placeholder="ID DE TU AMIGO" /><button onClick={addFriend}>AGREGAR</button></div>{friendError && <p className="friend-error">{friendError}</p>}<div className="friends-heading"><h3>Tus amigos</h3><span>{friends.length}</span></div>{friends.length === 0 ? <p className="friend-help">Todavía no tienes amigos agregados.</p> : <div className="friend-list">{friends.map((friend) => <><button key={friend.email} className={`friend-row ${selectedFriend?.email === friend.email ? "selected" : ""}`} onClick={() => { setSelectedFriend((current) => current?.email === friend.email ? null : friend); setFriendFilter("Todos"); }}><span className="friend-avatar">{(friend.name || friend.email)[0].toUpperCase()}</span><span><strong>{friend.name || "Jugador"}</strong><small>ID: {friend.friend_code}</small></span><span className="friend-actions"><b>{selectedFriend?.email === friend.email ? "OCULTAR" : "VER"}</b><span className={`friend-reload ${refreshingFriend === friend.email ? "spinning" : ""}`} onClick={(event) => { event.stopPropagation(); void refreshFriend(friend); }} role="button" tabIndex={0} aria-label={`Actualizar colección de ${friend.name || "tu amigo"}`} title="Actualizar colección">↻</span></span></button>{selectedFriend?.email === friend.email && <div className="friend-collection"><div className="friend-collection-heading"><div className="friend-filters">{(["Todos", "Conseguidos", "Faltantes"] as const).map((option) => <button key={option} className={friendFilter === option ? "active" : ""} onClick={() => setFriendFilter(option)}>{option}</button>)}</div></div><div className="friend-variants">{friendVariants.length === 0 ? <p className="friend-help">No hay Gustambitos en este filtro.</p> : friendVariants.map(({ item, variant, level }) => <div className={`friend-variant ${level === 0 ? "missing" : ""} ${level === 5 ? "mastered" : ""}`} key={`${item.id}-${variant.label}`}><img src={variant.image} alt={`${item.name} ${variant.label}`} /><span>{item.name} · {variant.label}</span><b>{level === 5 ? <img className="friend-crown" src="/mastered-crown.png" alt="Dominado" /> : `N${level}`}</b></div>)}</div></div>}</>)}</div>}{selectedFriend && !friends.some((friend) => friend.email === selectedFriend.email) && <div className="friend-collection"><div className="friend-collection-heading"><div className="friend-filters">{(["Todos", "Conseguidos", "Faltantes"] as const).map((option) => <button key={option} className={friendFilter === option ? "active" : ""} onClick={() => setFriendFilter(option)}>{option}</button>)}</div></div><div className="friend-variants">{friendVariants.map(({ item, variant, level }) => <div className={`friend-variant ${level === 0 ? "missing" : ""} ${level === 5 ? "mastered" : ""}`} key={`${item.id}-${variant.label}`}><img src={variant.image} alt={`${item.name} ${variant.label}`} /><span>{item.name} · {variant.label}</span><b>{level === 5 ? <img className="friend-crown" src="/mastered-crown.png" alt="Dominado" /> : `N${level}`}</b></div>)}</div></div>}</div></div>}
    <section className="hero"><div className="hero-copy"><p className="eyebrow">NUEVA TEMPORADA · CAPÍTULO 7</p><h1>Colecciónalos<br /><em>todos.</em></h1><p className="hero-text">Tu álbum personal de Gustambitos. Sube cada variante hasta el nivel 5 y consigue la corona de dominado.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>Ver colección <span>↘</span></button><span className="updated">Actualizado hoy · 03 sep 2026</span></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="mascot"><img src="/mastered-crown.png" alt="Dominado" /></div><span className="orbit-tag tag-one">NIVEL 5 = DOMINADO</span><span className="orbit-tag tag-two">{trackableCards.length} ACTIVAS · {cards.length - trackableCards.length} PRÓXIMAMENTE</span></div></section>
    <section className="stats-row" aria-label="Resumen de colección"><div className="stat-card progress-card"><div className="stat-label">COLECCIÓN CONSEGUIDA</div><div className="progress-number">{progress}<small>%</small></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="stat-foot"><span>{collected} conseguidas</span><span>{trackableCards.length - collected} pendientes</span></div></div><div className="stat-card"><div className="stat-label">GUSTAMBITOSMX DOMINADOS</div><div className="last-found"><span className="mini-icon"><img src="/mastered-crown.png" alt="Dominado" /></span><div><strong>{mastered} con corona</strong><small>Nivel máximo alcanzado</small></div></div></div><div className="stat-card streak-card"><div className="stat-label">RACHA DE COLECCIÓN</div><div className="streak">03 <span>días</span> <b>✦</b></div><small>¡Sigue así, vas volando!</small></div></section>
    <section className="collection-section" id="collection"><div className="section-heading"><div><p className="eyebrow">TU ÁLBUM · GLITCH</p><h2>Variantes de Gustambitos</h2></div><span className="count-badge">{mastered}/{cards.filter(({ variant }) => variant.available !== false).length} DOMINADAS</span></div><div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar sprite o variante..." aria-label="Buscar sprite o variante" /></div><div className="filters">{["Todos", "Conseguidos", "No conseguidos"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="grid">{filtered.map(({ item, variant, variantIndex }) => <article className={`gustambito-card ${variant.level === 5 ? "mastered-card" : ""} ${variant.available === false ? "unreleased-card" : ""}`} key={`${item.id}-${variant.label}`}><div className="card-visual" style={{ "--accent": item.color } as CSSProperties}><button className="card-no master-button" onClick={() => setLevel(item.id, variantIndex, 5)} disabled={variant.available === false} aria-label="Marcar como dominado"><img src="/mastered-crown.png" alt="" /></button><img className="sprite-image" src={variant.image} alt={`${item.name} ${variant.label}`} />{variant.level === 5 && <span className="crown"><img src="/mastered-crown.png" alt="Dominado" /></span>}</div><div className="card-info"><div><h3>{item.name}</h3><p>{variant.label} · {item.subtitle}</p></div><span className="level-badge">{variant.available === false ? "PRÓXIMAMENTE" : `NIVEL ${variant.level}/5`}</span></div>{variant.available !== false && <div className="level-control"><span>NIVEL DE COLECCIÓN</span><div className="stepper"><button onClick={() => setLevel(item.id, variantIndex, Math.max(0, variant.level - 1))} disabled={variant.level === 0} aria-label="Bajar nivel">−</button><strong>{variant.level}</strong><button onClick={() => setLevel(item.id, variantIndex, Math.min(5, variant.level + 1))} disabled={variant.level === 5} aria-label="Subir nivel">+</button></div></div>}<div className="card-season">{variant.available === false ? "VARIANTE ANUNCIADA · AÚN NO LANZADA" : item.season}</div></article>)}</div>{filtered.length === 0 && <div className="empty">No encontramos ese Gustambito. Prueba con otro nombre.</div>}</section>
    <footer><span>GUSTAMBITOSMX <i>✦</i></span><span>Nivel 5 = DOMINADO · GLITCH v1.3</span></footer>
  </main>;
}
