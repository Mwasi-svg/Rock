export type EventCategory = "work" | "personal" | "urgent";

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // ISO Date string YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    category: EventCategory;
    description?: string;
}

export const MOCK_EVENTS: CalendarEvent[] = [
    {
        id: "1",
        title: "Project Review",
        date: new Date().toISOString().split("T")[0], // Today
        startTime: "10:00",
        endTime: "11:30",
        category: "work",
        description: "Review Q1 goals and milestones.",
    },
    {
        id: "2",
        title: "Lunch with Sarah",
        date: new Date().toISOString().split("T")[0], // Today
        startTime: "12:30",
        endTime: "13:30",
        category: "personal",
    },
    {
        id: "3",
        title: "Client Call",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
        startTime: "14:00",
        endTime: "15:00",
        category: "work",
    },
    {
        id: "4",
        title: "Deadline: UI KIt",
        date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], // Day after tomorrow
        startTime: "09:00",
        endTime: "18:00",
        category: "urgent",
    },
];
