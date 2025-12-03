-- ============================================
-- MIGRATION: Add 'active' field to equipments, pieces_manual and clients
-- Date: 2024-12-03
-- Description: Add active/inactive status for soft delete functionality
-- ============================================

-- 1. Add 'active' field to equipments_manual table
ALTER TABLE equipments_manual 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Add index for active field
CREATE INDEX IF NOT EXISTS idx_equipments_manual_active ON equipments_manual(active);

-- 2. Add 'active' field to pieces_manual table
ALTER TABLE pieces_manual 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Add index for active field
CREATE INDEX IF NOT EXISTS idx_pieces_manual_active ON pieces_manual(active);

-- 3. Add 'active' field to clients table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'active'
  ) THEN
    ALTER TABLE clients ADD COLUMN active BOOLEAN DEFAULT TRUE;
    CREATE INDEX idx_clients_active ON clients(active);
  END IF;
END $$;

-- 4. Set all existing records as active
UPDATE equipments_manual SET active = TRUE WHERE active IS NULL;
UPDATE pieces_manual SET active = TRUE WHERE active IS NULL;
UPDATE clients SET active = TRUE WHERE active IS NULL OR active IS FALSE;

-- 5. Add comments
COMMENT ON COLUMN equipments_manual.active IS 'Equipment status: true=active, false=inactive (soft delete)';
COMMENT ON COLUMN pieces_manual.active IS 'Piece status: true=active, false=inactive (soft delete)';
COMMENT ON COLUMN clients.active IS 'Client status: true=active, false=inactive';

-- 6. Add equipment_manual_id to service_orders for FK relationship
ALTER TABLE service_orders 
ADD COLUMN IF NOT EXISTS equipment_manual_id UUID REFERENCES equipments_manual(id) ON DELETE SET NULL;

-- Add index for equipment_manual_id
CREATE INDEX IF NOT EXISTS idx_service_orders_equipment_manual_id ON service_orders(equipment_manual_id);

COMMENT ON COLUMN service_orders.equipment_manual_id IS 'FK to equipments_manual table for equipment tracking';

-- 7. Verification
DO $$ 
DECLARE
  count_eq INTEGER;
  count_pc INTEGER;
  count_cl INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_eq FROM equipments_manual WHERE active = TRUE;
  SELECT COUNT(*) INTO count_pc FROM pieces_manual WHERE active = TRUE;
  SELECT COUNT(*) INTO count_cl FROM clients WHERE active = TRUE;
  
  RAISE NOTICE '✓ Active equipments: %', count_eq;
  RAISE NOTICE '✓ Active pieces: %', count_pc;
  RAISE NOTICE '✓ Active clients: %', count_cl;
  RAISE NOTICE '✓✓✓ Migration completed successfully! ✓✓✓';
END $$;
