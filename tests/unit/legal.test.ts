import { describe, expect, it } from "vitest";
import { locales } from "@/i18n/config";
import { legalDocuments, isLegalDocument } from "@/config/legal";
import { legalCopy } from "@/features/legal/content";

describe("documentos legales localizados", () => {
  it("mantiene los mismos apartados enlazables en los seis idiomas", () => {
    for (const locale of locales) {
      for (const document of legalDocuments) {
        const content = legalCopy[locale].documents[document];
        expect(content.title.length).toBeGreaterThan(5);
        expect(content.intro.length).toBeGreaterThan(40);
        const ids = content.sections.map((section) => section.id);
        expect(ids).toEqual(legalCopy.es.documents[document].sections.map((section) => section.id));
        expect(new Set(ids).size).toBe(ids.length);
        for (const section of content.sections) {
          expect(section.title.length).toBeGreaterThan(3);
          expect(section.paragraphs.every((paragraph) => paragraph.length > 30)).toBe(true);
        }
      }
      expect(legalCopy[locale].pendingIntro.length).toBeGreaterThan(50);
      expect(legalCopy[locale].identityFields.contactEmail.length).toBeGreaterThan(5);
    }
  });

  it("solo admite las tres rutas legales conocidas", () => {
    expect(legalDocuments.every(isLegalDocument)).toBe(true);
    expect(isLegalDocument("../../admin")).toBe(false);
    expect(isLegalDocument("inventado")).toBe(false);
  });
});
