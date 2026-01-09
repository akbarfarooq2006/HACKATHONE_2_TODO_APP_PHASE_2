import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Create PostgreSQL connection pool for Better Auth
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

export const auth = betterAuth({
  // Database configuration - use connection string directly
  database: pool,

  // Email/password authentication provider
  emailAndPassword: {
    enabled: true,
    // Password validation rules (FR-026)
    passwordValidation: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },

  // Social authentication providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      enabled: true,
    },
  },

  // Account linking configuration (FR-027)
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["email-password", "google"],
      requireSameEmail: true, // Only link accounts with same email
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds (FR-007)
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Security configuration
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Rate limiting configuration (FR-029)
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute window
    max: 5, // 5 attempts per window
    storage: "memory", // Use memory storage for rate limiting
  },

  // Advanced security options
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
    generateSessionToken: () => {
      // Use default secure token generation
      return undefined;
    },
  },

  // Trust proxy for production deployments
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:3000",
  ],
});
