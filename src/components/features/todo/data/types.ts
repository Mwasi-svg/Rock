export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
}

export const MOCK_TASKS: Task[] = [
    {
        id: "t1",
        title: "Design system documentation",
        description: "Write docs for color palette and component usage.",
        status: "todo",
        priority: "medium",
        createdAt: new Date().toISOString(),
    },
    {
        id: "t2",
        title: "Fix calendar navigation bug",
        status: "in-progress",
        priority: "high",
        createdAt: new Date().toISOString(),
    },
    {
        id: "t3",
        title: "Review PR #42",
        description: "Code review for the new API endpoints.",
        status: "todo",
        priority: "low",
        createdAt: new Date().toISOString(),
    },
    {
        id: "t4",
        title: "Setup CI/CD pipeline",
        status: "done",
        priority: "high",
        createdAt: new Date().toISOString(),
    },
    {
        id: "t5",
        title: "User feedback integration",
        description: "Implement changes based on beta tester feedback.",
        status: "in-progress",
        priority: "medium",
        createdAt: new Date().toISOString(),
    },
];
