import React, { forwardRef, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { Trash2, Plus, Eye, EyeOff, ChevronRight, ChevronDown, Folder, FolderOpen, FolderPlus, FilePlus, FileText, GripVertical } from 'lucide-react';

interface TaskListProps {
  tasks: Task[]; // These should be the VISIBLE tasks
  allTasks: Task[]; // All tasks needed to find children
  onUpdateTask: (task: Task) => void;
  onUpdateTaskWithChildren: (taskId: string, newStart: Date, newEnd: Date, initialStart: Date, initialEnd: Date) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void; // General add (top level task)
  onAddRootFolder: () => void; // General add (top level folder)
  onAddChild: (targetTaskId: string, type: 'task' | 'summary') => void;
  onReorderTasks: (draggedTaskId: string, targetTaskId: string, position: 'before' | 'after' | 'child') => void;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  teamMembers: string[];
  width: number;
}

const TaskList = forwardRef<HTMLDivElement, TaskListProps>(({ 
  tasks,
  allTasks, 
  onUpdateTask, 
  onUpdateTaskWithChildren,
  onDeleteTask, 
  onAddTask,
  onAddRootFolder,
  onAddChild,
  onReorderTasks,
  selectedTaskId,
  onSelectTask,
  teamMembers,
  width
}, ref) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'child'>('after');
  const [isDragOverBlank, setIsDragOverBlank] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleToggleExpand = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    onUpdateTask({ ...task, isExpanded: !task.isExpanded });
  };

  const handleToggleDescription = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    onUpdateTask({ ...task, isDescriptionExpanded: !task.isDescriptionExpanded });
  };

  // Fixed widths for columns
  const colName = "w-64 flex-shrink-0";
  const colStatus = "w-28 flex-shrink-0";
  const colAssignee = "w-24 flex-shrink-0";
  const colDate = "w-20 flex-shrink-0";
  const colAct = "w-[160px] flex-shrink-0 flex justify-center"; // Increased width for description button

  // Status Options
  const statusOptions: TaskStatus[] = ['Not Started', 'In Progress', 'Completed', 'Blocked'];

  return (
    <div 
        className="flex flex-col h-full border-r border-gray-200 bg-white flex-shrink-0 transition-none"
        style={{ width }}
    >
      {/* Top Controls */}
      <div className="h-[40px] px-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center font-semibold text-sm text-gray-700 flex-shrink-0 overflow-hidden">
        <span>Task List</span>
        <div className="flex gap-2">
            <button 
                onClick={onAddRootFolder}
                className="p-1 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs px-2"
                title="Add Root Folder"
            >
                <FolderPlus size={14} /> Root Folder
            </button>
            <button 
                onClick={onAddTask}
                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs px-2"
                title="Add Root Task"
            >
                <Plus size={14} /> Root Task
            </button>
        </div>
      </div>
      
      {/* Header Row */}
      <div className="h-[50px] bg-gray-50 border-b border-gray-200 flex items-center text-xs font-semibold text-gray-500 flex-shrink-0 px-2 overflow-hidden">
        <div className={`${colName} px-2`}>Task Name</div>
        <div className={`${colStatus} px-2`}>Status</div>
        <div className={`${colAssignee} px-2`}>Assignee</div>
        <div className={`${colDate} px-2`}>Start</div>
        <div className={`${colDate} px-2`}>End</div>
        <div className={`${colAct}`}>Actions</div>
      </div>
      
      {/* Scrollable Body */}
      <div ref={ref} className="flex-1 overflow-y-auto overflow-x-hidden">
        {tasks.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">No tasks in this category.</div>
        ) : (
          <div className="flex flex-col" ref={containerRef}>
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`flex flex-col border-b border-gray-100 transition-colors group ${
                  selectedTaskId === task.id ? 'bg-blue-50' : 
                  dragOverTaskId === task.id ? (
                    dropPosition === 'child' ? 'bg-green-50 ring-2 ring-green-400 ring-inset' :
                    dropPosition === 'before' ? 'border-t-4 border-t-blue-500' : 
                    'border-b-4 border-b-blue-500'
                  ) :
                  'hover:bg-gray-50'
                } ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDraggedTaskId(task.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => {
                  setDraggedTaskId(null);
                  setDragOverTaskId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedTaskId && draggedTaskId !== task.id) {
                    setDragOverTaskId(task.id);
                    setIsDragOverBlank(false);
                    
                    // For folders, only allow 'child' if hovering over the name area (first ~300px)
                    if (task.type === 'summary') {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relativeX = e.clientX - rect.left;
                      const nameColumnWidth = 280; // Approximate width of name column including padding
                      
                      if (relativeX < nameColumnWidth) {
                        // Hovering over name area - can become child
                        setDropPosition('child');
                      } else {
                        // Hovering over other columns - before/after sibling
                        const midpoint = rect.top + rect.height / 2;
                        setDropPosition(e.clientY < midpoint ? 'before' : 'after');
                      }
                    } else {
                      // Regular task - only before/after
                      const rect = e.currentTarget.getBoundingClientRect();
                      const midpoint = rect.top + rect.height / 2;
                      setDropPosition(e.clientY < midpoint ? 'before' : 'after');
                    }
                  }
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  if (e.currentTarget === e.target) {
                    setDragOverTaskId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedTaskId && draggedTaskId !== task.id) {
                    onReorderTasks(draggedTaskId, task.id, dropPosition);
                  }
                  setDraggedTaskId(null);
                  setDragOverTaskId(null);
                }}
              >
                  <div 
                    className="flex items-center h-[40px] text-xs px-2 cursor-pointer"
                    onClick={() => onSelectTask(task.id)}
                  >
                    {/* Drag Handle */}
                    <div 
                      className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 mr-1"
                      title="Drag to reorder"
                    >
                      <GripVertical size={14} />
                    </div>
                    {/* Name Column */}
                    <div className={`${colName} px-2 truncate flex items-center gap-1`} style={{ paddingLeft: `${(task.depth * 16) + 8}px` }}>
                       {task.type === 'summary' ? (
                            <button 
                                onClick={(e) => handleToggleExpand(e, task)}
                                className="p-0.5 hover:bg-gray-200 rounded text-gray-500 flex-shrink-0"
                            >
                                {task.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        ) : (
                            <div className="w-4 flex-shrink-0" />
                        )}
                        
                        {task.type === 'summary' && (
                             <span className="text-gray-400 flex-shrink-0">
                                {task.isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
                             </span>
                        )}

                        <input 
                            type="text" 
                            value={task.name}
                            onChange={(e) => onUpdateTask({ ...task, name: e.target.value })}
                            className={`w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 truncate ${task.type === 'summary' ? 'font-bold text-gray-800' : 'text-gray-700'}`}
                        />
                    </div>

                    {/* Status Column */}
                    <div className={`${colStatus} px-2`}>
                        {task.type !== 'summary' && (
                            <select 
                                value={task.status}
                                onChange={(e) => onUpdateTask({ ...task, status: e.target.value as TaskStatus })}
                                className={`w-full text-[10px] bg-transparent border-none rounded focus:ring-1 focus:ring-blue-500 p-0 font-medium
                                    ${task.status === 'Blocked' ? 'text-red-600' : 
                                      task.status === 'Completed' ? 'text-green-600' : 
                                      task.status === 'In Progress' ? 'text-yellow-600' : 'text-blue-600'}
                                `}
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Assignee Column */}
                    <div className={`${colAssignee} px-2`}>
                       {task.type !== 'summary' && (
                            <select 
                                value={task.assignee}
                                onChange={(e) => onUpdateTask({ ...task, assignee: e.target.value })}
                                className="w-full text-[10px] text-gray-500 bg-transparent border-none rounded focus:ring-1 focus:ring-blue-500 p-0"
                            >
                                <option value="Unassigned">--</option>
                                {teamMembers.map(member => (
                                    <option key={member} value={member}>{member}</option>
                                ))}
                            </select>
                          )}
                    </div>

                    {/* Start Date */}
                    <div className={`${colDate} px-2`}>
                       <input 
                          type="date"
                          value={task.start.toISOString().split('T')[0]}
                          onChange={(e) => {
                            const newStart = new Date(e.target.value);
                            if (!isNaN(newStart.getTime())) {
                              const oldStart = new Date(task.start);
                              const oldEnd = new Date(task.end);
                              const startShift = Math.round((newStart.getTime() - oldStart.getTime()) / (24 * 60 * 60 * 1000));
                              
                              // Check if this task has children
                              const hasChildren = allTasks.some(t => t.parentId === task.id);
                              
                              if (hasChildren && startShift !== 0) {
                                // Calculate new end date (shift by same amount)
                                const newEnd = new Date(oldEnd);
                                newEnd.setDate(newEnd.getDate() + startShift);
                                // Pass absolute dates for folder and children shift calculation
                                onUpdateTaskWithChildren(task.id, newStart, newEnd, oldStart, oldEnd);
                              } else {
                                // Just update this task
                                onUpdateTask({ ...task, start: newStart });
                              }
                            }
                          }}
                          className="w-full bg-transparent text-gray-600 focus:outline-none text-[10px] p-0"
                        />
                    </div>

                    {/* End Date */}
                    <div className={`${colDate} px-2`}>
                       <input 
                          type="date"
                          value={task.end.toISOString().split('T')[0]}
                          onChange={(e) => {
                            const newEnd = new Date(e.target.value);
                            if (!isNaN(newEnd.getTime())) onUpdateTask({ ...task, end: newEnd });
                          }}
                          disabled={task.type === 'summary'}
                          className={`w-full bg-transparent text-gray-600 focus:outline-none text-[10px] p-0 ${task.type === 'summary' ? 'cursor-not-allowed opacity-50' : ''}`}
                          title={task.type === 'summary' ? 'Folder end dates are calculated from children' : ''}
                        />
                    </div>

                    {/* Actions */}
                    <div className={`${colAct} flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <button 
                            onClick={(e) => handleToggleDescription(e, task)}
                            className={`p-1 hover:bg-gray-200 rounded ${task.isDescriptionExpanded ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Toggle Description"
                        >
                            <FileText size={14} />
                        </button>
                        
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>

                        {/* Only folders (summary tasks) can have children */}
                        {task.type === 'summary' && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onAddChild(task.id, 'summary'); }}
                                    className="text-gray-400 hover:text-green-600 p-1"
                                    title="Add Child Folder"
                                >
                                    <FolderPlus size={14} />
                                </button>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onAddChild(task.id, 'task'); }}
                                    className="text-gray-400 hover:text-blue-600 p-1"
                                    title="Add Child Task"
                                >
                                    <FilePlus size={14} />
                                </button>
                            </>
                        )}
                        
                        <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const itemType = task.type === 'summary' ? 'folder' : 'task';
                              const hasChildren = tasks.some(t => t.parentId === task.id);
                              const message = hasChildren 
                                ? `Are you sure you want to delete this ${itemType} "${task.name}" and all its children?`
                                : `Are you sure you want to delete this ${itemType} "${task.name}"?`;
                              if (window.confirm(message)) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="text-gray-300 hover:text-red-500 p-1"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                  </div>

                  {/* Collapsible Description Area */}
                  {task.isDescriptionExpanded && (
                      <div className="px-10 py-2 bg-gray-50 border-t border-gray-100 flex items-start h-[100px] shadow-inner">
                          <span className="text-xs font-semibold text-gray-500 w-24 pt-1">Description:</span>
                          <textarea
                              value={task.description || ''}
                              onChange={(e) => onUpdateTask({ ...task, description: e.target.value })}
                              className="flex-1 h-full text-xs p-2 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                              placeholder="Enter task description here..."
                          />
                      </div>
                  )}
              </div>
            ))}
            
            {/* Blank drop zone for moving to root level */}
            {draggedTaskId && (
              <div 
                className={`flex-1 min-h-[100px] transition-colors ${
                  isDragOverBlank ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverBlank(true);
                  setDragOverTaskId(null);
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  setIsDragOverBlank(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedTaskId) {
                    // Move to root level - find a root task to drop after
                    const rootTasks = allTasks.filter(t => !t.parentId && t.category === allTasks.find(at => at.id === draggedTaskId)?.category);
                    if (rootTasks.length > 0) {
                      const lastRoot = rootTasks[rootTasks.length - 1];
                      onReorderTasks(draggedTaskId, lastRoot.id, 'after');
                    }
                  }
                  setDraggedTaskId(null);
                  setDragOverTaskId(null);
                  setIsDragOverBlank(false);
                }}
              >
                {isDragOverBlank && (
                  <div className="flex items-center justify-center h-full text-blue-500 text-sm font-medium">
                    Drop here to move to root level
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default TaskList;