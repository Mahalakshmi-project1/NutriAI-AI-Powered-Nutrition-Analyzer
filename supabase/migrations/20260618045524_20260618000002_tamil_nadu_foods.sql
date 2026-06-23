/*
# Expanded Tamil Nadu Food Database

1. New Tables
- `tamil_nadu_foods` - stores traditional Tamil Nadu cuisine with complete nutrition data
  - `id` (uuid, primary key)
  - `name` (text, English name)
  - `name_ta` (text, Tamil name)
  - `category` (text, food category)
  - `calories` (numeric per 100g or per serving)
  - `protein` (numeric, grams)
  - `carbs` (numeric, grams)
  - `fats` (numeric, grams)
  - `fiber` (numeric, grams)
  - `serving_size` (text, e.g. "1 piece", "100g")
  - `price_per_serving` (numeric, INR)
  - `description` (text, English description)
  - `description_ta` (text, Tamil description)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `tamil_nadu_foods`.
- Allow public read access (food database is intentionally shared).
- Restrict writes to authenticated users.

3. Indexes
- Index on `category` for fast filtering.
- Index on `name` for search.
*/

CREATE TABLE IF NOT EXISTS tamil_nadu_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ta TEXT,
  category TEXT NOT NULL,
  calories NUMERIC(10, 2) NOT NULL,
  protein NUMERIC(10, 2) NOT NULL,
  carbs NUMERIC(10, 2) NOT NULL,
  fats NUMERIC(10, 2) NOT NULL,
  fiber NUMERIC(10, 2) NOT NULL DEFAULT 0,
  serving_size TEXT NOT NULL,
  price_per_serving NUMERIC(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  description_ta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tamil_foods_category ON tamil_nadu_foods(category);
CREATE INDEX IF NOT EXISTS idx_tamil_foods_name ON tamil_nadu_foods(name);

ALTER TABLE tamil_nadu_foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_public_tamil_foods" ON tamil_nadu_foods;
CREATE POLICY "select_public_tamil_foods" ON tamil_nadu_foods FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_tamil_foods" ON tamil_nadu_foods;
CREATE POLICY "insert_tamil_foods" ON tamil_nadu_foods FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "update_tamil_foods" ON tamil_nadu_foods;
CREATE POLICY "update_tamil_foods" ON tamil_nadu_foods FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "delete_tamil_foods" ON tamil_nadu_foods;
CREATE POLICY "delete_tamil_foods" ON tamil_nadu_foods FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);
