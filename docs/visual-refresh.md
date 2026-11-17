# Acabado visual e idiomas · 17/11/2026

Este documento recoge el estado actual tras las correcciones visuales del usuario y sustituye las descripciones de presentación anteriores de `premium-redesign.md`.

## Presentación

- Dirección editorial cálida: Cormorant Garamond/Manrope locales, títulos de mayor presencia, marfil/nogal/oliva, acentos dorados, líneas finas y bordes suavizados. Fondos y detalles mediante CSS, sin vídeo, librerías nuevas ni parallax.
- Banner preparado para **una única imagen de fondo a todo el ancho**. No contiene sello DJ, texto lateral, arco ni recuadro fotográfico independiente. Sin foto configurada utiliza un fondo de color y una etiqueta discreta «Espacio para fotografía».
- Eliminadas las fotografías ambientales del banner, categorías e historia. Categorías e historia conservan seis espacios neutros; las fichas y vistas visuales conservan sus espacios de producto. Los archivos antiguos se mantienen como recursos del proyecto, pero no se solicitan en la presentación local actual.
- Las futuras fotografías propias del banner/historia se pueden asociar mediante las rutas de imagen publicadas del CMS. Las categorías se editan en la composición pública; los productos utilizan su campo de imagen existente.
- Retirados de la interfaz los textos de ambientación temporal, información sobre imágenes, procedencia/fecha de transcripción, avisos de datos pendientes, notas de precios y la frase provisional del footer legal.
- En contacto: «Horario», y móvil/fijo en filas independientes con etiqueta y número. Comprobados en siete anchos.
- Fichas de comida con «Descripción» y alérgenos publicados; sin sección de ingredientes ni nota de procedencia. Las fichas de bebida son compactas, sin descripción ni ingredientes. Los campos desconocidos no se convierten en datos afirmativos: permanecen en el modelo y se omiten de la presentación.
- Favicon generado desde `public/images/brand.webp` por `scripts/generate-icons.mjs`: ICO transparente de 16/32/48 px en `/favicon.ico`, con URL versionada `/favicon.ico?v=brand-2` y enlace `shortcut` en ambos layouts. Se conserva también el derivado PNG de 64×64. La ruta raíz cubre navegadores que buscan automáticamente `/favicon.ico`.

## Cabecera y menú móvil

- Mismo comportamiento en escritorio, tablet y móvil: transparente al inicio de la portada, sólido marfil al superar 20 px de scroll y transparente de nuevo al volver arriba. En páginas interiores usa superficie clara desde el inicio.
- Transiciones de superficie, tinta y bordes de **280 ms**, con cruce de opacidad entre los logos. Las dos variantes transparentes conservan la misma máscara, proporciones y caja; no cambian de tamaño al desplazarse.
- El desplegable móvil conserva fondo nogal y texto crema/dorado, incluso sobre cabecera blanca. Se anima mediante desplazamiento, opacidad y recorte: **260 ms** al abrir y **160 ms** al cerrar, sin mover el contenido de la página.
- Una nueva apertura puede invertir un cierre en curso. Escape, clic exterior, foco, `inert` durante salida y restablecimiento al pasar a escritorio siguen activos.
- Con movimiento reducido no se prolongan estas animaciones. Sin JavaScript, la cabecera permanece sólida y ambos selectores son disclosures nativos utilizables.

## Seis idiomas

- Español, inglés, francés, rumano, italiano y alemán: `es`, `en`, `fr`, `ro`, `it`, `de`.
- Selector desplegable con nombres nativos, idioma actual marcado, teclado/flechas/Home/End, Escape y cierre exterior. Conserva ruta y hash al cambiar de idioma. Sin precarga automática de las otras cinco rutas.
- Diccionarios completos de interfaz, home, cartas y footer; páginas legales traducidas. La carga de diccionarios se mantiene en servidor, sin enviar los seis al navegador.
- Categorías traducidas en las seis lenguas. Los nombres/descripciones de productos conservan el original cuando no hay traducción del registro; el atributo `lang` identifica correctamente ese texto. No se han traducido por inferencia ingredientes ni alérgenos de productos.
- Canonical/hreflang, sitemap, Open Graph y formato monetario adaptados. Las tres rutas principales por idioma se prerenderizan.
- El CMS conserva su contrato editorial ES/EN existente. En los idiomas nuevos se utiliza la traducción estática de la interfaz; textos de datos sin traducción conservan su fuente original.

## Enlaces

Retirados el enlace del footer a la web anterior y los enlaces externos de origen de las fichas. Los carruseles enlazan al catálogo interno. Las URLs de procedencia permanecen únicamente como trazabilidad del snapshot y en documentación, sin enlaces públicos accionables. Maps, teléfonos y redes verificadas siguen disponibles.

## Verificación

- Lint sin warnings y build de producción con TypeScript correctos.
- Corrección de compatibilidad/caché del favicon: ICO servido con HTTP 200 y `image/x-icon` en el servidor de desarrollo; cabecera y los tres PNG internos decodificados correctamente. Cuatro E2E de identidad/metadata repetidas en producción y correctas.
- 74 pruebas unitarias/integración correctas durante la intervención.
- Suite pública final: **107 E2E correctas y una omisión prevista** para swipe desktop; el gesto se ejecuta en el perfil móvil.
- Cobertura de seis idiomas, canonical/hreflang, 92 platos y 134 bebidas, navegación sin JS, selector con teclado, foco y salida de diálogos, estados del navbar en móvil/escritorio, apertura/cierre/inversión del menú, movimiento reducido y ausencia de enlaces a la web anterior.
- Capturas revisadas de banner, selector, carta, ficha, teléfonos y contacto en escritorio/móvil/tablet. Matriz habitual: 320, 375, 430, 768, 1024, 1440 y 1920 px; las pruebas de idiomas también cubren 1280 px. Tras cambiar el viewport se espera la actualización de layout de Chromium antes de evaluar overflow.
- Capturas finales específicas del navbar móvil transparente/blanco y del desplegable abierto, con cierre animado comprobado. La medición móvil de inicio se repite tras estos cambios finales y conserva 100/100/100/100, LCP simulado de 1059 ms y CLS 0.
- Lighthouse local de inicio, carta y bebidas: **100 rendimiento / 100 accesibilidad / 100 buenas prácticas / 100 SEO**, escritorio y móvil simulado. CLS 0 en las seis muestras. No son mediciones de usuarios reales ni del alojamiento definitivo.

Los informes se generan mediante `npm run audit:lighthouse -- /es /es/carta /es/bebidas` y `npm run audit:lighthouse -- --mobile /es /es/carta /es/bebidas`, en `lighthouse-report/`.
