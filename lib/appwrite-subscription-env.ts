function readEnv(key: string): string {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : "";
}

export function getAppwriteSubscriptionEnv(): {
  databaseId: string;
  subscriptionsCollectionId: string;
} {
  return {
    databaseId: readEnv("APPWRITE_DATABASE_ID"),
    subscriptionsCollectionId: readEnv("APPWRITE_COLLECTION_ID_SUBSCRIPTIONS"),
  };
}

export function assertAppwriteSubscriptionEnv(): {
  databaseId: string;
  subscriptionsCollectionId: string;
} {
  const env = getAppwriteSubscriptionEnv();
  if (!env.databaseId || !env.subscriptionsCollectionId) {
    throw new Error(
      "Missing APPWRITE_DATABASE_ID or APPWRITE_COLLECTION_ID_SUBSCRIPTIONS."
    );
  }
  return env;
}
