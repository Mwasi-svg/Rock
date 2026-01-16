
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, LayoutGrid, ListTodo, Target } from "lucide-react";
import { KanbanBoard } from "../components/features/todo/KanbanBoard";
import { useLocalData } from "../lib/useLocalData";
import { useNotification } from "../lib/NotificationContext";
import { cn } from "../lib/utils";
import { useActions } from "../lib/ActionContext";
import type { TaskData, Milestone, TeamMember } from "../type/rock-data";

export function TodoPage() {
    const { data, loading, updateTasks, updateMilestones, updateTeamMembers } = useLocalData();
    const { showNotification } = useNotification();
    const { addTodoArgs } = useActions();
    const [zenMode, setZenMode] = useState(false);
    const [viewMode, setViewMode] = useState<"status" | "milestone">("status");

    const tasks = (data?.tasks || []) as TaskData[];

    // Initialize milestones if empty
    const milestones: Milestone[] = data?.milestones || [
        { id: "design", title: "Design", status: "active", color: "bg-purple-500" },
        { id: "backend", title: "Backend", status: "active", color: "bg-blue-500" },
        { id: "testing", title: "Testing", status: "active", color: "bg-emerald-500" },
    ];

    // Initialize team members if empty
    const teamMembers: TeamMember[] = data?.teamMembers || [
        { id: "user1", name: "You", initials: "ME", role: "Developer" },
        { id: "user2", name: "Alice", initials: "AL", role: "Designer" },
        { id: "user3", name: "Bob", initials: "BO", role: "QA" },
    ];

    // Get first in-progress task for Zen Mode, or first todo
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
    const zenTask = inProgressTasks[0] || tasks.find((t) => t.status === "todo") || null;

    const handleAddTask = async (task: TaskData) => {
        await updateTasks([...tasks, task]);
        showNotification("Task Added", {
            type: "success",
            message: `"${task.title}" has been created.`
        });
    };

    const handleUpdateTask = async (updatedTask: TaskData) => {
        await updateTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
        // Optional: Notify on status change? Maybe too noisy.
    };

    const handleDeleteTask = async (id: string) => {
        await updateTasks(tasks.filter((t) => t.id !== id));
        showNotification("Task Deleted", { type: "info" });
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full flex flex-col"
        >
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Tasks
                    </h1>
                    <p className="text-muted mt-2">
                        {tasks.length === 0 ? "Add your first task to get started." : `${tasks.filter(t => t.status !== "done").length} tasks remaining.`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === "status" ? "milestone" : "status")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            "bg-white/5 text-muted hover:bg-white/10 hover:text-white"
                        )}
                    >
                        {viewMode === "status" ? <Target className="w-4 h-4" /> : <ListTodo className="w-4 h-4" />}
                        {viewMode === "status" ? "Milestone View" : "Status View"}
                    </button>
                    <button
                        onClick={() => setZenMode(!zenMode)}
                        disabled={!zenTask}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            zenMode
                                ? "bg-secondary text-white shadow-lg shadow-secondary/30"
                                : "bg-white/5 text-muted hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {zenMode ? <LayoutGrid className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {zenMode ? "Exit Zen" : "Zen Mode"}
                    </button>
                </div>
            </header>

            <div className="flex-1 min-h-0">
                <div className="flex-1 min-h-0">
                    <KanbanBoard
                        tasks={tasks}
                        onAddTask={handleAddTask}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        externalTrigger={addTodoArgs}
                        viewMode={viewMode}
                        columns={
                            viewMode === "status"
                                ? [
                                    { id: "todo", title: "To Do", color: "bg-blue-500" },
                                    { id: "in-progress", title: "In Progress", color: "bg-orange-500" },
                                    { id: "done", title: "Done", color: "bg-emerald-500" },
                                ]
                                : milestones.map(m => ({ id: m.id, title: m.title, color: m.color || "bg-purple-500" }))
                        }
                        teamMembers={teamMembers}
                        milestones={milestones}
                    />
                </div>
            </div>
        </motion.div>
    );
}
