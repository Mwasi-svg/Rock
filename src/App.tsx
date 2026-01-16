import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AppLayout } from "./components/layout/AppLayout";
import { Sidebar, TabId } from "./components/layout/Sidebar";
import { CalendarPage } from "./pages/Calendar";
import { DashboardPage } from "./pages/Dashboard";
import { TodoPage } from "./pages/Todo";
import { FinancePage } from "./pages/Finance";
import { ProjectsPage } from "./pages/Projects";
import { GitPage } from "./pages/Git";
import { SettingsPage } from "./pages/Settings";
import { NotificationProvider } from "./lib/NotificationContext";
import { ActionProvider } from "./lib/ActionContext";

function App() {
  // Determine initial tab: Check localStorage first, known hash, then default to 'home'
  const savedTab = localStorage.getItem("rock-active-tab") as TabId | null;
  const activeTabMatch = window.location.hash.replace("#", "") as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(savedTab || activeTabMatch || "home");

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("rock-active-tab", activeTab);
    }
  }, [activeTab]);

  // Apply saved theme on app startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rock-settings');
      if (stored) {
        const settings = JSON.parse(stored);
        const themeId = settings.theme;
        if (themeId && themeId !== 'default') {
          document.documentElement.setAttribute('data-theme', themeId);
        }
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <NotificationProvider>
      <ActionProvider>
        <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
          <AnimatePresence mode="wait">
            {activeTab === "home" && <DashboardPage key="home" />}
            {activeTab === "projects" && <ProjectsPage key="projects" />}
            {activeTab === "calendar" && <CalendarPage key="calendar" />}
            {activeTab === "todo" && <TodoPage key="todo" />}
            {activeTab === "finance" && <FinancePage key="finance" />}
            {activeTab === "git" && <GitPage key="git" />}
            {activeTab === "settings" && <SettingsPage key="settings" />}
          </AnimatePresence>
        </AppLayout>
      </ActionProvider>
    </NotificationProvider>
  );
}

export default App;