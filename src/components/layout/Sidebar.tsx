import { Calendar, CheckSquare, PieChart, SquareActivity, Home, FolderGit2, Settings, GitBranch } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useSounds } from "../../lib/useSounds";
export type TabId = "home" | "calendar" | "todo" | "finance" | "projects" | "git" | "settings";

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const { play: playSound } = useSounds();
    const tabs = [
        { id: "home", icon: Home, label: "Home" },
        { id: "projects", icon: FolderGit2, label: "Projects" },
        { id: "calendar", icon: Calendar, label: "Calendar" },
        { id: "todo", icon: CheckSquare, label: "To-Do" },
        { id: "finance", icon: PieChart, label: "Finance" },
        { id: "git", icon: GitBranch, label: "Git" },
    ] as const;

    const handleTabChange = (tab: TabId) => {
        playSound('swoosh');
        onTabChange(tab);
    };

    return (
        <aside className="w-20 md:w-64 border-r border-white/5 flex flex-col justify-between py-6 px-3 md:px-5 bg-black/20 backdrop-blur-xl z-40 transition-all duration-300">
            <div>
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group btn-action">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/10 shadow-lg shadow-black/50">
                        <SquareActivity className="text-white w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-100 tracking-tight opacity-0 md:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
                        Rock
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1 w-full">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as TabId)}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-xl border border-transparent transition-all w-full text-left group",
                                    isActive
                                        ? "bg-white/5 text-zinc-100 border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                        : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5 hover:border-white/5"
                                )}
                            >
                                <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center">
                                    <Icon className={cn(
                                        "w-[18px] h-[18px] transition-transform duration-500",
                                        isActive ? "text-white rotate-12" : "text-current group-hover:rotate-12"
                                    )} strokeWidth={1.5} />
                                </div>
                                <span className="hidden md:block font-medium text-sm">{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Footer Area: Settings + User */}
            <div className="px-1 hidden md:block space-y-2">

                {/* Dedicated Settings Button */}
                <button
                    onClick={() => handleTabChange('settings')}
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-xl border border-transparent transition-all w-full text-left group",
                        activeTab === 'settings'
                            ? "bg-white/5 text-zinc-100 border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                            : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5 hover:border-white/5"
                    )}
                >
                    <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center">
                        <Settings className={cn(
                            "w-[18px] h-[18px] transition-transform duration-500",
                            activeTab === 'settings' ? "text-white rotate-90" : "group-hover:rotate-90"
                        )} />
                    </div>
                    <div>
                        <div className="text-sm font-medium">Settings</div>
                    </div>
                </button>

                {/* Separator */}
                <div className="h-px bg-white/5 mx-2" />

                {/* User Profile Stub */}
                <div
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 btn-action"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-800 border border-white/10 relative overflow-hidden">
                        <div className="w-full h-full bg-zinc-600 animate-pulse" />
                    </div>
                    <div>
                        <div className="text-xs text-zinc-200 font-medium">User</div>
                        <div className="text-[10px] text-zinc-500">Pro Plan</div>
                    </div>
                </div>
            </div>

        </aside>
    );
}
