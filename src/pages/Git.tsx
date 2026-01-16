import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, FolderGit2, Plus, RefreshCw, Upload, Download, Clock, AlertCircle, CheckCircle2, FolderOpen, X } from "lucide-react";
import { useLocalData } from "../lib/useLocalData";
import type { GitRepository, GitStatus } from "../lib/git-types";
import { cn } from "../lib/utils";

export function GitPage() {
    const { data, updateGitRepositories } = useLocalData();
    const [selectedRepo, setSelectedRepo] = useState<GitRepository | null>(null);
    const [repoStatuses, setRepoStatuses] = useState<Map<string, GitStatus>>(new Map());
    const [showAddModal, setShowAddModal] = useState(false);
    const [newRepoPath, setNewRepoPath] = useState("");
    const [loading, setLoading] = useState(false);

    const repositories = data?.gitRepositories || [];

    // Load status for all repositories
    useEffect(() => {
        loadAllStatuses();
    }, [repositories]);

    async function loadAllStatuses() {
        const statusMap = new Map<string, GitStatus>();
        for (const repo of repositories) {
            try {
                const status = await window.rockGit.getStatus(repo.path);
                statusMap.set(repo.id, status);
            } catch (error) {
                console.error(`Failed to load status for ${repo.name}:`, error);
            }
        }
        setRepoStatuses(statusMap);
    }

    async function handleAddLocalRepo(path: string) {
        try {
            setLoading(true);
            const isValid = await window.rockGit.verifyRepo(path);
            if (!isValid) {
                alert("Not a valid Git repository");
                return;
            }

            const remoteUrl = await window.rockGit.getRemoteUrl(path);
            const folderName = path.split(/[\\/]/).pop() || "Unknown";

            const newRepo: GitRepository = {
                id: crypto.randomUUID(),
                name: folderName,
                path,
                remoteUrl: remoteUrl || undefined,
                lastFetched: new Date().toISOString()
            };

            await updateGitRepositories([...repositories, newRepo]);
            setNewRepoPath("");
            setShowAddModal(false);
        } catch (error: any) {
            alert(`Error adding repository: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveRepo(id: string) {
        if (window.confirm("Are you sure you want to remove this repository?")) {
            await updateGitRepositories(repositories.filter(r => r.id !== id));
        }
    }

    if (selectedRepo) {
        return (
            <RepositoryDetailView
                repo={selectedRepo}
                onBack={() => setSelectedRepo(null)}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12 h-full"
        >
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">Git Repositories</h1>
                    <p className="text-muted">Manage your Git repositories in one place</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Repository</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo) => {
                    const status = repoStatuses.get(repo.id);
                    return (
                        <motion.div
                            key={repo.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-surface/40 transition-colors cursor-pointer group relative"
                            onClick={() => setSelectedRepo(repo)}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveRepo(repo.id);
                                }}
                                className="absolute top-4 right-4 p-2 text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all z-10"
                                title="Remove Repository"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <FolderGit2 className="w-6 h-6 text-primary" />
                                </div>
                                {status && status.hasUncommitted && (
                                    <div className="flex items-center gap-1 text-xs text-amber-400 pr-8">
                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        {status.files.length}
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-1">{repo.name}</h3>
                            <p className="text-xs text-muted mb-3 truncate">{repo.path}</p>

                            {status && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-muted">
                                        <GitBranch className="w-3 h-3" />
                                        <span>{status.branch}</span>
                                    </div>
                                    {status.ahead > 0 && (
                                        <div className="text-xs text-emerald-400">↑{status.ahead}</div>
                                    )}
                                    {status.behind > 0 && (
                                        <div className="text-xs text-rose-400">↓{status.behind}</div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {repositories.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted border border-dashed border-white/10 rounded-2xl">
                        <FolderGit2 className="w-12 h-12 mb-4 opacity-50" />
                        <p>No repositories added</p>
                        <p className="text-sm mt-1">Click "Add Repository" to get started</p>
                    </div>
                )}
            </div>

            {/* Add Repository Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">Add Git Repository</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted uppercase font-medium">Repository Path</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            value={newRepoPath}
                                            onChange={(e) => setNewRepoPath(e.target.value)}
                                            type="text"
                                            placeholder="C:\Projects\my-repo or /Users/name/projects/my-repo"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        />
                                        <button
                                            onClick={async () => {
                                                const path = await window.rockGit.selectDirectory();
                                                if (path) setNewRepoPath(path);
                                            }}
                                            className="p-2 bg-white/5 border border-white/10 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                                            title="Browse Folder"
                                        >
                                            <FolderOpen className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted/60 mt-1">Enter the full path to an existing Git repository</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg text-muted hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (newRepoPath.trim()) {
                                                handleAddLocalRepo(newRepoPath.trim());
                                            }
                                        }}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? "Adding..." : "Add Repository"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Repository Detail View Component
function RepositoryDetailView({ repo, onBack }: { repo: GitRepository; onBack: () => void }) {
    const [status, setStatus] = useState<GitStatus | null>(null);
    const [commits, setCommits] = useState<any[]>([]);
    const [commitMessage, setCommitMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadRepoData();
    }, [repo]);

    async function loadRepoData() {
        try {
            const [statusData, commitsData] = await Promise.all([
                window.rockGit.getStatus(repo.path),
                window.rockGit.getLog(repo.path, 10)
            ]);
            setStatus(statusData);
            setCommits(commitsData);
        } catch (error: any) {
            console.error("Failed to load repo data:", error);
        }
    }

    async function handleCommit() {
        if (!commitMessage.trim() || selectedFiles.size === 0) return;

        try {
            setLoading(true);
            const filesToCommit = Array.from(selectedFiles);
            await window.rockGit.commit(repo.path, commitMessage, filesToCommit);
            setCommitMessage("");
            setSelectedFiles(new Set());
            await loadRepoData();
        } catch (error: any) {
            alert(`Commit failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function handlePush() {
        try {
            setLoading(true);
            await window.rockGit.push(repo.path);
            await loadRepoData();
        } catch (error: any) {
            alert(`Push failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function handlePull() {
        try {
            setLoading(true);
            await window.rockGit.pull(repo.path);
            await loadRepoData();
        } catch (error: any) {
            alert(`Pull failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    function toggleFileSelection(filePath: string) {
        const newSelection = new Set(selectedFiles);
        if (newSelection.has(filePath)) {
            newSelection.delete(filePath);
        } else {
            newSelection.add(filePath);
        }
        setSelectedFiles(newSelection);
    }

    function selectAll() {
        if (!status) return;
        setSelectedFiles(new Set(status.files.map(f => f.path)));
    }

    function deselectAll() {
        setSelectedFiles(new Set());
    }

    const statusColors: any = {
        modified: "text-amber-400",
        added: "text-emerald-400",
        deleted: "text-rose-400",
        untracked: "text-blue-400",
        renamed: "text-purple-400"
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col p-6 max-w-[1600px] mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-primary hover:text-primary/80 flex items-center gap-2"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{repo.name}</h1>
                        <p className="text-sm text-muted">{repo.path}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {status && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <GitBranch className="w-4 h-4" />
                            <span>{status.branch}</span>
                        </div>
                    )}
                    <button
                        onClick={handlePull}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Pull
                    </button>
                    <button
                        onClick={handlePush}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        Push
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                {/* Left: Changed Files & Commit */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    {/* Changed Files */}
                    <div className="bg-surface/30 border border-white/5 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white">Changed Files ({status?.files.length || 0})</h3>
                            <div className="flex gap-2">
                                <button onClick={selectAll} className="text-xs text-primary hover:text-primary/80">
                                    Select All
                                </button>
                                <button onClick={deselectAll} className="text-xs text-muted hover:text-white">
                                    Clear
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1">
                            {status?.files.map((file) => (
                                <div
                                    key={file.path}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group"
                                    onClick={() => toggleFileSelection(file.path)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.has(file.path)}
                                        onChange={() => toggleFileSelection(file.path)}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5"
                                    />
                                    <span className={cn("text-xs font-mono", statusColors[file.status])}>
                                        {file.status[0].toUpperCase()}
                                    </span>
                                    <span className="text-sm text-white flex-1 truncate">{file.path}</span>
                                </div>
                            ))}
                            {(!status || status.files.length === 0) && (
                                <div className="text-center text-muted py-8">
                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No changes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Commit Panel */}
                    <div className="bg-surface/30 border border-white/5 rounded-2xl p-4">
                        <h3 className="font-semibold text-white mb-3">Commit Changes</h3>
                        <textarea
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            placeholder="Commit message..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mb-3 resize-none focus:outline-none focus:border-primary"
                            rows={3}
                        />
                        <button
                            onClick={handleCommit}
                            disabled={loading || !commitMessage.trim() || selectedFiles.size === 0}
                            className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Committing..." : `Commit ${selectedFiles.size} file${selectedFiles.size !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>

                {/* Right: Commit History */}
                <div className="bg-surface/30 border border-white/5 rounded-2xl p-4 flex flex-col overflow-hidden">
                    <h3 className="font-semibold text-white mb-3">Recent Commits</h3>
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {commits.map((commit) => (
                            <div key={commit.sha} className="border-l-2 border-primary/30 pl-3 pb-3">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex-1">
                                        <p className="text-sm text-white font-medium line-clamp-2">{commit.message}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted">{commit.author}</span>
                                            <span className="text-xs text-muted/60">•</span>
                                            <span className="text-xs text-muted/60">
                                                {new Date(commit.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <code className="text-xs text-primary font-mono">{commit.shortSha}</code>
                                </div>
                            </div>
                        ))}
                        {commits.length === 0 && (
                            <div className="text-center text-muted py-8">
                                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No commits yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
