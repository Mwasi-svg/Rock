import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { generateCalendarGrid, MONTH_NAMES } from "./data/utils";
import type { CalendarEventData } from "../../../type/rock-data";

interface CalendarGridProps {
    events: CalendarEventData[];
    onAddEvent: (event: CalendarEventData) => void;
    onDeleteEvent: (id: string) => void;
}

export function CalendarGrid({ events, onAddEvent, onDeleteEvent }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState<{
        title: string;
        startTime: string;
        endTime: string;
        category: "work" | "personal" | "urgent";
        description: string;
    }>({
        title: "",
        startTime: "09:00",
        endTime: "10:00",
        category: "work",
        description: "",
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = generateCalendarGrid(year, month);
    const todayDate = new Date().getDate();
    const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const getEventsForDay = (day: number) => {
        if (!day) return [];
        const dateStr = new Date(year, month, day).toISOString().split("T")[0];
        return events.filter((e) => e.date === dateStr);
    };

    const getCategoryColor = (cat: CalendarEventData["category"]) => {
        switch (cat) {
            case "work": return "bg-primary/20 text-blue-300 border-primary/30";
            case "urgent": return "bg-red-500/20 text-red-300 border-red-500/30";
            case "personal": return "bg-secondary/20 text-purple-300 border-secondary/30";
            default: return "bg-surface";
        }
    };

    const handleDayClick = (day: number) => {
        if (!day) return;
        const dateStr = new Date(year, month, day).toISOString().split("T")[0];
        setSelectedDate(dateStr);
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !newEvent.title.trim()) return;

        onAddEvent({
            id: crypto.randomUUID(),
            title: newEvent.title,
            date: selectedDate,
            startTime: newEvent.startTime,
            endTime: newEvent.endTime,
            category: newEvent.category,
            description: newEvent.description || undefined,
        });

        setShowModal(false);
        setNewEvent({ title: "", startTime: "09:00", endTime: "10:00", category: "work", description: "" });
    };

    return (
        <>
            <div className="flex flex-col h-full bg-surface/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-white">
                        {MONTH_NAMES[month]} <span className="text-white/40 font-light">{year}</span>
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-4 px-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-muted uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-2 flex-1">
                    {days.map((day, i) => {
                        const dayEvents = day ? getEventsForDay(day) : [];
                        const isToday = isCurrentMonth && day === todayDate;

                        return (
                            <div
                                key={i}
                                onClick={() => handleDayClick(day as number)}
                                className={cn(
                                    "relative p-2 rounded-xl border transition-all duration-200 cursor-pointer min-h-[80px]",
                                    day ? "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]" : "bg-transparent border-transparent cursor-default"
                                )}
                            >
                                {day && (
                                    <>
                                        <div className={cn(
                                            "absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium",
                                            isToday ? "bg-primary text-white shadow-lg shadow-primary/40" : "text-white/60"
                                        )}>
                                            {day}
                                        </div>

                                        <div className="mt-6 flex flex-col gap-1 overflow-hidden">
                                            {dayEvents.slice(0, 2).map((event) => (
                                                <div
                                                    key={event.id}
                                                    className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 truncate group/event",
                                                        getCategoryColor(event.category)
                                                    )}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="truncate flex-1">{event.title}</span>
                                                    <button
                                                        onClick={() => onDeleteEvent(event.id)}
                                                        className="opacity-0 group-hover/event:opacity-100 hover:text-red-400 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {dayEvents.length > 2 && (
                                                <span className="text-[10px] text-muted">+{dayEvents.length - 2} more</span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Event Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-white">New Event</h3>
                                <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-muted/50 focus:outline-none focus:border-primary"
                                        placeholder="Event title..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-muted mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={newEvent.startTime}
                                            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={newEvent.endTime}
                                            onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-muted mb-1">Category</label>
                                    <select
                                        value={newEvent.category}
                                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as "work" | "personal" | "urgent" })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                    >
                                        <option value="work">Work</option>
                                        <option value="personal">Personal</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-muted mb-1">Description (optional)</label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-muted/50 focus:outline-none focus:border-primary resize-none"
                                        rows={3}
                                        placeholder="Add a description..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                                >
                                    Add Event
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
