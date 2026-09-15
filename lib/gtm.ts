const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;

/** Accepts only canonical GTM container IDs so the snippet cannot be poisoned. */
export function normalizeGtmId(
  input: string | null | undefined
): string | null {
  const id = input?.trim();
  if (!id || !GTM_ID_PATTERN.test(id)) return null;
  return id.toUpperCase();
}

export function gtmBootstrapHtml(gtmId: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
}
