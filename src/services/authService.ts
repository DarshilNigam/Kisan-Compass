/**
 * KISAN COMPASS — Authentication Service
 * 
 * Production-grade client authentication with persistent account registry,
 * cryptographic session management, and honest error handling.
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getAppMode } from './farmRepository';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // SHA-256 hash
  createdAt: string;
  role: 'FARMER' | 'AGRONOMIST' | 'JUDGE';
  location: string;
}

export interface AuthSession {
  user: Omit<UserAccount, 'passwordHash'>;
  token: string;
  expiresAt: string;
}

const STORAGE_USERS_KEY = 'kisan_compass_registered_users_v1';
const STORAGE_SESSION_KEY = 'kisan_compass_auth_session_v1';

// Synchronous SHA-256 hashing helper for browser
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredUsers(): UserAccount[] {
  try {
    // In production mode, never seed mock pilot accounts
    if (getAppMode() === 'production') {
      return [];
    }
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      // Seed default authentic pilot farmer account in development/demo only
      // Default password: password123
      const defaultUsers: UserAccount[] = [
        {
          id: 'usr_pilot_01',
          name: 'Ramesh Patel',
          email: 'ramesh.patel@kisan.org',
          // SHA-256 of "password123"
          passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
          createdAt: '2026-03-01T08:00:00.000Z',
          role: 'FARMER',
          location: 'Kanpur Rural / Unnao Border'
        }
      ];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored users:', err);
    return [];
  }
}

function saveStoredUsers(users: UserAccount[]) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

export const AuthService = {
  // Check active session
  getCurrentSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      if (new Date(session.expiresAt) <= new Date()) {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        return null;
      }
      // In production mode, reject any local mock account session (e.g. starting with usr_)
      if (getAppMode() === 'production' && session.user?.id?.startsWith('usr_')) {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  // Login with honest validation (Supabase + Local Fallback)
  async login(email: string, passwordPlain: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !passwordPlain) {
      return { success: false, error: 'Email and password are required.' };
    }

    // 1. If Supabase is configured, authenticate via Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: passwordPlain,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.session && data.user) {
          const session: AuthSession = {
            user: {
              id: data.user.id,
              name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
              email: data.user.email || cleanEmail,
              createdAt: data.user.created_at,
              role: 'FARMER',
              location: data.user.user_metadata?.location || 'Registered Farm'
            },
            token: data.session.access_token,
            expiresAt: new Date(Date.now() + (data.session.expires_in || 3600) * 1000).toISOString()
          };
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
          return { success: true, session };
        }
      } catch (err: any) {
        if (getAppMode() === 'production') {
          return { success: false, error: err?.message || 'Supabase authentication failed.' };
        }
        console.warn('Supabase Auth error, checking local store:', err);
      }
      if (getAppMode() === 'production') {
        return { success: false, error: 'Authentication failed. Please verify your credentials.' };
      }
    } else if (getAppMode() === 'production') {
      return { success: false, error: 'Supabase configuration is required in production mode.' };
    }

    // 2. Cryptographic Local Account Store Fallback
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        error: "We couldn't find an account with these details. Create an account first."
      };
    }

    const hash = await sha256(passwordPlain);
    if (hash !== user.passwordHash) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials.'
      };
    }

    const session: AuthSession = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        role: user.role,
        location: user.location
      },
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    return { success: true, session };
  },

  // Register with honest duplicate prevention (Supabase + Local Fallback)
  async register(
    name: string,
    email: string,
    passwordPlain: string,
    confirmPasswordPlain: string
  ): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!passwordPlain || passwordPlain.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (passwordPlain !== confirmPasswordPlain) {
      return { success: false, error: 'Passwords do not match.' };
    }

    // 1. If Supabase is configured, register via Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: passwordPlain,
          options: {
            data: {
              full_name: cleanName,
              location: 'Pending Onboarding'
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.session && data.user) {
          const session: AuthSession = {
            user: {
              id: data.user.id,
              name: cleanName,
              email: data.user.email || cleanEmail,
              createdAt: data.user.created_at,
              role: 'FARMER',
              location: 'Pending Onboarding'
            },
            token: data.session.access_token,
            expiresAt: new Date(Date.now() + (data.session.expires_in || 3600) * 1000).toISOString()
          };
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
          return { success: true, session };
        } else if (data.user) {
          // Attempt immediate sign-in in case email is auto-confirmed
          const loginAttempt = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: passwordPlain,
          });

          if (loginAttempt.data?.session && loginAttempt.data?.user) {
            const session: AuthSession = {
              user: {
                id: loginAttempt.data.user.id,
                name: cleanName,
                email: cleanEmail,
                createdAt: loginAttempt.data.user.created_at,
                role: 'FARMER',
                location: 'Pending Onboarding'
              },
              token: loginAttempt.data.session.access_token,
              expiresAt: new Date(Date.now() + (loginAttempt.data.session.expires_in || 3600) * 1000).toISOString()
            };
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
            return { success: true, session };
          }

          return { 
            success: false, 
            error: 'Account created! If email confirmation is enabled in your Supabase project, please confirm your email or disable "Confirm email" in Supabase Auth settings to enable instant onboarding.' 
          };
        }
      } catch (err: any) {
        if (getAppMode() === 'production') {
          return { success: false, error: err?.message || 'Supabase registration failed.' };
        }
        console.warn('Supabase SignUp error, falling back to local registry:', err);
      }
      if (getAppMode() === 'production') {
        return { success: false, error: 'Registration failed. No session was established.' };
      }
    } else if (getAppMode() === 'production') {
      return { success: false, error: 'Supabase configuration is required in production mode.' };
    }

    const users = getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      return {
        success: false,
        error: 'This account already exists. Please log in to continue.'
      };
    }

    const passwordHash = await sha256(passwordPlain);
    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
      role: 'FARMER',
      location: 'Field 07 Pilot Station'
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Automatically create session upon successful registration
    const session: AuthSession = {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        role: newUser.role,
        location: newUser.location
      },
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    return { success: true, session };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
};
