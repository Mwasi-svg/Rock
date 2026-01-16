import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet, Plus, X, Briefcase, Users, GraduationCap,
    Laptop, MoreHorizontal, Trash2, Edit2, Calendar,
    TrendingUp
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { IncomeSource } from "../../../type/rock-data";

interface MultiIncomeManagerProps {
    incomeSources: IncomeSource[];
    legacyIncome: number; // Backward compatibility
    onAddSource: (source: IncomeSource) => void;
    onUpdateSource: (source: IncomeSource) => void;
    onDeleteSource: (id: string) => void;
    onUpdateLegacyIncome: (amount: number) => void;
}

const INCOME_CATEGORIES = [
    { value: "job", label: "Part-time Job", icon: Briefcase, color: "#3B82F6" },
    { value: "allowance", label: "Allowance", icon: Users, color: "#10B981" },
    { value: "scholarship", label: "Scholarship", icon: GraduationCap, color: "#8B5CF6" },
    { value: "freelance", label: "Freelance", icon: Laptop, color: "#F59E0B" },
    { value: "other", label: "Other", icon: MoreHorizontal, color: "#6B7280" },
] as const;

const FREQUENCY_OPTIONS = [
    { value: "one-time", label: "One-time" },
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
] as const;

// Helper to calculate monthly equivalent
function getMonthlyAmount(amount: number, frequency: IncomeSource["frequency"]): number {
    switch (frequency) {
        case "weekly": return amount * 4.33;
        case "bi-weekly": return amount * 2.17;
        case "monthly": return amount;
        case "one-time": return 0; // One-time doesn't contribute to monthly
        default: return amount;
    }
}

export function MultiIncomeManager({
    incomeSources,
    legacyIncome,
    onAddSource,
    onUpdateSource,
    onDeleteSource,
    onUpdateLegacyIncome,
}: MultiIncomeManagerProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        frequency: "monthly" as IncomeSource["frequency"],
        category: "job" as IncomeSource["category"],
    });

    // Calculate totals
    const totalMonthlyFromSources = incomeSources
        .filter((s) => s.isActive)
        .reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.frequency), 0);

    // If no sources yet, show legacy income
    const displayedMonthlyIncome = incomeSources.length > 0 ? totalMonthlyFromSources : legacyIncome;

    const handleOpenAdd = () => {
        setEditingSource(null);
        setFormData({ name: "", amount: "", frequency: "monthly", category: "job" });
        setShowModal(true);
    };

    const handleOpenEdit = (source: IncomeSource) => {
        setEditingSource(source);
        setFormData({
            name: source.name,
            amount: source.amount.toString(),
            frequency: source.frequency,
            category: source.category,
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.amount) return;

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) return;

        if (editingSource) {
            onUpdateSource({
                ...editingSource,
                name: formData.name,
                amount,
                frequency: formData.frequency,
                category: formData.category,
            });
        } else {
            const newSource: IncomeSource = {
                id: crypto.randomUUID(),
                name: formData.name,
                amount,
                frequency: formData.frequency,
                category: formData.category,
                isActive: true,
            };
            onAddSource(newSource);
        }

        setShowModal(false);
    };

    const handleToggleActive = (source: IncomeSource) => {
        onUpdateSource({ ...source, isActive: !source.isActive });
    };

    const getCategoryInfo = (category: IncomeSource["category"]) => {
        return INCOME_CATEGORIES.find((c) => c.value === category) || INCOME_CATEGORIES[4];
    };

    return (
        <>
            <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-emerald-400" />
                        Income Sources
                    </h3>
                    <button
                        onClick={handleOpenAdd}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                        title="Add income source"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Total Monthly Income Display */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-xl p-4 mb-4">
                    <p className="text-xs text-muted uppercase tracking-wide mb-1">Total Monthly Income</p>
                    <motion.p
                        key={displayedMonthlyIncome}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl font-bold text-emerald-400 font-mono"
                    >
                        KES {displayedMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </motion.p>
                    {incomeSources.length > 0 && (
                        <p className="text-xs text-muted mt-1">
                            from {incomeSources.filter((s) => s.isActive).length} active source(s)
                        </p>
                    )}
                </div>

                {/* Income Sources List */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                    {incomeSources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted">
                            <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No income sources yet</p>
                            <p className="text-xs opacity-70">Add your first income source</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {incomeSources.map((source) => {
                                const catInfo = getCategoryInfo(source.category);
                                const IconComponent = catInfo.icon;
                                const monthlyEquiv = getMonthlyAmount(source.amount, source.frequency);

                                return (
                                    <motion.div
                                        key={source.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            "bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all group",
                                            !source.isActive && "opacity-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Category Icon */}
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${catInfo.color}20` }}
                                            >
                                                <IconComponent
                                                    className="w-4 h-4"
                                                    style={{ color: catInfo.color }}
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {source.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted">
                                                    <span>{catInfo.label}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">
                                                        {source.frequency.replace("-", " ")}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="text-right">
                                                <p className="text-sm font-mono font-semibold text-white">
                                                    KES {source.amount.toLocaleString()}
                                                </p>
                                                {source.frequency !== "monthly" && source.frequency !== "one-time" && (
                                                    <p className="text-xs text-muted">
                                                        ≈ {monthlyEquiv.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleActive(source)}
                                                    className={cn(
                                                        "p-1.5 rounded transition-colors",
                                                        source.isActive
                                                            ? "text-emerald-400 hover:bg-emerald-500/20"
                                                            : "text-muted hover:bg-white/10"
                                                    )}
                                                    title={source.isActive ? "Pause" : "Resume"}
                                                >
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(source)}
                                                    className="p-1.5 text-muted hover:text-white hover:bg-white/10 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteSource(source.id)}
                                                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-white">
                                    {editingSource ? "Edit Income Source" : "Add Income Source"}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Source Name */}
                                <div>
                                    <label className="block text-sm text-muted mb-1">Source Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                        placeholder="e.g., Café Shift, Mom & Dad"
                                        required
                                        autoFocus
                                    />
                                </div>

                                {/* Category Selection */}
                                <div>
                                    <label className="block text-sm text-muted mb-2">Category</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {INCOME_CATEGORIES.map((cat) => {
                                            const IconComp = cat.icon;
                                            return (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                                    className={cn(
                                                        "p-3 rounded-lg transition-all flex flex-col items-center gap-1",
                                                        formData.category === cat.value
                                                            ? "bg-white/10 ring-2 ring-primary"
                                                            : "bg-white/5 hover:bg-white/10"
                                                    )}
                                                    title={cat.label}
                                                >
                                                    <IconComp
                                                        className="w-5 h-5"
                                                        style={{ color: cat.color }}
                                                    />
                                                    <span className="text-[10px] text-muted truncate w-full text-center">
                                                        {cat.label.split(" ")[0]}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Amount & Frequency */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-muted mb-1">Amount (KES)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-1">Frequency</label>
                                        <select
                                            value={formData.frequency}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    frequency: e.target.value as IncomeSource["frequency"],
                                                })
                                            }
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        >
                                            {FREQUENCY_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value} className="bg-surface">
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Monthly Equivalent Preview */}
                                {formData.amount && formData.frequency !== "one-time" && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                        <p className="text-xs text-emerald-400 flex items-baseline gap-2">
                                            <span className="font-semibold">Monthly Equivalent:</span>
                                            <span className="font-mono text-sm">
                                                KES{" "}
                                                {getMonthlyAmount(
                                                    parseFloat(formData.amount) || 0,
                                                    formData.frequency
                                                ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    {editingSource ? "Save Changes" : "Add Income Source"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
