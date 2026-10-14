import type { Fuente } from "./schema";

const pesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const precio = (n: number) => pesos.format(n);

/** Antepone la raíz pública (para hostings en subcarpetas) a una ruta de /public. */
export const asset = (ruta: string) =>
  /^https?:\/\//.test(ruta) ? ruta : `${process.env.NEXT_PUBLIC_RAIZ ?? ""}${ruta}`;

/** Arma el link de Google Fonts para las tipografías del local. */
export function urlFuentes(fuentes: Fuente[]): string {
  const familias = fuentes
    .filter((f, i, todas) => todas.findIndex((o) => o.familia === f.familia) === i)
    .map((f) => {
      const pesosOrdenados = [...new Set(f.pesos)].sort((a, b) => a - b).join(";");
      return `family=${encodeURIComponent(f.familia).replace(/%20/g, "+")}:wght@${pesosOrdenados}`;
    });
  return `https://fonts.googleapis.com/css2?${familias.join("&")}&display=swap`;
}

export const pilaFuente = (f: Fuente) => `'${f.familia}', ${f.respaldo}`;
