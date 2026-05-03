-- ═══════════════════════════════════════════════════════════════
-- Cinex Universe — Full Database Schema for Supabase PostgreSQL
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ─── Drop existing tables (clean slate) ───
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS api_configs CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS feature_toggles CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS casting_calls CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS talent_profiles CASCADE;
DROP TABLE IF EXISTS casting_directors CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS talent_status CASCADE;
DROP TYPE IF EXISTS director_status CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS call_status CASCADE;
DROP TYPE IF EXISTS media_type CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;

-- ─── Enums ───
CREATE TYPE user_role AS ENUM ('user', 'admin', 'casting', 'talent');
CREATE TYPE talent_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE director_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE submission_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'booked');
CREATE TYPE call_status AS ENUM ('draft', 'published', 'closed', 'filled');
CREATE TYPE media_type AS ENUM ('image', 'video', 'voice', 'document');
CREATE TYPE project_status AS ENUM ('pre_production', 'production', 'post_production', 'completed');

-- ─── Users (OAuth + Local Auth) ───
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  union_id VARCHAR(255) UNIQUE,
  email VARCHAR(320) UNIQUE,
  name VARCHAR(255),
  avatar TEXT,
  password_hash TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  plan_slug VARCHAR(50) DEFAULT 'free',
  trial_ends_at TIMESTAMPTZ,
  subscription_status VARCHAR(50) DEFAULT 'trial',
  razorpay_customer_id VARCHAR(255),
  razorpay_subscription_id VARCHAR(255)
);

CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_role_idx ON users(role);

-- ─── Extended Profiles ───
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  bio TEXT,
  location VARCHAR(255),
  website VARCHAR(500),
  instagram VARCHAR(255),
  twitter VARCHAR(255),
  youtube VARCHAR(255),
  linkedin VARCHAR(255),
  languages JSONB,
  skills JSONB,
  experience TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_user_id_idx ON profiles(user_id);

-- ─── Casting Directors (Agencies) ───
CREATE TABLE casting_directors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  agency_name VARCHAR(255) NOT NULL,
  agency_logo TEXT,
  license_number VARCHAR(100),
  established_year INTEGER,
  specialization JSONB,
  portfolio_url VARCHAR(500),
  status director_status NOT NULL DEFAULT 'pending',
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX cd_user_id_idx ON casting_directors(user_id);
CREATE INDEX cd_status_idx ON casting_directors(status);

-- ─── Talent Profiles (Actors/Actresses) ───
CREATE TABLE talent_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stage_name VARCHAR(255),
  real_name VARCHAR(255),
  date_of_birth TIMESTAMPTZ,
  gender VARCHAR(50),
  height_cm INTEGER,
  weight_kg INTEGER,
  body_type VARCHAR(50),
  complexion VARCHAR(50),
  hair_color VARCHAR(50),
  eye_color VARCHAR(50),
  languages JSONB,
  skills JSONB,
  education TEXT,
  experience TEXT,
  awards JSONB,
  portfolio_video_url TEXT,
  voice_sample_url TEXT,
  headshot_url TEXT,
  full_body_url TEXT,
  status talent_status NOT NULL DEFAULT 'pending',
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  added_by_director_id INTEGER REFERENCES casting_directors(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX talent_user_id_idx ON talent_profiles(user_id);
CREATE INDEX talent_status_idx ON talent_profiles(status);
CREATE INDEX talent_director_idx ON talent_profiles(added_by_director_id);

-- ─── Projects (Films) ───
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  genre VARCHAR(100),
  language VARCHAR(100),
  status project_status NOT NULL DEFAULT 'pre_production',
  budget_range VARCHAR(100),
  producer_name VARCHAR(255),
  director_name VARCHAR(255),
  banner_image TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX projects_owner_idx ON projects(owner_id);
CREATE INDEX projects_slug_idx ON projects(slug);
CREATE INDEX projects_status_idx ON projects(status);

-- ─── Casting Calls ───
CREATE TABLE casting_calls (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  role_name VARCHAR(255) NOT NULL,
  role_description TEXT,
  gender VARCHAR(50),
  age_min INTEGER,
  age_max INTEGER,
  height_min_cm INTEGER,
  height_max_cm INTEGER,
  language VARCHAR(100),
  location VARCHAR(255),
  remuneration VARCHAR(255),
  shooting_dates VARCHAR(255),
  audition_type VARCHAR(50),
  audition_location VARCHAR(255),
  audition_deadline TIMESTAMPTZ,
  required_skills JSONB,
  status call_status NOT NULL DEFAULT 'draft',
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX calls_project_idx ON casting_calls(project_id);
CREATE INDEX calls_status_idx ON casting_calls(status);
CREATE INDEX calls_creator_idx ON casting_calls(created_by);

-- ─── Submissions ───
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  call_id INTEGER NOT NULL REFERENCES casting_calls(id) ON DELETE CASCADE,
  talent_id INTEGER NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
  director_id INTEGER REFERENCES casting_directors(id) ON DELETE SET NULL,
  message TEXT,
  media_urls JSONB,
  status submission_status NOT NULL DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX submissions_call_idx ON submissions(call_id);
CREATE INDEX submissions_talent_idx ON submissions(talent_id);
CREATE INDEX submissions_status_idx ON submissions(status);

-- ─── Media Uploads ───
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type media_type NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  metadata JSONB,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX media_user_idx ON media(user_id);
CREATE INDEX media_type_idx ON media(type);

-- ─── Feature Toggles ───
CREATE TABLE feature_toggles (
  id SERIAL PRIMARY KEY,
  feature_id VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  category VARCHAR(100),
  metadata JSONB,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ft_feature_idx ON feature_toggles(feature_id);

-- ─── Plans / Subscriptions ───
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  monthly_price INTEGER,
  yearly_price INTEGER,
  features JSONB,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── API Keys / Config ───
CREATE TABLE api_configs (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(100) NOT NULL,
  key_name VARCHAR(255) NOT NULL,
  key_value TEXT NOT NULL,
  is_encrypted BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX api_provider_idx ON api_configs(provider);

-- ─── Audit Logs ───
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_user_idx ON audit_logs(user_id);
CREATE INDEX audit_action_idx ON audit_logs(action);
CREATE INDEX audit_entity_idx ON audit_logs(entity_type, entity_id);
CREATE INDEX audit_created_idx ON audit_logs(created_at);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — Default Plans & Feature Toggles
-- ═══════════════════════════════════════════════════════════════

INSERT INTO feature_toggles (feature_id, name, enabled, category) VALUES
  ('ai_image_gen', 'AI Image Generation', true, 'ai'),
  ('ai_video_gen', 'AI Video Generation', true, 'ai'),
  ('ai_voice_gen', 'AI Voice Generation', true, 'ai'),
  ('casting_directory', 'Casting Directory', true, 'casting'),
  ('script_breakdown', 'Script Breakdown', true, 'production'),
  ('shot_listing', 'Shot Listing', true, 'production'),
  ('storyboarding', 'Storyboarding', true, 'production'),
  ('scheduling', 'Scheduling', true, 'production'),
  ('call_sheets', 'Call Sheets', true, 'production'),
  ('budgeting', 'Budgeting', true, 'production')
ON CONFLICT (feature_id) DO NOTHING;

INSERT INTO plans (name, slug, description, monthly_price, yearly_price, features, is_popular, is_active, sort_order) VALUES
  ('Free', 'free', 'For individuals exploring film production tools', 0, 0, '["1 Project","Basic Script Tools","Community Access"]', false, true, 1),
  ('Pro', 'pro', 'For serious filmmakers and small teams', 1999, 19999, '["Unlimited Projects","AI Generation","Casting Tools","Priority Support"]', true, true, 2),
  ('Enterprise', 'enterprise', 'For studios and production houses', 4999, 49999, '["Everything in Pro","Team Collaboration","Custom Integrations","Dedicated Manager"]', false, true, 3)
ON CONFLICT (slug) DO NOTHING;

-- ─── Payments ───
CREATE TABLE IF NOT EXISTS payments (
  id                    SERIAL PRIMARY KEY,
  user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id     VARCHAR(255),
  razorpay_payment_id   VARCHAR(255),
  razorpay_signature    VARCHAR(500),
  amount                INTEGER NOT NULL,
  currency              VARCHAR(10)  NOT NULL DEFAULT 'INR',
  status                VARCHAR(50)  NOT NULL DEFAULT 'created',
  plan_slug             VARCHAR(50)  NOT NULL,
  billing_cycle         VARCHAR(20)  NOT NULL DEFAULT 'monthly',
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payments_user_idx     ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_razorpay_idx ON payments(razorpay_order_id);

-- ─── Subscriptions ───
CREATE TABLE IF NOT EXISTS subscriptions (
  id                        SERIAL PRIMARY KEY,
  user_id                   INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan_slug                 VARCHAR(50)  NOT NULL DEFAULT 'free',
  status                    VARCHAR(50)  NOT NULL DEFAULT 'trial',
  trial_ends_at             TIMESTAMPTZ,
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  razorpay_subscription_id  VARCHAR(255),
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_idx   ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- ═══════════════════════════════════════════════════════════════
-- ENABLE RLS (Row Level Security) — Recommended for Supabase
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE casting_directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE casting_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- DONE! All tables created with indexes, seed data inserted.
-- ═══════════════════════════════════════════════════════════════
