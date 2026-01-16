import { motion } from "framer-motion";
import { CalendarGrid } from "../components/features/calendar/CalendarGrid";
import { useLocalData } from "../lib/useLocalData";
import { useNotification } from "../lib/NotificationContext";
import type { CalendarEventData } from "../type/rock-data";

export function CalendarPage() {
    const { data, loading, updateEvents } = useLocalData();
    const { showNotification } = useNotification();

    const events = (data?.events || []) as CalendarEventData[];

    const handleAddEvent = async (event: CalendarEventData) => {
        await updateEvents([...events, event]);
        showNotification("Event Scheduled", {
            type: "success",
            message: `${event.title} on ${event.date}`
        });
    };

    const handleDeleteEvent = async (id: string) => {
        await updateEvents(events.filter((e) => e.id !== id));
        showNotification("Event Removed", { type: "info" });
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
            <header className="mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Calendar
                </h1>
                <p className="text-muted mt-2">Click on any day to add an event.</p>
            </header>

            <div className="flex-1 min-h-0">
                <CalendarGrid
                    events={events}
                    onAddEvent={handleAddEvent}
                    onDeleteEvent={handleDeleteEvent}
                />
            </div>
        </motion.div>
    );
}
