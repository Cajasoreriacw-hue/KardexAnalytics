-- =============================================
-- TABLA DE PRODUCCIONES
-- Ejecutar en Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS productions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sede_id UUID REFERENCES sedes(id) NOT NULL,
    recipe_id UUID REFERENCES recipes(id) NOT NULL,
    recipe_name TEXT NOT NULL,
    producto_terminado_id TEXT REFERENCES products(id) NOT NULL,
    producto_terminado_nombre TEXT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    cantidad_producida NUMERIC NOT NULL,
    merma_produccion NUMERIC DEFAULT 0,
    notas TEXT,
    responsable_id UUID REFERENCES auth.users(id),
    responsable_nombre TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer
CREATE POLICY "read_productions" ON productions
    FOR SELECT TO authenticated USING (true);

-- Todos los autenticados pueden insertar (incluye CASHIER)
CREATE POLICY "insert_productions" ON productions
    FOR INSERT TO authenticated WITH CHECK (true);

-- Solo ADMIN/ANALYST pueden actualizar
CREATE POLICY "update_productions" ON productions
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('ADMIN', 'ANALYST'))
    );

-- Solo ADMIN/ANALYST pueden eliminar
CREATE POLICY "delete_productions" ON productions
    FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('ADMIN', 'ANALYST'))
    );
