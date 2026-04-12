/**
 * Server-side Appwrite settings. Reads via dynamic `process.env[key]` lookup so Next.js
 * does not replace NEXT_PUBLIC_* with empty string literals at build time when the build
 * had no env (e.g. Vercel Git–triggered builds). Falls back to NEXT_PUBLIC_* names so
 * hosts that only expose those (Vercel dashboard, older setups) still work at runtime.
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
    endpoint: envFirst(
      "APPWRITE_ENDPOINT",
      "NEXT_PUBLIC_APPWRITE_ENDPOINT"
    ),
    projectId: envFirst(
      "APPWRITE_PROJECT_ID",
      "NEXT_PUBLIC_APPWRITE_PROJECT_ID"
    ),
    apiKey: envFirst("APPWRITE_API_KEY"),
  };
}
