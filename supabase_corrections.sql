-- =============================================
-- TABLA DE CORRECCIONES DE INVENTARIO
-- Ejecutar en Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS inventory_corrections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_daily_id UUID REFERENCES inventory_daily(id) NOT NULL,
    sede_id UUID REFERENCES sedes(id) NOT NULL,
    product_id TEXT REFERENCES products(id) NOT NULL,
    fecha DATE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('FISICO', 'ENTRADAS', 'MERMAS')),
    valor_anterior NUMERIC DEFAULT 0,
    valor_nuevo NUMERIC NOT NULL,
    motivo TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'PENDING' CHECK (estado IN ('PENDING', 'APPROVED', 'REJECTED')),
    solicitante_id UUID REFERENCES auth.users(id),
    revisor_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE inventory_corrections ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer
CREATE POLICY "read_inventory_corrections" ON inventory_corrections
    FOR SELECT TO authenticated USING (true);

-- Todos los autenticados pueden insertar (Cajeros incluidos)
CREATE POLICY "insert_inventory_corrections" ON inventory_corrections
    FOR INSERT TO authenticated WITH CHECK (true);

-- Todos pueden actualizar (Admins para aprobar/rechazar, Cajeros tal vez para cambiar estado o algo, 
-- pero aquí lo limitamos general y la UI controla, o limitamos en base de datos)
CREATE POLICY "update_inventory_corrections" ON inventory_corrections
    FOR UPDATE TO authenticated USING (true);

-- Solo ADMIN/ANALYST pueden eliminar
CREATE POLICY "delete_inventory_corrections" ON inventory_corrections
    FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('ADMIN', 'ANALYST'))
    );
