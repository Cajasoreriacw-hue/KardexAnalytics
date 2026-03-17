"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, ShieldCheck, Mail, Lock, Loader2, Sparkles } from "lucide-react";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Fetch profile to get role and sede
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*, sedes(nombre)')
                .eq('id', data.user.id)
                .single();

            if (profileError) throw profileError;

            onLogin({ ...data.user, profile });
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center selection:bg-cyan-500/30 overflow-hidden font-sans">
            {/* Split Layout Container */}
            <div className="flex w-full min-h-screen">

                {/* Visual Column - Hidden on small mobile, beautiful on desktop */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 group">
                    <img
                        src="/team-photo.png"
                        alt="Nuestro Equipo"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-out"
                    />

                    {/* Artistic Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/40 to-cyan-500/20" />
                    <div className="absolute inset-0 backdrop-blur-[2px] opacity-30" />

                    {/* Animated Floating Shapes */}
                    <div className="absolute top-[20%] left-[10%] size-64 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[20%] right-[10%] size-64 bg-blue-600/20 blur-[100px] rounded-full animate-bounce [animation-duration:8s]" />

                    {/* Content Overlay */}
                    <div className="relative z-20 p-20 flex flex-col justify-end h-full max-w-2xl animate-in fade-in slide-in-from-left duration-1000">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-black uppercase tracking-widest">
                                <Sparkles size={14} className="text-cyan-400" /> Espíritu de Equipo
                            </div>
                            <h2 className="text-6xl font-black text-white leading-none tracking-tighter">
                                Construyendo el <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Éxito Juntos.</span>
                            </h2>
                            <p className="text-xl text-slate-300 font-medium leading-relaxed">
                                Esta herramienta no solo cuenta productos, mide el esfuerzo y la dedicación de nuestro equipo. Diseñada para hacer tu día más fluido.
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    {[20, 3, 23, 3].map((i, idx) => (
                                        <div key={`${i}-${idx}`} className="size-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase italic">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm font-bold text-slate-400">Unidos por la excelencia • 2026</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Column */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-20 relative bg-slate-50/50">

                    {/* Moblie Background Photo (Subtle) */}
                    <div className="lg:hidden absolute inset-0 z-0">
                        <img src="/team-photo.png" alt="Team" className="w-full h-full object-cover opacity-10" />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/100 via-slate-50/80 to-slate-50/100" />
                    </div>

                    <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-10 lg:slide-in-from-right-20 duration-1000">

                        {/* Internal Navigation/Brand on Mobile */}
                        <div className="mb-12 text-center">
                            <div className="inline-flex items-center justify-center size-14 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-2xl shadow-2xl mb-6 group-hover:rotate-12 transition-transform duration-500">
                                <ShieldCheck className="text-white size-7" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Cheese<span className="text-cyan-600 not-italic">Wheel</span></h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60">Inventory Intelligence Portal</p>
                        </div>

                        <div className="bg-white/70 backdrop-blur-xl border border-white p-1 md:p-2 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                            <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100">
                                <form onSubmit={handleLogin} className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">E-mail de Acceso</label>
                                            <div className="relative group/input">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/input:text-cyan-600 transition-colors" />
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-cyan-500/50 rounded-2xl py-4 md:py-5 pl-12 pr-4 text-slate-900 text-sm font-bold transition-all outline-none"
                                                    placeholder="tusuario@empresa.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contraseña Privada</label>
                                            <div className="relative group/input">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/input:text-cyan-600 transition-colors" />
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-cyan-500/50 rounded-2xl py-4 md:py-5 pl-12 pr-4 text-slate-900 text-sm font-bold transition-all outline-none"
                                                    placeholder="Ingrese su clave"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
                                            <div className="size-8 rounded-full bg-rose-200/50 flex items-center justify-center shrink-0">
                                                <X className="text-rose-600 size-4" />
                                            </div>
                                            <p className="text-rose-600 text-xs font-black leading-tight uppercase tracking-tight">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-[64px] bg-slate-900 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-black rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-[11px] shadow-2xl shadow-slate-900/20 hover:shadow-cyan-500/30 overflow-hidden relative group/btn"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        <span className="relative z-10 flex items-center gap-3">
                                            {loading ? <Loader2 className="animate-spin size-5" /> : (
                                                <>
                                                    Validar Identidad
                                                    <ArrowUpRight size={18} className="text-cyan-400" />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </form>

                                <div className="mt-12 text-center space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                        <ShieldCheck size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Portal Seguro SSL 256-bit</span>
                                    </div>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] block">
                                        Enterprise Solution v1.0
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Re-importing missing icons for the new design
import { X, ArrowUpRight } from "lucide-react";
