import { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { SavingsGoal, ExpenseData } from "../../../type/rock-data";

interface EmergencyFundProps {
    goals: SavingsGoal[];
    expenses: ExpenseData[];
    monthlyIncome: number;
    onAddGoal: (goal: SavingsGoal) => void;
    onUpdateGoal: (goal: SavingsGoal) => void;
}

export function EmergencyFund({ goals, expenses, monthlyIncome, onAddGoal, onUpdateGoal }: EmergencyFundProps) {
    // Find the emergency fund goal
    const emergencyGoal = goals.find(g => g.category === "emergency");

    // Calculate average monthly expenses (last 3 months for accuracy, or all if less)
    const averageExpenses = useMemo(() => {
        if (expenses.length === 0) return 0;

        // Group by month
        const monthlyTotals: Record<string, number> = {};
        expenses.forEach(exp => {
            const monthKey = exp.date.substring(0, 7); // YYYY-MM
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + exp.amount;
        });

        const months = Object.keys(monthlyTotals).length;
        const total = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);

        // Return average (if less than 1 month data, assume equal to total)
        return months > 0 ? total / months : total;
    }, [expenses]);

    // If no expenses yet, use income as a proxy for "burn rate" (defaulting to 80% of income)
    const monthlyBurnRate = averageExpenses > 0 ? averageExpenses : (monthlyIncome * 0.8);

    // Milestones
    const milestones = [
        { months: 1, label: "Starter", color: "text-blue-400", bg: "bg-blue-500" },
        { months: 3, label: "Secure", color: "text-indigo-400", bg: "bg-indigo-500" },
        { months: 6, label: "Fortress", color: "text-emerald-400", bg: "bg-emerald-500" },
    ];

    const currentSaved = emergencyGoal?.currentAmount || 0;
    const currentMonths = monthlyBurnRate > 0 ? currentSaved / monthlyBurnRate : 0;

    const handleCreateFund = () => {
        const target = monthlyBurnRate * 3; // Default to 3 months
        onAddGoal({
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            name: "Emergency Fund",
            category: "emergency",
            targetAmount: target,
            currentAmount: 0,
            monthlyContribution: 0,
            color: "#EF4444"
        });
    };

    return (
        <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Emergency Fund
                    </h3>
                    <p className="text-xs text-muted mt-1">Your financial safety net</p>
                </div>
                {emergencyGoal && (
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <span className="text-xs font-mono text-emerald-400">
                            {currentMonths.toFixed(1)} Months Covered
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 relative z-10">
                {!emergencyGoal ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 bg-white/5 rounded-full">
                            <ShieldAlert className="w-10 h-10 text-amber-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">No Safety Net Yet</h4>
                            <p className="text-sm text-muted max-w-[250px] mx-auto">
                                Experts recommend saving 3-6 months of expenses for unexpected events.
                            </p>
                        </div>
                        <button
                            onClick={handleCreateFund}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            Start Emergency Fund
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <span className="text-xs text-muted block mb-1">Current Saved</span>
                                <span className="text-lg font-mono font-bold text-white">
                                    KES {currentSaved.toLocaleString()}
                                </span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <span className="text-xs text-muted block mb-1">Monthly Burn</span>
                                <span className="text-lg font-mono font-bold text-white">
                                    ~KES {monthlyBurnRate.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Milestones Progress */}
                        <div className="space-y-4">
                            {milestones.map((milestone, index) => {
                                const targetAmount = monthlyBurnRate * milestone.months;
                                const progress = Math.min((currentSaved / targetAmount) * 100, 100);
                                const isReached = currentSaved >= targetAmount;

                                return (
                                    <div key={milestone.months} className="relative">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className={cn("text-xs font-medium flex items-center gap-1.5",
                                                isReached ? milestone.color : "text-muted")}>
                                                {isReached ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                                {milestone.label} ({milestone.months} mo)
                                            </span>
                                            <span className="text-xs font-mono text-muted/70">
                                                KES {targetAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1, delay: index * 0.2 }}
                                                className={cn("h-full rounded-full transition-all",
                                                    isReached ? milestone.bg : "bg-white/20")}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Insight/Tip */}
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                            <p className="text-xs text-emerald-400 flex gap-2">
                                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                                {currentMonths < 1
                                    ? "Focus on reaching 1 month of expenses first. You got this!"
                                    : currentMonths < 3
                                        ? "Great start! Push for the 3-month security milestone."
                                        : "Excellent! You have a solid financial foundation."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
