-- Authentication Tables Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create auth_users table
CREATE TABLE IF NOT EXISTS auth_users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create auth_accounts table
CREATE TABLE IF NOT EXISTS auth_accounts (
    id SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    type TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    access_token TEXT,
    expires_at BIGINT,
    refresh_token TEXT,
    id_token TEXT,
    scope TEXT,
    session_state TEXT,
    token_type TEXT,
    password TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, "providerAccountId")
);

-- Create auth_sessions table
CREATE TABLE IF NOT EXISTS auth_sessions (
    id SERIAL PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create auth_verification_token table
CREATE TABLE IF NOT EXISTS auth_verification_token (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_accounts_userId ON auth_accounts("userId");
CREATE INDEX IF NOT EXISTS idx_auth_sessions_userId ON auth_sessions("userId");
CREATE INDEX IF NOT EXISTS idx_auth_sessions_sessionToken ON auth_sessions("sessionToken");
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);

-- Success message
SELECT 'Database tables created successfully!' as message;
