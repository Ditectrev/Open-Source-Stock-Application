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

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your .env file.`
    );
  }
  return value || "";
}

function getEnvNumber(
  key: string,
  defaultValue: number,
  required: boolean = false
): number {
  const value = process.env[key];
  if (!value) {
    if (required) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(
      `Environment variable ${key} must be a valid number, got: ${value}`
    );
  }
  return parsed;
}

/**
 * Validates and exports environment configuration
 * Throws an error if required variables are missing
 */
export function validateEnv(): EnvConfig {
  try {
    const config: EnvConfig = {
      appwrite: {
        endpoint: getEnvVar("NEXT_PUBLIC_APPWRITE_ENDPOINT"),
        projectId: getEnvVar("NEXT_PUBLIC_APPWRITE_PROJECT_ID"),
        apiKey: getEnvVar("APPWRITE_API_KEY"),
      },
      apis: {
        cnnDatavizUrl:
          getEnvVar("CNN_DATAVIZ_API_URL", false) ||
          "https://production.dataviz.cnn.io",
        yahooFinanceUrl:
          getEnvVar("YAHOO_FINANCE_API_URL", false) ||
          "https://query1.finance.yahoo.com",
      },
      cache: {
        ttlSeconds: getEnvNumber("CACHE_TTL_SECONDS", 300),
        rateLimitMaxRequests: getEnvNumber("RATE_LIMIT_MAX_REQUESTS", 100),
        rateLimitWindowSeconds: getEnvNumber(
          "RATE_LIMIT_WINDOW_SECONDS",
          60
        ),
      },
      trial: {
        durationMinutes: getEnvNumber("TRIAL_DURATION_MINUTES", 15),
      },
      ipServices: {
        primary:
          getEnvVar("IP_SERVICE_PRIMARY", false) ||
          "https://api.ipify.org?format=json",
        secondary:
          getEnvVar("IP_SERVICE_SECONDARY", false) ||
          "https://api.my-ip.io/ip.json",
        tertiary:
          getEnvVar("IP_SERVICE_TERTIARY", false) ||
          "https://ipapi.co/json",
      },
      logging: {
        level: getEnvVar("LOG_LEVEL", false) || "info",
        vercelEnv: getEnvVar("NEXT_PUBLIC_VERCEL_ENV", false) || "development",
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
