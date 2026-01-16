export interface SpendingCategory {
    id: string;
    name: string;
    spent: number;
    budget: number;
    color: string;
}

export interface WeeklySpending {
    day: string;
    amount: number;
}

export const SPENDING_CATEGORIES: SpendingCategory[] = [
    { id: "food", name: "Food & Dining", spent: 420, budget: 600, color: "#3B82F6" },
    { id: "transport", name: "Transport", spent: 180, budget: 200, color: "#8B5CF6" },
    { id: "entertainment", name: "Entertainment", spent: 95, budget: 150, color: "#EC4899" },
    { id: "utilities", name: "Utilities", spent: 130, budget: 150, color: "#10B981" },
    { id: "shopping", name: "Shopping", spent: 340, budget: 300, color: "#F59E0B" },
];

export const WEEKLY_SPENDING: WeeklySpending[] = [
    { day: "Mon", amount: 45 },
    { day: "Tue", amount: 82 },
    { day: "Wed", amount: 35 },
    { day: "Thu", amount: 120 },
    { day: "Fri", amount: 65 },
    { day: "Sat", amount: 95 },
    { day: "Sun", amount: 28 },
];

export const getTotalSpent = () => SPENDING_CATEGORIES.reduce((sum, c) => sum + c.spent, 0);
export const getTotalBudget = () => SPENDING_CATEGORIES.reduce((sum, c) => sum + c.budget, 0);
