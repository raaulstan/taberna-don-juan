# Despliegue en Vercel

## Proyecto y enlace

- Repositorio: https://github.com/raaulstan/taberna-don-juan
- Prueba pública: https://taberna-don-juan-prueba.vercel.app
- Proyecto: `rauls-projects-953cfa67/taberna-don-juan`

La aplicación es una web pública con archivos locales. No requiere base de datos, panel, cuentas del equipo, correo transaccional ni credenciales de servicios privados.

## Desarrollo

Node 24 LTS y npm:

```bash
npm ci
```

Copia `.env.example` a `.env.local` y ejecuta:

```bash
npm run dev
```

La única variable es `NEXT_PUBLIC_SITE_URL`, inicialmente `http://localhost:3000`. Para un build local:

```bash
npm run build
npm run start
```

## Preview pública

`vercel.json` configura Next.js, `npm ci` y `npm run build:vercel`. El script genera los assets y compila; en Preview deriva `NEXT_PUBLIC_SITE_URL` de `VERCEL_URL` si no se ha definido un origen. Las previews llevan `noindex`.

```bash
npx vercel login
npx vercel deploy --yes --project taberna-don-juan --environment preview
```

Cuando el despliegue esté listo, actualiza el alias:

```bash
npx vercel alias set NUEVA_URL taberna-don-juan-prueba.vercel.app --scope rauls-projects-953cfa67
```

El enlace compartido debe comprobarse desde un contexto sin iniciar sesión en Vercel. La prueba actual utiliza acceso público; la protección de la plataforma se configura desde el proyecto de Vercel.

## Production

Configura `NEXT_PUBLIC_SITE_URL` con el origen HTTPS definitivo, sin rutas, consultas ni credenciales. `npm run check:production` valida ese formato. No comprueba propiedad del dominio ni configura DNS.

Después publica el entorno de producción desde Vercel. El proyecto no aplica cambios de DNS automáticamente.

## Cambios de contenido

La carta se edita en `src/features/menu/data`, las traducciones en sus JSON y `messages`, y el contacto/imágenes del inicio en `src/features/home/data/restaurant.ts`. Tras editar hay que comprobar y volver a desplegar.

Los assets deben estar bajo `public/`. `.vercelignore` y `.gitignore` excluyen entornos, cachés, informes, dependencias instaladas y archivos del editor.

## Comprobaciones

```bash
npm run check
npm run test:e2e -- --workers=4
```

Los builds y runners deben ejecutarse secuencialmente porque utilizan `.next`. No se usa una suite administrativa ni un proveedor de pruebas de base de datos.

Después de desplegar, comprobar inicio, ambos catálogos, idiomas, imágenes/iconos y los HTTP 404 de `/admin` y `/acceso`.
