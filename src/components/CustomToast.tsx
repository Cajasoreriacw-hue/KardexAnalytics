"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

export function Toast({ notification, onClose }: { notification: Notification, onClose: (id: string) => void }) {
    const [isVisible, setIsVisible] = useState(false);

    const playNotificationSound = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
            oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.1); // Slide to A5
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.log("Audio feedback not supported or blocked by browser policy");
        }
    };

    useEffect(() => {
        setIsVisible(true);
        playNotificationSound();
        
        // Timer dinámico: Advertencias y errores duran más para ser leídos
        const duration = notification.type === 'warning' || notification.type === 'error' ? 12000 : 5000;
        
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(notification.id), 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [notification.id, onClose, notification.type]);

    const icons = {
        success: <CheckCircle2 className="text-emerald-500" size={20} />,
        error: <XCircle className="text-rose-500" size={20} />,
        warning: <AlertTriangle className="text-amber-500" size={20} />,
        info: <Info className="text-cyan-500" size={20} />
    };

    const styles = {
        success: "border-emerald-100 bg-emerald-50",
        error: "border-rose-100 bg-rose-50",
        warning: "border-amber-100 bg-amber-50",
        info: "border-cyan-100 bg-cyan-50"
    };

    return (
        <div className={cn(
            "flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-300 transform max-w-sm w-full",
            styles[notification.type],
            isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        )}>
            <div className="shrink-0 mt-0.5">
                {icons[notification.type]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 break-words leading-relaxed whitespace-pre-wrap">
                    {notification.message}
                </p>
            </div>
            <button 
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onClose(notification.id), 300);
                }}
                className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
                <X size={14} className="text-slate-400" />
            </button>
        </div>
    );
}

export function ToastContainer({ notifications, removeNotification }: { notifications: Notification[], removeNotification: (id: string) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 w-full items-end pointer-events-none px-6">
            <div className="flex flex-col gap-3 pointer-events-auto">
                {notifications.map(n => (
                    <Toast key={n.id} notification={n} onClose={removeNotification} />
                ))}
            </div>
        </div>
    );
}
