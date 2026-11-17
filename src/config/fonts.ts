import localFont from "next/font/local";

export const editorialFont = localFont({
  src: [
    { path: "../../public/fonts/cormorant-garamond-latin.woff2", weight: "400 700", style: "normal" },
    { path: "../../public/fonts/cormorant-garamond-italic-latin.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-editorial",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const interfaceFont = localFont({
  src: "../../public/fonts/manrope-latin.woff2",
  weight: "400 700",
  variable: "--font-interface",
  display: "swap",
  adjustFontFallback: "Arial",
});
