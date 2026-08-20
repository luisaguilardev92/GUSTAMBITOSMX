"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Gustambito = { id: number; name: string; subtitle: string; rarity: "Mítico" | "Épico" | "Raro"; color: string; image: string; season: string; obtained: boolean };

const initialGustambitos: Gustambito[] = [
  { id: 1, name: "Jackrabbit", subtitle: "Salta más lejos", rarity: "Raro", color: "#8ed35b", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_JazzJackrabbit_L.webp", season: "GLITCH · Capítulo 7", obtained: true },
  { id: 2, name: "Shadow", subtitle: "Se mueve entre las sombras", rarity: "Épico", color: "#5b4e74", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_NarrowFlea_Scribe_L.webp", season: "GLITCH · Capítulo 7", obtained: false },
  { id: 3, name: "Bush", subtitle: "Se camufla en la isla", rarity: "Raro", color: "#79c85b", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_BushRanger_L.webp", season: "GLITCH · Capítulo 7", obtained: true },
  { id: 4, name: "Tails", subtitle: "El compañero volador", rarity: "Épico", color: "#e98b42", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_NarrowFlea_Monkey_L.webp", season: "GLITCH · Capítulo 7", obtained: false },
  { id: 5, name: "Killswitch", subtitle: "Controla el sistema", rarity: "Épico", color: "#94a5a1", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_Killswitch_L.webp", season: "GLITCH · Capítulo 7", obtained: false },
  { id: 6, name: "Adventure", subtitle: "Siempre busca el siguiente nivel", rarity: "Épico", color: "#c47f48", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_Dwarf_L.webp", season: "GLITCH · Capítulo 7", obtained: false },
  { id: 7, name: "Klombo", subtitle: "El gigante amistoso", rarity: "Mítico", color: "#ef63c4", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_Klombo_L.webp", season: "GLITCH · Capítulo 7", obtained: true },
  { id: 8, name: "Jonesy", subtitle: "El héroe de siempre", rarity: "Épico", color: "#ef7b5b", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_Jonesy_L.webp", season: "GLITCH · Capítulo 7", obtained: false },
  { id: 9, name: "Sonic", subtitle: "Corre a velocidad sónica", rarity: "Mítico", color: "#55b7ed", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_NarrowFlea_Obsidian_L.webp", season: "GLITCH · Capítulo 7", obtained: false },
  { id: 10, name: "Crown", subtitle: "Realeza en el lobby", rarity: "Mítico", color: "#e6534e", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_Crown_L.webp", season: "GLITCH · Capítulo 7", obtained: false },
  { id: 11, name: "8-Bit", subtitle: "Directo desde el arcade", rarity: "Épico", color: "#e86552", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_EightBitBlaster_L.webp", season: "GLITCH · Capítulo 7", obtained: true },
  { id: 12, name: "Storm Scout", subtitle: "Descubre el siguiente círculo", rarity: "Raro", color: "#a775dd", image: "https://fortnite.gg/img/x/sprites/icons/T_Icon_BR_Creature_Sprite_StormScout_L.webp", season: "GLITCH · Capítulo 7", obtained: false },
];

export default function Home() {
  const [gustambitos, setGustambitos] = useState(initialGustambitos);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  useEffect(() => { const saved = window.localStorage.getItem("gustambitos-glitch-v2"); if (saved) setGustambitos(JSON.parse(saved)); }, []);
  const toggleObtained = (id: number) => { const next = gustambitos.map((item) => item.id === id ? { ...item, obtained: !item.obtained } : item); setGustambitos(next); window.localStorage.setItem("gustambitos-glitch-v2", JSON.stringify(next)); };
  const filtered = useMemo(() => gustambitos.filter((item) => (filter === "Todos" || (filter === "Conseguidos" ? item.obtained : item.rarity === filter)) && item.name.toLowerCase().includes(query.toLowerCase())), [filter, gustambitos, query]);
  const collected = gustambitos.filter((item) => item.obtained).length;
  const progress = Math.round((collected / gustambitos.length) * 100);

  return <main className="shell">
    <nav className="topbar"><div className="brand"><span className="brand-mark">G</span><span>GUSTAMBITOS</span></div><div className="season-pill"><span className="live-dot" /> GLITCH · TEMPORADA 04 <span className="season-arrow">⌄</span></div><button className="profile" aria-label="Abrir perfil">L<span /></button></nav>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">NUEVA TEMPORADA · CAPÍTULO 7</p><h1>Colecciónalos<br /><em>todos.</em></h1><p className="hero-text">Tu álbum personal de Gustambitos. Marca tus hallazgos y descubre cuánto te falta para completar la temporada.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>Ver colección <span>↘</span></button><span className="updated">Actualizado hoy · 20 ago 2026</span></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="mascot">✦</div><span className="orbit-tag tag-one">NUEVO</span><span className="orbit-tag tag-two">8 TOTAL</span></div></section>
    <section className="stats-row" aria-label="Resumen de colección"><div className="stat-card progress-card"><div className="stat-label">PROGRESO DE TEMPORADA</div><div className="progress-number">{progress}<small>%</small></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="stat-foot"><span>{collected} conseguidos</span><span>{gustambitos.length - collected} pendientes</span></div></div><div className="stat-card"><div className="stat-label">ÚLTIMO HALLAZGO</div><div className="last-found"><span className="mini-icon">⚡</span><div><strong>Capitán Chispa</strong><small>hace 2 horas</small></div></div></div><div className="stat-card streak-card"><div className="stat-label">RACHA DE COLECCIÓN</div><div className="streak">03 <span>días</span> <b>✦</b></div><small>¡Sigue así, vas volando!</small></div></section>
    <section className="collection-section" id="collection"><div className="section-heading"><div><p className="eyebrow">TU ÁLBUM · GLITCH</p><h2>Todos los Gustambitos</h2></div><span className="count-badge">{collected}/{gustambitos.length} CONSEGUIDOS</span></div><div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar Gustambito..." aria-label="Buscar Gustambito" /></div><div className="filters">{["Todos", "Conseguidos", "Mítico", "Épico", "Raro"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="grid">{filtered.map((item) => <article className="gustambito-card" key={item.id}><div className="card-visual" style={{ "--accent": item.color } as CSSProperties}><div className="card-no">#{String(item.id).padStart(2, "0")}</div><img className="sprite-image" src={item.image} alt={item.name} />{item.obtained && <span className="check">✓</span>}<span className="rarity">{item.rarity}</span></div><div className="card-info"><div><h3>{item.name}</h3><p>{item.subtitle}</p></div><button className={item.obtained ? "owned" : "add"} onClick={() => toggleObtained(item.id)} aria-label={`${item.obtained ? "Quitar" : "Marcar"} ${item.name}`}>{item.obtained ? "✓" : "+"}</button></div><div className="card-season">{item.season}</div></article>)}</div>{filtered.length === 0 && <div className="empty">No encontramos ese Gustambito. Prueba con otro nombre.</div>}</section>
    <footer><span>GUSTAMBITOS <i>✦</i></span><span>Hecho para coleccionistas de la isla · v1.0</span></footer>
  </main>;
}
