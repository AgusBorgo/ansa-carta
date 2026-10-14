import { z } from "zod";

/**
 * Esquema de datos de un local. Cada local es un archivo JSON en
 * data/locales/<slug>.json que se valida con este esquema al compilar:
 * si falta un dato o hay un error de tipeo, el build falla con un mensaje claro
 * en vez de publicar una carta rota.
 */

export const IDIOMAS = ["es", "en"] as const;
export type Idioma = (typeof IDIOMAS)[number];

const Texto = z.object({
  es: z.string().min(1),
  en: z.string().min(1).optional(),
});
export type Texto = z.infer<typeof Texto>;

const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Usá colores hex de 6 dígitos, ej. #A4552F");
const Hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usá formato HH:MM, ej. 08:30");
const Id = z.string().regex(/^[a-z0-9-]+$/, "Usá minúsculas, números y guiones");

export const Etiqueta = z.enum(["veggie", "vegano", "sinTacc"]);
export type Etiqueta = z.infer<typeof Etiqueta>;

const Item = z.object({
  id: Id,
  nombre: Texto,
  descripcion: Texto.optional(),
  precio: z.number().int().nonnegative(),
  etiquetas: z.array(Etiqueta).default([]),
  recomendado: z.boolean().default(false),
  foto: z.string().optional(),
  /** id de otro producto que combina bien con este */
  vaBienCon: Id.optional(),
});
export type Item = z.infer<typeof Item>;

const Categoria = z.object({
  id: Id,
  nombre: Texto,
  /** en qué momentos del día aparece (ids de `momentos`) */
  momentos: z.array(Id).min(1),
  items: z.array(Item).min(1),
});
export type Categoria = z.infer<typeof Categoria>;

const Momento = z.object({
  id: Id,
  nombre: Texto,
  desde: Hora,
  /** si `hasta` es menor que `desde`, cruza la medianoche (ej. 19:00 a 02:00) */
  hasta: Hora,
});
export type Momento = z.infer<typeof Momento>;

const Fuente = z.object({
  familia: z.string().min(1),
  pesos: z.array(z.number().int()).default([400, 600, 700]),
  respaldo: z.enum(["serif", "sans-serif"]).default("sans-serif"),
});
export type Fuente = z.infer<typeof Fuente>;

const Tema = z.object({
  colores: z.object({
    fondo: Color,
    superficie: Color,
    texto: Color,
    textoSuave: Color,
    acento: Color,
    sobreAcento: Color,
    linea: Color,
  }),
  fuentes: z.object({ titulos: Fuente, texto: Fuente }),
  radio: z.number().int().min(0).max(32).default(16),
});
export type Tema = z.infer<typeof Tema>;

export const Local = z
  .object({
    slug: Id,
    nombre: z.string().min(1),
    bajada: Texto,
    logo: z.string().min(1),
    zonaHoraria: z.string().default("America/Argentina/Buenos_Aires"),
    idiomas: z.array(z.enum(IDIOMAS)).min(1).default(["es"]),
    tema: Tema,
    contacto: z
      .object({
        whatsapp: z.string().regex(/^\d{10,15}$/, "Solo números con código de país, ej. 5491112345678").optional(),
        instagram: z.string().optional(),
        resenaGoogle: z.string().url().optional(),
        direccion: z.string().optional(),
        mapa: z.string().url().optional(),
      })
      .default({}),
    horarios: z.array(z.object({ dias: z.string(), horas: z.string() })).default([]),
    momentos: z.array(Momento).min(1),
    categorias: z.array(Categoria).min(1),
  })
  .superRefine((local, ctx) => {
    const momentos = new Set(local.momentos.map((m) => m.id));
    const ids = new Set<string>();
    for (const c of local.categorias) {
      for (const m of c.momentos) {
        if (!momentos.has(m)) {
          ctx.addIssue({ code: "custom", message: `La categoría "${c.id}" usa el momento "${m}", que no existe` });
        }
      }
      for (const i of c.items) {
        if (ids.has(i.id)) ctx.addIssue({ code: "custom", message: `El producto "${i.id}" está repetido` });
        ids.add(i.id);
      }
    }
    for (const c of local.categorias) {
      for (const i of c.items) {
        if (i.vaBienCon && !ids.has(i.vaBienCon)) {
          ctx.addIssue({ code: "custom", message: `"${i.id}" combina con "${i.vaBienCon}", que no existe` });
        }
      }
    }
  });
export type Local = z.infer<typeof Local>;
