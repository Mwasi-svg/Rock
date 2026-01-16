import {
    Zap,
    TrendingUp,
    FolderGit2,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Clock,
    Calendar
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { useLocalData } from "../lib/useLocalData";
import { cn } from "../lib/utils";
import { ComputeUsage } from "../components/features/dashboard/ComputeUsage";
import { RecentDeployments } from "../components/features/dashboard/RecentDeployments";
import { SystemControl } from "../components/features/dashboard/SystemControl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardPage() {
    const { data } = useLocalData();
    const [activeCardIndex, setActiveCardIndex] = useState(0);

    // Get data
    const expenses = data?.expenses || [];
    const projects = data?.projects || [];
    const incomeSources = data?.incomeSources || [];

    // --- 1. Calculate Monthly Spending for Display ---
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthSpending = expenses.reduce((acc, expense) => {
        const expenseDate = new Date(expense.date);
        const expenseMonthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        if (expenseMonthKey === currentMonthKey) {
            return acc + expense.amount;
        }
        return acc;
    }, 0);

    // --- 1b. Calculate Previous Month Spending for Trend ---
    const previousDate = new Date();
    previousDate.setMonth(previousDate.getMonth() - 1);
    const previousMonthKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;

    const previousMonthSpending = expenses.reduce((acc, expense) => {
        const expenseDate = new Date(expense.date);
        const expenseMonthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        if (expenseMonthKey === previousMonthKey) {
            return acc + expense.amount;
        }
        return acc;
    }, 0);

    const spendingDiff = currentMonthSpending - previousMonthSpending;
    const spendingPercentChange = previousMonthSpending !== 0
        ? ((spendingDiff / previousMonthSpending) * 100)
        : (currentMonthSpending > 0 ? 100 : 0);

    // Logic: Increase = Green + Arrow Up, Decrease = Red + Arrow Down
    const isIncrease = spendingPercentChange > 0;
    const isDecrease = spendingPercentChange < 0;


    // --- 2. Prepare Data for Revenue vs Spending Graph (Monthly) ---
    // We want to show a timeline (e.g., last 6 months or based on data range)
    // Gather all unique months from expenses, projects, and income
    const allMonths = new Set<string>();

    expenses.forEach(e => {
        const d = new Date(e.date);
        allMonths.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });

    projects.forEach(p => {
        if (p.startDate) {
            const d = new Date(p.startDate);
            allMonths.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
    });

    incomeSources.forEach(i => {
        if (i.date) {
            const d = new Date(i.date);
            allMonths.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
    });

    // Ensure we have at least the last 6 months if data is sparse, ending at current month
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        allMonths.add(key);
    }

    const sortedMonths = Array.from(allMonths).sort();

    // Aggregate data per month
    const chartDataMap = sortedMonths.reduce((acc, monthKey) => {
        acc[monthKey] = {
            name: monthKey, // Format: YYYY-MM
            displayDate: new Date(monthKey + "-01").toLocaleDateString('en-US', { month: 'short' }),
            revenue: 0,
            spending: 0
        };
        return acc;
    }, {} as Record<string, any>);

    // Sum Spending
    expenses.forEach(expense => {
        const d = new Date(expense.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (chartDataMap[key]) {
            chartDataMap[key].spending += expense.amount;
        }
    });

    // Sum Revenue (from Projects)
    // Assumption: Project 'received' amount is attributed to the project 'startDate' month.
    projects.forEach(project => {
        if (project.startDate && project.received) {
            const d = new Date(project.startDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (chartDataMap[key]) {
                chartDataMap[key].revenue += (project.received || 0);
            }
        }
    });

    // Sum Revenue (from Manual Income Sources)
    incomeSources.forEach(income => {
        if (income.date) {
            const d = new Date(income.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (chartDataMap[key]) {
                chartDataMap[key].revenue += (income.amount || 0);
            }
        }
    });

    const chartData = Object.values(chartDataMap);

    // --- 3. Prepare Data for "At Risk" Projects ---
    const atRiskProjects = projects
        .filter(p => p.completion < 100 && p.endDate)
        .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
        .map(p => {
            const end = new Date(p.endDate!).getTime();
            const now = new Date().getTime();
            const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            return { ...p, daysLeft };
        });


    return (
        <div className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12">

            {/* Header */}
            <header className="flex justify-between items-start md:items-center mb-12 animate-enter">
                <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2 font-medium tracking-tight">
                        <span>Welcome</span>
                        <span>to</span>
                        <span className="text-zinc-300">Rock by Turi</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight">Overview</h1>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-400 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        Operational
                    </div>
                </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-min">

                {/* Stats Card: Spending vs Revenue Graph (Swappable) */}
                <div className="col-span-1 md:col-span-6 lg:col-span-8 glass-card p-0 relative overflow-hidden group interactive-card animate-enter delay-1 h-96 flex flex-col">

                    {/* Navigation Arrows */}
                    <div className="absolute top-6 right-6 z-20 flex gap-2">
                        <button
                            onClick={() => setActiveCardIndex(prev => prev === 0 ? 1 : 0)}
                            className="p-1.5 bg-black/20 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors backdrop-blur-sm border border-white/5"
                            title="Previous View"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setActiveCardIndex(prev => prev === 0 ? 1 : 0)}
                            className="p-1.5 bg-black/20 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors backdrop-blur-sm border border-white/5"
                            title="Next View"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="relative w-full h-full">
                        <AnimatePresence mode="wait">
                            {activeCardIndex === 0 ? (
                                <motion.div
                                    key="spending"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full h-full p-8 flex flex-col justify-between"
                                >
                                    <div className="flex justify-between items-start z-10 relative mb-4">
                                        <div>
                                            <h3 className="text-zinc-400 text-sm font-medium mb-1 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-zinc-500" />
                                                Monthly Spending
                                            </h3>
                                            <div className="text-4xl font-semibold text-white tracking-tight mt-2">KES {currentMonthSpending.toLocaleString()}</div>
                                            <div className={cn("text-xs mt-2 flex items-center gap-1", isDecrease ? "text-rose-400" : "text-emerald-400")}>
                                                <div className={cn("px-1.5 py-0.5 rounded border flex items-center gap-1",
                                                    isDecrease ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                                                )}>
                                                    <TrendingUp className={cn("w-3 h-3", isDecrease && "rotate-180")} />
                                                    <span>{spendingPercentChange > 0 ? "+" : ""}{spendingPercentChange.toFixed(1)}%</span>
                                                </div>
                                                <span className="text-zinc-600 ml-1">vs last month</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recharts Visualization: Revenue vs Spending */}
                                    <div className="flex-1 w-full h-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis
                                                    dataKey="displayDate"
                                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                                />
                                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    name="Revenue"
                                                    stroke="#10B981" // Emerald
                                                    fillOpacity={1}
                                                    fill="url(#colorRevenue)"
                                                    strokeWidth={2}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="spending"
                                                    name="Spending"
                                                    stroke="#EF4444" // Red
                                                    fillOpacity={1}
                                                    fill="url(#colorSpending)"
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="risk"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full h-full p-8 flex flex-col"
                                >
                                    <div className="mb-6">
                                        <h3 className="text-zinc-400 text-sm font-medium mb-1 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                            Projects at Risk
                                        </h3>
                                        <p className="text-2xl font-semibold text-white mt-1">
                                            {atRiskProjects.length} Pending Deadlines
                                        </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                        {atRiskProjects.length > 0 ? (
                                            atRiskProjects.map((project, i) => {
                                                let color = "text-emerald-500";
                                                let statusText = `${project.daysLeft} days left`;

                                                if (project.daysLeft < 0) {
                                                    color = "text-red-500";
                                                    statusText = "Overdue";
                                                } else if (project.daysLeft <= 7) {
                                                    color = "text-orange-500";
                                                }

                                                return (
                                                    <ProjectRow
                                                        key={project.id}
                                                        name={project.title}
                                                        status={statusText}
                                                        percent={project.completion}
                                                        color={color}
                                                        delay={0.5 + (i * 0.1)}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-muted opacity-50">
                                                <Clock className="w-10 h-10 mb-2" />
                                                <p>No upcoming deadlines</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Project Completion Card */}
                <div className="col-span-1 md:col-span-6 lg:col-span-4 glass-card p-8 relative overflow-hidden group interactive-card animate-enter delay-2 h-96 flex flex-col">
                    <h3 className="text-zinc-400 text-sm font-medium mb-6 flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-zinc-500" />
                        Project Completion
                    </h3>

                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {projects.length > 0 ? (
                            projects.map((project, i) => (
                                <ProjectRow
                                    key={project.id}
                                    name={project.title}
                                    status={project.status}
                                    percent={project.completion}
                                    color={project.color}
                                    delay={0.5 + (i * 0.1)}
                                />
                            ))
                        ) : (
                            <div className="text-zinc-600 text-sm text-center py-10">
                                No active projects
                            </div>
                        )}
                    </div>
                </div>

                {/* Usage Circular */}
                <div className="col-span-1 md:col-span-3 lg:col-span-3">
                    <ComputeUsage />
                </div>

                {/* Recent Deployments List */}
                <div className="col-span-1 md:col-span-3 lg:col-span-5">
                    <RecentDeployments />
                </div>

                {/* Quick Actions */}
                <div className="col-span-1 md:col-span-6 lg:col-span-4">
                    <SystemControl />
                </div>

            </div>
        </div>
    );
}

function ProjectRow({ name, status, percent, color, delay }: any) {
    const bgClass = color.replace("text-", "bg-");

    return (
        <div className="group/item cursor-default">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", bgClass)} />
                    <div className="flex flex-col">
                        <span className="text-sm text-zinc-200 group-hover/item:text-white transition-colors">{name}</span>
                        <span className="text-sm text-zinc-500">{status}</span>
                    </div>
                </div>
                <span className="text-sm font-mono text-zinc-400 group-hover/item:text-white transition-colors">{percent}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full animate-[fillBar_1s_cubic-bezier(0.2,0.8,0.2,1)_forwards]", bgClass)}
                    style={{ width: `${percent}%`, animationDelay: `${delay}s` }}
                />
            </div>
        </div>
    );
}

// Add CSS for local animation if not global
const style = `
@keyframes fillBar { from { width: 0; } }
@keyframes circleFill { to { stroke-dashoffset: 80; } }
`;
