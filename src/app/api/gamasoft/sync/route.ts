import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

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
        throw new Error("Credenciales de Gamasoft no configuradas en el panel de Cloudflare (Variables de Entorno)");
    }

    const loginUrl = `${GAMASOFT_BASE}/usuarios/auth/${encodeURIComponent(email)}/${encodeURIComponent(password)}/0`;

    // Headers idénticos a los de SvelteKit que sí funcionaron
    const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Accept": "text/plain" },
    });

    if (!response.ok) {
        throw new Error(`Error de autenticación en Gamasoft: ${response.status}`);
    }

    const token = (await response.text()).trim();

    if (!token || token.length < 20) {
        throw new Error("Token de Gamasoft inválido o vacío");
    }

    return token;
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
            return NextResponse.json({ error: "Falta targetDate en el body" }, { status: 400 });
        }

        const email = process.env.GAMASOFT_EMAIL;
        const pass = process.env.GAMASOFT_PASSWORD;

        if (!email || !pass) {
            return NextResponse.json({ 
                error: "⚠️ VARIABLES DE ENTORNO FALTANTES EN VERCEL",
                details: "Asegúrate de que GAMASOFT_EMAIL y GAMASOFT_PASSWORD estén en Settings > Environment Variables en el panel de Vercel."
            }, { status: 500 });
        }

        console.log(`[Vercel Sync] Intentando sincronización para ${targetDate}...`);

        const token = await getGamasoftToken();
        console.log("[Gamasoft] ✅ Token obtenido");

        // 2. Consultar TODOS los artículos en un solo bloque paralelo para evitar timeouts de Vercel
        console.log(`[Gamasoft] Consultando ${ARTICULOS_CITY_U.length} artículos en ráfaga...`);

        // En Vercel no tenemos límite de 50 peticiones, así que disparamos todo de golpe
        const resultados_crudos = await Promise.all(ARTICULOS_CITY_U.map(async (art) => {
            try {
                const data = await fetchKardexArticulo(token, art.id, targetDate);
                if (data) {
                    return {
                        id: art.id,
                        nombre: art.nombre,
                        unidad: art.unidad,
                        cantidadSalidas: data.cantidadSalidas,
                        cantidadEntradas: data.cantidadEntradas,
                        cantidadInventarioInicial: data.cantidadInventarioInicial
                    };
                }
                return null;
            } catch (pErr) {
                console.error(`Error en artículo ${art.nombre}:`, pErr);
                return null;
            }
        }));

        const resultados = resultados_crudos.filter(r => r !== null);
        
        if (resultados.length === 0) {
            return NextResponse.json({ 
                error: "No se obtuvieron datos de Gamasoft. Revisa los logs de Vercel para ver si hay bloqueos de IP o credenciales inválidas.",
                code: "EMPTY_DATA" 
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            fecha: targetDate,
            totalArticulos: ARTICULOS_CITY_U.length,
            articulosConMovimiento: resultados.length,
            data: resultados
        });
    } catch (error: any) {
        console.error("Vercel Sync Error:", error);
        return NextResponse.json({ 
            error: `Error: ${error.message}`,
            details: "Si el error persiste, revisa si pusiste las variables GAMASOFT_EMAIL/PASSWORD en el panel de Vercel (Project Settings > Environment Variables)."
        }, { status: 500 });
    }
}
