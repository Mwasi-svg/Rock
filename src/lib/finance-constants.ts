import { CategoryAllocation, FinancialSettings } from "../type/rock-data";

export const DEFAULT_FINANCIAL_SETTINGS: FinancialSettings = {
    currency: "KES",
    currencySymbol: "KES",
    emergencyFundMonths: 3,
    budgetFramework: "50-30-20",
    showFinancialTips: true,
    monthStartDay: 1,
};

export const DEFAULT_CATEGORY_ALLOCATIONS: CategoryAllocation[] = [
    // Needs (50%)
    { categoryName: "Rent", budgetCategory: "needs" },
    { categoryName: "Utilities", budgetCategory: "needs" },
    { categoryName: "Groceries", budgetCategory: "needs" },
    { categoryName: "Transport", budgetCategory: "needs" },
    { categoryName: "Healthcare", budgetCategory: "needs" },
    { categoryName: "Insurance", budgetCategory: "needs" },
    { categoryName: "Phone", budgetCategory: "needs" },
    { categoryName: "Tuition", budgetCategory: "needs" },
    // Wants (30%)
    { categoryName: "Entertainment", budgetCategory: "wants" },
    { categoryName: "Dining Out", budgetCategory: "wants" },
    { categoryName: "Shopping", budgetCategory: "wants" },
    { categoryName: "Subscriptions", budgetCategory: "wants" },
    { categoryName: "Hobbies", budgetCategory: "wants" },
    { categoryName: "Travel", budgetCategory: "wants" },
    // Savings (20%)
    { categoryName: "Emergency Fund", budgetCategory: "savings" },
    { categoryName: "Investments", budgetCategory: "savings" },
    { categoryName: "Goals", budgetCategory: "savings" },
];
