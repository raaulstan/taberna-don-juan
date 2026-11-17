# Copias de seguridad y recuperación

**Estado:** procedimiento preparado; no se ha creado ni restaurado una copia de una base de datos remota. No hay proyecto/plan/retención reales verificados en esta sesión.

## Qué debe protegerse

- Base de datos: perfiles/actividad, catálogo, contenidos, auditoría y estado de Auth.
- Storage: archivos binarios y la correspondencia exacta bucket/ruta; una copia SQL de metadatos no sustituye los archivos.
- Código/migraciones/lockfile y el original del logotipo.
- Configuración de despliegue y secretos en un gestor de secretos, separados del backup público y del repositorio.

## Preparación operativa

1. Elegir las copias gestionadas/PITR disponibles en el plan real de Supabase y verificar su activación. Definir con el propietario RPO, RTO, retención, responsables y acceso a copias.
2. Mantener copias cifradas fuera del proyecto y comprobar restauración en staging. No guardar exportaciones en `public/`; `backups/` está ignorado, pero eso no reemplaza almacenamiento seguro.
3. Exportar Storage mediante una herramienta autorizada, incluyendo un manifiesto de rutas y verificación de integridad. No exponer credenciales S3/service_role al navegador.
4. Antes de migrar, tomar la copia acordada y revisar el diff SQL. El historial de migraciones es código, no una copia de los datos.

Las exportaciones de Supabase CLI de `public` pueden ser útiles para catálogo y CMS, pero no deben presentarse como backup completo de Auth, roles gestionados y binarios de Storage. Utilizar el procedimiento oficial de restauración gestionada para el proyecto/plan seleccionado.

## Ensayo de recuperación

1. Abrir incidencia, delimitar el momento y evitar escrituras durante la decisión de recuperación.
2. Restaurar primero en un entorno aislado autorizado; nunca ejecutar a ciegas un dump sobre la base existente.
3. Recuperar DB/Auth mediante el procedimiento del proveedor. No crear hashes de contraseña manualmente ni sustituir usuarios por identidades ficticias.
4. Recuperar binarios de Storage preservando rutas y comprobar referencias de productos/contenidos.
5. Verificar versiones de esquema, constraints, RLS, funciones, historial, cuentas activas y existencia de un propietario operativo.
6. Comparar recuentos e integridad con el backup real, no con números esperados inventados. Probar login, permisos, alta/edición/borrado y publicación.
7. Rotar secretos si existe sospecha de exposición, revisar sesiones, y gestionar el retorno del tráfico con autorización explícita.
8. Registrar fecha, copia utilizada, resultados y tiempo observado del ensayo. Solo entonces afirmar que la recuperación está probada.

## Conservación y limpieza

La auditoría no dispone de borrado desde el panel. Su retención/anonimización debe definirse con la política real del negocio. Revisar también fotos huérfanas tras subidas no asociadas o fallos entre Storage y DB; no borrarlas automáticamente si pueden ser compartidas por contenido publicado.

Vercel mantiene artefactos de despliegue y puede facilitar un rollback de código; eso **no restaura** los datos de Supabase ni los archivos. Una migración incompatible requiere un plan de datos, no solo volver al build anterior.
