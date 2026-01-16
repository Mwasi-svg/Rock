import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, PiggyBank, Target } from "lucide-react";
import { motion } from "framer-motion";
import type { SpendingData } from "../../../type/rock-data";

interface SmartInsightsProps {
    categories: SpendingData[];
    monthlyIncome: number;
    totalSpent: number;
}

interface Insight {
    id: string;
    type: "success" | "warning" | "info" | "tip";
    message: string;
    icon: React.ReactNode;
}

export function SmartInsights({ categories, monthlyIncome, totalSpent }: SmartInsightsProps) {
    const insights: Insight[] = [];

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalSpent) / monthlyIncome) * 100 : 0;
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
    const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Find overspending categories
    const overspendingCategories = categories.filter(cat => cat.spent > cat.budget);

    // Find highest spending category
    const highestCategory = categories.length > 0
        ? categories.reduce((max, cat) => cat.spent > max.spent ? cat : max, categories[0])
        : null;

    // Generate insights based on financial situation
    if (monthlyIncome === 0) {
        insights.push({
            id: "1",
            type: "info",
            message: "Set your monthly income to get personalized financial insights",
            icon: <Lightbulb className="w-5 h-5" />,
        });
    } else if (savingsRate >= 20) {
        insights.push({
            id: "1",
            type: "success",
            message: `Excellent! You're saving ${savingsRate.toFixed(0)}% of your income`,
            icon: <CheckCircle className="w-5 h-5" />,
        });
    } else if (savingsRate >= 10) {
        insights.push({
            id: "1",
            type: "tip",
            message: `Good start! You're saving ${savingsRate.toFixed(0)}%. Try to reach 20% for optimal savings`,
            icon: <TrendingUp className="w-5 h-5" />,
        });
    } else if (savingsRate < 0) {
        insights.push({
            id: "1",
            type: "warning",
            message: `You're spending KES ${Math.abs(monthlyIncome - totalSpent).toLocaleString()} more than you earn`,
            icon: <AlertCircle className="w-5 h-5" />,
        });
    } else {
        insights.push({
            id: "1",
            type: "info",
            message: `Try to save at least 10-15% of your income for financial security`,
            icon: <Target className="w-5 h-5" />,
        });
    }

    // Overspending warnings
    if (overspendingCategories.length > 0) {
        const topOverspend = overspendingCategories[0];
        const overAmount = topOverspend.spent - topOverspend.budget;
        insights.push({
            id: "2",
            type: "warning",
            message: `You're over budget in ${topOverspend.name} by KES ${overAmount.toLocaleString()}`,
            icon: <AlertCircle className="w-5 h-5" />,
        });
    }

    // Spending concentration
    if (highestCategory && categories.length > 1) {
        const highestPercentage = totalSpent > 0 ? ((highestCategory.spent / totalSpent) * 100) : 0;
        if (highestPercentage > 40) {
            insights.push({
                id: "3",
                type: "info",
                message: `${highestPercentage.toFixed(0)}% of spending is in ${highestCategory.name}. Consider diversifying`,
                icon: <Lightbulb className="w-5 h-5" />,
            });
        }
    }

    // Budget utilization
    if (spendingPercentage < 50 && totalBudget > 0) {
        insights.push({
            id: "4",
            type: "success",
            message: `Great control! You've only used ${spendingPercentage.toFixed(0)}% of your budget`,
            icon: <CheckCircle className="w-5 h-5" />,
        });
    } else if (spendingPercentage > 80 && spendingPercentage < 100) {
        insights.push({
            id: "4",
            type: "info",
            message: `You've used ${spendingPercentage.toFixed(0)}% of your budget. Monitor spending closely`,
            icon: <Target className="w-5 h-5" />,
        });
    }

    // Savings opportunity
    if (savingsRate > 0 && savingsRate < 20 && monthlyIncome > 0) {
        const potentialSavings = monthlyIncome * 0.2 - (monthlyIncome - totalSpent);
        if (potentialSavings > 0) {
            insights.push({
                id: "5",
                type: "tip",
                message: `Save an extra KES ${potentialSavings.toLocaleString()}/month to reach 20% savings rate`,
                icon: <PiggyBank className="w-5 h-5" />,
            });
        }
    }

    // Default insight if none generated
    if (insights.length === 0) {
        insights.push({
            id: "default",
            type: "info",
            message: "Add spending categories and income to receive personalized insights",
            icon: <Lightbulb className="w-5 h-5" />,
        });
    }

    const getInsightStyles = (type: Insight["type"]) => {
        switch (type) {
            case "success":
                return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
            case "warning":
                return "bg-red-500/10 border-red-500/20 text-red-400";
            case "info":
                return "bg-blue-500/10 border-blue-500/20 text-blue-400";
            case "tip":
                return "bg-amber-500/10 border-amber-500/20 text-amber-400";
        }
    };

    return (
        <div className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    Smart Insights
                </h3>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
                {insights.slice(0, 4).map((insight, index) => (
                    <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${getInsightStyles(insight.type)}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">{insight.icon}</div>
                            <p className="text-sm text-white leading-relaxed flex-1">
                                {insight.message}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
