-- Create JWKS table for Better Auth JWT plugin
CREATE TABLE IF NOT EXISTS "jwks" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "expiresAt" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jwks_createdAt ON "jwks"("createdAt");
