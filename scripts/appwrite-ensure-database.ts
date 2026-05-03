import { AppwriteException, type Databases } from "node-appwrite";

function readEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function isNotFoundError(error: unknown): boolean {
  if (error instanceof AppwriteException && error.code === 404) return true;
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);
  return message.includes("not found") || message.includes("404");
}

function isAlreadyExistsError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);
  return (
    message.includes("already exists") ||
    message.includes("conflict") ||
    message.includes("409")
  );
}

/**
 * Ensures the Appwrite database exists (creates it if missing).
 * Uses APPWRITE_DATABASE_NAME when set; otherwise the database id as the label.
 */
export async function ensureAppwriteDatabase(
  databases: Databases,
  databaseId: string
): Promise<void> {
  try {
    await databases.get(databaseId);
    console.log(`Using existing database: ${databaseId}`);
    return;
  } catch (error) {
    if (!isNotFoundError(error)) throw error;
  }

  const displayName = readEnv("APPWRITE_DATABASE_NAME") || databaseId;

  try {
    await databases.create(databaseId, displayName, true);
    console.log(`Created database: ${databaseId} ("${displayName}")`);
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      console.log(`Database already exists: ${databaseId}`);
      return;
    }
    throw error;
  }
}
