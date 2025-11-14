import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SendInvoiceEmailParams {
  to: string;
  clientName: string;
  osNumber: string;
  deliveryDate?: string;
  totalValue: number;
  paymentMethod?: string;
  warrantyEndDate?: string;
  parts?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface SendBudgetEmailParams {
  to: string;
  clientName: string;
  osNumber: string;
  totalValue: number;
  parts?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  observations?: string;
}

interface SendServiceOrderCreatedEmailParams {
  to: string;
  clientName: string;
  osNumber: string;
  equipmentType: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  defect: string;
  technicianName?: string;
  estimatedDeliveryDate?: string;
}

/**
 * Envia email de nota fiscal para o cliente
 */
export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<boolean> {
  try {
    console.log('📧 Enviando email de nota fiscal...', params.to);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/send-invoice-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao enviar email');
    }

    const data = await response.json();
    console.log('✅ Email de nota fiscal enviado:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de nota fiscal:', error);
    throw error;
  }
}

/**
 * Envia email de orçamento para o cliente
 */
export async function sendBudgetEmail(params: SendBudgetEmailParams): Promise<boolean> {
  try {
    console.log('📧 Enviando email de orçamento...', params.to);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/send-budget-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao enviar email');
    }

    const data = await response.json();
    console.log('✅ Email de orçamento enviado:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de orçamento:', error);
    throw error;
  }
}

/**
 * Envia email de confirmação de criação de O.S para o cliente
 */
export async function sendServiceOrderCreatedEmail(params: SendServiceOrderCreatedEmailParams): Promise<boolean> {
  try {
    console.log('📧 Enviando email de O.S criada...', params.to);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/send-os-created-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao enviar email');
    }

    const data = await response.json();
    console.log('✅ Email de O.S criada enviado:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de O.S criada:', error);
    throw error;
  }
}
