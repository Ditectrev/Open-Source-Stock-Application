/**
 * Server-side Appwrite settings.
 */
function envFirst(...keys: string[]): string {
  for (const key of keys) {
    const v = process.env[key];
    if (typeof v === "string" && v.trim() !== "") {
      return v.trim();
    }
  }
  return "";
}

export function getAppwriteServerEnv(): {
  endpoint: string;
  projectId: string;
  apiKey: string;
} {
  return {
    endpoint: envFirst("NEXT_PUBLIC_APPWRITE_ENDPOINT"),
    projectId: envFirst("NEXT_PUBLIC_APPWRITE_PROJECT_ID"),
    apiKey: envFirst("APPWRITE_API_KEY"),
  };
}
