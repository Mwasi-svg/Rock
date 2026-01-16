import { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Home, Heart, PiggyBank, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { ExpenseData, CategoryAllocation, BudgetCategory } from "../../../type/rock-data";
import { DEFAULT_CATEGORY_ALLOCATIONS } from "../../../lib/finance-constants";

interface BudgetFrameworkProps {
    expenses: ExpenseData[];
    totalIncome: number;
    categoryAllocations?: CategoryAllocation[];
}

interface AllocationData {
    name: string;
    target: number;
    actual: number;
    amount: number;
    color: string;
    icon: React.ReactNode;
    [key: string]: any;
}


const BUDGET_COLORS = {
    needs: "#3B82F6",   // Blue
    wants: "#8B5CF6",   // Purple
    savings: "#10B981", // Green
};

const BUDGET_ICONS = {
    needs: <Home className="w-5 h-5" />,
    wants: <Heart className="w-5 h-5" />,
    savings: <PiggyBank className="w-5 h-5" />,
};

const BUDGET_TARGETS = {
    needs: 50,
    wants: 30,
    savings: 20,
};

export function BudgetFramework({ expenses, totalIncome, categoryAllocations }: BudgetFrameworkProps) {
    const allocations = categoryAllocations || DEFAULT_CATEGORY_ALLOCATIONS;

    // Calculate spending by budget category
    const budgetBreakdown = useMemo(() => {
        const breakdown: Record<BudgetCategory, number> = {
            needs: 0,
            wants: 0,
            savings: 0,
        };

        expenses.forEach((expense) => {
            // Check if expense has explicit budgetCategory
            if (expense.budgetCategory) {
                breakdown[expense.budgetCategory] += expense.amount;
            } else {
                // Try to match by category name
                const allocation = allocations.find(
                    (a) => a.categoryName.toLowerCase() === expense.category.toLowerCase()
                );
                if (allocation) {
                    breakdown[allocation.budgetCategory] += expense.amount;
                } else {
                    // Default to wants if unknown
                    breakdown.wants += expense.amount;
                }
            }
        });

        return breakdown;
    }, [expenses, allocations]);

    const totalSpent = budgetBreakdown.needs + budgetBreakdown.wants + budgetBreakdown.savings;

    // Calculate percentages and prepare chart data
    const allocationData: AllocationData[] = useMemo(() => {
        const data: AllocationData[] = [
            {
                name: "Needs",
                target: BUDGET_TARGETS.needs,
                actual: totalSpent > 0 ? (budgetBreakdown.needs / totalSpent) * 100 : 0,
                amount: budgetBreakdown.needs,
                color: BUDGET_COLORS.needs,
                icon: BUDGET_ICONS.needs,
            },
            {
                name: "Wants",
                target: BUDGET_TARGETS.wants,
                actual: totalSpent > 0 ? (budgetBreakdown.wants / totalSpent) * 100 : 0,
                amount: budgetBreakdown.wants,
                color: BUDGET_COLORS.wants,
                icon: BUDGET_ICONS.wants,
            },
            {
                name: "Savings",
                target: BUDGET_TARGETS.savings,
                actual: totalSpent > 0 ? (budgetBreakdown.savings / totalSpent) * 100 : 0,
                amount: budgetBreakdown.savings,
                color: BUDGET_COLORS.savings,
                icon: BUDGET_ICONS.savings,
            },
        ];
        return data;
    }, [budgetBreakdown, totalSpent]);

    // For pie chart - only include non-zero values
    const pieData = allocationData.filter((d) => d.amount > 0);

    // Calculate health score
    const healthScore = useMemo(() => {
        if (totalSpent === 0) return null;

        let score = 100;
        allocationData.forEach((item) => {
            const diff = Math.abs(item.actual - item.target);
            if (item.name === "Savings" && item.actual < item.target) {
                score -= diff * 2; // Penalize under-saving more
            } else if (item.name === "Wants" && item.actual > item.target) {
                score -= diff * 1.5; // Penalize overspending on wants
            } else {
                score -= diff * 0.5;
            }
        });
        return Math.max(0, Math.min(100, score));
    }, [allocationData, totalSpent]);

    const getHealthLabel = (score: number | null) => {
        if (score === null) return { text: "Start Tracking", color: "text-muted", icon: <TrendingUp className="w-4 h-4" /> };
        if (score >= 80) return { text: "Excellent", color: "text-emerald-400", icon: <CheckCircle className="w-4 h-4" /> };
        if (score >= 60) return { text: "Good", color: "text-blue-400", icon: <TrendingUp className="w-4 h-4" /> };
        if (score >= 40) return { text: "Needs Work", color: "text-amber-400", icon: <AlertTriangle className="w-4 h-4" /> };
        return { text: "Critical", color: "text-red-400", icon: <AlertTriangle className="w-4 h-4" /> };
    };

    const healthLabel = getHealthLabel(healthScore);

    return (
        <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-emerald-400" />
                        50/30/20 Budget
                    </h3>
                    <p className="text-xs text-muted mt-1">Smart allocation framework</p>
                </div>
                <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5", healthLabel.color)}>
                    {healthLabel.icon}
                    <span className="text-xs font-medium">{healthLabel.text}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6">
                {/* Pie Chart */}
                <div className="flex-1 min-h-[200px] relative">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="amount"
                                    nameKey="name"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => [`KES ${Number(value).toLocaleString()}`, "Spent"]}
                                    contentStyle={{
                                        backgroundColor: "#18181b",
                                        borderColor: "#27272a",
                                        borderRadius: "8px",
                                        color: "#fff",
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center flex-col text-muted">
                            <PiggyBank className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm">No expenses yet</p>
                            <p className="text-xs opacity-70">Add expenses to see your allocation</p>
                        </div>
                    )}
                </div>

                {/* Allocation Breakdown */}
                <div className="flex-1 space-y-4">
                    {allocationData.map((item, index) => {
                        const isOver = item.actual > item.target;
                        const isUnder = item.name === "Savings" && item.actual < item.target;
                        const diff = item.actual - item.target;

                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 rounded-xl p-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: `${item.color}20` }}
                                        >
                                            <div style={{ color: item.color }}>{item.icon}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-white">{item.name}</span>
                                            <p className="text-xs text-muted">Target: {item.target}%</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-mono text-white">
                                            KES {item.amount.toLocaleString()}
                                        </span>
                                        <p
                                            className={cn(
                                                "text-xs font-medium",
                                                isOver || isUnder ? "text-amber-400" : "text-emerald-400"
                                            )}
                                        >
                                            {item.actual.toFixed(0)}%
                                            {diff !== 0 && (
                                                <span className="ml-1 opacity-70">
                                                    ({diff > 0 ? "+" : ""}{diff.toFixed(0)}%)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
                                    {/* Target marker */}
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
                                        style={{ left: `${Math.min(item.target, 100)}%` }}
                                    />
                                    {/* Actual progress */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(item.actual, 100)}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={cn(
                                            "h-full rounded-full",
                                            isOver && item.name !== "Savings" ? "bg-amber-500" :
                                                isUnder ? "bg-amber-500" : ""
                                        )}
                                        style={{
                                            backgroundColor: (!isOver && !isUnder) || item.name === "Savings" && item.actual >= item.target
                                                ? item.color
                                                : undefined,
                                        }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Tips Section */}
            {totalSpent > 0 && healthScore !== null && healthScore < 80 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                >
                    <p className="text-xs text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {allocationData.find((d) => d.name === "Wants" && d.actual > d.target)
                            ? "Consider reducing 'Wants' spending to align with the 30% target."
                            : allocationData.find((d) => d.name === "Savings" && d.actual < d.target)
                                ? "Try to increase savings to reach the recommended 20% target."
                                : "Keep tracking expenses to improve your budget allocation."}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
