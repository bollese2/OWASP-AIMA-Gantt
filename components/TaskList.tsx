import React, { forwardRef } from 'react';
import { Task, TaskStatus } from '../types';
import { Trash2, Plus, Eye, EyeOff, ChevronRight, ChevronDown, Folder, FolderOpen, ArrowUp, ArrowDown, FolderPlus, FilePlus, FileText } from 'lucide-react';

interface TaskListProps {
  tasks: Task[]; // These should be the VISIBLE tasks
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void; // General add (top level task)
  onAddRootFolder: () => void; // General add (top level folder)
  onAddChild: (targetTaskId: string, type: 'task' | 'summary') => void;
  onMoveTask: (taskId: string, direction: 'up' | 'down') => void;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  teamMembers: string[];
  width: number;
}

const TaskList = forwardRef<HTMLDivElement, TaskListProps>(({ 
  tasks, 
  onUpdateTask, 
  onDeleteTask, 
  onAddTask,
  onAddRootFolder,
  onAddChild,
  onMoveTask,
  selectedTaskId,
  onSelectTask,
  teamMembers,
  width
}, ref) => {

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
          <div className="flex flex-col">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`flex flex-col border-b border-gray-100 transition-colors group ${selectedTaskId === task.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                  <div 
                    className="flex items-center h-[40px] text-xs px-2 cursor-pointer"
                    onClick={() => onSelectTask(task.id)}
                  >
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
                            if (!isNaN(newStart.getTime())) onUpdateTask({ ...task, start: newStart });
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
                          className="w-full bg-transparent text-gray-600 focus:outline-none text-[10px] p-0"
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
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); onMoveTask(task.id, 'up'); }}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Move Up"
                        >
                            <ArrowUp size={14} />
                        </button>

                        <button 
                            onClick={(e) => { e.stopPropagation(); onMoveTask(task.id, 'down'); }}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Move Down"
                        >
                            <ArrowDown size={14} />
                        </button>

                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
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
          </div>
        )}
      </div>
    </div>
  );
});

export default TaskList;