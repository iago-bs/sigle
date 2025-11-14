import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  technicianName?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  shopToken?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
        } else if (session?.user) {
          // Enrich user with metadata
          setUser({
            ...session.user,
            technicianName: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Técnico',
            storeName: session.user.user_metadata?.storeName,
            storeAddress: session.user.user_metadata?.storeAddress,
            storePhone: session.user.user_metadata?.storePhone,
            shopToken: session.user.user_metadata?.shopToken,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        setUser({
          ...session.user,
          technicianName: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Técnico',
          storeName: session.user.user_metadata?.storeName,
          storeAddress: session.user.user_metadata?.storeAddress,
          storePhone: session.user.user_metadata?.storePhone,
          shopToken: session.user.user_metadata?.shopToken,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, shopToken: string) => {
    // First verify the shop token before attempting login
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/verify-shop-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, shopToken }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Token da loja inválido');
    }

    // If shop token is valid, proceed with login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    storeName: string, 
    storeAddress: string, 
    storePhone: string,
    mode: 'create' | 'join' = 'create',
    existingToken?: string
  ) => {
    // Call server endpoint to create user with auto-confirmed email and generate/use shop token
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          storeName, 
          storeAddress, 
          storePhone,
          mode,
          existingToken
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Erro ao criar conta');
    }

    // Return the shop token so UI can display it
    const shopToken = result.shopToken;

    // After successful signup, sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { ...data, shopToken, mode: result.mode };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
