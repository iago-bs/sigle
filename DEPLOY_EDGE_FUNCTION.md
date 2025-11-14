# Deploy da Edge Function no Supabase

## Como fazer deploy via Dashboard

1. Acesse: https://supabase.com/dashboard/project/rwgdfveokzemavstpvyv/functions

2. Clique em **"Create a new function"**

3. Nome da função: `make-server-9bef0ec0`

4. Cole o código do arquivo: `edge-function-bundle.ts` (criado na raiz do projeto)

5. **Configure as variáveis de ambiente:**
   - Dashboard → Settings → Edge Functions → Environment Variables
   - Adicione:
     - `SUPABASE_URL`: `https://rwgdfveokzemavstpvyv.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY`: (pegue em Settings → API → service_role key - **SECRET**)
     - `RESEND_API_KEY`: (opcional, só se quiser enviar emails)

6. Clique em **Deploy**

## Estrutura das tabelas necessárias

Certifique-se de que as seguintes tabelas existem no banco:

```sql
-- Tabela de lojas
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  cpf TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de equipamentos (estatísticas)
CREATE TABLE IF NOT EXISTS equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token UUID NOT NULL,
  type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  common_issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_token, type)
);

-- Tabela de equipamentos manuais
CREATE TABLE IF NOT EXISTS equipments_manual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token UUID NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  device TEXT NOT NULL,
  serial_number TEXT,
  notes TEXT,
  sold BOOLEAN DEFAULT false,
  sold_date TIMESTAMPTZ,
  warranty_end_date TIMESTAMPTZ,
  invoice_id TEXT,
  sold_to TEXT,
  last_service_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de ordens de serviço
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token UUID NOT NULL,
  os_number TEXT NOT NULL,
  client_id UUID,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_whatsapp TEXT,
  equipment_type TEXT NOT NULL,
  equipment_brand TEXT,
  equipment_model TEXT,
  defect TEXT NOT NULL,
  observations TEXT,
  technician_id UUID,
  technician_name TEXT,
  status TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  estimated_delivery_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  delivery_date TIMESTAMPTZ,
  warranty_months INTEGER DEFAULT 3,
  total_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_token, os_number)
);

-- Tabela de peças
CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token UUID NOT NULL,
  service_order_id UUID,
  os_number TEXT,
  client_name TEXT,
  equipment_type TEXT,
  technician_name TEXT,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) DEFAULT 0,
  supplier TEXT,
  status TEXT NOT NULL,
  estimated_arrival_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testando

Após o deploy, teste com:

```powershell
# PowerShell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Z2RmdmVva3plbWF2c3Rwdnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzA3MTksImV4cCI6MjA3ODA0NjcxOX0.JaZjZkWEzkp5k-eiuPX-_MQ-mTXAALSNoxv2WjHZdRk"
}
Invoke-RestMethod -Uri "https://rwgdfveokzemavstpvyv.supabase.co/functions/v1/make-server-9bef0ec0/health" -Headers $headers
```

```bash
# Bash/Linux
curl https://rwgdfveokzemavstpvyv.supabase.co/functions/v1/make-server-9bef0ec0/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Z2RmdmVva3plbWF2c3Rwdnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzA3MTksImV4cCI6MjA3ODA0NjcxOX0.JaZjZkWEzkp5k-eiuPX-_MQ-mTXAALSNoxv2WjHZdRk"
```

Deve retornar: `{"status":"ok"}`
