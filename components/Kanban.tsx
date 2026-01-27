import React, { useState, useMemo } from 'react';
import { Task, TaskStatus } from '../types';
import { Edit2, X, Calendar, User, AlertCircle, Clock } from 'lucide-react';

interface KanbanProps {
  tasks: Task[];
  allTasks: Task[];
  teamMembers: string[];
  onUpdateTask: (task: Task) => void;
}

const Kanban: React.FC<KanbanProps> = ({ tasks, allTasks, teamMembers, onUpdateTask }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    name: '',
    assignee: '',
    parent: '',
  });

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'Not Started', label: 'Not Started', color: 'bg-gray-100 border-gray-300' },
    { status: 'In Progress', label: 'In Progress', color: 'bg-yellow-50 border-yellow-300' },
    { status: 'Blocked', label: 'Blocked', color: 'bg-red-50 border-red-300' },
    { status: 'Completed', label: 'Completed', color: 'bg-green-50 border-green-300' },
  ];

  // Get parent hierarchy for a task
  const getParentHierarchy = (task: Task): string[] => {
    const parents: string[] = [];
    let currentTask = task;
    
    while (currentTask.parentId) {
      const parent = allTasks.find(t => t.id === currentTask.parentId);
      if (parent) {
        parents.unshift(parent.name);
        currentTask = parent;
      } else {
        break;
      }
    }
    
    return parents;
  };

  // Calculate due date status
  const getDueDateStatus = (endDate: Date): { label: string; color: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Late', color: 'bg-red-600 text-white' };
    } else if (diffDays === 0) {
      return { label: 'Due Today', color: 'bg-orange-600 text-white' };
    } else if (diffDays === 1) {
      return { label: 'Due Tomorrow', color: 'bg-orange-500 text-white' };
    } else if (diffDays <= 5) {
      return { label: `Due in ${diffDays} days`, color: 'bg-yellow-500 text-white' };
    }
    
    return { label: '', color: '' };
  };

  // Filter tasks (only non-summary tasks)
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.type === 'summary') return false; // Only show regular tasks
      
      if (filters.name && !task.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      if (filters.assignee && task.assignee !== filters.assignee) {
        return false;
      }
      
      if (filters.parent) {
        const parents = getParentHierarchy(task);
        if (!parents.some(p => p.toLowerCase().includes(filters.parent.toLowerCase()))) {
          return false;
        }
      }
      
      return true;
    });
  }, [tasks, filters, allTasks]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      'Not Started': [],
      'In Progress': [],
      'Blocked': [],
      'Completed': []
    };
    
    filteredTasks.forEach(task => {
      grouped[task.status].push(task);
    });
    
    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTaskId) {
      const task = tasks.find(t => t.id === draggedTaskId);
      if (task && task.status !== status) {
        onUpdateTask({ ...task, status });
      }
    }
    setDraggedTaskId(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask({ ...task });
  };

  const handleSaveEdit = () => {
    if (editingTask) {
      onUpdateTask(editingTask);
      setEditingTask(null);
    }
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const parents = getParentHierarchy(task);
    const dueDateStatus = getDueDateStatus(task.end);
    
    return (
      <div
        draggable
        onDragStart={() => handleDragStart(task.id)}
        className={`bg-white rounded-lg border shadow-sm p-3 mb-2 cursor-move hover:shadow-md transition-shadow ${
          draggedTaskId === task.id ? 'opacity-50' : ''
        }`}
      >
        {/* Parent hierarchy badges */}
        {parents.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {parents.map((parent, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium"
              >
                {parent}
              </span>
            ))}
          </div>
        )}
        
        {/* Task name and edit button */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-sm text-gray-800 flex-1">{task.name}</h4>
          <button
            onClick={() => handleEditTask(task)}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
            title="Edit task"
          >
            <Edit2 size={14} />
          </button>
        </div>
        
        {/* Due date indicator */}
        {dueDateStatus.label && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mb-2 ${dueDateStatus.color}`}>
            <AlertCircle size={12} />
            {dueDateStatus.label}
          </div>
        )}
        
        {/* Task details */}
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{task.assignee}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter by task name..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-48">
            <select
              value={filters.assignee}
              onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Assignees</option>
              {teamMembers.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter by parent folder..."
              value={filters.parent}
              onChange={(e) => setFilters({ ...filters, parent: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map(column => (
            <div
              key={column.status}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
              className={`flex flex-col w-80 ${column.color} rounded-lg border-2 p-4`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-700">{column.label}</h3>
                <span className="px-2 py-1 bg-white rounded-full text-xs font-semibold text-gray-600">
                  {tasksByStatus[column.status].length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2">
                {tasksByStatus[column.status].map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingTask.start.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newStart = new Date(e.target.value);
                      if (!isNaN(newStart.getTime())) {
                        setEditingTask({ ...editingTask, start: newStart });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editingTask.end.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newEnd = new Date(e.target.value);
                      if (!isNaN(newEnd.getTime())) {
                        setEditingTask({ ...editingTask, end: newEnd });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <select
                  value={editingTask.assignee}
                  onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Unassigned">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter task description..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanban;
