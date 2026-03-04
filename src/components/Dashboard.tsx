"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from "recharts";
import {
    Upload, FileSpreadsheet, AlertTriangle, TrendingDown,
    TrendingUp, Activity, CheckCircle2, PackageSearch, Users,
    X, Check, DollarSign, Box, MapPin, Loader2,
    ShoppingCart, ArrowRightLeft, ClipboardList, Plus, Search, Filter, MoreVertical,
    Printer, Trash2, ArrowUpRight, Sparkles, Send, MessageSquare, Bot, Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import Login from "./Login";
import { LogOut } from "lucide-react";

// Tipos de Roles en el Sistema
type Role = "ADMIN" | "ANALYST" | "SUPERVISOR" | "CASHIER";
type View = "DASHBOARD" | "REQUISITIONS" | "TRANSFERS" | "CATALOG" | "CONSUMPTION" | "SEDES" | "USERS";

interface Sede {
    id: string;
    nombre: string;
    ubicacion: string;
    prefijo: string;
}

interface UserAccount {
    id: string;
    nombre: string;
    email: string;
    rol: Role;
    sedeId: string; // ID de la sede asociada
}

interface Product {
    id: string;
    nombre: string;
    unidad: string;
    costoPorUnidad: number;
}

interface Requisition {
    id: string;
    articulo: string;
    cantidad: number;
    sucursal: string;
    status: 'PENDIENTE' | 'APROBADA' | 'TRANSITO' | 'ENTREGADA';
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
    fecha: string;
}

// Datos Iniciales Simulados adaptados a "Plan Cero" de Gamasoft
const defaultMockData = [
    { id: "MOCK-1", articulo: "Pollo", inicial: 50, entradas: 0, salidaVentas: 25, teorico: 25, fisico: 23, dif: -2, estado: "Fuga", costo: 1950, reportarPlanCero: true, sucursal: "Bogotá", stockIdeal: 40 },
    { id: "MOCK-2", articulo: "Res", inicial: 30, entradas: 0, salidaVentas: 9, teorico: 21, fisico: 21, dif: 0, estado: "Ok", costo: 3350, reportarPlanCero: true, sucursal: "Bogotá", stockIdeal: 25 },
    { id: "MOCK-3", articulo: "Pasta Cocida", inicial: 100, entradas: 0, salidaVentas: 57, teorico: 43, fisico: 41, dif: -2, estado: "Fuga", costo: 1525, reportarPlanCero: true, sucursal: "Bogotá", stockIdeal: 80 },
    { id: "MOCK-4", articulo: "Coca Cola", inicial: 50, entradas: 0, salidaVentas: 9, teorico: 41, fisico: 19, dif: -22, estado: "Fuga", costo: 2800, reportarPlanCero: true, sucursal: "Medellín", stockIdeal: 40 },
    { id: "MOCK-5", articulo: "Coca Zero", inicial: 50, entradas: 0, salidaVentas: 4, teorico: 46, fisico: 7, dif: -39, estado: "Fuga", costo: 2800, reportarPlanCero: false, sucursal: "Medellín", stockIdeal: 30 },
];

interface Transfer {
    id: string;
    articulo: string;
    cantidad: number;
    origen: string;
    destino: string;
    status: 'SOLICITADO' | 'EN_CAMINO' | 'RECIBIDO';
    fecha: string;
}


const mockTrendData = [
    { name: 'Lun', salidas: 400, stock: 650, fugas: 24 },
    { name: 'Mar', salidas: 300, stock: 580, fugas: 13 },
    { name: 'Mié', salidas: 550, stock: 600, fugas: 38 },
    { name: 'Jue', salidas: 480, stock: 590, fugas: 19 },
    { name: 'Vie', salidas: 600, stock: 750, fugas: 48 },
    { name: 'Sáb', salidas: 850, stock: 950, fugas: 65 },
    { name: 'Dom', salidas: 700, stock: 820, fugas: 50 },
];


export default function Dashboard() {
    const consumptionHistoryMock = [
        { name: 'Sem 1', proteina: 400, bebidas: 240, secos: 300 },
        { name: 'Sem 2', proteina: 300, bebidas: 430, secos: 200 },
        { name: 'Sem 3', proteina: 550, bebidas: 380, secos: 350 },
        { name: 'Sem 4', proteina: 480, bebidas: 290, secos: 410 },
    ];
    const [sessionUser, setSessionUser] = useState<any>(null);
    const [role, setRole] = useState<Role>("CASHIER");
    const [view, setView] = useState<View>("DASHBOARD");
    const [fileHover, setFileHover] = useState(false);

    // Estados para manejo de Inventario (Iniciamos vacíos para usar Supabase)
    const [inventoryData, setInventoryData] = useState<any[]>([]);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [detectedSucursal, setDetectedSucursal] = useState<string>("Principal");
    const [activeSucursal, setActiveSucursal] = useState<string>("Todas");

    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [catalog, setCatalog] = useState<Product[]>([]);
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [appUsers, setAppUsers] = useState<UserAccount[]>([]);

    const [isConsumptionReportOpen, setIsConsumptionReportOpen] = useState(false);
    const [consumptionPeriod, setConsumptionPeriod] = useState<"WEEKLY" | "MONTHLY">("WEEKLY");
    const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
    const [selectedPickingReq, setSelectedPickingReq] = useState<Requisition | null>(null);

    // Estado para el Bot GamaAI
    const [isBotOpen, setIsBotOpen] = useState(false);
    const [botMessages, setBotMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
        { role: 'bot', content: '¡Hola! Soy GamaAI, tu asistente inteligente de inventarios. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [botInput, setBotInput] = useState('');

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(true);

    // Persistencia de Sesión
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*, sedes(nombre)')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setSessionUser({ ...session.user, profile });
                    setRole(profile.rol as Role);
                    // Si es cajero, forzar sucursal asignada
                    if (profile.rol === "CASHIER" && profile.sedes) {
                        setActiveSucursal(profile.sedes.nombre);
                    }
                }
            }
            setIsLoading(false);
        };
        checkSession();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSessionUser(null);
        setRole("CASHIER");
    };

    // Lógica del Bot GamaAI
    const processBotResponse = (userInput: string) => {
        const input = userInput.toLowerCase();
        let response = "";
        let action: any = null;

        if (input.includes("fuga") || input.includes("resumen") || input.includes("problema")) {
            const fugas = inventoryData.filter(d => d.estado === 'Fuga');
            if (fugas.length === 0) {
                response = "¡Excelente noticia! No he detectado fugas significativas en el inventario actual para ninguna sucursal. Todo parece estar bajo control.";
            } else {
                const totalPerdida = fugas.reduce((acc, curr) => acc + (Math.abs(curr.dif) * curr.costo), 0);
                const masFugas = fugas.sort((a, b) => Math.abs(b.dif) - Math.abs(a.dif)).slice(0, 3);
                response = `He detectado ${fugas.length} artículos con fugas. Los más críticos son: ${masFugas.map(f => `${f.articulo} (${f.dif} ${f.unidad || 'und'})`).join(', ')}. La pérdida estimada total para hoy es de $${totalPerdida.toLocaleString()}.`;
            }
        } else if (input.includes("traslado") || input.includes("balanceo")) {
            // Caso 1: El usuario pide explícitamente crear un traslado para un producto
            const prodMatch = catalog.find(p => input.includes(p.nombre.toLowerCase()));

            if (input.includes("crea") || input.includes("genera") || input.includes("mover")) {
                if (prodMatch) {
                    // Intentar encontrar una sugerencia de balanceo automática para ese producto
                    const surplus = inventoryData.find(d => d.articulo.toLowerCase() === prodMatch.nombre.toLowerCase() && d.dif > 5);
                    const shortage = inventoryData.find(d => d.articulo.toLowerCase() === prodMatch.nombre.toLowerCase() && d.dif < -2);

                    if (surplus && shortage) {
                        action = {
                            type: 'CREATE_TRANSFER',
                            payload: {
                                articulo: prodMatch.nombre,
                                origen: surplus.sucursal,
                                destino: shortage.sucursal,
                                cantidad: Math.abs(shortage.dif)
                            }
                        };
                        response = `¡Entendido! Voy a crear un traslado de ${Math.abs(shortage.dif)} unidades de ${prodMatch.nombre} desde ${surplus.sucursal} hacia ${shortage.sucursal} para balancear el stock. ¿Procedo?`;
                    } else {
                        response = `Veo que quieres mover ${prodMatch.nombre}, pero no tengo datos claros de excedentes y faltantes entre sedes para este producto ahora mismo. ¿Podrías indicarme el origen y destino?`;
                    }
                } else {
                    response = "Claro, puedo ayudarte a crear un traslado. ¿De qué producto estaríamos hablando?";
                }
            } else {
                // Sugerencia proactiva (fase anterior)
                const surplusItems = inventoryData.filter(item => item.dif > 10);
                const shortageItems = inventoryData.filter(item => item.dif < -5);
                if (surplusItems.length > 0 && shortageItems.length > 0) {
                    const matching = shortageItems.find(sh => surplusItems.some(su => su.articulo === sh.articulo));
                    if (matching) {
                        const donor = surplusItems.find(su => su.articulo === matching.articulo);
                        response = `¡Oportunidad de ahorro! La sede ${matching.sucursal} tiene escasez de ${matching.articulo}, mientras que ${donor?.sucursal} tiene un exceso de +${donor?.dif}. Si quieres, puedo crearlo por ti, solo di 'Crea el traslado'.`;
                    } else {
                        response = "He analizado los excedentes, pero no hay una coincidencia directa de artículos faltantes en otras sedes para sugerir un balanceo automático.";
                    }
                } else {
                    response = "Actualmente el inventario parece estar balanceado o no hay suficientes excedentes/faltantes para realizar traslados.";
                }
            }
        } else if (input.includes("stock") || input.includes("cuánto hay") || input.includes("inventario")) {
            const totalItems = inventoryData.length;
            const itemsOk = inventoryData.filter(d => d.estado === 'Ok').length;
            response = `Hoy (${selectedDate}) tenemos ${totalItems} artículos en plataforma. ${itemsOk} están en niveles correctos.`;
        } else if (input.includes("hola") || input.includes("buenos días")) {
            response = "¡Hola! Soy GamaAI. Puedo ayudarte con el resumen de fugas, sugerencias de traslados o estado general del inventario. ¿Qué necesitas revisar?";
        } else {
            response = "Aún estoy aprendiendo a procesar esa solicitud. Por ahora puedes preguntarme: '¿Hay fugas hoy?', 'Sugiéreme traslados' o solicita 'Crea un traslado de [producto]'.";
        }

        return { response, action };
    };

    // Carga inicial de datos desde Supabase
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Obtener sesión actual para aplicar filtros por rol a nivel de carga inicial
                const { data: { session } } = await supabase.auth.getSession();
                let userProfile = null;

                if (session) {
                    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                    userProfile = data;
                }

                // 1. Cargar Sedes
                const { data: sedesData } = await supabase.from('sedes').select('*');
                if (sedesData) {
                    // FILTRO DE CAJERO: Solo cargar y permitir la sede a la que pertenece
                    if (userProfile && userProfile.rol === 'CASHIER' && userProfile.sede_id) {
                        const cajeroSede = sedesData.find(s => s.id === userProfile.sede_id);
                        if (cajeroSede) {
                            setSedes([{ id: cajeroSede.id, nombre: cajeroSede.nombre, ubicacion: cajeroSede.ubicacion, prefijo: cajeroSede.prefijo }]);
                            setActiveSucursal(cajeroSede.nombre); // Forzar que esta sea la activa
                        }
                    } else {
                        // Otros roles ven todas las sedes
                        setSedes(sedesData.map(s => ({ id: s.id, nombre: s.nombre, ubicacion: s.ubicacion, prefijo: s.prefijo })));
                    }
                }

                // 2. Cargar Perfiles de Usuario
                const { data: profilesData } = await supabase.from('profiles').select('*');
                if (profilesData) setAppUsers(profilesData.map(p => ({ id: p.id, nombre: p.nombre, email: p.email, rol: p.rol, sedeId: p.sede_id })));

                // 3. Cargar Catálogo de Productos
                const { data: productsData } = await supabase.from('products').select('*');
                if (productsData) setCatalog(productsData.map(p => ({ id: p.id, nombre: p.nombre, unidad: p.unidad, costoPorUnidad: Number(p.costo_unitario) })));

                // 4. Cargar Inventario Diario Filtrado por Fecha (Ejemplo para hoy)
                const { data: inventoryDataRaw } = await supabase
                    .from('inventory_daily')
                    .select('*, products(nombre, unidad)')
                    .eq('fecha', selectedDate);

                if (inventoryDataRaw) {
                    const formatted = inventoryDataRaw.map(item => ({
                        id: item.id,
                        articulo: item.products.nombre,
                        inicial: item.inicial,
                        entradas: item.entradas,
                        salidaVentas: item.salidas_ventas,
                        teorico: (item.inicial + item.entradas - item.salidas_ventas),
                        fisico: item.fisico,
                        dif: item.fisico - (item.inicial + item.entradas - item.salidas_ventas),
                        estado: (item.fisico - (item.inicial + item.entradas - item.salidas_ventas)) < 0 ? 'Fuga' : 'Ok',
                        costo: item.costo_en_fecha,
                        reportarPlanCero: item.reportar_plan_cero,
                        sucursal: sedesData?.find(s => s.id === item.sede_id)?.nombre || 'Principal'
                    }));
                    setInventoryData(formatted);
                }

                // 5. Requisiciones
                const { data: reqsData } = await supabase.from('requisitions').select('*, products(nombre), sedes(nombre)');
                if (reqsData) setRequisitions(reqsData.map(r => ({
                    id: r.id,
                    articulo: r.products?.nombre || 'Desconocido',
                    cantidad: r.cantidad,
                    sucursal: r.sedes?.nombre || 'General',
                    status: r.status,
                    prioridad: r.prioridad,
                    fecha: r.fecha
                })));

                // 6. Traslados
                const { data: transData } = await supabase.from('transfers').select('*, products(nombre), origen:sedes!origen_id(nombre), destino:sedes!destino_id(nombre)');
                if (transData) setTransfers(transData.map(t => ({
                    id: t.id,
                    articulo: t.products?.nombre || 'Desconocido',
                    cantidad: t.cantidad,
                    origen: t.origen?.nombre || 'Desconocido',
                    destino: t.destino?.nombre || 'Desconocido',
                    status: t.status,
                    fecha: t.fecha
                })));

            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [selectedDate]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Listado Unico de Sucursales (Basado en el maestro de sedes registrado)
    const sucursalesDisponibles = Array.from(new Set(sedes.map(s => s.nombre)));
    const filteredData = activeSucursal === "Todas" ? inventoryData : inventoryData.filter(d => d.sucursal === activeSucursal);

    // Funciones de KPIs Reales basadas en el estado actual (usando datos filtrados por sucursal)
    const totalFugas = filteredData.filter(d => d.dif < 0).reduce((acc, curr) => acc + (Math.abs(curr.dif) * curr.costo), 0);
    const totalAhorros = filteredData.filter(d => d.dif > 0).reduce((acc, curr) => acc + (curr.dif * curr.costo), 0);
    const totalSalidas = filteredData.reduce((acc, curr) => acc + curr.salidaVentas, 0);
    const totalFugasUnd = filteredData.filter(d => d.dif < 0).reduce((acc, curr) => acc + Math.abs(curr.dif), 0);
    const totalAhorrosUnd = filteredData.filter(d => d.dif > 0).reduce((acc, curr) => acc + curr.dif, 0);

    // Permisos
    const canUploadExcel = ["ADMIN", "ANALYST"].includes(role);
    const canViewFinancialMertics = ["ADMIN", "ANALYST"].includes(role);
    const canGenerateRequisitions = ["ADMIN", "SUPERVISOR"].includes(role);
    // Cajeros y supervisores pueden editar el inventario físico (para contar)
    const canEditPhysical = ["ADMIN", "SUPERVISOR", "ANALYST"].includes(role);
    const canSelectForReport = ["ADMIN", "ANALYST"].includes(role);
    const isSimpleView = role === "CASHIER";

    // Función Central de Procesamiento de Excel
    const processExcelFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0]; // Toma la primera pestaña
            const worksheet = workbook.Sheets[sheetName];

            // Convierte a matriz para ubicar los encabezados fácilmente
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            let headerRowIdx = -1;
            let detectedSucursal = "Principal";

            for (let i = 0; i < Math.min(15, data.length); i++) {
                const row = data[i];
                if (!row) continue;

                // Intenta encontrar la sucursal buscando "Punto"
                const puntoIdx = row.findIndex(c => typeof c === 'string' && c.toLowerCase().includes('punto'));
                if (puntoIdx !== -1 && row.length > puntoIdx + 1 && typeof row[puntoIdx + 1] === 'string') {
                    const branch = row[puntoIdx + 1].trim();
                    detectedSucursal = branch;
                    setDetectedSucursal(branch);
                }

                // Busca una fila que contenga la palabra "Articulo" o "Artículo" para marcar los headers
                if (row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('art') && cell.toLowerCase().includes('culo'))) {
                    headerRowIdx = i;
                }
            }

            if (headerRowIdx === -1) {
                alert("Formato Incorrecto: No se encontró la columna 'Artículo' en el reporte.");
                return;
            }

            const headers = data[headerRowIdx].map(h => typeof h === 'string' ? h.toLowerCase() : '');
            const rows = data.slice(headerRowIdx + 1);

            // Mapear índices de las columnas Gamasoft
            const idxArticulo = headers.findIndex((h: string) => h.includes("art"));
            const idxInicial = headers.findIndex((h: string) => h.includes("inicial"));
            const idxSalidas = headers.findIndex((h: string) => h.includes("salida por venta") && !h.includes("seleccion"));
            const idxTeorico = headers.findIndex((h: string) => h.includes("final"));

            const parsedData = rows
                .filter(r => r[idxArticulo]) // Excluir filas vacías
                .map((row, index) => {
                    const inicial = Number(row[idxInicial]) || 0;
                    const salidas = Number(row[idxSalidas]) || 0;
                    const teorico = Number(row[idxTeorico]) || 0;

                    // Por defecto al importar, asumimos que el Físico es igual al Teórico 
                    // (Hasta que el operador haga el conteo manual en el dashboard)
                    const fisico = teorico;
                    const dif = fisico - teorico;
                    const estado = dif < 0 ? "Fuga" : dif > 0 ? "Ahorro" : "Ok";

                    // Buscar costo y unidad en el catálogo
                    const catalogItem = catalog.find(p => p.nombre.toLowerCase() === row[idxArticulo]?.toString().toLowerCase());
                    const costo = catalogItem ? catalogItem.costoPorUnidad : (Math.floor(Math.random() * 4000) + 1500);
                    const unidad = catalogItem ? catalogItem.unidad : "UND";

                    return {
                        id: `${detectedSucursal}-${index}-${Date.now()}`,
                        articulo: row[idxArticulo],
                        inicial,
                        salidaVentas: salidas,
                        teorico,
                        fisico,
                        dif,
                        estado,
                        costo,
                        unidad,
                        reportarPlanCero: false,
                        sucursal: detectedSucursal,
                        stockIdeal: Math.floor(teorico * 1.5) // Sugerencia base: 50% extra del teórico actual
                    };
                });

            // Lanzar modal de Preview en vez de sobreescribir inmediatamente
            setPreviewData(parsedData);
            setFileHover(false);
            // Limpiar input
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsBinaryString(file);
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setFileHover(true); };
    const handleDragLeave = () => setFileHover(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setFileHover(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processExcelFile(e.dataTransfer.files[0]);
        }
    };

    // Función para manejar la actualización en vivo del conteo Físico
    const updateFisico = (id: string | number, newValue: string) => {
        setInventoryData(prev => prev.map(item => {
            if (item.id === id) {
                let fisicoNum = 0;
                if (newValue !== "") {
                    fisicoNum = Number(newValue);
                }
                const newDif = fisicoNum - item.teorico;
                const newEstado = newDif < 0 ? "Fuga" : newDif > 0 ? "Ahorro" : "Ok";
                return { ...item, fisico: newValue === "" ? "" : fisicoNum, dif: newDif, estado: newEstado };
            }
            return item;
        }));
    };

    const savePhysicalCounts = async () => {
        setIsLoading(true);
        try {
            const updates = inventoryData.map(item => ({
                id: item.id, // Esto asume que el ID es el UUID de Supabase si se cargó de ahí
                fisico: Number(item.fisico) || 0,
                reportar_plan_cero: item.reportarPlanCero
            })).filter(u => typeof u.id === 'string' && u.id.includes('-')); // Filtro básico para IDs de Supabase vs Mock/Excel temporal

            const { error } = await supabase
                .from('inventory_daily')
                .upsert(updates, { onConflict: 'id' });

            if (error) throw error;
            alert("¡Conteo físico guardado exitosamente!");
        } catch (err) {
            console.error("Error guardando conteo:", err);
            alert("Error al guardar el conteo. Verifica la conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    // Función para seleccionar qué mandar a Plan Cero
    const toggleReportar = (id: string | number) => {
        setInventoryData(prev => prev.map(item => item.id === id ? { ...item, reportarPlanCero: !item.reportarPlanCero } : item));
    };

    if (!sessionUser && !isLoading) {
        return <Login onLogin={(user) => {
            setSessionUser(user);
            setRole(user.profile.rol as Role);
            if (user.profile.rol === "CASHIER" && user.profile.sedes) {
                setActiveSucursal(user.profile.sedes.nombre);
            }
        }} />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
                <Loader2 className="size-10 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div id="dashboard-root" className="min-h-screen bg-[#06080A] text-slate-300 font-sans selection:bg-cyan-900 selection:text-white relative flex">

            {/* Sidebar de Navegación */}
            <aside className="w-64 bg-[#0A0D14] border-r border-white/5 flex flex-col sticky top-0 h-screen hidden lg:flex">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-slate-950">
                            <Activity size={20} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight leading-none">Kardex <span className="text-cyan-400 font-light">Analytics</span></h1>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => setView("DASHBOARD")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "DASHBOARD" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Box size={18} /> Dashboard General
                        </button>
                        <button
                            onClick={() => setView("REQUISITIONS")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "REQUISITIONS" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <ShoppingCart size={18} /> Requisiciones
                        </button>
                        <button
                            onClick={() => setView("TRANSFERS")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "TRANSFERS" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <ArrowRightLeft size={18} /> Traslados
                        </button>
                        {["ADMIN", "ANALYST"].includes(role) && (
                            <button
                                onClick={() => setView("CONSUMPTION")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                    view === "CONSUMPTION" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <TrendingUp size={18} /> Análisis de Consumo
                            </button>
                        )}
                        {["ADMIN", "ANALYST"].includes(role) && (
                            <button
                                onClick={() => setView("CATALOG")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                    view === "CATALOG" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <ClipboardList size={18} /> Catálogo Maestro
                            </button>
                        )}
                        {role === "ADMIN" && (
                            <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                                <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Configuración</p>
                                <button
                                    onClick={() => setView("SEDES")}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        view === "SEDES" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <MapPin size={18} /> Gestión de Sedes
                                </button>
                                <button
                                    onClick={() => setView("USERS")}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        view === "USERS" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Users size={18} /> Gestión de Usuarios
                                </button>
                            </div>
                        )}
                    </nav>
                </div>

                <div className="mt-auto p-6 space-y-4">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-white/5">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Usuario Activo</p>
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold uppercase">
                                {sessionUser?.profile?.nombre?.[0] || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-none capitalize truncate max-w-[120px]">{sessionUser?.profile?.nombre || 'Usuario'}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{role}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                    <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-[0.2em]">v1.0.4 Premium</p>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Premium / Nav */}
                <header className="sticky top-0 z-50 bg-[#0A0D14]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-white capitalize">
                            {view.toLowerCase()} <span className="text-slate-500 text-sm font-normal">| {activeSucursal}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Selector de Fecha (Cargue Diario) */}
                        <div className="flex items-center gap-2 bg-[#111622] px-4 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
                            <Activity size={14} className="text-cyan-400 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mr-2">Cargue Diario</span>
                            <input
                                type="date"
                                className="bg-transparent text-sm text-white font-bold focus:outline-none border-none cursor-pointer [color-scheme:dark]"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        {/* Filtro de Sucursal */}
                        {sucursalesDisponibles.length > 0 && (
                            <div className={cn(
                                "flex items-center gap-2 bg-[#111622] px-3 py-1.5 rounded-full border border-white/5 shadow-inner",
                                role === "CASHIER" && "opacity-60 grayscale"
                            )}>
                                <MapPin size={16} className="text-cyan-500" />
                                <select
                                    className={cn(
                                        "bg-transparent text-sm text-slate-300 font-medium focus:outline-none focus:ring-0 border-none appearance-none cursor-pointer pr-4",
                                        role === "CASHIER" && "pointer-events-none"
                                    )}
                                    value={activeSucursal}
                                    onChange={(e) => setActiveSucursal(e.target.value)}
                                    disabled={role === "CASHIER"}
                                >
                                    {role !== "CASHIER" && <option value="Todas" className="bg-slate-900">Todas las Sucursales</option>}
                                    {sucursalesDisponibles.map(sucursal => (
                                        <option key={sucursal} value={sucursal} className="bg-slate-900">{sucursal}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Perfil de Usuario Actual */}
                        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-white uppercase tracking-tight">{sessionUser?.profile?.nombre || 'Iniciado'}</p>
                                <p className="text-[9px] font-bold text-cyan-500 uppercase">{role}</p>
                            </div>
                            <div className="size-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/10">
                                {sessionUser?.profile?.nombre?.[0] || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {view === "DASHBOARD" && (
                        <div className="space-y-8 max-w-[1600px] mx-auto">
                            {/* Area de Carga de Excel (Solo Admin y Analista) */}
                            {canUploadExcel && (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "relative h-48 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group overflow-hidden",
                                        fileHover ? "border-cyan-400 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.1)]" : "border-white/10 hover:border-white/20 bg-white/5"
                                    )}
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])} />
                                    <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/5 group-hover:scale-110 transition-transform shadow-xl">
                                        <Upload className={cn("size-8 transition-colors", fileHover ? "text-cyan-400" : "text-slate-400")} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">Haz click o Arrastra tu Kardex Excel aquí</p>
                                        <p className="text-sm text-slate-500">Gamasoft Export compatible (.xlsx)</p>
                                    </div>
                                </div>
                            )}

                            {/* Resumen de KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {!isSimpleView && (
                                    <>
                                        <KPICard title="Total Unidades Vendidas" value={totalSalidas} icon={<ShoppingCart size={20} />} color="cyan" trend="+12.5%" trendUp={true} />
                                        <KPICard title="Fiabilidad Inventario" value={`${((totalSalidas / (totalSalidas + totalFugasUnd)) * 100).toFixed(1)}%`} icon={<Activity size={20} />} color="emerald" trend="vs Nivel Óptimo" trendUp={true} />
                                    </>
                                )}

                                {canViewFinancialMertics && (
                                    <>
                                        <KPICard title="Pérdida por Fugas" value={`$${totalFugas.toLocaleString("es-CO")}`} icon={<AlertTriangle size={20} />} color="rose" trend="Inventario Físico Inferior" trendUp={false} alert={totalFugas > 0} />
                                        <KPICard title="Valor de Ahorro" value={`$${totalAhorros.toLocaleString("es-CO")}`} icon={<TrendingUp size={20} />} color="emerald" trend="Inventario Físico Superior" trendUp={true} />
                                    </>
                                )}
                            </div>

                            {/* Dashboards Visuales */}
                            {!isSimpleView && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-[#0A0D14]/80 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl">
                                        <h3 className="text-slate-100 font-semibold mb-6 flex items-center gap-2">
                                            <ClipboardList size={18} className="text-cyan-400" /> Relación Ventas vs Stock
                                        </h3>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={mockTrendData}>
                                                    <defs>
                                                        <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis hide />
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                                                    <Area type="monotone" dataKey="stock" stroke="#06b6d4" fillOpacity={1} fill="url(#colorStock)" strokeWidth={3} name="Stock Disponible" />
                                                    <Area type="monotone" dataKey="salidas" stroke="#10b981" fillOpacity={1} fill="url(#colorSalidas)" strokeWidth={3} name="Unidades Vendidas" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-[#0A0D14]/80 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl">
                                        <h3 className="text-slate-100 font-semibold mb-6 flex items-center gap-2">
                                            <TrendingDown size={18} className="text-emerald-400" /> Comparativo Físico/Bodega vs Teórico/Sistema
                                        </h3>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={filteredData.slice(0, 10)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                    <XAxis dataKey="articulo" tick={false} axisLine={false} />
                                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                    <Tooltip
                                                        cursor={{ fill: '#1e293b' }}
                                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                                    />
                                                    <Bar dataKey="teorico" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Inv. Teórico (Sistema)" />
                                                    <Bar dataKey="fisico" fill="#10b981" radius={[4, 4, 0, 0]} name="Inv. Físico (Bodega)" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tabla de Resultados Inteligente y Evaluable */}
                            {!isSimpleView && (
                                <div className="bg-[#0A0D14]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl overflow-hidden mt-4">
                                    <div className="p-5 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                        <div>
                                            <h3 className="text-slate-100 font-semibold flex items-center gap-2">
                                                <PackageSearch size={18} className="text-slate-400" />
                                                Matriz de Control y Cuadre de Inventario
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">Edita el valor de la columna <b>"Físico Real"</b> para calcular automáticamente las fugas/ahorros</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={savePhysicalCounts}
                                                disabled={inventoryData.length === 0}
                                                className="disabled:opacity-50 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-black transition-all shadow-lg flex items-center gap-2"
                                            >
                                                <Check size={16} /> GUARDAR CONTEO FISICO
                                            </button>
                                            {canGenerateRequisitions && (
                                                <button disabled={inventoryData.length === 0} className="disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                                    Exportar Reporte
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        {filteredData.length === 0 ? (
                                            <div className="p-10 text-center flex flex-col items-center justify-center text-slate-500">
                                                <FileSpreadsheet className="size-10 mb-2 opacity-50" />
                                                <p>No hay datos cargados en el sistema para esta sucursal.</p>
                                                <p className="text-sm">Sube tu primer Kardex de Gamasoft.</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-[#111622] text-slate-400">
                                                    <tr>
                                                        <th className="px-6 py-4 font-medium">Articulo</th>
                                                        <th className="px-6 py-4 font-medium text-right">Inv. Inicial</th>
                                                        <th className="px-6 py-4 font-medium text-right">Salida Ventas</th>
                                                        <th className="px-6 py-4 font-medium text-right border-x border-white/5 bg-[#181f2f]/50 text-cyan-400">Teórico Gamasoft</th>
                                                        <th className="px-6 py-4 font-medium text-right bg-emerald-950/20 text-emerald-400 border-cyan-900 shadow-[inset_0_4px_10px_rgba(16,185,129,0.05)]">Físico Real (Editar)</th>
                                                        <th className="px-6 py-4 font-medium text-right">Diferencia</th>
                                                        <th className="px-6 py-4 font-medium text-center border-r border-white/5">Estado de Control</th>
                                                        {canSelectForReport && <th className="px-6 py-4 font-medium text-center text-amber-500 bg-amber-950/10">A Reporte Cajero</th>}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-slate-300">
                                                    {filteredData.map((row) => (
                                                        <tr key={row.id} className="hover:bg-[#111622] transition-colors group">
                                                            <td className="px-6 py-4 font-medium text-slate-200">{row.articulo}</td>
                                                            <td className="px-6 py-4 text-right">{row.inicial}</td>
                                                            <td className="px-6 py-4 text-right text-amber-500">{row.salidaVentas}</td>
                                                            <td className="px-6 py-4 text-right font-bold text-cyan-400 border-x border-white/5 bg-[#181f2f]/30">{row.teorico}</td>
                                                            {/* Celda Editable para el Inventario Físico */}
                                                            <td className="px-4 py-2 text-right bg-emerald-950/10 border-r border-white/5">
                                                                <input
                                                                    type="number"
                                                                    disabled={!canEditPhysical}
                                                                    value={row.fisico}
                                                                    onChange={(e) => updateFisico(row.id, e.target.value)}
                                                                    className={cn(
                                                                        "w-24 bg-emerald-950/40 border text-emerald-400 font-bold px-3 py-1.5 rounded text-right focus:outline-none focus:border-emerald-400 transition-colors shadow-inner",
                                                                        !canEditPhysical ? "border-transparent opacity-70" : "border-emerald-500/30 hover:border-emerald-500/50"
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className={cn(
                                                                    "px-2 py-1 rounded-md font-bold text-sm",
                                                                    row.dif < 0 ? "text-rose-400 bg-rose-400/10 border border-rose-400/20" :
                                                                        row.dif > 0 ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" : "text-slate-400"
                                                                )}>
                                                                    {row.dif > 0 ? '+' : ''}{row.dif}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className={cn(
                                                                    "inline-flex items-center justify-center min-w-[80px] gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
                                                                    row.estado === 'Fuga' ? "border-rose-500/30 text-rose-400 bg-rose-500/10" :
                                                                        row.estado === 'Ahorro' ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-slate-700 text-slate-400 bg-slate-800"
                                                                )}>
                                                                    {row.estado === 'Fuga' && <AlertTriangle size={12} />}
                                                                    {row.estado === 'Ahorro' && <TrendingUp size={12} />}
                                                                    {row.estado === 'Ok' && <CheckCircle2 size={12} />}
                                                                    {row.estado}
                                                                </div>
                                                            </td>
                                                            {canSelectForReport && (
                                                                <td className="px-6 py-4 text-center bg-amber-950/5">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={row.reportarPlanCero}
                                                                        onChange={() => toggleReportar(row.id)}
                                                                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 accent-amber-500 cursor-pointer"
                                                                    />
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Vista Interactiva de Cajero */}
                            {isSimpleView && (
                                <CashierVisualReport inventoryData={filteredData} />
                            )}
                        </div>
                    )}

                    {view === "REQUISITIONS" && (
                        <RequisitionsPanel
                            requisitions={requisitions}
                            inventoryData={inventoryData}
                            sucursales={sucursalesDisponibles}
                            activeSucursal={activeSucursal}
                            role={role}
                            onAdd={() => setIsNewReqModalOpen(true)}
                            onUpdateStatus={async (id: string, newStatus: Requisition['status']) => {
                                await supabase.from('requisitions').update({ status: newStatus }).eq('id', id);
                                setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
                            }}
                            onPrint={(req: Requisition) => setSelectedPickingReq(req)}
                            onDelete={async (id: string) => {
                                await supabase.from('requisitions').delete().eq('id', id);
                                setRequisitions(prev => prev.filter(r => r.id !== id));
                            }}
                        />
                    )}

                    {view === "TRANSFERS" && (
                        <TransfersPanel
                            transfers={transfers}
                            inventoryData={inventoryData}
                            onAddTransfer={async (t) => {
                                // Buscar IDs técnicos en el catálogo y sedes
                                const prod = catalog.find(p => p.nombre.toLowerCase() === t.articulo.toLowerCase());
                                const sourceSede = sedes.find(s => s.nombre.toLowerCase() === t.origen.toLowerCase());
                                const targetSede = sedes.find(s => s.nombre.toLowerCase() === t.destino.toLowerCase());

                                if (prod && sourceSede && targetSede) {
                                    const { data: newTr, error } = await supabase.from('transfers').insert([{
                                        product_id: prod.id,
                                        cantidad: t.cantidad,
                                        origen_id: sourceSede.id,
                                        destino_id: targetSede.id,
                                        status: 'SOLICITADO',
                                        fecha: new Date().toISOString().split('T')[0]
                                    }]).select('*, products(nombre), origen:sedes!origen_id(nombre), destino:sedes!destino_id(nombre)');

                                    if (newTr) {
                                        const formatted = {
                                            id: newTr[0].id,
                                            articulo: newTr[0].products?.nombre || 'Desconocido',
                                            cantidad: newTr[0].cantidad,
                                            origen: newTr[0].origen?.nombre || 'Desconocido',
                                            destino: newTr[0].destino?.nombre || 'Desconocido',
                                            status: newTr[0].status,
                                            fecha: newTr[0].fecha
                                        };
                                        setTransfers(prev => [...prev, formatted]);
                                    }
                                    if (error) console.error("Error al crear traslado:", error);
                                } else {
                                    alert("Error: No se pudo mapear el producto o las sedes para el traslado.");
                                }
                            }}
                        />
                    )}

                    {isNewReqModalOpen && (
                        <NewRequisitionModal
                            isOpen={isNewReqModalOpen}
                            onClose={() => setIsNewReqModalOpen(false)}
                            inventoryData={inventoryData}
                            activeSucursal={activeSucursal}
                            onSave={async (req: any) => {
                                const prod = catalog.find(p => p.nombre.toLowerCase() === req.articulo.toLowerCase());
                                const targetSede = sedes.find(s => s.nombre.toLowerCase() === req.sucursal.toLowerCase());

                                if (prod && targetSede) {
                                    const { data: newR, error } = await supabase.from('requisitions').insert([{
                                        product_id: prod.id,
                                        cantidad: req.cantidad,
                                        sede_id: targetSede.id,
                                        prioridad: req.prioridad || 'MEDIA',
                                        status: 'PENDIENTE',
                                        fecha: new Date().toISOString().split('T')[0]
                                    }]).select('*, products(nombre), sedes(nombre)');

                                    if (newR) {
                                        setRequisitions(prev => [...prev, {
                                            id: newR[0].id,
                                            articulo: newR[0].products?.nombre || 'Desconocido',
                                            cantidad: newR[0].cantidad,
                                            sucursal: newR[0].sedes?.nombre || 'General',
                                            status: newR[0].status,
                                            prioridad: newR[0].prioridad,
                                            fecha: newR[0].fecha
                                        }]);
                                    }
                                    if (error) console.error("Error al crear requisición:", error);
                                } else {
                                    alert("Error: Producto o sede no encontrados para la requisición.");
                                }
                                setIsNewReqModalOpen(false);
                            }}
                        />
                    )}

                    {/* Botón Flotante GamaAI */}
                    <button
                        onClick={() => setIsBotOpen(true)}
                        className="fixed bottom-8 right-8 z-[60] size-16 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all group animate-bounce-subtle"
                    >
                        <Bot size={28} className="group-hover:rotate-12 transition-transform" />
                        <div className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-[#0A0D14]" />
                    </button>

                    {/* Ventana de GamaAI */}
                    {isBotOpen && (
                        <GamaAIBot
                            messages={botMessages}
                            onClose={() => setIsBotOpen(false)}
                            onSend={(msg: string) => {
                                setBotMessages(prev => [...prev, { role: 'user', content: msg }]);

                                // Respuesta Proactiva basada en Datos Reales
                                setTimeout(async () => {
                                    const { response, action } = processBotResponse(msg);

                                    setBotMessages(prev => [...prev, {
                                        role: 'bot',
                                        content: response
                                    }]);

                                    // Ejecutar Acción si existe
                                    if (action && action.type === 'CREATE_TRANSFER') {
                                        const { payload } = action;
                                        const prod = catalog.find(p => p.nombre.toLowerCase() === payload.articulo.toLowerCase());
                                        const sourceSede = sedes.find(s => s.nombre.toLowerCase() === payload.origen.toLowerCase());
                                        const targetSede = sedes.find(s => s.nombre.toLowerCase() === payload.destino.toLowerCase());

                                        if (prod && sourceSede && targetSede) {
                                            const { data: newTr } = await supabase.from('transfers').insert([{
                                                product_id: prod.id,
                                                cantidad: payload.cantidad,
                                                origen_id: sourceSede.id,
                                                destino_id: targetSede.id,
                                                status: 'SOLICITADO',
                                                fecha: selectedDate
                                            }]).select('*, products(nombre), origen:sedes!origen_id(nombre), destino:sedes!destino_id(nombre)');

                                            if (newTr) {
                                                const formatted = {
                                                    id: newTr[0].id,
                                                    articulo: newTr[0].products?.nombre || 'Desconocido',
                                                    cantidad: newTr[0].cantidad,
                                                    origen: newTr[0].origen?.nombre || 'Desconocido',
                                                    destino: newTr[0].destino?.nombre || 'Desconocido',
                                                    status: newTr[0].status,
                                                    fecha: newTr[0].fecha
                                                };
                                                setTransfers(prev => [...prev, formatted]);
                                                setBotMessages(prev => [...prev, {
                                                    role: 'bot',
                                                    content: `✅ ¡Listo! He generado el traslado con éxito. Puedes verlo ahora en la sección de Traslados.`
                                                }]);
                                            }
                                        }
                                    }
                                }, 800);
                            }}
                        />
                    )}
                    {selectedPickingReq && (
                        <PickingListModal
                            req={selectedPickingReq}
                            onClose={() => setSelectedPickingReq(null)}
                        />
                    )}
                    {previewData && (
                        <ExcelPreviewModal
                            data={previewData}
                            detectedSucursal={detectedSucursal}
                            onClose={() => setPreviewData(null)}
                            onConfirm={async (data) => {
                                setIsLoading(true);
                                try {
                                    // 1. Asegurar que la sede existe en Supabase o encontrar su ID
                                    let sedeId = sedes.find(s => s.nombre.toLowerCase().includes(detectedSucursal.toLowerCase()))?.id;

                                    if (!sedeId) {
                                        // Si no existe, la creamos con datos genéricos o el nombre detectado
                                        const { data: newSede, error: sedeError } = await supabase
                                            .from('sedes')
                                            .insert([{ nombre: detectedSucursal, prefijo: detectedSucursal.substring(0, 3).toUpperCase() }])
                                            .select();

                                        if (newSede) {
                                            sedeId = newSede[0].id;
                                            setSedes(prev => [...prev, newSede[0]]);
                                        }
                                    }

                                    if (!sedeId) throw new Error("No se pudo determinar la sede para el cargue.");

                                    // 2. Verificar productos faltantes en el catálogo y agregarlos automáticamente
                                    const missingProductsFromExcel = data.filter(item =>
                                        !catalog.some(p => p.nombre.toLowerCase() === item.articulo.toLowerCase())
                                    );

                                    if (missingProductsFromExcel.length > 0) {
                                        const newProductsToInsert = missingProductsFromExcel.map((p, i) => ({
                                            id: `P-AUTO-${Date.now()}-${i}`,
                                            nombre: p.articulo,
                                            unidad: 'UND',
                                            costo_unitario: p.costo || 0
                                        }));

                                        const { data: createdProducts, error: prodError } = await supabase
                                            .from('products')
                                            .insert(newProductsToInsert)
                                            .select();

                                        if (createdProducts) {
                                            const formatted = createdProducts.map(p => ({
                                                id: p.id,
                                                nombre: p.nombre,
                                                unidad: p.unidad,
                                                costoPorUnidad: Number(p.costo_unitario)
                                            }));
                                            setCatalog(prev => [...prev, ...formatted]);
                                            // Actualizar lista local para que el mapeo siguiente funcione
                                            catalog.push(...formatted);
                                        }
                                        if (prodError) console.error("Error auto-creando productos:", prodError);
                                    }

                                    // 3. Preparar el lote de insert/upsert
                                    const batch = data.map(item => {
                                        const product = catalog.find(p => p.nombre.toLowerCase() === item.articulo.toLowerCase());
                                        if (!product) return null;

                                        return {
                                            product_id: product.id,
                                            sede_id: sedeId,
                                            fecha: selectedDate,
                                            inicial: item.inicial || 0,
                                            entradas: item.entradas || 0,
                                            salidas_ventas: item.salidaVentas || 0,
                                            fisico: item.fisico || 0,
                                            costo_en_fecha: product.costoPorUnidad,
                                            reportar_plan_cero: true
                                        };
                                    }).filter(Boolean);

                                    // 4. Ejecutar Upsert masivo en Supabase
                                    const { data: savedInventory, error: upsertError } = await supabase
                                        .from('inventory_daily')
                                        .upsert(batch, { onConflict: 'product_id, sede_id, fecha' })
                                        .select();

                                    if (upsertError) throw upsertError;

                                    // 5. Actualizar estado local con los IDs reales de la base de datos
                                    if (savedInventory) {
                                        const formatted = savedInventory.map(item => {
                                            const prod = catalog.find(p => p.id === item.product_id);
                                            return {
                                                id: item.id,
                                                articulo: prod?.nombre || 'Desconocido',
                                                inicial: item.inicial,
                                                entradas: item.entradas,
                                                salidaVentas: item.salidas_ventas,
                                                teorico: (item.inicial + item.entradas - item.salidas_ventas),
                                                fisico: item.fisico,
                                                dif: item.fisico - (item.inicial + item.entradas - item.salidas_ventas),
                                                estado: (item.fisico - (item.inicial + item.entradas - item.salidas_ventas)) < 0 ? 'Fuga' : 'Ok',
                                                costo: item.costo_en_fecha,
                                                reportarPlanCero: item.reportar_plan_cero,
                                                sucursal: detectedSucursal
                                            };
                                        });
                                        setInventoryData(prev => [...prev.filter(item => item.sucursal !== detectedSucursal), ...formatted]);
                                    }

                                    setPreviewData(null);
                                    alert(`¡Éxito! Se han procesado ${batch.length} artículos para ${detectedSucursal}.`);

                                } catch (err) {
                                    console.error("Error en cargue masivo:", err);
                                    alert("Error al procesar el cargue masivo.");
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                        />
                    )}
                    {view === "CATALOG" && (
                        <CatalogPanel
                            catalog={catalog}
                            onUpdateCatalog={async (updatedCatalog) => {
                                // Para el catálogo, asumimos que estamos agregando un nuevo item
                                // En una implementación real más compleja, podríamos hacer un upsert
                                const newItem = updatedCatalog[updatedCatalog.length - 1];
                                const { error } = await supabase.from('products').insert([{
                                    id: newItem.id,
                                    nombre: newItem.nombre,
                                    unidad: newItem.unidad,
                                    costo_unitario: newItem.costoPorUnidad
                                }]);
                                if (!error) setCatalog(updatedCatalog);
                                else console.error("Error updating catalog:", error);
                            }}
                        />
                    )}
                    {view === "CONSUMPTION" && (
                        <ConsumptionPanel
                            inventoryData={inventoryData}
                            activeSucursal={activeSucursal}
                            period={consumptionPeriod}
                            setPeriod={setConsumptionPeriod}
                            onOpenReport={() => setIsConsumptionReportOpen(true)}
                        />
                    )}

                    {view === "SEDES" && (
                        <SedesPanel
                            sedes={sedes}
                            onAdd={async (newSede) => {
                                const { data, error } = await supabase.from('sedes').insert([newSede]).select();
                                if (data) setSedes([...sedes, data[0]]);
                                if (error) console.error("Error adding sede:", error);
                            }}
                        />
                    )}

                    {view === "USERS" && (
                        <UsersPanel
                            users={appUsers}
                            sedes={sedes}
                            onAdd={async (newUser) => {
                                setIsLoading(true);
                                try {
                                    // 1. Crear usuario en Auth de Supabase
                                    const { data: authData, error: authError } = await supabase.auth.signUp({
                                        email: newUser.email,
                                        password: newUser.password,
                                        options: {
                                            data: {
                                                nombre: newUser.nombre,
                                            }
                                        }
                                    });

                                    if (authError) throw authError;

                                    if (authData.user) {
                                        // 2. Insertar perfil extendido (El trigger de DB puede hacerlo, pero lo forzamos por seguridad)
                                        const { error: profileError } = await supabase.from('profiles').upsert([{
                                            id: authData.user.id,
                                            nombre: newUser.nombre,
                                            email: newUser.email,
                                            rol: newUser.rol,
                                            sede_id: newUser.sedeId || null
                                        }]);

                                        if (profileError) throw profileError;

                                        setAppUsers(prev => [...prev, {
                                            id: authData.user!.id,
                                            nombre: newUser.nombre,
                                            email: newUser.email,
                                            rol: newUser.rol as Role,
                                            sedeId: newUser.sedeId
                                        }]);

                                        alert(`Usuario ${newUser.nombre} creado exitosamente. Se ha enviado un correo de confirmación.`);
                                    }
                                } catch (err: any) {
                                    console.error("Error creating user:", err);
                                    alert(`Error: ${err.message}`);
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                        />
                    )}
                </main>
            </div>

            {/* Modales Globales */}
            {isConsumptionReportOpen && (
                <FinancialReportModal
                    data={inventoryData.filter(item => activeSucursal === "Todas" || item.sucursal === activeSucursal)}
                    activeSucursal={activeSucursal}
                    period={consumptionPeriod}
                    history={consumptionHistoryMock}
                    onClose={() => setIsConsumptionReportOpen(false)}
                />
            )}
        </div>
    );
}

function RequisitionsPanel({
    requisitions,
    inventoryData,
    sucursales,
    activeSucursal,
    role,
    onAdd,
    onUpdateStatus,
    onPrint,
    onDelete
}: {
    requisitions: Requisition[],
    inventoryData: any[],
    sucursales: string[],
    activeSucursal: string,
    role: Role,
    onAdd: () => void,
    onUpdateStatus: (id: string, status: Requisition['status']) => void,
    onPrint: (req: Requisition) => void,
    onDelete: (id: string) => void
}) {
    const statuses: Requisition['status'][] = ['PENDIENTE', 'APROBADA', 'TRANSITO', 'ENTREGADA'];

    // Alertas de stock bajo para la sucursal activa
    const lowStockItems = inventoryData.filter(item =>
        (activeSucursal === "Todas" || item.sucursal === activeSucursal) &&
        (Number(item.fisico) || 0) < (item.stockIdeal * 0.3)
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white">Centro de Requisiciones</h2>
                    <p className="text-slate-500 mt-1">Gestiona el flujo de mercancía entre puntos de venta y bodega central.</p>
                </div>
                {["ADMIN", "SUPERVISOR"].includes(role) && (
                    <button
                        onClick={onAdd}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-2"
                    >
                        <Plus size={18} /> Nueva Requisición
                    </button>
                )}
            </div>

            {lowStockItems.length > 0 && (
                <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400">
                    <AlertTriangle className="shrink-0" />
                    <div>
                        <p className="font-bold text-sm">Sugerencia Inteligente:</p>
                        <p className="text-xs">Hay {lowStockItems.length} artículos con stock crítico. Se recomienda generar requisiciones urgentes.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statuses.map(status => (
                    <div key={status} className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className={cn(
                                    "size-2 rounded-full",
                                    status === 'PENDIENTE' ? "bg-amber-500" :
                                        status === 'APROBADA' ? "bg-cyan-500" :
                                            status === 'TRANSITO' ? "bg-emerald-500" : "bg-slate-500"
                                )}></span>
                                {status}
                            </h3>
                            <span className="text-[10px] bg-white/5 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                {requisitions.filter(r => r.status === status && (activeSucursal === "Todas" || r.sucursal === activeSucursal)).length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {requisitions.filter(r => r.status === status && (activeSucursal === "Todas" || r.sucursal === activeSucursal)).map(req => (
                                <div key={req.id} className="bg-[#0A0D14]/80 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-xl hover:border-cyan-500/30 transition-all group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-1 rounded ring-1 ring-white/5">{req.id}</span>
                                        <div className="flex gap-1">
                                            {status === 'PENDIENTE' && ["ADMIN", "ANALYST"].includes(role) && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => onUpdateStatus(req.id, 'APROBADA')}
                                                        className="p-1 hover:text-emerald-400 transition-colors" title="Aprobar"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(req.id)}
                                                        className="p-1 hover:text-rose-400 transition-colors" title="Rechazar"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            {status === 'APROBADA' && ["ADMIN", "ANALYST"].includes(role) && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => onUpdateStatus(req.id, 'TRANSITO')}
                                                        className="p-1 hover:text-cyan-400 transition-colors" title="Despachar"
                                                    >
                                                        <Box size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onPrint(req)}
                                                        className="p-1 hover:text-amber-400 transition-colors" title="Descargar Picking List"
                                                    >
                                                        <FileSpreadsheet size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            {status === 'TRANSITO' && (role === "SUPERVISOR" || role === "ADMIN") && (
                                                <button
                                                    onClick={() => onUpdateStatus(req.id, 'ENTREGADA')}
                                                    className="p-1 hover:text-emerald-400 transition-colors" title="Confirmar Entrega"
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                            )}
                                            {status === 'PENDIENTE' && (role === "ADMIN" || (role === "SUPERVISOR" && req.status === 'PENDIENTE')) && (
                                                <button
                                                    onClick={() => onDelete(req.id)}
                                                    className="p-1 hover:text-rose-400 transition-colors" title="Eliminar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-100 mb-1">{req.articulo}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                        <MapPin size={12} className="text-cyan-500" /> {req.sucursal}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">Cantidad:</span>
                                            <span className="text-sm font-black text-white">{req.cantidad}</span>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-1 rounded-full",
                                            req.prioridad === 'ALTA' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                                req.prioridad === 'MEDIA' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                    "bg-slate-800 text-slate-500"
                                        )}>
                                            {req.prioridad}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TransfersPanel({ transfers, inventoryData, onAddTransfer }: { transfers: Transfer[], inventoryData: any[], onAddTransfer?: (t: any) => void }) {
    // Buscar items con exceso en una sucursal y falta en otra
    const surplusItems = inventoryData.filter(item => item.dif > 10);
    const shortageItems = inventoryData.filter(item => item.dif < -5);

    const balancingSuggestions = shortageItems.map(short => {
        const surplus = surplusItems.find(sur => sur.articulo === short.articulo);
        if (surplus) {
            return {
                articulo: short.articulo,
                cantidad: Math.min(Math.abs(short.dif), surplus.dif),
                origen: surplus.sucursal,
                destino: short.sucursal
            };
        }
        return null;
    }).filter(Boolean);

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white">Traslados Inter-Sucursales</h2>
                <p className="text-slate-500 mt-1">Balanceo de inventario basado en excedentes de otros puntos.</p>
            </div>

            {balancingSuggestions.length > 0 && (
                <div className="mb-8 space-y-4">
                    <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} /> Sugerencias de Balanceo (Ahorra Compras)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {balancingSuggestions.map((s: any, idx) => (
                            <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex flex-col gap-3 group hover:border-emerald-500/40 transition-all">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-white">{s.articulo}</span>
                                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{s.cantidad} Und</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span className="truncate">{s.origen}</span>
                                    <ArrowRightLeft size={12} className="shrink-0 text-emerald-500" />
                                    <span className="truncate">{s.destino}</span>
                                </div>
                                <button
                                    onClick={() => onAddTransfer && onAddTransfer(s)}
                                    className="mt-2 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-[10px] font-black rounded-lg transition-all"
                                >
                                    CREAR TRASLADO DIRECTO
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-[#0A0D14]/80 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#111622] text-slate-400 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 font-bold">ID</th>
                            <th className="px-6 py-4 font-bold">Artículo</th>
                            <th className="px-6 py-4 font-bold">Cantidad</th>
                            <th className="px-6 py-4 font-bold">Origen</th>
                            <th className="px-6 py-4 font-bold text-center">
                                <ArrowRightLeft size={16} className="inline mx-auto" />
                            </th>
                            <th className="px-6 py-4 font-bold">Destino</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                        {transfers.map(tr => (
                            <tr key={tr.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-500 text-xs">{tr.id}</td>
                                <td className="px-6 py-4 font-bold text-white">{tr.articulo}</td>
                                <td className="px-6 py-4 font-black text-cyan-400">{tr.cantidad}</td>
                                <td className="px-6 py-4">{tr.origen}</td>
                                <td className="px-6 py-4 text-center text-slate-600">
                                    <ArrowRightLeft size={14} />
                                </td>
                                <td className="px-6 py-4">{tr.destino}</td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black",
                                        tr.status === 'SOLICITADO' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                            tr.status === 'EN_CAMINO' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                                                "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    )}>
                                        {tr.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function NewRequisitionModal({ isOpen, onClose, inventoryData, activeSucursal, onSave }: any) {
    const sucursalTarget = activeSucursal === "Todas" ? "Bogotá" : activeSucursal;

    // Sugerencias inteligentes: solo items de la sucursal que necesitan stock
    const suggestions = inventoryData
        .filter((item: any) => item.sucursal === sucursalTarget)
        .map((item: any) => ({
            ...item,
            suggestedCount: Math.max(0, item.stockIdeal - (Number(item.fisico) || 0))
        }))
        .filter((item: any) => item.suggestedCount > 0)
        .sort((a: any, b: any) => b.suggestedCount - a.suggestedCount);

    const [formData, setFormData] = useState({
        articulo: '',
        cantidad: 0,
        sucursal: sucursalTarget,
        prioridad: 'MEDIA' as any
    });

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-[#0A0D14] border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
                {/* Panel lateral de sugerencias */}
                <div className="w-full md:w-80 bg-[#0D121C] p-6 border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto max-h-[400px] md:max-h-[600px]">
                    <h3 className="text-white font-black flex items-center gap-2 mb-6">
                        <Activity size={18} className="text-cyan-400" />
                        Smart Ordering
                    </h3>
                    <div className="space-y-3">
                        {suggestions.map((s: any) => (
                            <button
                                key={s.id}
                                onClick={() => setFormData({ ...formData, articulo: s.articulo, cantidad: s.suggestedCount, prioridad: s.suggestedCount > s.stockIdeal * 0.5 ? 'ALTA' : 'MEDIA' })}
                                className="w-full p-4 rounded-2xl bg-[#111622] border border-white/5 hover:border-cyan-500/30 text-left transition-all group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-slate-300">{s.articulo}</span>
                                    <Plus size={12} className="text-slate-600 group-hover:text-cyan-400" />
                                </div>
                                <p className="text-sm font-black text-cyan-400">Sugiere: {s.suggestedCount} Und</p>
                                <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500" style={{ width: `${Math.min((s.suggestedCount / s.stockIdeal) * 100, 100)}%` }}></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Formulario principal */}
                <div className="flex-1 p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-white">Nueva Requisición</h2>
                            <p className="text-slate-500 text-sm">Completa los detalles de la solicitud para {sucursalTarget}.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 relative">
                                <label className="text-xs font-bold text-slate-500 uppercase">Artículo / Producto</label>
                                <input
                                    type="text"
                                    value={formData.articulo}
                                    onChange={(e) => setFormData({ ...formData, articulo: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                                    placeholder="Nombre del artículo"
                                />
                                {/* Alerta de disponibilidad en otras sucursales */}
                                {formData.articulo && inventoryData.some((item: any) => item.articulo.toLowerCase().includes(formData.articulo.toLowerCase()) && item.sucursal !== sucursalTarget && item.dif > 0) && (
                                    <div className="absolute top-full left-0 right-0 z-10 mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in slide-in-from-top-2">
                                        <p className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                            <ArrowRightLeft size={10} /> DISPONIBLE PARA TRASLADO
                                        </p>
                                        <p className="text-[9px] text-emerald-400/70">
                                            {inventoryData.filter((item: any) => item.articulo.toLowerCase().includes(formData.articulo.toLowerCase()) && item.sucursal !== sucursalTarget && item.dif > 0).map((i: any) => `${i.sucursal} tiene ${i.dif} und de sobra`).join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Cantidad Solicitada</label>
                                <input
                                    type="number"
                                    value={formData.cantidad}
                                    onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Prioridad del Pedido</label>
                            <div className="flex gap-4">
                                {['BAJA', 'MEDIA', 'ALTA'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setFormData({ ...formData, prioridad: p as any })}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl border text-xs font-black transition-all",
                                            formData.prioridad === p
                                                ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                                                : "bg-[#0D121C] border-white/5 text-slate-500 hover:border-white/20"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => onSave({ ...formData, status: 'PENDIENTE' })}
                                className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                            >
                                Enviar Requisición
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



function CashierVisualReport({ inventoryData }: { inventoryData: any[] }) {
    // Calculo financiero al estilo Plan Cero, solo incluyendo los items marcados por administrador
    const data = inventoryData.filter(row => row.reportarPlanCero).map(row => {
        const fugaUnits = row.teorico - (Number(row.fisico) || 0); // Fuga positiva = faltante
        const costoLoss = fugaUnits > 0 ? fugaUnits * row.costo : 0;
        return { ...row, fugaUnits, costoLoss };
    });

    const hasData = data.length > 0;
    const totalFugas = data.reduce((acc, r) => acc + (r.fugaUnits > 0 ? r.fugaUnits : 0), 0);
    const totalCostoPerdido = data.reduce((acc, r) => acc + r.costoLoss, 0);

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center p-16 bg-[#0A0D14]/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/5 mt-4">
                <Box className="size-20 text-slate-700 mb-6" />
                <h2 className="text-2xl font-bold text-slate-200 text-center">No hay reportes activos</h2>
                <p className="text-slate-500 text-center mt-2 max-w-sm">El área de inventarios aún no ha aprobado la revisión operativa para tu turno actual.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-4">
            {/* Banner Superior de Resumen (Engaging and Visual) */}
            <div className={cn(
                "p-8 rounded-3xl shadow-2xl border flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md",
                totalFugas > 0 ? "bg-rose-950/20 border-rose-500/20" : "bg-emerald-950/20 border-emerald-500/20"
            )}>
                <div className="flex items-center gap-5">
                    <div className={cn(
                        "p-4 rounded-full shadow-inner",
                        totalFugas > 0 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                        {totalFugas > 0 ? <AlertTriangle size={36} /> : <CheckCircle2 size={36} />}
                    </div>
                    <div>
                        <h2 className={cn("text-2xl font-black tracking-tight", totalFugas > 0 ? "text-rose-400" : "text-emerald-400")}>
                            {totalFugas > 0 ? `🚨 ¡Atención! Faltan ${totalFugas} unidades en la bodega` : "✅ Cuadre Perfecto"}
                        </h2>
                        <p className={cn("text-sm font-medium mt-1", totalFugas > 0 ? "text-rose-400/70" : "text-emerald-400/70")}>
                            Resultados comparativos del sistema Gamasoft vs Conteo Físico
                        </p>
                    </div>
                </div>
                {totalFugas > 0 && (
                    <div className="bg-[#0A0D14]/80 px-6 py-4 rounded-2xl shadow-sm border border-rose-500/20 flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Impacto Financiero Calculado</span>
                        <div className="flex items-center gap-1 text-rose-400 font-black text-3xl">
                            <DollarSign size={24} />
                            {totalCostoPerdido.toLocaleString("es-CO")}
                        </div>
                    </div>
                )}
            </div>

            {/* Grid de Tarjetas de Productos Reportados */}
            <h3 className="text-xl font-bold text-slate-200 px-2 mt-8 mb-4">Detalle de Discrepancias Reportadas:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.map(item => {
                    const hasLoss = item.fugaUnits > 0;
                    const hasGain = item.fugaUnits < 0;

                    return (
                        <div key={item.id} className="bg-[#0A0D14]/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5 flex flex-col relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">

                            {/* Color Bar at the top of card */}
                            <div className={cn(
                                "absolute top-0 inset-x-0 h-1.5",
                                hasLoss ? "bg-rose-500" : hasGain ? "bg-emerald-500" : "bg-slate-600"
                            )}></div>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-xl font-black text-slate-100">{item.articulo}</h4>
                                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Ref Gamasoft #{item.id}</p>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold border",
                                    hasLoss ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                        hasGain ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                                )}>
                                    {hasLoss ? "Faltante" : hasGain ? "Sobrante" : "Cuadrado"}
                                </div>
                            </div>

                            {/* Comparison Graphic */}
                            <div className="flex items-center justify-between mb-6 bg-[#111622] rounded-xl p-4 border border-white/5">
                                <div className="text-center flex-1">
                                    <p className="text-xs font-semibold text-slate-500 mb-1">El Sistema Esperaba</p>
                                    <p className="text-3xl font-black text-cyan-400">{item.teorico}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase">Teórico</p>
                                </div>
                                <div className="text-slate-600 px-4 font-bold">VS</div>
                                <div className="text-center flex-1">
                                    <p className="text-xs font-semibold text-slate-500 mb-1">Se Contaron Realmente</p>
                                    <p className={cn(
                                        "text-3xl font-black",
                                        hasLoss ? "text-rose-400" : hasGain ? "text-emerald-400" : "text-slate-300"
                                    )}>{item.fisico}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase">Físico</p>
                                </div>
                            </div>

                            {/* Visual Progress Bar to show the gap */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-slate-500">Nivel de Precisión</span>
                                    <span className={hasLoss ? "text-rose-400" : "text-emerald-400"}>
                                        {item.fisico} de {item.teorico}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-[#181f2f] rounded-full overflow-hidden flex">
                                    <div
                                        className={cn("h-full transition-all duration-1000 ease-out", hasLoss ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]")}
                                        style={{ width: `${Math.min((item.fisico / item.teorico) * 100, 100).toFixed(0)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Impacto Message */}
                            <div className="mt-auto">
                                {hasLoss ? (
                                    <div className="bg-rose-950/30 text-rose-300 p-3 rounded-xl border border-rose-500/20 text-sm font-medium flex gap-2">
                                        <AlertTriangle size={18} className="shrink-0 text-rose-500 mt-0.5" />
                                        <span>Oops! Hacen falta <b>{item.fugaUnits}</b> unidades. Esto equivale a una pérdida de <b>${item.costoLoss.toLocaleString('es-CO')}</b>.</span>
                                    </div>
                                ) : hasGain ? (
                                    <div className="bg-emerald-950/30 text-emerald-300 p-3 rounded-xl border border-emerald-500/20 text-sm font-medium flex gap-2">
                                        <TrendingUp size={18} className="shrink-0 text-emerald-500 mt-0.5" />
                                        <span>Tienes <b>{Math.abs(item.fugaUnits)}</b> unidades extra en bodega.</span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-800/50 text-slate-300 p-3 rounded-xl border border-white/5 text-sm font-medium flex gap-2 justify-center">
                                        <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                                        <span>Cantidades exactas. ¡Buen trabajo!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ExcelPreviewModal({ data, detectedSucursal, onClose, onConfirm }: { data: any[], detectedSucursal: string, onClose: () => void, onConfirm: (data: any[]) => void }) {
    return (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-[#0A0D14] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-transparent">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <FileSpreadsheet className="text-cyan-400" /> Previsualización de Carga
                            </h2>
                            <p className="text-slate-400 text-sm">Validación de datos detectados en Gamasoft</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={24} className="text-slate-500" />
                        </button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                            <MapPin size={16} className="text-cyan-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase">Sede Detectada:</span>
                            <span className="text-sm font-black text-cyan-400">{detectedSucursal}</span>
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                            <Box size={16} className="text-emerald-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase">Productos:</span>
                            <span className="text-sm font-black text-emerald-400">{data.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-0">
                    <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[#0A0D14] py-4 border-b border-white/5 text-slate-500">
                            <tr>
                                <th className="py-4 font-black uppercase tracking-widest text-left">Artículo</th>
                                <th className="py-4 font-black uppercase tracking-widest text-right">Inicial</th>
                                <th className="py-4 font-black uppercase tracking-widest text-right">Ventas</th>
                                <th className="py-4 font-black uppercase tracking-widest text-right">Teórico</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.slice(0, 50).map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-bold text-slate-200">{row.articulo}</td>
                                    <td className="py-4 text-right text-slate-400">{row.inicial}</td>
                                    <td className="py-4 text-right text-amber-500 font-bold">{row.salidaVentas}</td>
                                    <td className="py-4 text-right text-cyan-400 font-black">{row.teorico}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {data.length > 50 && (
                        <p className="text-center py-6 text-slate-600 font-medium italic">... y {data.length - 50} artículos más</p>
                    )}
                </div>

                <div className="p-8 border-t border-white/5 bg-[#080B12]/80 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={() => onConfirm(data)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-[0_10px_30px_rgba(34,211,238,0.2)] flex items-center gap-2"
                    >
                        <Check size={18} /> CONFIRMAR Y CARGAR SEDE
                    </button>
                </div>
            </div>
        </div>
    );
}

function ConsumptionPanel({ inventoryData, activeSucursal, period, setPeriod, onOpenReport }: {
    inventoryData: any[],
    activeSucursal: string,
    period: "WEEKLY" | "MONTHLY",
    setPeriod: (p: "WEEKLY" | "MONTHLY") => void,
    onOpenReport: () => void
}) {
    const topProducts = [...inventoryData]
        .filter(item => activeSucursal === "Todas" || item.sucursal === activeSucursal)
        .sort((a, b) => b.salidaVentas - a.salidaVentas)
        .slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Análisis de Consumo Operativo</h2>
                    <p className="text-slate-500 text-sm font-medium italic">Reportes de rotación y tendencias para optimización de compras</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 mr-4">
                        <button
                            onClick={() => setPeriod("WEEKLY")}
                            className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", period === "WEEKLY" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white")}
                        >
                            SEMANAL
                        </button>
                        <button
                            onClick={() => setPeriod("MONTHLY")}
                            className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", period === "MONTHLY" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white")}
                        >
                            MENSUAL
                        </button>
                    </div>

                    <button
                        onClick={onOpenReport}
                        className="bg-white text-slate-950 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-cyan-400 transition-all shadow-xl"
                    >
                        <TrendingUp size={16} /> GENERAR REPORTE JUNTA
                    </button>
                </div>
            </div>

            {/* Grid de Análisis Superior */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Ranking de Rotación */}
                <div className="bg-[#0A0D14]/80 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-400" /> Top 5 Alta Rotación
                    </h3>
                    <div className="space-y-6 flex-1">
                        {topProducts.map((product, idx) => (
                            <div key={product.id} className="relative">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-slate-200">{product.articulo}</span>
                                    <span className="text-xs font-black text-emerald-400">{product.salidaVentas} UND</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                                        style={{ width: `${(product.salidaVentas / topProducts[0].salidaVentas) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Sugerencia de Abastecimiento:</p>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">Considerar aumento de stock de seguridad para <b>{topProducts[0]?.articulo}</b> por alta demanda.</p>
                    </div>
                </div>

                {/* Gráfico de Tendencia */}
                <div className="xl:col-span-2 bg-[#0A0D14]/80 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity size={16} className="text-cyan-400" /> Tendencia de Consumo Histórico
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: 'Sem 1', proteina: 400, bebidas: 240, secos: 300 },
                                { name: 'Sem 2', proteina: 300, bebidas: 430, secos: 200 },
                                { name: 'Sem 3', proteina: 550, bebidas: 380, secos: 350 },
                                { name: 'Sem 4', proteina: 480, bebidas: 290, secos: 410 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorProteina" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#475569" />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0A0D14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="proteina" stroke="#22d3ee" fillOpacity={1} fill="url(#colorProteina)" name="Proteínas" />
                                <Area type="monotone" dataKey="bebidas" stroke="#10b981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" name="Bebidas" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tabla Detallada de Consumo */}
            <div className="bg-[#0A0D14]/80 backdrop-blur-md rounded-3xl border border-white/5 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Reporte Detallado por Item: {activeSucursal}</h3>
                    <button className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                        <FileSpreadsheet size={16} /> EXPORTAR REPORTE
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-8 py-4">Artículo</th>
                                <th className="px-8 py-4 text-center">Consumo (Salidas)</th>
                                <th className="px-8 py-4 text-right">Costo Unitario</th>
                                <th className="px-8 py-4 text-right">Costo Total Periodo</th>
                                <th className="px-8 py-4 text-center">Nivel de Rotación</th>
                                <th className="px-8 py-4 text-center">Ult. Movimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {inventoryData
                                .filter(item => activeSucursal === "Todas" || item.sucursal === activeSucursal)
                                .map(item => {
                                    const rotationStatus = item.salidaVentas > 30 ? "ALTA" : item.salidaVentas > 15 ? "MEDIA" : "BAJA";
                                    return (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-4 font-bold text-slate-200">{item.articulo}</td>
                                            <td className="px-8 py-4 text-center">
                                                <span className="text-lg font-black text-white">{item.salidaVentas}</span>
                                                <span className="text-[10px] text-slate-500 ml-1 uppercase font-bold">{item.unidad || 'UND'}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right font-medium text-slate-500">
                                                ${item.costo.toLocaleString('es-CO')}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black text-white">${(item.salidaVentas * item.costo).toLocaleString('es-CO')}</span>
                                                    <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-tighter">Impacto en Caja</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black",
                                                    rotationStatus === "ALTA" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                        rotationStatus === "MEDIA" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                            "bg-slate-800 text-slate-500"
                                                )}>
                                                    {rotationStatus}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-center text-[10px] font-bold text-slate-500">
                                                HACE 2 HORAS
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function FinancialReportModal({ data, activeSucursal, period, history, onClose }: {
    data: any[],
    activeSucursal: string,
    period: string,
    history: any[],
    onClose: () => void
}) {
    const totalCosto = data.reduce((acc, curr) => acc + (curr.salidaVentas * curr.costo), 0);
    const topRotation = [...data].sort((a, b) => b.salidaVentas - a.salidaVentas).slice(0, 5);
    const totalItems = data.length;

    return (
        <div id="report-modal-overlay" className="fixed inset-0 z-[160] bg-[#020406]/98 backdrop-blur-3xl flex items-center justify-center p-0 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl w-full my-auto animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-6 no-print px-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-xl tracking-tight leading-none uppercase">Reporte Operativo de Alto Nivel</h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Inteligencia de Negocios · Gamasoft</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="group relative overflow-hidden bg-white text-slate-950 px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Printer size={18} /> GENERAR DOCUMENTO OFICIAL
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 p-3.5 rounded-2xl border border-white/5 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div id="financial-report" className="bg-[#fcfdfd] text-slate-900 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden font-sans border border-white/10 print:m-0 print:rounded-none print:shadow-none min-h-[11in] relative print:block print:w-[210mm] print:bg-white report-container">
                    <div className="relative h-2 bg-gradient-to-r from-cyan-600 via-slate-900 to-emerald-600 no-print"></div>

                    <div className="p-10 md:p-20 relative print:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-md mb-6">
                                    Confidencial · Junta Directiva
                                </div>
                                <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-4">
                                    ANÁLISIS DE <span className="text-slate-400">CONSUMO</span> <br />Y GESTIÓN <span className="text-cyan-600 underline decoration-4 underline-offset-8">FINANCIERA</span>
                                </h1>
                                <p className="text-lg font-medium text-slate-500 max-w-md leading-relaxed">
                                    Auditoría detallada de rotación de inventarios y flujo de activos operativos para la toma de decisiones estratégicas.
                                </p>

                                <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidad de Negocio</p>
                                        <p className="text-xl font-bold text-slate-900">{activeSucursal}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Periodo de Análisis</p>
                                        <p className="text-xl font-bold text-slate-900">{period === 'WEEKLY' ? 'Semana Actual' : 'Consolidado Mensual'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-auto">
                                <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group min-w-[320px] print:p-8 print:min-w-0 print:w-full">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Activity size={80} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.4em] mb-4 opacity-60">Valorización de Consumo</p>
                                    <p className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4">
                                        ${totalCosto.toLocaleString('es-CO')}
                                    </p>
                                    <div className="h-1 w-24 bg-cyan-500 rounded-full mb-6 print:mb-4"></div>
                                    <p className="text-sm font-medium text-slate-400 leading-snug">
                                        Impacto neto de salidas valorizadas según catálogo maestro de costos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="report-stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 my-12 md:my-16 relative z-10 print:my-8">
                            {[
                                { label: 'Eficiencia / Ítem', val: `$${(totalCosto / totalItems || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`, desc: 'Costo operacional p/u' },
                                { label: 'Artículos Activos', val: totalItems, desc: 'Referencias auditadas' },
                                { label: 'Concentración', val: '82.4%', desc: 'Pareto (Consumo)' },
                                { label: 'Salud Financiera', val: 'A+', desc: 'Fiabilidad' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-[1.5rem] print:p-4">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                    <p className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{stat.val}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">{stat.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mb-12 relative z-10 page-break-inside-avoid">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-2 bg-cyan-600 rounded-full"></div>
                                <h3 className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-slate-900 italic">Análisis de Tendencias Operativas</h3>
                                <div className="flex-1 h-px bg-slate-100"></div>
                            </div>
                            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] w-full shadow-sm print:h-[280px] print:p-4 chart-print-box" style={{ height: '350px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} stroke="#94a3b8" />
                                        <YAxis fontSize={9} axisLine={false} tickLine={false} stroke="#94a3b8" />
                                        <Area type="monotone" dataKey="proteina" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#reportGrad)" isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="mb-12 relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="size-2 bg-cyan-600 rounded-full"></div>
                                <h3 className="text-lg font-black uppercase tracking-[0.2em] text-slate-900 italic">Desglose de Artículos de Mayor Impacto</h3>
                                <div className="flex-1 h-px bg-slate-100"></div>
                            </div>
                            <div className="rounded-[1.5rem] border border-slate-100 overflow-hidden bg-white/50 print:border-slate-200">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 text-white text-left print:bg-slate-800">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Artículo</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Rotación</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Monto</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {topRotation.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4">
                                                    <p className="font-black text-lg text-slate-900">{item.articulo}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Ref: {item.id}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-black text-[10px]">
                                                        <ArrowUpRight size={12} /> {item.salidaVentas}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-xl text-slate-900">
                                                    ${(item.salidaVentas * item.costo).toLocaleString('es-CO')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-bold text-[10px]">
                                                        {((item.salidaVentas * item.costo / totalCosto) * 100).toFixed(1)}%
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t-2 border-slate-900 relative z-10 page-break-inside-avoid print:pt-8 action-plan-section">
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                                    <ClipboardList size={16} className="text-cyan-600" /> Observaciones del Auditor
                                </h4>
                                <div className="space-y-4">
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                        1. Concentración crítica en <b>{topRotation[0]?.articulo}</b>. Es vital diversificar proveedores.
                                    </p>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                        2. La sede <b>{activeSucursal}</b> mantiene niveles de desperdicio óptimos (3.5%).
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                                    <TrendingUp size={16} className="text-emerald-600" /> Plan de Acción Propuesto
                                </h4>
                                <div className="bg-slate-900 text-white p-6 rounded-[1.5rem] plan-box">
                                    <p className="text-xs opacity-80 mb-4">Pedidos automáticos inteligentes (Smart Orders):</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-xl font-mono text-[10px] text-cyan-400">APROBACIÓN: AUTO</div>
                                        <div className="bg-white/5 p-3 rounded-xl font-mono text-[10px] text-emerald-400">STOCK SUGERIDO: +12%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-24 pt-10 border-t border-slate-50 text-center relative z-10 no-print">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Gamasoft Cloud Solutions · 2026</p>
                        </div>
                    </div>
                </div>

                <style>{`
                    @media print {
                        @page { size: A4 portrait; margin: 10mm; }
                        html, body {
                            background: white !important;
                            height: auto !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            font-size: 10pt !important;
                            -webkit-print-color-adjust: exact !important;
                        }
                        #dashboard-root > aside, 
                        #dashboard-root > div:not(#report-modal-overlay),
                        .no-print { display: none !important; }
                        #report-modal-overlay {
                            display: block !important;
                            position: static !important;
                            width: 100% !important;
                            background: white !important;
                            padding: 0 !important;
                        }
                        #financial-report {
                            display: block !important;
                            width: 100% !important;
                            box-shadow: none !important;
                            border: none !important;
                            background: white !important;
                            color: #000 !important;
                        }
                        svg { width: 12pt !important; height: 12pt !important; display: inline-block !important; }
                        .report-stats-grid { 
                            display: flex !important; flex-direction: row !important; 
                            justify-content: space-between !important; gap: 10pt !important; 
                        }
                        .report-stats-grid > div { 
                            flex: 1 !important; padding: 10pt !important; 
                            border: 0.5pt solid #e2e8f0 !important; border-radius: 8pt !important; 
                            background: #f8fafc !important;
                        }
                        .chart-print-box { 
                            height: 250px !important; 
                            min-height: 250px !important; 
                            display: block !important;
                            overflow: visible !important;
                        }
                        .recharts-responsive-container { height: 250px !important; min-height: 250px !important; width: 100% !important; }
                        .page-break-inside-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
                        .action-plan-section { margin-top: 20pt !important; }
                        .plan-box { background-color: #0f172a !important; color: white !important; }
                        table { width: 100% !important; border-spacing: 0 !important; }
                        th { background-color: #0f172a !important; color: white !important; padding: 6pt !important; font-size: 8pt !important; }
                        td { padding: 6pt !important; border-bottom: 0.5pt solid #f1f5f9 !important; }
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                `}</style>
            </div>
        </div>
    );
}


function CatalogPanel({ catalog, onUpdateCatalog }: { catalog: Product[], onUpdateCatalog: (c: Product[]) => void }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ nombre: "", unidad: "UND", costoPorUnidad: 0 });

    const filteredCatalog = catalog.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAdd = () => {
        if (!newProduct.nombre) return;
        const fresh = { ...newProduct, id: `P${catalog.length + 1}` };
        onUpdateCatalog([...catalog, fresh]);
        setNewProduct({ nombre: "", unidad: "UND", costoPorUnidad: 0 });
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Catálogo Maestro de Productos</h2>
                    <p className="text-slate-500 text-sm font-medium">Define nombres, unidades y costos base para el cuadre financiero</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center gap-2"
                >
                    <Plus size={18} /> AGREGAR PRODUCTO
                </button>
            </div>

            <div className="bg-[#0A0D14]/80 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">Cod</th>
                                <th className="px-8 py-5">Nombre del Producto</th>
                                <th className="px-8 py-5">Unidad</th>
                                <th className="px-8 py-5 text-right">Costo Unitario (Sugerido)</th>
                                <th className="px-8 py-5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCatalog.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5 text-xs font-mono text-slate-500">{item.id}</td>
                                    <td className="px-8 py-5 font-bold text-slate-100">{item.nombre}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black uppercase">
                                            {item.unidad}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-cyan-400">
                                        ${item.costoPorUnidad.toLocaleString('es-CO')}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center">
                                            <button className="p-2 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg transition-colors text-slate-500">
                                                <Filter size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <div className="bg-[#0A0D14] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
                        <h3 className="text-xl font-black text-white mb-6">Nuevo Producto Maestro</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Nombre del Artículo (Igual al Excel)</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    placeholder="Ej: Pollo, Coca Cola..."
                                    value={newProduct.nombre}
                                    onChange={e => setNewProduct({ ...newProduct, nombre: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Unidad de Medida</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        value={newProduct.unidad}
                                        onChange={e => setNewProduct({ ...newProduct, unidad: e.target.value })}
                                    >
                                        <option value="UND" className="bg-slate-900">Unidad (UND)</option>
                                        <option value="KG" className="bg-slate-900">Kilogramo (KG)</option>
                                        <option value="GR" className="bg-slate-900">Gramo (GR)</option>
                                        <option value="PORC" className="bg-slate-900">Porción (PORC)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Costo Sugerido</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        value={newProduct.costoPorUnidad}
                                        onChange={e => setNewProduct({ ...newProduct, costoPorUnidad: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-4 rounded-2xl font-black text-sm"
                                >
                                    GUARDAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ChoosingView() { }

function PickingListModal({ req, onClose }: { req: Requisition, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-md w-full my-8">
                <div className="flex justify-end mb-4 no-print">
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all"
                        >
                            <Printer size={16} /> IMPRIMIR (80mm)
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-black text-xs transition-all"
                        >
                            CERRAR
                        </button>
                    </div>
                </div>

                {/* PDF Design Container - Optimized for 80mm */}
                <div className="bg-white text-slate-900 p-6 rounded-sm shadow-2xl font-mono text-[11px] leading-tight print:m-0 print:p-2 print:shadow-none mx-auto" id="picking-list" style={{ width: '80mm' }}>
                    <div className="text-center border-b border-black border-dashed pb-4 mb-4">
                        <h1 className="text-xl font-black tracking-tighter uppercase mb-1">Kardex Analytics</h1>
                        <p className="text-[9px] font-bold text-slate-500">CONTROL DE PICKING Y DESPACHO</p>
                        <div className="mt-4 py-1 border-y border-black font-black text-sm">
                            LISTA # {req.id.split('-')[1]}
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                            <span className="font-bold">FECHA:</span>
                            <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">SUCURSAL:</span>
                            <span className="text-right">{req.sucursal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">ESTADO:</span>
                            <span className="font-black uppercase">{req.status}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-2 font-black">
                            <span>PRIORIDAD:</span>
                            <span className={req.prioridad === 'ALTA' ? 'bg-black text-white px-1' : ''}>{req.prioridad}</span>
                        </div>
                    </div>

                    <div className="border-t border-black pt-4 mb-4">
                        <div className="grid grid-cols-[1fr_60px_60px] gap-2 border-b border-black pb-1 mb-2 font-black text-[9px] uppercase">
                            <span>DESCRIPCIÓN</span>
                            <span className="text-right">SOL.</span>
                            <span className="text-right">DESP.</span>
                        </div>

                        <div className="grid grid-cols-[1fr_60px_60px] gap-2 pb-2 mb-2 border-b border-slate-100 items-center">
                            <div className="pr-2">
                                <span className="text-[14px] font-black block leading-none">{req.articulo}</span>
                                <span className="text-[9px] text-slate-500 font-bold">INV: 50 | BOGOTA</span>
                            </div>
                            <span className="text-right text-[16px] font-black">{req.cantidad}</span>
                            <div className="text-right border-l border-slate-200">
                                <div className="inline-block w-10 h-6 border-b border-slate-400"></div>
                            </div>
                        </div>

                        {/* Espacio para verificación visual */}
                        <div className="mt-8 p-3 bg-slate-50 border border-slate-200 text-center mb-8">
                            <p className="font-black text-[10px] mb-2">VALIDACIÓN FÍSICA</p>
                            <div className="flex justify-center gap-4">
                                <div className="size-6 border-2 border-slate-300 rounded"></div>
                                <div className="size-6 border-2 border-slate-300 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12 mt-12 mb-8">
                        <div className="text-center pt-4 border-t border-black border-dotted">
                            <p className="font-black">DESPACHADO POR</p>
                            <p className="text-[9px] uppercase mt-1">Nombre y Firma</p>
                        </div>
                        <div className="text-center pt-4 border-t border-black border-dotted">
                            <p className="font-black">RECIBIDO POR</p>
                            <p className="text-[9px] uppercase mt-1">Nombre y Documento</p>
                        </div>
                    </div>

                    <div className="text-center text-[8px] text-slate-400 border-t border-slate-100 pt-4 pb-2">
                        *** FIN DEL DOCUMENTO ***<br />
                        www.kardexanalytics.co
                    </div>
                </div>

                <style>{`
                    @media print {
                        @page {
                            margin: 0;
                            size: 80mm auto;
                        }
                        body * { visibility: hidden; }
                        #picking-list, #picking-list * { visibility: visible; }
                        #picking-list { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 80mm !important;
                            padding: 5mm;
                            margin: 0;
                            box-shadow: none !important;
                            border: none !important;
                        }
                        .no-print { display: none !important; }
                    }
                `}</style>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, trend, trendUp, color, alert }: any) {
    const iconColors = {
        cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
        emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        rose: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    };

    return (
        <div className={cn(
            "bg-[#0A0D14]/80 backdrop-blur-md rounded-2xl p-5 border border-white/5 relative overflow-hidden group shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl",
            alert && "border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
        )}>
            {alert && <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10" />}
            <div className="flex justify-between items-start z-10 relative">
                <div className="space-y-2">
                    <p className="text-slate-400 font-medium text-sm tracking-wide">{title}</p>
                    <p className={cn("text-3xl font-bold tracking-tight", alert ? "text-rose-100" : "text-white")}>{value}</p>
                </div>
                <div className={cn("p-2 rounded-xl border", iconColors[color as keyof typeof iconColors])}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium relative z-10">
                <span className={cn(
                    "flex items-center gap-1",
                    trendUp ? "text-emerald-400" : "text-rose-400"
                )}>
                    {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {trend}
                </span>
            </div>
        </div>
    );
}

function SedesPanel({ sedes, onAdd }: { sedes: Sede[], onAdd: (s: any) => void }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ nombre: "", ubicacion: "", prefijo: "" });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Puntos de Venta (Sedes)</h2>
                    <p className="text-slate-500 text-sm">Gestiona la infraestructura operativa de la red</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm transition-all"
                >
                    NUEVA SEDE
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sedes.map(sede => (
                    <div key={sede.id} className="bg-[#0A0D14]/60 border border-white/5 p-6 rounded-3xl hover:border-emerald-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <MapPin size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded tracking-widest uppercase">{sede.prefijo}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{sede.nombre}</h3>
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                            {sede.ubicacion}
                        </p>
                    </div>
                ))}
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] w-full max-w-md">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Nueva Sede Operativa</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nombre de la Sede</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    value={newItem.nombre}
                                    onChange={e => setNewItem({ ...newItem, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Dirección / Ubicación</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    value={newItem.ubicacion}
                                    onChange={e => setNewItem({ ...newItem, ubicacion: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Prefijo (e.g. BOG)</label>
                                <input
                                    type="text"
                                    maxLength={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    value={newItem.prefijo}
                                    onChange={e => setNewItem({ ...newItem, prefijo: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-4 font-bold text-slate-400 hover:text-white"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={() => {
                                        onAdd(newItem);
                                        setIsAdding(false);
                                        setNewItem({ nombre: "", ubicacion: "", prefijo: "" });
                                    }}
                                    className="flex-1 bg-emerald-500 text-slate-950 font-black py-4 rounded-xl"
                                >
                                    GUARDAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function UsersPanel({ users, sedes, onAdd }: { users: UserAccount[], sedes: Sede[], onAdd: (u: any) => Promise<void> }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ nombre: "", email: "", password: "", rol: "CASHIER" as Role, sedeId: sedes[0]?.id || "" });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Gestión de Usuarios</h2>
                    <p className="text-slate-500 text-sm">Control de accesos y responsabilidades por sede</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm transition-all"
                >
                    NUEVO USUARIO
                </button>
            </div>

            <div className="bg-[#0A0D14]/80 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 uppercase text-[10px] font-black text-slate-500 tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Nombre</th>
                            <th className="px-8 py-5">Rol</th>
                            <th className="px-8 py-5">Sede Asignada</th>
                            <th className="px-8 py-5">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-8 py-5">
                                    <p className="font-bold text-white">{user.nombre}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black tracking-widest",
                                        user.rol === 'ADMIN' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    )}>
                                        {user.rol}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-slate-300 font-medium">
                                    {sedes.find(s => s.id === user.sedeId)?.nombre || 'Sin Sede'}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                        Activo
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] w-full max-w-md">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Crear Usuario Operativo</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    value={newItem.nombre}
                                    onChange={e => setNewItem({ ...newItem, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    value={newItem.email}
                                    onChange={e => setNewItem({ ...newItem, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Contraseña Inicial</label>
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    value={newItem.password}
                                    onChange={e => setNewItem({ ...newItem, password: e.target.value })}
                                    placeholder="Mín. 6 caracteres"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Rol</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none tracking-tight"
                                        value={newItem.rol}
                                        onChange={e => {
                                            const newRol = e.target.value as Role;
                                            setNewItem({
                                                ...newItem,
                                                rol: newRol,
                                                sedeId: newRol === "CASHIER" ? (sedes[0]?.id || "") : ""
                                            });
                                        }}
                                    >
                                        <option value="CASHIER" className="bg-slate-900">Cajero</option>
                                        <option value="SUPERVISOR" className="bg-slate-900">Supervisor</option>
                                        <option value="ANALYST" className="bg-slate-900">Analista</option>
                                        <option value="ADMIN" className="bg-slate-900">Administrador</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Sede Asignada</label>
                                    <select
                                        className={cn(
                                            "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none tracking-tight transition-opacity",
                                            newItem.rol !== "CASHIER" && "opacity-50 pointer-events-none"
                                        )}
                                        value={newItem.sedeId}
                                        onChange={e => setNewItem({ ...newItem, sedeId: e.target.value })}
                                        disabled={newItem.rol !== "CASHIER"}
                                    >
                                        <option value="" className="bg-slate-900">{newItem.rol === "CASHIER" ? "-- Seleccionar Sede --" : "Acceso Global (Todas)"}</option>
                                        {sedes.map(s => (
                                            <option key={s.id} value={s.id} className="bg-slate-900">{s.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-4 font-bold text-slate-400 hover:text-white"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={async () => {
                                        if (newItem.password.length < 6) {
                                            alert("La contraseña debe tener al menos 6 caracteres.");
                                            return;
                                        }
                                        await onAdd(newItem);
                                        setIsAdding(false);
                                        setNewItem({ nombre: "", email: "", password: "", rol: "CASHIER", sedeId: sedes[0]?.id || "" });
                                    }}
                                    className="flex-1 bg-cyan-500 text-slate-950 font-black py-4 rounded-xl"
                                >
                                    CREAR ACCESO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
function GamaAIBot({ messages, onClose, onSend }: any) {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <div className="fixed bottom-28 right-8 z-[70] w-[400px] h-[600px] bg-[#0D121C]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header del Bot */}
            <div className="p-6 bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white">GamaAI Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">En Línea</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Cuerpo del Chat */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((m: any, idx: number) => (
                    <div key={idx} className={cn(
                        "flex flex-col gap-2 max-w-[85%]",
                        m.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}>
                        <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                            m.role === 'user'
                                ? "bg-cyan-500 text-slate-950 font-medium rounded-tr-none"
                                : "bg-white/5 text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-sm"
                        )}>
                            {m.content}
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                            {m.role === 'user' ? 'Tú' : 'GamaAI'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input del Chat */}
            <div className="p-6 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {['Resumen de fugas', 'Sugerir traslados'].map(pill => (
                        <button
                            key={pill}
                            onClick={() => onSend(pill)}
                            className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all text-left"
                        >
                            {pill}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pregunta algo sobre tu inventario..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button
                        type="submit"
                        className="p-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl transition-all shadow-lg shadow-cyan-500/20"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
