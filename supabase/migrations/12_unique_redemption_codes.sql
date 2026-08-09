-- Migration 12: Unique constraint on redemption_codes.code
-- Ensures that duplicate codes cannot be inserted into the database.

-- 1. Deduplicate existing redemption codes if any exist (keep the earliest created one)
DELETE FROM redemption_codes a
USING redemption_codes b
WHERE a.id > b.id
  AND UPPER(TRIM(a.code)) = UPPER(TRIM(b.code));

-- 2. Add UNIQUE constraint on code column (case-insensitive via unique index if possible, or standard unique constraint)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'redemption_codes_code_key'
    ) THEN
        ALTER TABLE redemption_codes ADD CONSTRAINT redemption_codes_code_key UNIQUE (code);
    END IF;
END $$;
