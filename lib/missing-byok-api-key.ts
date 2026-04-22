export function isMissingByokApiKeyMessage(
  message: string | null | undefined
): boolean {
  if (!message?.trim()) return false;
  const m = message.toLowerCase();
  return (
    m.includes("no byok api key") ||
    m.includes("no api key stored") ||
    m.includes("save a provider key")
  );
}
