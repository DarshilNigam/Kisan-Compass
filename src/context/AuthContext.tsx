/**
 * KISAN COMPASS — AuthContext
 * 
 * Manages user authentication state, pending feature redirection,
 * and session persistence.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService, AuthSession } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { getAppMode } from '../services/farmRepository';
import { FeatureId } from '../config/features';

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  user: AuthSession['user'] | null;
  pendingFeature: FeatureId | null;
  setPendingFeature: (feature: FeatureId | null) => void;
  isAuthGateOpen: boolean;
  openAuthGate: (targetFeature?: FeatureId) => void;
  closeAuthGate: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, confirm: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [pendingFeature, setPendingFeature] = useState<FeatureId | null>(null);
  const [isAuthGateOpen, setIsAuthGateOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Check initial local session only in development/demo mode
    if (getAppMode() !== 'production') {
      const existing = AuthService.getCurrentSession();
      if (existing) {
        setSession(existing);
      }
    }

    // Synchronize with active Supabase session if configured
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
        if (!isMounted) return;
        if (sbSession?.user) {
          const restoredSession: AuthSession = {
            user: {
              id: sbSession.user.id,
              name: sbSession.user.user_metadata?.full_name || sbSession.user.email?.split('@')[0] || 'Farmer',
              email: sbSession.user.email || '',
              createdAt: sbSession.user.created_at,
              role: 'FARMER',
              location: sbSession.user.user_metadata?.location || 'Registered Farm'
            },
            token: sbSession.access_token,
            expiresAt: new Date(Date.now() + (sbSession.expires_in || 3600) * 1000).toISOString()
          };
          setSession(restoredSession);
          localStorage.setItem('kisan_compass_auth_session_v1', JSON.stringify(restoredSession));
        } else if (getAppMode() === 'production') {
          // If in production and Supabase has no active session, clear any stale mock session
          setSession(null);
          localStorage.removeItem('kisan_compass_auth_session_v1');
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sbSession) => {
        if (!isMounted) return;
        if (sbSession?.user) {
          const updatedSession: AuthSession = {
            user: {
              id: sbSession.user.id,
              name: sbSession.user.user_metadata?.full_name || sbSession.user.email?.split('@')[0] || 'Farmer',
              email: sbSession.user.email || '',
              createdAt: sbSession.user.created_at,
              role: 'FARMER',
              location: sbSession.user.user_metadata?.location || 'Registered Farm'
            },
            token: sbSession.access_token,
            expiresAt: new Date(Date.now() + (sbSession.expires_in || 3600) * 1000).toISOString()
          };
          setSession(updatedSession);
          localStorage.setItem('kisan_compass_auth_session_v1', JSON.stringify(updatedSession));
        } else if (event === 'SIGNED_OUT' || (getAppMode() === 'production' && !sbSession)) {
          setSession(null);
          localStorage.removeItem('kisan_compass_auth_session_v1');
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }
  }, []);

  const openAuthGate = useCallback((targetFeature?: FeatureId) => {
    if (targetFeature) {
      setPendingFeature(targetFeature);
    }
    setIsAuthGateOpen(true);
  }, []);

  const closeAuthGate = useCallback(() => {
    setIsAuthGateOpen(false);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    const res = await AuthService.login(email, pass);
    if (res.success && res.session) {
      if (isSupabaseConfigured && supabase) {
        // Explicitly await the Supabase client session to eliminate any hydration race condition
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (getAppMode() === 'production' && !sbSession) {
          return { success: false, error: 'Authentication failed: Supabase session failed to hydrate. Please try again.' };
        }
      }
      setSession(res.session);
      setIsAuthGateOpen(false);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string, confirm: string) => {
    const res = await AuthService.register(name, email, pass, confirm);
    if (res.success && res.session) {
      if (isSupabaseConfigured && supabase) {
        // Explicitly await the Supabase client session to eliminate any hydration race condition
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (getAppMode() === 'production' && !sbSession) {
          return { success: false, error: 'Registration succeeded, but Supabase session is pending. Please sign in.' };
        }
      }
      setSession(res.session);
      setIsAuthGateOpen(false);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setSession(null);
    setPendingFeature(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        user: session?.user || null,
        pendingFeature,
        setPendingFeature,
        isAuthGateOpen,
        openAuthGate,
        closeAuthGate,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
