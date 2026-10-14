import type { NextConfig } from "next";

// EXPORT_ESTATICO=1 genera un sitio 100% estático en /out (sirve para
// hostings simples como GitHub Pages). Sin esa variable corre como app Node
// normal (Vercel, Railway, un VPS), lista para sumar un panel o una base de datos.
const estatico = process.env.EXPORT_ESTATICO === "1";
const prefijo = process.env.NEXT_PUBLIC_RAIZ || undefined;

const config: NextConfig = {
  reactStrictMode: true,
  ...(estatico ? { output: "export", trailingSlash: true } : {}),
  ...(prefijo ? { assetPrefix: prefijo } : {}),
};

export default config;
