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
        <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-4 selection:bg-cyan-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] size-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] size-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-16 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-2xl shadow-2xl shadow-cyan-500/20 mb-4 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <ShieldCheck className="text-white size-8" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Gamasoft <span className="text-cyan-500">Kardex</span></h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Sistema Inteligente de Control de Inventarios</p>
                </div>

                <div className="bg-[#0A0D14]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
                    {/* Interior glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">E-mail Corporativo</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#111622]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/30 transition-all outline-none"
                                    placeholder="ej: admin@gamasoft.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Contraseña</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-[#111622]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/30 transition-all outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                                <Sparkles className="text-rose-400 size-4 shrink-0" />
                                <p className="text-rose-400 text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0D14] font-black rounded-2xl py-4 shadow-xl shadow-cyan-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 tracking-widest uppercase text-xs"
                        >
                            {loading ? <Loader2 className="animate-spin size-5" /> : (
                                <>
                                    Ingresar al Sistema
                                    <LogIn size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                            © 2026 Gamasoft Cloud • Tech Division
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
