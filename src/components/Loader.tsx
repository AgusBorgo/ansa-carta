"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/formato";
import s from "./Loader.module.css";

type Fase = "visible" | "saliendo" | "fin";

/**
 * Pantalla de carga con el logo del local. Es corta a propósito (≈1,3 s):
 * es un momento de marca, no una espera. Si el celular pide menos animación,
 * dura 0,3 s; y si el JavaScript falla, el CSS la oculta solo a los 2,5 s.
 */
export function Loader({ logo, nombre, aviso }: { logo: string; nombre: string; aviso: string }) {
  const [fase, setFase] = useState<Fase>("visible");

  useEffect(() => {
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duracion = reducido ? 300 : 1300;
    const salir = window.setTimeout(() => setFase("saliendo"), duracion);
    const fin = window.setTimeout(() => setFase("fin"), duracion + 450);
    return () => {
      window.clearTimeout(salir);
      window.clearTimeout(fin);
    };
  }, []);

  if (fase === "fin") return null;

  return (
    <div className={`${s.loader} ${fase === "saliendo" ? s.saliendo : ""}`} role="status" aria-live="polite">
      <div className={s.marca}>
        <svg className={s.anillo} viewBox="0 0 120 120" aria-hidden="true">
          <circle className={s.pista} cx="60" cy="60" r="56" />
          <circle className={s.trazo} cx="60" cy="60" r="56" />
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(logo)} alt="" className={s.logo} width={72} height={72} />
      </div>
      <p className={s.nombre} aria-hidden="true">
        {nombre}
      </p>
      <span className={s.oculto}>{aviso}</span>
    </div>
  );
}
