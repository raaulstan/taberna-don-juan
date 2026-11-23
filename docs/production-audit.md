# Estado técnico: web pública

## Alcance actual

El proyecto es una web pública con catálogos y contenido local. Se retiraron panel, acceso del equipo, autenticación, base de datos, migraciones y servicios privados por decisión del usuario. Las rutas antiguas devuelven 404 y no existen enlaces de acceso del equipo.

## Renderizado y datos

- Inicio, carta y bebidas en seis idiomas mediante App Router y prerenderizado.
- 92 platos y 134 bebidas, con validación de integridad y traducciones locales.
- DTO público con el idioma seleccionado y el original para búsqueda.
- No se realizan consultas a servicios de datos ni escrituras desde la web.
- Las fotografías se sirven desde el proyecto; las zonas vacías usan recursos gráficos neutros.

## Acceso, cookies y recursos

No hay usuarios, sesiones, contraseñas, operaciones administrativas o cargas públicas de archivos. El manifest público contiene iconos y datos de la web, pero no instala un service worker. La sección legal se ha retirado por petición del usuario.

La configuración mantiene HTTPS en el alojamiento, cabeceras generales de navegador y metadata localizada. Las previews usan `noindex`. El origen se configura mediante `NEXT_PUBLIC_SITE_URL`.

## Calidad

Las pruebas cubren integridad de datos, monedas, traducciones, búsqueda, proyección por idioma, metadata, interacción, teclado, foco, responsive y ausencia de rutas privadas. Axe ofrece una comprobación automatizada de accesibilidad; no sustituye una auditoría manual con tecnologías de asistencia.

Las auditorías Lighthouse se ejecutan contra un build local y distinguen escritorio/móvil simulado. Sus resultados son de laboratorio, no mediciones de usuarios reales.

## Publicación y mantenimiento

Los cambios de carta/contacto se realizan en archivos, se prueban y se despliegan de nuevo. El código está en GitHub y la prueba pública en Vercel; se conservan las versiones anteriores en el historial del repositorio.

Las fotografías propias se incorporan cuando las facilite el restaurante. Las reservas permanecen suspendidas. No se cambia DNS ni se activa ningún servicio adicional de forma automática.
