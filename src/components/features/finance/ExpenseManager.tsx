import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Receipt, Calendar, Tag, Trash2 } from "lucide-react";
import type { ExpenseData } from "../../../type/rock-data";

interface ExpenseManagerProps {
    expenses: ExpenseData[];
    onAddExpense: (expense: ExpenseData) => void;
    onDeleteExpense: (id: string) => void;
    externalTrigger?: number;
}

export function ExpenseManager({ expenses, onAddExpense, onDeleteExpense, externalTrigger }: ExpenseManagerProps) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
    });

    // Calculate totals by category
    const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const sortedExpenses = [...expenses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || !formData.category.trim()) return;

        const newExpense: ExpenseData = {
            id: crypto.randomUUID(),
            amount: parseFloat(formData.amount),
            category: formData.category,
            description: formData.description,
            date: formData.date,
            createdAt: new Date().toISOString(),
        };

        onAddExpense(newExpense);
        setFormData({
            amount: "",
            category: "",
            description: "",
            date: new Date().toISOString().split('T')[0],
        });
        setShowModal(false);
    };

    // Listen to external trigger
    useEffect(() => {
        if (externalTrigger && externalTrigger > 0) {
            setShowModal(true);
        }
    }, [externalTrigger]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <>
            <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-400" />
                        Expense Tracker
                    </h3>
                    <button
                        onClick={() => setShowModal(true)}
                        className="p-2 bg-primary hover:bg-primary/90 rounded-lg transition-all hover:scale-105 shadow-lg shadow-primary/20"
                        title="Add expense"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Total Expenses */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl p-4 mb-4">
                    <p className="text-xs text-muted uppercase tracking-wide mb-1">Total Expenses</p>
                    <p className="text-3xl font-bold text-blue-400 font-mono">
                        KES {totalExpenses.toLocaleString()}
                    </p>
                </div>

                {/* Category Summary */}
                {Object.keys(categoryTotals).length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-muted uppercase tracking-wide mb-2">By Category</p>
                        <div className="space-y-2">
                            {Object.entries(categoryTotals).map(([category, total]) => (
                                <div key={category} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                                    <span className="text-sm text-white">{category}</span>
                                    <span className="text-sm font-mono text-muted">
                                        KES {total.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Expenses List */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-xs text-muted uppercase tracking-wide mb-2 sticky top-0 bg-surface/95 backdrop-blur-sm z-10 py-1">Recent Expenses</p>
                    {sortedExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted">
                            <Receipt className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No expenses yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2 pb-2">
                            {sortedExpenses.map((expense) => (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Tag className="w-3 h-3 text-primary" />
                                                <span className="text-xs text-primary">{expense.category}</span>
                                            </div>
                                            {expense.description && (
                                                <p className="text-sm text-white">{expense.description}</p>
                                            )}
                                            <div className="flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3 text-muted" />
                                                <span className="text-xs text-muted">{formatDate(expense.date)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono font-semibold text-white">
                                                KES {expense.amount.toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => onDeleteExpense(expense.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Expense Modal */}
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
                                <h3 className="text-xl font-semibold text-white">Add Expense</h3>
                                <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">Amount (KES)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                        placeholder="0.00"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-muted mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                        placeholder="e.g., Food, Transport, Entertainment"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-muted mb-1">Description (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                        placeholder="What was this expense for?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-muted mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                                >
                                    Add Expense
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
