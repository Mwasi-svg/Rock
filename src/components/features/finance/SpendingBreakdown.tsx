import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import type { SpendingData, ExpenseData } from "../../../type/rock-data";

interface SpendingBreakdownProps {
    categories: SpendingData[];
    expenses: ExpenseData[];
}

export function SpendingBreakdown({ categories, expenses }: SpendingBreakdownProps) {
    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Generate colors for categories
    const categoryColors = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#F97316"];

    const chartData = Object.entries(expensesByCategory)
        .map(([category, value], index) => ({
            name: category,
            value: value,
            color: categoryColors[index % categoryColors.length],
            percentage: totalSpent > 0 ? ((value / totalSpent) * 100).toFixed(1) : "0",
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-primary" />
                    Spending Overview
                </h3>
            </div>

            {categories.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted">
                    <p>No spending data yet</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-6">
                    {/* Donut Chart */}
                    <div className="h-48 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1A1A1A",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                        padding: "8px 12px",
                                    }}
                                    labelStyle={{ color: "#fff", fontWeight: 600 }}
                                    formatter={(value: number | undefined, name: string | undefined) => [
                                        `KES ${(value ?? 0).toLocaleString()}`,
                                        name ?? "Unknown",
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Total */}
                        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-xs text-muted uppercase tracking-wide">Total</p>
                            <p className="text-2xl font-bold text-white font-mono">
                                KES {totalSpent.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Category List */}
                    <div className="flex-1 space-y-2 overflow-y-auto">
                        {chartData.map((cat) => (
                            <div
                                key={cat.name}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="text-sm text-white">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted font-mono">
                                        KES {cat.value.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted min-w-[40px] text-right">
                                        {cat.percentage}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
