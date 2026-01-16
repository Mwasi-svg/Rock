import { motion } from "framer-motion";
import { ArrowLeft, FolderGit2, AlertCircle, Clock, CheckCircle2, Link as LinkIcon, ExternalLink, CheckSquare, Trash2, Plus, X, Code2 } from "lucide-react";
import { cn } from "../lib/utils";
import type { ProjectData } from "../type/rock-data";
import { useState, useEffect } from "react";
import { ComputeUsage } from "../components/features/dashboard/ComputeUsage";
import { RecentDeployments } from "../components/features/dashboard/RecentDeployments";
import { SystemControl } from "../components/features/dashboard/SystemControl";

// Duplicated from Projects.tsx for now - ideally shared
const STATUSES = {
    "Implementation": { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", bar: "bg-red-500" },
    "Designing": { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", bar: "bg-yellow-500" },
    "Development": { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", bar: "bg-orange-500" },
    "Iteration": { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500" },
    "Deployment": { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500" },
} as const;

interface ProjectDetailsProps {
    project: ProjectData;
    onBack: () => void;
    onUpdate: (updatedProject: ProjectData) => void;
}

export function ProjectDetails({ project, onBack, onUpdate }: ProjectDetailsProps) {
    const [newTodo, setNewTodo] = useState("");
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

    // Countdown Timer Logic
    useEffect(() => {
        if (!project.endDate) {
            setTimeLeft(null);
            return;
        }

        const calculateTime = () => {
            const end = new Date(project.endDate!).getTime();
            const now = new Date().getTime();
            const difference = end - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft(null);
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, [project.endDate]);

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        const todo = {
            id: crypto.randomUUID(),
            text: newTodo,
            completed: false
        };

        const updatedProject = {
            ...project,
            todos: [...(project.todos || []), todo]
        };
        onUpdate(updatedProject);
        setNewTodo("");
    };

    const handleToggleTodo = (todoId: string) => {
        const updatedTodos = project.todos?.map(t =>
            t.id === todoId ? { ...t, completed: !t.completed } : t
        ) || [];
        onUpdate({ ...project, todos: updatedTodos });
    };

    const handleDeleteTodo = (todoId: string) => {
        const updatedTodos = project.todos?.filter(t => t.id !== todoId) || [];
        onUpdate({ ...project, todos: updatedTodos });
    };

    const handleUpdateProgress = (newProgress: number) => {
        // Simple progress update, in real app status would update too
        const getStatusInfo = (completion: number): keyof typeof STATUSES => {
            if (completion < 30) return "Implementation";
            if (completion < 50) return "Designing";
            if (completion < 70) return "Development";
            if (completion < 90) return "Iteration";
            return "Deployment";
        };

        const newStatus = getStatusInfo(newProgress);

        onUpdate({
            ...project,
            completion: newProgress,
            status: newStatus,
            color: STATUSES[newStatus].color
        });
    };

    return (
        <div className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12 animate-enter">
            {/* Header / Nav */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition-all mb-8 group w-fit"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
            </button>

            {/* Title Section */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={cn("p-2 rounded-lg", STATUSES[project.status].bg)}>
                            <FolderGit2 className={cn("w-6 h-6", STATUSES[project.status].color)} />
                        </div>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border", STATUSES[project.status].color, STATUSES[project.status].border, STATUSES[project.status].bg)}>
                            {project.status}
                        </span>
                    </div>
                    <input
                        value={project.title}
                        onChange={(e) => onUpdate({ ...project, title: e.target.value })}
                        className="text-4xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder-white/30"
                    />
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Details & Todo */}
                <div className="col-span-1 lg:col-span-8 space-y-6">

                    {/* Project Metadata & Description */}
                    <div className="glass-card p-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Description
                                </label>
                                <textarea
                                    value={project.description || ""}
                                    onChange={(e) => onUpdate({ ...project, description: e.target.value })}
                                    placeholder="Project objectives and details..."
                                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary focus:outline-none resize-none"
                                />
                            </div>

                            {/* Tech Stack Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted flex items-center gap-2">
                                    <Code2 className="w-4 h-4" /> Tech Stack
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {project.techStack?.map((tech) => (
                                        <div key={tech} className="bg-white/10 text-xs px-2 py-1 rounded-md flex items-center gap-1 group/tag">
                                            <span className="text-white">{tech}</span>
                                            <button
                                                onClick={() => {
                                                    const newStack = project.techStack?.filter(t => t !== tech) || [];
                                                    onUpdate({ ...project, techStack: newStack });
                                                }}
                                                className="text-muted hover:text-white transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add tech stack (press Enter)..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val && !project.techStack?.includes(val)) {
                                                const newStack = [...(project.techStack || []), val];
                                                onUpdate({ ...project, techStack: newStack });
                                                e.currentTarget.value = "";
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={project.startDate || ""}
                                        onChange={(e) => onUpdate({ ...project, startDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Target End
                                    </label>
                                    <input
                                        type="date"
                                        value={project.endDate || ""}
                                        onChange={(e) => onUpdate({ ...project, endDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Todo List */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-primary" />
                            To-Do List
                        </h3>

                        <div className="space-y-3 mb-4">
                            {project.todos?.map((todo) => (
                                <div
                                    key={todo.id}
                                    className="group flex items-start gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 transition-colors"
                                >
                                    <button
                                        onClick={() => handleToggleTodo(todo.id)}
                                        className={cn(
                                            "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                            todo.completed
                                                ? "bg-primary border-primary text-white"
                                                : "border-white/20 hover:border-white/40"
                                        )}
                                    >
                                        {todo.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </button>
                                    <span className={cn(
                                        "flex-1 text-sm transition-colors break-words",
                                        todo.completed ? "text-muted line-through" : "text-white"
                                    )}>
                                        {todo.text}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteTodo(todo.id)}
                                        className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all px-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {(!project.todos || project.todos.length === 0) && (
                                <div className="text-center py-6 text-muted/50 text-sm italic">
                                    No tasks added yet
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAddTodo}>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    placeholder="Add task..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newTodo.trim()}
                                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Recent Deployments */}
                    <div className="h-[300px]">
                        <RecentDeployments
                            config={project.githubConfig}
                            onSaveConfig={(config) => onUpdate({ ...project, githubConfig: config })}
                            onClearConfig={() => onUpdate({ ...project, githubConfig: undefined })}
                        />
                    </div>

                </div>

                {/* Right Column: Stats & Controls */}
                <div className="col-span-1 lg:col-span-4 space-y-6">
                    {/* Completion Slider Card */}
                    <div className="glass-card p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Completion Status</span>
                                <span className="text-white font-medium">{project.completion}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.completion}%` }}
                                    className={cn("h-full rounded-full transition-all duration-500", STATUSES[project.status].bar)}
                                />
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={project.completion}
                                onChange={(e) => handleUpdateProgress(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                            />

                            {/* Countdown Clock */}
                            {timeLeft && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-xs text-muted uppercase tracking-wider font-medium">
                                        <Clock className="w-3 h-3" />
                                        Time Remaining
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-xl font-bold text-white">{timeLeft.days}</div>
                                            <div className="text-[10px] text-muted">DAYS</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
                                            <div className="text-[10px] text-muted">HRS</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
                                            <div className="text-[10px] text-muted">MIN</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
                                            <div className="text-[10px] text-muted">SEC</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cost Projection */}
                    <div className="h-64">
                        <ComputeUsage
                            cost={project.cost}
                            received={project.received}
                            onSave={(cost, received) => onUpdate({ ...project, cost, received })}
                        />
                    </div>

                    {/* System Control */}
                    <div className="h-auto">
                        <SystemControl />
                    </div>

                    {/* External Links */}
                    <div className="glass-card p-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" /> Project Link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={project.link || ""}
                                    onChange={(e) => onUpdate({ ...project, link: e.target.value })}
                                    placeholder="https://..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none"
                                />
                                {project.link && (
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
