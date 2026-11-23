# Taberna Don Juan

Web pública del restaurante **Taberna Don Juan**, en Málaga: carta de comida y bebidas, seis idiomas y diseño responsive.

**Web de prueba:** https://taberna-don-juan-prueba.vercel.app

**Repositorio:** https://github.com/raaulstan/taberna-don-juan

## Estado actual

La aplicación funciona **exclusivamente con archivos locales**, sin base de datos ni panel de administración. Los productos, traducciones, fotografías y datos de contacto se mantienen desde el código y se publican mediante un nuevo despliegue.

La sección de información legal y sus páginas se han retirado por petición del usuario. El pie conserva marca, contacto, navegación y redes sociales.

- **92 platos** y **134 bebidas** con sus precios.
- Español, inglés, francés, rumano, italiano y alemán.
- Nombres y descripciones de platos traducidos; bebidas traducidas conservando marcas y nombres propios.
- Búsqueda por texto traducido o español, categorías/secciones y modos compacto/visual.
- Fichas accesibles con precio, fotografía o espacio gráfico y alérgenos publicados.
- Navbar transparente/claro al hacer scroll, también en móvil; menú y selector de idiomas animados.
- Contacto, horarios, Maps y redes sociales.
- SEO localizado, fuentes locales, imágenes optimizadas y contenido legible sin JavaScript.

Las antiguas rutas `/admin`, `/acceso` y los recursos privados se han eliminado y responden 404. Las reservas siguen suspendidas: `/reservas` permanece vacía, noindex y fuera del sitemap.

## Stack

| Área | Tecnología |
| --- | --- |
| Aplicación | Next.js 16.4.6, App Router y React 19.3.1 |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS 4, variables CSS y componentes Radix/shadcn |
| Movimiento | Motion for React y Lucide |
| Idiomas | next-intl, diccionarios locales |
| Tipografía | Cormorant Garamond y Manrope mediante `next/font/local` |
| Imágenes | `next/image` y Sharp |
| Validación del catálogo | Zod |
| Pruebas | Vitest, Playwright y axe-core |
| Despliegue | Vercel |

No hay servicios de autenticación, almacenamiento remoto de datos, correo transaccional ni código de acceso del equipo en esta versión.

## Requisitos e instalación

- Node.js **24 LTS**, indicado en `.nvmrc` y `package.json`.
- npm y Git.

```bash
git clone https://github.com/raaulstan/taberna-don-juan.git
cd taberna-don-juan
npm ci
```

Copia `.env.example` a `.env.local`:

```bash
# macOS / Linux
cp .env.example .env.local
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

La única variable de configuración de la aplicación es el origen de la web:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

Abre http://localhost:3000. La raíz redirige a `/es`.

Para servir un build de producción local:

```bash
npm run build
npm run start
```

## Rutas e idiomas

`{locale}` admite `es`, `en`, `fr`, `ro`, `it` y `de`.

| Ruta | Contenido |
| --- | --- |
| `/` | Redirección a `/es` |
| `/{locale}` | Inicio, título de pestaña «Taberna Don Juan» |
| `/{locale}/carta` | Carta gastronómica |
| `/{locale}/bebidas` | Carta de bebidas |
| `/api/health` | Estado básico de la aplicación |
| `/sitemap.xml`, `/robots.txt` | SEO técnico |
| `/manifest.webmanifest` | Nombre e iconos de la web para dispositivos |
| `/reservas` | Ruta vacía, noindex |

El selector conserva la ruta y el hash de categoría/producto. El navegador recibe únicamente el idioma elegido y el texto original español para búsqueda, sin cargar todos los diccionarios de productos.

## Editar el contenido

| Contenido | Archivo |
| --- | --- |
| Platos, precios, categorías y alérgenos | `src/features/menu/data/official-snapshot.ts` |
| Bebidas y precios | `src/features/menu/data/drinks-snapshot.ts` |
| Traducciones de platos | `src/features/menu/data/translations/food-{en,fr,ro,it,de}.json` |
| Ampliación editorial breve de las descripciones | `src/features/menu/data/description-additions.ts` |
| Traducciones de bebidas | `src/features/menu/data/product-translations.ts` |
| Traducciones de categorías | `src/features/menu/data/category-translations.ts` |
| Textos de la interfaz y del inicio | `messages/{locale}.json` |
| Dirección, teléfonos, redes, horarios y cierres | `src/features/home/data/restaurant.ts` |
| Fotografías de banner e historia | `homeImages` en `restaurant.ts` |
| Archivos de fotografías | `public/images/` |
| Estilos públicos | `src/app/public-design.css` |

Los precios se guardan en **céntimos enteros de EUR**: por ejemplo, `350` representa 3,50 €. Los IDs de producto deben mantenerse estables para conservar los enlaces compartidos. Al añadir un plato o cambiar su identificador, completa su entrada en los cinco diccionarios de traducción; las pruebas comprueban la cobertura.

Las descripciones publicadas combinan la transcripción original con una frase editorial breve en cada idioma, sin añadir ingredientes ni datos de preparación no confirmados. Las tarjetas muestran como máximo dos líneas y las fichas permiten leer el texto completo.

Para asociar una imagen a un producto:

```ts
image: {
  src: "/images/foto-del-plato.webp",
  alt: {
    es: "Texto alternativo en español",
    en: "Alternative text in English"
    // Completar los demás idiomas que correspondan.
  }
}
```

Las rutas de imagen son locales, bajo `/images/`. El banner utiliza una única fotografía de fondo, sin recuadro lateral. Mientras no haya foto configurada, se muestra su espacio gráfico. No se deducen ingredientes, alérgenos ni disponibilidad a partir de una traducción.

Después de editar, ejecuta las comprobaciones y publica una nueva versión.

## Estructura

```text
.github/workflows/       Integración continua
docs/                   Arquitectura, contenido y despliegue
messages/               Interfaz en seis idiomas
public/                 Imágenes, fuentes, favicon e iconos
scripts/                Assets, validación y auditorías
src/
  app/                  Páginas públicas, metadata y estilos
  components/           Layout, movimiento y UI
  config/               Origen, fuentes, marca e iconos
  features/home/        Inicio y carrusel
  features/menu/        Catálogo local, traducciones y filtros
  i18n/                 Configuración de idiomas
  lib/                  SEO y utilidades
  services/             Lectura de datos locales
tests/                  Pruebas unitarias y de navegador
```

## Diseño y favicon

- Fuentes WOFF2 locales con sus licencias en `public/fonts/`.
- Logo original en `public/images/logo-oficial.png`, con derivados transparentes claro/oscuro del mismo tamaño.
- Favicon desde `public/images/brand.webp`: ICO de 16/32/48 px en `/favicon.ico` y PNG de 64 px.
- Generación reproducible mediante `npm run assets:icons`, ejecutada automáticamente antes de desarrollo/build.
- Animaciones con soporte de movimiento reducido y render inicial consistente entre servidor y navegador.
- Descripciones en las fichas de comida; las bebidas usan una presentación simplificada, sin sección de descripción ni ingredientes.

## Comandos y pruebas

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint sin warnings |
| `npm run typecheck` | Tipos de Next y TypeScript |
| `npm test` | Pruebas unitarias |
| `npm run test:coverage` | Cobertura V8 |
| `npm run test:e2e:install` | Instalar Chromium |
| `npm run test:e2e -- --workers=4` | Suite de navegador |
| `npm run check` | Lint, tipos, pruebas y build |
| `npm run check:production` | Validar el origen HTTPS de publicación |
| `npm run audit:lighthouse -- /es /es/carta /es/bebidas` | Auditoría desktop |
| `npm run audit:lighthouse -- --mobile /es /es/carta /es/bebidas` | Auditoría móvil simulada |

Playwright comprueba los seis idiomas, lectura sin JavaScript, productos/precios, búsqueda, foco, carrusel, navbar, menú móvil, hidratación, accesibilidad y responsive. También verifica que las antiguas rutas privadas respondan 404 y que no se creen sesiones ni se registre el antiguo service worker.

No ejecutes builds/runners E2E a la vez: comparten `.next`. Los informes se guardan localmente y están excluidos de Git. La CI se encuentra en `.github/workflows/ci.yml`.

Validación de la versión pública: **29 unitarias y 123 E2E correctas**, con una omisión prevista del swipe desktop. Lint, TypeScript y build correctos.

## Despliegue en Vercel

`vercel.json` configura Next.js, `npm ci` y `npm run build:vercel`. En Preview, el script usa `VERCEL_URL` para el origen si no está configurado `NEXT_PUBLIC_SITE_URL`, y la web se publica con `noindex`.

```bash
npx vercel login
npx vercel deploy --yes --project taberna-don-juan --environment preview
```

Para actualizar el enlace de prueba, usa la URL devuelta por el despliegue:

```bash
npx vercel alias set URL_DEL_DESPLIEGUE taberna-don-juan-prueba.vercel.app --scope rauls-projects-953cfa67
```

Para Production, configura `NEXT_PUBLIC_SITE_URL` con el origen HTTPS definitivo. No se requieren credenciales de base de datos ni servicios privados.

## Reservas

Las reservas siguen suspendidas. `/reservas` no contiene interfaz ni funcionalidad, utiliza `noindex, nofollow` y no aparece en el sitemap. Sus requisitos aplazados están en [deferred-reservations.md](docs/deferred-reservations.md).

## Documentación

- [Arquitectura](docs/architecture.md)
- [Carta y traducciones](docs/menu-data.md)
- [Despliegue](docs/deployment.md)
- [Verificación](docs/verification.md)
- [Estado visual](docs/visual-refresh.md)
- [Procedencia del contenido](docs/content-sources.md)
- [Auditoría técnica](docs/production-audit.md)

Los archivos de entorno, artefactos de pruebas y configuración local del editor están excluidos del repositorio. Las fotografías propias se incorporan cuando las facilite el restaurante.
