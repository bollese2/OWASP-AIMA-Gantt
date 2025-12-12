import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ProjectData, Task, CATEGORIES, Category, ViewMode, Dependency } from './types';
import { generateInitialData } from './constants';
import { getVisibleTasks, recalculateParentDates, getTaskBlockRange } from './utils';
import TaskList from './components/TaskList';
import GanttChart from './components/GanttChart';
import { Download, Upload, ZoomIn, ZoomOut, RotateCcw, Plus, Calendar, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<ProjectData>(generateInitialData());
  const [activeTab, setActiveTab] = useState<Category>(CATEGORIES[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Scroll Sync Refs
  const taskListRef = useRef<HTMLDivElement>(null);
  const ganttChartRef = useRef<HTMLDivElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  // Derived state for current view
  const categoryTasks = useMemo(() => 
    data.tasks.filter(t => t.category === activeTab), 
  [data.tasks, activeTab]);

  const visibleTasks = useMemo(() => 
    getVisibleTasks(categoryTasks),
  [categoryTasks]);
  
  // Handlers
  const handleUpdateTask = (updatedTask: Task) => {
    // 1. Update the specific task
    const newTasks = data.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    
    // 2. Recalculate parent dates based on the change
    const recalculatedTasks = recalculateParentDates(newTasks);
    
    setData({ ...data, tasks: recalculatedTasks });
  };

  const handleDeleteTask = (taskId: string) => {
    const tasksToDelete = new Set<string>([taskId]);
    let changed = true;
    while(changed) {
        changed = false;
        data.tasks.forEach(t => {
            if(t.parentId && tasksToDelete.has(t.parentId) && !tasksToDelete.has(t.id)) {
                tasksToDelete.add(t.id);
                changed = true;
            }
        });
    }

    const newTasks = data.tasks.filter(t => !tasksToDelete.has(t.id));
    const newDeps = data.dependencies.filter(d => !tasksToDelete.has(d.fromTaskId) && !tasksToDelete.has(d.toTaskId));
    
    // Recalculate after deletion
    const finalTasks = recalculateParentDates(newTasks);
    
    setData({ ...data, tasks: finalTasks, dependencies: newDeps });
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: 'New Root Task',
      start: new Date(data.year, 0, 15),
      end: new Date(data.year, 0, 20),
      progress: 0,
      isActive: true,
      status: 'Not Started',
      assignee: 'Unassigned',
      type: 'task',
      category: activeTab,
      depth: 0
    };
    
    const newTasks = [...data.tasks, newTask];
    setData({ ...data, tasks: newTasks });
    setSelectedTaskId(newTask.id);
  };

  const handleAddTaskBelow = (targetTaskId: string) => {
      const targetIndex = data.tasks.findIndex(t => t.id === targetTaskId);
      if (targetIndex === -1) return;

      const targetTask = data.tasks[targetIndex];
      const block = getTaskBlockRange(data.tasks, targetIndex);
      const insertIndex = block.end + 1;

      const newTask: Task = {
          id: `task-${Date.now()}`,
          name: 'New Task',
          start: new Date(targetTask.start),
          end: new Date(targetTask.start.getTime() + (5 * 24 * 60 * 60 * 1000)), // 5 days later
          progress: 0,
          isActive: true,
          status: 'Not Started',
          assignee: 'Unassigned',
          type: 'task',
          category: activeTab,
          depth: targetTask.depth,
          parentId: targetTask.parentId
      };

      const newTasks = [...data.tasks];
      newTasks.splice(insertIndex, 0, newTask);
      
      const recalculated = recalculateParentDates(newTasks);
      setData({ ...data, tasks: recalculated });
      setSelectedTaskId(newTask.id);
  };

  const handleMoveTask = (taskId: string, direction: 'up' | 'down') => {
      const tasks = [...data.tasks];
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const task = tasks[taskIndex];
      const block = getTaskBlockRange(tasks, taskIndex); // {start, end} inclusive

      if (direction === 'up') {
          // Find previous sibling block
          // Iterate backwards from block.start - 1
          let prevSiblingIndex = -1;
          for(let i = block.start - 1; i >= 0; i--) {
              // Ensure we stay within category (though indices are global, category matters for UI)
              if (tasks[i].category !== task.category) break; 
              
              if(tasks[i].depth === task.depth && tasks[i].parentId === task.parentId) {
                  prevSiblingIndex = i;
                  break;
              }
              // If we hit a lower depth (parent), we can't move up further
              if(tasks[i].depth < task.depth) break;
          }

          if(prevSiblingIndex !== -1) {
              const prevBlock = getTaskBlockRange(tasks, prevSiblingIndex);
              // Swap: [PrevBlock] [CurrentBlock] -> [CurrentBlock] [PrevBlock]
              
              // 1. Extract Current Block
              const currentBlockItems = tasks.splice(block.start, (block.end - block.start + 1));
              
              // 2. Insert at PrevBlock start
              tasks.splice(prevBlock.start, 0, ...currentBlockItems);
          }
      } else {
          // Find next sibling block
          const nextSiblingIndex = block.end + 1;
          if (nextSiblingIndex < tasks.length) {
              const potentialNext = tasks[nextSiblingIndex];
              // Must be same parent/depth
              if (potentialNext.depth === task.depth && potentialNext.parentId === task.parentId && potentialNext.category === task.category) {
                   const nextBlock = getTaskBlockRange(tasks, nextSiblingIndex);
                   
                   // Swap: [CurrentBlock] [NextBlock] -> [NextBlock] [CurrentBlock]
                   
                   // 1. Extract Next Block
                   const nextBlockItems = tasks.splice(nextBlock.start, (nextBlock.end - nextBlock.start + 1));

                   // 2. Insert before current block
                   tasks.splice(block.start, 0, ...nextBlockItems);
              }
          }
      }
      
      setData({ ...data, tasks });
  };

  const handleAddDependency = (dep: Dependency) => {
    setData({ ...data, dependencies: [...data.dependencies, dep] });
  };

  const handleDeleteDependency = (id: string) => {
      setData({...data, dependencies: data.dependencies.filter(d => d.id !== id)});
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `owasp-aima-gantt-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          parsed.tasks = parsed.tasks.map((t: any) => ({
            ...t,
            start: new Date(t.start),
            end: new Date(t.end)
          }));
          setData(parsed);
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  // Synchronize Scrolling
  useEffect(() => {
    const leftEl = taskListRef.current;
    const rightEl = ganttChartRef.current;

    if (!leftEl || !rightEl) return;

    const handleLeftScroll = () => {
      if (!isSyncingLeft.current) {
        isSyncingRight.current = true;
        rightEl.scrollTop = leftEl.scrollTop;
      }
      isSyncingLeft.current = false;
    };

    const handleRightScroll = () => {
      if (!isSyncingRight.current) {
        isSyncingLeft.current = true;
        leftEl.scrollTop = rightEl.scrollTop;
      }
      isSyncingRight.current = false;
    };

    leftEl.addEventListener('scroll', handleLeftScroll);
    rightEl.addEventListener('scroll', handleRightScroll);

    return () => {
      leftEl.removeEventListener('scroll', handleLeftScroll);
      rightEl.removeEventListener('scroll', handleRightScroll);
    };
  }, [activeTab]); // Re-attach when tab changes to ensure refs are valid

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <input 
                    type="text" 
                    value={data.title} 
                    onChange={(e) => setData({...data, title: e.target.value})}
                    className="bg-transparent border-none hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 rounded px-1 transition-all"
                />
            </h1>
            <p className="text-xs text-gray-500 font-medium">OWASP AI Security Maturity Model</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Year Control */}
           <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
              <Calendar size={14} className="text-gray-400 mr-2" />
              <input 
                type="number" 
                value={data.year}
                onChange={(e) => setData({...data, year: parseInt(e.target.value)})}
                className="w-16 bg-transparent text-sm font-semibold outline-none"
              />
           </div>

           <div className="h-6 w-px bg-gray-200 mx-2"></div>

           {/* Zoom Controls */}
           <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
             <button 
                onClick={() => setViewMode('Month')} 
                className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'Month' ? 'bg-white shadow text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Month
             </button>
             <button 
                onClick={() => setViewMode('Quarter')} 
                className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'Quarter' ? 'bg-white shadow text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Qtr
             </button>
           </div>

           <div className="flex gap-2">
             <button onClick={handleDownload} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title="Download JSON">
                <Download size={18} />
             </button>
             <label className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Upload JSON">
                <Upload size={18} />
                <input type="file" onChange={handleUpload} className="hidden" accept=".json" />
             </label>
           </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-gray-200 px-6 flex gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`
              px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
              ${activeTab === cat 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
            `}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Task List */}
        <TaskList 
          ref={taskListRef}
          tasks={visibleTasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
          onAddTaskBelow={handleAddTaskBelow}
          onMoveTask={handleMoveTask}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
        />

        {/* Right Area: Chart */}
        <GanttChart 
          ref={ganttChartRef}
          tasks={visibleTasks}
          dependencies={data.dependencies}
          year={data.year}
          viewMode={viewMode}
          onUpdateTask={handleUpdateTask}
          onAddDependency={handleAddDependency}
          onDeleteDependency={handleDeleteDependency}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
        />
      </div>
      
      {/* Legend Footer */}
      <footer className="bg-white border-t border-gray-200 p-2 px-6 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
         <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-300 rounded"></div> Task</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-700 rounded"></div> Summary</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rotate-45"></div> Milestone</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded"></div> Critical Path</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded"></div> Inactive</span>
         </div>
         <div>
            Drag bars to move • Drag edges to resize • Drag dot on right to link dependencies • Click lines to delete
         </div>
      </footer>
    </div>
  );
};

export default App;