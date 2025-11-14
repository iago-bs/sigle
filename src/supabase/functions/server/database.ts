import { createClient } from 'npm:@supabase/supabase-js@2';

// Tipos para as tabelas
export interface Shop {
  id: string;
  shop_token: string;
  name: string;
  address: string;
  phone: string;
  owner_email: string;
  created_at: string;
  updated_at: string;
}

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

export interface Equipment {
  id: string;
  shop_token: string;
  type: string;
  count: number;
  common_issues: Array<{ issue: string; count: number }>;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrder {
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

export interface StockPart {
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

export interface Appointment {
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

export interface Budget {
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

export interface Invoice {
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
 * Cria uma instância do Supabase client
 */
export function getSupabaseClient() {
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
// SHOPS - Funções para gerenciar lojas
// ============================================

export async function createShop(shop: Omit<Shop, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('shops')
    .insert(shop)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getShopByToken(shopToken: string): Promise<Shop | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('shop_token', shopToken)
    .single();
  
  if (error) return null;
  return data;
}

export async function getShopByName(name: string): Promise<Shop | null> {
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
// CLIENTS - Funções para gerenciar clientes
// ============================================

export async function insertClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
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
    
    // Criar mensagem de erro amigável
    let errorMsg = error.message;
    if (error.code === '42P01') {
      errorMsg = 'Tabela "clients" não existe no banco de dados. Execute o SQL de criação.';
    } else if (error.code === '42703') {
      errorMsg = `Coluna inexistente: ${error.message}. Verifique a estrutura da tabela.`;
    } else if (error.message?.includes("Could not find the") && error.message?.includes("column")) {
      // Erro de schema cache - coluna não existe
      const columnMatch = error.message.match(/'(\w+)' column/);
      const columnName = columnMatch ? columnMatch[1] : 'desconhecida';
      errorMsg = `Coluna '${columnName}' não existe na tabela 'clients'. Execute: ALTER TABLE clients ADD COLUMN ${columnName} TEXT; e depois RECARREGUE A PÁGINA.`;
    } else if (error.hint) {
      errorMsg = `${error.message} (Dica: ${error.hint})`;
    }
    
    throw new Error(errorMsg);
  }
  
  console.log('Client inserted successfully:', data?.id);
  return data;
}

export async function getClients(shopToken: string, includeInactive = false): Promise<Client[]> {
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

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateClient(id: string, updates: Partial<Client>) {
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

export async function deleteClient(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// EQUIPMENTS - Funções para gerenciar equipamentos
// ============================================

export async function getEquipments(shopToken: string): Promise<Equipment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .eq('shop_token', shopToken)
    .order('count', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getEquipmentByType(shopToken: string, type: string): Promise<Equipment | null> {
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

export async function upsertEquipment(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) {
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
// SERVICE ORDERS - Funções para gerenciar O.S
// ============================================

export async function createServiceOrder(order: Omit<ServiceOrder, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('service_orders')
    .insert(order)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getServiceOrders(shopToken: string): Promise<ServiceOrder[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .eq('shop_token', shopToken)
    .order('entry_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getServiceOrderById(id: string): Promise<ServiceOrder | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}

export async function getServiceOrderByNumber(shopToken: string, osNumber: string): Promise<ServiceOrder | null> {
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

export async function updateServiceOrder(id: string, updates: Partial<ServiceOrder>) {
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

export async function deleteServiceOrder(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('service_orders')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// PARTS - Funções para gerenciar peças
// ============================================

export async function createPart(part: Omit<Part, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('parts')
    .insert(part)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getParts(shopToken: string): Promise<Part[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('shop_token', shopToken)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getPartsByServiceOrder(serviceOrderId: string): Promise<Part[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('service_order_id', serviceOrderId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function updatePart(id: string, updates: Partial<Part>) {
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

export async function deletePart(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('parts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// STOCK PARTS - Funções para gerenciar estoque
// ============================================

export async function createStockPart(part: Omit<StockPart, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('stock_parts')
    .insert(part)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getStockParts(shopToken: string): Promise<StockPart[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('stock_parts')
    .select('*')
    .eq('shop_token', shopToken)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function updateStockPart(id: string, updates: Partial<StockPart>) {
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

export async function deleteStockPart(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('stock_parts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// APPOINTMENTS - Funções para gerenciar agendamentos
// ============================================

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAppointments(shopToken: string): Promise<Appointment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('shop_token', shopToken)
    .order('datetime', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function updateAppointment(id: string, updates: Partial<Appointment>) {
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

export async function deleteAppointment(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// BUDGETS - Funções para gerenciar orçamentos
// ============================================

export async function createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getBudgets(shopToken: string): Promise<Budget[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('shop_token', shopToken)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function updateBudget(id: string, updates: Partial<Budget>) {
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

export async function deleteBudget(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// INVOICES - Funções para gerenciar notas fiscais
// ============================================

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getInvoices(shopToken: string): Promise<Invoice[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('shop_token', shopToken)
    .order('issue_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getInvoiceByNumber(shopToken: string, invoiceNumber: string): Promise<Invoice | null> {
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

export async function updateInvoice(id: string, updates: Partial<Invoice>) {
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

export async function deleteInvoice(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// EQUIPMENTS - Funções para gerenciar equipamentos
// ============================================

export async function createManualEquipment(equipment: {
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

export async function getManualEquipments(shopToken: string) {
  try {
    console.log('[getManualEquipments] Getting Supabase client...');
    const supabase = getSupabaseClient();
    
    console.log('[getManualEquipments] Querying equipments_manual table...');
    const { data, error } = await supabase
      .from('equipments_manual')
      .select('*, sold, sold_date, warranty_end_date, invoice_id, sold_to')
      .eq('shop_token', shopToken)
      .order('created_at', { ascending: false });
    
    // Se a tabela não existir, retornar array vazio
    if (error) {
      console.log(`[getManualEquipments] Database error:`, error);
      console.log(`[getManualEquipments] Error code: ${error.code}, message: ${error.message}`);
      
      // Se for erro de tabela não encontrada, retornar array vazio
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('═══════════════════════════════════════════════════════════════');
        console.warn('⚠️  ATENÇÃO: Tabela equipments_manual não existe!');
        console.warn('═══════════════════════════════════════════════════════════════');
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
        console.warn('═══════════════════════════════════════════════════════════════');
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
export async function updateManualEquipment(id: string, fields: Record<string, any>) {
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


