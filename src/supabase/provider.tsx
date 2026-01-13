'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';

interface SupabaseProviderProps {
  children: ReactNode;
}

// User authentication state
interface UserAuthState {
  user: User | null;
  session: Session | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Supabase context
export interface SupabaseContextState {
  user: User | null;
  session: Session | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useSupabase()
export interface SupabaseServicesAndUser {
  user: User | null;
  session: Session | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser()
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

/**
 * SupabaseProvider manages and provides Supabase services and user authentication state.
 */
export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    session: null,
    isUserLoading: true,
    userError: null,
  });

  // Effect to subscribe to Supabase auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setUserAuthState({
        user: session?.user ?? null,
        session,
        isUserLoading: false,
        userError: error,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserAuthState({
        user: session?.user ?? null,
        session,
        isUserLoading: false,
        userError: null,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Memoize the context value
  const contextValue = useMemo((): SupabaseContextState => {
    return {
      user: userAuthState.user,
      session: userAuthState.session,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [userAuthState]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};

/**
 * Hook to access Supabase services and user authentication state.
 * Throws error if used outside provider.
 */
export const useSupabase = (): SupabaseServicesAndUser => {
  const context = useContext(SupabaseContext);

  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider.');
  }

  return {
    user: context.user,
    session: context.session,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useSupabase();
  return { user, isUserLoading, userError };
};
