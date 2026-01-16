import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, Lightbulb, Plus, Trash2, FolderGit2, Eye, EyeOff, BarChart3, LineChart as LineChartIcon, Activity } from "lucide-react";
import { useLocalData } from "../lib/useLocalData";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
    PieChart, Pie, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { cn } from "../lib/utils";
import type { ProjectData } from "../type/rock-data";

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

export function FinancePage() {
    const { data, saveData, loading } = useLocalData();
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [isPrivate, setIsPrivate] = useState(() => localStorage.getItem("rock_privacy_mode") === "true");

    // Charting State
    const [breakdownView, setBreakdownView] = useState<'income' | 'expenses'>('income');
    const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

    // New item states
    const [newExpense, setNewExpense] = useState({ description: "", amount: "" });
    const [newIncome, setNewIncome] = useState({ source: "", amount: "", category: "salary" });

    // Computed Data
    const expenses = data?.expenses || [];
    const incomeSources = data?.incomeSources || [];
    const projects = data?.projects || [];

    // Get current month key
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Calculate Project Earnings (cumulative)
    const totalProjectEarnings = projects.reduce((sum, p) => {
        if (p.received) {
            return sum + p.received;
        }
        return sum;
    }, 0);
    const topProjects = [...projects].sort((a, b) => (b.received || 0) - (a.received || 0)).slice(0, 3).filter(p => (p.received || 0) > 0);

    // Calculate monthly totals
    const totalExpenses = expenses.reduce((sum, exp) => {
        const expenseDate = new Date(exp.date);
        const expenseMonthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        if (expenseMonthKey === currentMonthKey) {
            return sum + exp.amount;
        }
        return sum;
    }, 0);

    const totalIncome = incomeSources.reduce((sum, inc) => {
        if (inc.date) {
            const incomeDate = new Date(inc.date);
            const incomeMonthKey = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;
            if (incomeMonthKey === currentMonthKey) {
                return sum + inc.amount;
            }
        }
        return sum;
    }, 0) + totalProjectEarnings;

    const netBalance = totalIncome - totalExpenses;

    // --- Data Aggregation for Charts ---
    const aggregatedData = useMemo(() => {
        let rawData: { name: string; amount: number; color?: string }[] = [];

        if (breakdownView === 'income') {
            // 1. Projects
            if (totalProjectEarnings > 0) {
                rawData.push({ name: 'Projects', amount: totalProjectEarnings });
            }
            // 2. Manual Sources
            incomeSources.forEach(inc => {
                rawData.push({ name: inc.name, amount: inc.amount });
            });
        } else {
            // Expenses - Aggregate by description
            const groups: Record<string, number> = {};
            expenses.forEach(exp => {
                const desc = exp.description.trim(); // Case sensitive for now, could normalize
                groups[desc] = (groups[desc] || 0) + exp.amount;
            });
            Object.entries(groups).forEach(([name, amount]) => {
                rawData.push({ name, amount });
            });
        }

        // Sort: Most to Least
        return rawData
            .sort((a, b) => b.amount - a.amount)
            .map((item, index) => ({
                ...item,
                color: COLORS[index % COLORS.length]
            }));
    }, [breakdownView, totalProjectEarnings, incomeSources, expenses]);


    // AI Suggestions Logic
    const getAiSuggestions = () => {
        const suggestions = [];
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

        if (totalIncome === 0) {
            suggestions.push({
                title: "Start Tracking Income",
                desc: "Add your income sources to get personalized financial advice.",
                icon: <DollarSign className="w-5 h-5 text-blue-400" />
            });
            return suggestions;
        }

        if (savingsRate < 20) {
            suggestions.push({
                title: "Boost Your Savings",
                desc: `You're saving ${savingsRate.toFixed(1)}% of your income. Aim for at least 20% by reducing non-essential expenses.`,
                icon: <TrendingUp className="w-5 h-5 text-emerald-400" />
            });
        } else {
            suggestions.push({
                title: "Great Savings Rate!",
                desc: `You're saving ${savingsRate.toFixed(1)}% of your income. Consider investing the surplus.`,
                icon: <Wallet className="w-5 h-5 text-blue-400" />
            });
        }

        if (totalExpenses > totalIncome) {
            suggestions.push({
                title: "Spending Alert",
                desc: "Your expenses exceed your income. Review your recurring subscriptions.",
                icon: <TrendingDown className="w-5 h-5 text-rose-400" />
            });
        }

        if (totalProjectEarnings > 0 && totalProjectEarnings > (totalIncome - totalProjectEarnings)) {
            suggestions.push({
                title: "Project Revenue High",
                desc: "Your projects are your primary income source.",
                icon: <FolderGit2 className="w-5 h-5 text-purple-400" />
            });
        }

        return suggestions;
    };

    const suggestions = getAiSuggestions();

    // Handlers
    async function handleAddIncome() {
        if (!newIncome.source.trim() || !newIncome.amount) return;
        const incomeItem = {
            id: crypto.randomUUID(),
            name: newIncome.source,
            amount: parseFloat(newIncome.amount),
            category: newIncome.category,
            date: new Date().toISOString(),
            frequency: "monthly",
            isActive: true
        };

        await saveData({
            ...data,
            // @ts-ignore
            incomeSources: [...incomeSources, incomeItem],
        });
        setNewIncome({ source: "", amount: "", category: "salary" });
        setShowIncomeModal(false);
    }

    async function handleDeleteIncome(id: string) {
        await saveData({
            ...data,
            incomeSources: incomeSources.filter(i => i.id !== id),
        });
    }

    async function handleAddExpense() {
        if (!newExpense.description.trim() || !newExpense.amount) return;
        const expenseItem = {
            id: crypto.randomUUID(),
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            date: new Date().toISOString(),
            category: "General",
            createdAt: new Date().toISOString()
        };
        await saveData({
            ...data,
            expenses: [...expenses, expenseItem],
        });
        setNewExpense({ description: "", amount: "" });
        setShowExpenseModal(false);
    }

    async function handleDeleteExpense(id: string) {
        await saveData({
            ...data,
            expenses: expenses.filter(e => e.id !== id),
        });
    }


    if (loading) return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12 h-full flex flex-col overflow-y-auto"
        >
            <header className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">Financial Insights</h1>
                    <p className="text-muted">Advanced tracking & AI-powered analytics</p>
                </div>
                <button
                    onClick={() => {
                        const newValue = !isPrivate;
                        setIsPrivate(newValue);
                        localStorage.setItem("rock_privacy_mode", String(newValue));
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    title={isPrivate ? "Show values" : "Hide values"}
                >
                    {isPrivate ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </header>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10"><TrendingUp className="w-6 h-6 text-emerald-400" /></div>
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+{(totalIncome > 0 ? (totalIncome / (totalIncome + totalExpenses)) * 100 : 0).toFixed(0)}% Flow</span>
                    </div>
                    <p className="text-sm text-muted">Total Income</p>
                    <p className="text-3xl font-bold text-white mt-1">
                        {isPrivate ? "KES ••••••" : `KES ${totalIncome.toLocaleString()}`}
                    </p>
                </div>
                <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-rose-500/10"><TrendingDown className="w-6 h-6 text-rose-400" /></div>
                        <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full">{(totalExpenses > 0 && totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0).toFixed(0)}% Utilized</span>
                    </div>
                    <p className="text-sm text-muted">Total Expenses</p>
                    <p className="text-3xl font-bold text-white mt-1">
                        {isPrivate ? "KES ••••••" : `KES ${totalExpenses.toLocaleString()}`}
                    </p>
                </div>
                <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-3 rounded-xl", netBalance >= 0 ? "bg-blue-500/10" : "bg-amber-500/10")}>
                            <Wallet className={cn("w-6 h-6", netBalance >= 0 ? "text-blue-400" : "text-amber-400")} />
                        </div>
                    </div>
                    <p className="text-sm text-muted">Net Balance</p>
                    <p className={cn("text-3xl font-bold mt-1", netBalance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {isPrivate ? "KES ••••••" : `KES ${netBalance.toLocaleString()}`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Visual Analytics */}
                <div className="lg:col-span-2 bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 min-h-[420px] flex flex-col">
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">

                        {/* View Toggles (Income vs Expenses) */}
                        <div className="flex bg-white/5 p-1 rounded-lg">
                            <button
                                onClick={() => setBreakdownView('income')}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    breakdownView === 'income' ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-muted hover:text-white"
                                )}
                            >
                                Income Sources
                            </button>
                            <button
                                onClick={() => setBreakdownView('expenses')}
                                className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    breakdownView === 'expenses' ? "bg-rose-500/20 text-rose-400 shadow-sm" : "text-muted hover:text-white"
                                )}
                            >
                                Expenses
                            </button>
                        </div>

                        {/* Chart Type Toggles */}
                        <div className="flex bg-white/5 p-1 rounded-lg">
                            <button onClick={() => setChartType('bar')} className={cn("p-2 rounded-md transition-all", chartType === 'bar' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")} title="Bar Chart">
                                <BarChart3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setChartType('pie')} className={cn("p-2 rounded-md transition-all", chartType === 'pie' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")} title="Pie Chart">
                                <PieChartIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setChartType('line')} className={cn("p-2 rounded-md transition-all", chartType === 'line' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")} title="Line Chart">
                                <Activity className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {aggregatedData.length > 0 ? (
                                chartType === 'bar' ? (
                                    <BarChart data={aggregatedData} layout="vertical" barSize={32} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis type="number" stroke="#666" fontSize={12} tickFormatter={(val) => `KES ${val}`} />
                                        <YAxis dataKey="name" type="category" stroke="#fff" fontSize={12} width={100} tickFormatter={(val) => val.length > 12 ? val.substring(0, 10) + '...' : val} />
                                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                                            {aggregatedData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                ) : chartType === 'pie' ? (
                                    <PieChart>
                                        <Pie
                                            data={aggregatedData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="amount"
                                        >
                                            {aggregatedData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                        <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                ) : (
                                    <AreaChart data={aggregatedData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#71717a', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                            tickFormatter={(val) => val.length > 8 ? val.substring(0, 6) + '...' : val}
                                        />
                                        <YAxis
                                            tick={{ fill: '#71717a', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke={breakdownView === 'income' ? "#10B981" : "#EF4444"}
                                            fillOpacity={1}
                                            fill={breakdownView === 'income' ? "url(#colorIncome)" : "url(#colorExpense)"}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                )
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted">
                                    No data to display
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-10 -mt-10" />
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 relative z-10">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        AI Financial Advisor
                    </h3>
                    <div className="space-y-4 relative z-10">
                        {suggestions.map((suggestion, idx) => (
                            <div key={idx} className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/5 hover:bg-black/30 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">{suggestion.icon}</div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white">{suggestion.title}</h4>
                                        <p className="text-xs text-muted mt-1 leading-relaxed">{suggestion.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                {/* Income Sources List */}
                <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Income Sources Details</h3>
                        <button onClick={() => setShowIncomeModal(true)} className="p-2 hover:bg-white/5 rounded-lg text-primary transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {/* Project Earnings Item */}
                        {totalProjectEarnings > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                        <FolderGit2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Project Earnings</p>
                                        <p className="text-xs text-muted">Aggregated from all projects</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-purple-400 font-semibold">+KES {totalProjectEarnings.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {incomeSources.map(inc => (
                            <div key={inc.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                        {inc.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{inc.name}</p>
                                        <p className="text-xs text-muted capitalize">{inc.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-emerald-400 font-semibold">+KES {inc.amount.toLocaleString()}</span>
                                    <button onClick={() => handleDeleteIncome(inc.id)} className="text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {incomeSources.length === 0 && totalProjectEarnings === 0 && (
                            <div className="text-center text-muted py-10">
                                <p>No income sources added</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Top Projects & Expenses */}
                <div className="flex flex-col gap-8 h-[400px]">
                    {/* Top Projects Showcase */}
                    {topProjects.length > 0 && (
                        <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex-1 flex flex-col min-h-0">
                            <h3 className="text-lg font-semibold text-white mb-4">Top Earning Projects</h3>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                {topProjects.map(project => (
                                    <div key={project.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg bg-white/5", project.color ? `text-${project.color.split('-')[1]}-500` : "text-white")}>
                                                <FolderGit2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium truncate max-w-[150px]">{project.title}</p>
                                                <p className="text-xs text-muted">Received</p>
                                            </div>
                                        </div>
                                        <span className="text-white font-semibold">KES {(project.received || 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Expenses List */}
                    <div className={cn("bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col", topProjects.length > 0 ? "h-1/2" : "h-full")}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Recent Expenses</h3>
                            <button onClick={() => setShowExpenseModal(true)} className="p-2 hover:bg-white/5 rounded-lg text-rose-400 transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {expenses.length === 0 ? (
                                <div className="text-center text-muted py-10">
                                    <p>No expenses added</p>
                                </div>
                            ) : (
                                expenses.map(exp => (
                                    <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs">
                                                {exp.description.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{exp.description}</p>
                                                <p className="text-xs text-muted">{new Date(exp.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-rose-400 font-semibold">-KES {exp.amount.toLocaleString()}</span>
                                            <button onClick={() => handleDeleteExpense(exp.id)} className="text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Income Modal */}
            {showIncomeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowIncomeModal(false)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Add Income Source</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-muted mb-1 block">Source Name</label>
                                <input type="text" placeholder="e.g. Salary, Freelance" value={newIncome.source} onChange={e => setNewIncome({ ...newIncome, source: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" autoFocus />
                            </div>
                            <div>
                                <label className="text-xs text-muted mb-1 block">Amount</label>
                                <input type="number" placeholder="0.00" value={newIncome.amount} onChange={e => setNewIncome({ ...newIncome, amount: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-xs text-muted mb-1 block">Category</label>
                                <select value={newIncome.category} onChange={e => setNewIncome({ ...newIncome, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-primary appearance-none">
                                    <option value="salary">Salary</option>
                                    <option value="freelance">Freelance</option>
                                    <option value="investment">Investment</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowIncomeModal(false)} className="flex-1 px-4 py-2 rounded-lg text-muted hover:bg-white/5 transition-colors">Cancel</button>
                                <button onClick={handleAddIncome} className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Add Income</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowExpenseModal(false)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Add Expense</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-muted mb-1 block">Description</label>
                                <input type="text" placeholder="e.g. Rent, Groceries" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" autoFocus />
                            </div>
                            <div>
                                <label className="text-xs text-muted mb-1 block">Amount</label>
                                <input type="number" placeholder="0.00" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowExpenseModal(false)} className="flex-1 px-4 py-2 rounded-lg text-muted hover:bg-white/5 transition-colors">Cancel</button>
                                <button onClick={handleAddExpense} className="flex-1 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium">Add Expense</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
