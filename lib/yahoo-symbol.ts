/**
 * Yahoo lists US class shares with a hyphen (`BRK.B` → `BRK-B`).
 * Exchange suffixes such as `SAP.DE` stay dotted and are not rewritten here.
 * Callers try the original symbol first and use the hyphen form only when
 * Yahoo reports that the dotted symbol does not exist.
 */
export function yahooSymbolCandidates(symbol: string): string[] {
  const match = /^([A-Z0-9]{1,6})\.([A-Z])$/.exec(symbol);
  if (!match) return [symbol];
  const hyphenated = `${match[1]}-${match[2]}`;
  return hyphenated === symbol ? [symbol] : [symbol, hyphenated];
}
