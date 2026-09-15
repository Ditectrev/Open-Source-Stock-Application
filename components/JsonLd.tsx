import { buildWebSiteJsonLd } from "@/lib/site-seo";
import { serializeJsonLd } from "@/lib/json-ld";

export function JsonLd({ data }: { data?: unknown } = {}) {
  const payload = data ?? buildWebSiteJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
    />
  );
}
