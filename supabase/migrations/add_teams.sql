-- ============================================
-- DuitKu: Team Management Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 3. Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(team_id, invited_email, status)
);

-- 4. Add team_id to transactions table (nullable, for shared transactions)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Teams: members can view their teams
CREATE POLICY "Users can view teams they belong to"
  ON teams FOR SELECT
  USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Teams: only authenticated users can create
CREATE POLICY "Authenticated users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Teams: only owner can update
CREATE POLICY "Team owner can update team"
  ON teams FOR UPDATE
  USING (owner_id = auth.uid());

-- Teams: only owner can delete
CREATE POLICY "Team owner can delete team"
  ON teams FOR DELETE
  USING (owner_id = auth.uid());

-- Team members: members can view other members in their teams
CREATE POLICY "Members can view team members"
  ON team_members FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Team members: owner can add members
CREATE POLICY "Team owner can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Team members: owner can remove members, members can remove themselves
CREATE POLICY "Owner can remove members or self-remove"
  ON team_members FOR DELETE
  USING (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Invitations: team members can view invitations
CREATE POLICY "Team members can view invitations"
  ON team_invitations FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Invitations: team owner/members can create invitations
CREATE POLICY "Team members can create invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Invitations: invited user can update (accept/decline), owner can update
CREATE POLICY "Invited user or owner can update invitation"
  ON team_invitations FOR UPDATE
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invited_by = auth.uid()
  );

-- Invitations: owner can delete invitations
CREATE POLICY "Owner can delete invitations"
  ON team_invitations FOR DELETE
  USING (invited_by = auth.uid());

-- Update transactions RLS to allow team members to see shared transactions
CREATE POLICY "Team members can view shared transactions"
  ON transactions FOR SELECT
  USING (
    user_id = auth.uid()
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Team members can insert shared transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_transactions_team_id ON transactions(team_id);
