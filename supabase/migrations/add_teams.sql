-- ============================================
-- DuitKu: Team Management - CLEAN INSTALL
-- Step 1: Drop everything team-related
-- Step 2: Create fresh tables, function, policies
-- ============================================


-- ============================================
-- STEP 1: CLEAN DROP (safe, ignores if not exists)
-- ============================================

-- Drop team-related policies on transactions
DROP POLICY IF EXISTS "Team members can insert shared transactions" ON transactions;
DROP POLICY IF EXISTS "Team members can view shared transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own and team transactions" ON transactions;

-- Restore original transactions SELECT policy (drop first to avoid duplicate)
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (user_id = auth.uid());

-- Drop team_id column from transactions
ALTER TABLE transactions DROP COLUMN IF EXISTS team_id;

-- Drop policies on team tables
DROP POLICY IF EXISTS "Owner can delete invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team members can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team members can view invitations" ON team_invitations;
DROP POLICY IF EXISTS "Invited user or owner can update invitation" ON team_invitations;

DROP POLICY IF EXISTS "Members can view team members" ON team_members;
DROP POLICY IF EXISTS "Team owner can add members" ON team_members;
DROP POLICY IF EXISTS "Owner can remove members or self-remove" ON team_members;

DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
DROP POLICY IF EXISTS "Team owner can update team" ON teams;
DROP POLICY IF EXISTS "Team owner can delete team" ON teams;

-- Drop indexes
DROP INDEX IF EXISTS idx_team_members_team_id;
DROP INDEX IF EXISTS idx_team_members_user_id;
DROP INDEX IF EXISTS idx_team_invitations_team_id;
DROP INDEX IF EXISTS idx_team_invitations_email;
DROP INDEX IF EXISTS idx_transactions_team_id;

-- Drop tables (order matters: children first)
DROP TABLE IF EXISTS team_invitations CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Drop helper function
DROP FUNCTION IF EXISTS get_my_team_ids();


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

CREATE TABLE team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(team_id, invited_email, status)
);

-- Add team_id to transactions
ALTER TABLE transactions ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;


-- ============================================
-- STEP 3: HELPER FUNCTION (SECURITY DEFINER)
-- Bypasses RLS to avoid infinite recursion
-- when team_members policies query team_members
-- ============================================

CREATE OR REPLACE FUNCTION get_my_team_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM team_members WHERE user_id = auth.uid();
$$;

-- Helper: check if user is owner of a team (also bypasses RLS)
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

-- Helper: get current user's email (auth.users not accessible by authenticated role)
CREATE OR REPLACE FUNCTION get_my_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Helper: get team members with their emails (for frontend display)
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


-- ============================================
-- STEP 4: ENABLE RLS
-- ============================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;


-- ============================================
-- STEP 5: POLICIES - teams
-- ============================================

-- SELECT: owner can always see + members via helper function
CREATE POLICY "teams_select"
  ON teams FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT get_my_team_ids())
  );

-- INSERT: any authenticated user can create (must set self as owner)
CREATE POLICY "teams_insert"
  ON teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- UPDATE: only owner
CREATE POLICY "teams_update"
  ON teams FOR UPDATE
  USING (owner_id = auth.uid());

-- DELETE: only owner
CREATE POLICY "teams_delete"
  ON teams FOR DELETE
  USING (owner_id = auth.uid());


-- ============================================
-- STEP 6: POLICIES - team_members
-- All use SECURITY DEFINER helpers to avoid recursion
-- ============================================

-- SELECT: can see members of teams you belong to
CREATE POLICY "team_members_select"
  ON team_members FOR SELECT
  USING (team_id IN (SELECT get_my_team_ids()));

-- INSERT: team owner can add anyone, OR user can add themselves (accepting invite)
CREATE POLICY "team_members_insert"
  ON team_members FOR INSERT
  WITH CHECK (
    is_team_owner(team_id)
    OR user_id = auth.uid()
  );

-- DELETE: team owner can remove anyone, OR user can remove themselves
CREATE POLICY "team_members_delete"
  ON team_members FOR DELETE
  USING (
    is_team_owner(team_id)
    OR user_id = auth.uid()
  );


-- ============================================
-- STEP 7: POLICIES - team_invitations
-- ============================================

-- SELECT: team members can see their team's invitations,
--         OR invited user can see invitations sent to them
CREATE POLICY "team_invitations_select"
  ON team_invitations FOR SELECT
  USING (
    team_id IN (SELECT get_my_team_ids())
    OR invited_email = get_my_email()
  );

-- INSERT: only team members can invite
CREATE POLICY "team_invitations_insert"
  ON team_invitations FOR INSERT
  WITH CHECK (team_id IN (SELECT get_my_team_ids()));

-- UPDATE: invited user can accept/decline, OR inviter can update
CREATE POLICY "team_invitations_update"
  ON team_invitations FOR UPDATE
  USING (
    invited_email = get_my_email()
    OR invited_by = auth.uid()
  );

-- DELETE: inviter can cancel
CREATE POLICY "team_invitations_delete"
  ON team_invitations FOR DELETE
  USING (invited_by = auth.uid());


-- ============================================
-- STEP 8: UPDATE transactions policies
-- Replace old SELECT with one that includes team
-- Keep existing INSERT/UPDATE/DELETE untouched
-- ============================================

-- Drop old SELECT, replace with team-aware version
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

CREATE POLICY "Users can view own and team transactions"
  ON transactions FOR SELECT
  USING (
    user_id = auth.uid()
    OR team_id IN (SELECT get_my_team_ids())
  );

-- Remove duplicate INSERT if exists, keep original
DROP POLICY IF EXISTS "Team members can insert shared transactions" ON transactions;
-- "Users can insert own transactions" already exists and is correct


-- ============================================
-- STEP 9: INDEXES
-- ============================================

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(invited_email);
CREATE INDEX idx_transactions_team_id ON transactions(team_id);
