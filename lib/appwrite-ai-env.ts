function readEnv(key: string): string {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : "";
}

export function getAppwriteAIEnv(): {
  databaseId: string;
  keysCollectionId: string;
} {
  return {
    databaseId: readEnv("APPWRITE_DATABASE_ID"),
    keysCollectionId: readEnv("APPWRITE_COLLECTION_ID_AI_KEYS"),
  };
}

export function assertAppwriteAIEnv(): {
  databaseId: string;
  keysCollectionId: string;
} {
  const env = getAppwriteAIEnv();
  if (!env.databaseId || !env.keysCollectionId) {
    throw new Error(
      "Missing APPWRITE_DATABASE_ID or APPWRITE_COLLECTION_ID_AI_KEYS."
    );
  }
  return env;
}
