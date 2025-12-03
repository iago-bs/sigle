-- ============================================
-- MIGRATION: PIECES AND STOCK SYSTEM
-- Date: 2024
-- Description: Create pieces_manual table and update stock_parts
-- ============================================

-- 1. CREATE PIECES_MANUAL TABLE
-- This table stores the catalog of pieces (master data)
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

-- Add index for shop_token (for queries by shop)
CREATE INDEX IF NOT EXISTS idx_pieces_manual_shop_token 
  ON pieces_manual(shop_token);

-- Add index for name (for search functionality)
CREATE INDEX IF NOT EXISTS idx_pieces_manual_name 
  ON pieces_manual(name);

-- Add index for serial_number (for search functionality)
CREATE INDEX IF NOT EXISTS idx_pieces_manual_serial_number 
  ON pieces_manual(serial_number);

-- Add composite index for shop_token + name (for filtered searches)
CREATE INDEX IF NOT EXISTS idx_pieces_manual_shop_name 
  ON pieces_manual(shop_token, name);

-- 2. ALTER PARTS TABLE
-- Add new columns: piece_id (FK to pieces_manual) and price

-- Add piece_id column (nullable for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'piece_id'
  ) THEN
    ALTER TABLE parts 
      ADD COLUMN piece_id UUID REFERENCES pieces_manual(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add price column (nullable, DECIMAL for precision)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'price'
  ) THEN
    ALTER TABLE parts 
      ADD COLUMN price DECIMAL(10, 2);
  END IF;
END $$;

-- Add index for piece_id (for lookups and FK performance)
CREATE INDEX IF NOT EXISTS idx_parts_piece_id 
  ON parts(piece_id);

-- 3. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE pieces_manual IS 'Catalog of pieces (master data) - stores piece definitions';
COMMENT ON COLUMN pieces_manual.shop_token IS 'Shop identifier - links piece to specific shop';
COMMENT ON COLUMN pieces_manual.name IS 'Piece name - searchable';
COMMENT ON COLUMN pieces_manual.part_type IS 'Type/category of piece from system variables';
COMMENT ON COLUMN pieces_manual.serial_number IS 'Optional serial number for unique identification';
COMMENT ON COLUMN pieces_manual.notes IS 'Additional notes about the piece';

COMMENT ON COLUMN parts.piece_id IS 'Foreign key to pieces_manual - links stock entry to piece catalog';
COMMENT ON COLUMN parts.price IS 'Price of the piece in stock (can vary by entry)';

-- 4. VERIFY MIGRATION
-- Check if tables and columns exist
DO $$ 
BEGIN
  -- Check pieces_manual table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pieces_manual') THEN
    RAISE NOTICE '✓ Table pieces_manual exists';
  ELSE
    RAISE EXCEPTION '✗ Table pieces_manual was not created';
  END IF;

  -- Check parts.piece_id column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'piece_id'
  ) THEN
    RAISE NOTICE '✓ Column parts.piece_id exists';
  ELSE
    RAISE EXCEPTION '✗ Column parts.piece_id was not created';
  END IF;

  -- Check parts.price column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'price'
  ) THEN
    RAISE NOTICE '✓ Column parts.price exists';
  ELSE
    RAISE EXCEPTION '✗ Column parts.price was not created';
  END IF;

  RAISE NOTICE '✓✓✓ Migration completed successfully! ✓✓✓';
END $$;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- Uncomment to rollback migration:
/*
-- Drop indexes
DROP INDEX IF EXISTS idx_pieces_manual_shop_token;
DROP INDEX IF EXISTS idx_pieces_manual_name;
DROP INDEX IF EXISTS idx_pieces_manual_serial_number;
DROP INDEX IF EXISTS idx_pieces_manual_shop_name;
DROP INDEX IF EXISTS idx_parts_piece_id;

-- Drop columns from parts
ALTER TABLE parts DROP COLUMN IF EXISTS piece_id;
ALTER TABLE parts DROP COLUMN IF EXISTS price;

-- Drop pieces_manual table
DROP TABLE IF EXISTS pieces_manual;
*/
