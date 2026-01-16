import { ReactNode } from "react";
import { Sidebar, TabId } from "./Sidebar";
import { CommandPalette } from "../features/command/CommandPalette";
import { useActions } from "../../lib/ActionContext";

interface AppLayoutProps {
    children: ReactNode;
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function AppLayout({ children, activeTab, onTabChange }: AppLayoutProps) {

    return (
        <div className="flex h-screen w-screen overflow-hidden font-sans text-white selection:bg-zinc-700 selection:text-white">
            {/* Ambient Backgrounds from test.html */}
            <div className="noise-bg" />
            <div className="ambient-glow" />

            {/* Sidebar */}
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto relative z-10 scroll-smooth">
                <div className="min-h-full w-full">
                    {children}
                </div>
            </main>
            {/* Global Command Palette */}
            <CommandPalette />
        </div>
    );
}

