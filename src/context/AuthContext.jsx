import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile from DB — auto-create if missing (in case trigger didn't fire)
  const fetchProfile = useCallback(async (authUser) => {
    try {
      const userId = typeof authUser === 'string' ? authUser : authUser?.id
      if (!userId) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data)
        return data
      }

      // Profile doesn't exist yet — create it from auth metadata
      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        const meta = typeof authUser === 'object' ? authUser?.user_metadata : {}
        const username = meta?.username || meta?.display_name || 'player_' + userId.substring(0, 8)
        const displayName = meta?.display_name || meta?.username || username

        const { data: newProfile, error: insertErr } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username,
            display_name: displayName,
          })
          .select()
          .single()

        if (!insertErr && newProfile) {
          setProfile(newProfile)
          return newProfile
        }
      }

      return null
    } catch (err) {
      console.warn('fetchProfile error (tables may not exist yet):', err.message)
      return null
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true
    let loadingResolved = false

    const resolveLoading = () => {
      if (!loadingResolved && mounted) {
        loadingResolved = true
        setLoading(false)
      }
    }

    // Safety timeout — never stay stuck on loading
    const safetyTimer = setTimeout(resolveLoading, 5000)

    // onAuthStateChange fires INITIAL_SESSION synchronously when registered
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        const authUser = session?.user ?? null
        setUser(authUser)
        // Resolve loading immediately — don't wait for profile fetch
        resolveLoading()
        // Fetch profile in the background (non-blocking)
        if (authUser) {
          fetchProfile(authUser).catch(() => {})
        } else {
          setProfile(null)
        }
      }
    )

    // Also call getSession as a fallback
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!mounted) return
        if (error) {
          resolveLoading()
          return
        }
        const authUser = data?.session?.user ?? null
        setUser(authUser)
        resolveLoading()
        if (authUser) {
          fetchProfile(authUser).catch(() => {})
        }
      })
      .catch(() => resolveLoading())

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Sign up
  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
      },
    })
    if (error) throw error
    return data
  }

  // Sign in
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      fetchProfile,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
