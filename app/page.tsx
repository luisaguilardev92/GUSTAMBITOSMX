"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Variant = { label: string; image: string; obtained: boolean };
type Gustambito = {
  id: number;
  name: string;
  subtitle: string;
  rarity: "Mítico" | "Épico" | "Raro";
  color: string;
  image: string;
  season: string;
  variants: Variant[];
};

const spriteUrl = (key: string, variant = "") =>
  `https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_${key}${variant ? `_${variant}` : ""}_L.webp`;
const makeVariants = (key: string, owned: boolean[] = [false, false, false]): Variant[] => [
  { label: "Base", image: spriteUrl(key), obtained: owned[0] },
  { label: "Dorado", image: spriteUrl(key, "Gold"), obtained: owned[1] },
  { label: "Cheat", image: spriteUrl(key, "Cheatmaster"), obtained: owned[2] },
];

const initialGustambitos: Gustambito[] = [
  { id: 1, name: "Jackrabbit", subtitle: "Salta más lejos", rarity: "Raro", color: "#8ed35b", image: spriteUrl("JazzJackrabbit"), season: "GLITCH · Capítulo 7", variants: makeVariants("JazzJackrabbit", [true, false, false]) },
  { id: 2, name: "Shadow", subtitle: "Se mueve entre las sombras", rarity: "Épico", color: "#5b4e74", image: spriteUrl("NarrowFlea_Scribe"), season: "GLITCH · Capítulo 7", variants: makeVariants("NarrowFlea_Scribe") },
  { id: 3, name: "Bush", subtitle: "Se camufla en la isla", rarity: "Raro", color: "#79c85b", image: spriteUrl("BushRanger"), season: "GLITCH · Capítulo 7", variants: makeVariants("BushRanger", [true, false, false]) },
  { id: 4, name: "Tails", subtitle: "El compañero volador", rarity: "Épico", color: "#e98b42", image: spriteUrl("NarrowFlea_Monkey"), season: "GLITCH · Capítulo 7", variants: makeVariants("NarrowFlea_Monkey", [true, false, true]) },
  { id: 5, name: "Killswitch", subtitle: "Controla el sistema", rarity: "Épico", color: "#94a5a1", image: spriteUrl("Killswitch"), season: "GLITCH · Capítulo 7", variants: makeVariants("Killswitch", [true, false, false]) },
  { id: 6, name: "Adventure", subtitle: "Siempre busca el siguiente nivel", rarity: "Épico", color: "#c47f48", image: spriteUrl("Dwarf"), season: "GLITCH · Capítulo 7", variants: makeVariants("Dwarf", [true, false, true]) },
  { id: 7, name: "Klombo", subtitle: "El gigante amistoso", rarity: "Mítico", color: "#ef63c4", image: spriteUrl("Klombo"), season: "GLITCH · Capítulo 7", variants: makeVariants("Klombo") },
  { id: 8, name: "Jonesy", subtitle: "El héroe de siempre", rarity: "Épico", color: "#ef7b5b", image: spriteUrl("Jonesy"), season: "GLITCH · Capítulo 7", variants: makeVariants("Jonesy", [true, false, true]) },
  { id: 9, name: "Sonic", subtitle: "Corre a velocidad sónica", rarity: "Mítico", color: "#55b7ed", image: spriteUrl("NarrowFlea_Obsidian"), season: "GLITCH · Capítulo 7", variants: makeVariants("NarrowFlea_Obsidian", [true, false, true]) },
  { id: 10, name: "Crown", subtitle: "Realeza en el lobby", rarity: "Mítico", color: "#e6534e", image: spriteUrl("Crown"), season: "GLITCH · Capítulo 7", variants: makeVariants("Crown", [true, false, false]) },
  { id: 11, name: "8-Bit", subtitle: "Directo desde el arcade", rarity: "Épico", color: "#e86552", image: spriteUrl("EightBitBlaster"), season: "GLITCH · Capítulo 7", variants: makeVariants("EightBitBlaster", [true, false, true]) },
  { id: 12, name: "Storm Scout", subtitle: "Descubre el siguiente círculo", rarity: "Raro", color: "#a775dd", image: spriteUrl("StormScout"), season: "GLITCH · Capítulo 7", variants: makeVariants("StormScout") },
];

export default function Home() {
  const [gustambitos, setGustambitos] = useState(initialGustambitos);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("gustambitos-glitch-v3");
    if (saved) setGustambitos(JSON.parse(saved));
    window.requestAnimationFrame(() => setHydrated(true));
  }, []);

  const visible = hydrated ? gustambitos : initialGustambitos;
  const toggleVariant = (id: number, variantIndex: number) => {
    const next = gustambitos.map((item) => item.id !== id ? item : {
      ...item,
      variants: item.variants.map((variant, index) => index === variantIndex ? { ...variant, obtained: !variant.obtained } : variant),
    });
    setGustambitos(next);
    window.localStorage.setItem("gustambitos-glitch-v3", JSON.stringify(next));
  };
  const filtered = useMemo(() => visible.filter((item) =>
    (filter === "Todos" || (filter === "Conseguidos" ? item.variants.some((variant) => variant.obtained) : item.rarity === filter)) &&
    item.name.toLowerCase().includes(query.toLowerCase())
  ), [filter, visible, query]);
  const collected = visible.reduce((total, item) => total + item.variants.filter((variant) => variant.obtained).length, 0);
  const totalVariants = visible.length * 3;
  const progress = Math.round((collected / totalVariants) * 100);

  return <main className="shell">
    <nav className="topbar"><div className="brand"><span className="brand-mark">G</span><span>GUSTAMBITOS</span></div><div className="season-pill"><span className="live-dot" /> GLITCH · TEMPORADA 04 <span className="season-arrow">⌄</span></div><button className="profile" aria-label="Abrir perfil">L<span /></button></nav>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">NUEVA TEMPORADA · CAPÍTULO 7</p><h1>Colecciónalos<br /><em>todos.</em></h1><p className="hero-text">Tu álbum personal de Gustambitos. Marca tus hallazgos y descubre cuánto te falta para completar la temporada.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>Ver colección <span>↘</span></button><span className="updated">Actualizado hoy · 20 ago 2026</span></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="mascot">✦</div><span className="orbit-tag tag-one">NUEVO</span><span className="orbit-tag tag-two">36 TOTAL</span></div></section>
    <section className="stats-row" aria-label="Resumen de colección"><div className="stat-card progress-card"><div className="stat-label">PROGRESO DE TEMPORADA</div><div className="progress-number">{progress}<small>%</small></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="stat-foot"><span>{collected} conseguidos</span><span>{totalVariants - collected} pendientes</span></div></div><div className="stat-card"><div className="stat-label">ÚLTIMO HALLAZGO</div><div className="last-found"><span className="mini-icon">⚡</span><div><strong>Variante de GLITCH</strong><small>tu colección personal</small></div></div></div><div className="stat-card streak-card"><div className="stat-label">RACHA DE COLECCIÓN</div><div className="streak">03 <span>días</span> <b>✦</b></div><small>¡Sigue así, vas volando!</small></div></section>
    <section className="collection-section" id="collection"><div className="section-heading"><div><p className="eyebrow">TU ÁLBUM · GLITCH</p><h2>Todos los Gustambitos</h2></div><span className="count-badge">{collected}/{totalVariants} VARIANTES</span></div><div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar Gustambito..." aria-label="Buscar Gustambito" /></div><div className="filters">{["Todos", "Conseguidos", "Mítico", "Épico", "Raro"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="grid">{filtered.map((item) => <article className="gustambito-card" key={item.id}><div className="card-visual" style={{ "--accent": item.color } as CSSProperties}><div className="card-no">#{String(item.id).padStart(2, "0")}</div><img className="sprite-image" src={item.image} alt={item.name} /><span className="rarity">{item.rarity}</span></div><div className="card-info"><div><h3>{item.name}</h3><p>{item.subtitle}</p></div><span className="variant-progress">{item.variants.filter((variant) => variant.obtained).length}/3</span></div><div className="variant-row">{item.variants.map((variant, index) => <button key={variant.label} className={`variant-button ${variant.obtained ? "selected" : ""}`} onClick={() => toggleVariant(item.id, index)} aria-label={`${variant.obtained ? "Quitar" : "Marcar"} variante ${variant.label} de ${item.name}`}><img src={variant.image} alt="" /><span>{variant.label}</span>{variant.obtained && <b>✓</b>}</button>)}</div><div className="card-season">{item.season}</div></article>)}</div>{filtered.length === 0 && <div className="empty">No encontramos ese Gustambito. Prueba con otro nombre.</div>}</section>
    <footer><span>GUSTAMBITOS <i>✦</i></span><span>Hecho para coleccionistas de la isla · v1.1</span></footer>
  </main>;
}
