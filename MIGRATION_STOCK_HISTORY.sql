-- ============================================
-- MIGRATION: STOCK HISTORY SYSTEM
-- Date: 2024-12-03
-- Description: Add support for stock adjustments and negative quantities
-- ============================================

-- 1. ADD COLUMNS TO parts TABLE
-- Add columns for tracking adjustments
ALTER TABLE parts 
  ADD COLUMN IF NOT EXISTS is_adjustment BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS adjustment_reason TEXT;

-- 2. REMOVE QUANTITY CONSTRAINT (allow negative values)
-- This allows us to record stock decreases as negative entries
ALTER TABLE parts DROP CONSTRAINT IF EXISTS parts_quantity_check;
ALTER TABLE parts DROP CONSTRAINT IF EXISTS parts_quantity_positive;

-- 3. CREATE INDEXES FOR PERFORMANCE
-- Index for aggregation queries (group by piece_id, order by date)
CREATE INDEX IF NOT EXISTS idx_parts_piece_id_date 
  ON parts(piece_id, created_at DESC) 
  WHERE piece_id IS NOT NULL;

-- Index for filtering adjustments
CREATE INDEX IF NOT EXISTS idx_parts_is_adjustment 
  ON parts(is_adjustment);

-- 4. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON COLUMN parts.is_adjustment IS 'Indicates if this entry is a manual adjustment (edit/delete operation)';
COMMENT ON COLUMN parts.adjustment_reason IS 'Reason for adjustment: "increase", "decrease", "delete", "price_update", etc.';

-- 5. VERIFY MIGRATION
DO $$ 
BEGIN
  -- Check is_adjustment column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'is_adjustment'
  ) THEN
    RAISE NOTICE '✓ Column parts.is_adjustment exists';
  ELSE
    RAISE EXCEPTION '✗ Column parts.is_adjustment was not created';
  END IF;

  -- Check adjustment_reason column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'adjustment_reason'
  ) THEN
    RAISE NOTICE '✓ Column parts.adjustment_reason exists';
  ELSE
    RAISE EXCEPTION '✗ Column parts.adjustment_reason was not created';
  END IF;

  RAISE NOTICE '✓✓✓ Migration completed successfully! ✓✓✓';
END $$;

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

-- Get aggregated stock (sum quantities by piece_id)
-- SELECT 
--   piece_id,
--   name,
--   SUM(quantity) as total_quantity,
--   MAX(price) as last_price,
--   MAX(created_at) as last_entry_date
-- FROM parts
-- WHERE shop_token = 'YOUR_TOKEN' AND piece_id IS NOT NULL
-- GROUP BY piece_id, name
-- HAVING SUM(quantity) > 0;

-- Get full history for a specific piece
-- SELECT *
-- FROM parts
-- WHERE piece_id = 'PIECE_ID' AND shop_token = 'YOUR_TOKEN'
-- ORDER BY created_at DESC;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- Uncomment to rollback migration:
/*
-- Drop indexes
DROP INDEX IF EXISTS idx_parts_piece_id_date;
DROP INDEX IF EXISTS idx_parts_is_adjustment;

-- Drop columns
ALTER TABLE parts DROP COLUMN IF EXISTS is_adjustment;
ALTER TABLE parts DROP COLUMN IF EXISTS adjustment_reason;
*/
