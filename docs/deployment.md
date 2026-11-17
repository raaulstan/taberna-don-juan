# Instalación y despliegue en Vercel

## Estado de esta entrega

Código y configuración preparados; **no hay despliegue, cambio de DNS, proyecto Supabase remoto ni dominio Resend verificado desde esta sesión**. Las reservas y sus correos siguen aplazados.

## Instalación local

Requisitos: Node 24 LTS y npm. OpenSSL solo es necesario para las pruebas E2E autenticadas; en Windows el runner utiliza el incluido en Git for Windows, y en Linux el ejecutable `openssl` del sistema.

```bash
npm ci
```

Copiar `.env.example` a `.env.local`. Se puede ejecutar la web pública con `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, `PUBLIC_DATA_SOURCE=local` y credenciales vacías:

```bash
npm run dev
```

Para habilitar el panel, configurar un proyecto Supabase real, aplicar las dos migraciones y dar de alta el primer propietario según `administration.md`. No existe bypass o acceso de demostración.

## Variables

| Variable | Momento y uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origen de la web; durante build y runtime. HTTPS real en producción, sin rutas |
| `NEXT_PUBLIC_ADMIN_URL` | Opcional, origen del panel. Si no se configura, se usa `/admin` y `/acceso` en la misma aplicación |
| `NEXT_PUBLIC_SUPABASE_URL` | Origen HTTPS del proyecto real; durante build y runtime |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key `sb_publishable_…`; nunca service_role o secret key |
| `PUBLIC_DATA_SOURCE` | `local` conserva snapshot, `supabase` activa publicaciones del CMS |
| `UPSTASH_REDIS_REST_URL` | Endpoint HTTPS de Redis REST compartido para límites de acceso |
| `UPSTASH_REDIS_REST_TOKEN` | Solo servidor |
| `RATE_LIMIT_SECRET` | Solo servidor, aleatoria y de al menos 32 caracteres |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Solo servidor y opcionales mientras el correo no se utilice. Ambos juntos, remitente verificado |

No copiar secretos a variables NEXT_PUBLIC, repositorio, capturas o guías. Generar la sal en una herramienta local de confianza. El proyecto no necesita una service_role key para su panel: las operaciones sensibles usan sesión y RPC con permisos explícitos.

## Proyecto Supabase

1. Elegir y documentar región, plan y política de copias reales; no se han supuesto.
2. Revisar estado/esquema existente y aplicar migraciones mediante el historial de Supabase CLI o un procedimiento controlado. Las migraciones no se deben repetir sobre tablas no versionadas sin comparar el esquema.
3. Configurar Auth para empleados: proveedor email, política de contraseña acorde al mínimo de 12 del cambio de contraseña y límites del proveedor. Deshabilitar altas públicas si el proyecto solo debe admitir cuentas del equipo. Los límites de la app no sustituyen los del endpoint público de Auth.
4. Configurar Site URL/redirect URLs del acceso autorizado. El flujo actual usa contraseña, no un callback de invitación/recovery implementado por la web.
5. Crear la cuenta real del propietario y su membresía. Probar propietario, encargado, camarero, cocina y cuenta sin rol.
6. Revisar bucket, políticas y acceso público: solo material destinado a publicación.
7. Regenerar tipos desde el esquema y revisar el diff; los tipos actuales describen las migraciones, no una introspección remota.

No se han ejecutado `db push`, restauraciones ni modificaciones sobre una DB existente. Si una migración encuentra objetos incompatibles debe detenerse y revisarse, no borrar objetos para forzarla.

## Vercel

`vercel.json` define Next.js, `npm ci` y `npm run build:vercel`. `.vercelignore` excluye salidas locales, entornos, backups, informes y certificados del fixture al subir mediante CLI. Node se fija mediante engines. En Preview se utiliza `VERCEL_URL` únicamente si no se ha configurado origen, y se bloquea indexación. En Production se valida la forma de las variables antes de compilar.

Pasos a realizar por el responsable del despliegue:

1. Importar el repositorio en un proyecto Vercel, sin reutilizar una salida `.next` de pruebas.
2. Configurar entornos separados para Preview y Production. Utilizar staging para probar mutaciones, no credenciales de producción en pruebas automáticas.
3. Ejecutar las comprobaciones y desplegar primero una Preview autorizada.
4. Añadir el dominio público y, si se desea, `admin.tabernadonjuan.com` desde la configuración de dominios. **No se ha modificado DNS.** Utilizar los valores que indique Vercel, no registros DNS inventados.
5. Verificar propiedad, certificados HTTPS y redirecciones reales antes de habilitar Production. Vercel gestiona TLS una vez validado el dominio; esta entrega no certifica que haya ocurrido.
6. Recompilar con los orígenes/variables públicos definitivos.

En el subdominio administrativo, `/` redirige a `/admin`; el panel conserva rutas `/admin/*`. Los enlaces al equipo pueden apuntar al subdominio mediante `NEXT_PUBLIC_ADMIN_URL`. El acceso en el dominio principal sigue siendo una opción temporal igualmente protegida. No se comparten cookies mediante un Domain amplio.

Las Server Actions conservan su protección de origen de Next; no se añaden allowedOrigins comodín ni se desactiva CSRF. Si se añade un reverse proxy, preservar y validar Host/HTTPS correctamente.

## Marca y contenido antes de publicación

El original aportado está en `public/images/logo-oficial.png`. `predev/prebuild` genera WebP sin pérdida, metadata, PNG social e iconos reales adaptativos. Se conserva el original y no se invierten colores ni se estiran proporciones. Si se reemplaza, reiniciar desarrollo/recompilar para regenerar todas las superficies.

Completar carta de bebidas, fotografías reales y textos legales empresariales. Las páginas legales actuales identifican expresamente su estado pendiente y no se indexan. No contienen NIF o condiciones inventadas. No hay cookies analíticas ni widgets externos automáticos; antes de incorporarlos se debe implementar consentimiento real y revisar el inventario.

## Correo

Resend dispone de un adaptador de servidor validado, pero no hay correos de reservas, recordatorios ni cron de notificaciones activos. Si se utiliza para otro caso de uso, verificar el dominio/remitente en el proveedor y configurar sus registros únicamente con autorización del titular. No se han emitido correos reales. Un ID de API representa aceptación, no entrega; cualquier seguimiento de entrega requerirá webhooks verificados e idempotentes.

## Comprobaciones

```bash
npm run check
npm run test:e2e
npm run test:admin
npm run check:production
npm run build
npm run audit:lighthouse
```

Configurar primero un SITE_URL adecuado en el entorno local para compilar. Los runners E2E generan sus propios builds con entornos aislados; no ejecutarlos simultáneamente porque comparten `.next`. **Después de `test:admin`, recompilar con el entorno real antes de auditar/desplegar**: su build usa un proveedor de pruebas HTTPS local.

`check:production` valida formato/configuración, no confirma conectividad, políticas remotas, SMTP, DNS o restauración. Sin credenciales reales debe fallar: no completar esos valores con ejemplos para obtener un resultado verde.

## Monitorización y recuperación

- `/api/health` comprueba liveness de la aplicación, sin mostrar variables ni afirmar que DB/Auth/correo estén operativos.
- `instrumentation.ts` registra digest, ruta patrón y método; no cuerpos, cookies, queries ni mensajes SQL. Los fallos operativos usan eventos/códigos controlados sin datos personales.
- Configurar alertas reales y acceso a logs en Vercel/Supabase. No se ha contratado o activado un servicio externo de alertas desde esta entrega.
- Copias y restauración: `recovery.md`.

La puesta en servicio necesita una verificación manual con servicios, cuentas y dispositivos reales. La evidencia local y sus límites están en `production-audit.md`.
