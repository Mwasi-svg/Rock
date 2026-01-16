import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { TaskCard } from "./TaskCard";
import type { TaskData, TeamMember } from "../../../type/rock-data";
import { Circle, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ColumnProps {
    id: string;
    title: string;
    tasks: TaskData[];
    color: string;
    onAddTask?: () => void;
    onDeleteTask?: (id: string) => void;
    onTaskClick?: (task: TaskData) => void;
    teamMembers?: TeamMember[];
}

export function KanbanColumn({ id, title, tasks, color, onAddTask, onDeleteTask, onTaskClick, teamMembers = [] }: ColumnProps) {
    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: "Column",
            id,
        },
        disabled: true, // We don't want draggable columns for now, just tasks
    });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full min-w-[320px] w-full max-w-sm bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl p-4"
        >
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", color)} />
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-muted font-mono">
                        {tasks.length}
                    </span>
                </div>
                {onAddTask && (
                    <button
                        onClick={onAddTask}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-1 -mx-1 flex flex-col gap-3">
                <SortableContext items={taskIds}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={onDeleteTask}
                            onClick={onTaskClick}
                            teamMembers={teamMembers}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-24 border border-dashed border-white/5 rounded-xl flex items-center justify-center">
                        <p className="text-xs text-muted/30 font-medium">Drop tasks here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
