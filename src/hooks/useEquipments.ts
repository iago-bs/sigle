/**
 * Hook para gerenciar equipamentos usando Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { DEFAULT_SHOP_TOKEN } from '../lib/constants';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { Equipment } from '../types';
import { calculateWarrantyEndDate } from '../lib/date-utils';

export function useEquipments() {
  const { user } = useAuth();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shopToken = user?.shopToken ?? DEFAULT_SHOP_TOKEN;

  // Buscar equipamentos
  const fetchEquipments = useCallback(async () => {
    // Modo loja única: usa token padrão e segue normalmente

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/equipments?shopToken=${shopToken}&includeInactive=true`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Equipment fetch error details:', errorData);
        throw new Error(errorData.details || errorData.error || 'Erro ao buscar equipamentos');
      }

      const data = await response.json();
      
      // Log detalhado para debug
      console.log('[useEquipments] Received data:', data);
      console.log('[useEquipments] Number of equipments:', data.equipments?.length || 0);
      
      // Mapear snake_case -> camelCase (inclui campos de venda/garantia)
      const mappedEquipments = (data.equipments || []).map((eq: any) => {
        const isSold = eq?.status === 'sold' || eq?.sold === true || !!eq?.sale_date || !!eq?.sold_date;
        // Compute a fallback warranty end date if backend hasn't set it yet
        const soldAt: string | undefined = eq.sold_date || eq.sale_date || undefined;
        const fallbackWarrantyEnd = (isSold && !eq.warranty_end_date && soldAt)
          ? calculateWarrantyEndDate(soldAt, 3)
          : undefined;
        const mapped = {
        id: eq.id,
        device: eq.device,
        brand: eq.brand,
        model: eq.model,
        serialNumber: eq.serial_number,
        notes: eq.notes,
        lastServiceDate: eq.last_service_date,
        totalServices: eq.total_services || 0,
        status: isSold ? 'sold' : 'available',
        saleDate: eq.sale_date || eq.sold_date || undefined,
        soldDate: eq.sold_date || undefined,
        warrantyEndDate: eq.warranty_end_date || fallbackWarrantyEnd || undefined,
        soldTo: eq.sold_to || undefined,
        active: eq.active,
        } as Equipment;
        
        // Log para debug de equipamentos vendidos
        if (mapped.status === 'sold') {
          console.log('[useEquipments] Equipamento vendido:', {
            id: mapped.id,
            device: mapped.device,
            soldDate: mapped.soldDate,
            warrantyEndDate: mapped.warrantyEndDate,
            brand: mapped.brand,
            model: mapped.model
          });
        }
        
        return mapped;
      });
      
      console.log('[useEquipments] Mapped equipments:', mappedEquipments.length);
      console.log('[useEquipments] Vendidos:', mappedEquipments.filter((e: Equipment) => e.status === 'sold').length);
      setEquipments(mappedEquipments);
    } catch (err) {
      console.error('Error fetching equipments:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  }, [shopToken]);

  // Criar equipamento
  const createEquipment = useCallback(async (equipmentData: {
    brand: string;
    model: string;
    device: string;
    serialNumber?: string;
    notes?: string;
  }): Promise<any> => {
    // Modo loja única: token padrão já aplicado

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/equipments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          shopToken,
          ...equipmentData,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar equipamento');
    }

    const data = await response.json();
    
    // Atualizar lista local
    await fetchEquipments();
    
    return data.equipment;
  }, [shopToken, fetchEquipments]);

  // Atualizar equipamento
  const updateEquipment = useCallback(async (equipment: Equipment): Promise<void> => {
    console.log('[updateEquipment] Starting update for:', equipment.id);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/equipments/${equipment.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          brand: equipment.brand,
          model: equipment.model,
          device: equipment.device,
          serialNumber: equipment.serialNumber,
          notes: equipment.notes,
        }),
      }
    );

    console.log('[updateEquipment] Response status:', response.status);
    console.log('[updateEquipment] Response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Erro ao atualizar equipamento';
      try {
        const text = await response.text();
        console.log('[updateEquipment] Error response text:', text);
        
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorMessage;
        
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      } catch (e) {
        console.error('[updateEquipment] Error parsing error response:', e);
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    console.log('[updateEquipment] Update successful, fetching updated list');
    // Atualizar lista local
    await fetchEquipments();
  }, [shopToken, fetchEquipments]);

  // Deletar equipamento
  const deleteEquipment = useCallback(async (equipmentId: string): Promise<{ action: string; message: string }> => {
    console.log('[deleteEquipment] Starting deletion for:', equipmentId);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/equipments/${equipmentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    console.log('[deleteEquipment] Response status:', response.status);
    console.log('[deleteEquipment] Response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Erro ao deletar equipamento';
      try {
        const text = await response.text();
        console.log('[deleteEquipment] Error response text:', text);
        
        // Tentar fazer parse como JSON
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorMessage;
        
        // Se tiver detalhes, adicionar
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      } catch (e) {
        console.error('[deleteEquipment] Error parsing error response:', e);
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[deleteEquipment] Response data:', data);

    // Atualizar lista local
    await fetchEquipments();
    
    return {
      action: data.action || 'deleted',
      message: data.message || 'Operação realizada com sucesso'
    };
  }, [shopToken, fetchEquipments]);

  // Carregar equipamentos ao montar ou quando shopToken mudar
  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  return {
    equipments,
    setEquipments,
    loading,
    error,
    fetchEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment,
  };
}
