/**
 * Server-only Appwrite settings. Uses names without the NEXT_PUBLIC_ prefix so Next.js
 * does not bake values into the server bundle at build time (NEXT_PUBLIC_* are inlined,
 * including as empty strings when missing during CI/Vercel Git builds).
 *
 * Set APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID on the host to the same values as the
 * public Appwrite URL and project ID (see .env.example).
 */
export function getAppwriteServerEnv(): {
  endpoint: string;
  projectId: string;
  apiKey: string;
} {
  return {
    endpoint: (process.env["APPWRITE_ENDPOINT"] ?? "").trim(),
    projectId: (process.env["APPWRITE_PROJECT_ID"] ?? "").trim(),
    apiKey: (process.env["APPWRITE_API_KEY"] ?? "").trim(),
  };
}
