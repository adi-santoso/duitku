-- ============================================
-- DuitKu: Team Management - CLEAN INSTALL
-- Step 1: Drop everything team-related
-- Step 2: Create fresh tables, functions, policies
--
-- NOTE: team_invitations table is NOT used.
-- Members are added directly by email or by creating new accounts.
-- ============================================


-- ============================================
-- STEP 1: CLEAN DROP
-- ============================================

DROP POLICY IF EXISTS "Team members can insert shared transactions" ON transactions;
DROP POLICY IF EXISTS "Team members can view shared transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own and team transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

-- Restore original transactions SELECT policy
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (user_id = auth.uid());

ALTER TABLE transactions DROP COLUMN IF EXISTS team_id;

DROP TABLE IF EXISTS team_invitations CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

DROP FUNCTION IF EXISTS get_my_team_ids();
DROP FUNCTION IF EXISTS is_team_owner(UUID);
DROP FUNCTION IF EXISTS get_my_email();
DROP FUNCTION IF EXISTS get_team_members_with_email(UUID);
DROP FUNCTION IF EXISTS add_team_member_by_email(UUID, TEXT);
DROP FUNCTION IF EXISTS create_team_member_account(UUID, TEXT, TEXT);

DROP INDEX IF EXISTS idx_team_members_team_id;
DROP INDEX IF EXISTS idx_team_members_user_id;
DROP INDEX IF EXISTS idx_transactions_team_id;


-- ============================================
-- STEP 2: CREATE TABLES
-- ============================================

CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Add team_id to transactions for shared transactions
ALTER TABLE transactions ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;


-- ============================================
-- STEP 3: HELPER FUNCTIONS (SECURITY DEFINER)
-- These bypass RLS to avoid infinite recursion
-- ============================================

-- Get team IDs for current user
CREATE OR REPLACE FUNCTION get_my_team_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM team_members WHERE user_id = auth.uid();
$$;

-- Check if current user is owner of a specific team
CREATE OR REPLACE FUNCTION is_team_owner(check_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM teams WHERE id = check_team_id AND owner_id = auth.uid()
  );
$$;

-- Get team members with their emails (for display in frontend)
CREATE OR REPLACE FUNCTION get_team_members_with_email(target_team_id UUID)
RETURNS TABLE (
  id UUID,
  team_id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  email TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.joined_at,
    u.email
  FROM team_members tm
  JOIN auth.users u ON u.id = tm.user_id
  WHERE tm.team_id = target_team_id
    AND tm.team_id IN (SELECT get_my_team_ids())
  ORDER BY tm.joined_at;
$$;

-- Add existing user to team by email
CREATE OR REPLACE FUNCTION add_team_member_by_email(target_team_id UUID, member_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Check if caller is team owner
  IF NOT is_team_owner(target_team_id) THEN
    RETURN json_build_object('success', false, 'error', 'Hanya pemilik tim yang bisa menambah anggota');
  END IF;

  -- Find user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = member_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Email tidak ditemukan. User belum terdaftar di DuitKu');
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM team_members WHERE team_id = target_team_id AND user_id = target_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'User ini sudah menjadi anggota tim');
  END IF;

  -- Add as member
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (target_team_id, target_user_id, 'member');

  RETURN json_build_object('success', true, 'user_id', target_user_id);
END;
$$;

-- Create new user account and add to team
CREATE OR REPLACE FUNCTION create_team_member_account(target_team_id UUID, member_email TEXT, member_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if caller is team owner
  IF NOT is_team_owner(target_team_id) THEN
    RETURN json_build_object('success', false, 'error', 'Hanya pemilik tim yang bisa membuat akun anggota');
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = member_email) THEN
    RETURN json_build_object('success', false, 'error', 'Email sudah terdaftar. Gunakan fitur Tambah Anggota.');
  END IF;

  -- Create user
  new_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    member_email,
    crypt(member_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
  );

  -- Insert identity (required for Supabase auth login to work)
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text,
    json_build_object('sub', new_user_id::text, 'email', member_email)::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  -- Add to team
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (target_team_id, new_user_id, 'member');

  RETURN json_build_object('success', true, 'user_id', new_user_id);
END;
$$;


-- ============================================
-- STEP 4: ENABLE RLS
-- ============================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;


-- ============================================
-- STEP 5: POLICIES - teams
-- ============================================

CREATE POLICY "teams_select"
  ON teams FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT get_my_team_ids())
  );

CREATE POLICY "teams_insert"
  ON teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "teams_update"
  ON teams FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "teams_delete"
  ON teams FOR DELETE
  USING (owner_id = auth.uid());


-- ============================================
-- STEP 6: POLICIES - team_members
-- ============================================

CREATE POLICY "team_members_select"
  ON team_members FOR SELECT
  USING (team_id IN (SELECT get_my_team_ids()));

CREATE POLICY "team_members_insert"
  ON team_members FOR INSERT
  WITH CHECK (
    is_team_owner(team_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "team_members_delete"
  ON team_members FOR DELETE
  USING (
    is_team_owner(team_id)
    OR user_id = auth.uid()
  );


-- ============================================
-- STEP 7: UPDATE transactions policies for team sharing
-- ============================================

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

CREATE POLICY "Users can view own and team transactions"
  ON transactions FOR SELECT
  USING (
    user_id = auth.uid()
    OR team_id IN (SELECT get_my_team_ids())
  );


-- ============================================
-- STEP 8: INDEXES
-- ============================================

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_transactions_team_id ON transactions(team_id);
