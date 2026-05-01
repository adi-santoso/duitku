-- ============================================
-- DuitKu: Simplify Team → Staff/Employee Model
--
-- Konsep baru:
-- - Owner = user yang register sendiri. Semua data milik dia.
-- - Staff = akun yang dibuat owner. Staff akses data owner.
-- - Semua staff punya hak CRUD yang sama dengan owner.
-- - Staff TIDAK bisa manage staff lain (tambah/hapus).
-- - Tidak ada konsep "tim" terpisah. Satu owner = satu "bank".
--
-- Implementasi:
-- - Tabel user_profiles: menyimpan owner_id per user
-- - Jika owner_id IS NULL → user adalah owner
-- - Jika owner_id IS NOT NULL → user adalah staff dari owner tersebut
-- - Semua RLS policy menggunakan get_data_owner_id() untuk query
-- ============================================


-- ============================================
-- STEP 0: ENABLE PGCRYPTO EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


-- ============================================
-- STEP 1: CLEAN OLD TEAM SYSTEM
-- ============================================

-- Drop old team policies on transactions
DROP POLICY IF EXISTS "Users can view own and team transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Drop old team policies on categories
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

-- Drop old team policies on budgets
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;

-- Remove team_id from transactions
ALTER TABLE transactions DROP COLUMN IF EXISTS team_id;

-- Drop old team tables
DROP TABLE IF EXISTS team_invitations CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS get_my_team_ids();
DROP FUNCTION IF EXISTS is_team_owner(UUID);
DROP FUNCTION IF EXISTS get_team_members_with_email(UUID);
DROP FUNCTION IF EXISTS add_team_member_by_email(UUID, TEXT);
DROP FUNCTION IF EXISTS create_team_member_account(UUID, TEXT, TEXT);

DROP INDEX IF EXISTS idx_team_members_team_id;
DROP INDEX IF EXISTS idx_team_members_user_id;
DROP INDEX IF EXISTS idx_transactions_team_id;


-- ============================================
-- STEP 2: CREATE user_profiles TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;


-- ============================================
-- STEP 3: HELPER FUNCTIONS
-- ============================================

-- Get the "data owner" for current user
-- If user is owner (owner_id IS NULL) → returns own id
-- If user is staff (owner_id IS NOT NULL) → returns owner's id
CREATE OR REPLACE FUNCTION get_data_owner_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT owner_id FROM user_profiles WHERE id = auth.uid()),
    auth.uid()
  );
$$;

-- Check if current user is an owner (not a staff)
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND owner_id IS NOT NULL
  );
$$;

-- Get all staff IDs for an owner (including the owner themselves)
CREATE OR REPLACE FUNCTION get_household_user_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- The owner themselves
  SELECT get_data_owner_id()
  UNION
  -- All staff of this owner
  SELECT id FROM user_profiles WHERE owner_id = get_data_owner_id();
$$;

-- Create staff account (owner only)
CREATE OR REPLACE FUNCTION create_staff_account(staff_email TEXT, staff_password TEXT, staff_name TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  caller_id UUID;
BEGIN
  caller_id := auth.uid();

  -- Check if caller is an owner
  IF NOT is_owner() THEN
    RETURN json_build_object('success', false, 'error', 'Hanya owner yang bisa membuat akun staff');
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = staff_email) THEN
    RETURN json_build_object('success', false, 'error', 'Email sudah terdaftar');
  END IF;

  -- Create user in auth.users
  new_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    staff_email,
    extensions.crypt(staff_password, extensions.gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('display_name', COALESCE(staff_name, split_part(staff_email, '@', 1)))::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
  );

  -- Insert identity
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text,
    json_build_object('sub', new_user_id::text, 'email', staff_email)::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  -- Create profile with owner_id pointing to caller
  INSERT INTO user_profiles (id, owner_id, display_name)
  VALUES (new_user_id, caller_id, COALESCE(staff_name, split_part(staff_email, '@', 1)));

  RETURN json_build_object('success', true, 'user_id', new_user_id);
END;
$$;

-- Remove staff account (owner only)
CREATE OR REPLACE FUNCTION remove_staff_account(staff_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is an owner
  IF NOT is_owner() THEN
    RETURN json_build_object('success', false, 'error', 'Hanya owner yang bisa menghapus staff');
  END IF;

  -- Check if target is actually staff of this owner
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = staff_user_id AND owner_id = auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'User bukan staff Anda');
  END IF;

  -- Delete from auth.users (cascades to user_profiles)
  DELETE FROM auth.users WHERE id = staff_user_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Get staff list for current owner
CREATE OR REPLACE FUNCTION get_my_staff()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    up.id,
    u.email,
    up.display_name,
    up.created_at
  FROM user_profiles up
  JOIN auth.users u ON u.id = up.id
  WHERE up.owner_id = auth.uid()
  ORDER BY up.created_at;
$$;


-- ============================================
-- STEP 4: RLS POLICIES - user_profiles
-- ============================================

CREATE POLICY "profiles_select"
  ON user_profiles FOR SELECT
  USING (
    id = auth.uid()
    OR owner_id = auth.uid()
    OR id = get_data_owner_id()
  );

CREATE POLICY "profiles_insert"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid() OR is_owner());

CREATE POLICY "profiles_update"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles_delete"
  ON user_profiles FOR DELETE
  USING (owner_id = auth.uid());


-- ============================================
-- STEP 5: RLS POLICIES - transactions
-- Owner and staff share the same data (user_id = data_owner_id)
-- ============================================

CREATE POLICY "transactions_select"
  ON transactions FOR SELECT
  USING (user_id = get_data_owner_id());

CREATE POLICY "transactions_insert"
  ON transactions FOR INSERT
  WITH CHECK (user_id = get_data_owner_id());

CREATE POLICY "transactions_update"
  ON transactions FOR UPDATE
  USING (user_id = get_data_owner_id());

CREATE POLICY "transactions_delete"
  ON transactions FOR DELETE
  USING (user_id = get_data_owner_id());


-- ============================================
-- STEP 6: RLS POLICIES - categories
-- ============================================

CREATE POLICY "categories_select"
  ON categories FOR SELECT
  USING (is_default = true OR user_id = get_data_owner_id());

CREATE POLICY "categories_insert"
  ON categories FOR INSERT
  WITH CHECK (user_id = get_data_owner_id());

CREATE POLICY "categories_update"
  ON categories FOR UPDATE
  USING (user_id = get_data_owner_id() AND is_default = false);

CREATE POLICY "categories_delete"
  ON categories FOR DELETE
  USING (user_id = get_data_owner_id() AND is_default = false);


-- ============================================
-- STEP 7: RLS POLICIES - budgets
-- ============================================

CREATE POLICY "budgets_select"
  ON budgets FOR SELECT
  USING (user_id = get_data_owner_id());

CREATE POLICY "budgets_insert"
  ON budgets FOR INSERT
  WITH CHECK (user_id = get_data_owner_id());

CREATE POLICY "budgets_update"
  ON budgets FOR UPDATE
  USING (user_id = get_data_owner_id());

CREATE POLICY "budgets_delete"
  ON budgets FOR DELETE
  USING (user_id = get_data_owner_id());


-- ============================================
-- STEP 8: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_owner_id ON user_profiles(owner_id);


-- ============================================
-- STEP 9: Ensure existing owners have profiles
-- (Run once: creates profile for all existing users without one)
-- ============================================

INSERT INTO user_profiles (id, owner_id, display_name)
SELECT
  id,
  NULL,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;
