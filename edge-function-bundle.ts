// ============================================
// EDGE FUNCTION BUNDLE - make-server-9bef0ec0
// Arquivo consolidado para deploy no Supabase Dashboard
// ============================================

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

// ============================================
// DATABASE MODULE (inline)
// ============================================



// Tipos para as tabelas
interface Shop {
  id: string;
  shop_token: string;
  name: string;
  address: string;
  phone: string;
  owner_email: string;
  created_at: string;
  updated_at: string;
}

interface Client {
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

interface Equipment {
  id: string;
  shop_token: string;
  type: string;
  count: number;
  common_issues: Array<{ issue: string; count: number }>;
  created_at: string;
  updated_at: string;
}

interface ServiceOrder {
  id: string;
  shop_token: string;
  os_number: string;
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
  status: string;
  priority: string;
  entry_date: string;
  estimated_delivery_date?: string;
  completion_date?: string;
  delivery_date?: string;
  warranty_months: number;
  total_value: number;
  created_at: string;
  updated_at: string;
}

interface Part {
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

interface StockPart {
  id: string;
  shop_token: string;
  name: string;
  category?: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  supplier?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id: string;
  shop_token: string;
  title: string;
  client_name?: string;
  client_phone?: string;
  date: string;
  time: string;
  datetime: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Budget {
  id: string;
  shop_token: string;
  service_order_id: string;
  os_number: string;
  client_name: string;
  client_phone: string;
  total_value: number;
  services_value: number;
  parts_value: number;
  status: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: string;
  shop_token: string;
  service_order_id: string;
  budget_id?: string;
  os_number: string;
  invoice_number: string;
  client_name: string;
  client_phone: string;
  total_value: number;
  services_value: number;
  parts_value: number;
  warranty_months: number;
  issue_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Cria uma instÃ¢ncia do Supabase client
 */
function getSupabaseClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!url || !key) {
    console.error('[getSupabaseClient] Missing environment variables!');
    console.error('[getSupabaseClient] SUPABASE_URL:', url ? 'SET' : 'MISSING');
    console.error('[getSupabaseClient] SUPABASE_SERVICE_ROLE_KEY:', key ? 'SET' : 'MISSING');
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(url, key);
}

// ============================================
// SHOPS - FunÃ§Ãµes para gerenciar lojas
// ============================================

async function createShop(shop: Omit<Shop, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('shops')
    .insert(shop)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function getShopByToken(shopToken: string): Promise<Shop | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('shop_token', shopToken)
    .single();
  
  if (error) return null;
  return data;
}

async function getShopByName(name: string): Promise<Shop | null> {
  const supabase = getSupabaseClient();
  const normalizedName = name.trim().toLowerCase();
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .ilike('name', normalizedName)
    .single();
  
  if (error) return null;
  return data;
}

// ============================================
// CLIENTS - FunÃ§Ãµes para gerenciar clientes
// ============================================

async function insertClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  
  console.log('Attempting to insert client:', JSON.stringify(client, null, 2));
  
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();
  
  if (error) {
    console.log('Supabase insert error - Full details:');
    console.log('- Message:', error.message);
    console.log('- Details:', error.details);
    console.log('- Hint:', error.hint);
    console.log('- Code:', error.code);
    console.log('- Full error object:', JSON.stringify(error, null, 2));
    
    // Criar mensagem de erro amigÃ¡vel
    let errorMsg = error.message;
    if (error.code === '42P01') {
      errorMsg = 'Tabela "clients" nÃ£o existe no banco de dados. Execute o SQL de criaÃ§Ã£o.';
    } else if (error.code === '42703') {
      errorMsg = `Coluna inexistente: ${error.message}. Verifique a estrutura da tabela.`;
    } else if (error.message?.includes("Could not find the") && error.message?.includes("column")) {
      // Erro de schema cache - coluna nÃ£o existe
      const columnMatch = error.message.match(/'(\w+)' column/);
      const columnName = columnMatch ? columnMatch[1] : 'desconhecida';
      errorMsg = `Coluna '${columnName}' nÃ£o existe na tabela 'clients'. Execute: ALTER TABLE clients ADD COLUMN ${columnName} TEXT; e depois RECARREGUE A PÃGINA.`;
    } else if (error.hint) {
      errorMsg = `${error.message} (Dica: ${error.hint})`;
    }
    
    throw new Error(errorMsg);
  }
  
  console.log('Client inserted successfully:', data?.id);
  return data;
}

async function getClients(shopToken: string, includeInactive = false): Promise<Client[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('clients')
    .select('*')
    .eq('shop_token', shopToken);
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

async function getClientById(id: string): Promise<Client | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}

async function updateClient(id: string, updates: Partial<Client>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function deleteClient(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// EQUIPMENTS - FunÃ§Ãµes para gerenciar equipamentos
// ============================================

async function getEquipments(shopToken: string): Promise<Equipment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .eq('shop_token', shopToken)
    .order('count', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

async function getEquipmentByType(shopToken: string, type: string): Promise<Equipment | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .eq('shop_token', shopToken)
    .eq('type', type)
    .single();
  
  if (error) return null;
  return data;
}

async function upsertEquipment(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  
  // Tentar encontrar equipamento existente
  const existing = await getEquipmentByType(equipment.shop_token, equipment.type);
  
  if (existing) {
    // Atualizar existente
    const { data, error } = await supabase
      .from('equipments')
      .update({
        count: equipment.count,
        common_issues: equipment.common_issues
      })
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Criar novo
    const { data, error } = await supabase
      .from('equipments')
      .insert(equipment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// ============================================
// SERVICE ORDERS - FunÃ§Ãµes para gerenciar O.S
// ============================================

async function createServiceOrder(order: Omit<ServiceOrder, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('service_orders')
    .insert(order)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function getServiceOrders(shopToken: string): Promise<ServiceOrder[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .eq('shop_token', shopToken)
    .order('entry_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

async function getServiceOrderById(id: string): Promise<ServiceOrder | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}

async function getServiceOrderByNumber(shopToken: string, osNumber: string): Promise<ServiceOrder | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .eq('shop_token', shopToken)
    .eq('os_number', osNumber)
    .single();
  
  if (error) return null;
  return data;
}

async function updateServiceOrder(id: string, updates: Partial<ServiceOrder>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('service_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function deleteServiceOrder(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('service_orders')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// PARTS - FunÃ§Ãµes para gerenciar peÃ§as
// ============================================

async function createPart(part: Omit<Part, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('parts')
    .insert(part)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function getParts(shopToken: string): Promise<Part[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('shop_token', shopToken)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

async function getPartsByServiceOrder(serviceOrderId: string): Promise<Part[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('service_order_id', serviceOrderId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

async function updatePart(id: string, updates: Partial<Part>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('parts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function deletePart(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('parts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// STOCK PARTS - FunÃ§Ãµes para gerenciar estoque
// ============================================

async function createStockPart(part: Omit<StockPart, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('stock_parts')
    .insert(part)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function getStockParts(shopToken: string): Promise<StockPart[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('stock_parts')
    .select('*')
    .eq('shop_token', shopToken)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

async function updateStockPart(id: string, updates: Partial<StockPart>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('stock_parts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function deleteStockPart(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('stock_parts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// APPOINTMENTS - FunÃ§Ãµes para gerenciar agendamentos
// ============================================

async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function getAppointments(shopToken: string): Promise<Appointment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('shop_token', shopToken)
    .order('datetime', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

async function updateAppointment(id: string, updates: Partial<Appointment>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function deleteAppointment(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// BUDGETS - FunÃ§Ãµes para gerenciar orÃ§amentos
// ============================================

async function createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function getBudgets(shopToken: string): Promise<Budget[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('shop_token', shopToken)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

async function updateBudget(id: string, updates: Partial<Budget>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function deleteBudget(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// INVOICES - FunÃ§Ãµes para gerenciar notas fiscais
// ============================================

async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function getInvoices(shopToken: string): Promise<Invoice[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('shop_token', shopToken)
    .order('issue_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

async function getInvoiceByNumber(shopToken: string, invoiceNumber: string): Promise<Invoice | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('shop_token', shopToken)
    .eq('invoice_number', invoiceNumber)
    .single();
  
  if (error) return null;
  return data;
}

async function updateInvoice(id: string, updates: Partial<Invoice>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function deleteInvoice(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// EQUIPMENTS - FunÃ§Ãµes para gerenciar equipamentos
// ============================================

async function createManualEquipment(equipment: {
  shop_token: string;
  brand: string;
  model: string;
  device: string;
  serial_number?: string;
  notes?: string;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('equipments_manual')
    .insert({
      shop_token: equipment.shop_token,
      brand: equipment.brand,
      model: equipment.model,
      device: equipment.device,
      serial_number: equipment.serial_number,
      notes: equipment.notes,
    })
    .select()
    .single();
  
  if (error) {
    console.log(`createManualEquipment error: ${error.message}`);
    throw error;
  }
  return data;
}

async function getManualEquipments(shopToken: string) {
  try {
    console.log('[getManualEquipments] Getting Supabase client...');
    const supabase = getSupabaseClient();
    
    console.log('[getManualEquipments] Querying equipments_manual table...');
    const { data, error } = await supabase
      .from('equipments_manual')
      .select('*, sold, sold_date, warranty_end_date, invoice_id, sold_to')
      .eq('shop_token', shopToken)
      .order('created_at', { ascending: false });
    
    // Se a tabela nÃ£o existir, retornar array vazio
    if (error) {
      console.log(`[getManualEquipments] Database error:`, error);
      console.log(`[getManualEquipments] Error code: ${error.code}, message: ${error.message}`);
      
      // Se for erro de tabela nÃ£o encontrada, retornar array vazio
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
        console.warn('âš ï¸  ATENÃ‡ÃƒO: Tabela equipments_manual nÃ£o existe!');
        console.warn('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
        console.warn('Para criar a tabela, consulte o arquivo: EQUIPMENTS_TABLE_SETUP.md');
        console.warn('Ou execute este SQL no Supabase SQL Editor:');
        console.warn('');
        console.warn('CREATE TABLE IF NOT EXISTS equipments_manual (');
        console.warn('  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
        console.warn('  shop_token TEXT NOT NULL,');
        console.warn('  brand TEXT NOT NULL,');
        console.warn('  model TEXT NOT NULL,');
        console.warn('  device TEXT NOT NULL,');
        console.warn('  serial_number TEXT,');
        console.warn('  notes TEXT,');
        console.warn('  last_service_date TIMESTAMPTZ DEFAULT NOW(),');
        console.warn('  created_at TIMESTAMPTZ DEFAULT NOW(),');
        console.warn('  updated_at TIMESTAMPTZ DEFAULT NOW()');
        console.warn(');');
        console.warn('');
        console.warn('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
        return [];
      }
      
      throw error;
    }
    
    console.log(`[getManualEquipments] Success! Found ${data?.length || 0} equipments`);
    return data || [];
  } catch (err) {
    console.log('[getManualEquipments] Caught exception:', err);
    throw err;
  }
}

// Atualiza um equipamento manual por ID com campos fornecidos
async function updateManualEquipment(id: string, fields: Record<string, any>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('equipments_manual')
    .update(fields)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }
  return data;
}




// ============================================
// EMAIL MODULE (inline)
// ============================================

// Email service module using Resend
// Handles all email sending functionality

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

async function sendInvoiceEmail(resendApiKey: string, params: SendInvoiceEmailParams) {
  const {
    to,
    clientName,
    osNumber,
    deliveryDate,
    totalValue,
    paymentMethod,
    warrantyEndDate,
    parts,
  } = params;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nota Fiscal - Eletrodel Eletronica</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #8b7355 0%, #6b5745 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .info-section {
      background: #f9f9f9;
      border-left: 4px solid #8b7355;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .parts-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .parts-table th {
      background: #8b7355;
      color: white;
      padding: 10px;
      text-align: left;
    }
    .parts-table td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    .total-section {
      background: #e8f5e9;
      border: 2px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      text-align: center;
    }
    .total-label {
      font-size: 14px;
      color: #555;
      margin-bottom: 5px;
    }
    .total-value {
      font-size: 28px;
      font-weight: bold;
      color: #2e7d32;
    }
    .warranty-section {
      background: #fff3e0;
      border: 2px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warranty-section h3 {
      color: #e65100;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Eletrodel Eletronica</h1>
      <p>SIGLE Systems - VitÃ³ria da Conquista, BA</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Prezado(a) <strong>${clientName}</strong>,</p>
      <p>Segue a nota fiscal referente ao serviÃ§o realizado em seu equipamento.</p>

      <!-- InformaÃ§Ãµes da O.S -->
      <div class="info-section">
        <h3 style="margin-bottom: 10px; color: #8b7355;">ðŸ“‹ Dados da Ordem de ServiÃ§o</h3>
        <div class="info-row">
          <span class="info-label">NÃºmero da O.S:</span>
          <span class="info-value">#${osNumber}</span>
        </div>
        ${deliveryDate ? `
        <div class="info-row">
          <span class="info-label">Data de Entrega:</span>
          <span class="info-value">${deliveryDate}</span>
        </div>
        ` : ''}
        ${paymentMethod ? `
        <div class="info-row">
          <span class="info-label">Forma de Pagamento:</span>
          <span class="info-value">${paymentMethod.toUpperCase()}</span>
        </div>
        ` : ''}
      </div>

      ${parts && parts.length > 0 ? `
      <!-- PeÃ§as Utilizadas -->
      <h3 style="margin: 20px 0 10px; color: #8b7355;">ðŸ”§ PeÃ§as e ServiÃ§os</h3>
      <table class="parts-table">
        <thead>
          <tr>
            <th>DescriÃ§Ã£o</th>
            <th>Qtd</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          ${parts.map((part) => `
            <tr>
              <td>${part.name}</td>
              <td>${part.quantity}</td>
              <td>R$ ${part.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <!-- Valor Total -->
      <div class="total-section">
        <p class="total-label">Valor Total do ServiÃ§o</p>
        <p class="total-value">R$ ${totalValue.toFixed(2)}</p>
      </div>

      <!-- Garantia -->
      <div class="warranty-section">
        <h3>ðŸ›¡ï¸ Garantia de 3 Meses</h3>
        <p>Este serviÃ§o possui <strong>garantia de 3 meses</strong> a partir da data de entrega.</p>
        ${warrantyEndDate ? `<p>VÃ¡lida atÃ©: <strong>${warrantyEndDate}</strong></p>` : ''}
        <p style="margin-top: 10px; font-size: 11px; color: #666;">
          A garantia cobre defeitos relacionados ao serviÃ§o realizado. 
          NÃ£o cobre danos causados por mau uso, quedas ou oxidaÃ§Ã£o.
        </p>
      </div>

      <p style="margin-top: 20px; text-align: center;">
        Obrigado pela confianÃ§a em nossos serviÃ§os!
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Eletrodel Eletronica</strong></p>
      <p>VitÃ³ria da Conquista, BA</p>
      <p>Sistema SIGLE</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Este Ã© um email automÃ¡tico. Por favor, nÃ£o responda.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Eletrodel Eletronica <onboarding@resend.dev>',
      to: [to],
      subject: `Nota Fiscal - O.S #${osNumber} - Eletrodel Eletronica`,
      html: htmlContent,
    }),
  });

  return await response.json();
}

async function sendBudgetEmail(resendApiKey: string, params: SendBudgetEmailParams) {
  const {
    to,
    clientName,
    osNumber,
    totalValue,
    parts,
    observations,
  } = params;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OrÃ§amento - Eletrodel Eletronica</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .parts-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .parts-table th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
    }
    .parts-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    .parts-table tr:hover {
      background: #f9f9f9;
    }
    .total-section {
      background: #e3f2fd;
      border: 2px solid #2196f3;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
      text-align: center;
    }
    .total-label {
      font-size: 16px;
      color: #555;
      margin-bottom: 8px;
    }
    .total-value {
      font-size: 32px;
      font-weight: bold;
      color: #1976d2;
    }
    .info-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Eletrodel Eletronica</h1>
      <p>SIGLE Systems - VitÃ³ria da Conquista, BA</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">OlÃ¡ <strong>${clientName}</strong>,</p>
      <p>Segue o orÃ§amento para o conserto do seu equipamento referente Ã  O.S <strong>#${osNumber}</strong>.</p>

      ${parts && parts.length > 0 ? `
      <!-- PeÃ§as e ServiÃ§os -->
      <h3 style="margin: 25px 0 15px; color: #667eea;">ðŸ’° Detalhamento do OrÃ§amento</h3>
      <table class="parts-table">
        <thead>
          <tr>
            <th>PeÃ§a/ServiÃ§o</th>
            <th style="text-align: center;">Qtd</th>
            <th style="text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${parts.map((part) => `
            <tr>
              <td>${part.name}</td>
              <td style="text-align: center;">${part.quantity}</td>
              <td style="text-align: right;">R$ ${part.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <!-- Valor Total -->
      <div class="total-section">
        <p class="total-label">Valor Total do OrÃ§amento</p>
        <p class="total-value">R$ ${totalValue.toFixed(2)}</p>
      </div>

      ${observations ? `
      <!-- ObservaÃ§Ãµes -->
      <div class="info-box">
        <h4 style="color: #856404; margin-bottom: 10px;">ðŸ“ ObservaÃ§Ãµes</h4>
        <p style="color: #856404; margin: 0;">${observations}</p>
      </div>
      ` : ''}

      <div class="info-box">
        <h4 style="color: #856404; margin-bottom: 10px;">âš ï¸ Importante</h4>
        <ul style="margin: 0; padding-left: 20px; color: #856404;">
          <li>Este orÃ§amento tem validade de 7 dias</li>
          <li>Entre em contato para aprovar o orÃ§amento</li>
          <li>O serviÃ§o inclui garantia de 3 meses</li>
        </ul>
      </div>

      <p style="margin-top: 25px; text-align: center;">
        Para aprovaÃ§Ã£o ou dÃºvidas, entre em contato conosco.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Eletrodel Eletronica</strong></p>
      <p>VitÃ³ria da Conquista, BA</p>
      <p>Sistema SIGLE</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Este Ã© um email automÃ¡tico. Por favor, nÃ£o responda.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Eletrodel Eletronica <onboarding@resend.dev>',
      to: [to],
      subject: `OrÃ§amento #${osNumber} - Eletrodel Eletronica`,
      html: htmlContent,
    }),
  });

  return await response.json();
}

async function sendServiceOrderCreatedEmail(
  resendApiKey: string,
  params: SendServiceOrderCreatedEmailParams
) {
  const {
    to,
    clientName,
    osNumber,
    equipmentType,
    equipmentBrand,
    equipmentModel,
    defect,
    technicianName,
    estimatedDeliveryDate,
  } = params;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ordem de ServiÃ§o Criada - Eletrodel Eletronica</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .info-section {
      background: #f9f9f9;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .success-badge {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 10px 20px;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>âœ… Ordem de ServiÃ§o Criada</h1>
      <p>Eletrodel Eletronica - SIGLE Systems</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">OlÃ¡ <strong>${clientName}</strong>,</p>
      <p>Seu equipamento foi recebido e uma ordem de serviÃ§o foi criada com sucesso!</p>

      <div style="text-align: center;">
        <span class="success-badge">O.S #${osNumber}</span>
      </div>

      <!-- InformaÃ§Ãµes do Equipamento -->
      <div class="info-section">
        <h3 style="margin-bottom: 10px; color: #4caf50;">ðŸ“± Dados do Equipamento</h3>
        <div class="info-row">
          <span class="info-label">Tipo:</span>
          <span class="info-value">${equipmentType}</span>
        </div>
        ${equipmentBrand ? `
        <div class="info-row">
          <span class="info-label">Marca:</span>
          <span class="info-value">${equipmentBrand}</span>
        </div>
        ` : ''}
        ${equipmentModel ? `
        <div class="info-row">
          <span class="info-label">Modelo:</span>
          <span class="info-value">${equipmentModel}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Defeito Relatado:</span>
          <span class="info-value">${defect}</span>
        </div>
        ${technicianName ? `
        <div class="info-row">
          <span class="info-label">TÃ©cnico ResponsÃ¡vel:</span>
          <span class="info-value">${technicianName}</span>
        </div>
        ` : ''}
        ${estimatedDeliveryDate ? `
        <div class="info-row">
          <span class="info-label">PrevisÃ£o de Entrega:</span>
          <span class="info-value">${estimatedDeliveryDate}</span>
        </div>
        ` : ''}
      </div>

      <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h4 style="color: #1565c0; margin-bottom: 10px;">ðŸ“‹ PrÃ³ximos Passos</h4>
        <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
          <li>Nossos tÃ©cnicos irÃ£o avaliar seu equipamento</li>
          <li>Em breve entraremos em contato com o orÃ§amento</li>
          <li>Mantenha este nÃºmero de O.S para consultas</li>
        </ul>
      </div>

      <p style="margin-top: 25px; text-align: center;">
        Qualquer dÃºvida, entre em contato conosco!
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Eletrodel Eletronica</strong></p>
      <p>VitÃ³ria da Conquista, BA</p>
      <p>Sistema SIGLE</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Este Ã© um email automÃ¡tico. Por favor, nÃ£o responda.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Eletrodel Eletronica <onboarding@resend.dev>',
      to: [to],
      subject: `O.S #${osNumber} criada - Eletrodel Eletronica`,
      html: htmlContent,
    }),
  });

  return await response.json();
}


// ============================================
// MAIN APPLICATION
// ============================================

// Expose inlined modules under expected names
const db = {
	getSupabaseClient,
	createShop,
	getShopByToken,
	getShopByName,
	insertClient,
	getClients,
	getClientById,
	updateClient,
	deleteClient,
	getEquipments,
	getEquipmentByType,
	upsertEquipment,
	createServiceOrder,
	getServiceOrders,
	getServiceOrderById,
	getServiceOrderByNumber,
	updateServiceOrder,
	deleteServiceOrder,
	createPart,
	getParts,
	getPartsByServiceOrder,
	updatePart,
	deletePart,
	createStockPart,
	getStockParts,
	updateStockPart,
	deleteStockPart,
	createAppointment,
	getAppointments,
	updateAppointment,
	deleteAppointment,
	createBudget,
	getBudgets,
	updateBudget,
	deleteBudget,
	createInvoice,
	getInvoices,
	getInvoiceByNumber,
	updateInvoice,
	deleteInvoice,
	createManualEquipment,
	getManualEquipments,
	updateManualEquipment,
};

const emailService = {
	sendInvoiceEmail,
	sendBudgetEmail,
	sendServiceOrderCreatedEmail,
};





// Database functions inlined below
// Email functions inlined below

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9bef0ec0/health", (c) => {
  return c.json({ status: "ok" });
});

// Diagnostic endpoint for Supabase connection
app.get("/make-server-9bef0ec0/diagnostic", async (c) => {
  try {
    console.log('[DIAGNOSTIC] Starting diagnostic...');
    
    // Check environment variables
    const hasUrl = !!Deno.env.get('SUPABASE_URL');
    const hasKey = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('[DIAGNOSTIC] Env vars - URL:', hasUrl, 'KEY:', hasKey);
    
    if (!hasUrl || !hasKey) {
      return c.json({
        error: 'Missing environment variables',
        has_url: hasUrl,
        has_key: hasKey
      }, 500);
    }
    
    // Try to get Supabase client
    console.log('[DIAGNOSTIC] Getting Supabase client...');
    const supabase = db.getSupabaseClient();
    
    // Try a simple query
    console.log('[DIAGNOSTIC] Testing query on equipments_manual...');
    const { data, error } = await supabase
      .from('equipments_manual')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('[DIAGNOSTIC] Query error:', error);
      return c.json({
        status: 'error',
        error_code: error.code,
        error_message: error.message,
        table_exists: false
      });
    }
    
    console.log('[DIAGNOSTIC] Success!');
    return c.json({
      status: 'ok',
      table_exists: true,
      has_data: data && data.length > 0
    });
    
  } catch (err) {
    console.log('[DIAGNOSTIC] Exception:', err);
    return c.json({
      status: 'error',
      exception: String(err),
      stack: err instanceof Error ? err.stack : undefined
    }, 500);
  }
});

// Check columns in clients table
app.get("/make-server-9bef0ec0/check-columns", async (c) => {
  try {
    const supabase = db.getSupabaseClient();
    
    // Query information_schema to get actual columns
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: 'clients'
    });
    
    // If RPC doesn't exist, try a simpler approach
    if (error) {
      // Try to select with all expected columns
      const testQuery = await supabase
        .from('clients')
        .select('id, shop_token, name, phone, whatsapp, email, cpf, address, city, state, is_active, created_at, updated_at')
        .limit(1);
      
      if (testQuery.error) {
        return c.json({
          error: 'Column check failed',
          message: testQuery.error.message,
          missingColumns: testQuery.error.message.includes('city') ? ['city', 'state'] : [],
          instructions: 'Execute: ALTER TABLE clients ADD COLUMN city TEXT, ADD COLUMN state TEXT;'
        });
      }
      
      return c.json({
        success: true,
        message: 'All required columns exist',
        columns: ['id', 'shop_token', 'name', 'phone', 'whatsapp', 'email', 'cpf', 'address', 'city', 'state', 'is_active', 'created_at', 'updated_at']
      });
    }
    
    return c.json({ success: true, columns: data });
    
  } catch (error) {
    return c.json({ 
      error: 'Exception during column check',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Test database connection and table structure
app.get("/make-server-9bef0ec0/test-db", async (c) => {
  try {
    const supabase = db.getSupabaseClient();
    
    // Test 1: Check if clients table exists
    const { data: tables, error: tablesError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      return c.json({ 
        error: 'Clients table error',
        details: tablesError,
        message: tablesError.message
      });
    }
    
    // Test 2: Try to insert a test client
    const testClient = {
      shop_token: 'test-token-' + Date.now(),
      name: 'Test Client',
      phone: '77999999999',
      city: 'VitÃ³ria da Conquista',
      state: 'BA',
      is_active: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('clients')
      .insert(testClient)
      .select()
      .single();
    
    if (insertError) {
      return c.json({ 
        error: 'Insert test failed',
        details: insertError,
        message: insertError.message,
        hint: insertError.hint,
        code: insertError.code,
        solution: insertError.message?.includes('city') 
          ? 'Execute: ALTER TABLE clients ADD COLUMN city TEXT, ADD COLUMN state TEXT; e depois RECARREGUE A PÃGINA'
          : 'Verifique os logs do servidor'
      });
    }
    
    // Clean up test data
    if (insertData?.id) {
      await supabase.from('clients').delete().eq('id', insertData.id);
    }
    
    return c.json({ 
      success: true,
      message: 'Database test passed - All columns exist and working!',
      testData: insertData
    });
    
  } catch (error) {
    return c.json({ 
      error: 'Exception during test',
      details: error,
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Check if store name is available
app.post("/make-server-9bef0ec0/check-store-name", async (c) => {
  try {
    const { storeName } = await c.req.json();

    if (!storeName) {
      return c.json({ 
        error: "Nome da loja Ã© obrigatÃ³rio" 
      }, 400);
    }

    // Check if store name already exists
    const existingStore = await db.getShopByName(storeName);

    if (existingStore) {
      return c.json({ 
        available: false,
        message: "Este nome de loja jÃ¡ estÃ¡ sendo usado por outra empresa" 
      });
    }

    return c.json({ 
      available: true,
      message: "Nome de loja disponÃ­vel" 
    });

  } catch (error) {
    console.log(`Check store name endpoint error: ${error}`);
    return c.json({ 
      error: "Erro ao verificar nome da loja" 
    }, 500);
  }
});

// Validate shop token (for joining existing store)
app.post("/make-server-9bef0ec0/validate-shop-token", async (c) => {
  try {
    const { shopToken } = await c.req.json();

    if (!shopToken) {
      return c.json({ 
        error: "Token da loja Ã© obrigatÃ³rio" 
      }, 400);
    }

    // Check if shop exists
    const shopInfo = await db.getShopByToken(shopToken);

    if (!shopInfo) {
      return c.json({ 
        valid: false,
        error: "Token invÃ¡lido ou loja nÃ£o encontrada" 
      }, 404);
    }

    return c.json({ 
      valid: true,
      shop: shopInfo
    });

  } catch (error) {
    console.log(`Validate shop token endpoint error: ${error}`);
    return c.json({ 
      error: "Erro ao validar token da loja" 
    }, 500);
  }
});

// Sign up endpoint - creates user with auto-confirmed email and generates/uses shop token
app.post("/make-server-9bef0ec0/signup", async (c) => {
  try {
    const { 
      email, 
      password, 
      name, 
      storeName, 
      storeAddress, 
      storePhone,
      mode,           // "create" or "join"
      existingToken   // Only required if mode is "join"
    } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ 
        error: "Email, senha e nome sÃ£o obrigatÃ³rios" 
      }, 400);
    }

    if (!mode || (mode !== "create" && mode !== "join")) {
      return c.json({ 
        error: "Modo invÃ¡lido. Use 'create' ou 'join'" 
      }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    let shopToken: string;
    let shopInfo: any;

    if (mode === "create") {
      // Creating a new store
      if (!storeName || !storeAddress || !storePhone) {
        return c.json({ 
          error: "Dados do estabelecimento sÃ£o obrigatÃ³rios para criar nova loja" 
        }, 400);
      }

      // Check if store name already exists
      const existingStore = await db.getShopByName(storeName);
      if (existingStore) {
        return c.json({ 
          error: "Este nome de loja jÃ¡ estÃ¡ sendo usado por outra empresa" 
        }, 400);
      }

      // Generate unique shop token (UUID)
      shopToken = crypto.randomUUID();

      // Create shop in database
      shopInfo = await db.createShop({
        shop_token: shopToken,
        name: storeName,
        address: storeAddress,
        phone: storePhone,
        owner_email: email,
      });

      console.log(`Created new store: ${storeName} with token: ${shopToken}`);

    } else {
      // Joining an existing store
      if (!existingToken) {
        return c.json({ 
          error: "Token da loja Ã© obrigatÃ³rio para se juntar a uma loja existente" 
        }, 400);
      }

      shopToken = existingToken;

      // Verify that shop exists
      shopInfo = await db.getShopByToken(shopToken);
      if (!shopInfo) {
        return c.json({ 
          error: "Token invÃ¡lido ou loja nÃ£o encontrada" 
        }, 404);
      }

      console.log(`User ${email} joining existing store: ${shopInfo.name}`);
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userData;

    if (existingUser) {
      // User already exists - update their metadata
      console.log(`User ${email} already exists, updating metadata for store: ${shopInfo.name}`);
      
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: { 
            name,
            storeName: shopInfo.name,
            storeAddress: shopInfo.address,
            storePhone: shopInfo.phone,
            shopToken,
            role: mode === "create" ? 'owner' : 'technician'
          }
        }
      );

      if (updateError) {
        console.log(`Error updating user ${email}: ${updateError.message}`);
        return c.json({ 
          error: "Erro ao atualizar usuÃ¡rio existente" 
        }, 400);
      }

      userData = updateData.user;
      console.log(`Successfully updated user: ${email} for store: ${shopInfo.name}`);
    } else {
      // Create new user with auto-confirmed email since email server hasn't been configured
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { 
          name,
          storeName: shopInfo.name,
          storeAddress: shopInfo.address,
          storePhone: shopInfo.phone,
          shopToken,
          role: mode === "create" ? 'owner' : 'technician'
        },
        email_confirm: true
      });

      if (error) {
        console.log(`Signup error for email ${email}: ${error.message}`);
        return c.json({ 
          error: error.message 
        }, 400);
      }

      userData = data.user;
      console.log(`Successfully created user: ${email} for store: ${shopInfo.name} with token: ${shopToken}`);
    }
    
    return c.json({ 
      success: true,
      user: userData,
      shopToken: shopToken,
      mode: mode
    });

  } catch (error) {
    console.log(`Signup endpoint error: ${error}`);
    return c.json({ 
      error: "Erro ao criar usuÃ¡rio" 
    }, 500);
  }
});

// Verify shop token endpoint
app.post("/make-server-9bef0ec0/verify-shop-token", async (c) => {
  try {
    const { email, shopToken } = await c.req.json();

    if (!email || !shopToken) {
      return c.json({ 
        error: "Email e token da loja sÃ£o obrigatÃ³rios" 
      }, 400);
    }

    // Get shop information
    const shopInfo = await db.getShopByToken(shopToken);

    if (!shopInfo) {
      return c.json({ 
        error: "Token da loja invÃ¡lido" 
      }, 404);
    }

    return c.json({ 
      success: true,
      shop: shopInfo
    });

  } catch (error) {
    console.log(`Verify shop token endpoint error: ${error}`);
    return c.json({ 
      error: "Erro ao verificar token da loja" 
    }, 500);
  }
});

// Send shop token via email using Resend
app.post("/make-server-9bef0ec0/send-token-email", async (c) => {
  try {
    // Parse request body with error handling
    let email, shopToken, shopName;
    try {
      const body = await c.req.json();
      email = body.email;
      shopToken = body.shopToken;
      shopName = body.shopName;
    } catch (parseError) {
      console.log('Error parsing request body:', parseError);
      return c.json({ 
        success: false,
        message: "Erro ao processar requisiÃ§Ã£o. Por favor, copie o token manualmente.",
        showCopyOption: true
      }, 200);
    }

    if (!email || !shopToken) {
      return c.json({ 
        success: false,
        error: "Email e token sÃ£o obrigatÃ³rios" 
      }, 400);
    }

    // Get Resend API Key from environment with error handling
    let resendApiKey;
    try {
      resendApiKey = Deno.env.get('RESEND_API_KEY');
    } catch (envError) {
      console.log('Error accessing environment variables:', envError);
      return c.json({ 
        success: false,
        message: "ServiÃ§o de email nÃ£o configurado. Por favor, copie o token manualmente.",
        showCopyOption: true
      }, 200);
    }
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured - returning graceful error');
      return c.json({ 
        success: false,
        message: "ServiÃ§o de email nÃ£o configurado. Por favor, copie o token manualmente.",
        showCopyOption: true
      }, 200); // Return 200 instead of 500 for graceful degradation
    }

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'SIGLE Systems <onboarding@resend.dev>',
        to: [email],
        subject: `Token de Acesso - ${shopName || 'SIGLE Systems'}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SIGLE Systems</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Sistema de Gerenciamento de Lojas de EletrÃ´nicos</p>
              </div>
              
              <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">Token de Acesso da Sua Loja</h2>
                
                <p>OlÃ¡!</p>
                
                <p>Aqui estÃ¡ o token Ãºnico da sua loja no SIGLE Systems:</p>
                
                <div style="background: #f5f5f5; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px;">
                  <p style="margin: 0 0 10px 0;"><strong>Loja:</strong> ${shopName || 'NÃ£o informado'}</p>
                  <p style="margin: 0;"><strong>Token:</strong></p>
                  <div style="background: white; padding: 15px; margin-top: 10px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all; border: 1px dashed #667eea;">
                    ${shopToken}
                  </div>
                </div>
                
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #856404;"><strong>âš ï¸ Importante:</strong></p>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #856404;">
                    <li>Guarde este token com seguranÃ§a</li>
                    <li>VocÃª precisarÃ¡ dele para acessar o sistema</li>
                    <li>Este token Ã© Ãºnico e imutÃ¡vel</li>
                    <li>Compartilhe apenas com membros autorizados da sua equipe</li>
                  </ul>
                </div>
                
                <p style="margin-top: 30px;">Se vocÃª tiver alguma dÃºvida ou precisar de ajuda, entre em contato conosco.</p>
                
                <p style="margin-bottom: 0;">Atenciosamente,<br><strong>Equipe SIGLE Systems</strong></p>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p style="margin: 0;">Â© ${new Date().getFullYear()} SIGLE Systems. Todos os direitos reservados.</p>
                <p style="margin: 10px 0 0 0;">Este Ã© um email automÃ¡tico, por favor nÃ£o responda.</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.log(`Resend API error: ${JSON.stringify(result)}`);
      return c.json({ 
        success: false,
        error: "Erro ao enviar email. Tente novamente mais tarde.",
      }, 500);
    }

    console.log(`Email sent successfully to ${email}. Resend ID: ${result.id}`);
    
    return c.json({ 
      success: true,
      message: "Token enviado com sucesso para o email cadastrado!",
      emailId: result.id
    });

  } catch (error) {
    console.log(`Send token email endpoint error: ${error}`);
    // Return graceful error instead of 500
    return c.json({ 
      success: false,
      message: "O serviÃ§o de email estÃ¡ sendo configurado. Por favor, copie o token manualmente.",
      showCopyOption: true,
      error: String(error)
    }, 200); // Changed to 200 for graceful degradation
  }
});

// List technicians endpoint
app.get("/make-server-9bef0ec0/technicians", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get all users using admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log(`List technicians error: ${error.message}`);
      return c.json({ 
        error: error.message 
      }, 400);
    }

    const technicians = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Sem nome',
      created_at: user.created_at,
    }));

    return c.json({ 
      success: true,
      technicians 
    });

  } catch (error) {
    console.log(`List technicians endpoint error: ${error}`);
    return c.json({ 
      error: "Erro ao listar tÃ©cnicos" 
    }, 500);
  }
});

// ============================================
// CLIENTS ENDPOINTS
// ============================================

// Get all clients
app.get("/make-server-9bef0ec0/clients", async (c) => {
  try {
    const shopToken = c.req.query('shopToken');
    const includeInactive = c.req.query('includeInactive') === 'true';

    if (!shopToken) {
      return c.json({ error: "Token da loja Ã© obrigatÃ³rio" }, 400);
    }

    const clients = await db.getClients(shopToken, includeInactive);

    return c.json({ success: true, clients });

  } catch (error) {
    console.log(`Get clients error: ${error}`);
    return c.json({ error: "Erro ao buscar clientes" }, 500);
  }
});

// Create client
app.post("/make-server-9bef0ec0/clients", async (c) => {
  try {
    const { shopToken, name, phone, whatsapp, email, cpf, address, city, state } = await c.req.json();

    console.log('Create client request:', { shopToken, name, phone, whatsapp, email, cpf, address, city, state });

    if (!shopToken || !name || !phone) {
      console.log('Missing required fields:', { shopToken, name, phone });
      return c.json({ error: "Campos obrigatÃ³rios faltando" }, 400);
    }

    const client = await db.insertClient({
      shop_token: shopToken,
      name,
      phone,
      whatsapp,
      email,
      cpf,
      address,
      city,
      state,
      is_active: true,
    });

    console.log('Client created successfully:', client.id);
    return c.json({ success: true, client });

  } catch (error) {
    console.log('Create client error details:', error);
    console.log('Error type:', typeof error);
    console.log('Error keys:', error ? Object.keys(error) : 'null');
    
    let errorMessage = 'Erro desconhecido';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
      console.log('Error object:', JSON.stringify(error, null, 2));
    }
    
    return c.json({ error: `Erro ao criar cliente: ${errorMessage}` }, 500);
  }
});

// Update client
app.put("/make-server-9bef0ec0/clients/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    const client = await db.updateClient(id, updates);

    return c.json({ success: true, client });

  } catch (error) {
    console.log(`Update client error: ${error}`);
    return c.json({ error: "Erro ao atualizar cliente" }, 500);
  }
});

// Inactivate client (soft delete)
app.post("/make-server-9bef0ec0/clients/:id/inactivate", async (c) => {
  try {
    const id = c.req.param('id');

    const client = await db.updateClient(id, { is_active: false });

    return c.json({ success: true, client });

  } catch (error) {
    console.log(`Inactivate client error: ${error}`);
    return c.json({ error: "Erro ao inativar cliente" }, 500);
  }
});

// Reactivate client
app.post("/make-server-9bef0ec0/clients/:id/reactivate", async (c) => {
  try {
    const id = c.req.param('id');

    const client = await db.updateClient(id, { is_active: true });

    return c.json({ success: true, client });

  } catch (error) {
    console.log(`Reactivate client error: ${error}`);
    return c.json({ error: "Erro ao reativar cliente" }, 500);
  }
});

// Delete client permanently
app.delete("/make-server-9bef0ec0/clients/:id", async (c) => {
  try {
    const id = c.req.param('id');

    await db.deleteClient(id);

    return c.json({ success: true });

  } catch (error) {
    console.log(`Delete client error: ${error}`);
    return c.json({ error: "Erro ao deletar cliente" }, 500);
  }
});

// ============================================
// SERVICE ORDERS ENDPOINTS
// ============================================

// Get all service orders
app.get("/make-server-9bef0ec0/service-orders", async (c) => {
  try {
    const shopToken = c.req.query('shopToken');

    if (!shopToken) {
      return c.json({ error: "Token da loja Ã© obrigatÃ³rio" }, 400);
    }

    const serviceOrders = await db.getServiceOrders(shopToken);

    return c.json({ success: true, serviceOrders });

  } catch (error) {
    console.log(`Get service orders error: ${error}`);
    return c.json({ error: "Erro ao buscar ordens de serviÃ§o" }, 500);
  }
});

// Create service order
app.post("/make-server-9bef0ec0/service-orders", async (c) => {
  try {
    const data = await c.req.json();
    const { shopToken } = data;

    if (!shopToken) {
      return c.json({ error: "Token da loja Ã© obrigatÃ³rio" }, 400);
    }

    // Get all service orders to generate OS number
    const existingOrders = await db.getServiceOrders(shopToken);
    const osNumber = `OS-${String(existingOrders.length + 1).padStart(6, '0')}`;

    const serviceOrder = await db.createServiceOrder({
      shop_token: shopToken,
      os_number: osNumber,
      client_id: data.client_id,
      client_name: data.client_name,
      client_phone: data.client_phone,
      client_whatsapp: data.client_whatsapp,
      equipment_type: data.equipment_type,
      equipment_brand: data.equipment_brand,
      equipment_model: data.equipment_model,
      defect: data.defect,
      observations: data.observations,
      technician_id: data.technician_id,
      technician_name: data.technician_name,
      status: data.status || 'pending',
      priority: data.priority || 'normal',
      entry_date: new Date().toISOString(),
      estimated_delivery_date: data.estimated_delivery_date,
      warranty_months: 3,
      total_value: 0,
    });

    // Atualizar tabela de equipamentos com estatÃ­sticas
    if (data.equipment_type) {
      try {
        console.log(`ðŸ“Š Atualizando estatÃ­sticas de equipamento: ${data.equipment_type}`);
        
        // Buscar equipamento existente
        const existingEquipment = await db.getEquipmentByType(shopToken, data.equipment_type);
        
        if (existingEquipment) {
          // Equipamento jÃ¡ existe - atualizar contador e issues
          const updatedCount = existingEquipment.count + 1;
          const updatedIssues = [...(existingEquipment.common_issues || [])];
          
          // Adicionar ou incrementar o defeito
          if (data.defect) {
            const existingIssueIndex = updatedIssues.findIndex(
              issue => issue.issue.toLowerCase() === data.defect.toLowerCase()
            );
            
            if (existingIssueIndex >= 0) {
              updatedIssues[existingIssueIndex].count += 1;
            } else {
              updatedIssues.push({ issue: data.defect, count: 1 });
            }
          }
          
          // Ordenar issues por count (mais comum primeiro)
          updatedIssues.sort((a, b) => b.count - a.count);
          
          await db.upsertEquipment({
            shop_token: shopToken,
            type: data.equipment_type,
            count: updatedCount,
            common_issues: updatedIssues,
          });
          
          console.log(`âœ… Equipamento atualizado: ${data.equipment_type} (${updatedCount} total)`);
        } else {
          // Equipamento novo - criar registro
          await db.upsertEquipment({
            shop_token: shopToken,
            type: data.equipment_type,
            count: 1,
            common_issues: data.defect ? [{ issue: data.defect, count: 1 }] : [],
          });
          
          console.log(`âœ… Novo equipamento criado: ${data.equipment_type}`);
        }
      } catch (equipmentError) {
        // NÃ£o falhar a criaÃ§Ã£o da O.S se houver erro ao atualizar equipamentos
        console.error(`âš ï¸ Erro ao atualizar equipamentos (nÃ£o crÃ­tico): ${equipmentError}`);
      }
    }

    return c.json({ success: true, serviceOrder });

  } catch (error) {
    console.log(`Create service order error: ${error}`);
    return c.json({ error: "Erro ao criar ordem de serviÃ§o" }, 500);
  }
});

// Update service order
app.put("/make-server-9bef0ec0/service-orders/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    const serviceOrder = await db.updateServiceOrder(id, updates);

    return c.json({ success: true, serviceOrder });

  } catch (error) {
    console.log(`Update service order error: ${error}`);
    return c.json({ error: "Erro ao atualizar ordem de serviÃ§o" }, 500);
  }
});

// Complete service order
app.post("/make-server-9bef0ec0/service-orders/:id/complete", async (c) => {
  try {
    const id = c.req.param('id');
    const { totalValue } = await c.req.json();

    const serviceOrder = await db.updateServiceOrder(id, {
      status: 'completed',
      completion_date: new Date().toISOString(),
      total_value: totalValue,
    });

    return c.json({ success: true, serviceOrder });

  } catch (error) {
    console.log(`Complete service order error: ${error}`);
    return c.json({ error: "Erro ao completar ordem de serviÃ§o" }, 500);
  }
});

// Deliver service order
app.post("/make-server-9bef0ec0/service-orders/:id/deliver", async (c) => {
  try {
    const id = c.req.param('id');

    const serviceOrder = await db.updateServiceOrder(id, {
      delivery_date: new Date().toISOString(),
    });

    return c.json({ success: true, serviceOrder });

  } catch (error) {
    console.log(`Deliver service order error: ${error}`);
    return c.json({ error: "Erro ao marcar como entregue" }, 500);
  }
});

// Delete service order
app.delete("/make-server-9bef0ec0/service-orders/:id", async (c) => {
  try {
    const id = c.req.param('id');

    await db.deleteServiceOrder(id);

    return c.json({ success: true });

  } catch (error) {
    console.log(`Delete service order error: ${error}`);
    return c.json({ error: "Erro ao deletar ordem de serviÃ§o" }, 500);
  }
});

// ============================================
// PARTS ENDPOINTS
// ============================================

// Get all parts
app.get("/make-server-9bef0ec0/parts", async (c) => {
  try {
    const shopToken = c.req.query('shopToken');

    if (!shopToken) {
      return c.json({ error: "Token da loja Ã© obrigatÃ³rio" }, 400);
    }

    const parts = await db.getParts(shopToken);

    return c.json({ success: true, parts });

  } catch (error) {
    console.log(`Get parts error: ${error}`);
    return c.json({ error: "Erro ao buscar peÃ§as" }, 500);
  }
});

// Create part
app.post("/make-server-9bef0ec0/parts", async (c) => {
  try {
    const data = await c.req.json();
    const { shopToken } = data;

    if (!shopToken) {
      return c.json({ error: "Token da loja Ã© obrigatÃ³rio" }, 400);
    }

    const part = await db.createPart({
      shop_token: shopToken,
      service_order_id: data.service_order_id,
      os_number: data.os_number,
      client_name: data.client_name,
      equipment_type: data.equipment_type,
      technician_name: data.technician_name,
      name: data.name,
      quantity: data.quantity,
      unit_price: data.unit_price,
      total_price: data.total_price,
      supplier: data.supplier,
      status: data.status || 'pending',
      estimated_arrival_date: data.estimated_arrival_date,
      notes: data.notes,
    });

    return c.json({ success: true, part });

  } catch (error) {
    console.log(`Create part error: ${error}`);
    return c.json({ error: "Erro ao criar peÃ§a" }, 500);
  }
});

// Update part
app.put("/make-server-9bef0ec0/parts/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    const part = await db.updatePart(id, updates);

    return c.json({ success: true, part });

  } catch (error) {
    console.log(`Update part error: ${error}`);
    return c.json({ error: "Erro ao atualizar peÃ§a" }, 500);
  }
});

// Delete part
app.delete("/make-server-9bef0ec0/parts/:id", async (c) => {
  try {
    const id = c.req.param('id');

    await db.deletePart(id);

    return c.json({ success: true });

  } catch (error) {
    console.log(`Delete part error: ${error}`);
    return c.json({ error: "Erro ao deletar peÃ§a" }, 500);
  }
});

// ============================================
// EQUIPMENTS ENDPOINTS
// ============================================

// Get all manual equipments
app.get("/make-server-9bef0ec0/equipments", async (c) => {
  try {
    console.log('[GET /equipments] Starting request...');
    const shopToken = c.req.query('shopToken');
    console.log('[GET /equipments] shopToken:', shopToken);

    if (!shopToken) {
      console.log('[GET /equipments] No shop token provided');
      return c.json({ error: "Token da loja Ã© obrigatÃ³rio" }, 400);
    }

    console.log('[GET /equipments] Calling getManualEquipments...');
    const equipments = await db.getManualEquipments(shopToken);
    console.log('[GET /equipments] Success! Found', equipments.length, 'equipments');

    // Debug: Log warranty data for sold equipments
    const soldEquipments = equipments.filter(eq => eq.sold || eq.status === 'sold');
    console.log('[GET /equipments] Sold equipments found:', soldEquipments.length);
    soldEquipments.forEach(eq => {
      console.log(`[GET /equipments] Sold equipment:`, {
        id: eq.id,
        device: eq.device,
        sold: eq.sold,
        sold_date: eq.sold_date,
        warranty_end_date: eq.warranty_end_date,
        status: eq.status
      });
    });

    return c.json({ success: true, equipments });

  } catch (error) {
    console.log(`[GET /equipments] ERROR:`, error);
    console.log(`[GET /equipments] ERROR type:`, typeof error);
    console.log(`[GET /equipments] ERROR stack:`, error instanceof Error ? error.stack : 'No stack');
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return c.json({ 
      error: "Erro ao buscar equipamentos",
      details: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

// (moved below)

// Create equipment
app.post("/make-server-9bef0ec0/equipments", async (c) => {
  try {
    const data = await c.req.json();
    const { shopToken } = data;

    if (!shopToken) {
      return c.json({ error: "Token da loja Ã© obrigatÃ³rio" }, 400);
    }

    const equipment = await db.createManualEquipment({
      shop_token: shopToken,
      brand: data.brand,
      model: data.model,
      device: data.device,
      serial_number: data.serialNumber,
      notes: data.notes,
    });

    return c.json({ success: true, equipment });

  } catch (error) {
    console.log(`Create equipment error: ${error}`);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return c.json({ 
      error: "Erro ao criar equipamento",
      details: errorMessage 
    }, 500);
  }
});



// Mark equipment as sold
app.post("/make-server-9bef0ec0/equipments/mark-as-sold", async (c) => {
  try {
    const data = await c.req.json();
    const { shopToken, equipmentId, soldDate, invoiceId } = data;

    if (!shopToken || !equipmentId) {
      return c.json({ error: "shopToken e equipmentId sÃ£o obrigatÃ³rios" }, 400);
    }

    console.log(`[MARK_AS_SOLD] Marking equipment ${equipmentId} as sold for shop ${shopToken}`);

    const supabase = db.getSupabaseClient();
    
    // Calcular data de fim da garantia (3 meses apÃ³s a venda)
    const saleDate = new Date(soldDate || new Date().toISOString());
    const warrantyEndDate = new Date(saleDate);
    warrantyEndDate.setMonth(warrantyEndDate.getMonth() + 3);
    
    const { data: equipment, error } = await supabase
      .from('equipments_manual')
      .update({
        sold: true,
        sold_date: saleDate.toISOString(),
        warranty_end_date: warrantyEndDate.toISOString(),
        invoice_id: invoiceId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', equipmentId)
      .eq('shop_token', shopToken)
      .select()
      .single();

    if (error) {
      console.error(`[MARK_AS_SOLD] Error:`, error);
      return c.json({ 
        error: "Erro ao marcar equipamento como vendido",
        details: error.message 
      }, 500);
    }

    console.log(`[MARK_AS_SOLD] Equipment marked as sold successfully`);
    return c.json({ success: true, equipment });

  } catch (error) {
    console.log(`Mark as sold error: ${error}`);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return c.json({ 
      error: "Erro ao marcar equipamento como vendido",
      details: errorMessage 
    }, 500);
  }
});

// ============================================
// EMAIL ENDPOINTS
// ============================================

// Send invoice email
app.post("/make-server-9bef0ec0/send-invoice-email", async (c) => {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('âŒ RESEND_API_KEY nÃ£o configurada');
      return c.json({ 
        error: 'ConfiguraÃ§Ã£o de email nÃ£o encontrada. Configure RESEND_API_KEY no Supabase.' 
      }, 500);
    }

    const body = await c.req.json();
    const {
      to,
      clientName,
      osNumber,
      deliveryDate,
      totalValue,
      paymentMethod,
      warrantyEndDate,
      parts,
    } = body;

    // Validar campos obrigatÃ³rios
    if (!to || !clientName || !osNumber || totalValue === undefined) {
      return c.json({ 
        error: 'Campos obrigatÃ³rios: to, clientName, osNumber, totalValue' 
      }, 400);
    }

    console.log(`ðŸ“§ Enviando email de nota fiscal para: ${to}`);
    
    const result = await emailService.sendInvoiceEmail(resendApiKey, {
      to,
      clientName,
      osNumber,
      deliveryDate,
      totalValue,
      paymentMethod,
      warrantyEndDate,
      parts,
    });

    if (result.error) {
      console.error('âŒ Erro ao enviar email:', result.error);
      return c.json({ 
        error: `Erro ao enviar email: ${result.error.message || JSON.stringify(result.error)}` 
      }, 500);
    }

    console.log('âœ… Email de nota fiscal enviado com sucesso! ID:', result.id);
    return c.json({ 
      success: true, 
      emailId: result.id,
      message: 'Email enviado com sucesso!'
    });

  } catch (err) {
    console.error('âŒ Erro no servidor ao enviar email de nota fiscal:', err);
    return c.json({ 
      error: `Erro interno: ${String(err)}` 
    }, 500);
  }
});

// Send budget email
app.post("/make-server-9bef0ec0/send-budget-email", async (c) => {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('âŒ RESEND_API_KEY nÃ£o configurada');
      return c.json({ 
        error: 'ConfiguraÃ§Ã£o de email nÃ£o encontrada. Configure RESEND_API_KEY no Supabase.' 
      }, 500);
    }

    const body = await c.req.json();
    const {
      to,
      clientName,
      osNumber,
      totalValue,
      parts,
      observations,
    } = body;

    // Validar campos obrigatÃ³rios
    if (!to || !clientName || !osNumber || totalValue === undefined) {
      return c.json({ 
        error: 'Campos obrigatÃ³rios: to, clientName, osNumber, totalValue' 
      }, 400);
    }

    console.log(`ðŸ“§ Enviando email de orÃ§amento para: ${to}`);
    
    const result = await emailService.sendBudgetEmail(resendApiKey, {
      to,
      clientName,
      osNumber,
      totalValue,
      parts,
      observations,
    });

    if (result.error) {
      console.error('âŒ Erro ao enviar email:', result.error);
      return c.json({ 
        error: `Erro ao enviar email: ${result.error.message || JSON.stringify(result.error)}` 
      }, 500);
    }

    console.log('âœ… Email de orÃ§amento enviado com sucesso! ID:', result.id);
    return c.json({ 
      success: true, 
      emailId: result.id,
      message: 'Email enviado com sucesso!'
    });

  } catch (err) {
    console.error('âŒ Erro no servidor ao enviar email de orÃ§amento:', err);
    return c.json({ 
      error: `Erro interno: ${String(err)}` 
    }, 500);
  }
});

// Send service order created email
app.post("/make-server-9bef0ec0/send-os-created-email", async (c) => {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('âŒ RESEND_API_KEY nÃ£o configurada');
      return c.json({ 
        error: 'ConfiguraÃ§Ã£o de email nÃ£o encontrada. Configure RESEND_API_KEY no Supabase.' 
      }, 500);
    }

    const body = await c.req.json();
    const {
      to,
      clientName,
      osNumber,
      equipmentType,
      equipmentBrand,
      equipmentModel,
      defect,
      technicianName,
      estimatedDeliveryDate,
    } = body;

    // Validar campos obrigatÃ³rios
    if (!to || !clientName || !osNumber || !equipmentType || !defect) {
      return c.json({ 
        error: 'Campos obrigatÃ³rios: to, clientName, osNumber, equipmentType, defect' 
      }, 400);
    }

    console.log(`ðŸ“§ Enviando email de O.S criada para: ${to}`);
    
    const result = await emailService.sendServiceOrderCreatedEmail(resendApiKey, {
      to,
      clientName,
      osNumber,
      equipmentType,
      equipmentBrand,
      equipmentModel,
      defect,
      technicianName,
      estimatedDeliveryDate,
    });

    if (result.error) {
      console.error('âŒ Erro ao enviar email:', result.error);
      return c.json({ 
        error: `Erro ao enviar email: ${result.error.message || JSON.stringify(result.error)}` 
      }, 500);
    }

    console.log('âœ… Email de O.S criada enviado com sucesso! ID:', result.id);
    return c.json({ 
      success: true, 
      emailId: result.id,
      message: 'Email enviado com sucesso!'
    });

  } catch (err) {
    console.error('âŒ Erro no servidor ao enviar email de O.S criada:', err);
    return c.json({ 
      error: `Erro interno: ${String(err)}` 
    }, 500);
  }
});

Deno.serve(app.fetch);

