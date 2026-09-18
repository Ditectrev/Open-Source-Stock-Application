import { DNA_DISPLAY, DNA_PAGE_STACK } from "@/lib/design-dna";

export function LegalPlaceholderPage({ title }: { title: string }) {
  return (
    <div className={DNA_PAGE_STACK} data-testid="legal-placeholder-page">
      <h1 className={DNA_DISPLAY}>{title}</h1>
    </div>
  );
}
