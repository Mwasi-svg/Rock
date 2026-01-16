import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { IncomeData } from "../../../type/rock-data";

interface IncomeManagerProps {
    income: IncomeData;
    totalExpenses: number;
    onUpdate: (income: IncomeData) => void;
}

export function IncomeManager({ income, totalExpenses, onUpdate }: IncomeManagerProps) {
    const [showModal, setShowModal] = useState(false);
    const [tempValue, setTempValue] = useState("");

    const netBalance = income - totalExpenses;
    const isPositive = netBalance >= 0;

    const handleAddIncome = () => {
        const amountToAdd = parseFloat(tempValue) || 0;
        if (amountToAdd > 0) {
            onUpdate(income + amountToAdd);
            setTempValue("");
            setShowModal(false);
        }
    };

    return (
        <>
            <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-emerald-400" />
                        Net Balance
                    </h3>
                    <button
                        onClick={() => setShowModal(true)}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                        title="Add income"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center">
                        <p className="text-muted text-xs uppercase tracking-wider mb-3">
                            Available Balance
                        </p>
                        <motion.div
                            key={netBalance}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mb-4"
                        >
                            <div className={cn(
                                "text-5xl font-bold font-mono mb-2",
                                isPositive ? "text-emerald-400" : "text-red-400"
                            )}>
                                KES {netBalance.toLocaleString()}
                            </div>
                        </motion.div>

                        <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                            <div className="flex justify-between text-xs px-8">
                                <span className="text-muted">Total Income:</span>
                                <span className="text-white">KES {income.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs px-8">
                                <span className="text-red-400/70">Total Expenses:</span>
                                <span className="text-red-400">KES {totalExpenses.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Income Modal */}
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
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-white mb-2">Add Income</h3>
                                <p className="text-sm text-muted">
                                    Add income from salary, business, or any other source
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted mb-2">Amount (KES)</label>
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                                        <span className="text-2xl font-bold text-white">KES</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={tempValue}
                                            onChange={(e) => setTempValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleAddIncome();
                                                if (e.key === "Escape") setShowModal(false);
                                            }}
                                            className="flex-1 bg-transparent text-2xl font-bold text-emerald-400 font-mono placeholder:text-muted/50 focus:outline-none"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                    <p className="text-xs text-emerald-400 flex items-baseline gap-2">
                                        <span className="font-semibold">New Balance:</span>
                                        <span className="font-mono text-sm">
                                            KES {(income + (parseFloat(tempValue) || 0)).toLocaleString()}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-muted hover:text-white py-2.5 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddIncome}
                                        disabled={!tempValue || parseFloat(tempValue) <= 0}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        Add Income
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
