/**
 * Product copy for Copyrights, Privacy & Security, and Terms of Use.
 * Adapted from ditectrev.com legal pages for The Open Stock (not a design agency).
 */

import { COMPANY_LEGAL, FOOTER_CONTACT } from "@/lib/footer-content";
import { SITE_NAME } from "@/lib/site-seo";

export type LegalLink = {
  href: string;
  label: string;
};

export type LegalInline = string | LegalLink;

export type LegalBlock =
  | { type: "p"; parts: readonly LegalInline[] }
  | { type: "ul"; items: readonly (readonly LegalInline[])[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: readonly LegalBlock[];
};

export type LegalDocument = {
  slug: "copyrights" | "privacy-and-security" | "terms-of-use";
  title: string;
  subtitle: string;
  path: string;
  description: string;
  keywords: readonly string[];
  sections: readonly LegalSection[];
};

const MAILTO: LegalLink = {
  href: `mailto:${FOOTER_CONTACT.email}`,
  label: FOOTER_CONTACT.email,
};

const TEL: LegalLink = {
  href: `tel:${FOOTER_CONTACT.phone.replace(/\s+/g, "")}`,
  label: FOOTER_CONTACT.phone,
};

const TERMS: LegalLink = {
  href: "/terms-of-use",
  label: "Terms of Use",
};

const COPYRIGHTS: LegalLink = {
  href: "/copyrights",
  label: "Copyrights",
};

const PRIVACY: LegalLink = {
  href: "/privacy-and-security",
  label: "Privacy & Security",
};

const HOME: LegalLink = {
  href: "/",
  label: "theopenstock.com",
};

export const COPYRIGHTS_DOCUMENT: LegalDocument = {
  slug: "copyrights",
  title: "Copyrights",
  subtitle: "Before you copy anything from us, kindly read this carefully.",
  path: "/copyrights",
  description: `Copyrights for ${SITE_NAME}: site content, software, and third-party market data.`,
  keywords: ["copyrights", "intellectual property", "market data attribution"],
  sections: [
    {
      id: "content",
      title: "Content",
      blocks: [
        {
          type: "p",
          parts: [
            "Content on ",
            HOME,
            " — including copy, charts UI, graphics, layout, original software, and other material we publish — belongs to ",
            `${COMPANY_LEGAL.legalName} (${COMPANY_LEGAL.tradingAs})`,
            ", its affiliates, contributors, or licensors, except where a third party owns it. Third-party material includes market data, news, research, company names, logos, and ticker symbols.",
          ],
        },
        {
          type: "p",
          parts: [
            "Unless the ",
            TERMS,
            ", a license we publish, or the law says otherwise, you may not adapt, copy, scrape or extract data, distribute, frame, rebrand, reverse engineer, republish, or otherwise use that Content in a way that causes us loss. The same applies to manual use and to automated tools such as robots, spiders, or scrapers.",
          ],
        },
        {
          type: "p",
          parts: [
            "Nothing here grants you a license to our copyrights, trademarks, or product, except the rights we expressly give you. You need written permission from the owner for any other use.",
          ],
        },
      ],
    },
    {
      id: "licensing",
      title: "Licensing",
      blocks: [
        {
          type: "p",
          parts: [
            `${SITE_NAME} is provided with all rights reserved unless we publish a license for a given asset. In some scenarios we might publish source under a permissive license (for example BSD, ISC, or MIT) or another license; that has to be agreed with us. Viewing the `,
            {
              href: COMPANY_LEGAL.githubRepo,
              label: "GitHub repository",
            },
            " does not by itself grant a license to rebrand or commercially reuse the product.",
          ],
        },
      ],
    },
    {
      id: "content-infringes",
      title: "Content infringes",
      blocks: [
        {
          type: "p",
          parts: [
            "If you believe Content on this site infringes your rights or a third party's, contact us with enough detail to identify the material and the rights holder. We will look into it and may remove the material. Knowingly making a misrepresentation may expose you to liability.",
          ],
        },
      ],
    },
    {
      id: "material-from-the-website",
      title: "Material from the website",
      blocks: [
        {
          type: "p",
          parts: [
            "Material from the website may be re-used without written permission where a statutory exception to copyright applies in your jurisdiction.",
          ],
        },
      ],
    },
  ],
};

export const PRIVACY_DOCUMENT: LegalDocument = {
  slug: "privacy-and-security",
  title: "Privacy & Security",
  subtitle:
    "We respect your privacy, but running this site requires some of your data.",
  path: "/privacy-and-security",
  description: `How ${SITE_NAME} collects, uses, and protects personal data for accounts, trials, and the hosted app.`,
  keywords: ["privacy", "security", "cookies", "GDPR", "personal data"],
  sections: [
    {
      id: "information-scope",
      title: "Information scope",
      blocks: [
        {
          type: "p",
          parts: [
            "This ",
            PRIVACY,
            " page explains what happens when you use ",
            HOME,
            " (the Website and Asset defined in the ",
            TERMS,
            "). Personal information is any data that can identify you, alone or combined with other data. If something is unclear, contact us.",
          ],
        },
      ],
    },
    {
      id: "data-collection",
      title: "Data collection",
      blocks: [
        {
          type: "p",
          parts: [
            "Personal information includes data such as your name and email address. Data collected by this website is controlled by ",
            COMPANY_LEGAL.legalName,
            " at ",
            `${FOOTER_CONTACT.address}. `,
            FOOTER_CONTACT.taxId,
            ". You can contact us:",
          ],
        },
        {
          type: "ul",
          items: [
            ["By email: ", MAILTO],
            [`By mail: ${FOOTER_CONTACT.address}`],
            ["By phone: ", TEL],
          ],
        },
        {
          type: "p",
          parts: [
            "You can use much of ",
            SITE_NAME,
            " without an account. Creating an account, starting a trial, or subscribing is voluntary, but those features need the data below.",
          ],
        },
        {
          type: "p",
          parts: [
            "Depending on how you use the app, we may process: account details (email, name, and OAuth identifiers if you sign in with Google or Apple via Appwrite); an HTTP-only session cookie to keep you signed in; subscription status and Stripe checkout or customer references for optional paid tiers (card numbers are handled by Stripe, not stored by us); optional AI provider API keys you choose to save; trial abuse-prevention data such as IP address and a device fingerprint from browser characteristics; server logs (IP, user agent, timestamps, URLs); theme preference in local storage; analytics cookies when Google Tag Manager is enabled on a deployment; and advertising identifiers if ads are shown on the free tier.",
          ],
        },
        {
          type: "p",
          parts: [
            "We do not ask for biometric, health, genetic, criminal, political, or similar sensitive data, and you should not send it to us.",
          ],
        },
        {
          type: "p",
          parts: [
            "Your data is treated confidentially, in line with applicable data-protection law and this page. We share data with law enforcement only when local law requires it. We do not sell your personal data. We use processors that help run the product — including Appwrite (accounts, stored keys, trial and subscription records), Stripe (payments), Vercel (hosting), Google or Apple (sign-in), and Google Tag Manager when configured. Market-data providers such as Yahoo Finance, Finnhub, and CNN receive the requests needed to load quotes, news, and public market metrics; they are not given your account profile for that purpose.",
          ],
        },
        {
          type: "p",
          parts: [
            "No website can fully prevent unlawful access. We use HTTPS and restrict access to systems that store personal data, but we cannot take responsibility for loss caused by attackers. Information security also depends on technology we do not control.",
          ],
        },
        {
          type: "p",
          parts: [
            "We keep account and subscription data while your account or paid plan is active, and for a limited time afterward if the law or dispute handling requires it. Trial identifiers are kept long enough to enforce one trial per person. Server logs are kept for a short operational period. You can ask us to delete account data; backups may take longer to expire.",
          ],
        },
        {
          type: "p",
          parts: [
            "We collect data to operate ",
            SITE_NAME,
            ", authenticate you, process optional subscriptions, prevent trial abuse, keep the service secure, meet legal duties, measure usage when analytics are enabled, and show ads on the free tier when ads are on. This product is a stock research app, not a hiring or newsletter platform.",
          ],
        },
        {
          type: "p",
          parts: [
            "Processors may handle data in the European Union and in other countries (for example the United States). Where that happens, we rely on those providers' safeguards. By using the site you acknowledge that such transfers can occur.",
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      blocks: [
        {
          type: "p",
          parts: [
            "This website uses cookies and similar storage (including local and session storage). Cookies are small text files stored on your device if your browser allows them.",
          ],
        },
        {
          type: "p",
          parts: [
            "We use them so the app can function (signed-in session, theme, trial safeguards) and, when enabled, to understand usage or deliver ads. Categories we may use:",
          ],
        },
        {
          type: "ul",
          items: [
            [
              "Strictly necessary — sign-in session and security features that the app cannot run without.",
            ],
            [
              "Performance — how people use the site, when analytics such as Google Tag Manager are configured.",
            ],
            ["Functionality — interface choices such as light or dark theme."],
            [
              "Targeting or advertising — ads on the free tier, when advertising is enabled.",
            ],
            [
              "Third party — cookies set by processors such as Appwrite, Stripe, Google, or Apple when you use their flows.",
            ],
          ],
        },
        {
          type: "p",
          parts: [
            "You can block or delete cookies in your browser. That may limit sign-in, trials, or other features.",
          ],
        },
      ],
    },
    {
      id: "third-party-software-and-services",
      title: "Third-party software and services",
      blocks: [
        {
          type: "p",
          parts: [
            "The app depends on third-party software and services. Those parties have their own privacy policies, which we may require you to accept. Our policy covers information we collect; it does not control how those parties use data they collect directly. Visiting linked sites is at your own risk. We welcome feedback if a third-party integration looks unsafe.",
          ],
        },
        {
          type: "p",
          parts: [
            "You can sign in with a single sign-on provider (Google or Apple). Read their privacy policies before you use them.",
          ],
        },
        {
          type: "p",
          parts: [
            "Footer links include our social profiles. If you interact with us there, those platforms' rules apply, and we may see the public information you share.",
          ],
        },
      ],
    },
    {
      id: "legal-rights",
      title: "Legal rights",
      blocks: [
        {
          type: "p",
          parts: [
            "Under applicable data-protection law you may have the right to access, be informed, correct, erase, restrict, object, port your data, complain to a supervisory authority, and withdraw consent. Requests that are not clearly unfounded, excessive, or repetitive are free of charge. We may charge a fee or refuse in those cases. We may ask for extra details to confirm it is you. Deleted data cannot always be removed from backups immediately.",
          ],
        },
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [
        {
          type: "p",
          parts: [
            `${SITE_NAME} is not intended for children under 13 (or a higher age required where you live). We do not knowingly collect personal data from those children. A parent or guardian should contact us if a child is using the app; we will delete associated account data. By giving us your data you confirm you are old enough under local law. Children below that age should ask a parent or guardian to contact us.`,
          ],
        },
      ],
    },
    {
      id: "anonymization",
      title: "Anonymization",
      blocks: [
        {
          type: "p",
          parts: [
            "Where we can, we keep analytics and logs from identifying you. You can browse much of the site without an account. An account needs enough detail to sign you in. Fake details may break support, billing, or security features.",
          ],
        },
      ],
    },
    {
      id: "data-protection-officer",
      title: "Data protection officer",
      blocks: [
        {
          type: "p",
          parts: [
            "The data protection officer is ",
            COMPANY_LEGAL.dpoName,
            ". That person monitors data-protection compliance and is the contact for people whose data we process. Questions: ",
            MAILTO,
            " or ",
            TEL,
            ".",
          ],
        },
      ],
    },
    {
      id: "data-breaches",
      title: "Data breaches",
      blocks: [
        {
          type: "p",
          parts: [
            "If we detect a personal-data breach, we will inform affected users as soon as we reasonably can, and we will cooperate with legal authorities where required.",
          ],
        },
      ],
    },
    {
      id: "opposition-to-marketing-campaigns",
      title: "Opposition to marketing campaigns",
      blocks: [
        {
          type: "p",
          parts: [
            "Do not harvest contact details from this site for marketing campaigns. We may take action if that happens.",
          ],
        },
      ],
    },
  ],
};

export const TERMS_DOCUMENT: LegalDocument = {
  slug: "terms-of-use",
  title: "Terms of Use",
  subtitle: "Essential terms that apply when you use The Open Stock.",
  path: "/terms-of-use",
  description: `Terms of use for ${SITE_NAME}: not legal or investment advice, acceptable use, and limits of liability.`,
  keywords: [
    "terms of use",
    "not investment advice",
    "not legal advice",
    "disclaimer",
  ],
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      blocks: [
        {
          type: "p",
          parts: [
            "These ",
            TERMS,
            " describe the rules for individuals (you, your) who use our Assets: the website ",
            HOME,
            " and the ",
            SITE_NAME,
            " application, unless a page states its own terms.",
          ],
        },
        {
          type: "p",
          parts: [
            "They sit together with our ",
            COPYRIGHTS,
            " and ",
            PRIVACY,
            ". By accessing the site you agree to these legal rules. This information is free of charge.",
          ],
        },
      ],
    },
    {
      id: "about-ditectrev",
      title: `About ${COMPANY_LEGAL.tradingAs}`,
      blocks: [
        {
          type: "p",
          parts: [
            SITE_NAME,
            " (",
            HOME,
            ") is operated by ",
            COMPANY_LEGAL.legalName,
            ` ("company", "${COMPANY_LEGAL.tradingAs}", "${COMPANY_LEGAL.legalName}", "our", "us", "we") — a company registered in ${COMPANY_LEGAL.country} under European registration number (VIES) ${COMPANY_LEGAL.vies}. Polish tax identification number (NIP) is ${COMPANY_LEGAL.nip}; business entity identification number (REGON) is ${COMPANY_LEGAL.regon}.`,
          ],
        },
        {
          type: "p",
          parts: [
            "Registered office and mail: ",
            `${FOOTER_CONTACT.address}. `,
            FOOTER_CONTACT.taxId,
            ". Phone: ",
            TEL,
            ". Email: ",
            MAILTO,
            ".",
          ],
        },
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      blocks: [
        {
          type: "p",
          parts: [
            `${SITE_NAME} is not legal, tax, accounting, or investment advice. Nothing here is an offer to buy or sell any security or cryptoasset. We are not a broker, investment adviser, bank, or licensed financial institution.`,
          ],
        },
        {
          type: "p",
          parts: [
            "Charts, quotes, screeners, heatmaps, calendars, news, rankings, Fear & Greed, analyst targets, glossary definitions, and optional AI (including Stock of the Day and symbol predictions) are informational tools for your own research. They can be late, incomplete, or wrong. Third-party market data is provided as-is.",
          ],
        },
        {
          type: "p",
          parts: [
            "Past performance does not guarantee future results. You can lose money. Before you act, get advice from a qualified professional who knows your situation. Our content is not intended to advise you.",
          ],
        },
        {
          type: "p",
          parts: [
            "We may update the site and these legal rules (",
            COPYRIGHTS,
            ", ",
            PRIVACY,
            ", and ",
            TERMS,
            "). Check them from time to time. If versions conflict, the newest ",
            TERMS,
            " apply.",
          ],
        },
        {
          type: "p",
          parts: [
            "The site may link to or load third-party services. We do not control them and are not responsible for their content. Problems with those services have to be taken up with them. A link is not an endorsement.",
          ],
        },
        {
          type: "p",
          parts: [
            "You are responsible for making sure anyone who uses the site through your connection knows these rules.",
          ],
        },
        {
          type: "p",
          parts: [
            "If we do not exercise a right here, that is not a waiver. These ",
            TERMS,
            " are an agreement between you and the company; they do not confer rights on other people.",
          ],
        },
        {
          type: "p",
          parts: [
            "You may link to public pages that exist. Do not present a link as if it were our page when it is not. We may withdraw linking permission without notice.",
          ],
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      blocks: [
        {
          type: "p",
          parts: [
            "Use of this website is also governed by our ",
            COPYRIGHTS,
            " and ",
            PRIVACY,
            ". By accessing the site you agree to them.",
          ],
        },
        {
          type: "p",
          parts: [
            "If you submit material (for example account details, saved API keys, or feedback), you grant us a non-exclusive license to use it as needed to operate ",
            SITE_NAME,
            ". We treat that material as needed to provide the service, not as public content, unless you post it publicly yourself.",
          ],
        },
      ],
    },
    {
      id: "cyber-security",
      title: "Cyber security",
      blocks: [
        {
          type: "p",
          parts: [
            "We cannot guarantee that the site will be free of bugs, viruses, or other harmful content. You are responsible for the security of the device and software you use to access it, including your own virus protection.",
          ],
        },
        {
          type: "p",
          parts: [
            "Do not introduce malware or attack the site. Unauthorized access, scanning for weaknesses, theft of API keys, denial-of-service, and similar activity is forbidden and may be a criminal offence under applicable computer-misuse and cybercrime laws. We may report it to authorities, cooperate with them, and end your access immediately.",
          ],
        },
        {
          type: "p",
          parts: [
            "You are responsible for content you submit and for keeping your own backups. We may remove submitted material without giving a reason.",
          ],
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy",
      blocks: [
        {
          type: "p",
          parts: [
            "Use of the website is also governed by our ",
            PRIVACY,
            " page, which explains how we may use personal data.",
          ],
        },
      ],
    },
    {
      id: "availability",
      title: "Availability",
      blocks: [
        {
          type: "p",
          parts: [
            "The website and Assets are provided “as is” and on an “as available” basis. We do not guarantee they will be free of defects. We may suspend or withdraw all or part of the service. We try to keep market data and copy up to date, but we do not warrant that it is always accurate.",
          ],
        },
        {
          type: "p",
          parts: [
            "You may use the site from a computer or mobile device that supports HTML, CSS, and JavaScript. We aim for accessibility but cannot guarantee full Web Content Accessibility Guidelines (WCAG) conformance.",
          ],
        },
      ],
    },
    {
      id: "limitations-of-liability",
      title: "Limitations of liability",
      blocks: [
        {
          type: "p",
          parts: [
            "To the maximum extent permitted by law we do not accept liability for direct or indirect loss — including trading losses, missed opportunities, business interruption, lost profits, lost data, or reputational harm — whether or not it was foreseeable, and whether it comes from market data, AI output, or downtime.",
          ],
        },
        {
          type: "p",
          parts: [
            "We do not exclude or limit liability for death or personal injury caused by our negligence, or any other liability that cannot lawfully be excluded.",
          ],
        },
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS = [
  COPYRIGHTS_DOCUMENT,
  PRIVACY_DOCUMENT,
  TERMS_DOCUMENT,
] as const;

export function getLegalDocument(
  slug: LegalDocument["slug"]
): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((doc) => doc.slug === slug);
}

export function isLegalLink(part: LegalInline): part is LegalLink {
  return typeof part === "object" && "href" in part;
}

export function flattenLegalText(parts: readonly LegalInline[]): string {
  return parts
    .map((part) => (typeof part === "string" ? part : part.label))
    .join("");
}

export function legalDocumentPlainText(doc: LegalDocument): string {
  return doc.sections
    .flatMap((section) =>
      section.blocks.flatMap((block) => {
        if (block.type === "p") return [flattenLegalText(block.parts)];
        return block.items.map((item) => flattenLegalText(item));
      })
    )
    .join("\n");
}
