/**
 * Hook para gerenciar clientes usando Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DEFAULT_SHOP_TOKEN } from '../lib/constants';

export interface Client {
  id: string;
  shop_token: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientInput {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
}

export function useClients(options?: { autoFetch?: boolean }) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shopToken = user?.shopToken ?? DEFAULT_SHOP_TOKEN;

  // Buscar clientes ativos
  const fetchClients = useCallback(async (includeInactive = false) => {
    // Modo loja única: sempre usa token padrão

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useClients] fetchClients - Iniciando busca com shopToken:', shopToken.substring(0, 8) + '...');
      console.log('🔍 [useClients] includeInactive:', includeInactive);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/clients?shopToken=${shopToken}&includeInactive=${includeInactive}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔍 [useClients] Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao buscar clientes');
      }

      const data = await response.json();
      console.log('🔍 [useClients] fetchClients - Clientes recebidos:', data.clients?.length || 0);
      console.log('🔍 [useClients] fetchClients - Dados:', JSON.stringify(data.clients?.map((c: any) => ({
        id: c.id,
        name: c.name,
        is_active: c.is_active
      })), null, 2));
      setClients(data.clients || []);
    } catch (err) {
      console.error('🔍 [useClients] Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [shopToken]);

  // Criar cliente
  const createClient = useCallback(async (clientData: ClientInput): Promise<Client> => {
    // Modo loja única: token padrão já aplicado

    console.log('✨ [useClients] createClient - Criando cliente com shopToken:', shopToken.substring(0, 8) + '...');
    console.log('✨ [useClients] createClient - Dados:', clientData);

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/clients`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          shopToken,
          ...clientData,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('✨ [useClients] Erro ao criar cliente:', errorData);
      throw new Error(errorData.error || 'Erro ao criar cliente');
    }

    const data = await response.json();
    console.log('✨ [useClients] createClient - Cliente criado com sucesso:', data.client.id);
    console.log('✨ [useClients] createClient - Cliente:', JSON.stringify({
      id: data.client.id,
      name: data.client.name,
      is_active: data.client.is_active,
      shop_token: data.client.shop_token?.substring(0, 8) + '...'
    }));
    
    // Atualizar lista local
    console.log('✨ [useClients] createClient - Lista atual tem:', clients.length, 'clientes');
    setClients(prev => {
      const newList = [data.client, ...prev];
      console.log('✨ [useClients] createClient - Nova lista terá:', newList.length, 'clientes');
      return newList;
    });
    
    return data.client;
  }, [shopToken, clients.length]);

  // Atualizar cliente
  const updateClient = useCallback(async (id: string, updates: Partial<ClientInput>): Promise<Client> => {
    // Modo loja única: token padrão já aplicado

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/clients/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar cliente');
    }

    const data = await response.json();
    
    // Atualizar lista local
    setClients(prev => prev.map(c => c.id === id ? data.client : c));
    
    return data.client;
  }, [shopToken]);

  // Inativar cliente (soft delete)
  const inactivateClient = useCallback(async (id: string): Promise<void> => {
    // Modo loja única: token padrão já aplicado

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/clients/${id}/inactivate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao inativar cliente');
    }

    // Remover da lista local
    setClients(prev => prev.filter(c => c.id !== id));
  }, [shopToken]);

  // Reativar cliente
  const reactivateClient = useCallback(async (id: string): Promise<void> => {
    // Modo loja única: token padrão já aplicado

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/clients/${id}/reactivate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao reativar cliente');
    }

    const data = await response.json();
    
    // Adicionar de volta à lista local
    setClients(prev => [data.client, ...prev]);
  }, [shopToken]);

  // Deletar permanentemente
  const deleteClient = useCallback(async (id: string): Promise<{ action: string; message: string }> => {
    if (!shopToken) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/clients/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao deletar cliente');
    }

    const data = await response.json();
    
    // Atualizar lista local
    if (data.action === 'deleted') {
      setClients(prev => prev.filter(c => c.id !== id));
    } else if (data.action === 'inactivated') {
      setClients(prev => prev.map(c => c.id === id ? { ...c, active: false, is_active: false } : c));
    }
    
    return {
      action: data.action || 'deleted',
      message: data.message || 'Operação realizada com sucesso'
    };
  }, [shopToken]);

  // Buscar cliente por ID
  const getClientById = useCallback((id: string): Client | undefined => {
    return clients.find(c => c.id === id);
  }, [clients]);

  // Carregar clientes ao montar ou quando shopToken mudar
  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchClients();
    }
  }, [fetchClients, options?.autoFetch]);

  return {
    clients,
    setClients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    inactivateClient,
    reactivateClient,
    deleteClient,
    getClientById,
  };
}
