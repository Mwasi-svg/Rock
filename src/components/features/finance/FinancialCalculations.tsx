import { motion } from "framer-motion";
import { Calculator, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "../../../lib/utils";

interface FinancialCalculationsProps {
    monthlyIncome: number;
    totalSpent: number;
}

export function FinancialCalculations({ monthlyIncome, totalSpent }: FinancialCalculationsProps) {
    const netBalance = monthlyIncome - totalSpent;
    const savingsRate = monthlyIncome > 0 ? ((netBalance / monthlyIncome) * 100).toFixed(1) : "0.0";
    const monthlySurplus = netBalance;

    const isPositive = netBalance >= 0;

    return (
        <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Financial Summary
                </h3>
            </div>

            <div className="flex-1 space-y-6">
                {/* Net Balance */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-muted" />
                        <p className="text-xs text-muted uppercase tracking-wider">Net Balance</p>
                    </div>
                    <motion.div
                        key={netBalance}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "text-3xl font-bold font-mono",
                            isPositive ? "text-emerald-400" : "text-red-400"
                        )}
                    >
                        {isPositive ? "+" : "-"}KES {Math.abs(netBalance).toLocaleString()}
                    </motion.div>
                    <p className="text-xs text-muted">
                        Income: KES {monthlyIncome.toLocaleString()} - Expenses: KES {totalSpent.toLocaleString()}
                    </p>
                </div>

                {/* Savings Rate */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted" />
                        <p className="text-xs text-muted uppercase tracking-wider">Savings Rate</p>
                    </div>
                    <motion.div
                        key={savingsRate}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className={cn(
                            "text-3xl font-bold font-mono",
                            isPositive ? "text-emerald-400" : "text-red-400"
                        )}
                    >
                        {savingsRate}%
                    </motion.div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(Math.max(parseFloat(savingsRate), 0), 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className={cn(
                                "h-full rounded-full",
                                isPositive ? "bg-emerald-400" : "bg-red-400"
                            )}
                        />
                    </div>
                </div>

                {/* Monthly Surplus/Deficit */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <p className="text-xs text-muted uppercase tracking-wider">
                            Monthly {isPositive ? "Surplus" : "Deficit"}
                        </p>
                    </div>
                    <motion.div
                        key={monthlySurplus}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className={cn(
                            "text-3xl font-bold font-mono",
                            isPositive ? "text-emerald-400" : "text-red-400"
                        )}
                    >
                        {isPositive ? "+" : "-"}KES {Math.abs(monthlySurplus).toLocaleString()}
                    </motion.div>
                    <p className="text-xs text-muted">
                        {isPositive ? "Available to save or invest" : "Amount over budget"}
                    </p>
                </div>
            </div>
        </div>
    );
}
