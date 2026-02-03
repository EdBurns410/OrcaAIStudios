CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example insert (replace with your email):
-- INSERT INTO admin_users (email, role) VALUES ('edwardburns210@gmail.com', 'admin')
-- ON CONFLICT (email) DO NOTHING;
