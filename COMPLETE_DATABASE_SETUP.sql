-- ============================================
-- CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS
-- Sistema de Peças e Estoque
-- ============================================

-- ============================================
-- 1. TABELA: pieces_manual (Catálogo de Peças)
-- ============================================
-- Esta é a tabela MESTRE de peças - o cadastro de peças disponíveis

CREATE TABLE IF NOT EXISTS pieces_manual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token TEXT NOT NULL,
  name TEXT NOT NULL,
  part_type TEXT NOT NULL,
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para pieces_manual
CREATE INDEX IF NOT EXISTS idx_pieces_manual_shop_token ON pieces_manual(shop_token);
CREATE INDEX IF NOT EXISTS idx_pieces_manual_name ON pieces_manual(name);
CREATE INDEX IF NOT EXISTS idx_pieces_manual_serial_number ON pieces_manual(serial_number);
CREATE INDEX IF NOT EXISTS idx_pieces_manual_shop_name ON pieces_manual(shop_token, name);

-- ============================================
-- 2. TABELA: stock_parts (Movimentações de Estoque)
-- ============================================
-- Esta tabela armazena as MOVIMENTAÇÕES de estoque (entradas/saídas)
-- É uma tabela de HISTÓRICO - nunca deletamos, apenas adicionamos registros

CREATE TABLE IF NOT EXISTS stock_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token TEXT NOT NULL,
  piece_id UUID REFERENCES pieces_manual(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  is_adjustment BOOLEAN DEFAULT FALSE,
  adjustment_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para stock_parts
CREATE INDEX IF NOT EXISTS idx_stock_parts_shop_token ON stock_parts(shop_token);
CREATE INDEX IF NOT EXISTS idx_stock_parts_piece_id ON stock_parts(piece_id);
CREATE INDEX IF NOT EXISTS idx_stock_parts_added_at ON stock_parts(added_at);

-- ============================================
-- 3. TABELA: parts (Peças de Ordem de Serviço)
-- ============================================
-- Esta tabela é para peças PEDIDAS/USADAS em ordens de serviço
-- NÃO É A TABELA DE ESTOQUE!

-- Verificar se a tabela parts existe, se não criar
CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token TEXT NOT NULL,
  service_order_id UUID,
  os_number TEXT,
  client_name TEXT,
  equipment_type TEXT,
  technician_name TEXT,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  supplier TEXT,
  status TEXT DEFAULT 'pending',
  estimated_arrival_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para parts
CREATE INDEX IF NOT EXISTS idx_parts_shop_token ON parts(shop_token);
CREATE INDEX IF NOT EXISTS idx_parts_service_order_id ON parts(service_order_id);
CREATE INDEX IF NOT EXISTS idx_parts_status ON parts(status);

-- ============================================
-- 4. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE pieces_manual IS 'Catálogo mestre de peças - cadastro de todas as peças disponíveis';
COMMENT ON TABLE stock_parts IS 'Histórico de movimentações de estoque - todas as entradas e saídas';
COMMENT ON TABLE parts IS 'Peças pedidas/usadas em ordens de serviço - NÃO é estoque';

COMMENT ON COLUMN pieces_manual.id IS 'ID único da peça no catálogo';
COMMENT ON COLUMN pieces_manual.name IS 'Nome da peça';
COMMENT ON COLUMN pieces_manual.part_type IS 'Tipo/categoria da peça';
COMMENT ON COLUMN pieces_manual.serial_number IS 'Número de série (opcional)';

COMMENT ON COLUMN stock_parts.id IS 'ID único da movimentação';
COMMENT ON COLUMN stock_parts.piece_id IS 'FK para pieces_manual - qual peça foi movimentada';
COMMENT ON COLUMN stock_parts.quantity IS 'Quantidade (positivo=entrada, negativo=saída)';
COMMENT ON COLUMN stock_parts.price IS 'Preço unitário nesta movimentação';
COMMENT ON COLUMN stock_parts.is_adjustment IS 'Se true, é um ajuste manual de estoque';
COMMENT ON COLUMN stock_parts.adjustment_reason IS 'Motivo do ajuste (se is_adjustment=true)';

-- ============================================
-- 5. MIGRAR DADOS EXISTENTES (SE HOUVER)
-- ============================================

-- Se você tiver dados na tabela parts que são NA VERDADE de estoque,
-- descomente e execute este bloco:

/*
INSERT INTO stock_parts (shop_token, piece_id, name, description, quantity, price, added_at)
SELECT 
  p.shop_token,
  p.piece_id,
  p.name,
  p.equipment_type as description,
  p.quantity,
  p.unit_price as price,
  p.created_at as added_at
FROM parts p
WHERE p.piece_id IS NOT NULL  -- Apenas registros que têm piece_id são de estoque
  AND NOT EXISTS (
    SELECT 1 FROM stock_parts sp 
    WHERE sp.piece_id = p.piece_id 
      AND sp.added_at = p.created_at
  );

-- Depois de migrar, você pode limpar os registros de estoque da tabela parts:
-- DELETE FROM parts WHERE piece_id IS NOT NULL AND service_order_id IS NULL;
*/

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================

DO $$ 
DECLARE
  count_pieces INTEGER;
  count_stock INTEGER;
  count_parts INTEGER;
BEGIN
  -- Verificar pieces_manual
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pieces_manual') THEN
    RAISE NOTICE '✓ Tabela pieces_manual existe';
  ELSE
    RAISE EXCEPTION '✗ Tabela pieces_manual NÃO existe';
  END IF;

  -- Verificar stock_parts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_parts') THEN
    RAISE NOTICE '✓ Tabela stock_parts existe';
  ELSE
    RAISE EXCEPTION '✗ Tabela stock_parts NÃO existe';
  END IF;

  -- Verificar parts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parts') THEN
    RAISE NOTICE '✓ Tabela parts existe';
  ELSE
    RAISE EXCEPTION '✗ Tabela parts NÃO existe';
  END IF;

  -- Contar registros
  SELECT COUNT(*) INTO count_pieces FROM pieces_manual;
  RAISE NOTICE 'Peças cadastradas: %', count_pieces;
  
  SELECT COUNT(*) INTO count_stock FROM stock_parts;
  RAISE NOTICE 'Movimentações de estoque: %', count_stock;
  
  SELECT COUNT(*) INTO count_parts FROM parts;
  RAISE NOTICE 'Peças de OS: %', count_parts;

  RAISE NOTICE '';
  RAISE NOTICE '✓✓✓ Configuração concluída com sucesso! ✓✓✓';
END $$;

-- ============================================
-- 7. QUERIES ÚTEIS PARA CONSULTA
-- ============================================

-- Ver todas as peças do catálogo
-- SELECT * FROM pieces_manual ORDER BY name;

-- Ver estoque atual (agregado)
-- SELECT 
--   pm.name,
--   pm.part_type,
--   SUM(sp.quantity) as quantidade_total,
--   MAX(sp.price) as ultimo_preco
-- FROM pieces_manual pm
-- LEFT JOIN stock_parts sp ON sp.piece_id = pm.id
-- GROUP BY pm.id, pm.name, pm.part_type
-- HAVING SUM(sp.quantity) > 0
-- ORDER BY pm.name;

-- Ver histórico de movimentações
-- SELECT 
--   sp.added_at,
--   pm.name,
--   sp.quantity,
--   sp.price,
--   sp.is_adjustment,
--   sp.adjustment_reason
-- FROM stock_parts sp
-- JOIN pieces_manual pm ON pm.id = sp.piece_id
-- ORDER BY sp.added_at DESC;

-- Ver peças usadas em OS
-- SELECT * FROM parts WHERE service_order_id IS NOT NULL ORDER BY created_at DESC;
