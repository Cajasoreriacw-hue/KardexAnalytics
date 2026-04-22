-- Ejecutar en Supabase SQL Editor
ALTER TABLE purchase_registries
ADD COLUMN IF NOT EXISTS lote TEXT,
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE,
ADD COLUMN IF NOT EXISTS temperatura_recepcion NUMERIC;
