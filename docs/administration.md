# Panel administrativo

## Alcance activo

Login y cierre de sesión con Supabase Auth, cambio de contraseña propia, resumen del catálogo, categorías/subcategorías, productos y bebidas, fotografías públicas, textos bilingües, contacto, horarios/cierres informativos, accesos del equipo y auditoría.

Reservas, mesas, planos, pedidos, estadísticas de comensales y notificaciones de reservas siguen aplazados. No se muestran métricas de esos módulos ni datos de ejemplo dentro del panel.

## Acceso y roles

| Rol | Permisos actuales |
| --- | --- |
| `owner` · Propietario | Carta, contenidos, empleados, auditoría, cuenta propia |
| `manager` · Encargado | Carta, contenidos, indicadores del catálogo, cuenta propia |
| `waiter` · Camarero | Resumen de acceso y cuenta propia; módulos operativos aplazados |
| `kitchen` · Cocina | Resumen de acceso y cuenta propia; pedidos todavía no implementados |
| `employee` · Legado | Acceso restringido equivalente al resumen, sin gestión; se conserva para no modificar datos antiguos automáticamente |

El guard obtiene la identidad con `getUser`, comprueba `staff_members.active` y valida un rol conocido. Cada página de datos y cada acción vuelve a comprobar el permiso, además de la verificación del layout. `React.cache` solo deduplica dentro de la solicitud. SQL vuelve a comprobar el rol y la actividad, de modo que una llamada directa a RPC no evita la autorización.

La autenticación del panel es **exclusivamente de servidor**. Las cookies de sesión son HttpOnly, SameSite=Lax, path `/` y Secure en producción, sin Domain compartido entre subdominios. El cliente de navegador preparado en `lib/supabase/browser.ts` sirve para operaciones públicas: no lee las cookies HttpOnly ni mantiene una segunda sesión de autenticación.

El logout utiliza scope local y navegación completa para descartar estado en memoria de React. Las restauraciones desde bfcache recargan y verifican el servidor. Las operaciones y respuestas privadas tienen `no-store`; no usan caché compartida.

## Persistencia mínima

Aplicar las migraciones en orden, después de revisarlas en un proyecto de staging:

1. `20261116000100_staff_members.sql`.
2. `20261117000200_administration.sql`.

La segunda amplía el perfil con nombre y actividad, conserva los roles antiguos y añade:

- `admin_records`: documentos tipados por `kind` (`category`, `product`, `content`), relación padre mediante FK, payload JSONB validado, publicación, versión y fecha de actualización.
- `admin_audit`: historial append-only de cambios de registros/perfiles y subidas; actor, entidad, operación y snapshots antes/después. Solo propietarios pueden leerlo desde la app.
- `admin_write_limits`: límite privado por actor, sin privilegios directos para clientes.

Se utiliza un modelo documental pequeño para el CMS, con validación Zod y validación SQL independiente: campos permitidos, tipos, precios enteros, categorías compatibles, jerarquía de un nivel, alérgenos, textos planos, URLs sociales, fotos y fechas. No representa el modelo normalizado completo del restaurante ni crea tablas del sistema de reservas.

Las escrituras directas de clientes están revocadas, incluso para propietarios de la aplicación. Las RPC autorizadas hacen la escritura y la auditoría en la misma transacción. El control de versión impide sobrescribir un cambio de otra sesión; dos intentos con la misma versión solo permiten uno. La creación usa un UUID estable del formulario, para que un reintento no cree otro producto silenciosamente.

La asignación/desactivación de empleados usa una RPC exclusiva del propietario y un bloqueo transaccional para impedir desactivar al último propietario activo. No almacena contraseñas ni escribe hashes manualmente en Auth.

## Primer propietario y cuentas

No existe usuario ni contraseña de demostración. Un administrador del proyecto debe crear una cuenta real en **Supabase Auth**, verificar su identidad y copiar su UUID.

En el SQL Editor de confianza, consultar antes la membresía y, si no existe, asignarla:

```sql
-- Sustituir el marcador por el UUID real de Auth. No ejecutar literalmente.
select user_id, role, active from public.staff_members
where user_id = 'UUID_REAL_DE_AUTH'::uuid;

insert into public.staff_members(user_id, role, display_name, active)
values ('UUID_REAL_DE_AUTH'::uuid, 'owner', 'NOMBRE_REAL', true);
```

Si ya existe la membresía, revisarla antes de decidir su actualización; no eliminarla para repetir el alta. Las operaciones desde el SQL Editor son privilegiadas y quedan identificadas como sistema si no existe `auth.uid()`.

Después, el propietario entra por `/acceso` y gestiona perfiles desde `/admin/empleados`. Las cuentas Auth se crean desde las herramientas oficiales de Supabase; el panel asigna acceso a **cuentas existentes**. Desactivar una membresía revoca el acceso de la aplicación sin borrar la cuenta global de Auth ni el historial.

El empleado puede cambiar su contraseña en `/admin/cuenta`: el servidor verifica la contraseña actual con Auth y actualiza exclusivamente esa cuenta. Para recuperación sin contraseña o invitaciones con enlace se necesita configurar el flujo de recuperación/callback correspondiente; no se presenta un formulario ficticio de recuperación.

## Publicación web

`PUBLIC_DATA_SOURCE=local` conserva la carta pública existente. El panel guarda datos reales en Supabase, pero no sustituye ese snapshot. El resumen y los formularios explican este estado.

Para activar el CMS:

1. Crear/revisar categorías, productos, bebidas y el documento de contenidos.
2. Revisar los datos e imágenes y marcar como publicados los registros que correspondan. Una categoría superior no publicada oculta sus descendientes.
3. Configurar `PUBLIC_DATA_SOURCE=supabase`, con URL/publishable key presentes durante el build, y recompilar.
4. Verificar el resultado público en staging antes de cambiar producción.

El proveedor público crea **un cliente anónimo, sin cookies**, usa exclusivamente publicaciones permitidas por RLS y valida el DTO. Solo esa lectura se cachea con tags y revalidación de cinco minutos. Las mutaciones invalidan los tags de carta y contenido. No se introduce una sesión administrativa en cachés públicas ni se mezclan demos con productos reales.

Los slugs son únicos. Se recomienda `tapas`, `rice`, `seafood`, `meat`, `desserts` para las raíces conocidas; las raíces publicadas se construyen dinámicamente en la home. Los productos nuevos mantienen ingredientes/alérgenos desconocidos como pendientes. Las traducciones de ingredientes conservan el orden y número de líneas.

## Storage y límites

Bucket `restaurant-media`: público **solo para fotografías de la web**, JPEG/PNG/WebP/AVIF, máximo 5 MB. No subir documentos, datos de clientes o información privada. Escritura solo de propietarios/encargados en su carpeta; eliminación de carpeta propia o por propietario.

La acción verifica rol, tamaño, firma raster y formato real; rechaza SVG aunque se declare como PNG. Sharp limita píxeles, orienta, reduce hasta 2000 px, recodifica a WebP y elimina metadatos. Los nombres son UUID, no nombres enviados por el usuario. Se registra la subida y se intenta limpiar el objeto nuevo si falla el registro. Un objeto subido no queda asociado a un producto hasta guardar su formulario.

Login: Redis REST compartido, máximo 6 intentos por email y 30 por IP en 15 minutos. Los identificadores se almacenan como HMAC, no texto claro, con TTL. Fuera de Vercel debe revisarse la fuente de IP confiable; no se confía en un X-Forwarded-For arbitrario. Producción falla cerrada si no hay Redis/sal; memoria solo se usa en desarrollo/pruebas. Media: 10 subidas por minuto/actor. SQL: 60 escrituras por minuto/actor, también al llamar directamente a RPC.

Las consultas privadas no se cachean. Las listas de gestión se limitan a 500 registros y auditoría a los últimos 100; el historial permanece en DB. Antes de superar esos volúmenes debe añadirse paginación/exportación operativa, no asumir que la lista es el histórico completo.
