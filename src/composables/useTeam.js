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
      if (!userId) return

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
      if (!userId) throw new Error('User not authenticated')

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

      if (currentTeam.value?.id === teamId) {
        currentTeam.value = null
        teamMembers.value = []
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
   * Load members of a specific team (uses RPC to get emails securely)
   */
  const loadTeamMembers = async (teamId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .rpc('get_team_members_with_email', { target_team_id: teamId })

      if (err) throw err

      teamMembers.value = data || []
    } catch (err) {
      console.error('Error loading team members:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Add existing user to team by email (owner only)
   * Uses RPC function that looks up user and adds them directly
   */
  const addMemberByEmail = async (teamId, email) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .rpc('add_team_member_by_email', {
          target_team_id: teamId,
          member_email: email
        })

      if (err) throw err

      if (!data.success) {
        throw new Error(data.error)
      }

      await loadTeamMembers(teamId)
      return data
    } catch (err) {
      console.error('Error adding member:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new account and add to team (owner only)
   * Uses RPC function that creates user in auth.users and adds to team
   */
  const createMemberAccount = async (teamId, email, password) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .rpc('create_team_member_account', {
          target_team_id: teamId,
          member_email: email,
          member_password: password
        })

      if (err) throw err

      if (!data.success) {
        throw new Error(data.error)
      }

      await loadTeamMembers(teamId)
      return data
    } catch (err) {
      console.error('Error creating member account:', err)
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

  return {
    teams,
    currentTeam,
    teamMembers,
    loading,
    error,
    isOwner,
    memberCount,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    loadTeamMembers,
    addMemberByEmail,
    createMemberAccount,
    removeMember,
    leaveTeam,
    setCurrentTeam
  }
}
