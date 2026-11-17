# Contenido de la página de inicio

Consulta realizada el **17/11/2026** en <https://tabernadonjuan.com/>, renderizando su aplicación JavaScript con Chromium. Su HTML inicial no contiene el contenido, pero este sí puede consultarse tras ejecutar la aplicación.

## Datos contrastados

| Dato | Valor publicado | Fuente |
| --- | --- | --- |
| Dirección | C. Sánchez Pastor, 10, Distrito Centro, 29015 Málaga | `/contacto` |
| Móvil | +34 615 279 494 | Enlace `tel:` en inicio y contacto |
| Fijo | +34 952 654 872 | Enlace `tel:` en `/contacto` |
| Horario | Lunes–domingo, 12:00–00:00 | `/contacto` |
| Instagram | `https://www.instagram.com/tabernadonjuan24malagacentro/` | Footer oficial |
| Facebook | `https://www.facebook.com/profile.php?id=61563966391418` | Footer oficial |
| Croquetas de Puchero | 3,50 € en tapas | `/tapas` |
| Arroz señoret con sepia, langostinos, mejillones y gambas | 23 € | `/arroces` |
| Pulpo a la Brasa | 21,50 € | `/delamar` |

Las descripciones y la narración mediterránea se han resumido a partir de `/sobrenosotros` y las cartas anteriores. No se reproduce la referencia relativa a «principios de este año»: no permite fechar con certeza la apertura. No se inventan propietarios, años de fundación, premios ni una historia centenaria.

El enlace al mapa es una búsqueda de Google Maps construida con la dirección publicada, no unas coordenadas supuestas. No se integra un iframe de terceros. El enlace genérico a Twitter de la web original se ha descartado: no identifica un perfil oficial del restaurante. No se publica correo electrónico sin confirmar.

Los precios son los importes mostrados por la fuente, sin inferir unidades/personas/raciones cuando no están especificadas. Las croquetas de la sección carta tienen otro precio: se indica expresamente que la selección utiliza el precio de **tapas**. La página muestra la fecha de consulta y pide confirmar la carta vigente.

## Imágenes: procedencia y límites

Bucket de la web oficial:

`https://buckettabernadonjuan8791.s3.us-east-1.amazonaws.com/`

| Archivo local | Recurso original | Uso |
| --- | --- | --- |
| `public/images/brand.webp` | `Banners/IconLogo.svg` | Símbolo publicado como favicon oficial; tratamiento monocromo para la cabecera |
| `tavern-atmosphere.webp` | `Categorias/CabeceraNosotros.webp` | Ambientación del hero; **no fotografía verificada del local** |
| `table-atmosphere.webp` | `Categorias/CabeceraContacto.webp` | Ambientación editorial; **no fotografía verificada del local** |
| `tapas.webp` | `Categorias/Tapas.webp` | Ilustración de categoría; no acredita el plato del carrusel |
| `rice.webp` | `Categorias/Arroces.webp` | Ilustración de categoría; no acredita el plato del carrusel |
| `seafood.webp` | `Categorias/De+la+mar.webp` | Ilustración de categoría; no acredita el plato del carrusel |
| `desserts.webp` | `Categorias/CabeceraPostres.webp` | Ambientación de la categoría postres |

Se ha revisado visualmente el material: no hay base para presentarlo como fotografía documental del restaurante ni de los platos concretos. Cada uso lleva una indicación visible de ambientación/ilustración. En carnes y bebidas no se ha localizado imagen adecuada: se muestra un panel tipográfico con icono y **«Fotografía pendiente»**. No se reutiliza la imagen `Pulpo.png`, que lleva un alt de otro restaurante en la web de origen.

Los recursos están incorporados localmente y optimizados con Sharp; `next/image` genera sus variantes responsive. No hay peticiones al bucket durante build o navegación. Para reimportarlos de forma explícita:

```bash
npm run assets:official
```

La reimportación requiere red y reemplaza estos derivados. No está acoplada a `prebuild`. El script nunca importa los banners de reservas de la web original. El monograma técnico de los iconos PWA no se ha sustituido en esta fase.

## Información todavía pendiente

- Imagen de referencia del diseño: no disponible como adjunto en la conversación. La dirección visual utiliza la paleta y el briefing; no se declara una reproducción pixel-perfect.
- Fotografía panorámica real del restaurante, fotografías reales de los platos e imágenes de carnes/bebidas.
- Carta de bebidas y precios: placeholder explícito, con enlace de consulta telefónica.
- Aviso legal y política de privacidad: textos pendientes de la propiedad. Se muestran como pendientes, sin enlaces falsos ni documentos legales inventados.
- Revisión final de textos, traducciones, imágenes y derechos de publicación por la propiedad.

## Logotipo original aportado

El usuario ha facilitado `public/images/logo-oficial.png` (257×132). Se conserva el original y se genera WebP sin pérdida, PNG social e iconos adaptativos mediante `assets:icons`. La cabecera, footer, acceso, panel, metadata y schema utilizan esa marca completa, con colores originales y proporciones reservadas. Este archivo sustituye la identidad provisional, no es una imagen de ambientación ni una recreación del logo.

La nueva fase incorpora `/es/carta`, `/en/carta`, `/es/bebidas` y `/en/bebidas`. Las categorías y especialidades de la home enlazan ahora al catálogo local con filtros o fichas compartibles. Las rutas originales (`/tapas`, `/arroces`, `/delamar`, `/carta`, `/postres`) se conservan como fuentes de procedencia de cada producto. La transición de esas URLs antiguas al cambiar el dominio debe definirse antes del lanzamiento. Véase `menu-data.md` para las 92 referencias y los límites de los datos.
