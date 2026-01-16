import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, Tag, Trash2, Calendar, GripVertical, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import type { TaskData, TeamMember } from "../../../type/rock-data";

interface TaskCardProps {
    task: TaskData;
    onDelete?: (id: string) => void;
    onClick?: (task: TaskData) => void;
    teamMembers?: TeamMember[];
}

export function TaskCard({ task, onDelete, onClick, teamMembers = [] }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priorityColors = {
        low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        critical: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50 bg-white/5 border border-white/10 rounded-xl h-[120px] p-4"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative bg-[#0A0A0A]/40 hover:bg-[#0A0A0A]/60 backdrop-blur-sm border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md"
            onClick={(e) => {
                // Prevent click when simply clicking on delete or drag handle, if we separate them
                onClick?.(task);
            }}
        >
            {/* Hover Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-rose-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex items-start justify-between mb-2 pr-6">
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider",
                    priorityColors[task.priority]
                )}>
                    {task.priority}
                </span>
            </div>

            <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">{task.title}</h4>

            {task.description && (
                <p className="text-xs text-muted/80 line-clamp-2 mb-3 font-light">
                    {task.description}
                </p>
            )}

            <div className="flex items-center gap-3 mt-auto">
                {task.dueDate && (
                    <div className="flex items-center gap-1 text-[10px] text-muted group-hover:text-zinc-300 transition-colors">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}

                {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-muted group-hover:text-zinc-300 transition-colors">
                        <Tag className="w-3 h-3" />
                        <span>{task.tags.length}</span>
                    </div>
                )}

                {/* Assignee Avatars */}
                {task.assigneeIds && task.assigneeIds.length > 0 && (
                    <div className="flex -space-x-2 ml-auto">
                        {task.assigneeIds.slice(0, 3).map((assigneeId) => {
                            const member = teamMembers.find(m => m.id === assigneeId);
                            if (!member) return null;

                            return (
                                <div
                                    key={member.id}
                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-semibold text-white border-2 border-[#0A0A0A] hover:z-10 transition-transform hover:scale-110"
                                    title={member.name}
                                >
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        member.initials
                                    )}
                                </div>
                            );
                        })}
                        {task.assigneeIds.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold text-muted border-2 border-[#0A0A0A]">
                                +{task.assigneeIds.length - 3}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
