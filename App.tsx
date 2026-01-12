import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ProjectData, Task, CATEGORIES, Category, ViewMode, Dependency } from './types';
import { generateInitialData } from './constants';
import { getVisibleTasks, recalculateParentDates, getTaskBlockRange } from './utils';
import TaskList from './components/TaskList';
import GanttChart from './components/GanttChart';
import Dashboard from './components/Dashboard';
import { Download, Upload, ZoomIn, ZoomOut, RotateCcw, Plus, Calendar, ShieldCheck, LayoutDashboard, BarChart, FilePlus, FolderPlus, X, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<ProjectData>(generateInitialData());
  const [activeTab, setActiveTab] = useState<string>(data.categories?.[0] || "Responsible AI");
  const [viewMode, setViewMode] = useState<ViewMode>('Year');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'Gantt' | 'Dashboard'>('Gantt');
  
  // Resizing state
  const [taskListWidth, setTaskListWidth] = useState(870);
  const [isResizing, setIsResizing] = useState(false);

  // Pillar Management State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [pillarToDelete, setPillarToDelete] = useState<string | null>(null);

  // Scroll Sync Refs
  const taskListRef = useRef<HTMLDivElement>(null);
  const ganttChartRef = useRef<HTMLDivElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  // Ensure initial data has categories if loaded from older JSON
  useEffect(() => {
     if (!data.categories || data.categories.length === 0) {
        const cats = Array.from(new Set(data.tasks.map(t => t.category)));
        const finalCats = cats.length > 0 ? cats : [...CATEGORIES];
        setData(prev => ({ ...prev, categories: finalCats }));
        if (finalCats.length > 0) setActiveTab(finalCats[0]);
     } else if (!data.categories.includes(activeTab)) {
         setActiveTab(data.categories[0]);
     }
  }, [data.categories]);

  // Derived state for current view
  const categoryTasks = useMemo(() => 
    data.tasks.filter(t => t.category === activeTab), 
  [data.tasks, activeTab]);

  const visibleTasks = useMemo(() => 
    getVisibleTasks(categoryTasks),
  [categoryTasks]);
  
  // Handlers
  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = data.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    const recalculatedTasks = recalculateParentDates(newTasks);
    setData({ ...data, tasks: recalculatedTasks });
  };

  const handleUpdateTeamMembers = (members: string[]) => {
      setData({ ...data, teamMembers: members });
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
    setData({ ...data, tasks: [...data.tasks, newTask] });
    setSelectedTaskId(newTask.id);
  };

  const handleAddRootFolder = () => {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: 'New Root Folder',
        start: new Date(data.year, 0, 1),
        end: new Date(data.year, 11, 31),
        progress: 0,
        isActive: true,
        status: 'Not Started',
        assignee: 'Unassigned',
        type: 'summary',
        category: activeTab,
        depth: 0,
        isExpanded: true
      };
      setData({ ...data, tasks: [...data.tasks, newTask] });
      setSelectedTaskId(newTask.id);
  };

  const handleAddChild = (targetTaskId: string, type: 'task' | 'summary') => {
      const targetIndex = data.tasks.findIndex(t => t.id === targetTaskId);
      if (targetIndex === -1) return;

      const parentTask = data.tasks[targetIndex];
      const insertIndex = targetIndex + 1;

      const newTask: Task = {
          id: `task-${Date.now()}`,
          name: type === 'summary' ? 'New Folder' : 'New Task',
          start: new Date(parentTask.start),
          end: new Date(parentTask.start.getTime() + (5 * 24 * 60 * 60 * 1000)),
          progress: 0,
          isActive: true,
          status: 'Not Started',
          assignee: 'Unassigned',
          type: type,
          category: activeTab,
          depth: parentTask.depth + 1,
          parentId: parentTask.id,
          isExpanded: true
      };

      const newTasks = [...data.tasks];
      newTasks[targetIndex] = { ...parentTask, isExpanded: true };
      newTasks.splice(insertIndex, 0, newTask);
      
      const recalculated = recalculateParentDates(newTasks);
      setData({ ...data, tasks: recalculated });
      setSelectedTaskId(newTask.id);
  };

  const handleAddCategory = () => {
      if (newCategoryName.trim() && !data.categories.includes(newCategoryName.trim())) {
          const newCat = newCategoryName.trim();
          setData(prev => ({
              ...prev,
              categories: [...prev.categories, newCat]
          }));
          setActiveTab(newCat);
          setNewCategoryName('');
          setIsAddingCategory(false);
      }
  };

  const confirmDeleteCategory = () => {
      if (!pillarToDelete) return;
      
      const categoryName = pillarToDelete;
      const updatedCategories = data.categories.filter(c => c !== categoryName);
      
      if (updatedCategories.length === 0) {
          setPillarToDelete(null);
          alert("You must have at least one pillar.");
          return;
      }

      const tasksToDelete = data.tasks.filter(t => t.category === categoryName).map(t => t.id);
      const taskIdsSet = new Set(tasksToDelete);

      const updatedTasks = data.tasks.filter(t => t.category !== categoryName);
      const updatedDependencies = data.dependencies.filter(d => !taskIdsSet.has(d.fromTaskId) && !taskIdsSet.has(d.toTaskId));

      setData(prev => ({
          ...prev,
          categories: updatedCategories,
          tasks: updatedTasks,
          dependencies: updatedDependencies
      }));

      if (activeTab === categoryName) {
          setActiveTab(updatedCategories[0]);
      }
      setPillarToDelete(null);
  };

  const handleMoveTask = (taskId: string, direction: 'up' | 'down') => {
      const tasks = [...data.tasks];
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const task = tasks[taskIndex];
      const block = getTaskBlockRange(tasks, taskIndex);

      if (direction === 'up') {
          let prevSiblingIndex = -1;
          for(let i = block.start - 1; i >= 0; i--) {
              if (tasks[i].category !== task.category) break; 
              if(tasks[i].depth === task.depth && tasks[i].parentId === task.parentId) {
                  prevSiblingIndex = i;
                  break;
              }
              if(tasks[i].depth < task.depth) break;
          }

          if(prevSiblingIndex !== -1) {
              const prevBlock = getTaskBlockRange(tasks, prevSiblingIndex);
              const currentBlockItems = tasks.splice(block.start, (block.end - block.start + 1));
              tasks.splice(prevBlock.start, 0, ...currentBlockItems);
          }
      } else {
          const nextSiblingIndex = block.end + 1;
          if (nextSiblingIndex < tasks.length) {
              const potentialNext = tasks[nextSiblingIndex];
              if (potentialNext.depth === task.depth && potentialNext.parentId === task.parentId && potentialNext.category === task.category) {
                   const nextBlock = getTaskBlockRange(tasks, nextSiblingIndex);
                   const nextBlockItems = tasks.splice(nextBlock.start, (nextBlock.end - nextBlock.start + 1));
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
          if (!parsed.teamMembers) {
              parsed.teamMembers = ["Security Lead", "AI Engineer", "Legal", "Ops"];
          }
          if (!parsed.categories) {
              parsed.categories = [...CATEGORIES];
          }
          setData(parsed);
          if (parsed.categories.length > 0) setActiveTab(parsed.categories[0]);
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const startResizing = useCallback(() => {
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
        const newWidth = Math.max(300, Math.min(mouseMoveEvent.clientX, 1200));
        setTaskListWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
        window.removeEventListener("mousemove", resize);
        window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

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
  }, [activeTab, currentView]); 

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-slate-800 font-sans">
      {/* Pillar Deletion Confirmation Modal */}
      {pillarToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] border border-gray-200 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Delete Pillar?</h3>
                        <p className="text-sm text-gray-500">Are you sure you want to delete the pillar "<span className="font-semibold text-gray-700">{pillarToDelete}</span>"?</p>
                    </div>
                </div>
                <p className="text-xs bg-red-50 text-red-700 p-3 rounded border border-red-100 mb-6 italic">
                    All associated tasks and dependencies within this pillar will be permanently removed.
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setPillarToDelete(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDeleteCategory}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                    >
                        Delete Pillar
                    </button>
                </div>
            </div>
        </div>
      )}

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
        
        {/* Navigation Switch */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
             <button 
                onClick={() => setCurrentView('Gantt')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === 'Gantt' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
                <BarChart size={16} /> Gantt Chart
             </button>
             <button 
                onClick={() => setCurrentView('Dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === 'Dashboard' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
                <LayoutDashboard size={16} /> Dashboard
             </button>
        </div>

        <div className="flex items-center gap-4">
           {currentView === 'Gantt' && (
               <>
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
               <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                 <button onClick={() => setViewMode('Year')} className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'Year' ? 'bg-white shadow text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>Year</button>
                 <button onClick={() => setViewMode('Quarter')} className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'Quarter' ? 'bg-white shadow text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>Qtr</button>
                 <button onClick={() => setViewMode('Month')} className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'Month' ? 'bg-white shadow text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>Month</button>
               </div>
               </>
           )}
           <div className="flex gap-2">
             <button onClick={handleDownload} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title="Download JSON"><Download size={18} /></button>
             <label className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Upload JSON">
                <Upload size={18} />
                <input type="file" onChange={handleUpload} className="hidden" accept=".json" />
             </label>
           </div>
        </div>
      </header>

      {currentView === 'Gantt' ? (
          <>
            <nav className="bg-white border-b border-gray-200 px-6 flex items-center gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
                {(data.categories || []).map(cat => (
                <div key={cat} className="relative group flex items-center h-full">
                    <div
                        onClick={() => setActiveTab(cat)}
                        className={`
                        pl-4 pr-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer h-full
                        ${activeTab === cat 
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                        `}
                    >
                        {cat}
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                setPillarToDelete(cat);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded-full transition-all flex items-center justify-center"
                            title={`Delete Pillar: ${cat}`}
                        >
                            <X size={12} />
                        </button>
                    </div>
                </div>
                ))}
                
                {isAddingCategory ? (
                    <div className="flex items-center ml-2 bg-gray-100 rounded px-2 py-1">
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Pillar Name"
                            className="text-xs bg-transparent outline-none w-24"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddCategory();
                                if (e.key === 'Escape') setIsAddingCategory(false);
                            }}
                        />
                        <button onClick={handleAddCategory} className="text-green-600 hover:text-green-700 ml-1"><Plus size={14}/></button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsAddingCategory(true)}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Add Pillar"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </nav>

            <div className="flex flex-1 overflow-hidden">
                <TaskList 
                  ref={taskListRef}
                  tasks={visibleTasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTask}
                  onAddRootFolder={handleAddRootFolder}
                  onAddChild={handleAddChild}
                  onMoveTask={handleMoveTask}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={setSelectedTaskId}
                  teamMembers={data.teamMembers || []}
                  width={taskListWidth}
                />
                <div
                    className="w-1 hover:w-1.5 -ml-0.5 hover:-ml-0.75 bg-gray-200 hover:bg-blue-500 cursor-col-resize flex-shrink-0 z-30 transition-all shadow-sm"
                    onMouseDown={startResizing}
                />
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

            <footer className="bg-white border-t border-gray-200 p-2 px-6 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-300 rounded"></div> Task</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-700 rounded"></div> Summary</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rotate-45"></div> Milestone</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded"></div> Critical Path</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded"></div> Inactive</span>
                </div>
                <div>Drag divider to resize • Hover over tabs to see delete option</div>
            </footer>
          </>
      ) : (
          <div className="flex-1 overflow-hidden">
              <Dashboard 
                tasks={data.tasks} 
                teamMembers={data.teamMembers || []} 
                onUpdateTeamMembers={handleUpdateTeamMembers}
                onUpdateTask={handleUpdateTask}
              />
          </div>
      )}
    </div>
  );
};

export default App;