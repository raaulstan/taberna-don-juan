# Carta gastronómica y bebidas: archivos locales

## Contenido

La web ofrece `/{locale}/carta` y `/{locale}/bebidas` en español, inglés, francés, rumano, italiano y alemán. Los productos se mantienen en código, sin base de datos ni panel de edición.

| Archivo | Uso |
| --- | --- |
| `src/features/menu/data/official-snapshot.ts` | 92 referencias de comida, precios y alérgenos publicados |
| `src/features/menu/data/drinks-snapshot.ts` | 134 referencias de bebidas y precios |
| `src/features/menu/data/translations/food-*.json` | Nombres/descripciones de platos en EN/FR/RO/IT/DE |
| `src/features/menu/data/product-translations.ts` | Composición de traducciones y nombres de bebidas |
| `src/features/menu/data/category-translations.ts` | Categorías traducidas |

## Procedencia

La carta gastronómica se transcribió de las páginas públicas del restaurante el 17/11/2026:

| Sección | Referencias |
| --- | ---: |
| Tapas | 23 |
| Para compartir | 19 |
| De la huerta | 5 |
| Guisos | 3 |
| Arroces | 5 |
| De la mar | 9 |
| Pescados | 7 |
| Carnes | 8 |
| Postres | 7 |
| Complementos | 6 |
| **Total** | **92** |

Las bebidas proceden de las seis imágenes facilitadas por el usuario:

| Categoría | Referencias |
| --- | ---: |
| Cervezas y otras bebidas | 24 |
| Refrescos | 14 |
| Café y té | 20 |
| Ginebras | 23 |
| Whisky | 19 |
| Licores | 34 |
| **Total** | **134** |

Pernod y Grand Marnier Amarillo se repetían con igual precio en la misma lámina: se conserva una referencia de cada uno. Formatos con importes distintos, como Jarra y Jarra cerveza, permanecen separados. Las opciones agrupadas de refrescos conservan su agrupación original.

## Contrato y edición

Los precios son céntimos enteros de EUR. Los datos no facilitados se conservan como `null` o `unknown`, sin deducir composición, alérgenos, tamaño o disponibilidad. Los IDs de los productos incluyen su sección para distinguir formatos, como bacalao al pil-pil en tapas y en carta.

Zod valida el catálogo y rechaza IDs duplicados, categorías huérfanas, procedencias mezcladas, precios inválidos y destacados inexistentes. Las imágenes deben ser rutas locales bajo `/images/`.

Al añadir un plato se completa su ID en los cinco diccionarios. Las traducciones de platos mantienen el significado de la descripción de origen. Las marcas y nombres propios de bebidas conservan su grafía; las denominaciones descriptivas se traducen.

La pequeña colección `demo-drinks.ts` sirve exclusivamente para pruebas de contratos/proveedores y no se mezcla con las 134 bebidas reales. La carta de producción se obtiene siempre del repositorio local.

## Flujo de presentación

```text
Archivos locales → localMenuRepository → getCatalog
  → getLocalizedCatalog(kind, locale)
  → página RSC → CatalogExplorer → ProductCard / ProductDetails
```

El DTO cliente contiene únicamente el idioma elegido y el original español. La búsqueda utiliza ambos textos, normalizados sin acentos y sin distinguir mayúsculas. Los demás diccionarios permanecen en servidor.

El catálogo usa una sola colección con modos compacto/visual, búsqueda, categoría y sección combinables. Los productos se incluyen en HTML indexable; sin JS se pueden leer nombres, descripciones y precios.

Las fichas de comida muestran descripción y alérgenos publicados. Las bebidas usan una ficha compacta sin descripción ni ingredientes. Los espacios de imagen conservan proporción; las filas compactas sin foto no reservan miniatura.

## Accesibilidad

Filtros con estado anunciado, reset con devolución del foco y enlaces `#categoria-...`/`#producto-...`. Diálogos con título/descripción accesible, foco contenido, Escape y restitución al origen. Carrusel con scroll snap, flechas, Home/End, indicadores y swipe, sin autoplay. Se respeta el movimiento reducido.
