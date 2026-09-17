/**
 * Footer content — contact, tools, resources, and social links.
 * Contact details copied from Ditectrev/ditectrev.com footer.component.ts.
 */

export const FOOTER_CONTACT = {
  address: "Irysowa 18, 55-220 Jelcz-Laskowice, Poland",
  phone: "+48 732 280 741",
  email: "contact@ditectrev.com",
  taxId: "Tax ID: PL9121899240",
} as const;

export const FOOTER_TOOLS = [
  { label: "Sectors", href: "/sectors" },
  { label: "Calendars", href: "/calendars" },
  { label: "Heatmaps", href: "/heatmaps" },
  { label: "Screener", href: "/screener" },
] as const;

export const FOOTER_RESOURCES = [
  { label: "Copyrights", href: "/copyrights" },
  { label: "Privacy & Security", href: "/privacy-and-security" },
  { label: "Sitemap", href: "/sitemap" },
  { label: "Terms of Use", href: "/terms-of-use" },
] as const;

export const FOOTER_SOCIAL = [
  {
    label: "Discord",
    href: "https://discord.com/invite/RFjtXKfJy3",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/ditectrev",
  },
  {
    label: "GitHub",
    href: "https://github.com/ditectrev",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ditectrev",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/ditectrev",
  },
  {
    label: "Medium",
    href: "https://medium.com/@ditectrev",
  },
  {
    label: "X",
    href: "https://x.com/ditectrev",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Ditectrev",
  },
] as const;
