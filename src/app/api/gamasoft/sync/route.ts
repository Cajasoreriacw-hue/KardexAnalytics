import { NextRequest, NextResponse } from "next/server";

// Gamasoft usa un certificado SSL no estándar en su servidor gd3
// Next.js/Node rechaza la conexión sin este override
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// =====================================================
// GAMASOFT API PROXY — City U Kardex Integration
// =====================================================
// Flujo:
//   1. Autenticarse con JWT
//   2. Consultar findReporteKardexResumido por cada artículo
//   3. Devolver el consolidado de cantidadSalidas
// =====================================================

const GAMASOFT_BASE = "https://gd3.gamasoftcol.com:8443/backgama/ptigGama";

// Catálogo de artículos de City U (extraído del console.log de Gamasoft)
const ARTICULOS_CITY_U = [
    { id: 467936, nombre: "Aceitunas", unidad: "Gramo" },
    { id: 467923, nombre: "Camarones", unidad: "Unidad" },
    { id: 471173, nombre: "Cebolla Crispy", unidad: "Gramo" },
    { id: 467939, nombre: "Cebollas Caramelizadas", unidad: "Gramo" },
    { id: 471172, nombre: "Cebollin", unidad: "Gramo" },
    { id: 467937, nombre: "Champinones", unidad: "Gramo" },
    { id: 467957, nombre: "Fettuccine Monticello", unidad: "Unidad" },
    { id: 467955, nombre: "Fusilli Cocido", unidad: "Unidad" },
    { id: 467956, nombre: "Fusilli Monticello", unidad: "Unidad" },
    { id: 467922, nombre: "Jamon Serrano", unidad: "Unidad" },
    { id: 471874, nombre: "Lasagna Bolognesa y Tocineta", unidad: "Unidad" },
    { id: 472471, nombre: "Lasagna Pollo y Trilogia quesos alpina", unidad: "Unidad" },
    { id: 467943, nombre: "Lechuga Rugula", unidad: "Gramo" },
    { id: 471168, nombre: "Milky Brownie", unidad: "Unidad" },
    { id: 467940, nombre: "Mozzarella Bufala", unidad: "Gramo" },
    { id: 467930, nombre: "Pan Mini Baguette", unidad: "Unidad" },
    { id: 467954, nombre: "Pasta Cocida", unidad: "Unidad" },
    { id: 467938, nombre: "Pimentones", unidad: "Gramo" },
    { id: 467919, nombre: "Pollo", unidad: "Unidad" },
    { id: 467941, nombre: "Queso Parmesano", unidad: "Gramo" },
    { id: 467920, nombre: "Res", unidad: "Unidad" },
    { id: 467958, nombre: "Salsa Cw", unidad: "Litro" },
    { id: 467959, nombre: "Salsa Sopo", unidad: "Mililitro" },
    { id: 471169, nombre: "Tarta de Queso", unidad: "Unidad" },
    { id: 467944, nombre: "Tocineta", unidad: "Gramo" },
    { id: 467942, nombre: "Tomate Seco", unidad: "Gramo" },
    { id: 467945, nombre: "Tomates Cherry", unidad: "Gramo" },
    // Bebidas
    { id: 471170, nombre: "Cerveza Club Colombia", unidad: "Unidad" },
    { id: 467906, nombre: "Coca Cola Original 300ml", unidad: "Unidad" },
    { id: 467907, nombre: "Coca Cola Zero 300ml", unidad: "Unidad" },
    { id: 467908, nombre: "Manantial Con Gas 300ml", unidad: "Unidad" },
    { id: 467909, nombre: "Manantial Sin Gas 300ml", unidad: "Unidad" },
    { id: 467910, nombre: "Quatro Toronja 400ml", unidad: "Unidad" },
    { id: 467911, nombre: "Shweppes Ginger Ale 300ml", unidad: "Unidad" },
    { id: 467913, nombre: "Soda Hatsu Frambuesa y Rosas", unidad: "Unidad" },
    { id: 467912, nombre: "Soda Hatsu Limon y Hierbabuena", unidad: "Unidad" },
    { id: 467915, nombre: "Te Hatsu Blanco 400ml", unidad: "Unidad" },
    { id: 467914, nombre: "Te Hatsu Morado 400ml", unidad: "Unidad" }
];

// Constantes de configuración de City U en Gamasoft
const ID_PUNTO = 2568;
const ID_SITIO_ALMACENAJE = 5934; // Bodega
const ID_INVENTARIO = 864;
const FECHA_INICIAL_INVENTARIO = "2026-02-11"; // Fecha de inicio del inventario en Gamasoft

// =========================
// PASO 1: Obtener JWT Token
// =========================
async function getGamasoftToken(): Promise<string> {
    const email = process.env.GAMASOFT_EMAIL;
    const password = process.env.GAMASOFT_PASSWORD;

    if (!email || !password) {
        throw new Error("Credenciales de Gamasoft no configuradas en .env.local");
    }

    const loginUrl = `${GAMASOFT_BASE}/usuarios/auth/${encodeURIComponent(email)}/${encodeURIComponent(password)}/0`;

    const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error(`Error de autenticación en Gamasoft: ${response.status}`);
    }

    const token = await response.text();

    if (!token || token.length < 50) {
        throw new Error("Token de Gamasoft inválido o vacío");
    }

    return token.trim();
}

// ==========================================
// PASO 2: Consultar Kardex por cada artículo
// ==========================================
async function fetchKardexArticulo(
    token: string,
    idArticulo: number,
    fechaDestino: string
): Promise<{ cantidadEntradas: number; cantidadSalidas: number; cantidadInventarioInicial: number } | null> {
    const baseUrl = `${GAMASOFT_BASE}/kardex`;

    // Común para ambos payloads
    const commonPayload = {
        idArticulo,
        idInventario: ID_INVENTARIO,
        idPunto: ID_PUNTO,
        idSitioAlmacenaje: 5934,
        fechaFinal: fechaDestino,
        fechaInicial: "2026-02-11", // Fecha base que usa Gamasoft según tu captura
        fechaInicioFiltro: fechaDestino,
    };

    try {
        // 1. Obtener Cantidad Inicial usando el endpoint especializado que encontraste
        const resInicial = await fetch(`${baseUrl}/findCantidadInicialByArticulo/`, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8", "Token": token },
            body: JSON.stringify(commonPayload),
        });
        
        // 2. Obtener Movimientos (Entradas/Salidas) del día
        const resMovimientos = await fetch(`${baseUrl}/findReporteKardexResumido/`, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8", "Token": token },
            body: JSON.stringify({
                ...commonPayload,
                fechaInicial: fechaDestino, // Para movimientos solo queremos el día actual
            }),
        });

        if (!resInicial.ok || !resMovimientos.ok) return null;

        const dataInicial = await resInicial.json();
        const dataMov = await resMovimientos.json();

        // Extraer valores
        // El endpoint findCantidadInicialByArticulo suele devolver { dato: { cantidadInicial: X } }
        const inicialValue = dataInicial.dato?.cantidadInicial ?? 0;
        
        const entradas = dataMov.dato?.cantidadEntradas ?? 0;
        const salidas = dataMov.dato?.cantidadSalidas ?? 0;

        return {
            cantidadInventarioInicial: inicialValue,
            cantidadEntradas: entradas,
            cantidadSalidas: salidas,
        };
    } catch (error) {
        console.error(`Error fetching article ${idArticulo}:`, error);
        return null;
    }
}

// =========================
// HANDLER PRINCIPAL — POST
// =========================
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { targetDate } = body;

        if (!targetDate) {
            return NextResponse.json({ error: "targetDate es requerido" }, { status: 400 });
        }

        // 1. Autenticarse
        console.log("[Gamasoft] Autenticando...");
        const token = await getGamasoftToken();
        console.log("[Gamasoft] ✅ Token obtenido");

        // 2. Consultar cada artículo en paralelo (máximo 5 a la vez para no saturar)
        console.log(`[Gamasoft] Consultando ${ARTICULOS_CITY_U.length} artículos para fecha ${targetDate}...`);

        const resultados: Array<{
            id: number;
            nombre: string;
            unidad: string;
            cantidadSalidas: number;
            cantidadEntradas: number;
            cantidadInventarioInicial: number;
        }> = [];

        // Procesamos en lotes de 5 para no saturar la API de Gamasoft
        const BATCH_SIZE = 5;
        for (let i = 0; i < ARTICULOS_CITY_U.length; i += BATCH_SIZE) {
            const batch = ARTICULOS_CITY_U.slice(i, i + BATCH_SIZE);
            const promises = batch.map(async (articulo) => {
                const dato = await fetchKardexArticulo(token, articulo.id, targetDate);
                if (dato) {
                    return {
                        id: articulo.id,
                        nombre: articulo.nombre,
                        unidad: articulo.unidad,
                        cantidadSalidas: dato.cantidadSalidas,
                        cantidadEntradas: dato.cantidadEntradas,
                        cantidadInventarioInicial: dato.cantidadInventarioInicial,
                    };
                }
                return null;
            });

            const batchResults = await Promise.all(promises);
            for (const r of batchResults) {
                if (r) resultados.push(r);
            }
        }

        // 3. Filtrar solo los que tuvieron movimiento
        const conMovimiento = resultados.filter((r) => r.cantidadSalidas > 0 || r.cantidadEntradas > 0);

        console.log(`[Gamasoft] ✅ ${conMovimiento.length} artículos con movimiento de ${resultados.length} consultados`);

        return NextResponse.json({
            success: true,
            fecha: targetDate,
            totalArticulos: resultados.length,
            articulosConMovimiento: conMovimiento.length,
            data: conMovimiento,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        console.error("[Gamasoft] ❌ Error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
