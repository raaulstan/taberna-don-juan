# Verificación de la base

Entorno de ejecución: Windows, Node **24.21.0**, npm **12.2.2**. Fecha: **16/11/2026**.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Instalación npm | Completada, lockfile generado |
| ESLint sin warnings | Correcto |
| `next typegen` + TypeScript estricto | Correcto |
| Vitest | 24 pruebas correctas, 4 archivos |
| Vitest con cobertura V8 | Correcto; informe local en `coverage/` |
| Compilación de producción | Correcta con Turbopack |
| Playwright producción | 18 pruebas correctas en Chromium escritorio y móvil |
| axe-core | Sin infracciones detectadas WCAG A/AA en `/es`, `/en`, `/acceso` en los dos perfiles |
| Contenido sin JavaScript | Portada y navegación de idioma verificadas |
| Auditoría npm | Sin vulnerabilidades conocidas en la consulta realizada |

La compilación confirma SSG en `/es` y `/en`; SSR dinámico en `/acceso` y `/admin`; metadata estática en sitemap, robots y manifest. Se comprueban también canonical, idioma HTML, JSON-LD, 404 de idioma desconocido, headers privados, teclado y existencia de iconos.

Los informes HTML de Playwright y cobertura son artefactos locales ignorados por Git. La CI está preparada pero no se ha ejecutado en GitHub desde este directorio.

## Actualización: reservas suspendidas

Tras añadir la ruta vacía `/reservas`, se ha ejecutado `npm run check`: lint sin warnings, tipos correctos, 24 pruebas unitarias correctas y compilación de producción correcta. Next genera `/reservas` como ruta estática.

Una comprobación puntual con Chromium contra `next start` ha verificado respuesta HTTP 200, cuerpo sin texto visible ni elementos de interfaz, metadata `noindex, nofollow` y ausencia de `/reservas` en el sitemap. Esta comprobación no añade un sistema de reservas ni un archivo de pruebas permanente. La suite E2E completa de la base no se ha vuelto a ejecutar en esta actualización.

## Actualización: página de inicio · 17/11/2026

- Compilación de producción completada por el runner E2E, incluido el chequeo TypeScript. El manifiesto de prerender confirma que `/es` y `/en` siguen siendo estáticas.
- ESLint sin warnings y 24 pruebas unitarias correctas.
- Playwright: **31 pruebas correctas y 1 omitida por diseño**. El gesto táctil se ejecuta en Chromium móvil y se omite en el perfil de escritorio sin soporte táctil.
- axe-core sin infracciones WCAG A/AA detectadas en `/es`, `/en` y `/acceso` en escritorio y móvil.
- Comprobadas navegación sticky/sección activa, menú nativo con teclado y Escape, carrusel con flechas y Home/End, swipe táctil, sincronización de precios e imágenes locales sin errores de página.
- Sin desbordamiento horizontal en 320, 375, 430, 768, 1024, 1440 y 1920 px. Se verifica también la preferencia de movimiento reducido.
- HTML y cambio de idioma sin JavaScript, sitemap, datos estructurados y aislamiento del panel siguen pasando sus pruebas.
- Regresión añadida para `/reservas`: sigue vacía, responde HTTP 200, conserva `noindex, nofollow` y no aparece en sitemap ni en los enlaces de la home.
- Revisión visual mediante capturas de Chromium a 1440 px y 390 px. No equivale a comparación con la imagen solicitada: ese adjunto no estaba disponible.

Se corrigió el contraste del CTA y se mantuvo opacidad completa durante las animaciones de aparición para conservar legibilidad también en los estados intermedios. Las entradas animan únicamente el desplazamiento.

## Actualización: carta y bebidas · 17/11/2026

- Compilación de producción correcta, con chequeo TypeScript incluido en el runner Playwright. Las cuatro rutas nuevas son estáticas y no necesitan conexión a Supabase.
- Lint sin warnings y **35 pruebas unitarias correctas**. Se verifican integridad de las 92 referencias, precios de variantes, estados desconocidos, aislamiento de demo, fuentes HTTPS, categorías configurables, sustitución del proveedor y búsqueda normalizada.
- Suite E2E completa: **49 pruebas correctas y 1 omitida por diseño** (swipe de escritorio; el gesto sí se ejecuta en móvil).
- Después de ajustar las ilustraciones de especialidades por categoría, se repitieron las pruebas afectadas de carrusel, swipe, enlaces a productos y diálogo: **7 correctas y 1 omitida**, sin fallos.
- Verificados búsqueda/categoría/sección combinadas, resultados vacíos, limpiar/restablecer, enlaces directos, cambio de idioma conservando la ruta, canonical y sitemap.
- Fichas verificadas con precio y datos publicados, ingredientes/alérgenos desconocidos explícitos, foco inicial en título, contención de Tab, Escape, cierre y devolución del foco al origen.
- axe-core sin infracciones detectadas en `/es/carta`, `/en/carta`, `/es/bebidas` y la ficha abierta, en escritorio y móvil.
- Sin overflow en los anchos de catálogo probados: 320, 390, 768, 1024 y 1920 px, también con movimiento reducido.
- Lectura del catálogo sin JavaScript comprobada. El mensaje `noscript` se valida por su nodo DOM: el motor `getByText` de Playwright lo omite por diseño.
- Revisadas capturas de la carta filtrada en escritorio (1440 px) y una ficha en móvil (390 px).
- La demostración de bebidas permanece identificada, separada y cerrada por defecto. No se prueba ni declara disponibilidad real ni entrega de datos desde Supabase.

## Actualización: perfeccionamiento visual y responsive · 17/11/2026

- Lint y TypeScript correctos; compilación de producción realizada por el runner E2E.
- **35 pruebas unitarias correctas.**
- Suite E2E completa: **61 pruebas correctas y 1 omitida por diseño**, correspondiente al swipe en el perfil de escritorio; el gesto móvil se ejecuta.
- Matriz ampliada a **320, 375, 430, 768, 1024, 1440 y 1920 px**, incluidos catálogos, home inglesa y límites del diálogo abierto.
- Nuevas regresiones para entrada/salida del menú, inversión rápida, inert al cerrar, cambio a escritorio, disclosure sin JS y controles deshabilitados sin movimiento.
- Se comprueba que el diálogo ejecuta su animación de salida antes de desmontarse, restituye foco y libera el fondo; también cierre y controles con movimiento reducido.
- axe-core sin infracciones detectadas en el menú abierto y en las pantallas/fichas de las suites existentes.
- Capturas de los siete anchos y revisión visual de escritorio/móvil, menú abierto y ficha. Observación puntual de laboratorio en la home a 1440 px: layout shifts acumulados 0 en la ventana medida; solo seguía en ejecución la animación puntual de seis segundos del hero.

Detalles, duración de la muestra y límites de esa observación en `visual-polish.md`. No se ha medido ni declarado una puntuación Lighthouse ni datos de usuarios reales.

## Actualización: panel, PWA, producción y marca original · 17/11/2026

- `npm run check`: lint y tipos correctos, **70 pruebas unitarias/integración correctas** y build de producción correcto. Las migraciones se ejecutan en PostgreSQL embebido, no en una DB remota.
- Web pública/seguridad/PWA: **71 E2E correctas y 1 omitida por diseño**, swipe desktop; móvil sí ejecutado. Incluyen logo original sin filtros, proporciones, PNG Open Graph real, scope privado, offline y caché limitada a cuatro recursos genéricos.
- Panel autenticado: **6 E2E correctas** con proveedor HTTPS de prueba separado de la aplicación y PostgreSQL/RLS real embebido. Login con/sin rol, CRUD, foto raster/Storage, auditoría, conflictos/referencias, desactivación, CMS, cambio de contraseña y nuevo login, siete anchos y bloqueo offline. Verifica cookies HttpOnly/Secure/SameSite=Lax, logout y volver atrás sin recuperar el resumen privado.
- Chrome informa manifest válido y cero errores de instalabilidad en la prueba autorizada. No se ha ejecutado una instalación nativa real en dispositivos del restaurante.
- `npm audit`: cero vulnerabilidades conocidas en la consulta ejecutada.
- `check:production`: **bloqueado como corresponde**, por ausencia de SITE_URL de producción, Supabase, Redis/token/sal reales. No se han rellenado valores ficticios para superarlo.
- Lighthouse desktop local ejecutado; resultados y condiciones en `production-audit.md`. No hay métricas de campo ni auditoría móvil Lighthouse en hosting real.

## Actualización: rediseño editorial y carta compacta/visual · 17/11/2026

- Sistema público con next/font local (Cormorant Garamond/Manrope), logo transparente, hero con teléfono/dirección compartidos y nueva composición completa.
- Carta compacta inicial y visual con una sola colección de 92 registros, sin duplicación de URLs o datos. No se reservan bloques fotográficos en filas compactas sin imagen; las fotos de categoría no se atribuyen a platos.
- Lint, typecheck, **70 pruebas unitarias/integración** y build correctos.
- Suite pública: **77 correctas y 1 omisión prevista** para swipe desktop. Pruebas nuevas de contacto verificado, ambas vistas, mismos productos/precios, filtros persistentes, WCAG 2.2 AA automatizada y los siete tamaños.
- Regresión privada: **6 E2E autenticadas correctas** con fixture HTTPS/PostgreSQL separado; no se modifica la autorización o persistencia por este rediseño.
- Lighthouse desktop local actualizado: inicio y carta **100/100/100/100**, LCP observado 214/146 ms, CLS 0. INP real de campo no medido.
- Revisadas capturas de home escritorio/móvil y carta en ambos modos. Fotografías reales necesarias y discrepancia de contacto documentadas en `premium-redesign.md`.
- Último ajuste de toolbar móvil/selector por iconos: 24 E2E de carta/editorial repetidas y correctas, incluyendo los 92 productos visibles en HTML sin JavaScript.

## Actualización: espacio de imagen y navbar adaptable · 17/11/2026

- La ficha ampliada siempre muestra `ProductImage`: foto asociada al producto o placeholder neutro accesible. Dos columnas desde `md`, apiladas en móvil. Las filas compactas y los 92 registros conservan su comportamiento y datos.
- Navbar de escritorio (desde 1280 px) transparente sobre el hero de inicio, con enlaces y logo claros; al bajar, fondo marfil con enlaces y logo oscuros. En otras páginas claras comienza con tinta oscura. Móvil/tablet mantienen fondo sólido y menú nativo.
- Fallback sin JavaScript con cabecera de escritorio sólida y legible al desplazarse. Cambio de tinta sin transición de color que produzca enlaces claros sobre marfil.
- Suite pública completa `npm run test:e2e`: **83 correctas y 1 omisión prevista**, swipe desktop probado en móvil. Nuevas regresiones de estados del navbar, contraste automatizado, variantes del logo y navegación sin JavaScript; las pruebas de ficha, foco, cierre y responsive siguen pasando.
- Build de producción con chequeo TypeScript correcto, ejecutado por el runner E2E. Lint final sin warnings. Las 70 pruebas unitarias/integración fueron correctas durante esta intervención.
- Capturas de navbar transparente/sólido y ficha con espacio de imagen revisadas. Verificación adicional del color calculado de enlaces tras scroll y captura sólida final a 1440 px, con fondo marfil y marca oscura.

## Actualización: carta real de bebidas · 17/11/2026

- Transcritas las seis imágenes facilitadas: **134 referencias**, en cervezas y otras bebidas (24), refrescos (14), café y té (20), ginebras (23), whisky (19) y licores (34). Pernod y Grand Marnier Amarillo se unifican solo por repetirse con el mismo precio.
- Procedencia `provided`, sin URL de fuente inventada ni descripciones, ingredientes, alérgenos, medidas o disponibilidad supuestos. El esquema admite descripción ausente y conserva el requisito de precio en las bebidas transcritas.
- **73 pruebas unitarias/integración correctas**. Integridad, cantidades por categoría, precios relevantes, formatos separados, opciones agrupadas, duplicados y búsqueda sin descripción verificados.
- Compilación de producción con TypeScript correcta y lint sin warnings. La aserción del adaptador CMS se adapta a la descripción nullable; el build posterior comprueba todos los tipos.
- Suite pública completa: **87 pruebas correctas y 1 omisión prevista** de swipe desktop; el gesto sí se prueba en móvil. Incluye las 134 bebidas en HTML sin JavaScript, aislamiento de demo, búsqueda/filtros, importes, ficha, foco, cambio a inglés conservando ruta, canonical, ambos modos y regresiones de gastronomía/navbar.
- axe sin infracciones detectadas en bebidas ES/EN; sin overflow en 320, 375, 430, 768, 1024, 1440 y 1920 px. Las mediciones Lighthouse anteriores no se han actualizado para esta intervención.
- Revisadas capturas de bebidas en escritorio (1440 px), móvil (375 px) y ficha de ginebra con precio e ilustración neutra de bebida.

## Actualización: acabado visual, seis idiomas y móvil · 17/11/2026

- Rediseño público con detalles editoriales CSS, selector ES/EN/FR/RO/IT/DE, rutas traducidas, categorías, canonical/hreflang, sitemap y Open Graph localizados.
- Limpieza visual solicitada: sin fotografías ambientales, notas de transcripción/pendientes o enlaces a la web anterior. Banner con etiqueta «Espacio para fotografía», sin recuadro lateral. Teléfonos en filas separadas y favicon derivado de `brand.webp`.
- Fichas de comida con «Descripción» y alérgenos publicados; sin ingredientes ni notas de procedencia. Bebidas sin descripción/ingredientes. Modelo de datos y precios conservados.
- Navbar transparente/sólido con transición de 280 ms en todos los tamaños. Menú móvil con despliegue/recogida, desplazamiento y opacidad (260/160 ms), inversión rápida y movimiento reducido; fondo de menú legible sobre cabecera clara.
- **107 E2E correctas y 1 omisión prevista**, swipe desktop probado en móvil. Incluyen seis idiomas con/sin JavaScript, ambos estados móviles, teclado, foco, contraste automatizado, ausencia de overflow tras actualización de viewport y posiciones de teléfonos en siete anchos.
- Lint final sin warnings, build de producción con TypeScript correcto y **74 unitarias/integración correctas** durante la intervención.
- Lighthouse local: inicio/carta/bebidas **100/100/100/100** en desktop y móvil simulado, CLS 0. LCP desktop observado 129/199/148 ms y móvil simulado 1059/1057/1059 ms en las muestras del acabado visual. La portada móvil se vuelve a medir tras unificar el navbar y animar el desplegable: mantiene 100/100/100/100 y CLS 0. Los informes distinguen dispositivos y condiciones; no hay datos de campo ni despliegue real.
- Capturas revisadas de banner, selector, catálogo, ficha y contacto en escritorio/móvil/tablet. Detalle y estado actual en `visual-refresh.md`.
- Ajuste posterior del favicon: ICO multirresolución 16/32/48 desde `brand.webp`, en la raíz y con URL versionada/enlace shortcut. Comprobado HTTP 200, MIME `image/x-icon` y decodificación de las tres imágenes; build/lint y cuatro E2E de identidad/metadata correctos.

## Actualización: traducción de productos de la carta · 18/11/2026

- Añadidos los 92 nombres y descripciones en EN/FR/RO/IT/DE, manteniendo el original ES. Denominaciones de bebidas traducidas; marcas y nombres propios conservados. Los 92 platos y 134 bebidas mantienen sus IDs, precios, alérgenos, disponibilidad y procedencia.
- Los diccionarios de platos se validan contra el conjunto de IDs; faltas de cobertura impiden pasar las pruebas. La búsqueda funciona en el idioma elegido y en español.
- `getLocalizedCatalog` limita el DTO público al idioma solicitado más el original, evitando enviar todos los idiomas al navegador.
- Lint, TypeScript y build correctos. **77 unitarias/integración correctas** y **121 E2E correctas + 1 omisión prevista**, ejecución final con cuatro workers. Verificados los cinco idiomas en tarjetas, fichas enlazadas, descripciones, atributos `lang`, búsqueda y bebidas, además de las regresiones completas de responsive, foco e hidratación.

## Límites de lo comprobado

### Corrección previa a publicación

El carrusel utiliza un estado inicial explícito de escala/desplazamiento y `tabIndex` determinista en sus controles para evitar diferencias entre SSR y el navegador al resolver `prefers-reduced-motion`. El título de inicio es «Taberna Don Juan» en los seis idiomas. Lint y build correctos; 47 E2E afectadas correctas y una omisión prevista, incluidas cuatro comprobaciones de hidratación con preferencias de movimiento normal/reducido y detección de errores de consola.

### Preview pública en Vercel

Publicada en `https://taberna-don-juan-prueba.vercel.app`, en la cuenta autorizada del usuario. Build remoto completado, HTTP 200 sin sesión de Vercel, inicio con título correcto, catálogo de 92 platos/134 bebidas, búsqueda, favicon, selector francés y menú/nav móvil comprobados con Chromium en contextos sin autenticar. No se observaron errores de hidratación en esta comprobación remota. El entorno es Preview y mantiene `noindex`; Supabase/Redis/Resend remotos siguen sin configurar.

GitHub Actions completó correctamente la CI del commit inicial `01471a1`. La auditoría npm consultada al desplegar detecta dos avisos altos en la cadena transitiva `next-intl → @parcel/watcher → picomatch` (GHSA-fc5q-39xc-vjpf); los resultados anteriores de auditoría son históricos, no una consulta actual de vulnerabilidades.

- **Supabase remoto no configurado:** no se han aplicado migraciones ni comprobado cuentas/Storage contra un proyecto remoto. PostgreSQL/RLS se verifica en PGlite y el flujo SDK/Next en un proveedor HTTPS de prueba explícito; no certifica la configuración externa.
- **Resend remoto no configurado:** pruebas del adaptador con el SDK simulado; no se han enviado correos ni verificado un dominio.
- **Accesibilidad:** axe y teclado son una base automatizada, no una auditoría manual completa con tecnologías de asistencia.
- **Rendimiento:** se ha comprobado el modo de renderizado y la compilación, no se han medido Core Web Vitals de usuarios reales ni Lighthouse en alojamiento definitivo.
- **PWA:** worker, caché, offline, logout e instalabilidad de Chromium verificados; instalación nativa/Safari/iOS y dispositivos reales pendientes.
- **Navegadores:** Chromium escritorio y emulación móvil; Safari y Firefox aún no forman parte de la matriz.

Los cambios posteriores deben volver a ejecutar las comprobaciones afectadas. No es necesario configurar secretos para las pruebas de esta fase.
