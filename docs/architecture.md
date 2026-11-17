# Arquitectura · fase 1

## Decisiones principales

1. **App Router y Server Components por defecto.** No hay un proveedor cliente global. Los layouts y las páginas son RSC. La home usa islas cliente para cabecera interactiva, fondo animado del hero, carrusel y `Reveal`; también existen el adaptador Supabase para navegador y el error boundary privado. Los componentes shadcn conservan los límites de sus primitivas.
2. **Sin ORM.** Supabase tipado y SQL versionado bastan para el alcance actual. No se han creado tablas de reservas ni una API vacía.
3. **Raíces HTML independientes.** Los grupos `(public)`, `(private)` y `(entry)` tienen root layouts separados. Esto permite `<html lang="es">`/`"en"` estático en público y un shell español independiente en privado sin consultar cookies o headers en todas las páginas. Cruzar entre raíces implica navegación completa, un intercambio aceptado para estos accesos poco frecuentes.
4. **Idiomas explícitos.** `/es` y `/en`, traducciones por namespaces en `messages`, `next-intl` en servidor y validación por lista permitida. No hay detección por IP/cookie ni proxy para el público; `/` redirige a `/es`. El selector utiliza enlaces HTML y funciona sin JS. Añadir idioma exige diccionario, locale y revisión SEO.
5. **Configuración explícita, sin datos de demostración.** Se puede desarrollar la web sin servicios externos. El acceso privado queda cerrado y el correo falla de forma explícita si no hay configuración. El origen canónico se exige en producción.
6. **Reservas suspendidas hasta solicitud expresa.** `/reservas` devuelve `null` y utiliza el root layout mínimo de `(entry)`, sin cabecera, pie de página ni contenido visible. Solo conserva la estructura técnica de Next y metadata `noindex, nofollow`; queda fuera del sitemap. No implementar funcionalidad de reservas en fases posteriores salvo petición expresa del usuario.

## Estructura y dependencias

```text
src/
  app/                         Composición de rutas, metadata y layouts
    (entry)/                   Redirección inicial y layout HTML mínimo
      reservas/                Ruta vacía; reservas suspendidas
    (public)/[locale]/         Web pública localizada
    (private)/acceso/          Estado informativo del acceso
    (private)/admin/           Panel protegido
  components/
    layout/                    Presentación compartida
    ui/                        Primitivas shadcn/ui adaptadas
    motion/                    Interactividad optativa y aislada
  config/                      Entorno y configuración del sitio
  features/
    auth/domain/               Roles; sin Next ni Supabase
    auth/data/                 Guard y acceso a membresías en servidor
    notifications/validation/  Contrato Zod de correo
    home/data/                 Contenido contrastado y referencias de medios locales
    home/components/           Carrusel aislado con scroll snap y controles accesibles
    menu/domain/               Contrato Zod, tipos y búsqueda pura
    menu/data/                 Snapshot oficial, demo separada y composición del proveedor
    menu/components/           Explorador, tarjetas, medios y ficha lazy
  i18n/                        Idiomas permitidos y carga de mensajes
  lib/
    seo/                       Metadata y serialización estructurada
    supabase/                  Clientes SSR, navegador y refresh
    utils.ts                   Utilidades de presentación
  services/email/              Adaptador Resend, solo servidor
  types/                      Contrato PostgreSQL
supabase/migrations/           Cambios SQL auditables
tests/unit/                   Vitest
tests/e2e/                    Playwright
scripts/                      Generación reproducible de recursos
```

Los módulos de dominio no importan UI, Next ni proveedores. La capa de datos verifica identidad y permisos; la presentación solo consume su resultado mínimo. Las validaciones Zod son reutilizables por futuros formularios y servidor. La dependencia siempre apunta del adaptador hacia el contrato, no del dominio hacia el proveedor.

No se añaden carpetas vacías para funciones no implementadas. Al crecer carta o contenido, seguir `features/<área>/{domain,data,validation,components,actions}` según las responsabilidades que realmente existan. La ruta vacía `/reservas` se conserva por decisión expresa, sin módulo de dominio asociado.

## Renderizado y caché

| Ruta/dato | Estrategia actual | Motivo |
| --- | --- | --- |
| `/` | Estática, redirección 308 | Idioma por defecto determinista |
| Público localizado | SSG/ISR 300 s con `generateStaticParams` | Snapshot local o publicaciones anónimas del CMS, sin sesión privada |
| `/reservas` | Estática, sin contenido | Ruta conservada; `noindex, nofollow`, sin lógica ni consultas |
| sitemap, robots y manifest | Estáticos | Derivados de configuración |
| `/acceso` y `/admin` | Dinámico por petición | Datos de sesión, motivos y permisos |
| Supabase del servidor | Fetch `no-store` | Ninguna respuesta privada entra en caché compartida |
| Guard de personal | `React.cache` dentro del render | Deduplica layout/page sin compartir información entre peticiones |

Carta y contenido publicados disponen de caché anónima etiquetada e ISR; las mutaciones confirman SQL y después invalidan `public-catalog`/`public-content` con `revalidateTag(etiqueta, "max")`. Las sesiones y operaciones privadas siguen siendo dinámicas `no-store`. Disponibilidad de reservas y el módulo completo siguen fuera de alcance hasta solicitud expresa.

Las consultas proyectan columnas concretas y paralelizan lecturas independientes. El guard necesita identidad verificada y membresía de esa identidad (`role, active`); la PK `user_id` cubre el filtro. El proveedor público carga una proyección acotada de publicaciones sin N+1 ni cliente de sesión.

## Autenticación y autorización

- `src/proxy.ts` refresca `/admin/*` y `/acceso` con `getClaims`, conserva cookies/headers y usa `private, no-store`. Los recursos PWA públicos se excluyen del refresco. `/` solo comprueba si el host administrativo debe redirigir a `/admin`; no consulta Auth en la raíz pública.
- `requireStaff` llama a `getUser` para comprobar la identidad actual en Auth y consulta `staff_members`. Un error del proveedor, ausencia de membresía o rol desconocido deniega el acceso; un error SQL produce el boundary genérico, no una sesión con permisos asumidos.
- El layout administrativo y la página invocan el guard. Los layouts no protegen por sí solos las futuras Server Actions, Route Handlers o consultas: cada entrada crítica debe volver a llamar al guard en servidor. Operaciones del propietario utilizarán `requireStaff(["owner"])`.
- La aplicación no autoriza mediante `getSession`, `user_metadata` ni un valor enviado por el cliente. No se utiliza `service_role`.
- RLS permite leer la membresía propia y al propietario consultar el equipo; el público solo lee publicaciones. No hay escrituras directas a tablas desde clientes. Las RPC limitadas comprueban actividad/rol y escriben con auditoría transaccional. Crear un usuario Auth no le convierte en empleado.
- Los roles corresponden a la aplicación, no al rol SQL `authenticated`. Solo propietarios activos asignan/desactivan accesos mediante RPC; el primer propietario se asigna desde administración SQL confiable. El último propietario activo está protegido.
- Login, logout y cambio de contraseña propia usan Server Actions. No hay invitación/recovery con callback propio implementado. La sesión usa cookies HttpOnly, Secure en producción y SameSite=Lax; el cliente de navegador no lee esa sesión.

### Tipos de PostgreSQL

`src/types/database.ts` es un contrato inicial escrito a mano contra la migración, con roles acotados. Después de aplicar cambios, generar tipos con la CLI oficial de Supabase y revisar el diff:

```bash
supabase gen types typescript --linked --schema public
```

Guardar su salida en `src/types/database.ts` mediante el flujo del equipo. El generador puede representar `role` (columna `text` con CHECK) como `string`: mantener la validación `isStaffRole` en el guard. No sustituirla por un cast.

## Operaciones de servidor

Usar Server Actions para mutaciones internas de formularios; Route Handlers para webhooks/callbacks o integraciones HTTP reales. Al implementarlos: validar entrada Zod, verificar identidad y rol, ejecutar la operación atómica y, cuando proceda, invalidar contenido público. No hay acciones de reservas ni handlers ficticios en esta base.

Los formularios privados usan React Hook Form y `zodResolver`; el servidor vuelve a validar y SQL impone restricciones independientes. La validación del navegador mejora la experiencia, no autoriza. Los campos de mutación esperan a hidratarse para evitar perder una interacción temprana sobre valores SSR; los checkbox conservan sus valores reales iniciales.

## Seguridad HTTP

Se han configurado `nosniff`, denegación de iframe, política de referente/permisos y HSTS en producción. CSP inicial limita `frame-ancestors`, `object-src`, `base-uri` y `form-action`; **no es una CSP estricta de scripts con nonce**. Un nonce por petición convertiría las páginas estáticas en dinámicas; evaluar hashes/una política compatible con la plataforma al añadir scripts externos. La respuesta privada lleva además `X-Robots-Tag` y `Cache-Control: private, no-store`.

Los secretos Resend permanecen en módulos `server-only`; los clientes Supabase usan exclusivamente publishable keys con RLS. Los errores mostrados no incluyen tokens, correos del usuario ni respuestas del proveedor. JSON-LD escapa `<` para evitar cerrar el elemento script si se incorpora contenido editable en fases posteriores.

## Diseño, accesibilidad y rendimiento

- Tokens semánticos shadcn derivados de la paleta facilitada; sin tema oscuro incompleto.
- HTML semántico, un h1 por pantalla con contenido, enlaces de idioma con `lang`/`hrefLang`, foco visible, salto al contenido y objetivos de interacción de 44 px como base. `/reservas` es la excepción explícita: permanece completamente vacía.
- El dorado se utiliza como acento/fondo, con nogal para texto contrastado. Oliva/pergamino para zonas oscuras.
- Sin fuentes de terceros. Las fotos remotas solo admiten el origen Supabase configurado y el bucket/ruta público aprobados; el snapshot local conserva sus ilustraciones identificadas. Todas usan `next/image`, dimensiones y sizes.
- Sin providers globales de estado, Supabase o Motion. No se hidratan layouts completos. Motion es opt-in, anima `transform`, respeta movimiento reducido y no oculta contenido si falta JS.
- Los iconos de Lucide son decorativos donde acompañan texto y se ocultan del árbol accesible.

### Inicio rústico premium

La composición de secciones y la traducción permanecen en servidor. La cabecera usa scroll pasivo con `requestAnimationFrame` para sombra y sección activa; el menú móvil es un disclosure HTML nativo (`details`), usable con teclado y sin JavaScript. Escape devuelve foco al control. No es un diálogo modal y no atrapa el foco.

El carrusel usa scroll snap nativo para gestos táctiles y navegación sin hidratación, sin autoplay ni temporizadores. `IntersectionObserver` sincroniza el indicador con la diapositiva visible. Las flechas, Home/End y teclas horizontales controlan el scroll; cada diapositiva contiene su propia imagen, nombre, descripción y precio. Motion solo anima transformaciones/aparición y microinteracciones, con `useReducedMotion`; nunca oculta todo el contenido en el HTML inicial.

Las imágenes locales están optimizadas y pasan por `next/image`, con `sizes`, dimensiones reservadas y precarga únicamente del hero. Las ilustraciones se marcan como ambientación; los materiales ausentes llevan placeholders explícitos. No hay dependencias de red de terceros para renderizar la home. La procedencia y los enlaces externos de carta se documentan en `content-sources.md`.

## SEO

Títulos y descripciones por idioma, canonical por ruta, hreflang recíproco y `x-default`, Open Graph, Twitter, sitemap y robots. El schema `Restaurant` incorpora nombre, URL, dirección, móvil y perfiles sociales contrastados. No incluye valoraciones ni coordenadas inventadas; no se garantiza elegibilidad de rich results por la mera existencia del schema.

El panel queda fuera del sitemap, bloqueado en robots y marcado `noindex` tanto en metadata como en HTTP. La privacidad depende del guard/RLS, no de robots.txt. El enlace temporal a la web de referencia solo aparece cuando el origen del despliegue es diferente, para evitar un autoenlace al publicar en el dominio oficial.

## Catálogo gastronómico y bebidas

Las rutas `/carta` y `/bebidas` se prerenderizan y revalidan cada cinco minutos. Composición, validación y metadata se ejecutan en servidor; búsqueda/filtros/fichas son una isla cliente. `MenuRepository` selecciona snapshot o adaptador Supabase según `PUBLIC_DATA_SOURCE`; sin configuración real se mantiene local. La caché compartida solo contiene lecturas anónimas publicadas, nunca consultas administrativas.

La home comparte precios con el snapshot y conserva su carrusel, ampliado de forma compatible con indicadores y callback opcional. La ficha utiliza Radix Dialog y carga su código bajo demanda; no se sustituye el layout público ni se convierte la ruta en SPA. Detalles de datos, límites y plan de sustitución en `menu-data.md`.

## Pulido visual y ciclo de cierre

Las transiciones comparten curvas y duraciones cortas. El menú conserva el comportamiento HTML nativo y añade animación cancelable mediante Motion; los enlaces se vuelven inert mientras termina el cierre. Las fichas conservan el producto hasta finalizar la salida de Radix Presence y solo entonces restituyen el foco. El hero anima una capa de imagen una sola vez, sin introducir parallax o listeners adicionales de scroll. Detalles y evidencia responsive en `visual-polish.md`.
