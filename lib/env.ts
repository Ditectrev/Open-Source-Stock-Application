/**
 * Application configuration
 * Appwrite credentials will use env vars once auth is implemented.
 * Everything else is hardcoded.
 */

interface EnvConfig {
  appwrite: {
    endpoint: string;
    projectId: string;
    apiKey: string;
  };
  apis: {
    cnnDatavizUrl: string;
    yahooFinanceUrl: string;
  };
  cache: {
    ttlSeconds: number;
    rateLimitMaxRequests: number;
    rateLimitWindowSeconds: number;
  };
  trial: {
    durationMinutes: number;
  };
  ipServices: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  logging: {
    level: string;
    vercelEnv: string;
  };
}

export const env: EnvConfig = {
  appwrite: {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "",
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
    apiKey: process.env.APPWRITE_API_KEY || "",
  },
  apis: {
    cnnDatavizUrl: "https://production.dataviz.cnn.io",
    yahooFinanceUrl: "https://query1.finance.yahoo.com",
  },
  cache: {
    ttlSeconds: 300,
    rateLimitMaxRequests: 100,
    rateLimitWindowSeconds: 60,
  },
  trial: {
    durationMinutes: 15,
  },
  ipServices: {
    primary: "https://api.ipify.org?format=json",
    secondary: "https://api.my-ip.io/ip.json",
    tertiary: "https://ipapi.co/json",
  },
  logging: {
    level: "info",
    vercelEnv: "development",
  },
};
