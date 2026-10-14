import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Carta } from "@/components/Carta";
import { Loader } from "@/components/Loader";
import { listarSlugs, obtenerLocal } from "@/lib/locales";
import { pilaFuente, urlFuentes } from "@/lib/formato";
import { textos } from "@/lib/i18n";

type Props = { params: Promise<{ local: string }> };

// Una página por cada archivo en data/locales. Agregar un local = agregar un JSON.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listarSlugs()).map((local) => ({ local }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const local = await obtenerLocal((await params).local);
  if (!local) return {};
  return { title: `${local.nombre} · Carta`, description: local.bajada.es };
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const local = await obtenerLocal((await params).local);
  return { themeColor: local?.tema.colores.fondo };
}

export default async function PaginaLocal({ params }: Props) {
  const local = await obtenerLocal((await params).local);
  if (!local) notFound();

  const { colores, fuentes, radio } = local.tema;
  const tema = {
    "--fondo": colores.fondo,
    "--superficie": colores.superficie,
    "--texto": colores.texto,
    "--texto-suave": colores.textoSuave,
    "--acento": colores.acento,
    "--sobre-acento": colores.sobreAcento,
    "--linea": colores.linea,
    "--radio": `${radio}px`,
    "--fuente-titulos": pilaFuente(fuentes.titulos),
    "--fuente-texto": pilaFuente(fuentes.texto),
  } as CSSProperties;

  return (
    <div className="tema" style={tema}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={urlFuentes([fuentes.titulos, fuentes.texto])} precedence="default" />
      <Loader logo={local.logo} nombre={local.nombre} aviso={textos.es.cargando(local.nombre)} />
      <Carta local={local} />
    </div>
  );
}
