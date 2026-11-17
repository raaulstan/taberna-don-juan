import type { AllergenCode, MenuCategory, MenuProduct } from "../domain/catalog";
import { categoryTranslations } from "./category-translations";

// Transcripción de la carta renderizada el 17/11/2026; docs/menu-data.md.
// Las listas de iconos vacías se almacenan como null, nunca como "sin alérgenos".
// No se deducen ingredientes ni disponibilidad a partir de las descripciones.
type Row = readonly [name: string, description: string, priceCents: number, allergens: readonly AllergenCode[]];
type Group = { id: string; parentId: string; label: string; english: string; path: string; rows: readonly Row[] };

const groups: Group[] = [
  { id: "tapas-small", parentId: "tapas", label: "Tapas", english: "Tapas", path: "tapas", rows: [
    ["Ensalada Malagueña", "Ensalada típica malagueña con ingredientes frescos y tradicionales.", 420, ["fish", "sulphites"]],
    ["Ensaladilla Rusa", "La clásica ensaladilla rusa hecha en casa.", 450, ["eggs", "fish"]],
    ["Salpicón de Marisco", "Una mezcla fresca de mariscos en aliño.", 450, ["shellfish", "fish", "sulphites", "molluscs"]],
    ["Porra Antequerana", "Una crema fría espesa hecha con tomate, pimiento y pan.", 300, ["gluten", "fish", "sulphites"]],
    ["Boquerones en Vinagre", "Boquerones marinados en vinagre con ajo y perejil.", 400, ["fish", "sulphites"]],
    ["Croquetas de Puchero", "Croquetas caseras hechas con el sabor tradicional del puchero.", 350, ["gluten", "milk", "nuts"]],
    ["Croquetas de Gambas al Pil Pil", "Croquetas caseras de gambas al pil pil, suaves y sabrosas.", 450, ["gluten", "milk", "nuts", "shellfish", "eggs"]],
    ["Anchoas del Cantábrico", "Anchoas frescas del Cantábrico, servidas con aceite de oliva virgen extra.", 400, ["fish"]],
    ["Pincho de Langostino", "Un pincho sabroso con langostinos frescos a la parrilla.", 500, ["shellfish"]],
    ["Queso Manchego", "Queso curado manchego con un sabor intenso y auténtico.", 500, ["milk"]],
    ["Pincho de Chistorra a la Brasa", "Un pincho de chistorra a la brasa con un toque ahumado.", 550, ["gluten"]],
    ["Morcilla de Arroz a la Brasa", "Morcilla de arroz a la brasa con un sabor intenso y delicioso.", 500, []],
    ["Alcachofas Flor en Vino de Montilla y Lascas de Jamón", "Alcachofas tiernas cocinadas en vino de Montilla con jamón ibérico.", 450, ["milk"]],
    ["Patatas Brava", "Crujientes patatas con una salsa picante irresistible.", 300, []],
    ["Caracoles a la Cordobesa", "Caracoles preparados con una receta típica de Córdoba.", 420, ["nuts"]],
    ["Bacalao al Pil Pil", "Un clásico bacalao al pil pil con su cremosa salsa.", 600, ["fish"]],
    ["Bacalao Frito", "Bacalao fresco frito en su punto perfecto.", 550, ["fish"]],
    ["Callos a la Andaluza", "Callos tiernos preparados al estilo tradicional andaluz.", 400, []],
    ["Judiones con Almejas", "Judiones grandes con almejas frescas en un guiso sabroso.", 450, ["shellfish", "fish", "molluscs"]],
    ["Langostinos al Pil Pil", "Langostinos frescos cocinados en una sabrosa salsa pil pil.", 500, ["shellfish", "fish", "molluscs"]],
    ["Tortitas de Bacalao", "Crujientes tortitas de bacalao, un bocado lleno de sabor.", 400, ["gluten", "shellfish", "eggs", "fish", "molluscs"]],
    ["Tortitas de Camarones", "Tortitas crujientes con camarones frescos.", 450, ["gluten", "shellfish", "eggs", "fish", "molluscs"]],
    ["Pincho de Tortilla", "Un clásico pincho de tortilla española, jugoso y sabroso.", 350, ["eggs"]],
  ] },
  { id: "sharing", parentId: "tapas", label: "Carta · Para compartir", english: "Menu · To share", path: "carta", rows: [
    ["Pimiento del Padrón", "Pimientos verdes fritos con un toque de sal, algunos pican, otros no...", 700, []],
    ["Berenjenas con Miel de Caña", "Crujientes rodajas de berenjena acompañadas con miel de caña, un clásico dulce-salado.", 850, []],
    ["Revuelto de la Casa", "Un revuelto especial con ingredientes frescos de la casa.", 1200, ["eggs"]],
    ["Anchoas del Cantábrico", "Exquisitas anchoas seleccionadas del mar Cantábrico.", 1850, ["fish"]],
    ["Patatas Bravas", "Crujientes patatas bravas con salsa picante casera.", 800, []],
    ["Porra Antequerana", "Una sopa fría típica de Antequera, elaborada con tomates y pan.", 950, ["fish", "sulphites"]],
    ["Jamón Ibérico de Bellota", "El mejor jamón ibérico, curado y alimentado con bellotas.", 2400, []],
    ["Queso Curado de Oveja", "Un queso curado con un sabor intenso y auténtico.", 1700, ["milk"]],
    ["Caña de Lomo Ibérica", "Exquisito lomo ibérico curado, ideal para compartir.", 1800, []],
    ["Parrillada de Verduras a la Brasa", "Un surtido de verduras frescas asadas a la brasa.", 1300, []],
    ["Croquetas Caseras de Gambas al Pil Pil", "Croquetas hechas en casa con el sabor auténtico del pil pil.", 1200, ["gluten", "milk", "nuts", "shellfish", "eggs"]],
    ["Croquetas Caseras de Puchero", "Croquetas tradicionales hechas con el sabor del puchero casero.", 1100, ["gluten", "milk", "nuts", "eggs"]],
    ["Ensaladilla Rusa Casera", "La clásica ensaladilla rusa hecha en casa con ingredientes frescos.", 1050, ["eggs", "fish"]],
    ["Ensalada Malagueña", "Ensalada fresca con ingredientes típicos de Málaga.", 1200, ["fish", "sulphites"]],
    ["Caracoles a la Cordobesa", "Caracoles guisados al estilo tradicional cordobés.", 1200, ["nuts"]],
    ["Albondigón", "Una gran albóndiga con sabores intensos y jugosos.", 900, ["gluten", "nuts", "eggs"]],
    ["Huevos Rotos con Jamón Ibérico", "Huevos rotos servidos con jamón ibérico de calidad.", 1300, ["gluten", "eggs"]],
    ["Flamenquín de Solomillo Ibérico", "Un delicioso flamenquín relleno de solomillo ibérico.", 1000, ["gluten", "milk", "eggs"]],
    ["Alcachofas Flor con Vino de Montilla y Lascas de Jamón Ibérico", "Tiernas alcachofas cocinadas con vino de Montilla y finas lascas de jamón ibérico.", 900, ["milk", "sulphites"]],
  ] },
  { id: "garden", parentId: "tapas", label: "Carta · De la huerta", english: "Menu · From the garden", path: "carta", rows: [
    ["Ensalada de Mix de Lechugas con Queso Feta, Tomate Cherry, Nueces y Vinagreta de Mostaza", "Una refrescante ensalada con mix de lechugas, queso feta, tomate cherry, nueces y vinagreta de mostaza.", 1450, ["nuts", "eggs", "mustard", "sulphites"]],
    ["Burrata Fresca de Búfala sobre Rúcula y Tomate Cherry Asados", "Una cremosa burrata fresca de búfala servida sobre rúcula y tomates cherry asados.", 1650, ["milk"]],
    ["Tomate de Huevo de Toro con Anchoas", "Un tomate huevo de toro fresco y jugoso acompañado de anchoas de calidad.", 1450, ["fish"]],
    ["Tomate con Bonito", "Un plato sencillo y delicioso de tomate fresco acompañado de bonito.", 1250, ["fish"]],
    ["Tomate Aliñado", "Un plato refrescante de tomate aliñado con aceite de oliva y especias.", 900, []],
  ] },
  { id: "stews", parentId: "tapas", label: "Carta · Guisos", english: "Menu · Stews", path: "carta", rows: [
    ["Judiones con Almejas", "Un plato tradicional con judiones tiernos y almejas frescas en un caldo sabroso.", 950, ["shellfish", "fish", "molluscs"]],
    ["Gazpachuelo", "Una reconfortante sopa malagueña a base de pescado blanco y una suave crema.", 1050, ["shellfish", "eggs", "fish", "molluscs"]],
    ["Callos a la Andaluza", "Un guiso andaluz tradicional con callos cocidos lentamente en una rica salsa.", 950, []],
  ] },
  { id: "rice-menu", parentId: "rice", label: "Arroces", english: "Rice dishes", path: "arroces", rows: [
    ["Señoret para no mancharse los dedos con sepia, langostinos, mejillones y gambas", "Delicioso arroz señoret con sepia, langostinos, mejillones y gambas, ideal para disfrutar sin mancharse los dedos.", 2300, ["shellfish", "fish", "molluscs"]],
    ["Caldoso de Bogavante y Almejas de Carril", "Un sabroso arroz caldoso con bogavante y almejas de carril, lleno de sabor marinero.", 2500, ["shellfish", "fish", "molluscs"]],
    ["Paella de Secreto y Boletus", "Una exquisita paella con secreto ibérico y boletus frescos.", 2300, []],
    ["Arroz Negro y Alioli", "Un delicioso arroz negro con un toque de alioli casero.", 1600, ["shellfish", "eggs", "fish", "molluscs"]],
    ["Paella Vegetal", "Una paella saludable y llena de color con verduras frescas.", 1400, []],
  ] },
  { id: "sea-menu", parentId: "seafood", label: "De la mar", english: "From the sea", path: "delamar", rows: [
    ["Boquerones Vitorianos", "Frescos boquerones fritos al estilo tradicional.", 1200, ["gluten", "fish"]],
    ["Calamaritos Fritos", "Tiernos calamaritos fritos con un toque crujiente.", 1200, ["gluten", "molluscs"]],
    ["Rabas de Calamar", "Crujientes rabas de calamar ideales para compartir.", 1600, ["molluscs"]],
    ["Pulpo a la Brasa", "Delicioso pulpo a la brasa con un toque ahumado.", 2150, ["milk", "molluscs"]],
    ["Gambas al Pil Pil", "Gambas frescas cocinadas con ajo y guindilla en aceite.", 950, ["shellfish"]],
    ["Gambas de la Caleta Cocidas o a la Plancha", "Gambas frescas servidas cocidas o a la plancha.", 1800, ["shellfish"]],
    ["Pulpo a la Gallega con Cachelos", "Tradicional pulpo a la gallega con patatas cachelos.", 1900, ["molluscs"]],
    ["Gambas Cristal Fritas", "Crujientes gambas cristal fritas, ideales para picar.", 1350, ["shellfish"]],
    ["Mejillones Don Juan", "Mejillones frescos al estilo especial de la casa.", 1450, ["molluscs"]],
  ] },
  { id: "fish-menu", parentId: "seafood", label: "Carta · Pescados", english: "Menu · Fish", path: "carta", rows: [
    ["Atún Rojo a la Brasa con Escabeche de Cítricos", "Un delicioso atún rojo a la brasa acompañado de un escabeche de cítricos.", 1800, ["milk", "fish", "sulphites"]],
    ["Bacalao al Pil Pil", "Un plato clásico de bacalao cocinado al pil pil con una salsa cremosa.", 1900, ["fish"]],
    ["Lomos de Lubina a la Brasa con Verduras", "Lomos de lubina frescos a la brasa acompañados de verduras salteadas.", 1800, ["fish"]],
    ["Calamar a la Brasa con Verduras", "Calamar fresco a la brasa acompañado de una guarnición de verduras.", 2500, ["molluscs"]],
    ["Bacalao Confitado a Baja Temperatura con Crema de Pimientos del Piquillo", "Bacalao confitado lentamente acompañado de una cremosa salsa de pimientos del piquillo.", 1850, ["milk", "fish"]],
    ["Salmón a la Brasa con Verduras Asadas", "Un delicioso salmón a la brasa acompañado de verduras asadas.", 1650, ["fish"]],
    ["Lenguado a la Plancha con Verduras Asadas", "Un lenguado fresco a la plancha acompañado de verduras asadas.", 1750, ["fish"]],
  ] },
  { id: "meat-menu", parentId: "meat", label: "Carta · Carnes", english: "Menu · Meat", path: "carta", rows: [
    ["Lomo de Ternera a la Brasa con Patatas Baby y Verduras Asadas", "Un jugoso lomo de ternera a la brasa acompañado de patatas baby y deliciosas verduras asadas.", 2500, []],
    ["Solomillo de Ternera con Foie y Puré de Trufa", "Un exquisito solomillo de ternera con foie y un puré de trufa suave y cremoso.", 2800, ["milk", "eggs"]],
    ["Secreto Ibérico con Patatas Fritas y Pimientos del Padrón", "Jugoso secreto ibérico servido con crujientes patatas fritas y pimientos del padrón.", 1900, []],
    ["Rabo de Toro con Patatas Fritas", "Un plato tradicional de rabo de toro acompañado de patatas fritas.", 1800, ["celery", "sulphites"]],
    ["Carrillada Ibérica al Vino Tinto sobre Parmentier de Patatas", "Tierna carrillada ibérica cocinada al vino tinto sobre un suave parmentier de patatas.", 1900, ["sulphites"]],
    ["Paletilla de Cordero con Patatas Asadas", "Jugosa paletilla de cordero servida con deliciosas patatas asadas.", 2900, []],
    ["Cochinillo Asado con Patatas Asadas", "Crujiente cochinillo asado acompañado de patatas asadas al horno.", 2800, []],
    ["Pechuga de Pollo a la Brasa o Empanada con Patatas Fritas", "Sabrosa pechuga de pollo a la brasa o empanada servida con patatas fritas.", 1390, ["gluten"]],
  ] },
  { id: "desserts-menu", parentId: "desserts", label: "Postres", english: "Desserts", path: "postres", rows: [
    ["Leche Frita con Helado de Turrón", "Un postre tradicional de leche frita acompañado de helado de turrón.", 650, ["gluten", "milk", "nuts", "eggs"]],
    ["Torrija Caramelizada con Helado de Leche Merengada", "Una torrija caramelizada servida con helado de leche merengada.", 550, ["gluten", "milk", "nuts", "eggs"]],
    ["Tocino de Cielo", "Un postre andaluz tradicional hecho de yema de huevo y azúcar.", 650, ["eggs"]],
    ["Tarta de Queso de la Viña", "La famosa tarta de queso cremosa y horneada al estilo de La Viña.", 650, ["milk", "eggs"]],
    ["Tarta de Chocolate", "Un delicioso pastel de chocolate, rico y esponjoso.", 600, ["gluten", "milk", "nuts", "eggs"]],
    ["Fruta de Temporada", "Una selección de frutas frescas de temporada.", 500, []],
    ["Helado de Turrón, Chocolate, Vainilla", "Helado cremoso con sabores clásicos de turrón, chocolate y vainilla.", 550, ["milk", "nuts", "eggs"]],
  ] },
  { id: "extras", parentId: "tapas", label: "Carta · Complementos", english: "Menu · Extras", path: "carta", rows: [
    ["Pan", "Un complemento básico y esencial.", 150, ["gluten"]],
    ["Verdurita Asada", "Verduras frescas y asadas a la perfección.", 400, []],
    ["Patatas Fritas", "Crujientes y doradas patatas fritas.", 400, []],
    ["Salsa a la Pimienta", "Una deliciosa salsa cremosa con pimienta.", 300, ["gluten", "milk", "celery"]],
    ["Salsa Roquefort", "Salsa cremosa elaborada con queso roquefort.", 300, ["milk"]],
    ["Salsa Mahonesa", "Salsa suave y cremosa de mahonesa.", 200, ["eggs"]],
  ] },
];

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const foodCategories: MenuCategory[] = [
  ...([
    ["tapas", "Tapas y entrantes", "Tapas and starters"],
    ["rice", "Arroces", "Rice dishes"],
    ["seafood", "Pescados y mariscos", "Fish and seafood"],
    ["meat", "Carnes", "Meat dishes"],
    ["desserts", "Postres", "Desserts"],
  ] as const).map(([id, es, en], order) => ({ id, kind: "food" as const, label: { es, en, ...categoryTranslations[id] }, parentId: null, order })),
  ...groups.map((group, order) => ({ id: group.id, kind: "food" as const, label: { es: group.label, en: group.english, ...categoryTranslations[group.id] }, parentId: group.parentId, order })),
];

export const officialProducts: MenuProduct[] = groups.flatMap((group) => group.rows.map(([name, description, priceCents, allergens]) => ({
  id: `${group.id}-${slug(name)}`,
  kind: "food" as const,
  categoryId: group.id,
  name: { es: name },
  description: { es: description },
  priceCents,
  currency: "EUR" as const,
  image: null,
  ingredients: null,
  allergens: allergens.length ? [...allergens] : null,
  availability: "unknown" as const,
  additionalInformation: null,
  origin: "official" as const,
  sourceUrl: `https://tabernadonjuan.com/${group.path}`,
})));

export const featuredProductIds = [
  "tapas-small-croquetas-de-puchero",
  "rice-menu-senoret-para-no-mancharse-los-dedos-con-sepia-langostinos-mejillones-y-gambas",
  "sea-menu-pulpo-a-la-brasa",
];
