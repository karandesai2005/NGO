// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/utils/supabase';
import { User } from '@/types';

type Role = 'Volunteer' | 'Admin' | 'Parent';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) fetchProfile(session.user.id);
        else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', uid)
      .single();

    if (error) {
      console.error('profile fetch error →', error);
      setIsLoading(false);
      return;
    }

    const appUser: User = {
      id: uid,
      email: data.full_name
        ? data.full_name.split(' ')[0].toLowerCase() + '@akshar.org'
        : '',
      name: data.full_name ?? '',
      role: capitalize(data.role) as Role,
      createdAt: new Date().toISOString(), // ← optional, safe to add
    };

    setUser(appUser);
    setIsLoading(false);
  };

  const login = (u: User) => setUser(u);
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper: 'volunteer' → 'Volunteer'
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);