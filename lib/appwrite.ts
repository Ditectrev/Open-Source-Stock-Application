/**
 * Appwrite SDK configuration and client initialization
 * Provides both client-side and server-side Appwrite clients
 */

import { Client, Account, Databases } from "node-appwrite";
import { env } from "./env";

/**
 * Server-side Appwrite client
 * Used in API routes and server components
 */
export function createServerClient() {
  const client = new Client();

  client
    .setEndpoint(env.appwrite.endpoint)
    .setProject(env.appwrite.projectId)
    .setKey(env.appwrite.apiKey);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
  };
}

/**
 * Client-side Appwrite configuration
 * Used in client components and browser context
 */
export const appwriteConfig = {
  endpoint: env.appwrite.endpoint,
  projectId: env.appwrite.projectId,
};

/**
 * Create a client-side Appwrite client
 * Note: This should be used in client components only
 */
export function createClientSideClient() {
  if (typeof window === "undefined") {
    throw new Error(
      "createClientSideClient can only be used in browser environment"
    );
  }

  const client = new Client();

  client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
  };
}
