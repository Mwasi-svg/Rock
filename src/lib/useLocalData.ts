import { useState, useEffect, useCallback } from "react";
import type { AppData } from "../type/rock-data";

export function useLocalData() {
    const [data, setData] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load data on mount
    useEffect(() => {
        async function load() {
            try {
                if (window.rockData) {
                    const loaded = await window.rockData.getData();
                    setData(loaded as AppData);
                } else {
                    // Fallback for dev without Electron
                    const stored = localStorage.getItem("rock-data");
                    setData(stored ? JSON.parse(stored) : {});
                }
            } catch (e) {
                setError(String(e));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Save function
    const saveData = useCallback(async (newData: AppData) => {
        try {
            if (window.rockData) {
                await window.rockData.saveData(newData);
            } else {
                localStorage.setItem("rock-data", JSON.stringify(newData));
            }
            setData(newData);
            return true;
        } catch (e) {
            setError(String(e));
            return false;
        }
    }, []);

    // Partial update helpers
    const updateEvents = useCallback(
        async (events: AppData["events"]) => {
            return saveData({ ...data, events });
        },
        [data, saveData]
    );

    const updateTasks = useCallback(
        async (tasks: AppData["tasks"]) => {
            return saveData({ ...data, tasks });
        },
        [data, saveData]
    );

    const updateSpending = useCallback(
        async (spending: AppData["spending"]) => {
            return saveData({ ...data, spending });
        },
        [data, saveData]
    );

    const updateProjects = useCallback(
        async (projects: AppData["projects"]) => {
            return saveData({ ...data, projects });
        },
        [data, saveData]
    );

    const updateMilestones = useCallback(
        async (milestones: AppData["milestones"]) => {
            return saveData({ ...data, milestones });
        },
        [data, saveData]
    );

    const updateTeamMembers = useCallback(
        async (teamMembers: AppData["teamMembers"]) => {
            return saveData({ ...data, teamMembers });
        },
        [data, saveData]
    );

    const updateGitRepositories = useCallback(
        async (gitRepositories: AppData["gitRepositories"]) => {
            return saveData({ ...data, gitRepositories });
        },
        [data, saveData]
    );

    const updateGitSettings = useCallback(
        async (gitSettings: AppData["gitSettings"]) => {
            return saveData({ ...data, gitSettings });
        },
        [data, saveData]
    );

    return {
        data,
        loading,
        error,
        saveData,
        updateEvents,
        updateTasks,
        updateSpending,
        updateProjects,
        updateMilestones,
        updateTeamMembers,
        updateGitRepositories,
        updateGitSettings,
    };
}
