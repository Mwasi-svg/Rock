import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target, Plus, X, Trash2, Edit2, TrendingUp, Calendar,
    Laptop, Plane, GraduationCap, Car, Heart, Sparkles, CheckCircle
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { SavingsGoal } from "../../../type/rock-data";

interface SavingsGoalsProps {
    goals: SavingsGoal[];
    onAddGoal: (goal: SavingsGoal) => void;
    onUpdateGoal: (goal: SavingsGoal) => void;
    onDeleteGoal: (id: string) => void;
}

const CATEGORY_CONFIG = {
    emergency: { label: "Emergency Fund", icon: Heart, color: "#EF4444" },
    purchase: { label: "Major Purchase", icon: Laptop, color: "#3B82F6" },
    travel: { label: "Travel", icon: Plane, color: "#F59E0B" },
    education: { label: "Education", icon: GraduationCap, color: "#8B5CF6" },
    investment: { label: "Investment", icon: TrendingUp, color: "#10B981" },
    other: { label: "Other Goal", icon: Target, color: "#6B7280" },
};

export function SavingsGoals({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }: SavingsGoalsProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
        category: "purchase" as SavingsGoal["category"],
        monthlyContribution: "",
        color: "#3B82F6"
    });

    const handleOpenAdd = () => {
        setEditingGoal(null);
        setFormData({
            name: "",
            targetAmount: "",
            currentAmount: "0",
            deadline: "",
            category: "purchase",
            monthlyContribution: "",
            color: "#3B82F6"
        });
        setShowModal(true);
    };

    const handleOpenEdit = (goal: SavingsGoal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            targetAmount: goal.targetAmount.toString(),
            currentAmount: goal.currentAmount.toString(),
            deadline: goal.deadline || "",
            category: goal.category,
            monthlyContribution: goal.monthlyContribution.toString(),
            color: goal.color
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.targetAmount) return;

        const targetAmount = parseFloat(formData.targetAmount);
        const currentAmount = parseFloat(formData.currentAmount) || 0;
        const monthlyContribution = parseFloat(formData.monthlyContribution) || 0;

        if (editingGoal) {
            onUpdateGoal({
                ...editingGoal,
                name: formData.name,
                targetAmount,
                currentAmount,
                deadline: formData.deadline || undefined,
                category: formData.category,
                monthlyContribution,
                color: formData.color
            });
        } else {
            onAddGoal({
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                name: formData.name,
                targetAmount,
                currentAmount,
                deadline: formData.deadline || undefined,
                category: formData.category,
                monthlyContribution,
                color: formData.color
            });
        }

        setShowModal(false);
    };

    const calculateMonthlyRequired = (target: number, current: number, deadlineStr?: string) => {
        if (!deadlineStr) return null;
        const deadline = new Date(deadlineStr);
        const now = new Date();
        const months = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());

        if (months <= 0) return 0;
        const remaining = target - current;
        return remaining > 0 ? remaining / months : 0;
    };

    const getStatus = (goal: SavingsGoal) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        if (progress >= 100) return { label: "Completed", color: "text-emerald-400" };

        const required = calculateMonthlyRequired(goal.targetAmount, goal.currentAmount, goal.deadline);
        if (required === null) return { label: "In Progress", color: "text-blue-400" };

        if (goal.monthlyContribution >= required) return { label: "On Track", color: "text-emerald-400" };
        if (goal.monthlyContribution >= required * 0.8) return { label: "Almost There", color: "text-amber-400" };
        return { label: "Behind", color: "text-red-400" };
    };

    return (
        <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-400" />
                        Savings Goals
                    </h3>
                    <p className="text-xs text-muted mt-1">Track your financial targets</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5 text-white" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted">
                        <Target className="w-10 h-10 mb-3 opacity-20" />
                        <p className="text-sm">No active goals</p>
                        <p className="text-xs opacity-70">Create a goal to start saving</p>
                    </div>
                ) : (
                    goals.map(goal => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const status = getStatus(goal);
                        const isCompleted = progress >= 100;
                        const CategoryIcon = CATEGORY_CONFIG[goal.category].icon;

                        return (
                            <motion.div
                                key={goal.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden"
                            >
                                {/* Background progress hint */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                    style={{ transform: `translate(-${100 - progress}%)` }}
                                />

                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2.5 rounded-lg"
                                            style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                                        >
                                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <CategoryIcon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{goal.name}</h4>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className={status.color}>{status.label}</span>
                                                {goal.deadline && (
                                                    <span className="text-muted flex items-center gap-1">
                                                        • <Calendar className="w-3 h-3" />
                                                        {new Date(goal.deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenEdit(goal)}
                                            className="p-1.5 text-muted hover:text-white rounded hover:bg-white/10"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteGoal(goal.id)}
                                            className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 relative z-10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white font-mono">KES {goal.currentAmount.toLocaleString()}</span>
                                        <span className="text-muted font-mono">KES {goal.targetAmount.toLocaleString()}</span>
                                    </div>

                                    <div className="h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full rounded-full relative"
                                            style={{ backgroundColor: goal.color }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                        </motion.div>
                                    </div>

                                    {goal.monthlyContribution > 0 && !isCompleted && (
                                        <p className="text-xs text-muted mt-2 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            Saving KES {goal.monthlyContribution.toLocaleString()}/mo
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-white">
                                    {editingGoal ? "Edit Goal" : "New Savings Goal"}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">Goal Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="e.g. New Laptop"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-muted mb-1">Target (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.targetAmount}
                                            onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                            placeholder="50000"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-1">Current Saved</label>
                                        <input
                                            type="number"
                                            value={formData.currentAmount}
                                            onChange={e => setFormData({ ...formData, currentAmount: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-muted mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => {
                                                const cat = e.target.value as SavingsGoal["category"];
                                                setFormData({
                                                    ...formData,
                                                    category: cat,
                                                    color: CATEGORY_CONFIG[cat].color
                                                });
                                            }}
                                            className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        >
                                            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                                <option key={key} value={key}>{config.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-1">Deadline (Optional)</label>
                                        <input
                                            type="date"
                                            value={formData.deadline}
                                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-muted mb-1">Monthly Contribution (KES)</label>
                                    <input
                                        type="number"
                                        value={formData.monthlyContribution}
                                        onChange={e => setFormData({ ...formData, monthlyContribution: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="How much can you save monthly?"
                                    />
                                    {formData.targetAmount && formData.deadline && (
                                        <div className="mt-2 text-xs text-muted">
                                            Required: <span className="text-indigo-400">
                                                KES {Math.ceil(calculateMonthlyRequired(parseFloat(formData.targetAmount), parseFloat(formData.currentAmount) || 0, formData.deadline) || 0).toLocaleString()}
                                            </span> /mo to hit target
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    {editingGoal ? "Update Goal" : "Create Goal"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
