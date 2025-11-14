/**
 * Hook para gerenciar peças usando Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface Part {
  id: string;
  shop_token: string;
  service_order_id?: string;
  os_number?: string;
  client_name?: string;
  equipment_type?: string;
  technician_name?: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier?: string;
  status: string;
  estimated_arrival_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PartInput {
  service_order_id?: string;
  os_number?: string;
  client_name?: string;
  equipment_type?: string;
  technician_name?: string;
  name: string;
  quantity: number;
  unit_price: number;
  supplier?: string;
  status?: string;
  estimated_arrival_date?: string;
  notes?: string;
}

export function useParts() {
  const { user } = useAuth();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shopToken = user?.shopToken;

  // Buscar peças
  const fetchParts = useCallback(async () => {
    if (!shopToken) {
      setParts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/parts?shopToken=${shopToken}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar peças');
      }

      const data = await response.json();
      setParts(data.parts || []);
    } catch (err) {
      console.error('Error fetching parts:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setParts([]);
    } finally {
      setLoading(false);
    }
  }, [shopToken]);

  // Criar peça
  const createPart = useCallback(async (partData: PartInput): Promise<Part> => {
    if (!shopToken) {
      throw new Error('Usuário não autenticado');
    }

    // Calcular total_price
    const total_price = partData.quantity * partData.unit_price;

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/parts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          shopToken,
          ...partData,
          total_price,
          status: partData.status || 'pending',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar peça');
    }

    const data = await response.json();
    
    // Atualizar lista local
    setParts(prev => [data.part, ...prev]);
    
    return data.part;
  }, [shopToken]);

  // Atualizar peça
  const updatePart = useCallback(async (id: string, updates: Partial<PartInput>): Promise<Part> => {
    if (!shopToken) {
      throw new Error('Usuário não autenticado');
    }

    // Recalcular total_price se quantity ou unit_price mudaram
    let updateData: any = { ...updates };
    if (updates.quantity !== undefined || updates.unit_price !== undefined) {
      const currentPart = parts.find(p => p.id === id);
      if (currentPart) {
        const quantity = updates.quantity ?? currentPart.quantity;
        const unit_price = updates.unit_price ?? currentPart.unit_price;
        updateData.total_price = quantity * unit_price;
      }
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/parts/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar peça');
    }

    const data = await response.json();
    
    // Atualizar lista local
    setParts(prev => prev.map(p => p.id === id ? data.part : p));
    
    return data.part;
  }, [shopToken, parts]);

  // Atualizar status da peça
  const updatePartStatus = useCallback(async (id: string, status: string): Promise<Part> => {
    return updatePart(id, { status });
  }, [updatePart]);

  // Deletar peça
  const deletePart = useCallback(async (id: string): Promise<void> => {
    if (!shopToken) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/parts/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao deletar peça');
    }

    // Remover da lista local
    setParts(prev => prev.filter(p => p.id !== id));
  }, [shopToken]);

  // Buscar peças por O.S
  const getPartsByServiceOrder = useCallback((serviceOrderId: string): Part[] => {
    return parts.filter(p => p.service_order_id === serviceOrderId);
  }, [parts]);

  // Buscar peças por número de O.S
  const getPartsByOsNumber = useCallback((osNumber: string): Part[] => {
    return parts.filter(p => p.os_number === osNumber);
  }, [parts]);

  // Buscar peças por status
  const getPartsByStatus = useCallback((status: string): Part[] => {
    return parts.filter(p => p.status === status);
  }, [parts]);

  // Buscar peças avulsas (sem O.S)
  const getStandaloneParts = useCallback((): Part[] => {
    return parts.filter(p => !p.service_order_id);
  }, [parts]);

  // Buscar peça por ID
  const getPartById = useCallback((id: string): Part | undefined => {
    return parts.find(p => p.id === id);
  }, [parts]);

  // Carregar peças ao montar ou quando shopToken mudar
  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  return {
    parts,
    loading,
    error,
    fetchParts,
    createPart,
    updatePart,
    updatePartStatus,
    deletePart,
    getPartsByServiceOrder,
    getPartsByOsNumber,
    getPartsByStatus,
    getStandaloneParts,
    getPartById,
  };
}
