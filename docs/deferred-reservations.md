# Reservas: registro de requisitos aplazados

**Estado: suspendido. Este documento conserva contexto, no autoriza su implementación.** Solo una solicitud expresa del usuario puede reactivar el trabajo de reservas. Esta decisión prevalece sobre los prompts preparados que incluyan reservas y debe mantenerse en próximas fases.

## Estado que debe conservarse

- `/reservas` completamente vacía, devolviendo `null`, sin cabecera, pie, mensajes o funcionalidades.
- Metadata `noindex, nofollow` y exclusión del sitemap.
- Sin tablas, endpoints, Server Actions, correo de reservas, calendarios, disponibilidad, asignación de mesas ni planos.
- Sin botones que prometan reservar. No se añaden enlaces de reservas a la home porque no existían.
- Supabase y Resend permanecen disponibles para otros casos de uso del proyecto.

## Requisitos del prompt de home conservados para el futuro

Se omiten de la implementación actual, pero se registran para poder retomarlos si se solicita:

1. Enlace de reservas en la navegación y posible CTA destacado en la cabecera.
2. CTA de reservas en el hero junto al acceso a la carta.
3. Sección editorial de reservas con fondo verde oliva o marrón oscuro y acceso al flujo.
4. Integración del futuro flujo con el diseño responsive, animaciones accesibles y reducción de movimiento.

El encargo original contemplaba disponibilidad, calendarios, mesas/planos, persistencia PostgreSQL y notificaciones con Resend. No se han definido reglas de capacidad ni un modelo de datos. Si se reactiva, confirmar primero los requisitos vigentes; estas notas no deben convertirse automáticamente en una solución asumida.

## Prompts posteriores conservados, también aplazados

- Formulario con fecha, hora, comensales, zona opcional, nombre, teléfono, email, observaciones y privacidad.
- Disponibilidad por intervalo, mesas/capacidad, turnos/duración, horarios, cierres y bloqueos; zona `Europe/Madrid`, fechas pasadas y cambios de hora.
- Comprobación/guardado transaccionales PostgreSQL contra conflictos simultáneos. Web y teléfono compartirían el mismo modelo; nunca confirmar antes del commit.
- Calendario diario/semanal, reservas telefónicas, edición/cancelación, asignación de mesas, llegada, ocupación/liberación y búsqueda privada por nombre/teléfono.
- Estados: pendiente, confirmada, cancelada, cliente presente, finalizada y no presentado.
- Correos Resend: solicitud, confirmación, cancelación, modificación, recordatorio y aviso al restaurante.
- Plantillas HTML responsive con marca real, identificación no sensible y validación; dominio remitente verificado y claves solo servidor.
- Outbox/cola persistente poscommit, idempotencia, registro de intentos, reintentos controlados y proceso programado independiente del navegador. Un fallo de correo no debe duplicar la reserva. Aceptación de API no equivale a entrega.
- PWA: calendario/nueva reserva/mesas/vista del día solo cuando exista ese módulo; ninguna confirmación offline.
- Auditoría/despliegue: pruebas de concurrencia, conflictos, cancelaciones, cierres y horario de verano antes de considerar operativo ese futuro módulo.

Estos requisitos no se han implementado ni verificado en esta entrega. El panel actual gestiona carta, contenido y empleados; sus cierres son informativos y no calculan disponibilidad.
