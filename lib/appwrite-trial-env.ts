function readEnv(key: string): string {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : "";
}

export function getAppwriteTrialEnv(): {
  databaseId: string;
  sessionsCollectionId: string;
} {
  return {
    databaseId: readEnv("APPWRITE_TRIAL_DATABASE_ID"),
    sessionsCollectionId: readEnv("APPWRITE_TRIAL_SESSIONS_COLLECTION_ID"),
  };
}

export function assertAppwriteTrialEnv(): {
  databaseId: string;
  sessionsCollectionId: string;
} {
  const env = getAppwriteTrialEnv();
  if (!env.databaseId || !env.sessionsCollectionId) {
    throw new Error(
      "Missing APPWRITE_TRIAL_DATABASE_ID or APPWRITE_TRIAL_SESSIONS_COLLECTION_ID."
    );
  }
  return env;
}
