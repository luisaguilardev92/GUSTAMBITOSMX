"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Gustambito = { id: number; name: string; subtitle: string; rarity: "Mítico" | "Épico" | "Raro"; color: string; icon: string; season: string; obtained: boolean };

const initialGustambitos: Gustambito[] = [
  { id: 1, name: "Mochi Meteoro", subtitle: "Caído de otra galaxia", rarity: "Mítico", color: "#f5b942", icon: "✦", season: "Capítulo 7 · S1", obtained: true },
  { id: 2, name: "Capitán Chispa", subtitle: "Carga energía y corre", rarity: "Épico", color: "#c17dff", icon: "⚡", season: "Capítulo 7 · S1", obtained: true },
  { id: 3, name: "Gato Glitch", subtitle: "No es un bug, es estilo", rarity: "Épico", color: "#8b9cff", icon: "⌁", season: "Capítulo 7 · S1", obtained: false },
  { id: 4, name: "Tostadito Turbo", subtitle: "Crujiente a toda velocidad", rarity: "Raro", color: "#67d3b3", icon: "☄", season: "Capítulo 7 · S1", obtained: false },
  { id: 5, name: "Nubecita Ninja", subtitle: "Se esconde entre las nubes", rarity: "Raro", color: "#65b5ff", icon: "☁", season: "Capítulo 7 · S1", obtained: false },
  { id: 6, name: "Sushi Sónico", subtitle: "El roll más rápido", rarity: "Épico", color: "#f283a5", icon: "◈", season: "Capítulo 7 · S1", obtained: false },
  { id: 7, name: "Perrito Pixel", subtitle: "Leal hasta el último círculo", rarity: "Raro", color: "#e2a66f", icon: "✚", season: "Capítulo 7 · S1", obtained: true },
  { id: 8, name: "Rey del Lobby", subtitle: "Siempre llega primero", rarity: "Mítico", color: "#ffcb5c", icon: "♛", season: "Capítulo 7 · S1", obtained: false },
];

export default function Home() {
  const [gustambitos, setGustambitos] = useState(initialGustambitos);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  useEffect(() => { const saved = window.localStorage.getItem("gustambitos"); if (saved) setGustambitos(JSON.parse(saved)); }, []);
  const toggleObtained = (id: number) => { const next = gustambitos.map((item) => item.id === id ? { ...item, obtained: !item.obtained } : item); setGustambitos(next); window.localStorage.setItem("gustambitos", JSON.stringify(next)); };
  const filtered = useMemo(() => gustambitos.filter((item) => (filter === "Todos" || (filter === "Conseguidos" ? item.obtained : item.rarity === filter)) && item.name.toLowerCase().includes(query.toLowerCase())), [filter, gustambitos, query]);
  const collected = gustambitos.filter((item) => item.obtained).length;
  const progress = Math.round((collected / gustambitos.length) * 100);

  return <main className="shell">
    <nav className="topbar"><div className="brand"><span className="brand-mark">G</span><span>GUSTAMBITOS</span></div><div className="season-pill"><span className="live-dot" /> TEMPORADA 01 <span className="season-arrow">⌄</span></div><button className="profile" aria-label="Abrir perfil">L<span /></button></nav>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">NUEVA TEMPORADA · CAPÍTULO 7</p><h1>Colecciónalos<br /><em>todos.</em></h1><p className="hero-text">Tu álbum personal de Gustambitos. Marca tus hallazgos y descubre cuánto te falta para completar la temporada.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>Ver colección <span>↘</span></button><span className="updated">Actualizado hoy · 20 ago 2026</span></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="mascot">✦</div><span className="orbit-tag tag-one">NUEVO</span><span className="orbit-tag tag-two">8 TOTAL</span></div></section>
    <section className="stats-row" aria-label="Resumen de colección"><div className="stat-card progress-card"><div className="stat-label">PROGRESO DE TEMPORADA</div><div className="progress-number">{progress}<small>%</small></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="stat-foot"><span>{collected} conseguidos</span><span>{gustambitos.length - collected} pendientes</span></div></div><div className="stat-card"><div className="stat-label">ÚLTIMO HALLAZGO</div><div className="last-found"><span className="mini-icon">⚡</span><div><strong>Capitán Chispa</strong><small>hace 2 horas</small></div></div></div><div className="stat-card streak-card"><div className="stat-label">RACHA DE COLECCIÓN</div><div className="streak">03 <span>días</span> <b>✦</b></div><small>¡Sigue así, vas volando!</small></div></section>
    <section className="collection-section" id="collection"><div className="section-heading"><div><p className="eyebrow">TU ÁLBUM</p><h2>Todos los Gustambitos</h2></div><span className="count-badge">{collected}/{gustambitos.length} CONSEGUIDOS</span></div><div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar Gustambito..." aria-label="Buscar Gustambito" /></div><div className="filters">{["Todos", "Conseguidos", "Mítico", "Épico", "Raro"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="grid">{filtered.map((item) => <article className="gustambito-card" key={item.id}><div className="card-visual" style={{ "--accent": item.color } as CSSProperties}><div className="card-no">#{String(item.id).padStart(2, "0")}</div><span className="big-icon">{item.icon}</span>{item.obtained && <span className="check">✓</span>}<span className="rarity">{item.rarity}</span></div><div className="card-info"><div><h3>{item.name}</h3><p>{item.subtitle}</p></div><button className={item.obtained ? "owned" : "add"} onClick={() => toggleObtained(item.id)} aria-label={`${item.obtained ? "Quitar" : "Marcar"} ${item.name}`}>{item.obtained ? "✓" : "+"}</button></div><div className="card-season">{item.season}</div></article>)}</div>{filtered.length === 0 && <div className="empty">No encontramos ese Gustambito. Prueba con otro nombre.</div>}</section>
    <footer><span>GUSTAMBITOS <i>✦</i></span><span>Hecho para coleccionistas de la isla · v1.0</span></footer>
  </main>;
}
