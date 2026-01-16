import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Command, Home, Calendar, CheckSquare,
    PieChart, FolderGit2, Plus, Settings, HardDrive
} from "lucide-react";
import { useActions } from "../../../lib/ActionContext";
import { useSounds } from "../../../lib/useSounds";

interface CommandItem {
    id: string;
    icon: any;
    label: string;
    shortcut?: string;
    action: () => void;
    category: "Navigation" | "Action" | "System";
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { play: playSound } = useSounds();

    // Connect to global actions
    const {
        openSettings,
        triggerAddProject,
        triggerAddTodo,
        triggerAddExpense
    } = useActions();

    // Toggle with Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                playSound('pop');
                setIsOpen(prev => !prev);
                setQuery("");
                setSelectedIndex(0);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const commands: CommandItem[] = useMemo(() => [
        // Navigation
        {
            id: "nav-home",
            icon: Home,
            label: "Go to Home",
            category: "Navigation",
            action: () => window.location.hash = "#home"
        },
        {
            id: "nav-projects",
            icon: FolderGit2,
            label: "Go to Projects",
            category: "Navigation",
            action: () => window.location.hash = "#projects"
        },
        {
            id: "nav-todo",
            icon: CheckSquare,
            label: "Go to To-Do",
            category: "Navigation",
            action: () => window.location.hash = "#todo"
        },
        {
            id: "nav-calendar",
            icon: Calendar,
            label: "Go to Calendar",
            category: "Navigation",
            action: () => window.location.hash = "#calendar"
        },
        {
            id: "nav-finance",
            icon: PieChart,
            label: "Go to Finance",
            category: "Navigation",
            action: () => window.location.hash = "#finance"
        },
        // Actions
        {
            id: "act-new-project",
            icon: Plus,
            label: "Create New Project",
            category: "Action",
            action: () => {
                window.location.hash = "#projects";
                // Small delay to let page load before triggering modal
                setTimeout(triggerAddProject, 100);
            }
        },
        {
            id: "act-new-todo",
            icon: Plus,
            label: "Add To-Do Item",
            category: "Action",
            action: () => {
                window.location.hash = "#todo";
                setTimeout(triggerAddTodo, 100);
            }
        },
        {
            id: "act-new-expense",
            icon: Plus,
            label: "Add Expense",
            category: "Action",
            action: () => {
                window.location.hash = "#finance";
                setTimeout(triggerAddExpense, 100);
            }
        },
        // System
        {
            id: "sys-settings",
            icon: Settings,
            label: "Open Settings",
            category: "System",
            action: () => openSettings()
        },
        {
            id: "sys-backup",
            icon: HardDrive,
            label: "Backup Data",
            category: "System",
            action: () => openSettings()
        }
    ], [openSettings, triggerAddProject, triggerAddTodo, triggerAddExpense]);

    const filteredCommands = useMemo(() => {
        if (!query) return commands;
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, commands]);

    // Keyboard navigation within list
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredCommands.length - 1 ? prev + 1 : prev
                );
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
            }
            if (e.key === "Enter") {
                e.preventDefault();
                const cmd = filteredCommands[selectedIndex];
                if (cmd) {
                    cmd.action();
                    setIsOpen(false);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] z-[100]"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-surface/90 border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col backdrop-blur-xl"
                    >
                        <div className="flex items-center px-4 py-3 border-b border-white/5 gap-3">
                            <Search className="w-5 h-5 text-muted" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                className="flex-1 bg-transparent text-lg text-white placeholder:text-muted/50 focus:outline-none"
                                placeholder="Type a command or search..."
                            />
                            <div className="flex gap-2">
                                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted bg-white/5 border border-white/5 rounded">
                                    <span className="text-[10px]">ESC</span>
                                </kbd>
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {filteredCommands.length === 0 ? (
                                <div className="p-8 text-center text-muted">No commands found</div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredCommands.map((cmd, index) => {
                                        const Icon = cmd.icon;
                                        const isSelected = index === selectedIndex;
                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={() => {
                                                    cmd.action();
                                                    setIsOpen(false);
                                                }}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${isSelected
                                                    ? "bg-primary/20 text-white"
                                                    : "text-zinc-400 hover:text-white"
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-md ${isSelected ? "bg-primary text-white" : "bg-white/5 text-muted"}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="flex-1 font-medium">{cmd.label}</span>
                                                {cmd.shortcut && (
                                                    <span className="text-xs text-muted font-mono">{cmd.shortcut}</span>
                                                )}
                                                {isSelected && (
                                                    <span className="text-xs text-primary/80">Enter</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2 bg-black/20 border-t border-white/5 text-[10px] text-muted flex justify-between">
                            <span>Tip: Connect your GitHub repo for automatic deployments</span>
                            <span>Rocket v1.2</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
