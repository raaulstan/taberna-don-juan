import type { Locale } from "@/i18n/config";
import type { LocalizedText } from "../domain/catalog";
import { expandFoodDescription } from "./description-additions";
import en from "./translations/food-en.json";
import fr from "./translations/food-fr.json";
import ro from "./translations/food-ro.json";
import it from "./translations/food-it.json";
import de from "./translations/food-de.json";

export const translatedProductLocales = ["en", "fr", "ro", "it", "de"] as const satisfies readonly Locale[];
export const foodTranslations: Record<(typeof translatedProductLocales)[number], Record<string, string[]>> = { en, fr, ro, it, de };

export function translatedFoodText(id: string, spanishName: string, spanishDescription: string) {
  const name: LocalizedText = { es: spanishName };
  const description: LocalizedText = { es: expandFoodDescription(id, "es", spanishDescription) };
  for (const locale of translatedProductLocales) {
    const row = foodTranslations[locale][id];
    if (!row || row.length !== 2 || !row[0]?.trim() || !row[1]?.trim()) throw new Error(`Falta la traducción ${locale} del producto ${id}.`);
    name[locale] = row[0];
    description[locale] = expandFoodDescription(id, locale, row[1]);
  }
  return { name, description };
}

// Se traducen denominaciones y variantes descriptivas. Las marcas y nombres
// propios conservan su grafía, sin atribuir medidas ni composición adicional.
const drinkNames: Record<string, readonly [string, string, string, string, string]> = {
  "Caña": ["Caña (draught beer)", "Caña (bière pression)", "Caña (bere la draft)", "Caña (birra alla spina)", "Caña (Bier vom Fass)"],
  "Pinta": ["Pint", "Pinte", "Pintă", "Pinta", "Pint"],
  "Jarra": ["Jug", "Pichet", "Carafă", "Caraffa", "Krug"],
  "Tinto de verano": ["Tinto de verano", "Tinto de verano", "Tinto de verano", "Tinto de verano", "Tinto de verano"],
  "Pinta tinto de verano": ["Pint of tinto de verano", "Pinte de tinto de verano", "Pintă de tinto de verano", "Pinta di tinto de verano", "Pint Tinto de verano"],
  "Jarra tinto de verano": ["Jug of tinto de verano", "Pichet de tinto de verano", "Carafă de tinto de verano", "Caraffa di tinto de verano", "Krug Tinto de verano"],
  "Tinto con limón": ["Red wine with lemon soft drink", "Vin rouge avec soda au citron", "Vin roșu cu răcoritoare de lămâie", "Vino rosso con bibita al limone", "Rotwein mit Zitronenlimonade"],
  "Pinta tinto con limón": ["Pint of red wine with lemon soft drink", "Pinte de vin rouge avec soda au citron", "Pintă de vin roșu cu răcoritoare de lămâie", "Pinta di vino rosso con bibita al limone", "Pint Rotwein mit Zitronenlimonade"],
  "Jarra tinto con limón": ["Jug of red wine with lemon soft drink", "Pichet de vin rouge avec soda au citron", "Carafă de vin roșu cu răcoritoare de lămâie", "Caraffa di vino rosso con bibita al limone", "Krug Rotwein mit Zitronenlimonade"],
  "Jarra de sangría": ["Jug of sangría", "Pichet de sangría", "Carafă de sangría", "Caraffa di sangría", "Krug Sangría"],
  "Cerveza sin alcohol": ["Alcohol-free beer", "Bière sans alcool", "Bere fără alcool", "Birra analcolica", "Alkoholfreies Bier"],
  "Jarra cerveza": ["Jug of beer", "Pichet de bière", "Carafă de bere", "Caraffa di birra", "Krug Bier"],
  "Fanta Naranja / Limón": ["Fanta Orange / Lemon", "Fanta Orange / Citron", "Fanta Portocale / Lămâie", "Fanta Arancia / Limone", "Fanta Orange / Zitrone"],
  "Aquarius Naranja / Limón": ["Aquarius Orange / Lemon", "Aquarius Orange / Citron", "Aquarius Portocale / Lămâie", "Aquarius Arancia / Limone", "Aquarius Orange / Zitrone"],
  "Mosto tinto": ["Red grape must", "Moût de raisin rouge", "Must de struguri roșii", "Mosto d’uva rossa", "Roter Traubenmost"],
  "Zumo de piña": ["Pineapple juice", "Jus d’ananas", "Suc de ananas", "Succo d’ananas", "Ananassaft"],
  "Zumo de naranja": ["Orange juice", "Jus d’orange", "Suc de portocale", "Succo d’arancia", "Orangensaft"],
  "Zumo de melocotón": ["Peach juice", "Jus de pêche", "Suc de piersici", "Succo di pesca", "Pfirsichsaft"],
  "Zumo de manzana": ["Apple juice", "Jus de pomme", "Suc de mere", "Succo di mela", "Apfelsaft"],
  "Agua con gas": ["Sparkling water", "Eau gazeuse", "Apă minerală carbogazoasă", "Acqua frizzante", "Wasser mit Kohlensäure"],
  "Café solo": ["Black coffee", "Café noir", "Cafea neagră", "Caffè nero", "Schwarzer Kaffee"],
  "Expresso": ["Espresso", "Expresso", "Espresso", "Espresso", "Espresso"],
  "Café con leche": ["Coffee with milk", "Café au lait", "Cafea cu lapte", "Caffè latte", "Milchkaffee"],
  "Café cortado": ["Cortado coffee", "Café cortado", "Cafea cortado", "Caffè cortado", "Cortado-Kaffee"],
  "Café americano": ["Americano coffee", "Café americano", "Cafea americano", "Caffè americano", "Americano-Kaffee"],
  "Sombra": ["Sombra coffee", "Café sombra", "Cafea sombra", "Caffè sombra", "Sombra-Kaffee"],
  "Nube": ["Nube coffee", "Café nube", "Cafea nube", "Caffè nube", "Nube-Kaffee"],
  "Café bombón": ["Bombón coffee", "Café bombón", "Cafea bombón", "Caffè bombón", "Bombón-Kaffee"],
  "Carajillo brandy": ["Coffee with brandy", "Café au brandy", "Cafea cu brandy", "Caffè con brandy", "Kaffee mit Brandy"],
  "Carajillo whisky": ["Coffee with whisky", "Café au whisky", "Cafea cu whisky", "Caffè con whisky", "Kaffee mit Whisky"],
  "Café irlandés": ["Irish coffee", "Café irlandais", "Cafea irlandeză", "Caffè irlandese", "Irischer Kaffee"],
  "Poleo menta": ["Pennyroyal mint infusion", "Infusion de menthe pouliot", "Infuzie de mentă polei", "Infuso di menta poleggio", "Poleiminztee"],
  "Manzanill": ["Chamomile infusion", "Infusion de camomille", "Infuzie de mușețel", "Infuso di camomilla", "Kamillentee"],
  "Té verde": ["Green tea", "Thé vert", "Ceai verde", "Tè verde", "Grüner Tee"],
  "Té rojo": ["Red tea", "Thé rouge", "Ceai roșu", "Tè rosso", "Roter Tee"],
  "Té clásico": ["Classic tea", "Thé classique", "Ceai clasic", "Tè classico", "Klassischer Tee"],
  "Tila": ["Linden infusion", "Infusion de tilleul", "Infuzie de tei", "Infuso di tiglio", "Lindenblütentee"],
  "Té rooibos": ["Rooibos tea", "Thé rooibos", "Ceai rooibos", "Tè rooibos", "Rooibostee"],
  "Té americano": ["American tea", "Thé américain", "Ceai american", "Tè americano", "Amerikanischer Tee"],
  "Té con leche": ["Tea with milk", "Thé au lait", "Ceai cu lapte", "Tè con latte", "Tee mit Milch"],
  "Chupito": ["Shot", "Shot", "Shot", "Shot", "Shot"],
  "Anís": ["Anise liqueur", "Liqueur d’anis", "Lichior de anason", "Liquore all’anice", "Anislikör"],
  "Ponche": ["Punch liqueur", "Liqueur de ponche", "Lichior ponche", "Liquore ponche", "Ponche-Likör"],
  "Martini rojo": ["Red Martini", "Martini rouge", "Martini roșu", "Martini rosso", "Roter Martini"],
  "Martini blanco": ["White Martini", "Martini blanc", "Martini alb", "Martini bianco", "Weißer Martini"],
  "Licor sin alcohol": ["Alcohol-free liqueur", "Liqueur sans alcool", "Lichior fără alcool", "Liquore analcolico", "Alkoholfreier Likör"],
  "Orujo blanco": ["White orujo", "Orujo blanc", "Orujo alb", "Orujo bianco", "Weißer Orujo"],
  "Orujo hierbas": ["Herbal orujo", "Orujo aux herbes", "Orujo de plante", "Orujo alle erbe", "Kräuter-Orujo"],
  "Ron miel": ["Honey rum", "Rhum au miel", "Rom cu miere", "Rum al miele", "Honigrum"],
  "Vermú Petroni blanco": ["Petroni white vermouth", "Vermouth Petroni blanc", "Vermut Petroni alb", "Vermouth Petroni bianco", "Weißer Petroni-Wermut"],
  "Vermú Petroni rojo": ["Petroni red vermouth", "Vermouth Petroni rouge", "Vermut Petroni roșu", "Vermouth Petroni rosso", "Roter Petroni-Wermut"],
  "Vodka caramelo": ["Caramel vodka", "Vodka au caramel", "Vodcă cu caramel", "Vodka al caramello", "Karamellwodka"],
  "Vermú Conde de Artoiz": ["Conde de Artoiz vermouth", "Vermouth Conde de Artoiz", "Vermut Conde de Artoiz", "Vermouth Conde de Artoiz", "Conde-de-Artoiz-Wermut"],
};

export function translatedDrinkName(spanishName: string): LocalizedText {
  const name: LocalizedText = { es: spanishName };
  translatedProductLocales.forEach((locale, index) => { name[locale] = drinkNames[spanishName]?.[index] ?? spanishName; });
  return name;
}
