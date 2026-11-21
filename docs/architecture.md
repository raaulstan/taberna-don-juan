# Arquitectura actual: web pública con contenido local

## Alcance

Aplicación de Next.js App Router con inicio, carta gastronómica, bebidas, contacto y seis idiomas. No contiene panel administrativo, autenticación, base de datos, migraciones SQL ni acceso a almacenamiento remoto.

## Flujo de datos

```text
Archivos de carta, contacto y traducciones
  → repositorio local + validación Zod
  → getCatalog / getLocalizedCatalog
  → páginas Server Components
  → explorador cliente, filtros y fichas
```

- `src/features/menu/data/official-snapshot.ts`: 92 referencias gastronómicas.
- `src/features/menu/data/drinks-snapshot.ts`: 134 bebidas.
- `data/translations/food-*.json`: nombres y descripciones en cinco idiomas, además del original español.
- `src/features/home/data/restaurant.ts`: contacto, horarios, cierres, categorías, destacados y configuración de fotografías del inicio.
- `messages/*.json`: textos de interfaz y presentación en ES/EN/FR/RO/IT/DE.

Los registros se leen del propio proyecto. No existe variable para seleccionar un proveedor externo. Los cambios se realizan en código y se publican mediante un nuevo build.

## Renderizado e interacción

Las rutas localizadas se prerenderizan con `generateStaticParams`; sus layouts y composición son Server Components. Las islas cliente se limitan a navegación, selector de idiomas, carrusel, búsqueda/filtros, diálogos y movimiento.

`getLocalizedCatalog` mantiene el idioma solicitado y el original español en los textos del DTO. Los otros idiomas permanecen en el servidor. Los IDs, precios y datos publicados no cambian con el idioma; la búsqueda admite el nombre traducido y el original.

La ficha se carga bajo demanda. El render inicial de las animaciones es determinista, con foco, teclado, Escape y movimiento reducido. No se oculta el contenido inicial a la espera de hidratación; las cartas pueden leerse sin JavaScript.

## Imágenes y tipografía

Imágenes locales bajo `public/images`, servidas mediante `next/image`. `homeImages` permite asociar fotos propias al fondo del banner y al espacio de historia. Los productos utilizan su campo `image`; las ausencias muestran un recurso gráfico neutro.

Cormorant Garamond y Manrope se sirven desde `public/fonts` con `next/font/local`. Los logos, iconos y favicon se generan con Sharp antes de desarrollo/build.

## Rutas y configuración

- `/` redirige a `/es`.
- Inicio, `/carta`, `/bebidas` y páginas legales están disponibles bajo los seis prefijos de idioma.
- Las antiguas rutas de panel/login y sus recursos privados responden 404.
- `/reservas` permanece vacía, noindex y fuera del sitemap.
- `/api/health` devuelve únicamente el estado básico del proceso.
- El manifest público contiene nombre e iconos; no registra un service worker ni crea sesiones.

La única variable de la aplicación es `NEXT_PUBLIC_SITE_URL`. La configuración de Vercel deriva el origen para Preview cuando procede. No hay middleware de sesión ni Server Actions administrativas.

## Pruebas

Vitest comprueba datos, traducciones, proyección por idioma, precios, búsqueda, contacto y metadata. Playwright verifica escritorio/móvil, accesibilidad automatizada, ausencia de las rutas retiradas, navegación sin JS, foco y ausencia de errores de hidratación.
