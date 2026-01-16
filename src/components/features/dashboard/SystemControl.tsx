import { ShieldCheck, Zap } from "lucide-react";

export function SystemControl() {
    return (
        <div className="glass-card p-6 relative overflow-hidden group interactive-card animate-enter delay-4 flex flex-col justify-between h-full">
            <div className="mb-4">
                <h3 className="text-zinc-400 text-sm font-medium mb-1">System Control</h3>
                <p className="text-xs text-zinc-600">Manage edge configurations instantly.</p>
            </div>

            <div className="space-y-4">
                <ToggleRow icon={ShieldCheck} title="WAF Protection" desc="Block malicious traffic" defaultChecked={false} />
                <ToggleRow icon={Zap} title="Edge Caching" desc="Cache static assets" defaultChecked={true} />
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
                <button className="w-full py-2.5 rounded-lg bg-zinc-100 text-black text-sm font-medium hover:bg-white transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] btn-action relative overflow-hidden">
                    Purge Cache
                </button>
            </div>
        </div>
    );
}

function ToggleRow({ icon: Icon, title, desc, defaultChecked }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-black/40 text-zinc-400 border border-white/5">
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-zinc-200 font-medium">{title}</span>
                    <span className="text-[10px] text-zinc-500">{desc}</span>
                </div>
            </div>
            <label className="toggle-wrapper">
                <input type="checkbox" className="toggle-input" defaultChecked={defaultChecked} />
                <div className="toggle-track">
                    <div className="toggle-handle" />
                </div>
            </label>
        </div>
    );
}
