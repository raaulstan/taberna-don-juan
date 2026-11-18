# Carta gastronómica y bebidas

## Rutas y alcance

- `/{locale}/carta`: catálogo gastronómico estático con búsqueda local, categorías, secciones, carrusel y fichas modales.
- `/{locale}/bebidas`: 134 referencias de bebidas transcritas de las seis imágenes facilitadas, con precios, categorías, búsqueda y fichas ampliadas. Idiomas: `es`, `en`, `fr`, `ro`, `it`, `de`.
- La home y la navegación enlazan a estas rutas. Los precios del carrusel de inicio proceden del mismo catálogo gastronómico.
- Por defecto sigue el snapshot local. El panel añade persistencia y un adaptador Supabase activable mediante `PUBLIC_DATA_SOURCE=supabase`; no se ha conectado un proyecto remoto en esta sesión ni hay disponibilidad de reservas en tiempo real.
- Las reservas siguen suspendidas según `deferred-reservations.md`.

## Fuentes y transcripción

Consulta de la aplicación oficial renderizada con Chromium el **17/11/2026**. Las fichas se transcriben en `src/features/menu/data/official-snapshot.ts`.

| Fuente | Sección | Referencias |
| --- | --- | ---: |
| `https://tabernadonjuan.com/tapas` | Tapas | 23 |
| `https://tabernadonjuan.com/arroces` | Arroces | 5 |
| `https://tabernadonjuan.com/delamar` | De la mar | 9 |
| `https://tabernadonjuan.com/postres` | Postres | 7 |
| `https://tabernadonjuan.com/carta` | Para compartir | 19 |
| Misma carta | De la huerta | 5 |
| Misma carta | Guisos | 3 |
| Misma carta | Carnes | 8 |
| Misma carta | Pescados | 7 |
| Misma carta | Complementos | 6 |
| **Total** | | **92** |

En `/carta`, la fuente monta duplicados responsive de las mismas fichas. Se ha conservado una sola referencia por nombre y sección, sin duplicar esos nodos de presentación. Sí se conservan variantes reales entre secciones, por ejemplo **Bacalao al Pil Pil: 6 € en tapas y 19 € en carta/pescados**. La sección aparece en tarjeta y ficha para no confundir formatos. No se inventan unidades, gramajes, tamaños de ración ni precios por persona.

Las cinco categorías raíz solicitadas son configuración editorial de la nueva interfaz. Las secciones originales permanecen como subcategorías: tapas, compartir, huerta, guisos y complementos bajo «Tapas y entrantes»; de la mar y pescados bajo «Pescados y mariscos». Los identificadores, etiquetas, orden y relaciones están en datos, no en la lógica de filtrado.

### Datos que no están disponibles

- **Fotografías de producto:** las fichas de origen usan una imagen genérica de plato vacío, que no se importa como fotografía real. `image: null` utiliza una ilustración neutra accesible y proporción reservada; también sustituye imágenes que fallen al cargar. Las filas compactas sin foto no reservan miniatura. No se atribuye una fotografía de categoría a un producto.
- **Ingredientes:** la descripción se copia completa, pero no se convierte en una lista de ingredientes. El dato se conserva en el contrato; por petición del usuario, la interfaz pública ya no muestra la sección de ingredientes.
- **Alérgenos:** se transcriben únicamente los iconos con alt publicados junto a cada ficha, sin corregirlos ni deducirlos de la receta. «Lacteos» se presenta como «Lácteos». «Mariscos» y «Frutos Secos» se conservan como rótulos amplios de la fuente, sin convertirlos en declaraciones más precisas. La ausencia de iconos o el texto automático «No allergens» se convierte en **información pendiente**, nunca en «sin alérgenos».
- **Disponibilidad:** todos los registros oficiales tienen `availability: "unknown"`. La interfaz omite ese estado en lugar de declarar disponibilidad por el mero hecho de estar publicado.
- **Descripción extendida:** se muestra el texto completo disponible; no se redactan detalles culinarios adicionales como si fueran oficiales.
- **Idiomas:** controles, metadata, categorías y los 92 nombres/descripciones locales traducidos a las seis lenguas. Los cinco diccionarios de platos están en `data/translations/food-*.json`, indexados por ID estable; la composición comprueba las entradas para evitar traducciones ausentes. Las notas editoriales de procedencia se conservan en documentación, sin aparecer en la carta pública.

## Bebidas facilitadas · 17/11/2026

El usuario aportó seis imágenes de la carta. La transcripción está en `src/features/menu/data/drinks-snapshot.ts`, conectada al proveedor local y disponible en ambas lenguas. La procedencia es **`provided`**, distinta de la carta gastronómica consultada por URL (`official`), de la demo y del CMS. No se inventa una URL para los adjuntos: `sourceUrl: null`.

| Lámina de origen | Categoría de interfaz | Referencias |
| --- | --- | ---: |
| Cerveza | Cervezas y otras bebidas | 24 |
| Refrescos | Refrescos | 14 |
| Café y Te | Café y té | 20 |
| Ginebras | Ginebras | 23 |
| Whisky | Whisky | 19 |
| Licores | Licores | 34 |
| **Total** | | **134** |

- Se elimina únicamente la segunda aparición de **Pernod (5 €)** y **Grand Marnier Amarillo (6 €)** en la lámina de licores: mismo nombre, categoría y precio.
- **Jarra (10 €)** y **Jarra cerveza (11 €)** permanecen separadas. También se conservan caña/pinta/jarra y los distintos formatos de tinto y sangría, sin asignar mililitros, tamaños o suplementos no publicados.
- Coca Cola/Light/Zero, Fanta Naranja/Limón y Aquarius Naranja/Limón permanecen como opciones agrupadas en una referencia por línea, como en la imagen.
- Los precios se almacenan en céntimos, incluidos **Johnnie Walker Blue (75 €)** y **Johnnie Walker Premier (100 €)**. No se corrigen importes llamativos por suposición.
- Se normalizan mayúsculas y acentos para lectura. Rótulos particulares como «Beefeather», «Brockman», «Martes Sant Azul/Rojos», «Southern Confort», «Limoncel», «Pappermint», «Manzanill» y «Vermú Conde de Artoiz» conservan la denominación visible; pueden revisarse editorialmente con el restaurante. «London N 1» se presenta como «London Nº 1».
- Las imágenes no aportan descripciones, composición, alérgenos, disponibilidad ni fotos individuales: esos campos son `null`/`unknown`. Por petición del usuario, las bebidas no muestran descripción ni ingredientes y omiten datos ausentes. La vista visual y la ficha usan la ilustración neutra de bebida cuando falta foto.
- Las seis categorías, controles y denominaciones genéricas de bebidas están traducidos a los seis idiomas. Marcas, variantes comerciales y nombres propios conservan su grafía. Búsqueda sin acentos, filtros combinables, modos compacto/visual, enlaces directos y lectura SSR reutilizan el explorador existente. La búsqueda incluye el texto traducido y el original español.
- La portada y metadata describen la selección real. Las notas de transcripción y composición no se muestran en la interfaz. La llamada mantiene el teléfono verificado.

### Demostración aislada

`demo-drinks.ts` contiene **tres registros de demostración**, con subcategorías de ejemplo (vinos, cervezas, sin alcohol). No tienen precio, foto, receta ni alérgenos supuestos. Permiten probar búsqueda, filtros, fichas y los tres estados de disponibilidad. Los estados también están identificados como ejemplos.

La demostración:

- Está en un archivo y catálogo diferentes de los datos oficiales.
- Se conserva dentro de un disclosure rotulado solo en desarrollo y cuando el proveedor no publica bebidas; no se muestra junto a las 134 bebidas reales ni se sirve a clientes en producción.
- Marca cada tarjeta y ficha como **«no es carta real»**.
- Usa `data-nosnippet` y no genera ofertas ni datos estructurados de productos.
- No puede mezclarse accidentalmente con los datos reales: Zod valida que la procedencia de cada producto coincida con la del catálogo.

## Contrato y sustitución del proveedor

```text
app/[locale]/carta o bebidas (RSC)
  → getCatalog(kind, repository?)
  → MenuRepository.getCatalog(kind): Promise<MenuCatalog>
  → localMenuRepository (server-only)
  → catalogSchema.parse(snapshot)
  → CatalogExplorer / ProductCard / ProductDetails
```

`features/menu/domain/catalog.ts` define tipos y validación. Los importes se almacenan en **céntimos enteros**, moneda EUR; los datos desconocidos son `null` o `unknown`, no cero ni arrays que aparenten ausencia confirmada. Las descripciones también admiten `null` cuando la fuente solo publica nombre/precio. Las categorías soportan raíz y un nivel de subcategorías con orden configurable. Se rechazan duplicados, referencias huérfanas, jerarquías inválidas, productos de otra procedencia y especialidades inexistentes. Los registros `official` requieren URL y precio; los `provided` requieren precio, sin atribuirles una URL de origen inexistente.

El cliente recibe solo datos serializables. Importa los tipos de Zod mediante `import type`; el esquema y el proveedor no entran en el bundle del explorador. La ficha y sus primitivas de diálogo se cargan bajo demanda con `React.lazy` y `Suspense`.

Las páginas de carta usan `getLocalizedCatalog(kind, locale)` para proyectar nombres, descripciones, categorías y demás textos al idioma solicitado más el original español. El resto de idiomas se queda en el servidor. Los IDs, precios, alérgenos, disponibilidad y procedencia no se alteran por esa proyección. El catálogo local contiene las traducciones completas; el proveedor CMS mantiene el fallback al original para registros remotos sin traducción.

El adaptador Supabase ya está implementado en `services/menu/supabase-menu-repository.ts`. Para activarlo:

1. Configurar proyecto/migraciones, primer propietario y publicaciones reales según `administration.md`.
2. Revisar y publicar datos antes de cambiar el proveedor y recompilar. No se copian automáticamente las 92 referencias a una DB existente.
3. El adaptador mantiene UUID de productos, slugs de categoría, traducciones y procedencia `managed`. Rechaza datos inválidos en lugar de aparentar éxito con el snapshot.
4. Las lecturas públicas usan cliente anónimo sin cookies, RLS y tags/ISR de cinco minutos. Las acciones invalidan esas publicaciones después del commit.
5. Fotos limitadas al origen configurado y ruta `restaurant-media`; `next/image` tiene la misma whitelist.
6. Ingredientes, alérgenos y disponibilidad pendientes continúan explícitos; no se completan por inferencia.

No se incluye un adaptador Supabase vacío que simule consultas o éxitos.

## Interacción y accesibilidad

- Búsqueda por términos combinados, normalizada sin acentos y sin distinguir mayúsculas; se combina con categoría y sección.
- Filtros mediante botones `aria-pressed`, select nativo y contador vivo. Restablecer devuelve el foco al buscador.
- Enlaces compartibles `#categoria-<id>` y `#producto-<id>`. El cambio de idioma conserva `/carta` o `/bebidas`; no se presupone que cada cambio de filtro sea una entrada nueva del historial.
- Carrusel existente conservado y ampliado con indicadores accionables y apertura opcional de fichas. Scroll snap nativo, flechas, Home/End, swipe y movimiento reducido; sin autoplay.
- Dialog Radix/shadcn: título y descripción accesible asociados, foco inicial en título, bloqueo del fondo, tabulación contenida, Escape, cierre explícito y restitución al botón de origen. En bebidas, la categoría proporciona la descripción accesible sin añadir una sección de descripción visible. Los enlaces directos sin botón previo devuelven foco al buscador.
- Todo el catálogo se incluye en HTML estático e indexable. Sin JavaScript se puede leer la carta y desplazar el carrusel; búsqueda y diálogos requieren hidratación, indicado en un `noscript` servido por el RSC.
- Fotos con `next/image`, tamaños reservados y carga diferida; placeholders sin red ni imagen rota.

El rediseño añade vista compacta inicial y visual sin duplicar la colección. Los productos permanecen en HTML SSR en ambas configuraciones; el modo solo cambia presentación local y no altera canonical. La selección de especialidades es un desplegable opcional y nunca sustituye la cuadrícula por un carrusel de 92 platos. Véase `premium-redesign.md`.

Las rutas tienen canonical, alternancias de idioma, títulos y descripciones propios, y se incluyen en sitemap. La ruta vacía de reservas permanece excluida.
