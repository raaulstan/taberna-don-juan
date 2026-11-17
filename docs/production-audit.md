# Informe técnico de preparación para producción

Fecha: **17/11/2026**. Entorno local: Windows, Node 24.21.0, npm 12.2.2, Next.js 16.4.6. No se ha desplegado sobre el dominio real ni modificado DNS.

## Resultado ejecutivo

Web pública, panel, migraciones, PWA privada y configuración Vercel implementados y comprobados localmente. **La puesta en servicio no está verificada:** faltan servicios/credenciales reales, aplicar y comprobar migraciones en staging, datos empresariales/legal y ensayos externos de recuperación/dispositivos.

Las reservas, mesas y sus correos están expresamente aplazados. No se han creado tablas, formularios, calendarios o confirmaciones de ese módulo, ni se afirma haber ejecutado sus pruebas de disponibilidad/concurrencia/DST.

## Problemas detectados y correcciones

| Hallazgo | Corrección aplicada | Evidencia |
| --- | --- | --- |
| Login y panel solo tenían estructura informativa | Auth por Server Actions, roles activos, CRUD, CMS, equipo, auditoría y cuenta propia | E2E autenticadas con protocolo HTTPS y PostgreSQL embebido |
| Autorización inicial limitada a roles antiguos | Matriz propietario/encargado/camarero/cocina, legado restringido, guard por página/acción y comprobación SQL independiente | Unitarios, RLS/GRANT/RPC y pruebas de rol en navegador |
| Riesgo de sobreescritura/reintento de una creación | UUID estable, versión comparada bajo bloqueo y conflicto explícito; auditoría en la misma transacción | Dos escrituras con igual versión permiten una sola |
| Desactivar al último propietario bloquearía la administración | RPC exclusiva del propietario y bloqueo transaccional de cambios de acceso | SQL rechaza la pérdida del último propietario activo |
| Interacción temprana con checkbox antes de hidratar podía perder la intención de desactivar | Valores SSR de checkbox y controles de mutación bloqueados hasta hidratar | E2E desactiva, verifica persistencia y rechaza el siguiente login |
| El feedback de una eliminación rechazada quedaba detrás del diálogo | Error también dentro de la confirmación accesible | Borrado de categoría en uso informa sin cerrar ni fingir éxito |
| El scope `/admin/` no cubría la URL de inicio `/admin` | Scope `/admin` y header Service-Worker-Allowed específico | Navegación offline real a `/admin`, manifest e instalabilidad Chrome |
| Posibilidad de cachear respuestas privadas en una PWA genérica | Worker separado, red sin store para navegaciones privadas, caché limitada a shell e iconos, sin POST/RSC/API | Inspección Cache Storage y limpieza tras logout |
| Cookies de sesión necesitaban atributos explícitos | HttpOnly, Secure en producción, SameSite=Lax, host-only; Auth de servidor | Browser verifica flags y ausencia de token en document.cookie |
| Acceso expuesto a intentos repetidos | Redis compartido en producción, HMAC y TTL; límites SQL de escritura y de media antes de decodificar | Unitarios de límites, rechazo por configuración ausente y pruebas SQL |
| Subidas podían confiar solo en MIME | Firma raster, formatos reales, tamaño/píxeles limitados, conversión WebP y stripping de metadatos; SVG no admitido | Subida PNG en navegador y políticas Storage/actor en PostgreSQL |
| Error de precedencia JSONB al validar el CMS | Paréntesis explícitos antes de restar el array de campos permitidos | Test con documento CMS válido y guardado/relectura en navegador |
| Cabecera/branding usaban una identidad provisional | Original aportado, WebP sin pérdida, dimensiones reservadas, iconos y PNG social | Logo renderizado sin filtros, proporciones y PNG Open Graph HTTP 200 |
| Contacto/footer/SEO necesitaban cierre de navegación | Indicaciones Google Maps, contacto publicado, enlaces legales reales, copyright, OG por idioma y preview noindex | E2E de enlaces, metadata, idiomas y ausencia de widgets/rastreadores |
| No había guías de operación/despliegue/recuperación | Configuración Vercel, validador de variables, guías de propietario/equipo y runbook | Archivos de documentación y guard de producción ejecutado |

No se han eliminado pruebas para conseguir resultados verdes. Los informes generados de Playwright/Lighthouse y certificados del fixture se excluyen del lint; el código y las pruebas siguen bajo ESLint estricto. Los selectores E2E privados respetan elementos visibles porque Next transmite segmentos SSR ocultos; se comprueba además que no existan errores de página/hidratación.

## Verificaciones ejecutadas

| Comando/comprobación | Resultado real |
| --- | --- |
| `npm run check` | Correcto: lint sin warnings, tipos, 70 pruebas unitarias/integración y build |
| `npm run test:e2e` | 71 correctas, 1 omitida por diseño (swipe desktop; móvil ejecutado) |
| `npm run test:admin` | 6 correctas; login/permisos/CRUD/media/CMS/empleados/password/offline/responsive |
| Migraciones PostgreSQL | Aplicadas en PGlite efímero, con RLS/constraints/roles y RPC reales; Auth/Storage gestionados se representan con esquemas de prueba |
| Cookies y salida | Flags verificados, token no legible desde JS, logout y back sin recuperar resumen privado |
| PWA | Caché solo de offline.html y tres iconos; offline HTTP 503 con pantalla genérica y logo, sin formularios/datos privados; logout elimina su caché |
| Instalabilidad | Chrome devuelve manifest válido y cero errores de instalabilidad; no se ejecuta una instalación nativa de OS |
| Responsive | 320, 375, 430, 768, 1024, 1440 y 1920 px; público y formularios privados; sin overflow detectado |
| Accesibilidad | axe WCAG A/AA en rutas públicas, ficha, menú y CMS privado; teclado/foco/Escape/movimiento reducido |
| `npm audit --audit-level=moderate` | 0 vulnerabilidades conocidas en la consulta realizada |
| Búsqueda de claves en `src` | Referencias a env solo en servidor; no valores privados/service_role incorporados al navegador |
| `npm run check:production` | **No supera la validación**: faltan SITE_URL/Supabase/Redis/token/sal reales. Resultado esperado y bloqueante para producción, no se falsea |
| Base/servicios/DNS remotos | **No ejecutado** por falta de configuración/autorización; no se afirma superado |
| CI de GitHub Actions | Preparada y ampliada con los dos runners; no ejecutada en GitHub desde esta sesión |

Los E2E autenticados contactan un proveedor HTTPS **exclusivo de pruebas**, validan JWT del fixture y ejecutan las migraciones/RLS en PostgreSQL embebido. El código productivo usa su integración SDK normal, sin bypass de acceso ni modo demo. El certificado se confía únicamente en el proceso Node del runner, no se instala en el sistema. Esto prueba el flujo de la aplicación, no el estado de un proyecto Supabase externo.

## Lighthouse ejecutado

Lighthouse **13.6.0**, Chromium local, desktop 1440×900, throttling `provided`, servidor de producción en loopback, modo público `local`. Informes HTML/JSON en `lighthouse-report/` (ignorados por Git).

| Ruta | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP observado | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/es` | 100 | 100 | 100 | 100 | 229 ms | 0 |
| `/es/carta` | 100 | 100 | 100 | 100 | 193 ms | 0 |
| `/acceso` | 100 | 100 | 100 | 66 | 175 ms | 0 |

El acceso privado es deliberadamente noindex/nofollow y está bloqueado por robots/X-Robots-Tag. Su SEO no debe convertirse en 100 eliminando esas protecciones. La primera medición detectó además ausencia de meta description: se añadió y se repitió esa ruta (58→66). Las puntuaciones son mediciones locales concretas, **no Core Web Vitals de usuarios reales, resultados móviles ni garantías de hosting/SEO comercial**.

## Condiciones pendientes antes de la puesta en servicio

1. **Supabase real:** proyecto, región/plan, migraciones revisadas, Auth configurado para empleados, primer propietario real, permisos y Storage verificados en staging.
2. **Redis real:** URL/token y sal privada para permitir login y subidas de producción. Los límites del proveedor Auth y las altas públicas requieren revisión en su consola; el límite de la web no sustituye los del API público de Auth.
3. **Contenido:** migrar/revisar/publicar catálogo antes de activar el proveedor Supabase; bebidas, fotografías reales, composición/alérgenos y traducciones que continúan pendientes. El snapshot y las demos siguen identificados.
4. **Legal/privacidad:** identidad empresarial, responsable, finalidades/encargados/retención y derechos de imágenes. Las páginas legales son borradores informativos no indexados, no políticas definitivas. Definir retención de auditoría y copias reales.
5. **Dominios/HTTPS:** configurar Vercel/dominios/DNS únicamente con autorización del titular; verificar certificados, orígenes y comportamiento de cookies en los hosts reales.
6. **Correo:** no existe envío/recordatorios de reservas activo. El adaptador Resend no se ha probado contra API real ni dominio verificado; aceptación de API no se considera entrega.
7. **Operación:** activar alertas, copias y ensayo aislado de restauración con DB/Auth/Storage reales; instalar y comprobar la PWA en dispositivos del equipo, Safari/iOS y sesiones de larga duración.

## Deuda técnica delimitada

- CSP actual restringe frames, objetos, base y formularios, pero no implementa una política estricta de scripts con nonce/hash. Mantener ISR y estudiar endurecimiento compatible cuando se incorporen scripts externos.
- Recuperación/invitación por callback propio no implementada; cuentas/provisión se administran con herramientas oficiales de Auth. Cambio de contraseña propia sí está probado.
- Listas administrativas acotadas (500 registros y 100 eventos visibles). Añadir paginación/exportación antes de superar esos volúmenes; no se elimina histórico.
- Storage y SQL no forman una transacción distribuida. Se intenta limpiar una subida nueva si falla su registro; revisar huérfanos con un proceso autorizado, sin borrar imágenes compartidas.
- ESLint 9 está deprecado, conservado por compatibilidad declarada de los plugins actuales de Next. Sin vulnerabilidades reportadas; actualizar cuando el ecosistema soporte 10 sin forzar peers.

## Documentación entregada

`administration.md`, `deployment.md`, `owner-guide.md`, `employee-guide.md`, `recovery.md`, `verification.md` y `deferred-reservations.md`.

**Conclusión:** preparación técnica y evidencia local entregadas; producción real permanece pendiente de las condiciones anteriores. No se ha declarado un despliegue, restauración, entrega de correo o integración remota que no se haya ejecutado.
