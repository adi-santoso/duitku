import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuth } from './useAuth'

/**
 * Composable for team management with Supabase
 */
export function useTeam() {
  const { getUserId, currentUser } = useAuth()
  const teams = ref([])
  const currentTeam = ref(null)
  const teamMembers = ref([])
  const teamInvitations = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Load all teams the user belongs to
   */
  const loadTeams = async () => {
    loading.value = true
    error.value = null

    try {
      const userId = getUserId()

      const { data, error: err } = await supabase
        .from('team_members')
        .select(`
          role,
          joined_at,
          teams (
            id,
            name,
            description,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', userId)

      if (err) throw err

      teams.value = (data || []).map(tm => ({
        ...tm.teams,
        myRole: tm.role,
        joinedAt: tm.joined_at
      }))
    } catch (err) {
      console.error('Error loading teams:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new team
   */
  const createTeam = async (name, description = '') => {
    loading.value = true
    error.value = null

    try {
      const userId = getUserId()

      // Create team
      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          owner_id: userId
        })
        .select()
        .single()

      if (teamErr) throw teamErr

      // Add creator as owner member
      const { error: memberErr } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          role: 'owner'
        })

      if (memberErr) throw memberErr

      await loadTeams()
      return team
    } catch (err) {
      console.error('Error creating team:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update team info
   */
  const updateTeam = async (teamId, updates) => {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase
        .from('teams')
        .update({
          name: updates.name,
          description: updates.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)

      if (err) throw err

      await loadTeams()
    } catch (err) {
      console.error('Error updating team:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a team (owner only)
   */
  const deleteTeam = async (teamId) => {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (err) throw err

      // Clear current team if it was deleted
      if (currentTeam.value?.id === teamId) {
        currentTeam.value = null
        teamMembers.value = []
        teamInvitations.value = []
      }

      await loadTeams()
    } catch (err) {
      console.error('Error deleting team:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Load members of a specific team
   */
  const loadTeamMembers = async (teamId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true })

      if (err) throw err

      // Fetch user emails for each member
      const members = []
      for (const member of (data || [])) {
        // Get user info from auth.users via a lookup
        const { data: userData } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('user_id', member.user_id)
          .single()

        members.push({
          ...member,
          email: member.user_id === getUserId()
            ? currentUser.value?.email
            : `user-${member.user_id.substring(0, 8)}`
        })
      }

      teamMembers.value = members
    } catch (err) {
      console.error('Error loading team members:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Invite a user by email
   */
  const inviteMember = async (teamId, email) => {
    loading.value = true
    error.value = null

    try {
      // Check if already invited
      const { data: existing } = await supabase
        .from('team_invitations')
        .select('id')
        .eq('team_id', teamId)
        .eq('invited_email', email)
        .eq('status', 'pending')
        .maybeSingle()

      if (existing) {
        throw new Error('Email ini sudah diundang dan menunggu konfirmasi')
      }

      const { data, error: err } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          invited_email: email,
          invited_by: getUserId()
        })
        .select()
        .single()

      if (err) throw err

      await loadInvitations(teamId)
      return data
    } catch (err) {
      console.error('Error inviting member:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Load invitations for a team
   */
  const loadInvitations = async (teamId) => {
    try {
      const { data, error: err } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

      if (err) throw err

      teamInvitations.value = data || []
    } catch (err) {
      console.error('Error loading invitations:', err)
      error.value = err.message
    }
  }

  /**
   * Load pending invitations for the current user
   */
  const loadMyInvitations = async () => {
    try {
      const email = currentUser.value?.email
      if (!email) return []

      const { data, error: err } = await supabase
        .from('team_invitations')
        .select(`
          *,
          teams (
            id,
            name,
            description
          )
        `)
        .eq('invited_email', email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (err) throw err

      return data || []
    } catch (err) {
      console.error('Error loading my invitations:', err)
      return []
    }
  }

  /**
   * Accept an invitation
   */
  const acceptInvitation = async (invitationId) => {
    loading.value = true
    error.value = null

    try {
      // Get invitation details
      const { data: invitation, error: invErr } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (invErr) throw invErr

      // Update invitation status
      const { error: updateErr } = await supabase
        .from('team_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId)

      if (updateErr) throw updateErr

      // Add user as team member
      const { error: memberErr } = await supabase
        .from('team_members')
        .insert({
          team_id: invitation.team_id,
          user_id: getUserId(),
          role: 'member'
        })

      if (memberErr) throw memberErr

      await loadTeams()
    } catch (err) {
      console.error('Error accepting invitation:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Decline an invitation
   */
  const declineInvitation = async (invitationId) => {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase
        .from('team_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId)

      if (err) throw err
    } catch (err) {
      console.error('Error declining invitation:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancel a pending invitation (owner only)
   */
  const cancelInvitation = async (invitationId, teamId) => {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId)

      if (err) throw err

      await loadInvitations(teamId)
    } catch (err) {
      console.error('Error canceling invitation:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove a member from team (owner only)
   */
  const removeMember = async (teamId, userId) => {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (err) throw err

      await loadTeamMembers(teamId)
    } catch (err) {
      console.error('Error removing member:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Leave a team (member only, not owner)
   */
  const leaveTeam = async (teamId) => {
    loading.value = true
    error.value = null

    try {
      const userId = getUserId()

      const { error: err } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (err) throw err

      if (currentTeam.value?.id === teamId) {
        currentTeam.value = null
        teamMembers.value = []
      }

      await loadTeams()
    } catch (err) {
      console.error('Error leaving team:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Set the active/current team
   */
  const setCurrentTeam = (team) => {
    currentTeam.value = team
  }

  /**
   * Check if current user is owner of a team
   */
  const isOwner = computed(() => {
    if (!currentTeam.value) return false
    return currentTeam.value.owner_id === getUserId()
  })

  /**
   * Get team member count
   */
  const memberCount = computed(() => teamMembers.value.length)

  /**
   * Get pending invitation count
   */
  const pendingInvitationCount = computed(() =>
    teamInvitations.value.filter(i => i.status === 'pending').length
  )

  return {
    teams,
    currentTeam,
    teamMembers,
    teamInvitations,
    loading,
    error,
    isOwner,
    memberCount,
    pendingInvitationCount,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    loadTeamMembers,
    inviteMember,
    loadInvitations,
    loadMyInvitations,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    removeMember,
    leaveTeam,
    setCurrentTeam
  }
}
