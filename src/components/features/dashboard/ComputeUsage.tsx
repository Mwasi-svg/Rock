import { Cpu, Edit2, Check, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ComputeUsageProps {
    cost?: number;
    received?: number;
    onSave?: (cost: number, received: number) => void;
}

export function ComputeUsage({ cost = 0, received = 0, onSave }: ComputeUsageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editCost, setEditCost] = useState(cost.toString());
    const [editReceived, setEditReceived] = useState(received.toString());

    useEffect(() => {
        setEditCost(cost.toString());
        setEditReceived(received.toString());
    }, [cost, received]);

    const handleSave = () => {
        const newCost = parseFloat(editCost) || 0;
        const newReceived = parseFloat(editReceived) || 0;
        onSave?.(newCost, newReceived);
        setIsEditing(false);
    };

    const percentage = received > 0 ? Math.min(100, Math.round((cost / received) * 100)) : 0;
    const strokeDasharray = 351.86;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    return (
        <div className="glass-card p-6 relative overflow-hidden group interactive-card animate-enter delay-3 h-full">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-zinc-400 text-sm font-medium">Cost Projection</h3>
                <div className="flex gap-2">
                    {onSave && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-zinc-600 hover:text-primary transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    {onSave && isEditing && (
                        <>
                            <button
                                onClick={handleSave}
                                className="text-emerald-500 hover:text-emerald-400 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-rose-500 hover:text-rose-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    {!isEditing && <Cpu className="w-4 h-4 text-zinc-600" />}
                </div>
            </div>

            {isEditing ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-4 h-full">
                    <div className="w-full space-y-1">
                        <label className="text-xs text-muted">Current Cost (KES)</label>
                        <input
                            type="number"
                            value={editCost}
                            onChange={(e) => setEditCost(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                            autoFocus
                        />
                    </div>
                    <div className="w-full space-y-1">
                        <label className="text-xs text-muted">Total Received (KES)</label>
                        <input
                            type="number"
                            value={editReceived}
                            onChange={(e) => setEditReceived(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                            <circle
                                cx="64" cy="64" r="56"
                                stroke="url(#paint0_linear)"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="paint0_linear" x1="0" y1="0" x2="1" y2="1">
                                    <stop stopColor="#fff" />
                                    <stop offset="1" stopColor="#52525b" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-3xl font-semibold text-white tracking-tight">{percentage}%</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-xs text-zinc-500 font-medium">KES {cost.toLocaleString()} / {received.toLocaleString()}</p>
                        <div className="w-16 h-0.5 bg-zinc-800 mx-auto my-2 rounded-full" />
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Revenue Spent</p>
                    </div>
                </div>
            )}
        </div>
    );
}
