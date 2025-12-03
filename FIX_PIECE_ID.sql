-- ============================================
-- FIX: Vincular movimentações antigas às peças
-- ============================================
-- Este script vincula os registros de estoque (parts) 
-- que não têm piece_id às peças (pieces_manual) correspondentes
-- baseado no nome

-- 1. Verificar quantos registros estão sem piece_id
SELECT COUNT(*) as total_sem_piece_id
FROM parts 
WHERE piece_id IS NULL;

-- 2. Ver exemplo de registros sem piece_id
SELECT id, name, shop_token, created_at
FROM parts 
WHERE piece_id IS NULL
LIMIT 5;

-- 3. ATUALIZAR: Vincular baseado no nome
-- ATENÇÃO: Revise os dados antes de executar!
UPDATE parts p
SET piece_id = pm.id
FROM pieces_manual pm
WHERE p.piece_id IS NULL
  AND LOWER(TRIM(p.name)) = LOWER(TRIM(pm.name));

-- 4. Verificar quantos foram vinculados
SELECT COUNT(*) as total_vinculados
FROM parts 
WHERE piece_id IS NOT NULL;

-- 5. Ver registros que ainda estão sem piece_id (não encontraram correspondência)
SELECT id, name, shop_token, created_at
FROM parts 
WHERE piece_id IS NULL;

-- ============================================
-- OPCIONAL: Criar peças para registros órfãos
-- ============================================
-- Se ainda houver registros sem piece_id, você pode criar peças para eles:
/*
INSERT INTO pieces_manual (name, part_type, notes, created_at)
SELECT DISTINCT 
  p.name,
  'Outro' as part_type,
  'Criado automaticamente a partir de movimentação antiga' as notes,
  NOW() as created_at
FROM parts p
WHERE p.piece_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM pieces_manual pm 
    WHERE LOWER(TRIM(pm.name)) = LOWER(TRIM(p.name))
  );

-- Depois, vincular novamente:
UPDATE parts p
SET piece_id = pm.id
FROM pieces_manual pm
WHERE p.piece_id IS NULL
  AND LOWER(TRIM(p.name)) = LOWER(TRIM(pm.name));
*/
