"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Variant = { label: string; image: string; level: number };
type Gustambito = { id: number; name: string; subtitle: string; rarity: "Mítico" | "Épico" | "Raro"; color: string; image: string; season: string; variants: Variant[] };
type VariantCard = { item: Gustambito; variant: Variant; variantIndex: number };
type Friend = { email: string; name: string | null; image: string | null; friend_code: string; progress: { gustambito_id: number; variant_label: string; level: number }[] };

const spriteUrl = (key: string, variant = "") => `https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_${key}${variant ? `_${variant}` : ""}_L.webp`;
const makeVariants = (key: string, levels: number[] = [0, 0, 0]): Variant[] => [
  { label: "Base", image: spriteUrl(key), level: levels[0] },
  { label: "Dorado", image: spriteUrl(key, "Gold"), level: levels[1] },
  { label: "Cheat Master", image: spriteUrl(key, "Cheatmaster"), level: levels[2] },
];
const initialGustambitos: Gustambito[] = [
  { id: 1, name: "Jackrabbit", subtitle: "Salta más lejos", rarity: "Raro", color: "#8ed35b", image: spriteUrl("JazzJackrabbit"), season: "GLITCH · Capítulo 7", variants: makeVariants("JazzJackrabbit") },
  { id: 2, name: "Shadow", subtitle: "Se mueve entre las sombras", rarity: "Épico", color: "#5b4e74", image: spriteUrl("NarrowFlea_Scribe"), season: "GLITCH · Capítulo 7", variants: makeVariants("NarrowFlea_Scribe") },
  { id: 3, name: "Bush", subtitle: "Se camufla en la isla", rarity: "Raro", color: "#79c85b", image: spriteUrl("BushRanger"), season: "GLITCH · Capítulo 7", variants: makeVariants("BushRanger") },
  { id: 4, name: "Tails", subtitle: "El compañero volador", rarity: "Épico", color: "#e98b42", image: spriteUrl("NarrowFlea_Monkey"), season: "GLITCH · Capítulo 7", variants: makeVariants("NarrowFlea_Monkey") },
  { id: 5, name: "Killswitch", subtitle: "Controla el sistema", rarity: "Épico", color: "#94a5a1", image: spriteUrl("Killswitch"), season: "GLITCH · Capítulo 7", variants: makeVariants("Killswitch") },
  { id: 6, name: "Adventure", subtitle: "Siempre busca el siguiente nivel", rarity: "Épico", color: "#c47f48", image: spriteUrl("Dwarf"), season: "GLITCH · Capítulo 7", variants: makeVariants("Dwarf") },
  { id: 7, name: "Klombo", subtitle: "El gigante amistoso", rarity: "Mítico", color: "#ef63c4", image: spriteUrl("Klombo"), season: "GLITCH · Capítulo 7", variants: makeVariants("Klombo") },
  { id: 8, name: "Jonesy", subtitle: "El héroe de siempre", rarity: "Épico", color: "#ef7b5b", image: spriteUrl("Jonesy"), season: "GLITCH · Capítulo 7", variants: makeVariants("Jonesy") },
  { id: 9, name: "Sonic", subtitle: "Corre a velocidad sónica", rarity: "Mítico", color: "#55b7ed", image: spriteUrl("NarrowFlea_Obsidian"), season: "GLITCH · Capítulo 7", variants: makeVariants("NarrowFlea_Obsidian") },
  { id: 10, name: "Crown", subtitle: "Realeza en el lobby", rarity: "Mítico", color: "#e6534e", image: spriteUrl("Crown"), season: "GLITCH · Capítulo 7", variants: makeVariants("Crown") },
  { id: 11, name: "8-Bit", subtitle: "Directo desde el arcade", rarity: "Épico", color: "#e86552", image: spriteUrl("EightBitBlaster"), season: "GLITCH · Capítulo 7", variants: makeVariants("EightBitBlaster") },
  { id: 12, name: "Storm Scout", subtitle: "Descubre el siguiente círculo", rarity: "Raro", color: "#a775dd", image: spriteUrl("StormScout"), season: "GLITCH · Capítulo 7", variants: makeVariants("StormScout") },
];

const currentFortniteCodes: { code: string; reward: string; expires?: string }[] = [];

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
  return <main className="login-screen"><div className="login-glow" /><div className="login-card"><div className="brand login-brand"><span className="brand-mark">G</span><span>GUSTAMBITOSMX</span></div><p className="eyebrow">GLITCH · TEMPORADA 04</p><div className="login-mascot"><img src="/mastered-crown.png" alt="Dominado" /></div><h1>Tu colección<br /><em>empieza aquí.</em></h1><p className="login-copy">Inicia sesión para guardar tus niveles, variantes y Gustambitos dominados.</p><button className="google-button" onClick={startLogin} disabled={loading}><span className="google-icon">G</span>{loading ? "Conectando..." : "Continuar con Google"}</button><small className="login-note">Tu progreso quedará asociado a tu cuenta.</small></div>{loading && <div className="login-loader" role="status" aria-live="polite"><div className="loader-orbit"><span>G</span></div><p>INICIALIZANDO CUENTA<span className="loader-dots">...</span></p><small>CONEXIÓN GLITCH SEGURA</small></div>}</main>;
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
  const setLevel = (id: number, variantIndex: number, level: number) => { const item = gustambitos.find((entry) => entry.id === id); const variant = item?.variants[variantIndex]; const next = gustambitos.map((entry) => entry.id !== id ? entry : { ...entry, variants: entry.variants.map((current, index) => index === variantIndex ? { ...current, level } : current) }); setGustambitos(next); window.localStorage.setItem(accountStorageKey, JSON.stringify(next)); if (variant) void fetch("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gustambitoId: id, variantLabel: variant.label, level }) }); };
  const cards = useMemo<VariantCard[]>(() => visible.flatMap((item) => item.variants.map((variant, variantIndex) => ({ item, variant, variantIndex }))), [visible]);
  const filtered = useMemo(() => cards.filter(({ item, variant }) => (filter === "Todos" || (filter === "No conseguidos" ? variant.level === 0 : filter === "Conseguidos" ? variant.level > 0 : true)) && `${item.name} ${variant.label}`.toLowerCase().includes(query.toLowerCase())), [cards, filter, query]);
  const collected = cards.filter(({ variant }) => variant.level > 0).length;
  const mastered = cards.filter(({ variant }) => variant.level === 5).length;
  const progress = Math.round((collected / cards.length) * 100);
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
    const rows = currentFortniteCodes.length ? currentFortniteCodes.map(({ code, reward, expires }) => `<article class="code-card"><div class="code-value">${code}</div><strong>${reward}</strong>${expires ? `<small>Vence: ${expires}</small>` : ""}<a href="https://www.fortnite.com/redeem" target="_blank" rel="noreferrer">CANJEAR ↗</a></article>`).join("") : `<div class="codes-empty"><span>∅</span><h3>NO HAY CÓDIGOS ACTIVOS</h3><p>Epic no tiene códigos públicos de recompensas disponibles en este momento. Regresa cuando haya una nueva promoción.</p><a href="https://www.fortnite.com/redeem" target="_blank" rel="noreferrer">ABRIR CANJE OFICIAL ↗</a></div>`;
    overlay.innerHTML = `<div class="codes-panel"><button class="codes-close" aria-label="Cerrar">×</button><p class="eyebrow">GLITCH · RECOMPENSAS</p><h2>CÓDIGOS</h2><p class="codes-intro">Códigos de Fortnite disponibles y la recompensa que entregan.</p><div class="codes-list">${rows}</div><small class="codes-source">Fuente oficial: fortnite.com/redeem</small></div>`;
    document.body.append(button, overlay);
    const close = overlay.querySelector(".codes-close");
    const hide = () => overlay.classList.remove("open");
    button.onclick = () => overlay.classList.add("open");
    close?.addEventListener("click", hide);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) hide(); });
    return () => { button.remove(); overlay.remove(); };
  }, []);

  if (status !== "authenticated") return <LoginScreen />;

  return <main className="shell">
    <nav className="topbar"><div className="brand"><span className="brand-mark">G</span><span>GUSTAMBITOSMX</span></div><div className="season-pill"><span className="live-dot" /> GLITCH · TEMPORADA 04 <span className="season-arrow">⌄</span></div><div className="top-actions"><button className="friends-button" onClick={() => setShowFriends(true)}>AMIGOS <span>{friends.length}</span></button><button className="profile" onClick={() => setShowProfile(true)} aria-label="Abrir perfil de usuario">{session?.user?.image ? <img src={session.user.image} alt={session.user.name ? `Foto de ${session.user.name}` : "Foto de perfil"} /> : "L"}<span /></button></div></nav>
    {showProfile && <div className="profile-overlay" role="dialog" aria-modal="true" aria-label="Perfil de usuario" onClick={() => setShowProfile(false)}><aside className="profile-drawer" onClick={(event) => event.stopPropagation()}><button className="close-friends" onClick={() => setShowProfile(false)} aria-label="Cerrar">×</button><p className="eyebrow">CUENTA · GLITCH</p><div className="drawer-avatar">{session?.user?.image ? <img src={session.user.image} alt="" /> : "L"}</div><h2>{session?.user?.name || "Jugador"}</h2><p className="drawer-email">{session?.user?.email}</p><div className="drawer-id-label">TU ID DE GUSTAMBITOSMX</div><div className="friend-code drawer-code">{myFriendCode || "--------"}<button onClick={() => navigator.clipboard?.writeText(myFriendCode)}>COPIAR</button></div>{friendError && <p className="friend-error">{friendError}</p>}<p className="friend-help">Comparte este ID para que tus amigos vean tu colección.</p><button className="signout-button" onClick={() => signOut({ callbackUrl: "/" })}>CERRAR SESIÓN</button></aside></div>}
     {showFriends && <div className="friends-overlay" role="dialog" aria-modal="true" aria-label="Amigos"><div className="friends-panel"><button className="close-friends" onClick={() => setShowFriends(false)} aria-label="Cerrar">×</button><p className="eyebrow">CONEXIONES · GLITCH</p><h2>Tu ID de amigo</h2><div className="friend-code">{myFriendCode || "--------"}<button onClick={() => navigator.clipboard?.writeText(myFriendCode)}>COPIAR</button></div><p className="friend-help">Comparte este código por WhatsApp, Facebook o donde quieras.</p><div className="add-friend"><input value={friendInput} onChange={(event) => setFriendInput(event.target.value.toUpperCase())} maxLength={8} placeholder="ID DE TU AMIGO" /><button onClick={addFriend}>AGREGAR</button></div>{friendError && <p className="friend-error">{friendError}</p>}<div className="friends-heading"><h3>Tus amigos</h3><span>{friends.length}</span></div>{friends.length === 0 ? <p className="friend-help">Todavía no tienes amigos agregados.</p> : <div className="friend-list">{friends.map((friend) => <><button key={friend.email} className={`friend-row ${selectedFriend?.email === friend.email ? "selected" : ""}`} onClick={() => { setSelectedFriend((current) => current?.email === friend.email ? null : friend); setFriendFilter("Todos"); }}><span className="friend-avatar">{(friend.name || friend.email)[0].toUpperCase()}</span><span><strong>{friend.name || "Jugador"}</strong><small>ID: {friend.friend_code}</small></span><span className="friend-actions"><b>{selectedFriend?.email === friend.email ? "OCULTAR" : "VER"}</b><span className={`friend-reload ${refreshingFriend === friend.email ? "spinning" : ""}`} onClick={(event) => { event.stopPropagation(); void refreshFriend(friend); }} role="button" tabIndex={0} aria-label={`Actualizar colección de ${friend.name || "tu amigo"}`} title="Actualizar colección">↻</span></span></button>{selectedFriend?.email === friend.email && <div className="friend-collection"><div className="friend-collection-heading"><div className="friend-filters">{(["Todos", "Conseguidos", "Faltantes"] as const).map((option) => <button key={option} className={friendFilter === option ? "active" : ""} onClick={() => setFriendFilter(option)}>{option}</button>)}</div></div><div className="friend-variants">{friendVariants.length === 0 ? <p className="friend-help">No hay Gustambitos en este filtro.</p> : friendVariants.map(({ item, variant, level }) => <div className={`friend-variant ${level === 0 ? "missing" : ""} ${level === 5 ? "mastered" : ""}`} key={`${item.id}-${variant.label}`}><img src={variant.image} alt={`${item.name} ${variant.label}`} /><span>{item.name} · {variant.label}</span><b>{level === 5 ? <img className="friend-crown" src="/mastered-crown.png" alt="Dominado" /> : `N${level}`}</b></div>)}</div></div>}</>)}</div>}{selectedFriend && !friends.some((friend) => friend.email === selectedFriend.email) && <div className="friend-collection"><div className="friend-collection-heading"><div className="friend-filters">{(["Todos", "Conseguidos", "Faltantes"] as const).map((option) => <button key={option} className={friendFilter === option ? "active" : ""} onClick={() => setFriendFilter(option)}>{option}</button>)}</div></div><div className="friend-variants">{friendVariants.map(({ item, variant, level }) => <div className={`friend-variant ${level === 0 ? "missing" : ""} ${level === 5 ? "mastered" : ""}`} key={`${item.id}-${variant.label}`}><img src={variant.image} alt={`${item.name} ${variant.label}`} /><span>{item.name} · {variant.label}</span><b>{level === 5 ? <img className="friend-crown" src="/mastered-crown.png" alt="Dominado" /> : `N${level}`}</b></div>)}</div></div>}</div></div>}
    <section className="hero"><div className="hero-copy"><p className="eyebrow">NUEVA TEMPORADA · CAPÍTULO 7</p><h1>Colecciónalos<br /><em>todos.</em></h1><p className="hero-text">Tu álbum personal de Gustambitos. Sube cada variante hasta el nivel 5 y consigue la corona de dominado.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>Ver colección <span>↘</span></button><span className="updated">Actualizado hoy · 20 ago 2026</span></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="mascot"><img src="/mastered-crown.png" alt="Dominado" /></div><span className="orbit-tag tag-one">NIVEL 5 = DOMINADO</span><span className="orbit-tag tag-two">36 VARIANTES</span></div></section>
    <section className="stats-row" aria-label="Resumen de colección"><div className="stat-card progress-card"><div className="stat-label">COLECCIÓN CONSEGUIDA</div><div className="progress-number">{progress}<small>%</small></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="stat-foot"><span>{collected} conseguidas</span><span>{cards.length - collected} pendientes</span></div></div><div className="stat-card"><div className="stat-label">GUSTAMBITOSMX DOMINADOS</div><div className="last-found"><span className="mini-icon"><img src="/mastered-crown.png" alt="Dominado" /></span><div><strong>{mastered} con corona</strong><small>Nivel máximo alcanzado</small></div></div></div><div className="stat-card streak-card"><div className="stat-label">RACHA DE COLECCIÓN</div><div className="streak">03 <span>días</span> <b>✦</b></div><small>¡Sigue así, vas volando!</small></div></section>
    <section className="collection-section" id="collection"><div className="section-heading"><div><p className="eyebrow">TU ÁLBUM · GLITCH</p><h2>Variantes de Gustambitos</h2></div><span className="count-badge">{mastered}/{cards.length} DOMINADAS</span></div><div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar sprite o variante..." aria-label="Buscar sprite o variante" /></div><div className="filters">{["Todos", "Conseguidos", "No conseguidos"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="grid">{filtered.map(({ item, variant, variantIndex }) => <article className={`gustambito-card ${variant.level === 5 ? "mastered-card" : ""}`} key={`${item.id}-${variant.label}`}><div className="card-visual" style={{ "--accent": item.color } as CSSProperties}><button className="card-no master-button" onClick={() => setLevel(item.id, variantIndex, 5)} aria-label="Marcar como dominado"><img src="/mastered-crown.png" alt="" /></button><img className="sprite-image" src={variant.image} alt={`${item.name} ${variant.label}`} />{variant.level === 5 && <span className="crown"><img src="/mastered-crown.png" alt="Dominado" /></span>}</div><div className="card-info"><div><h3>{item.name}</h3><p>{variant.label} · {item.subtitle}</p></div><span className="level-badge">NIVEL {variant.level}/5</span></div><div className="level-control"><span>NIVEL DE COLECCIÓN</span><div className="stepper"><button onClick={() => setLevel(item.id, variantIndex, Math.max(0, variant.level - 1))} disabled={variant.level === 0} aria-label="Bajar nivel">−</button><strong>{variant.level}</strong><button onClick={() => setLevel(item.id, variantIndex, Math.min(5, variant.level + 1))} disabled={variant.level === 5} aria-label="Subir nivel">+</button></div></div><div className="card-season">{item.season}</div></article>)}</div>{filtered.length === 0 && <div className="empty">No encontramos ese Gustambito. Prueba con otro nombre.</div>}</section>
    <footer><span>GUSTAMBITOSMX <i>✦</i></span><span>Nivel 5 = DOMINADO · GLITCH v1.3</span></footer>
  </main>;
}
