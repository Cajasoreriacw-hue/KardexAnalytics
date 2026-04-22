-- Ejecutar en Supabase SQL Editor para completar el formato de calidad
ALTER TABLE purchase_registries
ADD COLUMN IF NOT EXISTS proveedor TEXT,
ADD COLUMN IF NOT EXISTS rotulacion_ok BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS organoleptica_ok BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS transporte_ok BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS estado_calidad TEXT DEFAULT 'APROBADO';
