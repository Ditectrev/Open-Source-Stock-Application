const JSON_LD_ESCAPE_LOOKUP: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

const JSON_LD_ESCAPE_PATTERN = /[<>&\u2028\u2029]/g;

/**
 * Serializes structured data for safe inline JSON-LD script injection.
 *
 * Escapes characters that can break out of a <script> tag or create invalid
 * JavaScript parser states in some engines.
 */
export function serializeJsonLd(data: unknown): string {
  const serialized = JSON.stringify(data);
  if (!serialized) return "{}";
  return serialized.replace(
    JSON_LD_ESCAPE_PATTERN,
    (character) => JSON_LD_ESCAPE_LOOKUP[character] ?? character
  );
}
