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
    Printer, Trash2, ArrowUpRight, Sparkles, Send, MessageSquare, Bot, Cpu, Smartphone, QrCode,
    BookOpenText, Boxes, Menu, CloudDownload, Calendar, ChevronDown, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Login from "./Login";
import RecipeBuilder from './RecipeBuilder'; // Added RecipeBuilder import
import { LogOut } from "lucide-react";
import { ToastContainer, type Notification as NotificationData, type NotificationType } from "./CustomToast";

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajustar a Lunes = 0, Domingo = 6
};

const CustomDatePicker = ({ selectedDate, onChange }: { selectedDate: string, onChange: (date: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Parse selectedDate
    const [y, m, d] = selectedDate.split('-').map(Number);
    const [currentView, setCurrentView] = useState(new Date(y, m - 1, 1));
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = getDaysInMonth(currentView.getFullYear(), currentView.getMonth());
    const firstDay = getFirstDayOfMonth(currentView.getFullYear(), currentView.getMonth());

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentView.getMonth() && today.getFullYear() === currentView.getFullYear();
    };

    const isSelected = (day: number) => {
        return day === d && currentView.getMonth() + 1 === m && currentView.getFullYear() === y;
    };

    const handlePrevMonth = () => setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() + 1, 1));

    const handleSelect = (day: number) => {
        const str = `${currentView.getFullYear()}-${String(currentView.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(str);
        setIsOpen(false);
    };

    const displayDate = new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
    const monthName = currentView.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

    return (
        <div className="relative" ref={popoverRef}>
             <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 transition-colors group cursor-pointer">
                 <Calendar className="text-cyan-600 size-4 group-hover:scale-110 transition-transform"/>
                 <span className="text-xs font-bold text-slate-700 capitalize min-w-[90px]">{displayDate}</span>
                 <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
             </button>

             {isOpen && (
                 <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 w-72 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                     <div className="flex justify-between items-center mb-4">
                         <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"><ChevronLeft size={18}/></button>
                         <div className="text-sm font-black text-slate-800 capitalize">{monthName}</div>
                         <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"><ChevronRight size={18}/></button>
                     </div>
                     <div className="grid grid-cols-7 gap-1 mb-2">
                         {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                             <div key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</div>
                         ))}
                     </div>
                     <div className="grid grid-cols-7 gap-1">
                         {days.map((day, i) => (
                             <div key={i} className="aspect-square flex items-center justify-center">
                                 {day && (
                                     <button 
                                         onClick={() => handleSelect(day)}
                                         className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer
                                             ${isSelected(day) ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-black scale-110' : 
                                               isToday(day) ? 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200 hover:bg-cyan-100' : 
                                               'text-slate-600 hover:bg-slate-100'
                                             }
                                         `}
                                     >
                                         {day}
                                     </button>
                                 )}
                             </div>
                         ))}
                     </div>
                     <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                          <button onClick={() => {
                               const hoy = new Date();
                               onChange(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`);
                               setIsOpen(false);
                          }} className="text-xs font-bold text-cyan-600 hover:text-cyan-700 px-4 py-1.5 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors cursor-pointer w-full text-center">
                              Hoy
                          </button>
                     </div>
                 </div>
             )}
        </div>
    );
};

// Tipos de Roles en el Sistema
type Role = "ADMIN" | "ANALYST" | "SUPERVISOR" | "CASHIER";
type View = "DASHBOARD" | "REQUISITIONS" | "TRANSFERS" | "CATALOG" | "CONSUMPTION" | "SEDES" | "USERS" | "RECIPES" | "PURCHASES" | "CLOSURE" | "WASTE" | "WASTE_HISTORY"; // Updated View type

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
    const [missingLogroItems, setMissingLogroItems] = useState<string[]>([]);
    const [mappedLogroItems, setMappedLogroItems] = useState<string[]>([]);
    const [catalog, setCatalog] = useState<Product[]>([]);
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [appUsers, setAppUsers] = useState<UserAccount[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
    const [wasteHistory, setWasteHistory] = useState<any[]>([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);

    const getColombiaDate = () => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { 
            timeZone: "America/Bogota", 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        };
        return new Intl.DateTimeFormat('en-CA', options).format(now);
    };

    const initialDate = getColombiaDate();

    const [isMobileMode, setIsMobileMode] = useState(false);
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

    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [consumptionStartDate, setConsumptionStartDate] = useState(initialDate);
    const [consumptionEndDate, setConsumptionEndDate] = useState(initialDate);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [isSyncingPirpos, setIsSyncingPirpos] = useState(false);

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                notify("¡Notificaciones de escritorio activadas!", "success");
            }
        }
    };

    const sendNativeNotification = (title: string, options: NotificationOptions) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    ...options,
                    icon: '/icon-192.png',
                    badge: '/favicon.png',
                });
            });
        }
    };

    const notify = (message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);

        // Si es un error, éxito crítico o advertencia de recetas, enviar también notificación nativa (estilo Rappi)
        if (type === 'error' || type === 'success' || type === 'warning') {
            sendNativeNotification("CheeseWheel Intelligence", {
                body: message,
                tag: type,
            });
        }
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        setIsOnline(window.navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const changeView = (v: View) => {
        setView(v);
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    // Carga de Sesión y Datos Iniciales
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
        }

        const initializeApp = async () => {
            // No forzamos setIsLoading(true) aquí para evitar que el cambio de fecha "parpadee" o ponga la pantalla blanca.
            // Como setIsLoading ya empieza en true por defecto (línea 135), solo mostrará loader en la carga inicial real de la página.
            try {
                // 1. Verificar Sesión y Perfil
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setIsLoading(false);
                    return;
                }

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*, sedes(nombre)')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) throw profileError;
                if (!profile) throw new Error("No se encontró perfil de usuario.");

                setSessionUser({ ...session.user, profile });
                const userRole = profile.rol as Role;
                setRole(userRole);

                // 2. Cargar Sedes
                const { data: sedesData, error: sedesError } = await supabase.from('sedes').select('*');
                if (sedesError) throw sedesError;

                if (sedesData) {
                    if (userRole === 'CASHIER' && profile.sede_id) {
                        const cajeroSede = sedesData.find(s => s.id === profile.sede_id);
                        if (cajeroSede) {
                            setSedes([{ id: cajeroSede.id, nombre: cajeroSede.nombre, ubicacion: cajeroSede.ubicacion, prefijo: cajeroSede.prefijo }]);
                            setActiveSucursal(cajeroSede.nombre);
                        }
                    } else {
                        setSedes(sedesData.map(s => ({ id: s.id, nombre: s.nombre, ubicacion: s.ubicacion, prefijo: s.prefijo })));
                    }
                }

                // 3. Cargar Catálogo de Productos
                const { data: productsData, error: prodError } = await supabase.from('products').select('*');
                if (prodError) throw prodError;
                if (productsData) {
                    setCatalog(productsData.map(p => ({
                        id: p.id,
                        nombre: p.nombre,
                        unidad: p.unidad,
                        costoPorUnidad: Number(p.costo_unitario)
                    })));
                }

                // 4. Cargar Recetas e Ingredientes
                const [recipesRes, ingredientsRes] = await Promise.all([
                    supabase.from('recipes').select('*'),
                    supabase.from('recipe_ingredients').select('*')
                ]);
                if (recipesRes.error) throw recipesRes.error;
                if (ingredientsRes.error) throw ingredientsRes.error;

                setRecipes(recipesRes.data || []);
                setRecipeIngredients(ingredientsRes.data || []);

                // 5. Cargar Inventario Diario
                const { data: inventoryDataRaw, error: invError } = await supabase
                    .from('inventory_daily')
                    .select('*, products(nombre, unidad)')
                    .eq('fecha', selectedDate);

                if (invError) throw invError;
                if (inventoryDataRaw) {
                    const formatted = inventoryDataRaw.map(item => {
                        const mermas = Number(item.mermas) || 0;
                        const teorico = (item.inicial + (item.entradas || 0) - (item.salidas_ventas || 0) - mermas);
                        return {
                            id: item.id,
                            articulo: item.products?.nombre || 'Desconocido',
                            inicial: item.inicial,
                            entradas: item.entradas,
                            salidaVentas: item.salidas_ventas,
                            mermas: mermas,
                            teorico: teorico,
                            fisico: item.fisico,
                            dif: (Number(item.fisico) || 0) - teorico,
                            estado: ((Number(item.fisico) || 0) - teorico) < 0 ? 'Fuga' : 'Ok',
                            costo: item.costo_en_fecha,
                            reportarPlanCero: item.reportar_plan_cero,
                            sucursal: sedesData?.find(s => s.id === item.sede_id)?.nombre || 'Principal'
                        };
                    });
                    setInventoryData(formatted);
                }

                // 6. Cargar Perfiles de Usuario (Para Admin)
                if (['ADMIN', 'ANALYST'].includes(userRole)) {
                    const { data: profilesData } = await supabase.from('profiles').select('*');
                    if (profilesData) setAppUsers(profilesData.map(p => ({ id: p.id, nombre: p.nombre, email: p.email, rol: p.rol, sedeId: p.sede_id })));
                }

                // 7. Requisiciones y Traslados
                const [reqsRes, transRes] = await Promise.all([
                    supabase.from('requisitions').select('*, products(nombre), sedes(nombre)'),
                    supabase.from('transfers').select('*, products(nombre), origen:sedes!origen_id(nombre), destino:sedes!destino_id(nombre)')
                ]);

                if (reqsRes.data) setRequisitions(reqsRes.data.map((r: any) => ({
                    id: r.id,
                    articulo: r.products?.nombre || 'Desconocido',
                    cantidad: r.cantidad,
                    sucursal: r.sedes?.nombre || 'General',
                    status: r.status,
                    prioridad: r.prioridad,
                    fecha: r.fecha
                })));

                if (transRes.data) setTransfers(transRes.data.map((t: any) => ({
                    id: t.id,
                    articulo: t.products?.nombre || 'Desconocido',
                    cantidad: t.cantidad,
                    origen: t.origen?.nombre || 'Desconocido',
                    destino: t.destino?.nombre || 'Desconocido',
                    status: t.status,
                    fecha: t.fecha
                })));

            } catch (err: any) {
                console.error("Error inicializando aplicación:", err);
                // No lanzamos alert aquí para evitar molestar en el mount si es un error menor, 
                // pero si no hay sesión es normal.
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();
    }, [selectedDate]);

    useEffect(() => {
        if (view === "WASTE_HISTORY") {
            const fetchWasteHistory = async () => {
                setIsFetchingHistory(true);
                try {
                    const { data, error } = await supabase
                        .from('waste_registries')
                        .select('*, products(nombre, unidad), sedes(nombre)')
                        .order('created_at', { ascending: false });

                    if (error) {
                        console.warn("Error fetching waste history:", error.message);
                        setWasteHistory([]);
                    } else {
                        setWasteHistory(data || []);
                    }
                } catch (err: any) {
                    console.error("Error fetching waste history:", err);
                } finally {
                    setIsFetchingHistory(false);
                }
            };
            fetchWasteHistory();
        }
    }, [view]);

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Listado Unico de Sucursales (Basado en el maestro de sedes registrado)
    const sucursalesDisponibles = Array.from(new Set(sedes.map(s => s.nombre)));
    const filteredData = activeSucursal === "Todas" ? inventoryData : inventoryData.filter(d => d.sucursal === activeSucursal);

    // Funciones de KPIs Reales basadas en el estado actual (usando datos filtrados por sucursal)
    const totalFugas = filteredData.filter(d => d.dif < 0).reduce((acc, curr) => acc + (Math.abs(curr.dif) * curr.costo), 0);
    const totalMermas = filteredData.reduce((acc, curr) => acc + (curr.mermas * curr.costo), 0);
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

                // Busca una fila que contenga la palabra "Articulo", "Artículo" o "Producto" para marcar los headers
                if (row.some(cell => typeof cell === 'string' && (
                    cell.toLowerCase().includes('art') && cell.toLowerCase().includes('culo') ||
                    cell.toLowerCase().includes('producto')
                ))) {
                    headerRowIdx = i;
                }
            }

            if (headerRowIdx === -1) {
                notify("Formato Incorrecto: No se encontró la columna 'Artículo'.", "error");
                return;
            }

            const headers = data[headerRowIdx].map(h => typeof h === 'string' ? h.toLowerCase() : '');
            const rows = data.slice(headerRowIdx + 1);

            // Detección de sistema
            const isLogro = headers.includes("producto") && headers.includes("cantidad") && headers.includes("total");

            // Mapear índices
            const idxArticulo = headers.findIndex((h: string) => h.includes("art") || h.includes("producto"));

            // Para GamaSoft (Nuevo Kardex o Antiguo)
            const idxInicial = headers.findIndex((h: string) => h.includes("inicial"));
            const idxEntradas = headers.findIndex((h: string) => h.includes("entradas") || h.includes("entrada"));

            // Salidas GamaSoft nuevo es "cantidad salidas", antiguo era "salida por venta"
            const idxSalidasGama = headers.findIndex((h: string) => h === "cantidad salidas" || h.includes("salidas"));
            const idxSalidasNormal = headers.findIndex((h: string) => h.includes("salida por venta") && !h.includes("seleccion"));
            const idxSalidasSeleccion = headers.findIndex((h: string) => h.includes("salida por venta") && h.includes("seleccion"));

            // Salidas Logro
            const idxSalidasLogro = headers.findIndex((h: string) => h === "cantidad");

            const idxTeorico = headers.findIndex((h: string) => h.includes("final"));

            // Validación de columnas críticas
            if (idxArticulo === -1) {
                notify("Error: No se encontró la columna de Artículo/Producto.", "error");
                return;
            }

            let parsedData: any[] = [];

            if (isLogro) {
                const consumedMap = new Map<string, number>();
                const unprocessedItems = new Set<string>();

                rows.forEach(row => {
                    if (!row[idxArticulo]) return;
                    const productName = String(row[idxArticulo]).trim();
                    const productNameLower = productName.toLowerCase();
                    const soldQty = Number(row[idxSalidasLogro]) || 0;

                    // 1. PRIORIDAD: Buscar en Recetario (Así si un Topping se vende por "und" pero se descuenta en "gr", la receta lo transforma)
                    const recipe = recipes.find(r => r.nombre.trim().toLowerCase() === productNameLower);
                    if (recipe) {
                        const ingredients = recipeIngredients.filter(ri => ri.recipe_id === recipe.id);
                        ingredients.forEach(ing => {
                            consumedMap.set(ing.product_id, (consumedMap.get(ing.product_id) || 0) + (soldQty * Number(ing.cantidad)));
                        });
                    } else {
                        // 2. Buscar en Catálogo Directo como producto unitario
                        const directProduct = catalog.find(p => p.nombre.trim().toLowerCase() === productNameLower);
                        if (directProduct) {
                            consumedMap.set(directProduct.id, (consumedMap.get(directProduct.id) || 0) + soldQty);
                        } else {
                            // 3. No encontrado
                            unprocessedItems.add(productName);
                        }
                    }
                });

                if (unprocessedItems.size > 0) {
                    const fullListArray = Array.from(unprocessedItems);
                    setMissingLogroItems(fullListArray);
                    const fullList = fullListArray.join("\n• ");
                    notify(
                        `⚠️ ATENCIÓN: Se detectaron ${unprocessedItems.size} artículos vendidos en Loggro que NO tienen receta ni están en el catálogo:\n\n• ${fullList}\n\nPara corregir esto, ve al "Recetario" y crea una receta con exactamente el mismo nombre o agrégalos al "Catálogo Maestro".`,
                        "warning"
                    );
                } else {
                    setMissingLogroItems([]);
                }

                // Detectar sucursal desde Logro (Columna Negocio)
                const sampleRow = rows.find(r => r[idxArticulo]);
                const idxNegocio = headers.findIndex((h: string) => h.includes("negocio"));
                if (sampleRow && idxNegocio !== -1 && sampleRow[idxNegocio]) {
                    const partesNegocio = String(sampleRow[idxNegocio]).split("-");
                    const branch = partesNegocio.length > 1 ? partesNegocio[1].trim() : String(sampleRow[idxNegocio]);
                    detectedSucursal = branch;
                    setDetectedSucursal(branch);
                }

                // Generar parsedData basado en el CATÁLOGO completo
                parsedData = catalog.map((p, index) => {
                    const salidas = consumedMap.get(p.id) || 0;
                    const currentItem = inventoryData.find(item => item.articulo === p.nombre && (item.sucursal === detectedSucursal || activeSucursal === "Todas"));

                    const inicial = currentItem ? Number(currentItem.inicial) : 0;
                    const entradas = currentItem ? Number(currentItem.entradas) : 0;
                    const mermas = currentItem ? Number(currentItem.mermas) : 0;
                    const teorico = inicial + entradas - salidas - mermas;
                    const fisico = currentItem && currentItem.fisico !== undefined ? Number(currentItem.fisico) : teorico;

                    return {
                        id: currentItem ? currentItem.id : `NEW-${index}-${Date.now()}`,
                        articulo: p.nombre,
                        inicial,
                        entradas,
                        salidaVentas: salidas,
                        mermas,
                        teorico,
                        fisico,
                        dif: fisico - teorico,
                        estado: (fisico - teorico) < 0 ? "Fuga" : "Ok",
                        costo: p.costoPorUnidad,
                        unidad: p.unidad,
                        reportarPlanCero: false,
                        sucursal: detectedSucursal,
                        stockIdeal: Math.floor((inicial + entradas) * 0.8),
                        isLogro: true
                    };
                });
            } else {
                // Lógica GamaSoft (Viene con Inventario Inicial, Entradas y Salidas en el mismo archivo)
                parsedData = rows
                    .filter(r => r[idxArticulo])
                    .map((row, index) => {
                        const inicial = Number(row[idxInicial]) || 0;
                        const entradas = idxEntradas !== -1 ? (Number(row[idxEntradas]) || 0) : 0;

                        let salidas = 0;
                        if (idxSalidasGama !== -1) {
                            salidas = Number(row[idxSalidasGama]) || 0;
                        } else {
                            const salidasN = idxSalidasNormal !== -1 ? (Number(row[idxSalidasNormal]) || 0) : 0;
                            const salidasS = idxSalidasSeleccion !== -1 ? (Number(row[idxSalidasSeleccion]) || 0) : 0;
                            salidas = salidasN + salidasS;
                        }

                        const teorico = idxTeorico !== -1 ? (Number(row[idxTeorico]) || 0) : (inicial + entradas - salidas);
                        const fisico = teorico;
                        const dif = fisico - teorico;
                        const estado = dif < 0 ? "Fuga" : "Ok";

                        const catalogItem = catalog.find(p => p.nombre.toLowerCase() === row[idxArticulo]?.toString().toLowerCase());
                        const costo = catalogItem ? catalogItem.costoPorUnidad : 0;
                        const unidad = catalogItem ? catalogItem.unidad : "UND";

                        return {
                            id: `${detectedSucursal}-${index}-${Date.now()}`,
                            articulo: row[idxArticulo],
                            inicial,
                            entradas,
                            salidaVentas: salidas,
                            teorico,
                            fisico,
                            dif,
                            estado,
                            costo,
                            unidad,
                            reportarPlanCero: false,
                            sucursal: detectedSucursal,
                            stockIdeal: Math.floor(teorico * 1.5)
                        };
                    });
            }

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

    const handlePirposSync = async () => {
        setIsSyncingPirpos(true);
        try {
            const normalizedTarget = (activeSucursal || "").toUpperCase();
            const isGamasoftSede = normalizedTarget.includes("CITY");

            // ============================================================
            // RUTA GAMASOFT: Si la sede es City U / Principal, usa Gamasoft
            // ============================================================
            if (isGamasoftSede) {
                const response = await fetch('/api/gamasoft/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetDate: selectedDate })
                });

                const result = await response.json();
                if (!result.success || !result.data) {
                    throw new Error(result.error || "No se pudo sincronizar con Gamasoft.");
                }

                const consumedMap = new Map<string, number>();
                const entradasMap = new Map<string, number>();
                const inicialMap = new Map<string, number>();
                const mappedItemsLocal = new Set<string>();
                const unprocessedItems = new Set<string>();
                const detectedBranch = activeSucursal || "City U";
                setDetectedSucursal(detectedBranch); // <-- Update state for the UI modal

                // Gamasoft devuelve INGREDIENTES directamente con inicial, entradas y salidas
                result.data.forEach((item: any) => {
                    const articuloName = item.nombre?.trim();
                    if (!articuloName) return;

                    const articuloNameLower = articuloName.toLowerCase();
                    const directProduct = catalog.find(p => p.nombre.trim().toLowerCase() === articuloNameLower);

                    if (directProduct) {
                        // Mapear las tres columnas desde Gamasoft (incluso si son negativos)
                        consumedMap.set(directProduct.id, (consumedMap.get(directProduct.id) || 0) + (item.cantidadSalidas || 0));
                        entradasMap.set(directProduct.id, (entradasMap.get(directProduct.id) || 0) + (item.cantidadEntradas || 0));
                        inicialMap.set(directProduct.id, (inicialMap.get(directProduct.id) || 0) + (item.cantidadInventarioInicial || 0));
                        
                        mappedItemsLocal.add(articuloName);
                    } else {
                        // Solo reportar si tuvo algún movimiento
                        if (item.cantidadSalidas > 0 || item.cantidadEntradas > 0) {
                            unprocessedItems.add(`${articuloName} (${item.cantidadSalidas} ${item.unidad})`);
                        }
                    }
                });

                if (unprocessedItems.size > 0) {
                    const fullListArray = Array.from(unprocessedItems);
                    setMissingLogroItems(fullListArray);
                    const fullList = fullListArray.join("\n• ");
                    notify(
                        `⚠️ Gamasoft reportó ${unprocessedItems.size} artículos que NO están en tu catálogo maestro:\n\n• ${fullList}\n\nAgrega estos productos al catálogo e intenta sincronizar de nuevo.`,
                        "warning"
                    );
                } else {
                    setMissingLogroItems([]);
                }

                setMappedLogroItems(Array.from(mappedItemsLocal));

                const parsedData = catalog.map((p, index) => {
                    const salidas = consumedMap.get(p.id) || 0;
                    const entradasGamasoft = entradasMap.get(p.id) || 0;
                    const inicialGamasoft = inicialMap.get(p.id) || 0;
                    const currentItem = inventoryData.find(item => item.articulo === p.nombre && (item.sucursal === detectedBranch || item.sucursal === 'Principal' || activeSucursal === "Todas"));

                    // Usar datos de Gamasoft si existen (incluso si son 0 o negativos, para ver la realidad del sistema)
                    const inicial = inicialMap.has(p.id) ? inicialGamasoft : (currentItem ? Number(currentItem.inicial) : 0);
                    const entradas = entradasMap.has(p.id) ? entradasGamasoft : (currentItem ? Number(currentItem.entradas) : 0);
                    const mermas = currentItem ? Number(currentItem.mermas) : 0;
                    const teorico = inicial + entradas - salidas - mermas;
                    const fisico = currentItem && currentItem.fisico !== undefined ? Number(currentItem.fisico) : teorico;

                    return {
                        id: currentItem ? currentItem.id : `NEW-${index}-${Date.now()}`,
                        articulo: p.nombre,
                        inicial,
                        entradas,
                        salidaVentas: salidas,
                        mermas,
                        teorico,
                        fisico,
                        dif: fisico - teorico,
                        estado: (fisico - teorico) < 0 ? "Fuga" : "Ok",
                        costo: p.costoPorUnidad,
                        unidad: p.unidad,
                        reportarPlanCero: false,
                        sucursal: detectedBranch,
                        stockIdeal: Math.floor((inicial + entradas) * 0.8),
                        isLogro: true
                    };
                });

                setPreviewData(parsedData);
                notify(`✅ Gamasoft sincronizado: ${mappedItemsLocal.size} ingredientes con movimiento para ${selectedDate}`, "success");
                return; // Salir de la función, ya se procesó Gamasoft
            }

            // ============================================================
            // RUTA PIRPOS: Para las demás sedes (Quinta, Usaquén, etc.)
            // ============================================================
            let businessId = undefined;
            if (activeSucursal && activeSucursal !== "Todas") {
                 if (normalizedTarget.includes("QUINTA")) businessId = "5f21a1fbfc576c19807f1c3f";
                 else if (normalizedTarget.includes("USAQUEN") || normalizedTarget.includes("USAQUÉN")) businessId = "60dde66efc364a0e2200d525";
                 else if (normalizedTarget.includes("CLARO")) businessId = "63224b5c98020205f4afb6de";
                 else if (normalizedTarget.includes("PICNIC") || normalizedTarget.includes("FEP")) businessId = "6388ea6e84d99305f1ee97c2";
                 else if (normalizedTarget.includes("GREEN")) businessId = "6477c9a211989705d7c73c42";
                 else if (normalizedTarget.includes("PALATINO")) businessId = "66737d5aad3bbeddba8158a7";
                 else if (normalizedTarget.includes("ESTACIÓN") || normalizedTarget.includes("ESTACION")) businessId = "66912c6b921614de5ad8b2cc";
            }

            if (!businessId) {
                if (activeSucursal === "Todas") {
                    throw new Error("Por favor selecciona una Sede específica en el filtro superior. La sincronización masiva no está disponible.");
                } else {
                    throw new Error(`La sede "${activeSucursal}" no está configurada para conectarse a Pirpos (Usa sistema diferente).`);
                }
            }

            const response = await fetch('/api/pirpos/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId, targetDate: selectedDate })
            });

            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data)) {
                
                const consumedMap = new Map<string, number>();
                const unprocessedItems = new Set<string>();
                const mappedItemsLocal = new Set<string>();
                let detectedBranch = detectedSucursal;

                result.data.forEach((item: any) => {
                     const productName = item?._id?.product?.name;
                     if(!productName) return;
                     
                     const productNameLower = productName.trim().toLowerCase();
                     const soldQty = Number(item.quantity) || 0;
                     
                     // Extraer sede desde Pirpos (Ej: "GRUPO TCW SAS - THE CHEESE WHEEL - QUINTA CAMACHO")
                     if (item?._id?.businessName) {
                         const partesNegocio = String(item._id.businessName).split("-");
                         const branch = partesNegocio.length > 2 ? partesNegocio.slice(2).join("-").trim() : String(item._id.businessName);
                         detectedBranch = branch;
                         setDetectedSucursal(branch);
                     }

                     // 1. PRIORIDAD: Buscar en Recetario primero para permitir conversiones Unidad -> Gramos.
                     const recipe = recipes.find(r => r.nombre.trim().toLowerCase() === productNameLower);
                     if (recipe) {
                         const ingredients = recipeIngredients.filter(ri => ri.recipe_id === recipe.id);
                         ingredients.forEach(ing => {
                             consumedMap.set(ing.product_id, (consumedMap.get(ing.product_id) || 0) + (soldQty * Number(ing.cantidad)));
                         });
                         mappedItemsLocal.add(productName);
                     } else {
                         // 2. Si no es receta, buscar directo en catálogo
                         const directProduct = catalog.find(p => p.nombre.trim().toLowerCase() === productNameLower);
                         if (directProduct) {
                             consumedMap.set(directProduct.id, (consumedMap.get(directProduct.id) || 0) + soldQty);
                             mappedItemsLocal.add(productName);
                         } else {
                             unprocessedItems.add(productName);
                         }
                     }
                });

                if (unprocessedItems.size > 0) {
                    const fullListArray = Array.from(unprocessedItems);
                    setMissingLogroItems(fullListArray);
                    const fullList = fullListArray.join("\n• ");
                    notify(
                        `⚠️ ATENCIÓN: Se detectaron ${unprocessedItems.size} productos vendidos en Pirpos que NO tienen receta ni están en el catálogo:\n\n• ${fullList}\n\nAgrega la Receta o el Producto Maestro e intenta sincronizar de nuevo.`,
                        "warning"
                    );
                } else {
                    setMissingLogroItems([]);
                }
                
                setMappedLogroItems(Array.from(mappedItemsLocal));

                // Convertir mapa de consumos a formato de Kárdex para Preview
                const parsedData = catalog.map((p, index) => {
                    const salidas = consumedMap.get(p.id) || 0;
                    const currentItem = inventoryData.find(item => item.articulo === p.nombre && (item.sucursal === detectedBranch || activeSucursal === "Todas"));

                    const inicial = currentItem ? Number(currentItem.inicial) : 0;
                    const entradas = currentItem ? Number(currentItem.entradas) : 0;
                    const mermas = currentItem ? Number(currentItem.mermas) : 0;
                    const teorico = inicial + entradas - salidas - mermas;
                    const fisico = currentItem && currentItem.fisico !== undefined ? Number(currentItem.fisico) : teorico;

                    return {
                        id: currentItem ? currentItem.id : `NEW-${index}-${Date.now()}`,
                        articulo: p.nombre,
                        inicial,
                        entradas,
                        salidaVentas: salidas,
                        mermas,
                        teorico,
                        fisico,
                        dif: fisico - teorico,
                        estado: (fisico - teorico) < 0 ? "Fuga" : "Ok",
                        costo: p.costoPorUnidad,
                        unidad: p.unidad,
                        reportarPlanCero: false,
                        sucursal: detectedBranch,
                        stockIdeal: Math.floor((inicial + entradas) * 0.8),
                        isLogro: true
                    };
                });
                
                setPreviewData(parsedData);
                notify("Kardex generado exitosamente. Revisa los datos y guarda.", "success");
            } else {
                throw new Error(result.error || "No se pudo sincronizar o el formato recibido cambió.");
            }
        } catch (error: any) {
            console.error("Sync Error:", error);
            notify("Error Sincronizando: " + error.message, "error");
        } finally {
            setIsSyncingPirpos(false);
        }
    };

    // Función para manejar la actualización en vivo del conteo Físico
    const updateFisico = (id: string | number, newValue: string) => {
        // Validación: No permitir negativos
        if (newValue !== "" && Number(newValue) < 0) return;

        setInventoryData(prev => prev.map(item => {
            if (item.id === id) {
                let fisicoNum = 0;
                if (newValue !== "") {
                    fisicoNum = Math.max(0, Number(newValue));
                }
                const newDif = fisicoNum - item.teorico;
                const newEstado = newDif < 0 ? "Fuga" : newDif > 0 ? "Ahorro" : "Ok";
                return { ...item, fisico: newValue === "" ? "" : fisicoNum, dif: newDif, estado: newEstado };
            }
            return item;
        }));
    };

    const updateEntradas = (id: string | number, newValue: string) => {
        setInventoryData(prev => prev.map(item => {
            if (item.id === id) {
                let entradasNum = 0;
                if (newValue !== "") {
                    entradasNum = Number(newValue);
                }
                const newTeorico = (item.inicial + entradasNum - item.salidaVentas - (Number(item.mermas) || 0));
                const newDif = (Number(item.fisico) || 0) - newTeorico;
                const newEstado = newDif < 0 ? "Fuga" : newDif > 0 ? "Ahorro" : "Ok";
                return { ...item, entradas: newValue === "" ? "" : entradasNum, teorico: newTeorico, dif: newDif, estado: newEstado };
            }
            return item;
        }));
    };

    const updateMermas = (id: string | number, newValue: string) => {
        setInventoryData(prev => prev.map(item => {
            if (item.id === id) {
                let mermasNum = 0;
                if (newValue !== "") {
                    mermasNum = Number(newValue);
                }
                const newTeorico = (item.inicial + (Number(item.entradas) || 0) - item.salidaVentas - mermasNum);
                const newDif = (Number(item.fisico) || 0) - newTeorico;
                const newEstado = newDif < 0 ? "Fuga" : newDif > 0 ? "Ahorro" : "Ok";
                return { ...item, mermas: newValue === "" ? "" : mermasNum, teorico: newTeorico, dif: newDif, estado: newEstado };
            }
            return item;
        }));
    };

    const savePhysicalCounts = async () => {
        setIsLoading(true);
        try {
            const updates = inventoryData.map(item => ({
                id: item.id,
                fisico: Number(item.fisico) || 0,
                mermas: Number(item.mermas) || 0,
                entradas: Number(item.entradas) || 0,
                reportar_plan_cero: item.reportarPlanCero
            })).filter(u => typeof u.id === 'string' && u.id.includes('-')); // Filtro básico para IDs de Supabase vs Mock/Excel temporal

            const { error } = await supabase
                .from('inventory_daily')
                .upsert(updates, { onConflict: 'id' });

            if (error) throw error;
            notify("¡Conteo físico guardado exitosamente!", "success");
        } catch (err) {
            console.error("Error guardando conteo:", err);
            notify("Error al guardar el conteo. Verifica la conexión.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const sendTelegramReport = async () => {
        const TOKEN = "8274811663:AAEu7jRXnazkep4msLzfSungFPeHejVTJwo";
        const CHAT_ID = "6015561320";

        const fechaStr = new Date(selectedDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long' });

        let message = `📊 *REPORTE KARDEX ANALYTICS*\n`;
        message += `📍 *Sede:* ${activeSucursal}\n`;
        message += `📅 *Fecha:* ${fechaStr}\n\n`;

        message += `💰 *FINANCIERO:*\n`;
        message += `• Consumo: $${totalSalidas.toLocaleString('es-CO')}\n`;
        message += `• Mermas: $${totalMermas.toLocaleString('es-CO')}\n`;
        message += `• Fugas: -$${totalFugas.toLocaleString('es-CO')}\n\n`;

        const criticos = filteredData.filter(d => d.dif < 0).sort((a, b) => a.dif - b.dif).slice(0, 3);
        if (criticos.length > 0) {
            message += `⚠️ *TOP FUGAS DETECTADAS:*\n`;
            criticos.forEach(p => {
                message += `• ${p.articulo}: ${p.dif} und (-$${(Math.abs(p.dif) * p.costo).toLocaleString('es-CO')})\n`;
            });
            message += `\n`;
        }

        message += `✅ *Reporte generado automáticamente.*`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            if (response.ok) {
                notify("¡Reporte enviado exitosamente a Telegram!", "success");
            } else {
                throw new Error("Error en respuesta de Telegram");
            }
        } catch (error) {
            console.error("Error Telegram:", error);
            notify("No se pudo enviar el reporte a Telegram.", "error");
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="size-10 text-cyan-600 animate-spin" />
            </div>
        );
    }

    return (
        <div id="dashboard-root" className="min-h-screen bg-slate-50 text-slate-700 font-sans selection:bg-cyan-500 selection:text-white relative flex flex-col lg:flex-row">

            {/* Overlay para móvil */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar de Navegación */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-[110] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:flex",
                isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}>
                {/* Logo Section - Fixed */}
                <div className="p-6 flex-none">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
                            <Activity size={20} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Kardex <span className="text-cyan-600 font-black">Analytics</span></h1>
                    </div>
                </div>

                {/* Nav Section - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
                    <nav className="space-y-1">
                        <button
                            onClick={() => changeView("DASHBOARD")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "DASHBOARD" ? "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <Box size={18} /> Dashboard General
                        </button>
                        <button
                            onClick={() => changeView("CLOSURE")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "CLOSURE" ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <ClipboardList size={18} className={view === "CLOSURE" ? "text-indigo-600" : "text-slate-400"} /> Conteo Final
                        </button>
                        <button
                            onClick={() => changeView("PURCHASES")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "PURCHASES" ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <Plus size={18} className="text-emerald-500" /> Cargue de Compras
                        </button>
                        <button
                            onClick={() => changeView("WASTE")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "WASTE" ? "bg-rose-50 text-rose-700 border border-rose-200 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <Trash2 size={18} className={view === "WASTE" ? "text-rose-600" : "text-slate-400"} /> Registro de Bajas
                        </button>
                        <button
                            onClick={() => changeView("WASTE_HISTORY")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "WASTE_HISTORY" ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <BookOpenText size={18} className={view === "WASTE_HISTORY" ? "text-cyan-400" : "text-slate-400"} /> Historial de Bajas
                        </button>
                        <button
                            onClick={() => changeView("REQUISITIONS")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "REQUISITIONS" ? "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <ShoppingCart size={18} /> Requisiciones
                        </button>
                        <button
                            onClick={() => changeView("TRANSFERS")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === "TRANSFERS" ? "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <ArrowRightLeft size={18} /> Traslados
                        </button>
                        {["ADMIN", "ANALYST"].includes(role) && (
                            <button
                                onClick={() => changeView("CONSUMPTION")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                    view === "CONSUMPTION" ? "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                )}
                            >
                                <TrendingUp size={18} /> Análisis de Consumo
                            </button>
                        )}
                        {["ADMIN", "ANALYST"].includes(role) && (
                            <button
                                onClick={() => changeView("CATALOG")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                    view === "CATALOG" ? "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                )}
                            >
                                <ClipboardList size={18} /> Catálogo Maestro
                            </button>
                        )}
                        {["ADMIN", "ANALYST"].includes(role) && (
                            <button
                                onClick={() => changeView("RECIPES")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                    view === "RECIPES" ? "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                )}
                            >
                                <Boxes size={18} /> Recetario (BOM)
                            </button>
                        )}
                        {role === "ADMIN" && (
                            <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Configuración</p>
                                <button
                                    onClick={() => changeView("SEDES")}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        view === "SEDES" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                    )}
                                >
                                    <MapPin size={18} /> Gestión de Sedes
                                </button>
                                <button
                                    onClick={() => changeView("USERS")}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        view === "USERS" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                    )}
                                >
                                    <Users size={18} /> Gestión de Usuarios
                                </button>
                            </div>
                        )}
                    </nav>
                </div>

                {/* User Section - Fixed */}
                <div className="p-6 space-y-4 border-t border-slate-100 flex-none bg-white">
                    <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Usuario Activo</p>
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold uppercase">
                                {sessionUser?.profile?.nombre?.[0] || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 leading-none capitalize truncate max-w-[120px]">{sessionUser?.profile?.nombre || 'Usuario'}</p>
                                <p className="text-[10px] text-slate-500 mt-1 font-semibold">{role}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-200"
                    >
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                    <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-[0.2em]">v1.0.5 Premium</p>

                    {deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                        >
                            Instalar aplicación
                        </button>
                    )}
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Premium / Nav */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-sm md:text-lg font-bold text-slate-900 capitalize truncate">
                            {view.toLowerCase().replace('_', ' ')}
                        </h2>

                        {/* Botón de Notificaciones Nativas */}
                        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                            <button
                                onClick={requestNotificationPermission}
                                className="group flex items-center gap-2 bg-cyan-50 hover:bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200 transition-all text-cyan-700 shrink-0"
                                title="Activar notificaciones de escritorio"
                            >
                                <MessageSquare size={12} className="group-hover:scale-110 rotate-12 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-tight hidden sm:block">Alertas</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Selector de Fecha (Solo visible en md+) */}
                        <div className="hidden md:flex items-center gap-2 bg-white px-1.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
                            <div className="flex items-center bg-transparent shrink-0">
                                <Activity size={14} className="text-cyan-600 animate-pulse ml-3" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-2 mr-3">Cargue Diario</span>
                            </div>
                            <CustomDatePicker 
                                selectedDate={selectedDate} 
                                onChange={(val: string) => setSelectedDate(val)} 
                            />
                        </div>

                        {/* Filtro de Sucursal (Solo visible en md+ o si no es Cajero) */}
                        {sucursalesDisponibles.length > 0 && role !== "CASHIER" && (
                            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                <MapPin size={16} className="text-cyan-600" />
                                <select
                                    className="bg-transparent text-sm text-slate-700 font-medium focus:outline-none focus:ring-0 border-none appearance-none cursor-pointer pr-4"
                                    value={activeSucursal}
                                    onChange={(e) => setActiveSucursal(e.target.value)}
                                >
                                    <option value="Todas" className="bg-white">Todas las Sucursales</option>
                                    {sucursalesDisponibles.map(sucursal => (
                                        <option key={sucursal} value={sucursal} className="bg-white">{sucursal}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Indicador de Conexión */}
                        {!isOnline && (
                            <div className="flex items-center gap-2 bg-rose-100 px-3 py-1 rounded-full border border-rose-200 animate-pulse">
                                <AlertTriangle size={14} className="text-rose-600" />
                                <span className="text-[10px] font-black text-rose-700 uppercase">Sin Conexión</span>
                            </div>
                        )}

                        {/* Perfil de Usuario Actual */}
                        <div className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l md:border-slate-200 shrink-0">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate max-w-[80px]">{sessionUser?.profile?.nombre || 'Iniciado'}</p>
                                <p className="text-[9px] font-bold text-cyan-600 uppercase">{role}</p>
                            </div>
                            <div className="size-8 md:size-10 rounded-xl md:rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs md:text-sm font-black shadow-md shadow-cyan-500/20">
                                {sessionUser?.profile?.nombre?.[0] || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-6 lg:p-10">
                    {view === "RECIPES" && <RecipeBuilder notify={notify} />}
                    {view === "WASTE" && (
                        <div className="max-w-4xl mx-auto">
                            <WastePanel
                                catalog={catalog}
                                onSaveEntries={async (entries) => {
                                    setIsLoading(true);
                                    try {
                                        const sedeId = sedes.find(s => s.nombre === activeSucursal)?.id;
                                        if (!sedeId) throw new Error("Sede no identificada");

                                        for (const entry of entries) {
                                            // 1. Intentar guardar el registro detallado (log) para el motivo
                                            // Si la tabla no existe aún, fallará silenciosamente el log pero guardará el total
                                            const { error: logError } = await supabase
                                                .from('waste_registries')
                                                .insert([{
                                                    product_id: entry.id,
                                                    sede_id: sedeId,
                                                    fecha: selectedDate,
                                                    cantidad: entry.cantidad,
                                                    motivo: entry.motivo,
                                                    costo_unitario: entry.costoPorUnidad
                                                }]);

                                            if (logError) {
                                                console.warn("No se pudo guardar el detalle del motivo (¿Falta tabla waste_registries?):", logError.message);
                                            }

                                            // 2. Actualizar el acumulado diario en inventory_daily
                                            const { data: existing } = await supabase
                                                .from('inventory_daily')
                                                .select('id, mermas')
                                                .eq('sede_id', sedeId)
                                                .eq('product_id', entry.id)
                                                .eq('fecha', selectedDate)
                                                .single();

                                            const payload: any = {
                                                sede_id: sedeId,
                                                product_id: entry.id,
                                                fecha: selectedDate,
                                                mermas: (existing?.mermas || 0) + entry.cantidad,
                                                costo_en_fecha: entry.costoPorUnidad
                                            };

                                            if (existing) payload.id = existing.id;

                                            const { error } = await supabase
                                                .from('inventory_daily')
                                                .upsert(payload, { onConflict: 'id' });

                                            if (error) throw error;
                                        }
                                        notify("Mermas registradas correctamente", "success");
                                        window.location.reload();
                                    } catch (err: any) {
                                        console.error(err);
                                        notify("Error: " + err.message, "error");
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                            />
                        </div>
                    )}
                    {view === "WASTE_HISTORY" && (
                        <div className="max-w-6xl mx-auto">
                            <WasteHistoryPanel history={wasteHistory} isLoading={isFetchingHistory} />
                        </div>
                    )}
                    {view === "CLOSURE" && (
                        <div className="max-w-4xl mx-auto">
                            <ClosurePanel
                                catalog={catalog}
                                currentInventory={inventoryData.filter(d => d.sucursal === activeSucursal)}
                                onSave={async (counts) => {
                                    setIsLoading(true);
                                    try {
                                        const sedeId = sedes.find(s => s.nombre === activeSucursal)?.id;
                                        if (!sedeId) throw new Error("No se identificó la sede.");

                                        for (const count of counts) {
                                            const { error } = await supabase
                                                .from('inventory_daily')
                                                .upsert({
                                                    sede_id: sedeId,
                                                    product_id: count.id,
                                                    fecha: selectedDate,
                                                    fisico: count.fisico,
                                                    costo_en_fecha: count.costoPorUnidad
                                                }, { onConflict: 'sede_id, product_id, fecha' });

                                            if (error) throw error;
                                        }

                                        notify("Inventario final guardado exitosamente", "success");
                                        window.location.reload();
                                    } catch (err: any) {
                                        console.error(err);
                                        notify("Error: " + err.message, "error");
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                            />
                        </div>
                    )}
                    {view === "PURCHASES" && (
                        <div className="max-w-4xl mx-auto">
                            <PurchasesPanel
                                catalog={catalog}
                                onSaveEntries={async (entries) => {
                                    setIsLoading(true);
                                    try {
                                        // Obtener el ID de la sede actual
                                        const sedeId = sedes.find(s => s.nombre === activeSucursal)?.id;
                                        if (!sedeId) throw new Error("No se identificó la sede activa.");

                                        // Preparar los datos para el upsert en inventory_daily
                                        // Para cada entrada, necesitamos ver si ya existe el registro hoy para sumarle o crear uno nuevo
                                        for (const entry of entries) {
                                            // Buscamos si ya existe el registro en el estado local de inventoryData
                                            const existing = inventoryData.find(d => d.articulo === entry.nombre && d.sucursal === activeSucursal);

                                            const { data: existingDB } = await supabase
                                                .from('inventory_daily')
                                                .select('id, entradas, inicial, mermas, salidas_ventas')
                                                .eq('sede_id', sedeId)
                                                .eq('product_id', entry.id)
                                                .eq('fecha', selectedDate)
                                                .single();

                                            const payload: any = {
                                                sede_id: sedeId,
                                                product_id: entry.id,
                                                fecha: selectedDate,
                                                entradas: (existingDB?.entradas || 0) + entry.cantidad,
                                                costo_en_fecha: entry.costoPorUnidad
                                            };

                                            if (existingDB) {
                                                payload.id = existingDB.id;
                                            } else {
                                                // Si es nuevo hoy, el inicial es 0 o el fisico de ayer (lógica de arrastre iría aquí)
                                                payload.inicial = 0;
                                                payload.mermas = 0;
                                                payload.salidas_ventas = 0;
                                                payload.fisico = 0;
                                            }

                                            const { error: upsertError } = await supabase
                                                .from('inventory_daily')
                                                .upsert(payload, { onConflict: 'id' });

                                            if (upsertError) throw upsertError;
                                        }

                                        // Refrescar datos
                                        window.location.reload(); // Forma rápida de asegurar integridad, o podrías re-fetch
                                    } catch (err: any) {
                                        console.error("Error guardando compras:", err);
                                        notify("Error al guardar entradas: " + err.message, "error");
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                            />
                        </div>
                    )}
                    {view === "DASHBOARD" && (
                        <div className="space-y-8 max-w-[1600px] mx-auto">
                            {/* Area de Sincronización (Solo Admin y Analista) */}
                            {canUploadExcel && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "relative h-48 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group overflow-hidden",
                                            fileHover ? "border-cyan-400 bg-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.1)]" : "border-slate-300 hover:border-cyan-300 bg-white"
                                        )}
                                    >
                                        <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])} />
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 group-hover:scale-110 transition-transform shadow-sm">
                                            <Upload className={cn("size-8 transition-colors", fileHover ? "text-cyan-400" : "text-slate-400")} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-slate-800">Cargar Kardex (Excel)</p>
                                            <p className="text-sm text-slate-500">Gamasoft Export compatible (.xlsx)</p>
                                        </div>
                                    </div>

                                    {(() => {
                                        const isGama = (activeSucursal || "").toUpperCase().includes("CITY");
                                        return (
                                    <div
                                        onClick={handlePirposSync}
                                        className={cn(
                                            "relative h-48 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group overflow-hidden bg-white",
                                            isGama
                                                ? "border-orange-200 hover:border-orange-400 hover:bg-orange-50/50"
                                                : "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50",
                                            isSyncingPirpos && "pointer-events-none opacity-80"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-4 rounded-2xl border group-hover:scale-110 transition-transform shadow-sm relative",
                                            isGama ? "bg-orange-50 border-orange-100" : "bg-indigo-50 border-indigo-100"
                                        )}>
                                            {isSyncingPirpos ? (
                                                <Loader2 className={cn("size-8 animate-spin", isGama ? "text-orange-500" : "text-indigo-500")} />
                                            ) : (
                                                <CloudDownload className={cn("size-8", isGama ? "text-orange-500" : "text-indigo-500")} />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-slate-800">
                                                {isGama ? "Conectar con Gamasoft" : "Conectar con Pirpos"}
                                            </p>
                                            <p className={cn("text-sm font-medium", isGama ? "text-orange-500" : "text-indigo-500")}>
                                                Sincronización via API REST
                                            </p>
                                        </div>
                                    </div>
                                        );
                                    })()}
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
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
                                            <ClipboardList size={18} className="text-cyan-600" /> Relación Ventas vs Stock
                                        </h3>
                                        <div className="h-64 w-full flex items-center justify-center">
                                            {inventoryData.length > 0 ? (
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
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis hide />
                                                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                                                        <Area type="monotone" dataKey="stock" stroke="#06b6d4" fillOpacity={1} fill="url(#colorStock)" strokeWidth={3} name="Stock Disponible" />
                                                        <Area type="monotone" dataKey="salidas" stroke="#10b981" fillOpacity={1} fill="url(#colorSalidas)" strokeWidth={3} name="Unidades Vendidas" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="text-center">
                                                    <Activity className="size-10 text-slate-200 mx-auto mb-2" />
                                                    <p className="text-slate-400 text-xs font-medium">No hay datos históricos para graficar.</p>
                                                    <p className="text-[10px] text-slate-300 mt-1 uppercase font-black uppercase tracking-widest">Sincroniza tu Kardex primero</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
                                            <TrendingDown size={18} className="text-emerald-600" /> Comparativo Físico/Bodega vs Teórico/Sistema
                                        </h3>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={filteredData.slice(0, 10)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                    <XAxis dataKey="articulo" tick={false} axisLine={false} />
                                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                    <Tooltip
                                                        cursor={{ fill: '#f1f5f9' }}
                                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
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
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-4">
                                    <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                        <div>
                                            <h3 className="text-slate-800 font-bold flex items-center gap-2">
                                                <PackageSearch size={18} className="text-slate-500" />
                                                Matriz de Control y Cuadre de Inventario
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">Edita el valor de la columna <b>"Físico Real"</b> para calcular automáticamente las fugas/ahorros</p>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* 
                                            <button
                                                onClick={sendTelegramReport}
                                                disabled={inventoryData.length === 0}
                                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-black transition-all shadow-md flex items-center gap-2 border border-slate-800 hover:bg-slate-800"
                                            >
                                                <Send size={16} className="text-cyan-400" /> REPORTE TELEGRAM
                                            </button>
                                            */}
                                            <button
                                                onClick={() => setIsMobileMode(!isMobileMode)}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-sm font-black transition-all shadow-md flex items-center gap-2 border",
                                                    isMobileMode ? "bg-cyan-600 text-white border-cyan-500" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                {isMobileMode ? <ClipboardList size={16} /> : <Smartphone size={16} />}
                                                {isMobileMode ? "MODO TABLA" : "MODO MOVIL"}
                                            </button>
                                            <button
                                                onClick={savePhysicalCounts}
                                                disabled={inventoryData.length === 0}
                                                className="disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-black transition-all shadow-md flex items-center gap-2"
                                            >
                                                <Check size={16} /> GUARDAR CONTEO
                                            </button>
                                        </div>
                                    </div>

                                    {isMobileMode ? (
                                        <MobileInventoryMode
                                            data={filteredData}
                                            onUpdateFisico={updateFisico}
                                            onUpdateMermas={updateMermas}
                                            onUpdateEntradas={updateEntradas}
                                            canEdit={canEditPhysical}
                                        />
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-slate-100 text-slate-500 border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider">Articulo</th>
                                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-right">Inv. Inicial</th>
                                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-right bg-emerald-50/50 text-emerald-700">Entradas (Editar)</th>
                                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-right">Salida Ventas</th>
                                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-right bg-rose-50 text-rose-700">Mermas (Editar)</th>
                                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-right border-x border-slate-200 bg-cyan-50 text-cyan-700">Teórico Final</th>
                                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-right bg-emerald-50 text-emerald-700">Físico Real (Editar)</th>
                                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-right">Diferencia</th>
                                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-center border-r border-slate-200">Estado de Control</th>
                                                        {canSelectForReport && <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-center text-amber-700 bg-amber-50">A Reporte Cajero</th>}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                                                    {filteredData.map((row) => (
                                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                                            <td className="px-6 py-4 font-bold text-slate-900">{row.articulo}</td>
                                                            <td className="px-6 py-4 text-right text-slate-500">{row.inicial}</td>
                                                            <td className="px-4 py-2 text-right bg-emerald-50/10">
                                                                <input
                                                                    type="number"
                                                                    disabled={!canEditPhysical}
                                                                    value={row.entradas ?? ""}
                                                                    onChange={(e) => updateEntradas(row.id, e.target.value)}
                                                                    className={cn(
                                                                        "w-20 bg-white border text-emerald-700 font-black px-3 py-1.5 rounded text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
                                                                        !canEditPhysical ? "border-transparent opacity-70" : "border-emerald-200 shadow-sm hover:border-emerald-400"
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-amber-600 font-bold">{row.salidaVentas}</td>
                                                            <td className="px-4 py-2 text-right bg-rose-50/30">
                                                                <input
                                                                    type="number"
                                                                    disabled={!canEditPhysical}
                                                                    value={row.mermas ?? ""}
                                                                    onChange={(e) => updateMermas(row.id, e.target.value)}
                                                                    className={cn(
                                                                        "w-20 bg-white border text-rose-700 font-black px-3 py-1.5 rounded text-right focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all",
                                                                        !canEditPhysical ? "border-transparent opacity-70" : "border-rose-200 shadow-sm hover:border-rose-400"
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-black text-cyan-700 border-x border-slate-100 bg-cyan-50/30">{row.teorico}</td>
                                                            <td className="px-4 py-2 text-right bg-emerald-50/30 border-r border-slate-100">
                                                                <input
                                                                    type="number"
                                                                    disabled={!canEditPhysical}
                                                                    value={row.fisico ?? ""}
                                                                    onChange={(e) => updateFisico(row.id, e.target.value)}
                                                                    className={cn(
                                                                        "w-24 bg-white border text-emerald-700 font-black px-3 py-1.5 rounded text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
                                                                        !canEditPhysical ? "border-transparent opacity-70" : "border-emerald-200 shadow-sm hover:border-emerald-400"
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className={cn(
                                                                    "px-2 py-1 rounded-md font-black text-xs",
                                                                    row.dif < 0 ? "text-rose-700 bg-rose-50 border border-rose-100" :
                                                                        row.dif > 0 ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-slate-400"
                                                                )}>
                                                                    {row.dif > 0 ? '+' : ''}{row.dif}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className={cn(
                                                                    "inline-flex items-center justify-center min-w-[80px] gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border",
                                                                    row.estado === 'Fuga' ? "border-rose-200 text-rose-700 bg-rose-50" :
                                                                        row.estado === 'Ahorro' ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-500 bg-slate-100"
                                                                )}>
                                                                    {row.estado === 'Fuga' && <AlertTriangle size={12} />}
                                                                    {row.estado === 'Ahorro' && <TrendingUp size={12} />}
                                                                    {row.estado === 'Ok' && <CheckCircle2 size={12} />}
                                                                    {row.estado}
                                                                </div>
                                                            </td>
                                                            {canSelectForReport && (
                                                                <td className="px-6 py-4 text-center bg-amber-50/30">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={row.reportarPlanCero}
                                                                        onChange={() => toggleReportar(row.id)}
                                                                        className="w-5 h-5 rounded border-slate-300 bg-white text-cyan-600 accent-amber-500 cursor-pointer"
                                                                    />
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
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
                                    notify("Error: No se pudo mapear el producto para el traslado.", "error");
                                }
                            }}
                        />
                    )}

                    {isNewReqModalOpen && (
                        <NewRequisitionModal
                            isOpen={isNewReqModalOpen}
                            onClose={() => setIsNewReqModalOpen(false)}
                            inventoryData={inventoryData}
                            catalog={catalog}
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
                                    notify("Error: Producto o sede no encontrados.", "error");
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
                        <div className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-white" />
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
                            missingItems={missingLogroItems}
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
                                    const missingProductsFromExcelRaw = data.filter(item =>
                                        !catalog.some(p => p.nombre.toLowerCase() === item.articulo.toLowerCase())
                                    );

                                    // Local catalog copy to maintain sync during this execution
                                    let currentCatalog = [...catalog];

                                    // Eliminar duplicados en la misma carga de Excel para evitar error de Unique Constraint en DB
                                    const uniqueMissingProducts = Array.from(new Set(missingProductsFromExcelRaw.map(p => p.articulo.toLowerCase())))
                                        .map(name => missingProductsFromExcelRaw.find(p => p.articulo.toLowerCase() === name)!);

                                    if (uniqueMissingProducts.length > 0) {
                                        const newProductsToInsert = uniqueMissingProducts.map((p, i) => ({
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
                                                unidad: p.unit || p.unidad || 'UND',
                                                costoPorUnidad: Number(p.costo_unitario)
                                            }));
                                            setCatalog(prev => [...prev, ...formatted]);
                                            currentCatalog = [...currentCatalog, ...formatted];
                                        }
                                        if (prodError) {
                                            console.error("Error auto-creando productos:", JSON.stringify(prodError, null, 2));
                                            notify(`Error al crear productos: ${prodError.message || 'Error desconocido'}`, "error");
                                        }
                                    }

                                    // 3. Preparar el lote de insert/upsert
                                    const batch = data.map(item => {
                                        const product = currentCatalog.find(p => p.nombre.toLowerCase() === item.articulo.toLowerCase());
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
                                    notify(`¡Éxito! Se han procesado ${batch.length} artículos para ${detectedSucursal}.`, "success");
                                } catch (err) {
                                    console.error(err);
                                    notify("Error al procesar el cargue masivo.", "error");
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                        />
                    )}
                    {view === "CATALOG" && (
                        <CatalogPanel
                            catalog={catalog}
                            onUpdateCatalog={async (updatedProducts) => {
                                try {
                                    // Identificar si lo que estamos haciendo es una adición o edición
                                    // Para evitar enviar el catálogo completo innecesariamente y arriesgar errores de ID
                                    // Buscamos si hay productos nuevos (con prefijo 'P')
                                    const newProducts = updatedProducts.filter(p => String(p.id).startsWith('P'));

                                    // Si hay productos nuevos, solo insertamos esos. Si es una edición, upsert de la lista (o del editado)
                                    // Para simplificar y mantener sincronía, hacemos upsert filtrando los IDs temporales

                                    // Calculamos el ID más alto actual (Solo de los que son números)
                                    const maxId = catalog.reduce((max, p) => {
                                        const numericId = parseInt(String(p.id));
                                        return (!isNaN(numericId) && numericId > max) ? numericId : max;
                                    }, 0);
                                    let nextIdCount = 1;

                                    const productsToUpsert = updatedProducts.map(p => {
                                        const isTempId = String(p.id).startsWith('P');
                                        let finalId;
                                        
                                        if (isTempId) {
                                            finalId = maxId + nextIdCount;
                                            nextIdCount++;
                                        } else {
                                            finalId = parseInt(String(p.id));
                                            if (isNaN(finalId)) {
                                                // Si el ID original no era numérico, le asignamos uno nuevo
                                                finalId = maxId + nextIdCount;
                                                nextIdCount++;
                                            }
                                        }

                                        return {
                                            id: finalId, 
                                            nombre: p.nombre,
                                            unidad: p.unidad,
                                            costo_unitario: Number(p.costoPorUnidad) || 0
                                        };
                                    });

                                    console.log("Enviando a Supabase:", JSON.stringify(productsToUpsert, null, 2));

                                    const { data, error } = await supabase
                                        .from('products')
                                        .upsert(productsToUpsert, { onConflict: 'id' })
                                        .select();

                                    if (error) {
                                        console.error("DETALLE ERROR SUPABASE:", error);
                                        throw error;
                                    }

                                    if (data) {
                                        const formatted = data.map(p => ({
                                            id: p.id,
                                            nombre: p.nombre,
                                            unidad: p.unidad,
                                            costoPorUnidad: Number(p.costo_unitario)
                                        }));
                                        setCatalog(formatted);
                                        notify("✅ Catálogo actualizado", "success");
                                    }
                                } catch (err: any) {
                                    console.error("ERROR FINAL:", err);
                                    notify(`Error: ${err.message || 'Error de datos'}`, "error");
                                }
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
                            notify={notify}
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

                                        notify(`Usuario ${newUser.nombre} creado exitosamente.`, "success");
                                    }
                                } catch (err: any) {
                                    console.error("Error creating user:", err);
                                    notify(`Error: ${err.message}`, "error");
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            onUpdate={async (updatedUser) => {
                                setIsLoading(true);
                                try {
                                    const { error } = await supabase.from('profiles').update({
                                        nombre: updatedUser.nombre,
                                        sede_id: updatedUser.rol === 'CASHIER' ? (updatedUser.sedeId || null) : null
                                    }).eq('id', updatedUser.id);

                                    if (error) throw error;

                                    setAppUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                                    notify("Usuario actualizado exitosamente", "success");
                                } catch (err: any) {
                                    console.error("Error updating user:", err);
                                    notify(`Error: ${err.message}`, "error");
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
                    <h2 className="text-3xl font-black text-slate-900">Centro de Requisiciones</h2>
                    <p className="text-slate-500 mt-1">Gestiona el flujo de mercancía entre puntos de venta y bodega central.</p>
                </div>
                {["ADMIN", "SUPERVISOR"].includes(role) && (
                    <button
                        onClick={onAdd}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-md flex items-center gap-2"
                    >
                        <Plus size={18} /> Nueva Requisición
                    </button>
                )}
            </div>

            {lowStockItems.length > 0 && (
                <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4 text-rose-700 shadow-sm">
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
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className={cn(
                                    "size-2 rounded-full",
                                    status === 'PENDIENTE' ? "bg-amber-500" :
                                        status === 'APROBADA' ? "bg-cyan-500" :
                                            status === 'TRANSITO' ? "bg-emerald-500" : "bg-slate-300"
                                )}></span>
                                {status}
                            </h3>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                {requisitions.filter(r => r.status === status && (activeSucursal === "Todas" || r.sucursal === activeSucursal)).length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {requisitions.filter(r => r.status === status && (activeSucursal === "Todas" || r.sucursal === activeSucursal)).map(req => (
                                <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-cyan-400 transition-all group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">{req.id}</span>
                                        <div className="flex gap-1 text-slate-400">
                                            {status === 'PENDIENTE' && ["ADMIN", "ANALYST"].includes(role) && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => onUpdateStatus(req.id, 'APROBADA')}
                                                        className="p-1 hover:text-emerald-600 transition-colors" title="Aprobar"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(req.id)}
                                                        className="p-1 hover:text-rose-600 transition-colors" title="Rechazar"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            {status === 'APROBADA' && ["ADMIN", "ANALYST"].includes(role) && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => onUpdateStatus(req.id, 'TRANSITO')}
                                                        className="p-1 hover:text-cyan-600 transition-colors" title="Despachar"
                                                    >
                                                        <Box size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onPrint(req)}
                                                        className="p-1 hover:text-amber-600 transition-colors" title="Descargar Picking List"
                                                    >
                                                        <FileSpreadsheet size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            {status === 'TRANSITO' && (role === "SUPERVISOR" || role === "ADMIN") && (
                                                <button
                                                    onClick={() => onUpdateStatus(req.id, 'ENTREGADA')}
                                                    className="p-1 hover:text-emerald-600 transition-colors" title="Confirmar Entrega"
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                            )}
                                            {status === 'PENDIENTE' && (role === "ADMIN" || (role === "SUPERVISOR" && req.status === 'PENDIENTE')) && (
                                                <button
                                                    onClick={() => onDelete(req.id)}
                                                    className="p-1 hover:text-rose-600 transition-colors" title="Eliminar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-1">{req.articulo}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                        <MapPin size={12} className="text-cyan-600" /> {req.sucursal}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">Cantidad:</span>
                                            <span className="text-sm font-black text-slate-900">{req.cantidad}</span>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-1 rounded-full",
                                            req.prioridad === 'ALTA' ? "bg-rose-50 text-rose-700 border border-rose-100" :
                                                req.prioridad === 'MEDIA' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                                    "bg-slate-100 text-slate-500"
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
                <h2 className="text-3xl font-black text-slate-900">Traslados Inter-Sucursales</h2>
                <p className="text-slate-500 mt-1">Balanceo de inventario basado en excedentes de otros puntos.</p>
            </div>

            {balancingSuggestions.length > 0 && (
                <div className="mb-8 space-y-4">
                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} /> Sugerencias de Balanceo (Ahorra Compras)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {balancingSuggestions.map((s: any, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 group hover:border-emerald-500 transition-all shadow-sm">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-slate-900">{s.articulo}</span>
                                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">{s.cantidad} Und</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="truncate">{s.origen}</span>
                                    <ArrowRightLeft size={12} className="shrink-0 text-emerald-600" />
                                    <span className="truncate">{s.destino}</span>
                                </div>
                                <button
                                    onClick={() => onAddTransfer && onAddTransfer(s)}
                                    className="mt-2 w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[10px] font-black rounded-lg transition-all border border-emerald-100"
                                >
                                    CREAR TRASLADO DIRECTO
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">ID</th>
                            <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Artículo</th>
                            <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right pr-12">Cantidad</th>
                            <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Origen</th>
                            <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center">
                                <ArrowRightLeft size={14} className="inline mx-auto" />
                            </th>
                            <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Destino</th>
                            <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                        {transfers.map(tr => (
                            <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-400 text-[10px]">{tr.id}</td>
                                <td className="px-6 py-4 font-bold text-slate-900">{tr.articulo}</td>
                                <td className="px-6 py-4 font-black text-cyan-700 text-right pr-12">{tr.cantidad}</td>
                                <td className="px-6 py-4">{tr.origen}</td>
                                <td className="px-6 py-4 text-center text-slate-300">
                                    <ArrowRightLeft size={14} />
                                </td>
                                <td className="px-6 py-4">{tr.destino}</td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black",
                                        tr.status === 'SOLICITADO' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                            tr.status === 'EN_CAMINO' ? "bg-cyan-50 text-cyan-700 border border-cyan-100" :
                                                "bg-emerald-50 text-emerald-700 border border-emerald-100"
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

function NewRequisitionModal({ isOpen, onClose, inventoryData, catalog, activeSucursal, onSave }: any) {
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
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
                {/* Panel lateral de sugerencias */}
                <div className="w-full md:w-80 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto max-h-[400px] md:max-h-[600px]">
                    <h3 className="text-slate-900 font-black flex items-center gap-2 mb-6">
                        <Activity size={18} className="text-cyan-600" />
                        Smart Ordering
                    </h3>
                    <div className="space-y-3">
                        {suggestions.map((s: any) => (
                            <button
                                key={s.id}
                                onClick={() => setFormData({ ...formData, articulo: s.articulo, cantidad: s.suggestedCount, prioridad: s.suggestedCount > s.stockIdeal * 0.5 ? 'ALTA' : 'MEDIA' })}
                                className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-cyan-500/30 text-left transition-all group shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-slate-700">{s.articulo}</span>
                                    <Plus size={12} className="text-slate-400 group-hover:text-cyan-600" />
                                </div>
                                <p className="text-sm font-black text-cyan-600">Sugiere: {s.suggestedCount} Und</p>
                                <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
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
                            <h2 className="text-2xl font-black text-slate-900">Nueva Requisición</h2>
                            <p className="text-slate-500 text-sm">Completa los detalles de la solicitud para {sucursalTarget}.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 relative">
                                <label className="text-xs font-bold text-slate-500 uppercase">Artículo / Producto</label>
                                <input
                                    type="text"
                                    list="products-list"
                                    value={formData.articulo}
                                    onChange={(e) => setFormData({ ...formData, articulo: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500"
                                    placeholder="Selecciona o escribe el producto"
                                />
                                <datalist id="products-list">
                                    {catalog.map((p: any) => (
                                        <option key={p.id} value={p.nombre} />
                                    ))}
                                </datalist>
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
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500"
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
                                                ? "bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm"
                                                : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => onSave({ ...formData, status: 'PENDIENTE' })}
                                className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-2xl transition-all shadow-md"
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



interface ClosureCount extends Product {
    fisico: number;
}

function ClosurePanel({ catalog, currentInventory, onSave }: { catalog: Product[], currentInventory: any[], onSave: (counts: ClosureCount[]) => void }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [counts, setCounts] = useState<Record<string, number>>({});

    // Inicializar counts con valores actuales si existen
    useEffect(() => {
        const initialCounts: Record<string, number> = {};
        (currentInventory || []).forEach(item => {
            const prod = catalog.find(p => p.nombre === item.articulo);
            if (prod) {
                initialCounts[prod.id] = item.fisico || 0;
            }
        });
        setCounts(initialCounts);
    }, [currentInventory, catalog]);

    const filteredProducts = (catalog || []).filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const updateCount = (id: string, val: string) => {
        const num = parseFloat(val);
        setCounts(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
    };

    const handleSave = () => {
        const finalCounts: ClosureCount[] = Object.entries(counts)
            .filter(([_, fisico]) => fisico !== undefined)
            .map(([id, fisico]) => {
                const prod = catalog.find(p => p.id === id)!;
                return { ...prod, fisico };
            });
        onSave(finalCounts);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2rem] text-white shadow-xl">
                <h2 className="text-3xl font-black tracking-tight mb-2">Conteo Final</h2>
                <p className="text-indigo-50/80 font-medium">Ingresa el conteo físico final de cada producto al cierre del turno.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar producto para contar..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                    >
                        <CheckCircle2 size={18} /> FINALIZAR CONTEO
                    </button>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 z-10 bg-slate-50 uppercase text-[10px] font-black text-slate-500 tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-4">Producto</th>
                                <th className="px-8 py-4 text-center">Unidad</th>
                                <th className="px-8 py-4 text-center w-40">Conteo Físico</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-slate-800">{product.nombre}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-black">{product.unidad}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 text-center text-lg font-black text-indigo-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            placeholder="0"
                                            value={counts[product.id] === 0 ? "0" : counts[product.id] || ""}
                                            onChange={(e) => updateCount(product.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-[2.5rem] shadow-xl border border-slate-200 mt-4">
                <div className="size-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                    <Box className="size-12 text-slate-400" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 text-center tracking-tight">No hay reportes activos</h2>
                <p className="text-slate-500 text-center mt-3 max-w-sm font-medium">El área de inventarios aún no ha aprobado la revisión operativa para tu turno actual.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-4">
            {/* Banner Superior de Resumen (Light & Modern) */}
            <div className={cn(
                "p-10 rounded-[2.5rem] shadow-xl border flex flex-col md:flex-row items-center justify-between gap-8",
                totalFugas > 0 ? "bg-gradient-to-br from-rose-50 to-white border-rose-100" : "bg-gradient-to-br from-emerald-50 to-white border-emerald-100"
            )}>
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "size-20 rounded-3xl flex items-center justify-center shadow-lg",
                        totalFugas > 0 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                    )}>
                        {totalFugas > 0 ? <AlertTriangle size={36} /> : <CheckCircle2 size={36} />}
                    </div>
                    <div>
                        <h2 className={cn("text-3xl font-black tracking-tight", totalFugas > 0 ? "text-rose-900" : "text-emerald-900")}>
                            {totalFugas > 0 ? `🚨 ¡Atención! Faltan ${totalFugas} unidades` : "✅ Cuadre Perfecto"}
                        </h2>
                        <p className={cn("text-base font-bold mt-1 opacity-60", totalFugas > 0 ? "text-rose-700" : "text-emerald-700")}>
                            Resultados comparativos del sistema vs Conteo Físico
                        </p>
                    </div>
                </div>
                {totalFugas > 0 && (
                    <div className="bg-white px-8 py-5 rounded-3xl shadow-lg border border-rose-100 flex flex-col items-center md:items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacto Financiero</span>
                        <div className="flex items-center gap-1 text-rose-600 font-black text-4xl">
                            <DollarSign size={24} className="mt-1" />
                            {totalCostoPerdido.toLocaleString("es-CO")}
                        </div>
                    </div>
                )}
            </div>

            {/* Grid de Tarjetas de Productos Reportados (Light Mode) */}
            <h3 className="text-xl font-black text-slate-900 px-4 mt-8 mb-4 uppercase tracking-tighter">Detalle de Discrepancias:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.map(item => {
                    const hasLoss = item.fugaUnits > 0;
                    const hasGain = item.fugaUnits < 0;

                    return (
                        <div key={item.id} className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">

                            {/* Color Side Bar */}
                            <div className={cn(
                                "absolute top-0 left-0 bottom-0 w-2",
                                hasLoss ? "bg-rose-500" : hasGain ? "bg-emerald-500" : "bg-slate-200"
                            )}></div>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 leading-tight">{item.articulo}</h4>
                                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wider">Ref Gamasoft #{item.id}</p>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                                    hasLoss ? "bg-rose-100 text-rose-600" :
                                        hasGain ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
                                )}>
                                    {hasLoss ? "Faltante" : hasGain ? "Sobrante" : "Cuadrado"}
                                </div>
                            </div>

                            {/* Comparison Graphic (Light) */}
                            <div className="grid grid-cols-3 gap-2 mb-8 items-center">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Sistema</p>
                                    <p className="text-3xl font-black text-slate-900">{item.teorico}</p>
                                </div>
                                <div className="flex justify-center">
                                    <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 font-black text-xs">VS</div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Físico</p>
                                    <p className={cn(
                                        "text-3xl font-black",
                                        hasLoss ? "text-rose-600" : hasGain ? "text-emerald-600" : "text-slate-900"
                                    )}>{item.fisico}</p>
                                </div>
                            </div>

                            {/* Visual Progress Bar (Light) */}
                            <div className="mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                    <span className="text-slate-400">Precisión del Conteo</span>
                                    <span className={hasLoss ? "text-rose-600" : "text-emerald-600"}>
                                        {((item.fisico / item.teorico) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-1000 ease-out", hasLoss ? "bg-rose-500" : "bg-emerald-500")}
                                        style={{ width: `${Math.min((item.fisico / item.teorico) * 100, 100).toFixed(0)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Impacto Message (Light) */}
                            <div className="mt-auto">
                                {hasLoss ? (
                                    <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-100 text-sm font-bold flex gap-3">
                                        <AlertTriangle size={20} className="shrink-0 text-rose-600 mt-0.5" />
                                        <span>Faltan <b>{item.fugaUnits}</b> unidades (${item.costoLoss.toLocaleString('es-CO')}).</span>
                                    </div>
                                ) : hasGain ? (
                                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 text-sm font-bold flex gap-3">
                                        <TrendingUp size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                                        <span>Tienes <b>{Math.abs(item.fugaUnits)}</b> unidades extra.</span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 text-slate-600 p-4 rounded-2xl border border-slate-100 text-sm font-bold flex gap-3 justify-center">
                                        <CheckCircle2 size={20} className="shrink-0 text-emerald-500 mt-0.5" />
                                        <span>¡Cantidades exactas!</span>
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

function ExcelPreviewModal({ data, detectedSucursal, onClose, onConfirm, missingItems = [], mappedItems = [] }: { data: any[], detectedSucursal: string, onClose: () => void, onConfirm: (data: any[]) => void, missingItems?: string[], mappedItems?: string[] }) {
    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <FileSpreadsheet className="text-cyan-600" /> Previsualización de Carga
                            </h2>
                            <p className="text-slate-500 text-sm">Verificación de datos operativos antes de sincronizar</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
                            <MapPin size={16} className="text-cyan-600" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Sede Detectada:</span>
                            <span className="text-sm font-black text-cyan-700">{detectedSucursal}</span>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
                            <Box size={16} className="text-emerald-600" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Productos:</span>
                            <span className="text-sm font-black text-emerald-700">{data.length}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col xl:flex-row gap-4 max-h-[300px] overflow-hidden">
                        {mappedItems.length > 0 && (
                            <div className="flex-1 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden flex-col md:flex-row shrink-0">
                                <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Check className="text-emerald-600" size={20} />
                                </div>
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <p className="text-sm font-black text-emerald-900 uppercase tracking-tight shrink-0">✨ Mapeados Correctamente</p>
                                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed shrink-0">
                                        <span className="font-bold">{mappedItems.length} artículos</span> identificados y procesados:
                                    </p>
                                    <div className="mt-3 bg-white/60 p-3 rounded-xl border border-emerald-200/50 overflow-y-auto flex-1 font-mono text-emerald-800 text-[11px] leading-relaxed">
                                        <div className="columns-1 md:columns-2 gap-4">
                                            {mappedItems.map((item, idx) => (
                                                <div key={idx} className="truncate break-inside-avoid py-0.5"><Check size={10} className="inline mr-1 text-emerald-500"/>{item}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {missingItems.length > 0 && (
                            <div className="flex-1 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden flex-col md:flex-row shrink-0">
                                <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="text-amber-600" size={20} />
                                </div>
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <p className="text-sm font-black text-amber-900 uppercase tracking-tight shrink-0">⚠️ Recetas Faltantes</p>
                                    <p className="text-xs text-amber-700 mt-1 leading-relaxed shrink-0">
                                        <span className="font-bold">{missingItems.length} artículos</span> no encontrados. Debes crearlos en el Recetario:
                                    </p>
                                    <div className="mt-3 bg-white/60 p-3 rounded-xl border border-amber-200/50 overflow-y-auto flex-1 font-mono text-amber-800 text-[11px] leading-relaxed">
                                        <div className="columns-1 md:columns-2 gap-4">
                                            {missingItems.map((item, idx) => (
                                                <div key={idx} className="truncate break-inside-avoid py-0.5">• {item}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-[200px] relative">
                    <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 z-20 text-slate-400">
                            <tr>
                                <th className="bg-slate-50 py-4 px-2 font-black uppercase tracking-widest text-left shadow-[0_1px_0_0_#e2e8f0]">Artículo</th>
                                <th className="bg-slate-50 py-4 px-2 font-black uppercase tracking-widest text-right shadow-[0_1px_0_0_#e2e8f0]">Inicial</th>
                                <th className="bg-slate-50 py-4 px-2 font-black uppercase tracking-widest text-right shadow-[0_1px_0_0_#e2e8f0]">Ventas</th>
                                <th className="bg-slate-50 py-4 px-2 font-black uppercase tracking-widest text-right shadow-[0_1px_0_0_#e2e8f0]">Teórico</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.slice(0, 50).map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 font-bold text-slate-900">{row.articulo}</td>
                                    <td className="py-4 text-right text-slate-500 font-medium">{row.inicial}</td>
                                    <td className="py-4 text-right text-amber-600 font-bold">{row.salidaVentas}</td>
                                    <td className="py-4 text-right text-cyan-700 font-black">{row.teorico}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {data.length > 50 && (
                        <p className="text-center py-6 text-slate-600 font-medium italic">... y {data.length - 50} artículos más</p>
                    )}
                </div>

                <div className="p-8 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-900 transition-all"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={() => onConfirm(data)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-md flex items-center gap-2"
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
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Análisis de Consumo Operativo</h2>
                    <p className="text-slate-500 text-sm font-medium italic">Reportes de rotación y tendencias para optimización de compras</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 mr-4">
                        <button
                            onClick={() => setPeriod("WEEKLY")}
                            className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", period === "WEEKLY" ? "bg-white text-cyan-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900")}
                        >
                            SEMANAL
                        </button>
                        <button
                            onClick={() => setPeriod("MONTHLY")}
                            className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", period === "MONTHLY" ? "bg-white text-cyan-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900")}
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
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl flex flex-col">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-600" /> Top 5 Alta Rotación
                    </h3>
                    <div className="space-y-6 flex-1">
                        {topProducts.map((product, idx) => (
                            <div key={product.id} className="relative">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold text-slate-900">{product.articulo}</span>
                                    <span className="text-xs font-black text-emerald-600">{product.salidaVentas} UND</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                                        style={{ width: `${(product.salidaVentas / topProducts[0].salidaVentas) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Sugerencia de Abastecimiento:</p>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed italic">Considerar aumento de stock de seguridad para <b>{topProducts[0]?.articulo}</b> por alta demanda.</p>
                    </div>
                </div>

                {/* Gráfico de Tendencia */}
                <div className="xl:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity size={16} className="text-cyan-600" /> Tendencia de Consumo Histórico
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                        {inventoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { name: 'Sem 1', proteina: 400, bebidas: 240, secos: 300 },
                                    { name: 'Sem 2', proteina: 300, bebidas: 430, secos: 200 },
                                    { name: 'Sem 3', proteina: 550, bebidas: 380, secos: 350 },
                                    { name: 'Sem 4', proteina: 480, bebidas: 290, secos: 410 },
                                ]}>
                                    <defs>
                                        <linearGradient id="colorProteina" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="proteina" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorProteina)" strokeWidth={3} name="Proteínas" />
                                    <Area type="monotone" dataKey="bebidas" stroke="#10b981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" name="Bebidas" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center">
                                <Activity className="size-10 text-slate-100 mx-auto mb-2" />
                                <p className="text-slate-400 text-xs">Sin historial de consumo</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla Detallada de Consumo */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mt-8">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Reporte Detallado por Item: {activeSucursal}</h3>
                    <button className="flex items-center gap-2 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors">
                        <FileSpreadsheet size={16} /> EXPORTAR REPORTE
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">Artículo</th>
                                <th className="px-8 py-5 text-center">Consumo (Salidas)</th>
                                <th className="px-8 py-5 text-right">Costo Unitario</th>
                                <th className="px-8 py-5 text-right">Costo Total Periodo</th>
                                <th className="px-8 py-5 text-center">Nivel de Rotación</th>
                                <th className="px-8 py-5 text-center">Ult. Movimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inventoryData
                                .filter(item => activeSucursal === "Todas" || item.sucursal === activeSucursal)
                                .map(item => {
                                    const rotationStatus = item.salidaVentas > 30 ? "ALTA" : item.salidaVentas > 15 ? "MEDIA" : "BAJA";
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-8 py-5 font-bold text-slate-900">{item.articulo}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-lg font-black text-slate-900">{item.salidaVentas}</span>
                                                <span className="text-[10px] text-slate-400 ml-1 uppercase font-bold">{item.unidad || 'UND'}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-medium text-slate-400">
                                                ${item.costo.toLocaleString('es-CO')}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black text-slate-900">${(item.salidaVentas * item.costo).toLocaleString('es-CO')}</span>
                                                    <span className="text-[9px] text-cyan-600 font-bold uppercase tracking-tighter">Impacto en Caja</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black border",
                                                    rotationStatus === "ALTA" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                        rotationStatus === "MEDIA" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                            "bg-slate-100 text-slate-500 border-slate-200"
                                                )}>
                                                    {rotationStatus}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center text-[10px] font-bold text-slate-400 uppercase">
                                                Hace 2 horas
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
    const totalMermas = data.reduce((acc, curr) => acc + (curr.mermas * curr.costo), 0);
    const topRotation = [...data].sort((a, b) => b.salidaVentas - a.salidaVentas).slice(0, 5);
    const totalItems = data.length;

    return (
        <div id="report-modal-overlay" className="fixed inset-0 z-[160] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-0 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl w-full my-auto animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-6 no-print px-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-white flex items-center justify-center text-cyan-600 border border-slate-200 shadow-sm">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h2 className="text-slate-900 font-black text-xl tracking-tight leading-none uppercase">Reporte Operativo de Alto Nivel</h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Inteligencia de Negocios · Gamasoft</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="group relative overflow-hidden bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Printer size={18} /> GENERAR DOCUMENTO OFICIAL
                            </span>
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-white hover:bg-slate-50 text-slate-400 hover:text-rose-600 p-3.5 rounded-2xl border border-slate-200 transition-all shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div id="financial-report" className="bg-white text-slate-900 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden font-sans border border-slate-200 print:m-0 print:rounded-none print:shadow-none min-h-[11in] relative print:block print:w-[210mm] print:bg-white report-container">
                    <div className="relative h-2 bg-gradient-to-r from-cyan-600 via-slate-700 to-emerald-600 no-print"></div>

                    <div className="p-10 md:p-20 relative print:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] rounded-md mb-6 border border-slate-200">
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
                                <div className="bg-white border-2 border-slate-900 text-slate-900 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group min-w-[320px] print:p-8 print:min-w-0 print:w-full">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Activity size={80} className="text-slate-900" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.4em] mb-4 text-slate-400">Total Financiero (Costos+Mermas)</p>
                                    <p className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4">
                                        ${(totalCosto + totalMermas).toLocaleString('es-CO')}
                                    </p>
                                    <div className="flex gap-4 mb-6">
                                        <div className="h-1.5 flex-1 bg-cyan-600 rounded-full"></div>
                                        <div className="h-1.5 flex-[0.3] bg-rose-500 rounded-full"></div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Costo Consumo: ${totalCosto.toLocaleString('es-CO')}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Mermas Reportadas: ${totalMermas.toLocaleString('es-CO')}</p>
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
                            <div className="rounded-[1.5rem] border border-slate-200 overflow-hidden bg-white print:border-slate-300 shadow-sm">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-900 text-left border-b border-slate-200">
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Artículo</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">Rotación</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-right">Monto</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-right">%</th>
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
                                <div className="bg-slate-50 border border-slate-200 p-6 rounded-[1.5rem] plan-box">
                                    <p className="text-xs text-slate-500 font-bold mb-4">Pedidos automáticos inteligentes (Smart Orders):</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white border border-slate-100 p-3 rounded-xl font-mono text-[10px] text-cyan-600 shadow-sm">APROBACIÓN: AUTO</div>
                                        <div className="bg-white border border-slate-100 p-3 rounded-xl font-mono text-[10px] text-emerald-600 shadow-sm">STOCK SUGERIDO: +12%</div>
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
                        .plan-box { background-color: #f8fafc !important; color: #0f172a !important; border: 0.5pt solid #e2e8f0 !important; }
                        table { width: 100% !important; border-spacing: 0 !important; }
                        th { background-color: #f8fafc !important; color: #0f172a !important; padding: 8pt !important; font-size: 8pt !important; border-bottom: 0.5pt solid #e2e8f0 !important; }
                        td { padding: 8pt !important; border-bottom: 0.5pt solid #f1f5f9 !important; }
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

    const filteredCatalog = (catalog || []).filter(p =>
        p && p.nombre && p.nombre.toLowerCase().includes((searchTerm || "").toLowerCase())
    );

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
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Catálogo Maestro de Productos</h2>
                    <p className="text-slate-500 text-sm font-medium">Define nombres, unidades y costos base para el cuadre financiero</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-md flex items-center gap-2"
                >
                    <Plus size={18} /> AGREGAR PRODUCTO
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100">
                                <th className="px-8 py-5">Cod</th>
                                <th className="px-8 py-5">Nombre del Producto</th>
                                <th className="px-8 py-5">Unidad</th>
                                <th className="px-8 py-5 text-right">Costo Unitario (Sugerido)</th>
                                <th className="px-8 py-5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredCatalog.map(item => (
                                <EditableCatalogRow
                                    key={item.id}
                                    product={item}
                                    onSave={(updated) => {
                                        const newCatalog = catalog.map(p => p.id === updated.id ? updated : p);
                                        onUpdateCatalog(newCatalog);
                                    }}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Componente del Modal de Impresión */}
            <LabelPrinterModal />

            {isAdding && (
                <div className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
                        <h3 className="text-xl font-black text-slate-900 mb-6">Nuevo Producto Maestro</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nombre del Artículo (Igual al Excel)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                                    placeholder="Ej: Pollo, Coca Cola..."
                                    value={newProduct.nombre}
                                    onChange={e => setNewProduct({ ...newProduct, nombre: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Unidad de Medida</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                                        value={newProduct.unidad}
                                        onChange={e => setNewProduct({ ...newProduct, unidad: e.target.value })}
                                    >
                                        <option value="UND">Unidad (UND)</option>
                                        <option value="KG">Kilogramo (KG)</option>
                                        <option value="GR">Gramo (GR)</option>
                                        <option value="PORC">Porción (PORC)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Costo Sugerido</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                                        value={newProduct.costoPorUnidad}
                                        onChange={e => setNewProduct({ ...newProduct, costoPorUnidad: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-4 rounded-2xl font-black text-sm transition-all shadow-md"
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

function EditableCatalogRow({ product, onSave }: { product: Product, onSave: (p: Product) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...product });

    if (isEditing) {
        return (
            <tr className="bg-cyan-50/30">
                <td className="px-8 py-4 text-xs font-mono text-slate-400">{product.id.substring(0, 8)}...</td>
                <td className="px-8 py-4">
                    <input
                        type="text"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-cyan-500/20"
                        value={editData.nombre}
                        onChange={e => setEditData({ ...editData, nombre: e.target.value })}
                    />
                </td>
                <td className="px-8 py-4">
                    <select
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-black uppercase focus:ring-2 focus:ring-cyan-500/20"
                        value={editData.unidad}
                        onChange={e => setEditData({ ...editData, unidad: e.target.value })}
                    >
                        <option value="UND">UND</option>
                        <option value="KG">KG</option>
                        <option value="GR">GR</option>
                        <option value="PORC">PORC</option>
                        <option value="LT">LT</option>
                        <option value="ML">ML</option>
                    </select>
                </td>
                <td className="px-8 py-4 text-right">
                    <input
                        type="number"
                        className="w-32 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-black text-cyan-700 text-right focus:ring-2 focus:ring-cyan-500/20"
                        value={editData.costoPorUnidad}
                        onChange={e => setEditData({ ...editData, costoPorUnidad: Number(e.target.value) })}
                    />
                </td>
                <td className="px-8 py-4">
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => {
                                onSave(editData);
                                setIsEditing(false);
                            }}
                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            title="Guardar"
                        >
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => {
                                setEditData({ ...product });
                                setIsEditing(false);
                            }}
                            className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                            title="Cancelar"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-slate-50 transition-colors group">
            <td className="px-8 py-5 text-xs font-mono text-slate-400">{product.id.substring(0, 8)}...</td>
            <td className="px-8 py-5 font-bold text-slate-900">{product.nombre}</td>
            <td className="px-8 py-5">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase border border-slate-200">
                    {product.unidad}
                </span>
            </td>
            <td className="px-8 py-5 text-right font-black text-cyan-700">
                ${product.costoPorUnidad.toLocaleString('es-CO')}
            </td>
            <td className="px-8 py-5 text-center flex justify-center gap-2">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Editar"
                >
                    <MoreVertical size={16} />
                </button>
                <button
                    onClick={() => {
                        const event = new CustomEvent('open-label-printer', { detail: product });
                        window.dispatchEvent(event);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Imprimir Rótulo (Impresora Térmica)"
                >
                    <Printer size={16} />
                </button>
            </td>
        </tr>
    );
}

function LabelPrinterModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [labelData, setLabelData] = useState({
        pesoNeto: "100 g",
        porciones: "1",
        ingredientes: "",
        instruccionesUso: "Una vez abierto preparar en el menor tiempo posible",
        instruccionesConservacion: "Mantener a temperatura de Refrigeración 0 a 4°C",
        lote: "",
        venceDias: "5"
    });

    useEffect(() => {
        const handleOpen = (e: any) => {
            setProduct(e.detail);
            const now = new Date();
            const dia = String(now.getDate()).padStart(2, '0');
            const mes = String(now.getMonth() + 1).padStart(2, '0');
            const anio = now.getFullYear();
            setLabelData((prev) => ({ ...prev, lote: `${dia} ${mes} ${anio}` }));
            setIsOpen(true);
        };
        window.addEventListener('open-label-printer', handleOpen);
        return () => window.removeEventListener('open-label-printer', handleOpen);
    }, []);

    const handlePrint = () => {
        if (!product) return;
        const printFrame = document.createElement("iframe");
        printFrame.style.position = "fixed";
        printFrame.style.width = "80mm";
        printFrame.style.height = "50mm";
        printFrame.style.top = "-9999px";

        document.body.appendChild(printFrame);
        const doc = printFrame.contentWindow?.document;

        if (doc) {
            doc.open();
            doc.write(`
                <html>
                <head>
                    <style>
                        @page { margin: 0; size: 80mm 50mm; }
                        body { 
                            margin: 0; 
                            padding: 4px; 
                            font-family: Arial, Helvetica, sans-serif; 
                            width: 80mm; 
                            height: 50mm; 
                            overflow: hidden;
                            box-sizing: border-box;
                        }
                        .container {
                            border: 2px solid black;
                            padding: 4px;
                            height: 100%;
                            width: 100%;
                            box-sizing: border-box;
                            border-radius: 4px;
                        }
                        .text-center { text-align: center; }
                        .text-left { text-align: left; }
                        .font-black { font-weight: 900; }
                        .font-bold { font-weight: 700; }
                        .font-medium { font-weight: 500; }
                        .text-lg { font-size: 16px; line-height: 1.1; }
                        .text-sm { font-size: 11px; line-height: 1.1; }
                        .text-xs { font-size: 9px; line-height: 1.1; }
                        .font-8 { font-size: 8px; line-height: 1.1; }
                        .font-7 { font-size: 7.5px; line-height: 1.1; }
                        .font-6 { font-size: 6.5px; line-height: 1.1; }
                        .uppercase { text-transform: uppercase; }
                        .mb-0 { margin-bottom: 2px; }
                        .mb-1 { margin-bottom: 4px; }
                        .mb-2 { margin-bottom: 6px; }
                        .flex { display: flex; }
                        .justify-between { justify-content: space-between; }
                        .w-full { width: 100%; }
                        .w-half { width: 48%; }
                        
                        /* Fix overflow with truncation */
                        .truncate {
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="text-center font-black text-lg truncate mb-0">${product.nombre}</div>
                        <div class="text-center font-bold text-sm mb-0">PESO NETO: ${labelData.pesoNeto}</div>
                        <div class="text-center font-bold text-xs mb-1">Porciones ${labelData.porciones}</div>

                        <div class="text-center font-7 mb-1 font-medium w-full">
                            <div>Fabricado Por: <strong class="font-black">THE CHEESE WHEEL CO</strong></div>
                            <div>Establecimiento: TCW Co - Quinta Camacho</div>
                            <div>Dirección: Carrera 9 # 70a - 11</div>
                            <div>rafaelcebu@gmail.com</div>
                            <div>Servicio al cliente: 316 4620545</div>
                        </div>

                        <div class="text-center font-7 font-bold mb-1 uppercase">
                            INGREDIENTES: <span class="font-medium" style="text-transform: none;">${labelData.ingredientes}</span>
                        </div>

                        <div class="flex justify-between font-6 mb-2 w-full mt-1">
                            <div class="w-half text-left" style="padding-right: 2px;">
                                <div class="font-bold uppercase" style="margin-bottom: 1px;">INSTRUCCIONES DE USO:</div> 
                                <div style="line-height: 1.2;">${labelData.instruccionesUso}</div>
                            </div>
                            <div class="w-half text-left" style="padding-left: 2px;">
                                <div class="font-bold uppercase" style="margin-bottom: 1px;">INSTRUCCIONES DE CONSERVACION:</div> 
                                <div style="line-height: 1.2;">${labelData.instruccionesConservacion}</div>
                            </div>
                        </div>

                        <div class="text-center font-6 font-bold uppercase mb-2">
                            MATERIA PRIMA PARA USO EXCLUSIVO DE LA INDUSTRIA GASTRONÓMICA
                        </div>

                        <div class="font-7 font-medium text-left w-full">
                            <div>LOTE: ${labelData.lote} de fabricación</div>
                            <div>VENCE: ${labelData.venceDias} (días) contados desde el día de fabricación: ${venceString}</div>
                        </div>
                    </div>
                </body>
                </html>
            `);
            doc.close();
            setTimeout(() => {
                printFrame.contentWindow?.focus();
                printFrame.contentWindow?.print();

                // Cleanup after print dialog closes
                setTimeout(() => {
                    if (document.body.contains(printFrame)) {
                        document.body.removeChild(printFrame);
                    }
                }, 1000);
            }, 250);
        }
    };

    if (!isOpen || !product) return null;

    // Calcular fecha de vencimiento
    const vDate = new Date();
    vDate.setDate(vDate.getDate() + (Number(labelData.venceDias) || 0));
    const vDia = String(vDate.getDate()).padStart(2, '0');
    const vMes = String(vDate.getMonth() + 1).padStart(2, '0');
    const vAnio = vDate.getFullYear();
    const venceString = `${vDia}/${vMes}/${vAnio}`;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Modal de Configuración */}
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2">
                            <Printer className="text-indigo-600" /> Imprimir Rótulo
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Configura los datos sanitarios para {product.nombre}</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso Neto</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={labelData.pesoNeto} onChange={e => setLabelData({ ...labelData, pesoNeto: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Porciones</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={labelData.porciones} onChange={e => setLabelData({ ...labelData, porciones: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingredientes</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={labelData.ingredientes} onChange={e => setLabelData({ ...labelData, ingredientes: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Instrucciones de Uso</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={labelData.instruccionesUso} onChange={e => setLabelData({ ...labelData, instruccionesUso: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Instrucciones de Conservación</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={labelData.instruccionesConservacion} onChange={e => setLabelData({ ...labelData, instruccionesConservacion: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lote (Fecha Fab.)</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={labelData.lote} onChange={e => setLabelData({ ...labelData, lote: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Días de Vencimiento</label>
                            <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={labelData.venceDias} onChange={e => setLabelData({ ...labelData, venceDias: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setIsOpen(false)} className="flex-1 px-4 py-3 text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={handlePrint} className="flex-1 px-4 py-3 text-white font-black bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
                        <Printer size={18} /> IMPRIMIR RÓTULO
                    </button>
                </div>
            </div>
        </div>
    );
}



interface PurchaseEntry extends Product {
    cantidad: number;
}

function PurchasesPanel({ catalog, onSaveEntries }: { catalog: Product[], onSaveEntries: (entries: PurchaseEntry[]) => void }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEntries, setSelectedEntries] = useState<PurchaseEntry[]>([]);

    const filteredProducts = (catalog || []).filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Limit to top 5 for quick access

    const addEntry = (product: Product) => {
        const existing = selectedEntries.find(e => e.id === product.id);
        if (existing) {
            setSelectedEntries(selectedEntries.map(e => e.id === product.id ? { ...e, cantidad: e.cantidad + 1 } : e));
        } else {
            setSelectedEntries([...selectedEntries, { ...product, cantidad: 1 }]);
        }
    };

    const updateQuantity = (id: string, qty: number) => {
        if (qty <= 0) {
            setSelectedEntries(selectedEntries.filter(e => e.id !== id));
        } else {
            setSelectedEntries(selectedEntries.map(e => e.id === id ? { ...e, cantidad: qty } : e));
        }
    };

    const totalCost = selectedEntries.reduce((acc, curr) => acc + (curr.cantidad * curr.costoPorUnidad), 0);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[2rem] text-white shadow-xl">
                <h2 className="text-3xl font-black tracking-tight mb-2">Cargue Rápido de Compras</h2>
                <p className="text-emerald-50/80 font-medium">Registra entradas de mercadería al inventario sin complicaciones</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Buscador de Productos */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Busca por nombre (ej: Lecha, Pollo...)"
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {searchTerm.length > 1 && filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addEntry(product)}
                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex justify-between items-center group text-left"
                            >
                                <div>
                                    <p className="font-black text-slate-800">{product.nombre}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase">{product.unidad}</p>
                                </div>
                                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <Plus size={20} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Carga Actual */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl flex flex-col overflow-hidden min-h-[400px]">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Resumen de Entrada</h3>
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">{selectedEntries.length} ITEMS</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {selectedEntries.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center">
                                <Box size={48} className="mb-4 opacity-20" />
                                <p className="font-bold">No has seleccionado artículos</p>
                                <p className="text-xs">Usa el buscador para añadir entradas</p>
                            </div>
                        ) : (
                            selectedEntries.map(entry => (
                                <div key={entry.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-sm leading-tight">{entry.nombre}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase">${entry.costoPorUnidad.toLocaleString()} / {entry.unidad}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            className="w-20 bg-white border border-slate-200 rounded-xl py-2 text-center text-sm font-black focus:ring-2 focus:ring-emerald-500/20"
                                            value={entry.cantidad}
                                            onChange={(e) => updateQuantity(entry.id, Number(e.target.value))}
                                        />
                                        <button
                                            onClick={() => updateQuantity(entry.id, 0)}
                                            className="text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-8 bg-slate-50 border-t border-slate-200 space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Inversión Total</span>
                            <span className="text-2xl font-black text-slate-900">${totalCost.toLocaleString('es-CO')}</span>
                        </div>
                        <button
                            disabled={selectedEntries.length === 0}
                            onClick={() => onSaveEntries(selectedEntries)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3"
                        >
                            <CheckCircle2 size={24} /> GUARDAR ENTRADAS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChoosingView() { }

function PickingListModal({ req, onClose }: { req: Requisition, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-md w-full my-8 animate-in zoom-in duration-300">
                <div className="flex justify-end mb-4 no-print">
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-lg"
                        >
                            <Printer size={16} /> IMPRIMIR (80mm)
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-sm"
                        >
                            CERRAR
                        </button>
                    </div>
                </div>

                {/* PDF Design Container - Optimized for 80mm */}
                <div className="bg-white text-slate-900 p-6 rounded-sm shadow-2xl font-mono text-[11px] leading-tight print:m-0 print:p-2 print:shadow-none mx-auto" id="picking-list" style={{ width: '80mm' }}>
                    <div className="text-center border-b border-black border-dashed pb-4 mb-4">
                        <h1 className="text-xl font-black tracking-tighter uppercase mb-1 italic">Cheese<span className="not-italic opacity-70">Wheel</span></h1>
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
        cyan: "text-cyan-600 bg-cyan-50 border-cyan-200",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
        rose: "text-rose-600 bg-rose-50 border-rose-200",
    };

    return (
        <div className={cn(
            "bg-white rounded-2xl p-5 border border-slate-200 relative overflow-hidden group shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
            alert && "border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
        )}>
            {alert && <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10" />}
            <div className="flex justify-between items-start z-10 relative">
                <div className="space-y-1 md:space-y-2 overflow-hidden">
                    <p className="text-slate-500 font-bold text-[10px] md:text-sm tracking-wide truncate">{title}</p>
                    <p className={cn("text-xl md:text-3xl font-black tracking-tight truncate", alert ? "text-rose-600" : "text-slate-900")}>{value}</p>
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
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Puntos de Venta (Sedes)</h2>
                    <p className="text-slate-500 text-sm">Gestiona la infraestructura operativa de la red</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-md"
                >
                    NUEVA SEDE
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sedes.map(sede => (
                    <div key={sede.id} className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-emerald-400 transition-all group shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <MapPin size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded tracking-widest uppercase border border-slate-200">{sede.prefijo}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{sede.nombre}</h3>
                        <p className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                            {sede.ubicacion}
                        </p>
                    </div>
                ))}
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Nueva Sede Operativa</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre de la Sede</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
                                    value={newItem.nombre}
                                    onChange={e => setNewItem({ ...newItem, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Dirección / Ubicación</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
                                    value={newItem.ubicacion}
                                    onChange={e => setNewItem({ ...newItem, ubicacion: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Prefijo (e.g. BOG)</label>
                                <input
                                    type="text"
                                    maxLength={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
                                    value={newItem.prefijo}
                                    onChange={e => setNewItem({ ...newItem, prefijo: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-xl"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={() => {
                                        onAdd(newItem);
                                        setIsAdding(false);
                                        setNewItem({ nombre: "", ubicacion: "", prefijo: "" });
                                    }}
                                    className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl shadow-md"
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

function UsersPanel({ users, sedes, onAdd, onUpdate, notify }: { users: UserAccount[], sedes: Sede[], onAdd: (u: any) => Promise<void>, onUpdate: (u: UserAccount) => Promise<void>, notify: (msg: string, type?: NotificationType) => void }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ nombre: "", email: "", password: "", rol: "CASHIER" as Role, sedeId: sedes[0]?.id || "" });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Gestión de Usuarios</h2>
                    <p className="text-slate-500 text-sm">Control de accesos y responsabilidades por sede</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-md"
                >
                    NUEVO USUARIO
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-500 tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5">Nombre</th>
                            <th className="px-8 py-5">Rol</th>
                            <th className="px-8 py-5">Sede Asignada</th>
                            <th className="px-8 py-5">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map(user => (
                            <EditableUserRow
                                key={user.id}
                                user={user}
                                sedes={sedes}
                                onSave={onUpdate}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Crear Usuario Operativo</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                                    value={newItem.nombre}
                                    onChange={e => setNewItem({ ...newItem, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                                    value={newItem.email}
                                    onChange={e => setNewItem({ ...newItem, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contraseña Inicial</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                                    value={newItem.password}
                                    onChange={e => setNewItem({ ...newItem, password: e.target.value })}
                                    placeholder="Mín. 6 caracteres"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rol</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none tracking-tight shadow-inner"
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
                                        <option value="CASHIER">Cajero</option>
                                        <option value="SUPERVISOR">Supervisor</option>
                                        <option value="ANALYST">Analista</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sede Asignada</label>
                                    <select
                                        className={cn(
                                            "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none tracking-tight transition-all shadow-inner",
                                            newItem.rol !== "CASHIER" && "opacity-50 pointer-events-none bg-slate-100"
                                        )}
                                        value={newItem.sedeId}
                                        onChange={e => setNewItem({ ...newItem, sedeId: e.target.value })}
                                        disabled={newItem.rol !== "CASHIER"}
                                    >
                                        <option value="">{newItem.rol === "CASHIER" ? "-- Seleccionar Sede --" : "Acceso Global (Todas)"}</option>
                                        {sedes.map(s => (
                                            <option key={s.id} value={s.id}>{s.nombre}</option>
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
                                            notify("La contraseña debe tener al menos 6 caracteres.", "warning");
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

function EditableUserRow({ user, sedes, onSave }: { user: UserAccount, sedes: Sede[], onSave: (u: UserAccount) => Promise<void> }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...user });

    if (isEditing) {
        return (
            <tr className="bg-cyan-50/30 transition-colors">
                <td className="px-8 py-4">
                    <input
                        type="text"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-cyan-500/20"
                        value={editData.nombre}
                        onChange={e => setEditData({ ...editData, nombre: e.target.value })}
                    />
                    <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                </td>
                <td className="px-8 py-4">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black tracking-widest",
                        user.rol === 'ADMIN' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                    )}>
                        {user.rol}
                    </span>
                </td>
                <td className="px-8 py-4">
                    <select
                        className={cn(
                            "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-cyan-500/20 transition-all",
                            user.rol !== "CASHIER" && "opacity-50 pointer-events-none bg-slate-100"
                        )}
                        value={editData.sedeId || ""}
                        onChange={e => setEditData({ ...editData, sedeId: e.target.value })}
                        disabled={user.rol !== "CASHIER"}
                    >
                        <option value="">{user.rol === "CASHIER" ? "-- Seleccionar Sede --" : "Acceso Global"}</option>
                        {sedes.map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                        ))}
                    </select>
                </td>
                <td className="px-8 py-4 text-center">
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={async () => {
                                await onSave(editData);
                                setIsEditing(false);
                            }}
                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                            title="Guardar"
                        >
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => {
                                setEditData({ ...user });
                                setIsEditing(false);
                            }}
                            className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                            title="Cancelar"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-slate-50 transition-colors group">
            <td className="px-8 py-5">
                <p className="font-bold text-slate-900 leading-tight">{user.nombre}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
            </td>
            <td className="px-8 py-5">
                <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black tracking-widest",
                    user.rol === 'ADMIN' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                )}>
                    {user.rol}
                </span>
            </td>
            <td className="px-8 py-5 text-slate-600 font-medium">
                {sedes.find(s => s.id === user.sedeId)?.nombre || 'Sin Sede Asignada'}
            </td>
            <td className="px-8 py-5 text-center">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Editar Usuario"
                >
                    <MoreVertical size={16} />
                </button>
            </td>
        </tr>
    );
}

interface WasteEntry extends Product {
    cantidad: number;
    motivo: string;
}

const WASTE_REASONS = [
    "Vencimiento",
    "Rotura / Daño",
    "Error de Preparación",
    "Mala Calidad / Insumo",
    "Otro / Desperdicio"
];

function WastePanel({ catalog, onSaveEntries }: { catalog: Product[], onSaveEntries: (entries: WasteEntry[]) => void }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEntries, setSelectedEntries] = useState<WasteEntry[]>([]);

    const filteredProducts = (catalog || []).filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const addEntry = (product: Product) => {
        const existing = selectedEntries.find(e => e.id === product.id);
        if (existing) {
            setSelectedEntries(selectedEntries.map(e => e.id === product.id ? { ...e, cantidad: e.cantidad + 1 } : e));
        } else {
            setSelectedEntries([...selectedEntries, { ...product, cantidad: 1, motivo: WASTE_REASONS[0] }]);
        }
    };

    const updateQuantity = (id: string, qty: number) => {
        if (qty <= 0) {
            setSelectedEntries(selectedEntries.filter(e => e.id !== id));
        } else {
            setSelectedEntries(selectedEntries.map(e => e.id === id ? { ...e, cantidad: qty } : e));
        }
    };

    const updateMotivo = (id: string, motivo: string) => {
        setSelectedEntries(selectedEntries.map(e => e.id === id ? { ...e, motivo } : e));
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-rose-600 to-pink-700 p-8 rounded-[2rem] text-white shadow-xl">
                <h2 className="text-3xl font-black tracking-tight mb-2">Registro de Bajas / Mermas</h2>
                <p className="text-rose-50/80 font-medium">Registra productos dañados, vencidos o errores de preparación al instante.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Busca por nombre..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold shadow-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {searchTerm.length > 1 && filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addEntry(product)}
                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-rose-500 hover:shadow-md transition-all flex justify-between items-center group text-left"
                            >
                                <div>
                                    <p className="font-bold text-slate-900">{product.nombre}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase">{product.unidad}</p>
                                </div>
                                <Plus size={18} className="text-slate-300 group-hover:text-rose-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full min-h-[400px]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Lista para dar de baja</h3>
                        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black">{selectedEntries.length} ITEMS</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedEntries.map(entry => (
                            <div key={entry.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900 text-sm leading-tight">{entry.nombre}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase">{entry.unidad}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <select
                                        className="text-[10px] font-black uppercase bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-500 focus:outline-none focus:border-rose-300"
                                        value={entry.motivo}
                                        onChange={(e) => updateMotivo(entry.id, e.target.value)}
                                    >
                                        {WASTE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            className="w-20 bg-white border border-slate-200 rounded-xl py-2 text-center font-black text-rose-600 focus:outline-none focus:border-rose-500 shadow-inner"
                                            value={entry.cantidad}
                                            step="0.1"
                                            onChange={(e) => updateQuantity(entry.id, Number(e.target.value))}
                                        />
                                        <button
                                            onClick={() => updateQuantity(entry.id, 0)}
                                            className="size-8 flex items-center justify-center bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {selectedEntries.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50 py-10">
                                <div className="size-16 rounded-3xl bg-slate-100 flex items-center justify-center">
                                    <Trash2 size={32} />
                                </div>
                                <p className="text-sm font-bold">No hay productos seleccionados</p>
                            </div>
                        )}
                    </div>

                    {selectedEntries.length > 0 && (
                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={() => onSaveEntries(selectedEntries)}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
                            >
                                CONFIRMAR BAJA DE PRODUCTOS
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function WasteHistoryPanel({ history, isLoading }: { history: any[], isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                <Loader2 className="size-10 text-rose-500 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cargando Historial...</p>
            </div>
        );
    }
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Historial de Bajas</h2>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Seguimiento detallado de mermas y desperdicios</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl text-center shadow-sm">
                        <p className="text-[10px] font-black text-rose-400 uppercase">Total Items</p>
                        <p className="text-2xl font-black text-rose-600">{history.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Producto</th>
                                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Fecha</th>
                                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Sede</th>
                                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Cantidad</th>
                                <th className="px-8 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Motivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history.map((reg) => (
                                <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-slate-900 leading-tight">{reg.products?.nombre || 'Producto Eliminado'}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{reg.products?.unidad}</p>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-600">
                                        {reg.fecha ? new Date(reg.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : 'Sin Fecha'}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                            {reg.sedes?.nombre || 'Desconocida'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-rose-600 text-lg">
                                        {reg.cantidad}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                                            reg.motivo === "Vencimiento" ? "bg-amber-100 text-amber-700" :
                                                reg.motivo === "Rotura / Daño" ? "bg-rose-100 text-rose-700" :
                                                    reg.motivo === "Error de Preparación" ? "bg-cyan-100 text-cyan-700" :
                                                        "bg-slate-100 text-slate-600"
                                        )}>
                                            <AlertTriangle size={12} />
                                            {reg.motivo}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center">
                                                <BookOpenText size={40} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg">Sin registros en el historial</p>
                                                <p className="text-sm font-medium text-slate-500">Las bajas que realices aparecerán listadas aquí.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
        <div className="fixed bottom-28 right-8 z-[70] w-[400px] h-[600px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header del Bot */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900">GamaAI Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">En Línea</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Cuerpo del Chat */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
                {messages.map((m: any, idx: number) => (
                    <div key={idx} className={cn(
                        "flex flex-col gap-2 max-w-[85%]",
                        m.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}>
                        <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                            m.role === 'user'
                                ? "bg-cyan-600 text-white font-medium rounded-tr-none"
                                : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none"
                        )}>
                            {m.content}
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {m.role === 'user' ? 'Tú' : 'GamaAI'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input del Chat */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {['Resumen de fugas', 'Sugerir traslados'].map(pill => (
                        <button
                            key={pill}
                            onClick={() => onSend(pill)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-900 hover:border-cyan-300 transition-all text-left shadow-sm"
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
                        className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
                    />
                    <button
                        type="submit"
                        className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all shadow-lg"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

function MobileInventoryMode({ data, onUpdateFisico, onUpdateMermas, onUpdateEntradas, canEdit }: any) {
    const [searchTerm, setSearchTerm] = useState("");
    const filtered = data.filter((item: any) => item.articulo.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-4 bg-slate-50 min-h-screen">
            <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md pb-4 pt-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Escanear o buscar producto..."
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                        <QrCode size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-4 mt-4">
                {filtered.map((item: any) => (
                    <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                        {/* Indicador de Estado lateral */}
                        <div className={cn(
                            "absolute top-0 left-0 w-2 h-full",
                            item.dif < 0 ? "bg-rose-500" : item.dif > 0 ? "bg-emerald-500" : "bg-cyan-500"
                        )} />

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-lg font-black text-slate-900 leading-none mb-1">{item.articulo}</h4>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.sucursal} • Stock Inicial: {item.inicial}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    item.dif < 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    Dif: {item.dif}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entradas</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="number"
                                        disabled={!canEdit}
                                        value={item.entradas ?? ""}
                                        onChange={(e) => onUpdateEntradas ? onUpdateEntradas(item.id, e.target.value) : null}
                                        className="w-full bg-blue-50/50 border-2 border-blue-100 rounded-2xl py-4 text-center text-xl font-black text-blue-700 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                                        placeholder="0"
                                    />
                                    <div className="absolute right-3 p-1 bg-blue-100 rounded-lg text-blue-600">
                                        <Plus size={14} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Merma / Desperdicio</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="number"
                                        disabled={!canEdit}
                                        value={item.mermas ?? ""}
                                        onChange={(e) => onUpdateMermas(item.id, e.target.value)}
                                        className="w-full bg-rose-50/50 border-2 border-rose-100 rounded-2xl py-4 text-center text-xl font-black text-rose-700 focus:outline-none focus:border-rose-500 transition-all shadow-inner"
                                        placeholder="0"
                                    />
                                    <div className="absolute right-3 p-1 bg-rose-100 rounded-lg text-rose-600">
                                        <Trash2 size={14} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Físico Real</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="number"
                                        disabled={!canEdit}
                                        value={item.fisico ?? ""}
                                        onChange={(e) => onUpdateFisico(item.id, e.target.value)}
                                        className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl py-4 text-center text-xl font-black text-emerald-700 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                                        placeholder="0"
                                    />
                                    <div className="absolute right-3 p-1 bg-emerald-100 rounded-lg text-emerald-600">
                                        <Check size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Ventas</p>
                                    <p className="text-sm font-bold text-slate-700">{item.salidaVentas}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Teórico</p>
                                    <p className="text-sm font-bold text-cyan-600">{item.teorico}</p>
                                </div>
                            </div>
                            <p className="text-[9px] font-medium text-slate-400 italic">Clic para más detalles</p>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="py-20 text-center text-slate-400">
                        <Search className="size-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No se encontró el artículo</p>
                        <p className="text-sm">Prueba con otro nombre o escanea el QR</p>
                    </div>
                )}
            </div>
        </div>
    );
}
