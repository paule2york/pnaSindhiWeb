-- ============================================================
-- PNA Sindhi CMS — Run this in Supabase SQL Editor
-- ============================================================

-- 1. USERS table (admins, editors, journalists)
CREATE TABLE IF NOT EXISTS cms_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'journalist'
    CHECK (role IN ('admin', 'editor', 'journalist')),
  allowed_cities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POSTS table (CMS-authored news)
CREATE TABLE IF NOT EXISTS cms_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image TEXT DEFAULT '',
  city VARCHAR(100) DEFAULT '',
  category VARCHAR(100) DEFAULT 'local',
  author_id INTEGER REFERENCES cms_users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SESSIONS table (revocable tokens)
CREATE TABLE IF NOT EXISTS cms_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES cms_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cms_sessions_token ON cms_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_cms_posts_author ON cms_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_cms_posts_published ON cms_posts(published);

-- 4. Seed the first admin user (password: admin123)
--    IMPORTANT: change this password after first login!
INSERT INTO cms_users (email, password_hash, name, role)
VALUES (
  'admin@pna.com',
  '$2b$10$XWguvF1Z.vf38.IDRKA.5upWexgyoSe7I9Ckkm/UcdpNHbOcCkU8u',
  'Admin',
  'admin'
) ON CONFLICT (email) DO NOTHING;
