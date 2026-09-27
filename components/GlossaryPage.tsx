import {
  GLOSSARY_CATEGORIES,
  glossaryTermSlug,
} from "@/lib/glossary-content";
import {
  DNA_BODY,
  DNA_BODY_SECONDARY,
  DNA_CAPTION,
  DNA_DISPLAY,
  DNA_EYEBROW,
  DNA_HEADING,
  DNA_HERO_LEAD,
  DNA_INSTRUMENT_PANEL,
  DNA_MARKETING_STACK,
  DNA_SECTION_RULE,
  DNA_SUBHEADING,
} from "@/lib/design-dna";
import { SITE_NAME } from "@/lib/site-seo";

export function GlossaryPage() {
  return (
    <div className={DNA_MARKETING_STACK} data-testid="glossary-page">
      <header className={DNA_SECTION_RULE}>
        <p className={DNA_EYEBROW}>Resources · Reference</p>
        <h1 className={`mt-3 ${DNA_DISPLAY}`}>Glossary</h1>
        <p className={`mt-4 max-w-3xl ${DNA_HERO_LEAD}`}>
          Plain-language definitions for stocks, ETFs, crypto, and the market
          tools you use in {SITE_NAME}. Built for DIY long-term investors—not
          as trading advice.
        </p>
        <p className={`mt-3 ${DNA_CAPTION}`}>
          Jump to a section:{" "}
          {GLOSSARY_CATEGORIES.map((category, index) => (
            <span key={category.id}>
              {index > 0 ? " · " : null}
              <a
                href={`#${category.id}`}
                className="underline decoration-stone-400 underline-offset-2 hover:text-stone-900 dark:hover:text-stone-100"
              >
                {category.label}
              </a>
            </span>
          ))}
        </p>
      </header>

      {GLOSSARY_CATEGORIES.map((category) => (
        <section
          key={category.id}
          id={category.id}
          aria-labelledby={`glossary-${category.id}-heading`}
          className="scroll-mt-24"
        >
          <h2 id={`glossary-${category.id}-heading`} className={DNA_HEADING}>
            {category.label}
          </h2>
          <p className={`mt-2 max-w-3xl ${DNA_BODY_SECONDARY}`}>
            {category.description}
          </p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {category.terms.map((item) => {
              const slug = glossaryTermSlug(item.term);
              return (
                <li key={item.term} id={slug} className="scroll-mt-24">
                  <article className={`h-full ${DNA_INSTRUMENT_PANEL}`}>
                    <h3 className={DNA_SUBHEADING}>{item.term}</h3>
                    <p className={`mt-2 ${DNA_BODY}`}>{item.definition}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
