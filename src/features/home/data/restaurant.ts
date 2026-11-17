// Datos contrastados en la web oficial el 17/11/2026.
// No incluye datos de reservas. Procedencia: docs/content-sources.md.
export const restaurant = {
  address: "C. Sánchez Pastor, 10, Distrito Centro, 29015 Málaga",
  street: "C. Sánchez Pastor, 10",
  postcode: "29015",
  mobile: { display: "+34 615 279 494", href: "tel:+34615279494" },
  landline: { display: "+34 952 654 872", href: "tel:+34952654872" },
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Taberna Don Juan, C. Sánchez Pastor, 10, 29015 Málaga")}`,
  instagram: "https://www.instagram.com/tabernadonjuan24malagacentro/",
  facebook: "https://www.facebook.com/profile.php?id=61563966391418",
  verifiedAt: "2026-11-17",
} as const;

export const specialties = [
  { id: "croquettes", image: "/images/tapas.webp", productId: "tapas-small-croquetas-de-puchero" },
  { id: "rice", image: "/images/rice.webp", productId: "rice-menu-senoret-para-no-mancharse-los-dedos-con-sepia-langostinos-mejillones-y-gambas" },
  { id: "octopus", image: "/images/seafood.webp", productId: "sea-menu-pulpo-a-la-brasa" },
] as const;

export const categories = [
  { id: "tapas", image: "/images/tapas.webp", href: "/carta#categoria-tapas" },
  { id: "rice", image: "/images/rice.webp", href: "/carta#categoria-rice" },
  { id: "seafood", image: "/images/seafood.webp", href: "/carta#categoria-seafood" },
  { id: "meat", image: null, href: "/carta#categoria-meat" },
  { id: "desserts", image: "/images/desserts.webp", href: "/carta#categoria-desserts" },
  { id: "drinks", image: null, href: "/bebidas" },
] as const;
