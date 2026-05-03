-- ═══════════════════════════════════════════════════════════════
-- Cinex Universe — Fix Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- This migration adds the columns and tables that were missing
-- from the original schema.sql but ARE required by schema.ts.
-- Without this, registration crashes and login is impossible.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Add missing columns to users table ──────────────────────
-- These 5 columns exist in schema.ts but were absent from schema.sql,
-- causing every INSERT into users to fail with "column does not exist".

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan_slug              VARCHAR(50)  DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS trial_ends_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status    VARCHAR(50)  DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS razorpay_customer_id   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id VARCHAR(255);

-- ─── 2. Create payments table (was completely missing) ───────────
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

-- ─── 3. Create subscriptions table (was completely missing) ──────
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

-- ─── 4. Enable RLS on new tables (consistent with other tables) ──
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- ✅ Migration complete.
-- You can now register and log in to Cinex Universe.
-- ═══════════════════════════════════════════════════════════════
