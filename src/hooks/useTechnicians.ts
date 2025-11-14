/**
 * Hook para gerenciar técnicos usando Supabase Auth
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface Technician {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export function useTechnicians() {
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shopToken = user?.shopToken;

  // Buscar técnicos
  const fetchTechnicians = useCallback(async () => {
    if (!shopToken) {
      setTechnicians([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/technicians`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar técnicos');
      }

      const data = await response.json();
      setTechnicians(data.technicians || []);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  }, [shopToken]);

  // Buscar técnico por ID
  const getTechnicianById = useCallback((id: string): Technician | undefined => {
    return technicians.find(t => t.id === id);
  }, [technicians]);

  // Buscar técnico por email
  const getTechnicianByEmail = useCallback((email: string): Technician | undefined => {
    return technicians.find(t => t.email === email);
  }, [technicians]);

  // Carregar técnicos ao montar ou quando shopToken mudar
  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  // Incluir o usuário atual automaticamente na lista se não estiver
  useEffect(() => {
    if (user && technicians.length > 0) {
      const currentUserInList = technicians.find(t => t.id === user.id);
      if (!currentUserInList) {
        // Adicionar o usuário atual à lista
        const currentUserAsTechnician: Technician = {
          id: user.id,
          email: user.email || '',
          name: user.technicianName || user.email?.split('@')[0] || 'Técnico',
          created_at: new Date().toISOString(),
        };
        setTechnicians(prev => [currentUserAsTechnician, ...prev]);
      }
    }
  }, [user, technicians]);

  return {
    technicians,
    loading,
    error,
    fetchTechnicians,
    getTechnicianById,
    getTechnicianByEmail,
  };
}
