import { AppwriteException, Client, Databases, IndexType } from "node-appwrite";
import { ensureAppwriteDatabase } from "./appwrite-ensure-database";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

function isAttributeNotAvailableError(error: unknown): boolean {
  if (
    error instanceof AppwriteException &&
    error.type === "attribute_not_available"
  )
    return true;
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);
  return message.includes("not yet available");
}

async function main(): Promise<void> {
  const endpoint = requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
  const projectId = requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  const apiKey = requireEnv("APPWRITE_API_KEY");
  const databaseId = requireEnv("APPWRITE_DATABASE_ID");
  const collectionId = requireEnv("APPWRITE_COLLECTION_ID_TRIAL_SESSIONS");

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const databases = new Databases(client);

  await ensureAppwriteDatabase(databases, databaseId);

  try {
    await databases.createCollection(
      databaseId,
      collectionId,
      "Trial sessions",
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

  await createAttribute("fingerprint", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "fingerprint",
      512,
      true
    )
  );
  await createAttribute("ipAddress", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "ipAddress",
      128,
      false,
      ""
    )
  );
  await createAttribute("startTime", () =>
    databases.createDatetimeAttribute(
      databaseId,
      collectionId,
      "startTime",
      true
    )
  );
  await createAttribute("endTime", () =>
    databases.createDatetimeAttribute(databaseId, collectionId, "endTime", true)
  );
  await createAttribute("isActive", () =>
    databases.createBooleanAttribute(databaseId, collectionId, "isActive", true)
  );
  await createAttribute("userAgent", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "userAgent",
      2048,
      true
    )
  );
  await createAttribute("screenResolution", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "screenResolution",
      64,
      true
    )
  );
  await createAttribute("timezone", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "timezone",
      128,
      true
    )
  );

  const createIndex = async (key: string, fn: () => Promise<unknown>) => {
    const maxAttempts = 36;
    const delayMs = 2500;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await fn();
        console.log(`Created index: ${key}`);
        return;
      } catch (error) {
        if (isAlreadyExistsError(error)) {
          console.log(`Index already exists: ${key}`);
          return;
        }
        if (isAttributeNotAvailableError(error) && attempt < maxAttempts) {
          console.log(
            `Attributes still provisioning; retrying index "${key}" (${attempt}/${maxAttempts})...`
          );
          await sleep(delayMs);
          continue;
        }
        throw error;
      }
    }
  };

  await createIndex("idx_fingerprint", () =>
    databases.createIndex(
      databaseId,
      collectionId,
      "idx_fingerprint",
      IndexType.Key,
      ["fingerprint"]
    )
  );
  await createIndex("idx_ipAddress", () =>
    databases.createIndex(
      databaseId,
      collectionId,
      "idx_ipAddress",
      IndexType.Key,
      ["ipAddress"]
    )
  );

  console.log("Trial sessions Appwrite setup complete.");
}

main().catch((error) => {
  console.error("Failed to setup trial sessions collection.");
  console.error(error);
  process.exit(1);
});
