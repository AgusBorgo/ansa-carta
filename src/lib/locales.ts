import { promises as fs } from "fs";
import path from "path";
import { Local } from "./schema";

const CARPETA = path.join(process.cwd(), "data", "locales");

/** Slugs de todos los locales (uno por archivo JSON). */
export async function listarSlugs(): Promise<string[]> {
  const archivos = await fs.readdir(CARPETA);
  return archivos.filter((a) => a.endsWith(".json")).map((a) => a.replace(/\.json$/, ""));
}

/** Lee y valida un local. Devuelve null si no existe; si existe pero tiene errores, corta el build. */
export async function obtenerLocal(slug: string): Promise<Local | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  let crudo: string;
  try {
    crudo = await fs.readFile(path.join(CARPETA, `${slug}.json`), "utf8");
  } catch {
    return null;
  }
  const resultado = Local.safeParse(JSON.parse(crudo));
  if (!resultado.success) {
    const errores = resultado.error.issues.map((e) => `  · ${e.path.join(".") || "(raíz)"}: ${e.message}`).join("\n");
    throw new Error(`data/locales/${slug}.json tiene errores:\n${errores}`);
  }
  if (resultado.data.slug !== slug) {
    throw new Error(`data/locales/${slug}.json: el campo "slug" tiene que ser "${slug}"`);
  }
  return resultado.data;
}

export async function listarLocales(): Promise<Local[]> {
  const slugs = await listarSlugs();
  const locales = await Promise.all(slugs.map(obtenerLocal));
  return locales.filter((l): l is Local => l !== null);
}
