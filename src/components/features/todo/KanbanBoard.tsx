import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import type { TaskData, TeamMember, Milestone } from "../../../type/rock-data";
import { useSounds } from "../../../lib/useSounds";

interface KanbanBoardProps {
    tasks: TaskData[];
    onUpdateTask: (task: TaskData) => void;
    onDeleteTask: (id: string) => void;
    onAddTask: (task: TaskData) => void;
    externalTrigger?: number;
    columns: { id: string; title: string; color: string }[];
    viewMode: "status" | "milestone";
    teamMembers?: TeamMember[];
    milestones?: Milestone[];
}

export function KanbanBoard(props: KanbanBoardProps) {
    const { tasks, onUpdateTask, onDeleteTask, onAddTask, columns, viewMode, teamMembers = [], milestones = [] } = props;
    const [activeTask, setActiveTask] = useState<TaskData | null>(null);
    const { play: playSound } = useSounds();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // Prevent accidental drags
            },
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Task") {
            playSound('pop');
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            // Need to update local state optimistically or just wait for dragEnd
            // For simple status changes, dragEnd is usually sufficient if we don't need highly responsive reordering *during* the drag across columns
            // But visually it helps. For now let's rely on DragEnd to trigger the status update to keep it simple and robust.
        }

        const isOverColumn = over.data.current?.type === "Column";
        if (isActiveTask && isOverColumn) {
            // Dragging over a column container directly
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find((t) => t.id === activeId);
        if (!activeTask) return;

        // 1. Dropped over a Column
        if (columns.some((col) => col.id === overId)) {
            if (viewMode === "status") {
                // Change status
                if (activeTask.status !== overId) {
                    const newStatus = overId as TaskData["status"];
                    onUpdateTask({ ...activeTask, status: newStatus });
                }
            } else {
                // Change milestone
                if (activeTask.milestoneId !== overId) {
                    onUpdateTask({ ...activeTask, milestoneId: overId });
                }
            }
            return;
        }

        // 2. Dropped over another Task
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
            if (viewMode === "status") {
                if (activeTask.status !== overTask.status) {
                    onUpdateTask({ ...activeTask, status: overTask.status });
                }
            } else {
                if (activeTask.milestoneId !== overTask.milestoneId) {
                    onUpdateTask({ ...activeTask, milestoneId: overTask.milestoneId });
                }
            }
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: "0.5",
                },
            },
        }),
    };

    // Modal state for adding task - we'll actually use the one in TodoPage or lift it here?
    // The previous implementation had it in KanbanBoard? Let's check.
    // Actually, let's make a simple inline add or just trigger the parent.
    // We'll create a nice "New Task" modal here to keep it self-contained or use the one passed down.

    // Simplification: We'll just define the columns and render them. Logic for "New Task" will be a simple prompt or modal.
    // Let's implement a clean modal for new tasks as part of this revamp.

    const [showAddModal, setShowAddModal] = useState(false);
    const [newTaskColumn, setNewTaskColumn] = useState<string>('todo');
    const [newTaskFormData, setNewTaskFormData] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        dueDate: '',
        tagInput: '',
        milestoneId: '',
        assigneeIds: [] as string[]
    });

    const handleOpenAdd = (columnId: string) => {
        setNewTaskColumn(columnId);
        setNewTaskFormData({
            title: '',
            description: '',
            priority: 'medium',
            dueDate: '',
            tagInput: '',
            milestoneId: '',
            assigneeIds: []
        });
        setShowAddModal(true);
    }

    // Listen to external trigger
    useEffect(() => {
        if (props.externalTrigger && props.externalTrigger > 0) {
            handleOpenAdd('todo');
        }
    }, [props.externalTrigger]);

    const handleSubmitNewTask = () => {
        if (!newTaskFormData.title.trim()) return;

        const tags = newTaskFormData.tagInput.split(',').map(t => t.trim()).filter(Boolean);

        const newTask: TaskData = {
            id: crypto.randomUUID(),
            title: newTaskFormData.title,
            description: newTaskFormData.description,
            priority: newTaskFormData.priority,
            status: viewMode === "status" ? (newTaskColumn as TaskData['status']) : "todo",
            milestoneId: viewMode === "milestone" ? newTaskColumn : newTaskFormData.milestoneId || undefined,
            assigneeIds: newTaskFormData.assigneeIds.length > 0 ? newTaskFormData.assigneeIds : undefined,
            dueDate: newTaskFormData.dueDate,
            tags: tags,
            createdAt: new Date().toISOString()
        };

        onAddTask(newTask);
        setShowAddModal(false);
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={tasks.filter((t) =>
                            viewMode === "status"
                                ? t.status === col.id
                                : t.milestoneId === col.id
                        )}
                        color={col.color}
                        onAddTask={() => handleOpenAdd(col.id)}
                        onDeleteTask={onDeleteTask}
                        teamMembers={teamMembers}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTask && <TaskCard task={activeTask} />}
                </DragOverlay>,
                document.body
            )}

            {/* Add Task Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-4">New Task</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-muted uppercase font-medium">Title</label>
                                <input
                                    autoFocus
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-primary"
                                    value={newTaskFormData.title}
                                    onChange={e => setNewTaskFormData({ ...newTaskFormData, title: e.target.value })}
                                    placeholder="Task title..."
                                />
                            </div>

                            <div>
                                <label className="text-xs text-muted uppercase font-medium">Description</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-primary h-24 resize-none"
                                    value={newTaskFormData.description}
                                    onChange={e => setNewTaskFormData({ ...newTaskFormData, description: e.target.value })}
                                    placeholder="Add details..."
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-muted uppercase font-medium">Priority</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-primary"
                                        value={newTaskFormData.priority}
                                        onChange={e => setNewTaskFormData({ ...newTaskFormData, priority: e.target.value as any })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-muted uppercase font-medium">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-primary"
                                        value={newTaskFormData.dueDate}
                                        onChange={e => setNewTaskFormData({ ...newTaskFormData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {viewMode === "status" && milestones.length > 0 && (
                                <div>
                                    <label className="text-xs text-muted uppercase font-medium">Milestone (Optional)</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-primary"
                                        value={newTaskFormData.milestoneId}
                                        onChange={e => setNewTaskFormData({ ...newTaskFormData, milestoneId: e.target.value })}
                                    >
                                        <option value="">No Milestone</option>
                                        {milestones.map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {teamMembers.length > 0 && (
                                <div>
                                    <label className="text-xs text-muted uppercase font-medium">Assignees</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {teamMembers.map(member => (
                                            <button
                                                key={member.id}
                                                type="button"
                                                onClick={() => {
                                                    const isSelected = newTaskFormData.assigneeIds.includes(member.id);
                                                    setNewTaskFormData({
                                                        ...newTaskFormData,
                                                        assigneeIds: isSelected
                                                            ? newTaskFormData.assigneeIds.filter(id => id !== member.id)
                                                            : [...newTaskFormData.assigneeIds, member.id]
                                                    });
                                                }}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${newTaskFormData.assigneeIds.includes(member.id)
                                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                                        : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[9px] font-semibold text-white">
                                                    {member.initials}
                                                </div>
                                                {member.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-muted uppercase font-medium">Tags (comma separated)</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-primary"
                                    value={newTaskFormData.tagInput}
                                    onChange={e => setNewTaskFormData({ ...newTaskFormData, tagInput: e.target.value })}
                                    placeholder="Dev, Design, Urgent..."
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg text-muted hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitNewTask}
                                    className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/20 transition-all"
                                >
                                    Create Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DndContext>
    );
}
