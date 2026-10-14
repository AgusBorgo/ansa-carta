import Link from "next/link";
import { listarLocales } from "@/lib/locales";
import s from "./inicio.module.css";

export default async function Inicio() {
  const locales = await listarLocales();
  return (
    <main className={s.inicio}>
      <p className={s.marca}>ANSE STUDIO</p>
      <h1 className={s.titulo}>Cartas digitales</h1>
      <p className={s.bajada}>Cada carta tiene su propia marca, colores y tipografía. Elegí una para verla:</p>
      <ul className={s.lista}>
        {locales.map((l) => (
          <li key={l.slug}>
            <Link href={`/${l.slug}/`} className={s.tarjeta} style={{ background: l.tema.colores.fondo, color: l.tema.colores.texto }}>
              <span className={s.muestra} style={{ background: l.tema.colores.acento }} aria-hidden="true" />
              <span className={s.nombre}>{l.nombre}</span>
              <span className={s.detalle}>{l.bajada.es}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
