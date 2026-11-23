// Completar únicamente con datos reales del titular. Los campos vacíos se
// muestran expresamente como pendientes en los documentos públicos.
export const legalIdentity = {
  name: "",
  taxId: "",
  registeredAddress: "",
  contactEmail: "",
  registryDetails: "",
};

export const legalConfiguration = {
  updatedAt: "2026-11-23",
  businessType: "unconfirmed" as "unconfirmed" | "individual" | "company",
  hostingTermsConfirmed: false,
  retentionCriteriaConfirmed: false,
};

export const legalDocuments = ["privacidad", "cookies", "aviso-legal"] as const;
export type LegalDocument = (typeof legalDocuments)[number];

export function isLegalDocument(value: string): value is LegalDocument {
  return legalDocuments.some((document) => document === value);
}
