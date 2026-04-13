/**
 * Browser-only Appwrite client (appwrite package), same pattern as
 * Practice-Tests-Exams-Platform lib/appwrite/config.ts
 *
 * Lazy singleton: module load can run in a context where `window` is not
 * available yet; initializing only on first use (inside a click handler)
 * fixes "Send verification code" doing nothing.
 */

import { Account, Client } from "appwrite";
import { appwritePublicEndpoint, appwritePublicProjectId } from "./browser-env";

let cachedAccount: InstanceType<typeof Account> | null | undefined;

export function getBrowserAccount(): Account | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (cachedAccount !== undefined) {
    return cachedAccount;
  }
  if (!appwritePublicEndpoint.length || !appwritePublicProjectId.length) {
    cachedAccount = null;
    return null;
  }
  const client = new Client()
    .setEndpoint(appwritePublicEndpoint)
    .setProject(appwritePublicProjectId);
  cachedAccount = new Account(client);
  return cachedAccount;
}
