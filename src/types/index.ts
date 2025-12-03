// Central type definitions for the application

export interface Shop {
  id: string;
  name: string;
  token: string;              // Token único e imutável da loja
  createdAt: string;
  ownerEmail: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  shopToken: string;          // Token da loja à qual o usuário pertence
  role?: 'owner' | 'technician';
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  isActive?: boolean;      // Soft delete flag (default: true)
  deletedAt?: string;      // When was inactivated
}

export interface Appointment {
  id: string;
  name: string;
  date: string;          // Date of the appointment (YYYY-MM-DD format)
  time: string;
  service: string;
  model: string;
  status: "waiting" | "in-progress" | "ready";
  statusMessage: string;
}

export interface Technician {
  id: string;
  name: string;
  phone?: string;
  specialty?: string;
  createdAt: string;
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
  status: "pending" | "in-progress" | "waiting-parts" | "under-observation" | "waiting-client-response" | "abandoned" | "completed" | "cancelled";
  priority: string;
  entry_date: string;
  estimated_delivery_date?: string;
  completion_date?: string;
  delivery_date?: string;
  warranty_months: number;
  total_value: number;
  created_at: string;
  updated_at: string;
  
  // Legacy fields (for backward compatibility)
  osNumber?: string;
  clientId?: string;
  clientName?: string;
  technicianId?: string;
  technicianName?: string;
  createdByTechnicianId?: string;
  device?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  color?: string;
  accessories?: string;
  entryDate?: string;
  waitingParts?: string[];
  paymentMethod?: "cash" | "card" | "pix" | "transfer";
  paymentAmount?: string;
  completionDate?: string;
  deliveryDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyMonths?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Part {
  id: string;
  name: string;
  osNumber: string;
  osDescription: string;
  quantity: number;
  unit: string;
  status: "to-order" | "ordered" | "arriving" | "received";
  urgent: boolean;
  price?: string;
  orderDate?: string;
  expectedDate?: string;
}

export interface StockPart {
  id: string;
  shop_token: string;
  piece_id?: string;         // FK para pieces_manual
  name: string;              // Nome da peça (ex: "Placa UF50lg9")
  description?: string;       // Descrição adicional
  quantity: number;           // Quantidade (positivo=entrada, negativo=saída)
  price?: number;             // Preço da peça nesta movimentação
  added_at: string;           // Data de adição ao estoque
  is_adjustment?: boolean;    // Se é um ajuste manual
  adjustment_reason?: string; // Motivo do ajuste
  created_at: string;
  updated_at: string;
  
  // Campos legados (mantidos para compatibilidade temporária)
  compatibleModels?: string[];
  compatibleBrands?: string[];
  location?: string;
  notes?: string;
  addedAt?: string;           // Alias para added_at
  pieceId?: string;           // Alias para piece_id
}

export interface Equipment {
  id: string;
  device: string;
  brand: string;
  model: string;
  color?: string;
  serialNumber?: string;
  notes?: string;
  lastServiceDate?: string;
  totalServices: number;
  status?: "available" | "sold"; // Status do equipamento
  saleDate?: string; // Data da venda
  warrantyEndDate?: string; // Data de fim da garantia (3 meses após venda)
  soldTo?: string; // Cliente que comprou
  soldDate?: string; // Data da venda (alias de saleDate, quando aplicável)
}

export interface Piece {
  id: string;
  name: string;              // Nome da peça
  partType: string;          // Tipo da peça (do sistema de variáveis)
  serialNumber?: string;     // Número de série
  notes?: string;            // Observações
  createdAt: string;         // Data de cadastro
}

export interface OnlinePart {
  id: string;
  name: string;               // Nome da peça
  trackingLink?: string;      // Link de rastreio
  expectedDeliveryDate?: string; // Data de entrega prevista
  linkedServiceOrderId?: string; // O.S vinculada (opcional)
  status: "ordered" | "shipped" | "delivered" | "cancelled"; // Status da entrega
  orderDate: string;          // Data do pedido
  receivedDate?: string;      // Data que recebeu a peça
  notes?: string;             // Observações
  createdAt: string;
}

export interface SystemVariable {
  id: string;
  category: "part_types" | "device_types" | "brands" | "product_colors";
  value: string;
  isDefault: boolean;
  createdAt: string;
}

export type VariableCategory = "part_types" | "device_types" | "brands" | "product_colors";

export type PageType = "main" | "clients" | "inactive-clients" | "parts" | "pieces" | "print-os" | "equipments" | "technicians" | "variables";
