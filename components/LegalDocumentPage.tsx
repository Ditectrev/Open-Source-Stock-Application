import Link from "next/link";
import type { LegalDocument, LegalInline } from "@/lib/legal-content";
import { isLegalLink } from "@/lib/legal-content";
import {
  DNA_BODY,
  DNA_BODY_SECONDARY,
  DNA_CALLOUT,
  DNA_CAPTION,
  DNA_DISPLAY,
  DNA_EYEBROW,
  DNA_HEADING,
  DNA_HERO_LEAD,
  DNA_MARKETING_STACK,
  DNA_SECTION_RULE,
} from "@/lib/design-dna";
import { SITE_NAME } from "@/lib/site-seo";

const legalLinkClass =
  "underline decoration-stone-400 underline-offset-2 hover:text-stone-900 dark:hover:text-stone-100";

function LegalRichText({ parts }: { parts: readonly LegalInline[] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (!isLegalLink(part)) {
          return <span key={index}>{part}</span>;
        }

        const className = legalLinkClass;
        if (part.href.startsWith("/")) {
          return (
            <Link key={index} href={part.href} className={className}>
              {part.label}
            </Link>
          );
        }

        const isMailOrTel =
          part.href.startsWith("mailto:") || part.href.startsWith("tel:");
        return (
          <a
            key={index}
            href={part.href}
            className={className}
            {...(isMailOrTel
              ? {}
              : { target: "_blank", rel: "noopener noreferrer" })}
          >
            {part.label}
          </a>
        );
      })}
    </>
  );
}

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  const showAdviceCallout = document.slug === "terms-of-use";

  return (
    <div className={DNA_MARKETING_STACK} data-testid={`${document.slug}-page`}>
      <header className={DNA_SECTION_RULE}>
        <p className={DNA_EYEBROW}>Resources · Legal</p>
        <h1 className={`mt-3 ${DNA_DISPLAY}`}>{document.title}</h1>
        <p className={`mt-4 max-w-3xl ${DNA_HERO_LEAD}`}>{document.subtitle}</p>
        <p className={`mt-3 ${DNA_CAPTION}`}>
          {SITE_NAME} product copy — not a substitute for professional advice.
        </p>
      </header>

      {showAdviceCallout ? (
        <p className={DNA_CALLOUT} data-testid="not-advice-callout">
          {SITE_NAME} is not legal, tax, accounting, or investment advice.
          Charts, AI, rankings, and news are informational only. You can lose
          money. Get qualified advice before you act.
        </p>
      ) : null}

      {document.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${document.slug}-${section.id}-heading`}
          className="scroll-mt-24"
        >
          <h2
            id={`${document.slug}-${section.id}-heading`}
            className={DNA_HEADING}
          >
            {section.title}
          </h2>
          <div className="mt-3 max-w-3xl space-y-3">
            {section.blocks.map((block, blockIndex) => {
              if (block.type === "ul") {
                return (
                  <ul
                    key={blockIndex}
                    className={`list-disc space-y-2 pl-5 ${DNA_BODY}`}
                  >
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <LegalRichText parts={item} />
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={blockIndex} className={DNA_BODY}>
                  <LegalRichText parts={block.parts} />
                </p>
              );
            })}
          </div>
        </section>
      ))}

      <p className={`max-w-3xl ${DNA_BODY_SECONDARY}`}>
        Related:{" "}
        <Link href="/copyrights" className={legalLinkClass}>
          Copyrights
        </Link>
        {" · "}
        <Link href="/privacy-and-security" className={legalLinkClass}>
          Privacy &amp; Security
        </Link>
        {" · "}
        <Link href="/terms-of-use" className={legalLinkClass}>
          Terms of Use
        </Link>
        {" · "}
        <Link href="/sitemap" className={legalLinkClass}>
          Sitemap
        </Link>
      </p>
    </div>
  );
}
