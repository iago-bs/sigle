# Script para gerar bundle consolidado da Edge Function

Write-Host "Gerando bundle consolidado..." -ForegroundColor Green

# Ler os arquivos com encoding UTF-8
$database = Get-Content "src\supabase\functions\server\database.ts" -Raw -Encoding UTF8
$email = Get-Content "src\supabase\functions\server\email.ts" -Raw -Encoding UTF8
$index = Get-Content "src\supabase\functions\server\index.tsx" -Raw -Encoding UTF8

# Remover imports dos módulos inline no index
$index = $index -replace 'import \* as db from "\.\/database\.ts";', '// Database functions inlined below'
$index = $index -replace 'import \* as emailService from "\.\/email\.ts";', '// Email functions inlined below'

# Remover os imports principais do index (já estão no cabeçalho do bundle)
$index = $index -replace 'import \{ Hono \} from "npm:hono";', ''
$index = $index -replace 'import \{ cors \} from "npm:hono/cors";', ''
$index = $index -replace 'import \{ logger \} from "npm:hono/logger";', ''
$index = $index -replace 'import \{ createClient \} from "npm:@supabase/supabase-js@2";', ''

# Remover imports e exports dos módulos
$database = $database -replace "import \{ createClient \} from 'npm:@supabase/supabase-js@2';", ''
$database = $database -replace 'export (function|async function|interface|type)', '$1'
$email = $email -replace 'export (function|async function|interface|type)', '$1'

# Mapear funções inlined para os objetos esperados no index
$mappings = @"
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
"@

# Criar bundle final
$bundle = @"
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

$database

// ============================================
// EMAIL MODULE (inline)
// ============================================

$email

// ============================================
// MAIN APPLICATION
// ============================================

$mappings

$index
"@

# Salvar bundle (UTF-8 sem BOM)
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText("$PWD\edge-function-bundle.ts", $bundle, $Utf8NoBomEncoding)

Write-Host "Bundle gerado com sucesso: edge-function-bundle.ts" -ForegroundColor Green
Write-Host "Cole o conteúdo deste arquivo no Supabase Dashboard" -ForegroundColor Yellow
