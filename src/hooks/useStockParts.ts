/**
 * Hook para gerenciar movimentações de estoque (stock_parts)
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DEFAULT_SHOP_TOKEN } from '../lib/constants';

export interface StockPart {
  id: string;
  shop_token: string;
  piece_id?: string;
  name: string;
  description?: string;
  quantity: number;
  price?: number;
  added_at: string;
  is_adjustment?: boolean;
  adjustment_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface StockPartInput {
  pieceId?: string;
  name: string;
  description?: string;
  quantity: number;
  price?: number;
  addedAt?: string;
  isAdjustment?: boolean;
  adjustmentReason?: string;
}

export function useStockParts() {
  const { user } = useAuth();
  const [stockParts, setStockParts] = useState<StockPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shopToken = user?.shopToken ?? DEFAULT_SHOP_TOKEN;

  // Buscar movimentações de estoque
  const fetchStockParts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/stock-parts?shopToken=${shopToken}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar estoque');
      }

      const data = await response.json();
      setStockParts(data || []);
    } catch (err) {
      console.error('Error fetching stock parts:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setStockParts([]);
    } finally {
      setLoading(false);
    }
  }, [shopToken]);

  // Criar movimentação de estoque
  const createStockPart = useCallback(async (stockPartData: StockPartInput): Promise<StockPart> => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/stock-parts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          shopToken,
          ...stockPartData,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar movimentação de estoque');
    }

    const data = await response.json();
    
    // Atualizar lista local
    setStockParts(prev => [data.stockPart, ...prev]);
    
    return data.stockPart;
  }, [shopToken]);

  // Atualizar movimentação de estoque
  const updateStockPart = useCallback(async (id: string, updates: Partial<StockPartInput>): Promise<StockPart> => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/stock-parts/${id}`,
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
      throw new Error(errorData.error || 'Erro ao atualizar movimentação');
    }

    const data = await response.json();
    
    // Atualizar lista local
    setStockParts(prev => prev.map(sp => sp.id === id ? data.stockPart : sp));
    
    return data.stockPart;
  }, []);

  // Deletar movimentação de estoque
  const deleteStockPart = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/stock-parts/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao deletar movimentação');
    }

    // Remover da lista local
    setStockParts(prev => prev.filter(sp => sp.id !== id));
  }, []);

  // Buscar movimentações por piece_id
  const getStockPartsByPieceId = useCallback((pieceId: string): StockPart[] => {
    return stockParts.filter(sp => sp.piece_id === pieceId);
  }, [stockParts]);

  // Calcular total em estoque por piece_id
  const getTotalQuantityByPieceId = useCallback((pieceId: string): number => {
    return stockParts
      .filter(sp => sp.piece_id === pieceId)
      .reduce((sum, sp) => sum + sp.quantity, 0);
  }, [stockParts]);

  // Buscar movimentação por ID
  const getStockPartById = useCallback((id: string): StockPart | undefined => {
    return stockParts.find(sp => sp.id === id);
  }, [stockParts]);

  // Carregar estoque ao montar ou quando shopToken mudar
  useEffect(() => {
    fetchStockParts();
  }, [fetchStockParts]);

  return {
    stockParts,
    loading,
    error,
    fetchStockParts,
    createStockPart,
    updateStockPart,
    deleteStockPart,
    getStockPartsByPieceId,
    getTotalQuantityByPieceId,
    getStockPartById,
    setStockParts, // Expor para manipulação local
  };
}
