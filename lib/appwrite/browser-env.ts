/**
 * Public Appwrite config for the browser SDK (matches Practice-Tests-Exams-Platform).
 * Trim so pasted env values with trailing newlines do not break requests.
 */
export const appwritePublicEndpoint = (
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? ""
).trim();

export const appwritePublicProjectId = (
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? ""
).trim();
