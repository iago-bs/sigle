import type { Client, Appointment, Part, StockPart, ServiceOrder, Technician } from "../types";

// Token padrão para modo loja única (UUID válido)
export const DEFAULT_SHOP_TOKEN = '00000000-0000-0000-0000-000000000001';


export const STORAGE_KEYS = {
  CLIENTS: "sigle_clients",
  PARTS: "sigle_parts",
  STOCK_PARTS: "sigle_stock_parts",
  APPOINTMENTS: "sigle_appointments",
  SERVICE_ORDERS: "sigle_service_orders",
  TECHNICIANS: "sigle_technicians",
  SETUP_COMPLETE: "sigle_setup_complete",
  ACTIVE_TECHNICIAN: "sigle_active_technician", 
  EQUIPMENTS: "sigle_equipments",
  SYSTEM_VARIABLES: "sigle_system_variables"  
} as const;


export const PART_TYPES = [
  "Barra de LED",
  "Capacitor",
  "Fonte",
  "Placa Principal",
  "Placa de Internet",
  "Lâmpada",
  "Placa T-CON",
  "Placa LVDS",
  "Inverter",
  "Backlight",
  "Tela LCD",
  "Cooler/Ventilador",
  "Lente Projetor",
  "DMD (Chip DLP)",
  "Controle Remoto",
  "Cabo Flat",
  "Transistor",
  "CI (Circuito Integrado)",
  "Transformador",
  "Resistor",
  "Diodo",
  "Fusível",
  "Outro"

] as const;


export const DEVICE_TYPES = [
  "TV",
  "Projetor",
  "Monitor",
  "Home Theater",
  "Soundbar",
  "Receptor de TV",
  "Conversor Digital",
  "Outro"
] as const;


export const BRANDS = [
  "Samsung",
  "LG",
  "Sony",
  "Philips",
  "TCL",
  "AOC",
  "Panasonic",
  "Positivo",
  "Semp Toshiba",
  "Sharp",
  "Epson",
  "BenQ",
  "Multilaser",
  "Xiaomi",
  "Hitachi",
  "Outro"
] as const;


export const PRODUCT_COLORS = [
  "Preto",
  "Branco",
  "Prata",
  "Cinza",
  "Grafite",
  "Outro"
] as const;


export const initialClients: Client[] = [];

// Helper function to get dates for current week (for initial appointments)
function getCurrentWeekDate(dayOffset: number): string {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + dayOffset);
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Helper function to get today's date
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Initial appointments - Starts empty, populated from database
export const initialAppointments: Appointment[] = [];

// Initial parts - Starts empty, populated from database
export const initialParts: Part[] = [];

// Initial stock parts - Starts empty, populated from database
export const initialStockParts: StockPart[] = [];

// Initial technicians - Starts empty, populated from database
export const initialTechnicians: Technician[] = [];

// Initial service orders - Starts empty, populated from database
export const initialServiceOrders: ServiceOrder[] = [];

// Default system variables - Will be used to populate initial variables if none exist
export const defaultSystemVariables = {
  part_types: [
    "Barra de LED",
    "Capacitor",
    "Fonte",
    "Placa Principal",
    "Placa de Internet",
    "Lâmpada",
    "Placa T-CON",
    "Placa LVDS",
    "Inverter",
    "Backlight",
    "Tela LCD",
    "Cooler/Ventilador",
    "Lente Projetor",
    "DMD (Chip DLP)",
    "Controle Remoto",
    "Cabo Flat",
    "Transistor",
    "CI (Circuito Integrado)",
    "Transformador",
    "Resistor",
    "Diodo",
    "Fusível",
    "Outro"
  ],
  device_types: [
    "TV",
    "Projetor",
    "Monitor",
    "Home Theater",
    "Soundbar",
    "Receptor de TV",
    "Conversor Digital",
    "Outro"
  ],
  brands: [
    "Samsung",
    "LG",
    "Sony",
    "Philips",
    "TCL",
    "AOC",
    "Panasonic",
    "Positivo",
    "Semp Toshiba",
    "Sharp",
    "Epson",
    "BenQ",
    "Multilaser",
    "Xiaomi",
    "Hitachi",
    "Outro"
  ],
  product_colors: [
    "Preto",
    "Branco",
    "Prata",
    "Cinza",
    "Grafite",
    "Outro"
  ]
} as const;
