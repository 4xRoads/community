import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'driver'
  qualifications?: string[]
}

interface AuthState {
  user: User | null
  loading: boolean
  accessToken: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    accessToken: null
  })

  useEffect(() => {
    let mounted = true

    // Check for existing session
    const getSession = async () => {
      try {
        console.log('Checking for existing session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          if (mounted) {
            setAuthState({ user: null, loading: false, accessToken: null })
          }
          return
        }

        if (session?.access_token && mounted) {
          console.log('Found existing session for:', session.user.email)
          await fetchUserData(session.access_token)
        } else if (mounted) {
          console.log('No existing session found')
          setAuthState({ user: null, loading: false, accessToken: null })
        }
      } catch (error) {
        console.error('Session check error:', error)
        if (mounted) {
          setAuthState({ user: null, loading: false, accessToken: null })
        }
      }
    }

    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (session?.access_token && mounted) {
        await fetchUserData(session.access_token)
      } else if (mounted) {
        setAuthState({ user: null, loading: false, accessToken: null })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserData = async (accessToken: string) => {
    try {
      console.log('Fetching user data from server...')
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66cf8c6c/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('User data fetched successfully:', data.user.email, data.user.role)
        setAuthState({
          user: data.user,
          loading: false,
          accessToken
        })
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch user data:', response.status, errorData)
        // Still set the basic auth state even if server call fails
        setAuthState({ user: null, loading: false, accessToken })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Still set the basic auth state even if server call fails
      setAuthState({ user: null, loading: false, accessToken })
    }
  }

  const signUp = async (email: string, password: string, name: string, role: 'admin' | 'driver' = 'driver') => {
    try {
      console.log('Creating new account for:', email)
      
      // Try server signup first
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66cf8c6c/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name, role })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Account created successfully via server for:', email)
          return { success: true, message: data.message }
        } else {
          const errorData = await response.json()
          console.error('Server signup failed:', errorData)
          throw new Error(errorData.error || 'Server signup failed')
        }
      } catch (serverError) {
        console.error('Server signup error:', serverError)
        // Fallback to direct Supabase signup
        console.log('Falling back to direct Supabase signup...')
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, role }
          }
        })
        
        if (error) {
          throw error
        }
        
        console.log('Account created successfully via direct Supabase for:', email)
        return { success: true, message: 'Account created successfully' }
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email)
      
      // Clean the credentials
      const cleanEmail = email.trim().toLowerCase()
      const cleanPassword = password.trim()
      
      console.log('Cleaned email:', cleanEmail)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      })

      if (error) {
        console.error('Supabase auth error:', error.message)
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          const suggestion = cleanEmail.includes('@example.com') 
            ? 'The demo account may not exist yet. Try clicking "Create Demo Accounts" first.' 
            : 'Please check your email and password and try again.'
          
          throw new Error(`Invalid login credentials. ${suggestion}`)
        }
        
        throw error
      }

      if (!data.user) {
        console.error('No user data returned from sign in')
        throw new Error('Sign in failed - no user data returned')
      }

      console.log('Sign in successful for:', data.user.email)
      return { success: true, data }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setAuthState({ user: null, loading: false, accessToken: null })
      console.log('Sign out successful')
      return { success: true }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    ...authState,
    signUp,
    signIn,
    signOut
  }
}
