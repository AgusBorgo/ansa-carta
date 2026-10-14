"use client";

import { useEffect, useMemo, useState } from "react";
import type { Etiqueta, Idioma, Item, Local } from "@/lib/schema";
import { t, textos } from "@/lib/i18n";
import { minutosEn, momentoActual } from "@/lib/horario";
import { asset, precio } from "@/lib/formato";
import s from "./Carta.module.css";

type Filtro = "veggie" | "sinTacc";
const FILTROS: Filtro[] = ["veggie", "sinTacc"];

export function Carta({ local }: { local: Local }) {
  const [idioma, setIdioma] = useState<Idioma>("es");
  const [momento, setMomento] = useState(local.momentos[0].id);
  const [ahora, setAhora] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtro[]>([]);
  const [pedido, setPedido] = useState<Record<string, number>>({});
  const ui = textos[idioma];

  // La hora se calcula en el celular del cliente (no al compilar),
  // con la zona horaria del local.
  useEffect(() => {
    const actualizar = () => {
      const actual = momentoActual(local.momentos, minutosEn(local.zonaHoraria));
      setAhora(actual);
      return actual;
    };
    setMomento(actualizar());
    const intervalo = window.setInterval(actualizar, 60_000);
    return () => window.clearInterval(intervalo);
  }, [local]);

  const porId = useMemo(
    () => new Map(local.categorias.flatMap((c) => c.items.map((i) => [i.id, i] as const))),
    [local],
  );

  const cumpleFiltros = (i: Item) =>
    filtros.every((f) =>
      f === "veggie" ? i.etiquetas.includes("veggie") || i.etiquetas.includes("vegano") : i.etiquetas.includes(f),
    );

  const categorias = local.categorias
    .filter((c) => c.momentos.includes(momento))
    .map((c) => ({ ...c, items: c.items.filter(cumpleFiltros) }))
    .filter((c) => c.items.length > 0);

  const recomendados = categorias.flatMap((c) => c.items.filter((i) => i.recomendado));

  const lineas = Object.entries(pedido)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => ({ item: porId.get(id)!, n }));
  const cantidad = lineas.reduce((acc, l) => acc + l.n, 0);
  const total = lineas.reduce((acc, l) => acc + l.n * l.item.precio, 0);

  const cambiar = (id: string, delta: number) =>
    setPedido((p) => ({ ...p, [id]: Math.max(0, (p[id] ?? 0) + delta) }));

  const alternarFiltro = (f: Filtro) =>
    setFiltros((actuales) => (actuales.includes(f) ? actuales.filter((x) => x !== f) : [...actuales, f]));

  const linkWhatsapp = () => {
    const detalle = lineas.map((l) => `• ${l.n} × ${t(l.item.nombre, idioma)} — ${precio(l.n * l.item.precio)}`);
    const mensaje = [ui.mensajePedido(local.nombre), ...detalle, `${ui.total}: ${precio(total)}`].join("\n");
    return `https://wa.me/${local.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  };

  const puedePedir = Boolean(local.contacto.whatsapp);
  const otroIdioma: Idioma | null = local.idiomas.includes("en") ? (idioma === "es" ? "en" : "es") : null;

  return (
    <div className={s.carta} lang={idioma}>
      <header className={s.encabezado}>
        <div className={s.identidad}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(local.logo)} alt="" width={52} height={52} className={s.logo} />
          <div>
            <h1 className={s.titulo}>{local.nombre}</h1>
            <p className={s.bajada}>{t(local.bajada, idioma)}</p>
          </div>
        </div>
        {otroIdioma && (
          <button
            type="button"
            className={s.idioma}
            onClick={() => setIdioma(otroIdioma)}
            aria-label={ui.idiomaEtiqueta}
          >
            {ui.idioma}
          </button>
        )}
      </header>

      {local.momentos.length > 1 && (
        <div className={s.momentos}>
          {local.momentos.map((m) => (
            <button
              key={m.id}
              type="button"
              className={s.momento}
              aria-pressed={m.id === momento}
              onClick={() => setMomento(m.id)}
            >
              <span>{t(m.nombre, idioma)}</span>
              {m.id === ahora && <span className={s.ahora}>{ui.ahora}</span>}
            </button>
          ))}
        </div>
      )}

      <div className={s.filtros} role="group" aria-label={ui.filtrar}>
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            className={s.filtro}
            aria-pressed={filtros.includes(f)}
            onClick={() => alternarFiltro(f)}
          >
            {ui.etiquetas[f]}
          </button>
        ))}
      </div>

      {categorias.length > 1 && (
        <nav className={s.nav} aria-label={ui.categorias}>
          {categorias.map((c) => (
            <a key={c.id} href={`#${c.id}`} className={s.navLink}>
              {t(c.nombre, idioma)}
            </a>
          ))}
        </nav>
      )}

      <main className={s.contenido}>
        {recomendados.length > 0 && (
          <section className={s.recomendados} aria-labelledby="recomendados">
            <h2 id="recomendados" className={s.tituloSeccion}>
              {ui.recomendados}
            </h2>
            <ul className={s.carrusel}>
              {recomendados.map((i) => (
                <li key={i.id} className={s.destacado}>
                  {i.foto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset(i.foto)} alt="" className={s.fotoDestacada} loading="lazy" />
                  )}
                  <span className={s.destacadoNombre}>{t(i.nombre, idioma)}</span>
                  <span className={s.destacadoPrecio}>{precio(i.precio)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {categorias.length === 0 && (
          <div className={s.vacio}>
            <p>{ui.sinResultados}</p>
            <button type="button" className={s.botonSecundario} onClick={() => setFiltros([])}>
              {ui.limpiarFiltros}
            </button>
          </div>
        )}

        {categorias.map((c) => (
          <section key={c.id} id={c.id} className={s.categoria} aria-labelledby={`t-${c.id}`}>
            <h2 id={`t-${c.id}`} className={s.tituloSeccion}>
              {t(c.nombre, idioma)}
            </h2>
            <ul className={s.items}>
              {c.items.map((i) => {
                const n = pedido[i.id] ?? 0;
                const combina = i.vaBienCon ? porId.get(i.vaBienCon) : undefined;
                const nombre = t(i.nombre, idioma);
                return (
                  <li key={i.id} className={s.item}>
                    {i.foto && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset(i.foto)} alt="" className={s.foto} loading="lazy" />
                    )}
                    <div className={s.itemTexto}>
                      <div className={s.itemFila}>
                        <h3 className={s.itemNombre}>{nombre}</h3>
                        <span className={s.precio}>{precio(i.precio)}</span>
                      </div>
                      {i.descripcion && <p className={s.descripcion}>{t(i.descripcion, idioma)}</p>}
                      {i.etiquetas.length > 0 && (
                        <ul className={s.etiquetas}>
                          {i.etiquetas.map((e: Etiqueta) => (
                            <li key={e} className={s.etiqueta}>
                              {ui.etiquetas[e]}
                            </li>
                          ))}
                        </ul>
                      )}
                      {combina && (
                        <p className={s.combina}>
                          {ui.vaBienCon} <strong>{t(combina.nombre, idioma)}</strong>
                        </p>
                      )}
                      {puedePedir && (
                        <div className={s.acciones}>
                          {n === 0 ? (
                            <button
                              type="button"
                              className={s.agregar}
                              onClick={() => cambiar(i.id, 1)}
                              aria-label={ui.agregarA(nombre)}
                            >
                              + {ui.agregar}
                            </button>
                          ) : (
                            <div className={s.contador}>
                              <button type="button" onClick={() => cambiar(i.id, -1)} aria-label={ui.quitarA(nombre)}>
                                −
                              </button>
                              <span aria-live="polite">{n}</span>
                              <button type="button" onClick={() => cambiar(i.id, 1)} aria-label={ui.agregarA(nombre)}>
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>

      <footer className={s.pie}>
        {local.horarios.length > 0 && (
          <div className={s.bloque}>
            <h2 className={s.tituloPie}>{ui.horarios}</h2>
            <dl className={s.horarios}>
              {local.horarios.map((h) => (
                <div key={h.dias}>
                  <dt>{h.dias}</dt>
                  <dd>{h.horas}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {local.contacto.direccion && (
          <div className={s.bloque}>
            <p className={s.direccion}>{local.contacto.direccion}</p>
            {local.contacto.mapa && (
              <a href={local.contacto.mapa} className={s.linkPie} target="_blank" rel="noreferrer">
                {ui.comoLlegar}
              </a>
            )}
          </div>
        )}
        <div className={s.botonesPie}>
          {local.contacto.resenaGoogle && (
            <a href={local.contacto.resenaGoogle} className={s.botonPrincipal} target="_blank" rel="noreferrer">
              {ui.resena}
            </a>
          )}
          {local.contacto.instagram && (
            <a
              href={`https://instagram.com/${local.contacto.instagram}`}
              className={s.botonSecundario}
              target="_blank"
              rel="noreferrer"
            >
              {ui.instagram}
            </a>
          )}
        </div>
        <p className={s.credito}>
          {ui.hechoPor}{" "}
          <a href="https://instagram.com/anse_studio_" target="_blank" rel="noreferrer">
            Anse Studio
          </a>
        </p>
      </footer>

      {puedePedir && cantidad > 0 && (
        <div className={s.barraPedido}>
          <div className={s.resumen}>
            <span>{ui.pedido(cantidad)}</span>
            <strong>{precio(total)}</strong>
          </div>
          <button type="button" className={s.vaciar} onClick={() => setPedido({})}>
            {ui.vaciar}
          </button>
          <a href={linkWhatsapp()} className={s.botonPrincipal} target="_blank" rel="noreferrer">
            {ui.pedirWhatsapp}
          </a>
        </div>
      )}
    </div>
  );
}
