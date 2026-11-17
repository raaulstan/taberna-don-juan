# Guía del propietario

## Primer acceso

El responsable técnico configura Supabase, migraciones, Redis y tu cuenta real de propietario. Entra por el acceso del equipo y usa tu contraseña de Auth. Nunca compartas una cuenta entre trabajadores. En «Mi cuenta» puedes cambiar tu contraseña verificando la actual.

## Carta

1. Crea categorías de gastronomía o bebidas. Las subcategorías dependen de una raíz del mismo catálogo.
2. Define un identificador público único, orden y publicación. Los nombres pueden traducirse al inglés.
3. Crea el producto, selecciona categoría, introduce precio y descripción y decide su disponibilidad.
4. Deja ingredientes o alérgenos pendientes si no están confirmados. No marcar nada no significa ausencia de alérgenos.
5. Para traducir ingredientes, una línea por ingrediente en el mismo orden que en español.
6. Sube solo fotografías destinadas a ser públicas. Espera la subida y guarda el producto para asociar el archivo.
7. Marca destacados y publicación cuando los datos estén revisados.

El panel indica si la web usa snapshot local o CMS Supabase. En modo local, guardar no sustituye la carta pública; la activación del proveedor la realiza el responsable técnico después de migrar y revisar los datos. Al activarlo, solo se publican registros y categorías permitidos. La actualización puede requerir la siguiente revalidación/carga; no es un sistema de stock en tiempo real.

Eliminar pide confirmación y conserva auditoría. Una categoría en uso no se elimina hasta resolver sus relaciones. Quitar una ruta de foto no borra el objeto de Storage, para evitar borrar material compartido.

Si otro empleado cambió el registro, el guardado se rechaza por versión. Recarga y revisa el dato actual antes de reintentar; no se sobrescriben cambios ajenos silenciosamente. Si se pierde la conexión tras guardar, comprueba el registro antes de repetir una creación.

## Contenidos y contacto

Revisa dirección, teléfonos internacionales, email confirmado, redes oficiales y horarios. Los mapas se construyen con la dirección publicada. Los cierres son información pública por fecha y motivo, no disponibilidad calculada de mesas.

Puedes cambiar textos en español e inglés y fotografías de hero/historia. Utiliza texto plano; añade descripciones de las fotos. La identidad gráfica se actualiza desde el original del proyecto y requiere regenerar el build.

Los textos legales definitivos necesitan tus datos empresariales y los tratamientos reales. Las páginas actuales son informativas y están marcadas como pendientes; encargarse de completarlas antes de presentar la web como producción definitiva.

## Empleados

Las cuentas se crean en Supabase Auth por administración de confianza; el panel asigna su acceso a la cuenta existente. Para un alta con contraseña temporal utiliza un canal privado y pide que el empleado la cambie en «Mi cuenta». No guardar ni distribuir contraseñas mediante tablas de la carta, logs o contenido público.

Propietario gestiona todos los módulos activos; encargado, carta y contenido. Camarero/cocina tienen acceso limitado mientras sus módulos operativos están aplazados. El rol legado `employee` no recibe permisos nuevos automáticamente.

Revisa y confirma cambios de rol o desactivación. No se permite desactivar al último propietario activo. Desactivar acceso no elimina la cuenta Auth ni el historial; revisa el estado real de la membresía después del cambio.

## Auditoría y estadísticas

El historial registra cambios confirmados y subidas, con actor y fecha de Madrid. La pantalla muestra los últimos 100; el histórico completo queda en DB. Los eventos de contraseña pertenecen al sistema de Auth, sin snapshots de contraseñas en el CMS.

Los contadores del panel proceden de consultas reales del catálogo. No hay seguimiento de visitas ni estadísticas de popularidad, comensales o reservas.

## Instalación y soporte

En navegadores compatibles utiliza «Instalar panel» o el menú del navegador. En Safari/iOS, Compartir → Añadir a pantalla de inicio, cuando el sistema lo permita. La instalación real debe revisarse en los dispositivos del equipo.

Sin conexión no se guardan cambios ni se confirman operaciones; la pantalla offline no contiene datos privados. Para cerrar sesión necesitas conexión. Cierra sesión al terminar en dispositivos compartidos.

Copias, incidencias y restauración se gestionan con el responsable técnico siguiendo `recovery.md`; no borrar tablas ni restaurar sobre producción sin un procedimiento revisado.
