import { DNA_BODY, DNA_MARKETING_STACK } from "@/lib/design-dna";

export function NewsLoadingPanel({ message }: { message?: string }) {
  const label = message ?? "Loading news...";

  return (
    <div className={DNA_MARKETING_STACK} data-testid="news-loading">
      <div
        className="flex min-h-[40vh] flex-col items-center justify-center py-16"
        role="status"
        aria-live="polite"
        aria-label={label}
        data-testid="loading-spinner"
      >
        <div className="loading-spinner loading-spinner--md" aria-hidden>
          <div className="loading-spinner__arc" />
          <div className="loading-spinner__arc" />
          <div className="loading-spinner__arc" />
        </div>
        <p className={`mt-3 ${DNA_BODY}`}>{label}</p>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
