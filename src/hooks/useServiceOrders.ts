/**
 * Hook para gerenciar ordens de serviço usando Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { ServiceOrder } from '../types';

export interface ServiceOrderInput {
  client_id: string;
  client_name: string;
  client_phone: string;
  client_whatsapp?: string;
  equipment_type: string;
  equipment_brand?: string;
  equipment_model?: string;
  defect: string;
  observations?: string;
  technician_id?: string;
  technician_name?: string;
  priority?: string;
  estimated_delivery_date?: string;
}

export function useServiceOrders() {
  const { user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shopToken = user?.shopToken;

  // Função para mapear campos do banco para formato legacy
  const mapServiceOrder = (order: any): ServiceOrder => {
    return {
      ...order,
      // Mapear campos snake_case para camelCase (legacy)
      osNumber: order.os_number,
      clientId: order.client_id,
      clientName: order.client_name,
      technicianId: order.technician_id,
      technicianName: order.technician_name,
      device: order.equipment_type,
      brand: order.equipment_brand,
      model: order.equipment_model,
      entryDate: order.entry_date,
      completionDate: order.completion_date,
      deliveryDate: order.delivery_date,
      warrantyMonths: order.warranty_months,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  };

  // Buscar ordens de serviço
  const fetchServiceOrders = useCallback(async () => {
    if (!shopToken) {
      setServiceOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/service-orders?shopToken=${shopToken}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar ordens de serviço');
      }

      const data = await response.json();
      const mappedOrders = (data.serviceOrders || []).map(mapServiceOrder);
      setServiceOrders(mappedOrders);
    } catch (err) {
      console.error('Error fetching service orders:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setServiceOrders([]);
    } finally {
      setLoading(false);
    }
  }, [shopToken]);

  // Criar ordem de serviço
  const createServiceOrder = useCallback(async (orderData: ServiceOrderInput): Promise<ServiceOrder> => {
    if (!shopToken) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/service-orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          shopToken,
          ...orderData,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar ordem de serviço');
    }

    const data = await response.json();
    const mappedOrder = mapServiceOrder(data.serviceOrder);
    
    // Atualizar lista local
    setServiceOrders(prev => [mappedOrder, ...prev]);
    
    return mappedOrder;
  }, [shopToken]);

  // Atualizar ordem de serviço
  const updateServiceOrder = useCallback(async (id: string, updates: Partial<ServiceOrderInput>): Promise<ServiceOrder> => {
    if (!shopToken) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/service-orders/${id}`,
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
      throw new Error(errorData.error || 'Erro ao atualizar ordem de serviço');
    }

    const data = await response.json();
    const mappedOrder = mapServiceOrder(data.serviceOrder);
    
    // Atualizar lista local
    setServiceOrders(prev => prev.map(os => os.id === id ? mappedOrder : os));
    
    return mappedOrder;
  }, [shopToken]);

  // Atualizar status da O.S
  const updateStatus = useCallback(async (id: string, status: string): Promise<ServiceOrder> => {
    return updateServiceOrder(id, { status } as any);
  }, [updateServiceOrder]);

  // Completar O.S
  const completeServiceOrder = useCallback(async (id: string, totalValue: number): Promise<ServiceOrder> => {
    if (!shopToken) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/service-orders/${id}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ totalValue }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao completar ordem de serviço');
    }

    const data = await response.json();
    const mappedOrder = mapServiceOrder(data.serviceOrder);
    
    // Atualizar lista local
    setServiceOrders(prev => prev.map(os => os.id === id ? mappedOrder : os));
    
    return mappedOrder;
  }, [shopToken]);

  // Marcar como entregue
  const deliverServiceOrder = useCallback(async (id: string): Promise<ServiceOrder> => {
    if (!shopToken) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/service-orders/${id}/deliver`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao marcar como entregue');
    }

    const data = await response.json();
    const mappedOrder = mapServiceOrder(data.serviceOrder);
    
    // Atualizar lista local
    setServiceOrders(prev => prev.map(os => os.id === id ? mappedOrder : os));
    
    return mappedOrder;
  }, [shopToken]);

  // Deletar ordem de serviço
  const deleteServiceOrder = useCallback(async (id: string): Promise<void> => {
    if (!shopToken) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/service-orders/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao deletar ordem de serviço');
    }

    // Remover da lista local
    setServiceOrders(prev => prev.filter(os => os.id !== id));
  }, [shopToken]);

  // Buscar O.S por ID
  const getServiceOrderById = useCallback((id: string): ServiceOrder | undefined => {
    return serviceOrders.find(os => os.id === id);
  }, [serviceOrders]);

  // Buscar O.S por número
  const getServiceOrderByNumber = useCallback((osNumber: string): ServiceOrder | undefined => {
    return serviceOrders.find(os => os.os_number === osNumber);
  }, [serviceOrders]);

  // Filtrar por status
  const getServiceOrdersByStatus = useCallback((status: string): ServiceOrder[] => {
    return serviceOrders.filter(os => os.status === status);
  }, [serviceOrders]);

  // Carregar ordens ao montar ou quando shopToken mudar
  useEffect(() => {
    fetchServiceOrders();
  }, [fetchServiceOrders]);

  return {
    serviceOrders,
    setServiceOrders,
    loading,
    error,
    fetchServiceOrders,
    createServiceOrder,
    updateServiceOrder,
    updateStatus,
    completeServiceOrder,
    deliverServiceOrder,
    deleteServiceOrder,
    getServiceOrderById,
    getServiceOrderByNumber,
    getServiceOrdersByStatus,
  };
}
