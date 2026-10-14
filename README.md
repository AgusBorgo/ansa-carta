# Cartas digitales — Anse Studio

Cartas digitales con QR para bares, cafés y restaurantes. Cada local tiene su propia marca (colores, tipografías, logo) y su carta se carga desde un archivo de datos, así que **sumar un local nuevo no requiere tocar código**.

Hecho con **Next.js 15 + React 19 + TypeScript** (corre sobre Node 20 o superior) y **Zod** para validar los datos.

## Qué tiene cada carta

- **Pantalla de carga con el logo animado** del local (≈1,3 s; más corta si el celular pide menos animación).
- **Carta según la hora**: abre sola en Desayuno, Brunch, Merienda, Noche… según la zona horaria del local. Soporta horarios que cruzan la medianoche (ej. 19 a 2 h).
- **Filtros** Veggie y Sin TACC.
- **Recomendado de la casa** y sugerencias de **"Va bien con…"**.
- **Español / inglés** con un botón.
- **Pedido para llevar por WhatsApp**: el cliente arma el pedido y se abre WhatsApp con el detalle y el total.
- **Pie con horarios, dirección y botones** para dejar reseña en Google y seguir en Instagram.
- Accesible: botones reales, objetivos táctiles de 44 px, contraste revisado.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrí http://localhost:3000 y elegí una carta. Las de ejemplo son `/cafe-almendra` y `/bodegon-lumbre`.

| Comando | Para qué |
|---|---|
| `npm run dev` | Desarrollo con recarga automática |
| `npm run build` | Compila y **valida todos los locales** |
| `npm start` | Corre la versión compilada |
| `npm run build:estatico` | Genera un sitio estático en `out/` (para GitHub Pages u otro hosting simple) |
| `npm run typecheck` | Revisa los tipos de TypeScript |

## Cómo sumar un local

1. Copiá `data/locales/cafe-almendra.json` como `data/locales/<slug>.json` (por ejemplo `heladeria-luna.json`) y cambiá el campo `"slug"` para que coincida.
2. Poné su logo en `public/locales/<slug>/logo.svg` (o .png) y, si hay, las fotos en `public/locales/<slug>/fotos/`.
3. Completá colores, tipografías (cualquiera de Google Fonts), momentos del día, categorías y productos.
4. `npm run build`. Si algo está mal (un color mal escrito, un producto repetido, una categoría que usa un momento que no existe), el build te dice exactamente qué y dónde.

La carta queda en `https://tu-dominio/<slug>`. Ese link es el que va en el QR.

### Campos útiles de cada producto

```json
{
  "id": "flat-white",
  "nombre": { "es": "Flat white", "en": "Flat white" },
  "descripcion": { "es": "Doble espresso con leche texturizada." },
  "precio": 4200,
  "etiquetas": ["veggie", "sinTacc"],
  "recomendado": true,
  "foto": "/locales/cafe-almendra/fotos/flat-white.jpg",
  "vaBienCon": "budin-almendras"
}
```

## Estructura

```
data/locales/          un JSON por local (menú + marca + contacto)
public/locales/<slug>/ logo y fotos de cada local
src/app/[local]/       la página de cada carta (aplica el tema del local)
src/components/        Loader (pantalla de carga) y Carta (la carta interactiva)
src/lib/schema.ts      el esquema que valida cada local
src/lib/horario.ts     lógica de "qué parte de la carta mostrar ahora"
src/lib/i18n.ts        textos de la interfaz en español e inglés
```

## Publicarlo

**Vercel (recomendado, gratis para empezar):** subí el repo a GitHub, entrá a vercel.com, importá el repo y listo. Cada `git push` publica los cambios.

## Subirlo a GitHub

```bash
git init
git add .
git commit -m "Primera versión de cartas digitales"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/menu-qr.git
git push -u origin main
```

## Próximos pasos para escalar

- **Base de datos** (por ejemplo Supabase o PostgreSQL con Prisma) en lugar de los JSON: el esquema de `src/lib/schema.ts` ya define la forma de los datos.
- **Panel para el local**, con login, para que cambie precios solo (o un aumento por porcentaje por categoría).
- **Estadísticas** de escaneos y productos más vistos.
- **Dominio propio** por local, o subdominio (`almendra.tudominio.com`).

> Los locales de ejemplo, sus productos, precios y direcciones son inventados. El botón de WhatsApp de las demos apunta al número de Anse Studio.
