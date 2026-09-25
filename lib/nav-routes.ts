/**
 * Primary app routes — used by Navigation and dashboard quick links.
 */
export const MAIN_NAV = [
  { id: "home", label: "Home", href: "/" },
  { id: "news", label: "News", href: "/news" },
  { id: "ranking", label: "Ranking", href: "/ranking" },
  { id: "pricing", label: "Pricing", href: "/pricing" },
] as const;

export type MainNavId = (typeof MAIN_NAV)[number]["id"];

export function pathnameToNavId(pathname: string): MainNavId | string {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (normalized === "/") return "home";
  const first = normalized.slice(1).split("/")[0];
  if (
    first === "sectors" ||
    first === "calendars" ||
    first === "heatmaps" ||
    first === "screener" ||
    first === "ranking" ||
    first === "pricing" ||
    first === "profile" ||
    first === "compare" ||
    first === "news" ||
    first === "copyrights" ||
    first === "privacy-and-security" ||
    first === "sitemap" ||
    first === "terms-of-use"
  ) {
    return first;
  }
  return "home";
}
