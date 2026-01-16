import { useState, useEffect } from "react";
import { useActions } from "../lib/ActionContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderGit2, AlertCircle, CheckCircle2, X, MoreVertical, Calendar, Link as LinkIcon, CheckSquare, Trash2, ExternalLink, Clock, Globe } from "lucide-react";

// ... (imports remain the same)

// ... inside the component loop ...

import { useLocalData } from "../lib/useLocalData";
import { cn } from "../lib/utils";
import type { ProjectData } from "../type/rock-data";
import { ProjectDetails } from "./ProjectDetails";

// Safelist: bg-red-500 bg-yellow-500 bg-orange-500 bg-emerald-500

const STATUSES = {
    "Implementation": { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", bar: "bg-red-500" },
    "Designing": { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", bar: "bg-yellow-500" },
    "Development": { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", bar: "bg-orange-500" },
    "Iteration": { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500" },
    "Deployment": { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500" },
} as const;

export function ProjectsPage() {
    const { data, updateProjects } = useLocalData();
    const { addProjectArgs } = useActions();
    const [showModal, setShowModal] = useState(false);

    // Listen for global "Add Project" command
    useEffect(() => {
        if (addProjectArgs > 0) {
            setShowModal(true);
        }
    }, [addProjectArgs]);

    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [newProject, setNewProject] = useState<{
        title: string;
        completion: string;
    }>({ title: "", completion: "0" });
    const [filter, setFilter] = useState<keyof typeof STATUSES | "All">("All");

    const [newTodo, setNewTodo] = useState("");

    const projects = data?.projects || [];
    const filteredProjects = filter === "All"
        ? projects
        : projects.filter(p => p.status === filter);

    const getStatusInfo = (completion: number): keyof typeof STATUSES => {
        if (completion < 30) return "Implementation";
        if (completion < 50) return "Designing";
        if (completion < 70) return "Development";
        if (completion < 90) return "Iteration";
        return "Deployment";
    };

    const handleAddProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProject.title.trim()) return;

        const completionVal = Math.min(100, Math.max(0, parseInt(newProject.completion) || 0));
        const status = getStatusInfo(completionVal);

        const project: ProjectData = {
            id: crypto.randomUUID(),
            title: newProject.title,
            status: status,
            completion: completionVal,
            color: STATUSES[status].color
        };

        updateProjects([...projects, project]);
        setShowModal(false);
        setNewProject({ title: "", completion: "0" });
    };

    const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null);

    const confirmDelete = () => {
        if (projectToDelete) {
            updateProjects(projects.filter(p => p.id !== projectToDelete.id));
            setProjectToDelete(null);
        }
    };

    const requestDelete = (project: ProjectData) => {
        setProjectToDelete(project);
    };

    const handleUpdateProgress = (project: ProjectData, newProgress: number) => {
        const newStatus = getStatusInfo(newProgress);
        const updated = projects.map(p =>
            p.id === project.id ? {
                ...p,
                completion: newProgress,
                status: newStatus,
                color: STATUSES[newStatus].color
            } : p
        );
        updateProjects(updated);
        // Also update selected project if it's open
        if (selectedProject && selectedProject.id === project.id) {
            setSelectedProject({
                ...selectedProject,
                completion: newProgress,
                status: newStatus,
                color: STATUSES[newStatus].color
            });
        }
    };

    const handleUpdateProject = (updatedProject: ProjectData) => {
        const updated = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
        updateProjects(updated);
        setSelectedProject(updatedProject);
    };

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || !newTodo.trim()) return;

        const todo = {
            id: crypto.randomUUID(),
            text: newTodo,
            completed: false
        };

        const updatedProject = {
            ...selectedProject,
            todos: [...(selectedProject.todos || []), todo]
        };
        handleUpdateProject(updatedProject);
        setNewTodo("");
    };

    const handleToggleTodo = (todoId: string) => {
        if (!selectedProject) return;
        const updatedTodos = selectedProject.todos?.map(t =>
            t.id === todoId ? { ...t, completed: !t.completed } : t
        ) || [];

        handleUpdateProject({ ...selectedProject, todos: updatedTodos });
    };

    const handleDeleteTodo = (todoId: string) => {
        if (!selectedProject) return;
        const updatedTodos = selectedProject.todos?.filter(t => t.id !== todoId) || [];
        handleUpdateProject({ ...selectedProject, todos: updatedTodos });
    };

    if (selectedProject) {
        return (
            <ProjectDetails
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
                onUpdate={handleUpdateProject}
            />
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12 h-full flex flex-col">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">Projects</h1>
                    <p className="text-muted">Manage development lifecycle and status.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Project</span>
                </button>
            </header>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8 animate-enter delay-1">
                <button
                    onClick={() => setFilter("All")}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-medium transition-all border",
                        filter === "All"
                            ? "bg-white/10 text-white border-white/20"
                            : "text-zinc-500 border-transparent hover:text-zinc-300"
                    )}
                >
                    All Projects
                </button>
                {(Object.keys(STATUSES) as Array<keyof typeof STATUSES>).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-medium transition-all border",
                            filter === status
                                ? cn(STATUSES[status].bg, STATUSES[status].color, STATUSES[status].border)
                                : "text-zinc-500 border-transparent hover:text-zinc-300"
                        )}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredProjects.map((project) => (
                        <motion.div
                            key={project.id}
                            layoutId={project.id}
                            onClick={() => setSelectedProject(project)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 group relative cursor-pointer hover:bg-surface/40 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-3 rounded-xl", STATUSES[project.status].bg)}>
                                    <FolderGit2 className={cn("w-6 h-6", STATUSES[project.status].color)} />
                                </div>
                                <div className="flex gap-2">
                                    {project.link && (
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                            title="Open Project Link"
                                        >
                                            <Globe className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            requestDelete(project);
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                            <div className="flex items-center gap-2 mb-6">
                                <span className={cn("text-xs px-2 py-0.5 rounded-full border", STATUSES[project.status].color, STATUSES[project.status].border, STATUSES[project.status].bg)}>
                                    {project.status}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Completion</span>
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
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateProgress(project, parseInt(e.target.value))}
                                    className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer h-1 bg-white/10 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {projects.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted border border-dashed border-white/10 rounded-2xl">
                        <FolderGit2 className="w-12 h-12 mb-4 opacity-50" />
                        <p>No active projects</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {projectToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setProjectToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
                        >
                            {/* Background glow for danger */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none -mr-10 -mt-10" />

                            <div className="flex flex-col items-center text-center mb-6 relative">
                                <div className="p-3 bg-red-500/10 rounded-full mb-4">
                                    <Trash2 className="w-6 h-6 text-red-500" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Delete Project?</h2>
                                <p className="text-muted text-sm">
                                    Are you sure you want to delete <span className="text-white font-medium">{projectToDelete.title}</span>? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setProjectToDelete(null)}
                                    className="flex-1 px-4 py-2 rounded-lg hover:bg-white/5 text-muted transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-500/20 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Project Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Create Project</h2>
                            <form onSubmit={handleAddProject} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">Project Name</label>
                                    <input
                                        type="text"
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                                        placeholder="e.g. Nexus Dashboard"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">Initial Completion (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newProject.completion}
                                        onChange={(e) => setNewProject({ ...newProject, completion: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg hover:bg-white/5 text-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}

