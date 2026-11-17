# Rediseño editorial premium · 17/11/2026

> Estado visual actual y correcciones posteriores: [Acabado visual e idiomas](visual-refresh.md). Incluye seis idiomas, limpieza de textos/imágenes, banner sin recuadro lateral, favicon y navbar/menú móvil animados.

## Auditoría previa y límites

Se revisaron rutas, layouts RSC, componentes interactivos, tokens, fuentes, medios y contratos de datos. La home anterior repetía bloques de tarjetas grandes; el catálogo mostraba 92 fichas verticales con espacios fotográficos vacíos, y el buscador quedaba después de un carrusel grande. Las fuentes eran Georgia/Arial. Algunas imágenes de categoría se mostraban junto a platos concretos pese a no representar esos platos; la historia utilizaba un café con un teléfono/mapa.

La intervención se limita a presentación pública, assets y pruebas. No cambia autenticación, permisos, esquema Supabase, mutaciones, productos, precios, alérgenos o información verificada. Las pruebas autenticadas del panel se repiten como regresión. `/reservas` permanece vacía, noindex y fuera de sitemap.

## Dirección visual y composición

- Serif editorial **Cormorant Garamond**, normal/italic variable; sans **Manrope** variable. Tres WOFF2 latinos bajo OFL, servidos mediante `next/font/local`, con fallbacks métricos y swap. Sin peticiones a Google Fonts durante build o navegación.
- Tokens fluidos, contenedor de 1328 px, titulares controlados y ritmo de fondos marfil/arena/oliva/nogal. Tipografía pública mediante variables en su body; el panel conserva sus fallbacks existentes.
- Cabecera proporcionada, logotipo transparente, selector de idiomas compacto y llamada discreta. En escritorio (desde 1280 px), la home comienza con cabecera transparente sobre el hero y marca/enlaces claros; al superar 20 px de scroll pasa a fondo marfil con marca oscura, enlaces nogal y acentos oliva. Las demás páginas claras usan tinta oscura desde el inicio. Móvil/tablet conservan su fondo sólido oscuro y el cierre accesible del menú.
- Hero cercano a `100svh - header` en móvil/tablet y `100svh` en escritorio, con espacio superior para la cabecera superpuesta, imagen con color visible y degradado localizado. La información no usa posiciones absolutas que se superpongan: texto, acciones y contacto se distribuyen en flujo flex.
- Destacados de altura moderada; imagen solo si pertenece al producto. Sin foto se usa ilustración abstracta neutra, nunca una foto de embutidos para croquetas.
- Galería de categorías con una pieza principal y cuatro piezas secundarias; bebidas integradas en una franja oliva compacta. Se eliminan etiquetas técnicas visibles dentro de las tarjetas.
- Historia asimétrica con imagen ambiental coherente y caption temporal explícito, sin la fotografía del café/móvil ni fechas familiares inventadas.
- Contacto inferior completo y footer reagrupado en móvil, evitando cuatro bloques verticales innecesariamente largos.

## Contacto: discrepancia resuelta sin modificar los datos

Los valores propuestos en la referencia **no coinciden** con la fuente verificada del proyecto. Se conservan:

- Móvil: **+34 615 279 494**, destino `tel:+34615279494`.
- Dirección: **C. Sánchez Pastor, 10, Distrito Centro, 29015 Málaga**.

No se adoptan +34 648 02 59 68 ni Calle Calderón de la Barca, 2. Hero, footer, contacto, cabecera y bebidas consumen `getPublicRestaurant`; `readablePhone` solo aplica formato visual sin cambiar números. El hero incorpora HTML real, iconos decorativos, llamada y Google Maps por dirección, sin coordenadas supuestas. La sección inferior se conserva con horarios, teléfonos, email solo si publicado, direcciones, redes y cierres informativos.

## Carta: una lista, dos presentaciones

`CatalogExplorer` conserva una única colección y lógica de filtrado. `view` es estado local, no genera URLs ni copias de productos.

- **Compacta por defecto:** dos columnas desde tablet/escritorio, una en móvil; composición horizontal, precio alineado, descripción breve y metadatos discretos. Si no hay foto, no existe espacio fotográfico reservado.
- **Visual:** tres columnas en escritorio amplio, dos en tablet, una en móvil; fotos auténticas cuando existen y placeholders gráficos proporcionados, sin repetir textos de fotografía pendiente.
- Búsqueda, categoría y sección combinables; chips desplazables en móvil con estado activo visible, contador, limpiar y reset. El estado vacío usa la misma acción de reset de la barra, sin botones duplicados.
- La selección de especialidades sigue disponible en un disclosure nativo, cerrado inicialmente para dar prioridad al catálogo. No se convierte el conjunto de 92 productos en un carrusel.
- Fichas ampliadas conservan foco, Escape, descripción completa, precio y datos disponibles. Por petición posterior, siempre reservan un espacio de imagen: foto propia del producto cuando existe o ilustración neutra accesible cuando falta. Imagen e información se distribuyen en dos columnas desde `md` y se apilan en móvil; las filas compactas del catálogo siguen sin reservar imagen cuando falta.
- Mapas y resultados memorizados; tarjetas `memo`, callback estable y sin suscripciones/animaciones Motion por cada fila. El cambio de modo anima solo el indicador pequeño, no la altura/layout de 92 productos.
- Los 92 productos se renderizan en HTML antes de JavaScript. La vista predeterminada no depende de una petición del navegador, virtualización ni paginación que oculte contenido a buscadores.

Los registros demo de bebidas se conservan en el proyecto y en desarrollo si el proveedor no publica bebidas, pero **no se sirven en producción**. Tras recibir seis imágenes de la carta, bebidas publica 134 referencias reales en seis categorías, con los mismos modos compacto/visual, búsqueda y fichas. No se elimina ningún producto real. La transcripción y sus dos duplicados de origen se documentan en `menu-data.md`.

## Logo sin fondo

`scripts/transparent-logo.mjs` elimina el papel del original raster, incluidos los huecos internos de letras, con alpha, eliminación de grano aislado y limpieza de matte. Recorta únicamente margen transparente y reserva un borde pequeño; no redibuja la marca.

- Original conservado: `logo-oficial.png`.
- Tinta oscura/rosa para superficies claras y schema: `logo-oficial.webp` y `logo-oficial-transparente.png`.
- Variante clara con rosa roja para fondos oscuros: `logo-oficial-claro.webp`, usada en la web y panel. Solo la cabecera pública utiliza ambas variantes superpuestas para adaptar la marca al fondo; la segunda imagen es decorativa para evitar duplicar el nombre accesible.
- PNG social, favicon y maskable regenerados. Los iconos del sistema mantienen un lienzo plano apropiado para máscaras; la marca usada en HTML es transparente.

El proceso se ejecuta antes de desarrollo/build. Las proporciones provienen del derivado y el color no depende de filtros CSS. Para la mejor definición futura se recomienda un original vectorial aprobado; la extracción no inventa detalle del raster aportado.

La cabecera cambia la tinta de enlaces al mismo tiempo que la superficie para evitar texto claro transitorio sobre marfil. Sin JavaScript, un fallback `noscript` mantiene la cabecera de escritorio sólida y oscura de tinta, también al desplazarse. El menú móvil conserva su disclosure nativo.

## Rendimiento, SEO y accesibilidad

RSC/ISR, proyecciones, cliente público anónimo, tags de invalidación, permisos y rutas se conservan. Solo los controles del catálogo/navegación/movimiento son cliente; diálogos bajo demanda. Imágenes con `next/image`, sizes según miniatura/vista y precarga del hero. No hay autoplay, zooms agresivos ni animación repetida de todos los resultados. Se respeta movimiento reducido.

Metadata, canonical, hreflang, sitemap, schema Restaurant, alt y enlaces permanecen. El modo no altera canonical ni crea contenido duplicado. Lenguas ES/EN conservadas; los textos de origen siguen identificados cuando no hay traducción de producto.

Matriz de comprobación: 320, 375, 430, 768, 1024, 1440 y 1920 px; ambos modos, hero/contacto, menús, foco, teclado y estados vacíos. Nuevas pruebas axe incluyen etiquetas WCAG 2.2 AA. Esto no sustituye una auditoría manual completa con lectores de pantalla reales.

Se ejecutaron 70 pruebas unitarias/integración, la suite pública completa (77 correctas, 1 swipe desktop omitido porque se prueba en móvil) y las 6 E2E autenticadas de regresión. Tras compactar el toolbar móvil y reforzar la comprobación de los 92 productos sin JavaScript, se repitieron las 24 pruebas de carta/editorial: todas correctas. No se han eliminado datos ni pruebas para conseguir la compilación.

Tras añadir el espacio de imagen en la ficha y los estados de cabecera, la suite pública completa termina con **83 pruebas correctas y 1 omisión prevista** (swipe desktop). Incluye transparencia inicial, scroll, logos y contraste, rutas claras, móvil y fallback sin JavaScript. La compilación de producción con TypeScript y el lint final son correctos. Revisadas capturas de cabecera transparente/sólida y ficha con placeholder; la captura sólida final confirma enlaces oscuros sobre marfil.

Lighthouse desktop local del rediseño, 1440×900, `provided`, modo local: `/es` y `/es/carta` 100/100/100/100, LCP observado 214/146 ms y CLS 0. Son muestras locales, no datos de usuarios ni garantías de Core Web Vitals. **INP de campo no está medido.**

## Fotografías y contenido necesarios

1. Panorámica real del restaurante, con resolución suficiente para hero de escritorio y recorte móvil.
2. Fotos auténticas de Croquetas de Puchero, Arroz señoret y Pulpo a la Brasa, asociadas al producto correcto.
3. Fotos propias de categorías, especialmente carnes, postres y bebidas, y una imagen real editorial del ambiente/cocina.
4. Revisión editorial de los rótulos particulares de las bebidas facilitadas, composición/alérgenos y traducciones pendientes.

El hero/historia actuales siguen siendo recursos ambientales temporales de la fuente oficial, no fotografías verificadas del local. Su procedencia se declara junto a la imagen y en «Sobre nuestras imágenes», sin etiquetas invasivas por categoría.

## Archivos principales

- `src/app/(public)/[locale]/page.tsx`, `layout.tsx`, `carta/page.tsx`, `bebidas/page.tsx`.
- `src/app/public-design.css`, ajuste de tokens tipográficos en `globals.css`.
- `src/config/fonts.ts`, `public/fonts/*`, `scripts/import-fonts.mjs` (reimportación explícita, fuera del build).
- Header público, navegación, footer, `BrandLogo`, helpers de formato de teléfono.
- `CatalogExplorer`, `ProductCard`, `ProductImage`, `ProductDetails`, carrusel reutilizado y `DishArtwork`.
- Procesado de logo/iconos y sus derivados.
- Traducciones, E2E editorial y regresiones existentes ajustadas a los nuevos textos/controles.
