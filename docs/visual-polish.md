# Perfeccionamiento visual, movimiento y responsive

Fase realizada sobre la home, carta y bebidas existentes, conservando su paleta, contenido, rutas y composición en Server Components.

## Sistema de movimiento

- Curva compartida `cubic-bezier(0.22, 1, 0.36, 1)`.
- Duraciones de referencia: 160 ms para feedback/salida, 260 ms para transiciones de panel y 480 ms para aparición de secciones. Configuración de Motion en `src/config/motion.ts`; equivalentes CSS en `globals.css`.
- Los textos mantienen opacidad completa al entrar para conservar contraste durante los estados intermedios. Las apariciones utilizan desplazamientos pequeños, una sola vez por entrada en pantalla.
- `prefers-reduced-motion` elimina desplazamientos, zooms, scroll suave y microinteracciones prolongadas. Los cambios de estado y la información siguen siendo visibles.

## Cabecera y menú

La cabecera conserva su altura al desplazarse. El cambio de fondo/sombra se compone mediante opacidad de una capa decorativa con sombra constante, evitando interpolar una sombra grande o el color de todo el encabezado en cada frame. El detector de scroll sigue siendo pasivo y agrupa sus lecturas con `requestAnimationFrame`.

Los indicadores activos entran y salen por escala con Motion, sin mediciones de layout ni `domMax`. La aparición inicial de los elementos es un desplazamiento mínimo y no oculta contenido del HTML.

El menú móvil sigue siendo un `details/summary` nativo, operativo sin JavaScript. Con hidratación, Motion anima su entrada y salida. Durante el cierre el panel es `inert`, conserva `open` hasta completar la salida y no permite tabular por enlaces que desaparecen. Escape restituye el foco al summary. Se cancelan animaciones anteriores al invertir rápidamente la transición; al pasar a escritorio se restablece el disclosure para evitar que reaparezca abierto al volver a móvil.

No se convierte el disclosure en un diálogo modal ni se añade una trampa de foco al menú.

## Hero y secciones

`HeroBackdrop` es una isla cliente mínima que recibe el `next/image` compuesto en servidor. Solo anima escala de 1.025 a 1 durante seis segundos, una vez, sin listeners de scroll ni bucles. El degradado y el texto permanecen separados y estáticos. Con movimiento reducido la imagen no se desplaza.

Se conserva la entrada escalonada del título, subtítulo y acciones. `Reveal` usa ahora una curva y distancia homogéneas (12 px), respeta el movimiento reducido y no repite la animación al regresar a una sección. Las dimensiones y espacios se reservan antes de la hidratación.

## Carruseles, tarjetas y controles

- Se mantiene scroll snap nativo y los controles con flechas, Home/End, teclado y swipe. Imagen, nombre, descripción y precio siguen perteneciendo a la misma diapositiva.
- Las imágenes cambian de escala un 2.5% como máximo al activar/desactivar una diapositiva; su marco recorta el excedente. El contenido se desplaza solo 6 px, sin desvanecer texto ni modificar dimensiones.
- Los indicadores de posición cambian de escala dentro de botones de tamaño fijo.
- Las tarjetas conservan elevación ligera y transiciones cortas de borde/sombra. El zoom fotográfico se limita al 3.5% y a dispositivos con hover y puntero fino; el foco de teclado también tiene feedback.
- Los botones compartidos permiten texto multilínea en espacios reducidos y mantienen objetivos táctiles mínimos de 44 px. Incluyen feedback hover/focus/active/disabled.
- Los controles deshabilitados del carrusel no se elevan, pulsan ni cambian la diapositiva.
- No se añaden dependencias ni animaciones de entrada individuales a las 92 fichas del catálogo.

## Diálogos

Radix mantiene su gestión de foco, Escape y bloqueo del fondo. El catálogo conserva temporalmente el producto durante el cierre; no desmonta el contenido al pulsar cerrar. `Radix Presence` espera el final de los keyframes CSS antes de desmontar y devolver el foco al origen.

La entrada usa desplazamiento/escala leve, la salida dura 160 ms y el backdrop se desvanece por opacidad. La salida se comprueba mediante el evento real `animationstart`, desmontaje posterior y recuperación del foco. No hay temporizadores de duración duplicada en React. El área de desplazamiento del diálogo reserva su scrollbar y cabe dentro del viewport en móvil y escritorio.

## Comprobaciones

- Anchos: **320, 375, 430, 768, 1024, 1440 y 1920 px**. Se revisan home en ambos idiomas, carta/bebidas y límites de los diálogos, sin overflow horizontal.
- Menú: ambos sentidos, inversión rápida, inert durante cierre, Escape, teclado, cambio de breakpoint y funcionamiento nativo sin JavaScript.
- Diálogos: entrada/salida, foco, reapertura, desbloqueo del fondo y modo reducido.
- axe-core en las páginas públicas, catálogo, ficha y menú abierto.
- Capturas de la home en los siete anchos y capturas específicas del menú y de una ficha en móvil.
- Muestra puntual de laboratorio: Chromium, 1440 px, home, observación hasta 1.2 s después de `networkidle`; acumulación observada de layout shifts **0**. En ese momento solo seguía activa la animación de seis segundos del hero.

Esta muestra no sustituye métricas de campo de Core Web Vitals ni una medición Lighthouse en alojamiento definitivo. No se declara una puntuación de rendimiento no medida.
