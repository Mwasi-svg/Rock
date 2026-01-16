import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "./utils";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
}

interface NotificationContextValue {
    showNotification: (title: string, options?: { type?: NotificationType; message?: string; desktop?: boolean }) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
};

const STYLES = {
    success: "border-l-emerald-500 bg-surface/80 shadow-emerald-500/10",
    error: "border-l-red-500 bg-surface/80 shadow-red-500/10",
    info: "border-l-blue-500 bg-surface/80 shadow-blue-500/10",
};

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((title: string, options: { type?: NotificationType; message?: string; desktop?: boolean } = {}) => {
        const { type = "info", message, desktop = true } = options;
        const id = crypto.randomUUID();

        // 1. Add to In-App State
        setNotifications((prev) => [...prev, { id, type, title, message }]);

        // 2. Trigger Desktop Notification
        if (desktop && "Notification" in window) {
            if (Notification.permission === "granted") {
                new Notification(title, { body: message });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        new Notification(title, { body: message });
                    }
                });
            }
        }

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    }, []);

    const dismiss = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => {
                        const Icon = ICONS[n.type];
                        return (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                layout
                                className={cn(
                                    "pointer-events-auto w-80 p-4 rounded-xl border border-white/10 backdrop-blur-xl shadow-2xl flex items-start gap-3 border-l-4",
                                    STYLES[n.type]
                                )}
                            >
                                <Icon className={cn("w-5 h-5 shrink-0",
                                    n.type === "success" ? "text-emerald-400" :
                                        n.type === "error" ? "text-red-400" : "text-blue-400"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-white">{n.title}</h4>
                                    {n.message && <p className="text-xs text-muted mt-1">{n.message}</p>}
                                </div>
                                <button
                                    onClick={() => dismiss(n.id)}
                                    className="text-muted hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}
