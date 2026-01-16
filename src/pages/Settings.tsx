import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Upload, Download, Trash2, AlertTriangle, HardDrive, Github, Share2, Mail, MessageSquare, Monitor, Shield, Zap, Layout, ChevronRight } from "lucide-react";
import { useLocalData } from "../lib/useLocalData";
import { cn } from "../lib/utils";
import { useSounds } from "../lib/useSounds";

type SettingsTab = 'general' | 'integrations' | 'data' | 'system';

export function SettingsPage() {
    const { data, saveData } = useLocalData();
    const { play: playSound } = useSounds();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [confirmReset, setConfirmReset] = useState(false);

    // Mock States
    const [integrations, setIntegrations] = useState({
        github: true,
        google: false,
        discord: false
    });

    // Theme Configuration - Full Application Themes
    const themes = [
        { id: 'default', label: 'Obsidian', description: 'Classic Rock theme with subtle highlights' },
        { id: 'midnight', label: 'Midnight', description: 'GitHub-inspired dark blue' },
        { id: 'ocean', label: 'Ocean', description: 'Deep navy with teal accents' },
        { id: 'mocha', label: 'Mocha', description: 'Catppuccin-style warm purples' },
    ] as const;

    const [generalSettings, setGeneralSettings] = useState(() => {
        // Load settings from localStorage on init
        try {
            const stored = localStorage.getItem('rock-settings');
            if (stored) {
                return { notifications: true, autoSave: true, soundEffects: false, theme: 'default', ...JSON.parse(stored) };
            }
        } catch { /* ignore */ }
        return {
            notifications: true,
            autoSave: true,
            soundEffects: false,
            theme: 'default'
        };
    });

    // Persist settings to localStorage
    useEffect(() => {
        localStorage.setItem('rock-settings', JSON.stringify(generalSettings));
    }, [generalSettings]);

    // Apply Theme Effect - Sets data-theme attribute on HTML element
    useEffect(() => {
        const themeId = generalSettings.theme;
        if (themeId === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', themeId);
        }
    }, [generalSettings.theme]);

    const toggleIntegration = (key: keyof typeof integrations) => {
        playSound('toggle');
        setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleGeneral = (key: keyof typeof generalSettings) => {
        playSound('toggle');
        setGeneralSettings((prev: typeof generalSettings) => ({ ...prev, [key]: !prev[key as keyof typeof generalSettings] }));
    };

    const setTheme = (themeId: string) => {
        playSound('click');
        setGeneralSettings((prev: typeof generalSettings) => ({ ...prev, theme: themeId }));
    };

    // ... existing imports/exports ...

    // ... inside render > General Tab ...
    const handleExport = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rock-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (!json.projects && !json.spending && !json.tasks) throw new Error("Invalid data format");

                if (window.confirm("This will overwrite your current data. Are you sure?")) {
                    await saveData(json);
                    window.location.reload();
                }
            } catch (err) {
                alert("Failed to parse file. Is it a valid backup?");
            }
        };
        reader.readAsText(file);
    };

    const handleReset = async () => {
        if (confirmReset) {
            localStorage.clear();
            window.location.reload();
        } else {
            setConfirmReset(true);
        }
    };

    // UI Components
    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <button
            onClick={onChange}
            className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none",
                checked ? "bg-primary" : "bg-white/10"
            )}
        >
            <motion.div
                initial={false}
                animate={{ x: checked ? 26 : 2 }}
                className="w-5 h-5 bg-white rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </button>
    );

    const GoogleIcon = ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.027-3.24 2.053-2.053 2.627-5.053 2.627-7.387 0-.747-.053-1.44-.147-2.133h-10.5z" />
        </svg>
    );

    const DiscordIcon = ({ className }: { className?: string }) => (
        <svg viewBox="0 0 127.14 96.36" className={className} aria-hidden="true" fill="currentColor">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c1.24-23.28-3.28-47.25-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
        </svg>
    );

    const tabs = [
        { id: 'general', label: 'General', icon: Layout },
        { id: 'integrations', label: 'Integrations', icon: Share2 },
        { id: 'data', label: 'Data & Storage', icon: HardDrive },
        { id: 'system', label: 'System', icon: Monitor },
    ] as const;

    return (
        <div className="h-full w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">

            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-transparent flex flex-col">
                <div className="mb-6 px-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage your workspace.</p>
                </div>

                <nav className="space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-white/5 border border-white/5 shadow-lg shadow-black/20"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-zinc-500 group-hover:text-white")} />
                                    <span>{tab.label}</span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeSettingTab"
                                        className="absolute inset-0 bg-white/5"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <ChevronRight className={cn("w-4 h-4 transition-all opacity-0 -translate-x-2", isActive && "opacity-100 translate-x-0 text-zinc-500")} />
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl min-h-[600px]"
                    >
                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="border-b border-white/5 pb-6">
                                    <h2 className="text-2xl font-semibold text-white mb-2">General Settings</h2>
                                    <p className="text-zinc-400 text-sm">Customize your workspace experience.</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Theme Selector */}
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="mb-4">
                                            <div className="font-medium text-white mb-1">Application Theme</div>
                                            <div className="text-sm text-zinc-500">Change the look and feel of the entire application.</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {themes.map(theme => {
                                                const isSelected = generalSettings.theme === theme.id;
                                                // Preview colors for each theme
                                                const previewColors: Record<string, { bg: string; surface: string; accent: string }> = {
                                                    default: { bg: '#050505', surface: '#0A0A0A', accent: '#1a1a1a' },
                                                    midnight: { bg: '#0D1117', surface: '#161B22', accent: '#21262D' },
                                                    ocean: { bg: '#0A192F', surface: '#112240', accent: '#1D3A5F' },
                                                    mocha: { bg: '#1E1E2E', surface: '#313244', accent: '#45475A' },
                                                };
                                                const colors = previewColors[theme.id] || previewColors.default;

                                                return (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => setTheme(theme.id)}
                                                        className={cn(
                                                            "relative p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left group",
                                                            isSelected
                                                                ? "border-primary bg-primary/5"
                                                                : "border-white/10 hover:border-white/20 bg-transparent"
                                                        )}
                                                    >
                                                        {/* Theme Preview Swatch */}
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                                            <div className="h-full w-full flex flex-col">
                                                                <div className="flex-1" style={{ backgroundColor: colors.bg }} />
                                                                <div className="h-3" style={{ backgroundColor: colors.surface }} />
                                                                <div className="h-2" style={{ backgroundColor: colors.accent }} />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className={cn("font-medium text-sm", isSelected ? "text-white" : "text-zinc-300")}>
                                                                {theme.label}
                                                            </div>
                                                            <div className="text-xs text-zinc-500 truncate">
                                                                {theme.description}
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-white rounded-full" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div>
                                            <div className="font-medium text-white mb-1">Push Notifications</div>
                                            <div className="text-sm text-zinc-500">Receive alerts for tasks and project updates.</div>
                                        </div>
                                        <Toggle checked={generalSettings.notifications} onChange={() => toggleGeneral('notifications')} />
                                    </div>

                                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div>
                                            <div className="font-medium text-white mb-1">Auto-Save</div>
                                            <div className="text-sm text-zinc-500">Automatically save changes as you work.</div>
                                        </div>
                                        <Toggle checked={generalSettings.autoSave} onChange={() => toggleGeneral('autoSave')} />
                                    </div>

                                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div>
                                            <div className="font-medium text-white mb-1">Sound Effects</div>
                                            <div className="text-sm text-zinc-500">Play subtle sounds for interactions.</div>
                                        </div>
                                        <Toggle checked={generalSettings.soundEffects} onChange={() => toggleGeneral('soundEffects')} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* INTEGRATIONS TAB */}
                        {activeTab === 'integrations' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="border-b border-white/5 pb-6">
                                    <h2 className="text-2xl font-semibold text-white mb-2">Integrations</h2>
                                    <p className="text-zinc-400 text-sm">Supercharge your workflow by connecting external tools.</p>
                                </div>

                                <div className="grid gap-4">
                                    {[
                                        { id: 'github', label: 'GitHub', desc: 'Sync repositories, issues, and deployments.', icon: Github, color: 'text-white', bg: 'bg-zinc-800' },
                                        { id: 'google', label: 'Google Workspace', desc: 'Sync calendar events and Drive files.', icon: GoogleIcon, color: 'text-white', bg: 'bg-red-500/10' },
                                        { id: 'discord', label: 'Discord', desc: 'Receive real-time notifications in your server.', icon: DiscordIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                                    ].map((app) => (
                                        <div key={app.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all group">
                                            <div className="flex items-center gap-5">
                                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 transition-transform group-hover:scale-105", app.bg)}>
                                                    <app.icon className={cn("w-6 h-6", app.color)} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white text-lg">{app.label}</div>
                                                    <div className="text-sm text-zinc-500">{app.desc}</div>
                                                </div>
                                            </div>
                                            <Toggle
                                                checked={integrations[app.id as keyof typeof integrations]}
                                                onChange={() => toggleIntegration(app.id as keyof typeof integrations)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DATA TAB */}
                        {activeTab === 'data' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="border-b border-white/5 pb-6">
                                    <h2 className="text-2xl font-semibold text-white mb-2">Data & Storage</h2>
                                    <p className="text-zinc-400 text-sm">Control your data portability and local storage.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        onClick={handleExport}
                                        className="flex flex-col items-start p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Download className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <h4 className="text-lg font-medium text-white mb-2">Export Backup</h4>
                                        <p className="text-sm text-zinc-500 leading-relaxed">
                                            Download a complete JSON snapshot of your entire workspace, including all projects and tasks.
                                        </p>
                                    </button>

                                    <div className="relative group">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-full flex flex-col items-start p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <h4 className="text-lg font-medium text-white mb-2">Restore Data</h4>
                                            <p className="text-sm text-zinc-500 leading-relaxed">
                                                Restore your workspace from a previously saved backup file. This will replace current data.
                                            </p>
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                                    </div>
                                </div>

                                <div className="mt-8 p-6 rounded-3xl bg-red-500/5 border border-red-500/10">
                                    <div className="flex items-start gap-5">
                                        <div className="p-3 bg-red-500/10 rounded-xl">
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium text-white mb-2">Danger Zone</h4>
                                            <p className="text-sm text-zinc-500 mb-6 max-w-xl">
                                                This action is irreversible. Proceed with caution. Permanently delete all local data and reset the application to its initial state.
                                            </p>

                                            {confirmReset ? (
                                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2">
                                                    <button onClick={handleReset} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-red-500/20">
                                                        Yes, Delete Everything
                                                    </button>
                                                    <button onClick={() => setConfirmReset(false)} className="px-5 py-2.5 bg-transparent hover:bg-white/5 text-zinc-400 font-medium rounded-xl transition-colors">
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setConfirmReset(true)} className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-xl transition-colors border border-red-500/20">
                                                    Reset All Data
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SYSTEM TAB */}
                        {activeTab === 'system' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="border-b border-white/5 pb-6">
                                    <h2 className="text-2xl font-semibold text-white mb-2">System</h2>
                                    <p className="text-zinc-400 text-sm">System preferences and application info.</p>
                                </div>

                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <h4 className="font-medium text-white mb-6 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        Keyboard Shortcuts
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 last:pb-0">
                                            <span className="text-zinc-400">Open Command Palette</span>
                                            <div className="flex gap-1.5">
                                                <kbd className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 shadow-sm">Ctrl</kbd>
                                                <kbd className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 shadow-sm">K</kbd>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 last:pb-0">
                                            <span className="text-zinc-400">Quick Save</span>
                                            <div className="flex gap-1.5">
                                                <kbd className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 shadow-sm">Ctrl</kbd>
                                                <kbd className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 shadow-sm">S</kbd>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 last:pb-0">
                                            <span className="text-zinc-400">Close Modals / Back</span>
                                            <kbd className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 shadow-sm">Esc</kbd>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                                        <Shield className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white mb-2">About Rock</h4>
                                        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                                            Rock is a secure, local-first productivity suite built for speed and privacy.
                                            Version 1.2.0 (Pro)
                                        </p>
                                        <span className="text-xs text-zinc-600">Built with React, Electron, and Tailwind CSS.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
