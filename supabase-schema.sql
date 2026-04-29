-- ============================================
-- DuitKu - Supabase Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Categories Table
-- ============================================
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Transactions Table
-- ============================================
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT,
  receipt_image TEXT,
  transaction_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Budgets Table
-- ============================================
CREATE TABLE budgets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- ============================================
-- 4. Indexes for Performance
-- ============================================
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);

-- ============================================
-- 5. Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Categories: users can see default categories + their own
CREATE POLICY "Users can view default and own categories"
  ON categories FOR SELECT
  USING (is_default = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own non-default categories"
  ON categories FOR UPDATE
  USING (user_id = auth.uid() AND is_default = false);

CREATE POLICY "Users can delete own non-default categories"
  ON categories FOR DELETE
  USING (user_id = auth.uid() AND is_default = false);

-- Transactions: users can only access their own
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (user_id = auth.uid());

-- Budgets: users can only access their own
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 6. Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. Seed Default Categories
-- ============================================
INSERT INTO categories (name, type, icon, color, is_default, user_id) VALUES
  -- Expense categories
  ('Makanan & Minuman', 'expense', '🍔', '#FF6B6B', true, NULL),
  ('Transport', 'expense', '🚗', '#4ECDC4', true, NULL),
  ('Rumah Tangga', 'expense', '🏠', '#45B7D1', true, NULL),
  ('Kesehatan', 'expense', '💊', '#96CEB4', true, NULL),
  ('Hiburan', 'expense', '🎮', '#FFEAA7', true, NULL),
  ('Belanja', 'expense', '🛒', '#DFE6E9', true, NULL),
  ('Pendidikan', 'expense', '📚', '#74B9FF', true, NULL),
  ('Bisnis', 'expense', '💼', '#A29BFE', true, NULL),
  ('Tagihan', 'expense', '💳', '#FD79A8', true, NULL),
  ('Lain-lain', 'expense', '🎁', '#B2BEC3', true, NULL),
  -- Income categories
  ('Gaji', 'income', '💰', '#00B894', true, NULL),
  ('Freelance', 'income', '💼', '#00CEC9', true, NULL),
  ('Investasi', 'income', '📈', '#FDCB6E', true, NULL),
  ('Hadiah', 'income', '🎁', '#E17055', true, NULL),
  ('Lainnya', 'income', '💵', '#636E72', true, NULL);

-- ============================================
-- 8. Function: Seed categories for new user
-- ============================================
-- This function is called when a new user signs up
-- It doesn't need to copy default categories since
-- default categories (is_default=true, user_id=NULL)
-- are visible to all users via RLS policy.
-- Custom categories will have user_id set.
