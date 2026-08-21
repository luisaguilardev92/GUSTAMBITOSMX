"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { signIn, useSession } from "next-auth/react";

type Variant = { label: string; image: string; level: number };
type Gustambito = { id: number; name: string; subtitle: string; rarity: "Mítico" | "Épico" | "Raro"; color: string; image: string; season: string; variants: Variant[] };
type VariantCard = { item: Gustambito; variant: Variant; variantIndex: number };

const spriteUrl = (key: string, variant = "") => `https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_${key}${variant ? `_${variant}` : ""}_L.webp`;
const makeVariants = (key: string, levels: number[] = [0, 0, 0]): Variant[] => [
  { label: "Base", image: spriteUrl(key), level: levels[0] },
  { label: "Dorado", image: spriteUrl(key, "Gold"), level: levels[1] },
  { label: "Cheat Master", image: spriteUrl(key, "Cheatmaster"), level: levels[2] },
];
const initialGustambitos: Gustambito[] = [
  { id: 1, name: "Jackrabbit", subtitle: "Salta más lejos", rarity: "Raro", color: "#8ed35b", image: spriteUrl("JazzJackrabbit"), season: "GLITCH · Capítulo 7", variants: makeVariants("JazzJackrabbit", [1, 0, 0]) },
  { id: 2, name: "Shadow", subtitle: "Se mueve entre las sombras", rarity: "Épico", color: "#5b4e74", image: spriteUrl("NarrowFlea_Scribe"), season: "GLITCH · Capítulo 7", variants: makeVariants("NarrowFlea_Scribe") },
  { id: 3, name: "Bush", subtitle: "Se camufla en la isla", rarity: "Raro", color: "#79c85b", image: spriteUrl("BushRanger"), season: "GLITCH · Capítulo 7", variants: makeVariants("BushRanger", [1, 0, 0]) },
  { id: 4, name: "Tails", subtitle: "El compañero volador", rarity: "Épico", color: "#e98b42", image: spriteUrl("NarrowFlea_Monkey"), season: "GLITCH · Capítulo 7", variants: makeVariants("NarrowFlea_Monkey", [1, 0, 1]) },
  { id: 5, name: "Killswitch", subtitle: "Controla el sistema", rarity: "Épico", color: "#94a5a1", image: spriteUrl("Killswitch"), season: "GLITCH · Capítulo 7", variants: makeVariants("Killswitch", [1, 0, 0]) },
  { id: 6, name: "Adventure", subtitle: "Siempre busca el siguiente nivel", rarity: "Épico", color: "#c47f48", image: spriteUrl("Dwarf"), season: "GLITCH · Capítulo 7", variants: makeVariants("Dwarf", [1, 0, 1]) },
  { id: 7, name: "Klombo", subtitle: "El gigante amistoso", rarity: "Mítico", color: "#ef63c4", image: spriteUrl("Klombo"), season: "GLITCH · Capítulo 7", variants: makeVariants("Klombo") },
  { id: 8, name: "Jonesy", subtitle: "El héroe de siempre", rarity: "Épico", color: "#ef7b5b", image: spriteUrl("Jonesy"), season: "GLITCH · Capítulo 7", variants: makeVariants("Jonesy", [1, 0, 1]) },
  { id: 9, name: "Sonic", subtitle: "Corre a velocidad sónica", rarity: "Mítico", color: "#55b7ed", image: spriteUrl("NarrowFlea_Obsidian"), season: "GLITCH · Capítulo 7", variants: makeVariants("NarrowFlea_Obsidian", [1, 0, 1]) },
  { id: 10, name: "Crown", subtitle: "Realeza en el lobby", rarity: "Mítico", color: "#e6534e", image: spriteUrl("Crown"), season: "GLITCH · Capítulo 7", variants: makeVariants("Crown", [1, 0, 0]) },
  { id: 11, name: "8-Bit", subtitle: "Directo desde el arcade", rarity: "Épico", color: "#e86552", image: spriteUrl("EightBitBlaster"), season: "GLITCH · Capítulo 7", variants: makeVariants("EightBitBlaster", [1, 0, 1]) },
  { id: 12, name: "Storm Scout", subtitle: "Descubre el siguiente círculo", rarity: "Raro", color: "#a775dd", image: spriteUrl("StormScout"), season: "GLITCH · Capítulo 7", variants: makeVariants("StormScout") },
];

const migrate = (value: Gustambito[]): Gustambito[] => value.map((item) => ({ ...item, variants: item.variants.map((variant) => ({ ...variant, level: typeof variant.level === "number" ? variant.level : ("obtained" in variant && variant.obtained ? 1 : 0) })) }));

function LoginScreen() {
  return <main className="login-screen"><div className="login-glow" /><div className="login-card"><div className="brand login-brand"><span className="brand-mark">G</span><span>GUSTAMBITOS</span></div><p className="eyebrow">GLITCH · TEMPORADA 04</p><div className="login-mascot">♛</div><h1>Tu colección<br /><em>empieza aquí.</em></h1><p className="login-copy">Inicia sesión para guardar tus niveles, variantes y Gustambitos dominados.</p><button className="google-button" onClick={() => signIn("google")}><span className="google-icon">G</span>Continuar con Google</button><small className="login-note">Tu progreso quedará asociado a tu cuenta.</small></div></main>;
}

export default function Home() {
  const { status } = useSession();
  const [gustambitos, setGustambitos] = useState(initialGustambitos);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const saved = window.localStorage.getItem("gustambitos-glitch-v4") ?? window.localStorage.getItem("gustambitos-glitch-v3"); if (saved) setGustambitos(migrate(JSON.parse(saved))); window.requestAnimationFrame(() => setHydrated(true)); }, []);
  const visible = hydrated ? gustambitos : initialGustambitos;
  const setLevel = (id: number, variantIndex: number, level: number) => { const next = gustambitos.map((item) => item.id !== id ? item : { ...item, variants: item.variants.map((variant, index) => index === variantIndex ? { ...variant, level } : variant) }); setGustambitos(next); window.localStorage.setItem("gustambitos-glitch-v4", JSON.stringify(next)); };
  const cards = useMemo<VariantCard[]>(() => visible.flatMap((item) => item.variants.map((variant, variantIndex) => ({ item, variant, variantIndex }))), [visible]);
  const filtered = useMemo(() => cards.filter(({ item, variant }) => (filter === "Todos" || (filter === "Conseguidos" ? variant.level > 0 : item.rarity === filter)) && `${item.name} ${variant.label}`.toLowerCase().includes(query.toLowerCase())), [cards, filter, query]);
  const collected = cards.filter(({ variant }) => variant.level > 0).length;
  const mastered = cards.filter(({ variant }) => variant.level === 5).length;
  const progress = Math.round((collected / cards.length) * 100);

  if (status !== "authenticated") return <LoginScreen />;

  return <main className="shell">
    <nav className="topbar"><div className="brand"><span className="brand-mark">G</span><span>GUSTAMBITOS</span></div><div className="season-pill"><span className="live-dot" /> GLITCH · TEMPORADA 04 <span className="season-arrow">⌄</span></div><button className="profile" onClick={() => signIn("google")} aria-label="Iniciar sesión con Google">L<span /></button></nav>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">NUEVA TEMPORADA · CAPÍTULO 7</p><h1>Colecciónalos<br /><em>todos.</em></h1><p className="hero-text">Tu álbum personal de Gustambitos. Sube cada variante hasta el nivel 5 y consigue la corona de dominado.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>Ver colección <span>↘</span></button><span className="updated">Actualizado hoy · 20 ago 2026</span></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="mascot">♛</div><span className="orbit-tag tag-one">NIVEL 5 = DOMINADO</span><span className="orbit-tag tag-two">36 VARIANTES</span></div></section>
    <section className="stats-row" aria-label="Resumen de colección"><div className="stat-card progress-card"><div className="stat-label">COLECCIÓN CONSEGUIDA</div><div className="progress-number">{progress}<small>%</small></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="stat-foot"><span>{collected} conseguidas</span><span>{cards.length - collected} pendientes</span></div></div><div className="stat-card"><div className="stat-label">GUSTAMBITOS DOMINADOS</div><div className="last-found"><span className="mini-icon">♛</span><div><strong>{mastered} con corona</strong><small>Nivel máximo alcanzado</small></div></div></div><div className="stat-card streak-card"><div className="stat-label">RACHA DE COLECCIÓN</div><div className="streak">03 <span>días</span> <b>✦</b></div><small>¡Sigue así, vas volando!</small></div></section>
    <section className="collection-section" id="collection"><div className="section-heading"><div><p className="eyebrow">TU ÁLBUM · GLITCH</p><h2>Variantes de Gustambitos</h2></div><span className="count-badge">{mastered}/{cards.length} DOMINADAS</span></div><div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar sprite o variante..." aria-label="Buscar sprite o variante" /></div><div className="filters">{["Todos", "Conseguidos", "Mítico", "Épico", "Raro"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="grid">{filtered.map(({ item, variant, variantIndex }) => <article className={`gustambito-card ${variant.level === 5 ? "mastered-card" : ""}`} key={`${item.id}-${variant.label}`}><div className="card-visual" style={{ "--accent": item.color } as CSSProperties}><div className="card-no">#{String(item.id).padStart(2, "0")}</div><img className="sprite-image" src={variant.image} alt={`${item.name} ${variant.label}`} /><span className="rarity">{variant.label}</span>{variant.level === 5 && <span className="crown">♛</span>}</div><div className="card-info"><div><h3>{item.name}</h3><p>{variant.label} · {item.subtitle}</p></div><span className="level-badge">NIVEL {variant.level}/5</span></div><div className="level-control"><span>SUBIR NIVEL</span><div>{[1,2,3,4,5].map((level) => <button key={level} className={level <= variant.level ? "level-on" : ""} onClick={() => setLevel(item.id, variantIndex, level)} aria-label={`Marcar nivel ${level}`}>{level === 5 && variant.level === 5 ? "♛" : level}</button>)}</div></div><div className="card-season">{item.season}</div></article>)}</div>{filtered.length === 0 && <div className="empty">No encontramos ese Gustambito. Prueba con otro nombre.</div>}</section>
    <footer><span>GUSTAMBITOS <i>✦</i></span><span>Nivel 5 = DOMINADO · GLITCH v1.3</span></footer>
  </main>;
}
