import { Client, Databases } from "node-appwrite";

function readEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
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

async function main(): Promise<void> {
  const endpoint = requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
  const projectId = requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  const apiKey = requireEnv("APPWRITE_API_KEY");
  const databaseId = requireEnv("APPWRITE_DATABASE_ID");
  const collectionId = requireEnv("APPWRITE_COLLECTION_ID_AI_KEYS");

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const databases = new Databases(client);

  try {
    await databases.get(databaseId);
    console.log(`Using existing database: ${databaseId}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error);
    if (message.includes("not found") || message.includes("404")) {
      throw new Error(
        `Database "${databaseId}" was not found. Set APPWRITE_DATABASE_ID to an existing Appwrite database id.`
      );
    }
    throw error;
  }

  try {
    await databases.createCollection(
      databaseId,
      collectionId,
      "AI API Keys",
      [],
      true,
      true
    );
    console.log(`Created collection: ${collectionId}`);
  } catch (error) {
    if (!isAlreadyExistsError(error)) throw error;
    console.log(`Collection already exists: ${collectionId}`);
  }

  const createAttribute = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      console.log(`Created attribute: ${label}`);
    } catch (error) {
      if (!isAlreadyExistsError(error)) throw error;
      console.log(`Attribute already exists: ${label}`);
    }
  };

  await createAttribute("userId", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "userId",
      64,
      true
    )
  );
  await createAttribute("provider", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "provider",
      32,
      true
    )
  );
  await createAttribute("encryptedKey", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "encryptedKey",
      4096,
      true
    )
  );
  await createAttribute("iv", () =>
    databases.createStringAttribute(databaseId, collectionId, "iv", 256, true)
  );
  await createAttribute("lastValidatedAt", () =>
    databases.createDatetimeAttribute(
      databaseId,
      collectionId,
      "lastValidatedAt",
      false
    )
  );

  console.log("Appwrite AI keys collection setup complete.");
}

main().catch((error) => {
  console.error("Failed to setup Appwrite AI keys database.");
  console.error(error);
  process.exit(1);
});
