// Type declarations for the rockData API exposed via preload
import { GitHubConfig } from "../lib/github";
import type { GitRepository, GitSettings, GitStatus, GitCommit, GitBranch } from "../lib/git-types";

// ========================================
// FINANCE DATA TYPES
// ========================================

// Budget allocation type for 50/30/20 framework
export type BudgetCategory = "needs" | "wants" | "savings";

// Income source tracking (multi-source)
export interface IncomeSource {
    id: string;
    name: string;
    amount: number;
    frequency: "one-time" | "weekly" | "bi-weekly" | "monthly";
    category: "job" | "allowance" | "scholarship" | "freelance" | "other";
    isActive: boolean;
    nextPayDate?: string;
    date?: string;
}

// Backward compatible - still support simple number for migration
export type IncomeData = number;

// Savings goals for students
export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    category: "emergency" | "purchase" | "travel" | "education" | "investment" | "other";
    color: string;
    icon?: string;
    monthlyContribution: number;
    createdAt: string;
}

// Recurring expenses (subscriptions, rent, etc.)
export interface RecurringExpense {
    id: string;
    name: string;
    amount: number;
    frequency: "weekly" | "bi-weekly" | "monthly" | "quarterly" | "yearly";
    category: string;
    budgetCategory: BudgetCategory; // For 50/30/20 allocation
    dueDay: number; // 1-31 for monthly
    isActive: boolean;
    lastPaid?: string;
    nextDue?: string;
    reminderDays?: number; // Days before due to remind
}

// Debt/loan tracking (student loans, credit cards)
export interface DebtItem {
    id: string;
    name: string;
    totalAmount: number;
    remainingBalance: number;
    interestRate: number; // Annual percentage
    minimumPayment: number;
    dueDay: number;
    type: "student-loan" | "credit-card" | "personal" | "car" | "other";
    startDate?: string;
    payments?: DebtPayment[];
}

export interface DebtPayment {
    id: string;
    amount: number;
    date: string;
    note?: string;
}

// Financial settings and preferences
export interface FinancialSettings {
    currency: string;
    currencySymbol: string;
    emergencyFundMonths: number; // Target months (3-6)
    budgetFramework: "50-30-20" | "custom";
    customAllocations?: {
        needs: number;
        wants: number;
        savings: number;
    };
    showFinancialTips: boolean;
    monthStartDay: number; // 1-28, when the budget month resets
}

// Category mapping for 50/30/20 framework
export interface CategoryAllocation {
    categoryName: string;
    budgetCategory: BudgetCategory;
}

// Financial insights
export interface FinancialInsight {
    id: string;
    type: "success" | "warning" | "info" | "tip";
    message: string;
    icon: string;
}

// ========================================
// MAIN APP DATA INTERFACE
// ========================================

export interface AppData {
    events?: CalendarEventData[];
    tasks?: TaskData[];
    spending?: SpendingData[];
    projects?: ProjectData[];
    income?: IncomeData; // Backward compatible (simple number)
    expenses?: ExpenseData[];
    // New finance features
    incomeSources?: IncomeSource[];
    savingsGoals?: SavingsGoal[];
    recurringExpenses?: RecurringExpense[];
    debts?: DebtItem[];
    financialSettings?: FinancialSettings;
    categoryAllocations?: CategoryAllocation[];
    // Project Planning
    milestones?: Milestone[];
    teamMembers?: TeamMember[];
    // Git Repository Management
    gitRepositories?: GitRepository[];
    gitSettings?: GitSettings;
}

// ========================================
// PROJECT DATA TYPES
// ========================================

export interface ProjectTodo {
    id: string;
    text: string;
    completed: boolean;
}

export interface ProjectData {
    id: string;
    title: string;
    status: "Implementation" | "Designing" | "Development" | "Iteration" | "Deployment";
    completion: number; // 0-100
    color: string;
    description?: string;
    link?: string;
    startDate?: string;
    endDate?: string;
    todos?: ProjectTodo[];
    githubConfig?: GitHubConfig;
    cost?: number;
    received?: number;
    techStack?: string[];
}

// ========================================
// TEAM & MILESTONE DATA TYPES
// ========================================

export interface TeamMember {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    initials: string;
}

export interface Milestone {
    id: string;
    title: string;
    description?: string;
    status: "active" | "completed" | "pending";
    dueDate?: string;
    color?: string;
}

// ========================================
// CALENDAR & TASK DATA TYPES
// ========================================

export interface CalendarEventData {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    category: "work" | "personal" | "urgent";
    description?: string;
}

export interface TaskData {
    id: string;
    title: string;
    description?: string;
    status: "todo" | "in-progress" | "done";
    priority: "low" | "medium" | "high" | "critical";
    milestoneId?: string;
    assigneeIds?: string[];
    dueDate?: string;
    tags?: string[];
    createdAt: string;
}

// ========================================
// SPENDING & EXPENSE DATA TYPES
// ========================================

export interface SpendingData {
    id: string;
    name: string;
    spent: number;
    budget: number;
    color: string;
    budgetCategory?: BudgetCategory; // For 50/30/20 allocation
}

export interface ExpenseData {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string; // ISO date string
    createdAt: string;
    budgetCategory?: BudgetCategory; // For 50/30/20 allocation
}

// ========================================
// GLOBAL DECLARATIONS
// ========================================

declare global {
    interface Window {
        rockData: {
            getData: () => Promise<AppData>;
            saveData: (data: AppData) => Promise<boolean>;
            getDataPath: () => Promise<string>;
        };
        rockGit: {
            verifyRepo: (repoPath: string) => Promise<boolean>;
            getStatus: (repoPath: string) => Promise<GitStatus>;
            getLog: (repoPath: string, limit?: number) => Promise<GitCommit[]>;
            getBranches: (repoPath: string) => Promise<GitBranch[]>;
            getCurrentBranch: (repoPath: string) => Promise<string>;
            commit: (repoPath: string, message: string, files: string[]) => Promise<void>;
            push: (repoPath: string) => Promise<void>;
            pull: (repoPath: string) => Promise<void>;
            fetch: (repoPath: string) => Promise<void>;
            switchBranch: (repoPath: string, branch: string) => Promise<void>;
            createBranch: (repoPath: string, branchName: string) => Promise<void>;
            clone: (url: string, destinationPath: string) => Promise<void>;
            getRemoteUrl: (repoPath: string) => Promise<string>;
            selectDirectory: () => Promise<string | null>;
        };
    }
}

export { };
