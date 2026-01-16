import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Edit2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useActions } from "../../../lib/ActionContext";
import type { SpendingData, IncomeData, ExpenseData, IncomeSource, CategoryAllocation, SavingsGoal } from "../../../type/rock-data";
import { IncomeManager } from "./IncomeManager";
import { SpendingBreakdown } from "./SpendingBreakdown";
import { FinancialCalculations } from "./FinancialCalculations";
import { SmartInsights } from "./SmartInsights";
import { ExpenseManager } from "./ExpenseManager";
import { AnalyticsSection } from "./AnalyticsSection";
import { BudgetFramework } from "./BudgetFramework";
import { MultiIncomeManager } from "./MultiIncomeManager";
import { SavingsGoals } from "./SavingsGoals";
import { EmergencyFund } from "./EmergencyFund";

interface FinanceDashboardProps {
    categories: SpendingData[];
    income: IncomeData;
    expenses: ExpenseData[];
    incomeSources?: IncomeSource[];
    categoryAllocations?: CategoryAllocation[];
    savingsGoals?: SavingsGoal[];
    onAddCategory: (cat: SpendingData) => void;
    onUpdateCategory: (cat: SpendingData) => void;
    onDeleteCategory: (id: string) => void;
    onUpdateIncome: (income: IncomeData) => void;
    onAddExpense: (expense: ExpenseData) => void;
    onDeleteExpense: (id: string) => void;
    onAddIncomeSource?: (source: IncomeSource) => void;
    onUpdateIncomeSource?: (source: IncomeSource) => void;
    onDeleteIncomeSource?: (id: string) => void;
    onAddGoal?: (goal: SavingsGoal) => void;
    onUpdateGoal?: (goal: SavingsGoal) => void;
    onDeleteGoal?: (id: string) => void;
}

// Helper to calculate monthly equivalent from income sources
function getMonthlyFromSources(sources: IncomeSource[]): number {
    return sources
        .filter((s) => s.isActive)
        .reduce((sum, s) => {
            switch (s.frequency) {
                case "weekly": return sum + s.amount * 4.33;
                case "bi-weekly": return sum + s.amount * 2.17;
                case "monthly": return sum + s.amount;
                case "one-time": return sum; // Don't count one-time in monthly
                default: return sum + s.amount;
            }
        }, 0);
}

export function FinanceDashboard({
    categories,
    income,
    expenses,
    incomeSources = [],
    categoryAllocations,
    savingsGoals = [],
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    onUpdateIncome,
    onAddExpense,
    onDeleteExpense,
    onAddIncomeSource,
    onUpdateIncomeSource,
    onDeleteIncomeSource,
    onAddGoal,
    onUpdateGoal,
    onDeleteGoal
}: FinanceDashboardProps) {
    const { addExpenseArgs } = useActions();
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<SpendingData | null>(null);
    const [formData, setFormData] = useState({ name: "", spent: 0, budget: 0, color: "#3B82F6" });

    // Calculate total spent from categories (source of truth for manual updates)
    const totalFromCategories = categories.reduce((sum, c) => sum + c.spent, 0);
    const totalSpent = totalFromCategories;

    // Calculate effective monthly income (from sources if available, else legacy)
    const monthlyFromSources = getMonthlyFromSources(incomeSources);
    const effectiveMonthlyIncome = incomeSources.length > 0 ? monthlyFromSources : income;

    const handleOpenAdd = () => {
        setEditingCategory(null);
        setFormData({ name: "", spent: 0, budget: 0, color: "#3B82F6" });
        setShowModal(true);
    };

    const handleOpenEdit = (cat: SpendingData) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, spent: cat.spent, budget: cat.budget, color: cat.color });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.budget <= 0) return;

        if (editingCategory) {
            onUpdateCategory({
                ...editingCategory,
                name: formData.name,
                spent: formData.spent,
                budget: formData.budget,
                color: formData.color,
            });
        } else {
            onAddCategory({
                id: crypto.randomUUID(),
                name: formData.name,
                spent: formData.spent,
                budget: formData.budget,
                color: formData.color,
            });
        }

        setShowModal(false);
    };

    // Check if multi-income features are available
    const hasMultiIncome = onAddIncomeSource && onUpdateIncomeSource && onDeleteIncomeSource;
    // Check if savings goals features are available
    const hasSavingsGoals = onAddGoal && onUpdateGoal && onDeleteGoal;

    return (
        <>
            {/* Top Row: Income, Expenses, and either Budget Framework or Calculations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Income Manager - Show Multi or Legacy */}
                <div className="min-h-[400px]">
                    {hasMultiIncome ? (
                        <MultiIncomeManager
                            incomeSources={incomeSources}
                            legacyIncome={income}
                            onAddSource={onAddIncomeSource}
                            onUpdateSource={onUpdateIncomeSource}
                            onDeleteSource={onDeleteIncomeSource}
                            onUpdateLegacyIncome={onUpdateIncome}
                        />
                    ) : (
                        <IncomeManager
                            income={income}
                            totalExpenses={totalSpent}
                            onUpdate={onUpdateIncome}
                        />
                    )}
                </div>

                {/* Expense Manager */}
                <div className="min-h-[400px]">
                    <ExpenseManager
                        expenses={expenses}
                        onAddExpense={onAddExpense}
                        onDeleteExpense={onDeleteExpense}
                        externalTrigger={addExpenseArgs}
                    />
                </div>

                {/* Financial Calculations */}
                <div className="min-h-[400px]">
                    <FinancialCalculations
                        monthlyIncome={effectiveMonthlyIncome}
                        totalSpent={totalSpent}
                    />
                </div>
            </div>

            {/* 50/30/20 Budget Framework */}
            <div className="mb-6 min-h-[350px]">
                <BudgetFramework
                    expenses={expenses}
                    totalIncome={effectiveMonthlyIncome}
                    categoryAllocations={categoryAllocations}
                />
            </div>

            {/* Savings Goals & Emergency Fund Section - Only show if handlers available */}
            {hasSavingsGoals && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Savings Goals - Spans 2 columns */}
                    <div className="lg:col-span-2 min-h-[400px]">
                        <SavingsGoals
                            goals={savingsGoals}
                            onAddGoal={onAddGoal}
                            onUpdateGoal={onUpdateGoal}
                            onDeleteGoal={onDeleteGoal}
                        />
                    </div>
                    {/* Emergency Fund - Spans 1 column */}
                    <div className="min-h-[400px]">
                        <EmergencyFund
                            goals={savingsGoals}
                            expenses={expenses}
                            monthlyIncome={effectiveMonthlyIncome}
                            onAddGoal={onAddGoal}
                            onUpdateGoal={onUpdateGoal}
                        />
                    </div>
                </div>
            )}

            {/* Analytics Section - Full Width */}
            <div className="mb-6 h-[500px]">
                <AnalyticsSection categories={categories} expenses={expenses} income={effectiveMonthlyIncome} />
            </div>

            {/* Second Row: Spending Breakdown and Smart Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Breakdown */}
                <div className="min-h-[300px] relative">
                    <SpendingBreakdown categories={categories} expenses={expenses} />
                    {/* Floating Add Button */}
                    <button
                        onClick={handleOpenAdd}
                        className="absolute top-4 right-4 p-2 bg-primary hover:bg-primary/90 rounded-lg transition-all hover:scale-105 shadow-lg shadow-primary/20 z-10"
                        title="Add spending category"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Smart Insights */}
                <div className="min-h-[300px]">
                    <SmartInsights
                        categories={categories}
                        monthlyIncome={effectiveMonthlyIncome}
                        totalSpent={totalSpent}
                    />
                </div>
            </div>

            {/* Category Management Section - Below Grid */}
            {
                categories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Manage Categories</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categories.map((cat) => {
                                const percentage = Math.min((cat.spent / cat.budget) * 100, 100);
                                const isOver = cat.spent > cat.budget;

                                return (
                                    <div
                                        key={cat.id}
                                        className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all group"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                <span className="text-white font-medium">{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={cn("font-mono text-sm", isOver ? "text-red-400" : "text-muted")}>
                                                    KES {cat.spent} / {cat.budget}
                                                </span>
                                                <button
                                                    onClick={() => handleOpenEdit(cat)}
                                                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-white transition-opacity p-1"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                className={cn("h-full rounded-full", isOver ? "bg-red-500" : "")}
                                                style={{ backgroundColor: isOver ? undefined : cat.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )
            }

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
                                    {editingCategory ? "Edit Category" : "New Category"}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">Category Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                        placeholder="e.g., Food & Dining"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-muted mb-1">Spent (KES)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.spent}
                                            onChange={(e) => setFormData({ ...formData, spent: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-1">Budget (KES)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-muted mb-1">Color</label>
                                    <div className="flex gap-2">
                                        {["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444"].map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={cn(
                                                    "w-8 h-8 rounded-full transition-all",
                                                    formData.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-surface" : ""
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    {editingCategory && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onDeleteCategory(editingCategory.id);
                                                setShowModal(false);
                                            }}
                                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-lg font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                                    >
                                        {editingCategory ? "Save Changes" : "Add Category"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}


