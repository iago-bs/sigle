/**
 * Hook para gerenciar peças cadastradas
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { DEFAULT_SHOP_TOKEN } from '../lib/constants';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Piece } from '../types';

export function usePieces() {
  const { user } = useAuth();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shopToken = user?.shopToken ?? DEFAULT_SHOP_TOKEN;

  // Buscar peças (incluindo inativas)
  const fetchPieces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/pieces?shopToken=${shopToken}&includeInactive=true`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Pieces fetch error details:', errorData);
        throw new Error(errorData.details || errorData.error || 'Erro ao buscar peças');
      }

      const data = await response.json();
      
      console.log('[usePieces] Received data:', data);
      
      // Backend retorna array direto, não objeto com propriedade pieces
      const dataArray = Array.isArray(data) ? data : [];
      console.log('[usePieces] Number of pieces:', dataArray.length);
      
      // Mapear snake_case -> camelCase
      const mappedPieces = dataArray.map((piece: any) => ({
        id: piece.id,
        name: piece.name,
        partType: piece.part_type,
        serialNumber: piece.serial_number,
        notes: piece.notes,
        createdAt: piece.created_at,
        active: piece.active,
      } as Piece));
      
      console.log('[usePieces] Mapped pieces:', mappedPieces.length);
      setPieces(mappedPieces);
    } catch (err) {
      console.error('Error fetching pieces:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setPieces([]);
    } finally {
      setLoading(false);
    }
  }, [shopToken]);

  // Criar peça
  const createPiece = useCallback(async (pieceData: {
    name: string;
    partType: string;
    serialNumber?: string;
    notes?: string;
  }): Promise<any> => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/pieces`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          shopToken,
          ...pieceData,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar peça');
    }

    const data = await response.json();
    
    // Atualizar lista local
    await fetchPieces();
    
    return data.piece;
  }, [shopToken, fetchPieces]);

  // Atualizar peça
  const updatePiece = useCallback(async (piece: Piece): Promise<void> => {
    console.log('[updatePiece] Starting update for:', piece.id);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/pieces/${piece.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          name: piece.name,
          partType: piece.partType,
          serialNumber: piece.serialNumber,
          notes: piece.notes,
        }),
      }
    );

    console.log('[updatePiece] Response status:', response.status);
    console.log('[updatePiece] Response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Erro ao atualizar peça';
      try {
        const text = await response.text();
        console.log('[updatePiece] Error response text:', text);
        
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorMessage;
        
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      } catch (e) {
        console.error('[updatePiece] Error parsing error response:', e);
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    console.log('[updatePiece] Update successful, fetching updated list');
    // Atualizar lista local
    await fetchPieces();
  }, [shopToken, fetchPieces]);

  // Deletar peça
  const deletePiece = useCallback(async (pieceId: string): Promise<{ action: string; message: string }> => {
    console.log('[deletePiece] Starting deletion for:', pieceId);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/pieces/${pieceId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    console.log('[deletePiece] Response status:', response.status);
    console.log('[deletePiece] Response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Erro ao deletar peça';
      try {
        const text = await response.text();
        console.log('[deletePiece] Error response text:', text);
        
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorMessage;
        
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      } catch (e) {
        console.error('[deletePiece] Error parsing error response:', e);
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[deletePiece] Response data:', data);

    // Atualizar lista local
    await fetchPieces();
    
    return {
      action: data.action || 'deleted',
      message: data.message || 'Operação realizada com sucesso'
    };
  }, [shopToken, fetchPieces]);

  // Carregar peças ao montar ou quando shopToken mudar
  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  return {
    pieces,
    setPieces,
    loading,
    error,
    fetchPieces,
    createPiece,
    updatePiece,
    deletePiece,
  };
}
