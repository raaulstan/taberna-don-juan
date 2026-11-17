# Operación y siguientes pasos

## Desarrollo y producción

1. Instalar con `npm ci` usando Node 24.
2. Preparar `.env.local` desde `.env.example` para desarrollo.
3. En despliegue, definir `NEXT_PUBLIC_SITE_URL` con el origen final HTTPS. Las variables públicas deben estar presentes **durante el build**; Next las integra en los recursos.
4. Ejecutar `npm run check` y `npm run test:e2e` (Chromium instalado). El runner E2E utiliza el puerto 3100 y sobrescribe sus variables con un entorno sin integraciones reales.
5. Arrancar mediante `npm start` o el adaptador oficial del proveedor compatible con Next.js 16 y Node 24.

La compilación necesita las herramientas de desarrollo de Next/TypeScript. Sharp es dependencia de producción para las subidas. El logotipo original aportado está en `public/images/logo-oficial.png`; el generador conserva sus colores/proporciones y produce los derivados web/PWA.

## PostgreSQL y Auth

Hay dos migraciones: membresías iniciales y administración con roles, CMS/catálogo, auditoría, límites y Storage. No se han aplicado a un proyecto externo ni contienen cuentas, contraseñas o seeds de demostración.

Antes de habilitar el acceso real:

- Aplicar la migración con un flujo versionado y regenerar tipos.
- Crear cuentas reales en Auth y asignar las membresías correspondientes desde administración SQL.
- Login, logout y cambio de contraseña propia están implementados en servidor. Configurar cuentas, límites y política real de Auth; los flujos de invitación/recovery con callback siguen requiriendo desarrollo/configuración específica.
- Probar identidad inválida, sesión caducada/revocada, empleado, propietario y usuario sin membresía contra Supabase real, incluidos los permisos RLS y la revocación de rol.

La base ya rechaza acceso sin configuración o identidad válida; no se fabrica una sesión de desarrollo para entrar al panel.

## Storage

La migración crea `restaurant-media`, público solo para fotos destinadas a la web. Escritura operativa por rol/carpeta, 5 MB máximo, formatos raster y validación/optimización de servidor. Detalles en `administration.md`. Antes de ampliar a otros medios decidir:

- Qué material aprobado es público y cuál privado.
- Permisos de escritura de propietario/empleado y políticas RLS de `storage.objects`.
- MIME types, límites de tamaño, dimensiones, nombres de objetos y reemplazo/eliminación.
- Si se utilizan URLs públicas optimizables con `next/image` o URLs firmadas privadas sin caché compartida.

Registrar únicamente los hosts/rutas de imágenes necesarios en `next.config.ts`.

## Resend

`sendTransactionalEmail` valida entrada en servidor y realiza un envío real cuando se invoca con configuración correcta. Ninguna pantalla lo invoca todavía. No hay endpoints abiertos para enviar correo ni respuestas de éxito simuladas. Si Resend falla o falta configuración, se devuelve un error.

Activar cuando exista un caso de uso real: verificar dominio remitente, configurar `RESEND_API_KEY` y `RESEND_FROM_EMAIL`, invocar desde una operación autorizada y comprobar entrega con una cuenta de prueba controlada. La idempotencia, los reintentos y la trazabilidad se diseñarán junto a la transacción de negocio. Las notificaciones de reservas están suspendidas y no deben implementarse sin una solicitud expresa del usuario.

## PWA

El panel tiene manifest propio, scope `/admin`, iconos adaptativos, instalación condicional y service worker privado. Solo se cachean shell genérico e iconos, nunca datos/HTML privados; offline muestra aviso y deshabilita escrituras. La web pública no registra ese worker.

El worker consulta red para navegaciones privadas y usa el shell genérico únicamente cuando falla. El resto de peticiones de datos/POST no se cachea ni reintenta offline. Logout limpia su caché y descarta estado de React mediante navegación completa. Las pruebas cubren scope, offline, contenido de caché y ausencia de control sobre la web pública; la instalación nativa real debe verificarse en dispositivos del equipo.

## Dependencias

Se seleccionó la versión estable de Next/React disponible al inicializar. ESLint permanece en **9.39.5** porque los plugins React, import y jsx-a11y incluidos en `eslint-config-next@16.4.6` todavía declaran compatibilidad hasta ESLint 9. Se comprobó ESLint 10 y se descartó por conflictos de peer dependencies. npm marca ESLint 9 como deprecado: revisar esta deuda cuando los plugins declaren compatibilidad con 10, sin forzar sus peer dependencies.

npm 12 bloqueó los scripts de instalación transitivos de `@parcel/watcher` y `@swc/core`. Build, tipos y pruebas se han completado con los binarios precompilados disponibles sin aprobar esos scripts. En otra plataforma, revisar cualquier fallo de instalación según sus paquetes nativos antes de autorizar scripts de forma indiscriminada.

## Contenido y alcance pendiente

- No se dispone de la referencia visual adjunta mencionada en el encargo; validar la dirección artística cuando se aporte.
- Revisar con la propiedad los datos de dirección, contacto, horarios y precios contrastados en la web oficial; obtener fotografías reales aprobadas, información de bebidas, alérgenos y textos legales pendientes. Véase `content-sources.md`.
- Revisar las traducciones con el restaurante.
- Home, catálogo, proveedor Supabase opcional, CMS y panel ya están implementados. Falta su activación y verificación contra servicios reales, además de bebidas/fotos/textos legales confirmados. Véase `deployment.md`.
- Mantener las reservas completamente suspendidas hasta una solicitud expresa del usuario, también en próximas fases. Conservar únicamente `/reservas` vacía, con `noindex, nofollow` y fuera del sitemap; no crear tablas, endpoints, Server Actions, notificaciones, calendarios, disponibilidad, asignación de mesas ni planos.
- ISR/invalidación y Lighthouse local están preparados; medir Core Web Vitals de campo en la infraestructura real después de desplegar.
- Confirmar los metadatos finales y enriquecer SEO local con información comprobada. No se han declarado métricas de rendimiento ni posiciones SEO no medidas.
