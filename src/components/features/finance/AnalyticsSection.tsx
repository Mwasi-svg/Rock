import { useState, useMemo } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as PieIcon, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { SpendingData, IncomeData, ExpenseData } from "../../../type/rock-data";

interface AnalyticsSectionProps {
    categories: SpendingData[];
    expenses: ExpenseData[];
    income: IncomeData;
}

type ChartType = "area" | "bar" | "pie";

export function AnalyticsSection({ categories, expenses, income }: AnalyticsSectionProps) {
    const [chartType, setChartType] = useState<ChartType>("area");

    // --- Data Preparation ---

    // 1. Area Chart Data: Group expenses by Date
    const areaData = useMemo(() => {
        // Group by date (YYYY-MM-DD)
        const grouped = expenses.reduce((acc, expense) => {
            const date = expense.date.split("T")[0]; // Simple ISO date split
            acc[date] = (acc[date] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);

        // Sort dates and convert to array
        const sortedDates = Object.keys(grouped).sort();

        // If no data, return a placeholder or empty
        if (sortedDates.length === 0) return [];

        return sortedDates.map(date => ({
            name: date,
            amount: grouped[date],
            income: income // Flat line for income visual
        }));
    }, [expenses, income]);

    // 2. Bar/Pie Chart Data: Group expenses by Category
    const categoryData = useMemo(() => {
        const grouped = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);

        // Map to array and try to find color from categories list
        return Object.entries(grouped).map(([name, value]) => {
            const catDef = categories.find(c => c.name === name);
            return {
                name,
                value,
                color: catDef?.color || "#94a3b8" // Fallback color
            };
        });
    }, [expenses, categories]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Spending Overview
                    </h3>
                    <p className="text-sm text-muted">Visualize your financial health</p>
                </div>

                {/* Chart Switcher */}
                <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setChartType("area")}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            chartType === "area" ? "bg-primary text-white shadow-lg" : "text-muted hover:text-white"
                        )}
                        title="Growth Trend"
                    >
                        <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setChartType("bar")}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            chartType === "bar" ? "bg-primary text-white shadow-lg" : "text-muted hover:text-white"
                        )}
                        title="Category Comparison"
                    >
                        <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setChartType("pie")}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            chartType === "pie" ? "bg-primary text-white shadow-lg" : "text-muted hover:text-white"
                        )}
                        title="Distribution"
                    >
                        <PieIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 min-h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "area" ? (
                        <AreaChart data={areaData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val.slice(5)} // Show MM-DD
                            />
                            <YAxis
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `KES ${val}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                                strokeWidth={2}
                                name="Income Capacity"
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                                strokeWidth={2}
                                name="Expenses"
                            />
                            <Legend />
                        </AreaChart>
                    ) : chartType === "bar" ? (
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `KES ${val}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                            />
                            <Legend />
                        </PieChart>
                    )}
                </ResponsiveContainer>

                {areaData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted flex-col gap-2">
                        <BarChart3 className="w-8 h-8 opacity-20" />
                        <span className="opacity-50">No expense data to display</span>
                    </div>
                )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-muted block mb-1">Total Expenses</span>
                    <span className="text-lg font-bold text-white">KES {totalExpenses.toLocaleString()}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs text-muted block mb-1">Monthly Income</span>
                    <span className="text-lg font-bold text-emerald-400">KES {income.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
