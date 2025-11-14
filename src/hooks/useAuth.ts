import { useMemo } from 'react';

export interface AuthUser {
  id: string;
  email?: string;
  technicianName?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  shopToken?: string;
}

// Modo loja única (sem login): retorna um usuário local padrão e operações no-op
export function useAuth() {
  const user: AuthUser = useMemo(() => ({
    id: 'local-user',
    email: 'local@sigle.app',
    technicianName: 'Técnico',
    storeName: 'Minha Loja',
    storeAddress: '',
    storePhone: '',
    shopToken: undefined,
  }), []);

  const signIn = async () => ({ user });
  const signUp = async () => ({ user });
  const signOut = async () => void 0;

  return {
    user,
    loading: false,
    signIn,
    signUp,
    signOut,
  };
}
