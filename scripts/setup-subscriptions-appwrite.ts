import { Client, Databases, IndexType } from "node-appwrite";

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

async function main() {
  const endpoint = requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
  const projectId = requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  const apiKey = requireEnv("APPWRITE_API_KEY");
  const databaseId = requireEnv("APPWRITE_DATABASE_ID");
  const collectionId = requireEnv("APPWRITE_COLLECTION_ID_SUBSCRIPTIONS");

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const databases = new Databases(client);

  try {
    await databases.get(databaseId);
    console.log(`Using existing database: ${databaseId}`);
  } catch {
    throw new Error(`Database "${databaseId}" does not exist.`);
  }

  try {
    await databases.createCollection(
      databaseId,
      collectionId,
      "Subscriptions",
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
    databases.createStringAttribute(databaseId, collectionId, "userId", 64, true)
  );
  await createAttribute("tier", () =>
    databases.createStringAttribute(databaseId, collectionId, "tier", 32, true)
  );
  await createAttribute("status", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "status",
      32,
      true
    )
  );
  await createAttribute("stripeCustomerId", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "stripeCustomerId",
      128,
      false
    )
  );
  await createAttribute("stripeSubscriptionId", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "stripeSubscriptionId",
      128,
      false
    )
  );
  await createAttribute("stripePriceId", () =>
    databases.createStringAttribute(
      databaseId,
      collectionId,
      "stripePriceId",
      128,
      false
    )
  );
  await createAttribute("currentPeriodStart", () =>
    databases.createDatetimeAttribute(
      databaseId,
      collectionId,
      "currentPeriodStart",
      false
    )
  );
  await createAttribute("currentPeriodEnd", () =>
    databases.createDatetimeAttribute(
      databaseId,
      collectionId,
      "currentPeriodEnd",
      false
    )
  );
  await createAttribute("cancelAtPeriodEnd", () =>
    databases.createBooleanAttribute(
      databaseId,
      collectionId,
      "cancelAtPeriodEnd",
      false
    )
  );

  const createIndex = async (key: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      console.log(`Created index: ${key}`);
    } catch (error) {
      if (!isAlreadyExistsError(error)) throw error;
      console.log(`Index already exists: ${key}`);
    }
  };

  await createIndex("idx_userId", () =>
    databases.createIndex(
      databaseId,
      collectionId,
      "idx_userId",
      IndexType.Key,
      ["userId"]
    )
  );
  await createIndex("idx_stripeSubscriptionId_unique", () =>
    databases.createIndex(
      databaseId,
      collectionId,
      "idx_stripeSubscriptionId_unique",
      IndexType.Unique,
      ["stripeSubscriptionId"]
    )
  );

  console.log("Subscriptions Appwrite setup complete.");
}

main().catch((error) => {
  console.error("Failed to setup subscriptions collection.");
  console.error(error);
  process.exit(1);
});
