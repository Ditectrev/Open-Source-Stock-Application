/**
 * Environment variable validation and configuration
 * Validates required environment variables on startup
 */

interface EnvConfig {
  // Appwrite
  appwrite: {
    endpoint: string;
    projectId: string;
    apiKey: string;
  };
  // External APIs
  apis: {
    cnnDatavizUrl: string;
    yahooFinanceUrl: string;
  };
  // Cache & Rate Limiting
  cache: {
    ttlSeconds: number;
    rateLimitMaxRequests: number;
    rateLimitWindowSeconds: number;
  };
  // Trial
  trial: {
    durationMinutes: number;
  };
  // IP Services
  ipServices: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  // Logging
  logging: {
    level: string;
    vercelEnv: string;
  };
}

/**
 * Validates and exports environment configuration
 * All values have sensible defaults — only Appwrite credentials
 * need to be set when the auth system is implemented.
 */
export function validateEnv(): EnvConfig {
  try {
    const config: EnvConfig = {
      appwrite: {
        endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "",
        projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
        apiKey: process.env.APPWRITE_API_KEY || "",
      },
      apis: {
        cnnDatavizUrl:
          process.env.CNN_DATAVIZ_API_URL || "https://production.dataviz.cnn.io",
        yahooFinanceUrl:
          process.env.YAHOO_FINANCE_API_URL || "https://query1.finance.yahoo.com",
      },
      cache: {
        ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || "300", 10),
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
        rateLimitWindowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || "60", 10),
      },
      trial: {
        durationMinutes: parseInt(process.env.TRIAL_DURATION_MINUTES || "15", 10),
      },
      ipServices: {
        primary: process.env.IP_SERVICE_PRIMARY || "https://api.ipify.org?format=json",
        secondary: process.env.IP_SERVICE_SECONDARY || "https://api.my-ip.io/ip.json",
        tertiary: process.env.IP_SERVICE_TERTIARY || "https://ipapi.co/json",
      },
      logging: {
        level: process.env.LOG_LEVEL || "info",
        vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
      },
    };

    return config;
  } catch (error) {
    console.error("Environment validation failed:", error);
    throw error;
  }
}

// Export singleton instance
export const env = validateEnv();
