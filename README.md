# Taberna Don Juan

Web de **Taberna Don Juan**, en Málaga, con carta de comida y bebidas, seis idiomas y panel privado para el equipo del restaurante.

Diseñada con una estética editorial cálida, navegación accesible y una arquitectura que prioriza el contenido renderizado en servidor y la carga rápida.

**Repositorio:** [raaulstan/taberna-don-juan](https://github.com/raaulstan/taberna-don-juan).

**Prueba pública:** [taberna-don-juan-prueba.vercel.app](https://taberna-don-juan-prueba.vercel.app).

La prueba está desplegada en Vercel como **Preview**, con el catálogo local y acceso público sin iniciar sesión. Puede abrirse desde ordenador, móvil y tablet.

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Requisitos e instalación](#requisitos-e-instalación)
- [Rutas e idiomas](#rutas-e-idiomas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Carta y gestión de contenido](#carta-y-gestión-de-contenido)
- [Panel privado y permisos](#panel-privado-y-permisos)
- [Diseño, imágenes y favicon](#diseño-imágenes-y-favicon)
- [Pruebas y calidad](#pruebas-y-calidad)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Estado de reservas](#estado-de-reservas)
- [Documentación adicional](#documentación-adicional)

## Funcionalidades

### Web pública

- Inicio con banner, selección de especialidades, categorías, historia y contacto.
- **92 referencias gastronómicas** y **134 referencias de bebidas**.
- Búsqueda sin distinguir acentos o mayúsculas, filtros por categoría/sección y resultados vacíos.
- Vista compacta inicial y vista visual opcional, sin duplicar productos ni URLs.
- Fichas de producto con precio, espacio de fotografía y alérgenos publicados. Las bebidas utilizan una ficha simplificada, sin descripción ni ingredientes.
- Carrusel con botones, teclado, indicadores y gestos táctiles.
- Navbar transparente sobre el banner y claro al hacer scroll, también en móvil, con cambio de logo y transición suave.
- Menú móvil con apertura/cierre animados, Escape, cierre exterior y soporte de movimiento reducido.
- Selector desplegable en **español, inglés, francés, rumano, italiano y alemán**.
- Idioma, canonical, hreflang, sitemap y Open Graph localizados.
- Teléfono, dirección, horarios, Maps y redes sociales del restaurante.
- Lectura de las cartas y navegación básica disponibles sin JavaScript.

### Panel del equipo

- Login y logout con Supabase Auth, verificación de membresía activa y permisos en servidor.
- Categorías/subcategorías, platos, bebidas, fotografías, textos y datos de contacto.
- Gestión de perfiles del equipo, auditoría y cambio de contraseña propia.
- Publicación de contenido con control de versiones y detección de cambios concurrentes.
- PWA privada con una pantalla offline genérica; las respuestas privadas no se guardan en Cache Storage.

La web pública funciona con los datos locales sin conectar servicios externos. El panel requiere un proyecto Supabase real y la configuración descrita más abajo.

## Stack

| Área | Tecnología |
| --- | --- |
| Aplicación | Next.js **16.4.6**, App Router, React **19.3.1** |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS 4, variables CSS, componentes shadcn/Radix |
| Tipografía | Cormorant Garamond y Manrope locales mediante `next/font/local` |
| Interacción | Motion for React y Lucide |
| Idiomas | next-intl |
| Formularios y validación | React Hook Form y Zod 4 |
| Persistencia y acceso | Supabase PostgreSQL, Auth, Storage y `@supabase/ssr` |
| Imágenes | `next/image` y Sharp |
| Correo preparado | Resend, sin flujos de reservas activos |
| Pruebas | Vitest, Playwright, axe-core y PostgreSQL embebido con PGlite |
| Auditoría de carga | Lighthouse |
| Despliegue | Vercel |

Las versiones resueltas están fijadas en `package-lock.json`. Los layouts y la composición pública son Server Components; la interacción se limita a islas cliente.

## Requisitos e instalación

- **Node.js 24 LTS**, indicado en `.nvmrc` y `package.json`.
- npm; el lockfile se ha generado con npm 12.
- Git para clonar el repositorio.
- OpenSSL solo para la suite autenticada del panel. El runner utiliza el incluido en Git for Windows o el del sistema en Linux.

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

Para usar exclusivamente la web pública local basta con:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PUBLIC_DATA_SOURCE=local
```

Deja vacías las variables de las integraciones que no estén configuradas.

```bash
npm run dev
```

Abre <http://localhost:3000>. La raíz redirige al idioma predeterminado, `/es`.

### Compilación local de producción

```bash
npm run build
npm run start
```

`NEXT_PUBLIC_SITE_URL` debe estar definido también al compilar. La generación del logo y los iconos se ejecuta automáticamente antes de desarrollo/build.

## Rutas e idiomas

`{locale}` puede ser `es`, `en`, `fr`, `ro`, `it` o `de`.

| Ruta | Contenido |
| --- | --- |
| `/` | Redirección a `/es` |
| `/{locale}` | Inicio; título de pestaña **Taberna Don Juan** |
| `/{locale}/carta` | Gastronomía: 92 referencias |
| `/{locale}/bebidas` | Bebidas: 134 referencias en seis categorías |
| `/{locale}/legal/privacidad` | Información de privacidad, noindex |
| `/{locale}/legal/cookies` | Información de cookies, noindex |
| `/{locale}/legal/aviso-legal` | Información legal, noindex |
| `/acceso` | Acceso del equipo |
| `/admin` | Resumen privado |
| `/admin/carta`, `/admin/categorias` | Gestión del catálogo |
| `/admin/contenido` | Textos, contacto, imágenes y horarios |
| `/admin/empleados`, `/admin/auditoria` | Gestión del propietario |
| `/admin/cuenta` | Contraseña propia |
| `/admin/manifest.webmanifest` | Manifest de la PWA privada |
| `/api/health` | Estado básico del proceso, sin datos de configuración |
| `/sitemap.xml`, `/robots.txt` | SEO técnico |
| `/manifest.webmanifest` | Manifest público |
| `/reservas` | Ruta vacía y noindex; funcionalidad suspendida |

El selector conserva la ruta y el fragmento de categoría/producto al cambiar de idioma. Los diccionarios se cargan en servidor; no se envían al navegador las seis traducciones completas a la vez.

La interfaz, las categorías y los **92 nombres/descripciones de la carta local** están traducidos a los seis idiomas. Las denominaciones genéricas de bebidas también cambian de idioma; las marcas y nombres propios conservan su grafía. La búsqueda acepta el texto traducido y el original español. Cada página recibe únicamente el idioma solicitado y el original, sin enviar las otras traducciones al navegador.

## Estructura del proyecto

```text
.github/workflows/       Integración continua
docs/                   Guías técnicas, operativas y de verificación
messages/               Diccionarios de los seis idiomas
public/
  fonts/                Tipografías locales y licencias
  images/               Logos y recursos gráficos
  icons/                Iconos generados
  favicon.ico           Favicon multirresolución generado
scripts/                Generación de assets, auditorías y comprobaciones
src/
  app/                  Rutas públicas, privadas, metadata y estilos
  components/           Layout, UI y componentes de movimiento
  config/               Marca, iconos, entorno, fuentes y movimiento
  features/
    home/               Inicio y carrusel de especialidades
    menu/               Datos, validación, búsqueda, tarjetas y fichas
    admin/              Formularios, permisos y gestión del equipo/CMS
  i18n/                 Idiomas y carga de diccionarios
  lib/                  Supabase, SEO y utilidades
  services/             Proveedores públicos y repositorios
  types/                Contratos TypeScript y base de datos
supabase/migrations/    Esquema, RLS y RPC versionados
tests/                  Unitarias, integración y E2E
```

## Variables de entorno

| Variable | Ámbito | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Pública | Origen completo sin rutas; canonical, sitemap y metadata |
| `NEXT_PUBLIC_ADMIN_URL` | Pública | Origen opcional del panel administrativo |
| `PUBLIC_DATA_SOURCE` | Servidor | `local` por defecto o `supabase` para publicaciones del CMS |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Origen HTTPS del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pública | Clave publicable `sb_publishable_…` |
| `UPSTASH_REDIS_REST_URL` | Servidor | Redis REST compartido para límites de acceso |
| `UPSTASH_REDIS_REST_TOKEN` | Servidor | Credencial de Redis |
| `RATE_LIMIT_SECRET` | Servidor | Sal privada aleatoria de al menos 32 caracteres |
| `RESEND_API_KEY` | Servidor | Adaptador de correo, si se utiliza |
| `RESEND_FROM_EMAIL` | Servidor | Remitente de dominio verificado, si se utiliza correo |

Las dos variables de Supabase se configuran juntas. La ausencia total permite el modo local; una configuración parcial o inválida falla explícitamente. No se utiliza `service_role` en el panel.

Los archivos `.env*`, salvo `.env.example`, están excluidos de Git. No se incluyen tokens, entornos de prueba locales, certificados del fixture ni salidas `.next` en el repositorio.

## Carta y gestión de contenido

### Fuente local

Con `PUBLIC_DATA_SOURCE=local`:

- Gastronomía: `src/features/menu/data/official-snapshot.ts`.
- Bebidas: `src/features/menu/data/drinks-snapshot.ts`.
- Categorías traducidas: `src/features/menu/data/category-translations.ts`.
- Traducciones de platos: `src/features/menu/data/translations/food-{en,fr,ro,it,de}.json`.
- Composición de traducciones y nombres de bebidas: `src/features/menu/data/product-translations.ts`.
- Contacto base: `src/features/home/data/restaurant.ts`.

Las bebidas proceden de las seis imágenes facilitadas para el proyecto. Se conservan formatos con precios distintos y se unifican únicamente las repeticiones idénticas de Pernod y Grand Marnier Amarillo.

Los importes se almacenan en céntimos enteros de EUR. No se deducen ingredientes, alérgenos, medidas ni disponibilidad. Zod valida la integridad y evita identificadores duplicados, productos huérfanos o mezclas con la demostración.

### Fuente Supabase

`getCatalog()` selecciona el proveedor sin acoplar la interfaz a Supabase. Para activar el CMS:

1. Configura Supabase y aplica las migraciones revisadas.
2. Da de alta el primer propietario.
3. Crea y publica categorías, productos y contenidos reales.
4. Configura `PUBLIC_DATA_SOURCE=supabase` y recompila.

La activación del proveedor no importa automáticamente el snapshot ni mezcla publicaciones remotas con datos locales. Las lecturas públicas usan un cliente anónimo sin cookies, con revalidación de cinco minutos e invalidación por tags tras las mutaciones.

## Panel privado y permisos

| Rol | Permisos |
| --- | --- |
| `owner` | Carta, contenidos, empleados, auditoría y cuenta propia |
| `manager` | Carta, contenidos, indicadores del catálogo y cuenta propia |
| `waiter` | Resumen de acceso y cuenta propia |
| `kitchen` | Resumen de acceso y cuenta propia |
| `employee` | Rol legado restringido |

Las páginas y las acciones verifican identidad, actividad y permisos. Las RPC vuelven a validar los permisos en SQL y registran auditoría atómica; no se permiten escrituras directas de clientes en las tablas administrativas.

El acceso utiliza cookies de servidor HttpOnly, SameSite=Lax y Secure en producción. No existe usuario de demostración ni autoasignación de propietarios. Sin configuración Supabase, `/admin` redirige a `/acceso?motivo=configuracion`.

Migraciones:

1. `supabase/migrations/20261116000100_staff_members.sql`.
2. `supabase/migrations/20261117000200_administration.sql`.

El propietario inicial se asigna a una cuenta real de Supabase Auth siguiendo [administration.md](docs/administration.md). El panel gestiona el acceso de cuentas Auth existentes.

Las fotografías públicas se guardan en `restaurant-media`. Las subidas validan formato, firma, tamaño y rol; Sharp optimiza los archivos y elimina metadatos.

## Diseño, imágenes y favicon

- Estilos generales: `src/app/globals.css`.
- Dirección visual pública: `src/app/public-design.css`.
- Fuentes locales: `src/config/fonts.ts` y `public/fonts/`.
- Logo original conservado: `public/images/logo-oficial.png`.
- Derivados transparentes claro/oscuro con dimensiones equivalentes para evitar saltos al hacer scroll.
- Favicon basado en **`public/images/brand.webp`**: ICO de 16/32/48 px en `/favicon.ico`, con URL versionada; también se genera PNG de 64 px.

```bash
npm run assets:icons
```

Las fotografías ambientales anteriores no se muestran en la composición local actual. Las zonas de categorías, historia y productos quedan preparadas para fotografías propias. El banner reserva una única imagen de fondo completa, con la etiqueta «Espacio para fotografía» y sin recuadro lateral.

Las animaciones respetan `prefers-reduced-motion`. El carrusel utiliza valores iniciales deterministas para que el HTML del servidor coincida con el primer render del navegador y no produzca avisos de hidratación.

## Pruebas y calidad

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción y generación previa de assets |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint, sin warnings permitidos |
| `npm run typecheck` | Generación de tipos de Next y TypeScript |
| `npm test` | Pruebas unitarias/integración |
| `npm run test:coverage` | Cobertura V8 |
| `npm run test:e2e:install` | Instalar Chromium de Playwright |
| `npm run test:e2e` | Suite pública en producción local |
| `npm run test:admin` | Suite autenticada con fixture HTTPS/PostgreSQL |
| `npm run check` | Lint, tipos, unitarias y build |
| `npm run check:production` | Validar la configuración de producción |
| `npm run audit:lighthouse -- /es /es/carta /es/bebidas` | Auditoría desktop local |
| `npm run audit:lighthouse -- --mobile /es /es/carta /es/bebidas` | Auditoría móvil simulada |

Playwright comprueba escritorio y emulación móvil, lectura sin JavaScript, seis idiomas, filtros, foco, teclado, swipe, diálogos, navbar, menú animado y accesibilidad automatizada con axe. La matriz responsive principal comprende 320, 375, 430, 768, 1024, 1440 y 1920 px.

Los runners E2E construyen y sirven la aplicación con entornos aislados. **No ejecutes builds/runners simultáneamente:** comparten `.next`. La suite administrativa utiliza 3310/3344 y un proveedor exclusivo de pruebas. Recompila con el entorno de despliegue después de ejecutarla.

La CI está en `.github/workflows/ci.yml` y ejecuta comprobaciones, cobertura y ambas suites E2E.

### Resultados locales registrados

- **77 pruebas unitarias/integración correctas** tras completar las traducciones del catálogo.
- **121 E2E públicas correctas y una omisión prevista** del swipe desktop; el gesto sí se ejecuta en móvil. La ejecución final se realiza con `npm run test:e2e -- --workers=4`.
- Tras corregir la hidratación y el título, 47 E2E afectadas correctas y la misma omisión prevista, incluyendo captura de errores de hidratación en consola.
- Lighthouse local de inicio, comida y bebidas: **100 rendimiento / 100 accesibilidad / 100 buenas prácticas / 100 SEO**, tanto desktop como móvil simulado, con CLS 0.

Son resultados de laboratorio, no métricas de usuarios reales ni una certificación del alojamiento definitivo. Los informes y condiciones están documentados en [verification.md](docs/verification.md).

## Despliegue en Vercel

La configuración está en `vercel.json`:

- Framework: Next.js.
- Instalación: `npm ci`.
- Build: `npm run build:vercel`.
- Node.js: 24.

### Prueba pública / Preview

Despliegue verificado el **17/11/2026**:

- URL para compartir: <https://taberna-don-juan-prueba.vercel.app>.
- Proyecto: `taberna-don-juan`, en el espacio `rauls-projects-953cfa67`.
- Build remoto Next.js/TypeScript correcto, con `PUBLIC_DATA_SOURCE=local`.
- Acceso comprobado sin cookies ni sesión de Vercel: inicio, cartas, selector de idiomas, navbar/menú móvil y favicon.
- No requiere conexión a la red local ni mantener encendido el servidor de desarrollo.

Para crear nuevas previews del proyecto existente:

```bash
npx vercel login
npx vercel deploy --yes --project taberna-don-juan --environment preview --build-env PUBLIC_DATA_SOURCE=local --env PUBLIC_DATA_SOURCE=local
```

Para que el enlace corto apunte a una preview nueva, sustituye `URL_DEL_DESPLIEGUE` por la URL devuelta por Vercel:

```bash
npx vercel alias set URL_DEL_DESPLIEGUE taberna-don-juan-prueba.vercel.app --scope rauls-projects-953cfa67
```

#### Configuración inicial en otra cuenta

1. Importa `raaulstan/taberna-don-juan` en Vercel o enlaza el directorio con Vercel CLI.
2. Usa el entorno **Preview** y `PUBLIC_DATA_SOURCE=local` para revisar la web sin integrar servicios privados.
3. Si no defines `NEXT_PUBLIC_SITE_URL`, el script de preview utiliza `https://VERCEL_URL` proporcionado por Vercel.
4. Comprueba el acceso público del enlace antes de compartirlo: una preview con protección de Vercel puede solicitar login.

```bash
npx vercel login
npx vercel
```

Las previews se generan con `noindex`. `.vercelignore` excluye entornos, resultados de pruebas y archivos de trabajo locales.

### Producción

Configura el origen HTTPS definitivo y las integraciones requeridas. El script de build ejecuta la validación de producción antes de compilar; con servicios sin configurar debe fallar explícitamente.

La configuración del proyecto no aplica migraciones, crea empleados, cambia DNS ni registra dominios automáticamente. Para la puesta en servicio del panel sigue [deployment.md](docs/deployment.md) y [administration.md](docs/administration.md).

## Estado de reservas

Las reservas están **suspendidas**. `/reservas` permanece completamente vacía, sin cabecera, pie, formulario ni acciones, con `noindex, nofollow` y fuera del sitemap.

No hay disponibilidad de mesas, asignaciones, calendarios, pedidos ni notificaciones de reservas activos. Los requisitos aplazados se conservan en [deferred-reservations.md](docs/deferred-reservations.md); no constituyen trabajo pendiente automático.

## Documentación adicional

| Documento | Contenido |
| --- | --- |
| [architecture.md](docs/architecture.md) | Arquitectura, módulos y renderizado |
| [visual-refresh.md](docs/visual-refresh.md) | Estado visual actual, idiomas y navegación |
| [menu-data.md](docs/menu-data.md) | Datos, transcripción y proveedores de la carta |
| [administration.md](docs/administration.md) | Roles, persistencia, RLS, RPC y primer propietario |
| [deployment.md](docs/deployment.md) | Vercel, variables, dominios y servicios |
| [verification.md](docs/verification.md) | Comprobaciones ejecutadas y alcance |
| [production-audit.md](docs/production-audit.md) | Auditoría técnica y servicios externos |
| [owner-guide.md](docs/owner-guide.md) | Guía para el propietario |
| [employee-guide.md](docs/employee-guide.md) | Guía para el equipo |
| [recovery.md](docs/recovery.md) | Copias y recuperación |
| [operations.md](docs/operations.md) | Operación, integraciones y PWA |
| [content-sources.md](docs/content-sources.md) | Procedencia del contenido |
| [premium-redesign.md](docs/premium-redesign.md) | Historial del rediseño editorial |
| [visual-polish.md](docs/visual-polish.md) | Interacciones y responsive |

Las licencias de las tipografías se conservan junto a los archivos en `public/fonts/`. No se atribuye una licencia de redistribución genérica al contenido gráfico o comercial del restaurante.
