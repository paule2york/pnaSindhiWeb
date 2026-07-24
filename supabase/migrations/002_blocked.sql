-- Blocked articles table (RSS news control)
CREATE TABLE IF NOT EXISTS cms_blocked (
  id SERIAL PRIMARY KEY,
  link TEXT NOT NULL,
  short_id VARCHAR(50) DEFAULT '',
  title TEXT DEFAULT '',
  blocked_by INTEGER REFERENCES cms_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_blocked_link ON cms_blocked(link);
CREATE INDEX IF NOT EXISTS idx_cms_blocked_short_id ON cms_blocked(short_id);
