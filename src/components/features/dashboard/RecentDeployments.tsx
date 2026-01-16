import { GitCommit, Loader2, Check, ExternalLink, Settings, X, Github } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchWorkflowRuns, type GitHubConfig, type GitHubRun } from "../../../lib/github";
import { formatTimeAgo, cn } from "../../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface RecentDeploymentsProps {
    config?: GitHubConfig | null;
    onSaveConfig?: (config: GitHubConfig) => void;
    onClearConfig?: () => void;
}

export function RecentDeployments({
    config: propConfig,
    onSaveConfig,
    onClearConfig
}: RecentDeploymentsProps) {
    const [runs, setRuns] = useState<GitHubRun[]>([]);
    const [loading, setLoading] = useState(false);
    const [configOpen, setConfigOpen] = useState(false);

    // Internal state for uncontrolled mode (Dashboard)
    const [localConfig, setLocalConfig] = useState<GitHubConfig | null>(null);

    // Determine which config to use
    // If props are provided (even if null/undefined), we assume controlled mode if handlers are present.
    // However, propConfig can be undefined if project has no config yet.
    // Simplest logic: If handlers are provided, use propConfig. Else use localConfig.
    const isControlled = !!onSaveConfig;
    const activeConfig = isControlled ? propConfig : localConfig;

    const [error, setError] = useState<string | null>(null);

    // Initial load from local storage for UNCONTROLLED mode
    useEffect(() => {
        if (!isControlled) {
            const stored = localStorage.getItem("rock_github_config");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setLocalConfig(parsed);
                } catch (e) {
                    console.error("Failed to parse config", e);
                }
            }
        }
    }, [isControlled]);

    // Fetch data when activeConfig changes
    useEffect(() => {
        if (!activeConfig) {
            setRuns([]);
            return;
        }

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchWorkflowRuns(activeConfig);
                setRuns(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch");
            } finally {
                setLoading(false);
            }
        };

        load();
        const interval = setInterval(load, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [activeConfig]);

    const handleSave = (newConfig: GitHubConfig) => {
        if (isControlled && onSaveConfig) {
            onSaveConfig(newConfig);
        } else {
            localStorage.setItem("rock_github_config", JSON.stringify(newConfig));
            setLocalConfig(newConfig);
        }
        setConfigOpen(false);
    };

    const handleClear = () => {
        if (isControlled && onClearConfig) {
            onClearConfig();
        } else {
            localStorage.removeItem("rock_github_config");
            setLocalConfig(null);
            setRuns([]);
        }
    };

    return (
        <div className="glass-card p-0 relative overflow-hidden group interactive-card animate-enter delay-3 flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-zinc-500" />
                    Recent Deployments
                </h3>
                <div className="flex items-center gap-3">
                    {loading && <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />}
                    <button
                        onClick={() => setConfigOpen(true)}
                        className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Settings className="w-3 h-3" />
                        {activeConfig ? 'Config' : 'Setup'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto relative min-h-[200px]">
                {!activeConfig ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <Github className="w-12 h-12 text-zinc-700 mb-4" />
                        <p className="text-zinc-400 text-sm mb-2">Connect GitHub</p>
                        <p className="text-zinc-600 text-xs mb-4 max-w-[200px]">
                            Connect your repository to see live deployment status.
                        </p>
                        <button
                            onClick={() => setConfigOpen(true)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-4 py-2 rounded-lg transition-colors border border-white/5"
                        >
                            Connect
                        </button>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <p className="text-red-400 text-sm mb-2">Failed to load</p>
                        <p className="text-zinc-600 text-xs mb-4">{error}</p>
                        <button
                            onClick={() => setConfigOpen(true)}
                            className="text-zinc-400 hover:text-white text-xs underline mb-2"
                        >
                            Update Config
                        </button>
                    </div>
                ) : runs.length === 0 && !loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <Github className="w-8 h-8 text-zinc-800 mb-4 opacity-20" />
                        <p className="text-zinc-500 text-sm mb-1">No Activity Found</p>
                        <p className="text-zinc-600 text-xs mb-4 max-w-[200px]">
                            No GitHub Action runs were found for <b>{activeConfig.owner}/{activeConfig.repo}</b>.
                        </p>
                        <button
                            onMouseDown={() => setConfigOpen(true)} // Using mousedown as a quick hack or better just re-open config
                            className="text-xs text-zinc-400 hover:text-white underline"
                        >
                            Check Settings
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {runs.map((run) => (
                            <DeploymentRow
                                key={run.id}
                                run={run}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ConfigModal
                isOpen={configOpen}
                onClose={() => setConfigOpen(false)}
                onSave={handleSave}
                onClear={handleClear}
                currentConfig={activeConfig}
            />
        </div>
    );
}

function DeploymentRow({ run }: { run: GitHubRun }) {
    const isBuilding = run.status === "in_progress" || run.status === "queued";
    const isSuccess = run.conclusion === "success";
    const isFailure = run.conclusion === "failure";

    return (
        <a
            href={run.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 px-6 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer group/row"
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border",
                    isBuilding && "bg-blue-500/10 border-blue-500/20",
                    isSuccess && "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
                    isFailure && "bg-red-500/10 border-red-500/20",
                    !isBuilding && !isSuccess && !isFailure && "bg-zinc-500/10 border-zinc-500/20"
                )}>
                    {isBuilding ? (
                        <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    ) : isSuccess ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : isFailure ? (
                        <X className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    )}
                </div>
                <div>
                    <div className="text-sm text-zinc-200 group-hover/row:text-white font-medium transition-colors line-clamp-1 max-w-[180px]">
                        {run.display_title}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono bg-white/5 px-1 rounded text-[10px]">{run.head_sha.substring(0, 7)}</span>
                        <span>•</span>
                        <span className={isBuilding ? 'text-blue-400' : ''}>{formatTimeAgo(run.created_at)}</span>
                    </div>
                </div>
            </div>
            <div className="text-right hidden sm:block">
                <div className="text-xs text-zinc-400 max-w-[100px] truncate">{run.head_branch}</div>
                <div className="text-[10px] text-zinc-600 font-medium">GitHub Actions</div>
            </div>
        </a>
    );
}

function ConfigModal({ isOpen, onClose, onSave, onClear, currentConfig }: any) {
    const [token, setToken] = useState(currentConfig?.token || "");
    const [owner, setOwner] = useState(currentConfig?.owner || "");
    const [repo, setRepo] = useState(currentConfig?.repo || "");

    useEffect(() => {
        if (isOpen) {
            setToken(currentConfig?.token || "");
            setOwner(currentConfig?.owner || "");
            setRepo(currentConfig?.repo || "");
        }
    }, [isOpen, currentConfig]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#18181b] border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">GitHub Integration</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Repository Owner</label>
                        <input
                            value={owner}
                            onChange={e => setOwner(e.target.value)}
                            placeholder="e.g. vercel"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-700"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Repository Name</label>
                        <input
                            value={repo}
                            onChange={e => setRepo(e.target.value)}
                            placeholder="e.g. next.js"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-700"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Personal Access Token</label>
                        <input
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            type="password"
                            placeholder="github_pat_..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-700"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">Token needs `repo` scope for private repos.</p>
                    </div>

                    <div className="pt-2 flex gap-2">
                        {currentConfig && (
                            <button
                                onClick={onClear}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2 rounded-lg text-sm transition-colors"
                            >
                                Disconnect
                            </button>
                        )}
                        <button
                            onClick={() => onSave({ token, owner, repo })}
                            className="flex-1 bg-white text-black py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
