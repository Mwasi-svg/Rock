import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ActionContextType {
    // Triggers (Counters that increment to signal an event)
    addProjectArgs: number;
    addTodoArgs: number;
    addExpenseArgs: number;

    // Actions
    triggerAddProject: () => void;
    triggerAddTodo: () => void;
    triggerAddExpense: () => void;
    openSettings: () => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export function ActionProvider({ children }: { children: ReactNode }) {
    const [addProjectArgs, setAddProjectArgs] = useState(0);
    const [addTodoArgs, setAddTodoArgs] = useState(0);
    const [addExpenseArgs, setAddExpenseArgs] = useState(0);

    const triggerAddProject = () => setAddProjectArgs(prev => prev + 1);
    const triggerAddTodo = () => setAddTodoArgs(prev => prev + 1);
    const triggerAddExpense = () => setAddExpenseArgs(prev => prev + 1);
    const openSettings = () => { window.location.hash = "#settings"; };

    return (
        <ActionContext.Provider value={{
            addProjectArgs,
            addTodoArgs,
            addExpenseArgs,
            triggerAddProject,
            triggerAddTodo,
            triggerAddExpense,
            openSettings,
        }}>
            {children}
        </ActionContext.Provider>
    );
}

export function useActions() {
    const context = useContext(ActionContext);
    if (context === undefined) {
        throw new Error("useActions must be used within an ActionProvider");
    }
    return context;
}
