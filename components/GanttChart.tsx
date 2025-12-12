import React, { useState, useRef, useMemo, forwardRef } from 'react';
import { Task, Dependency, DragState, ViewMode, TaskStatus } from '../types';
import { diffDays, addDays, calculateCriticalPath } from '../utils';

interface GanttChartProps {
  tasks: Task[]; // Visible tasks only
  dependencies: Dependency[];
  year: number;
  viewMode: ViewMode;
  onUpdateTask: (task: Task) => void;
  onAddDependency: (dep: Dependency) => void;
  onDeleteDependency: (id: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
}

const HEADER_HEIGHT = 50;
const ROW_HEIGHT = 40;
const BAR_HEIGHT = 20;

const GanttChart = forwardRef<HTMLDivElement, GanttChartProps>(({
  tasks,
  dependencies,
  year,
  viewMode,
  onUpdateTask,
  onAddDependency,
  onDeleteDependency,
  selectedTaskId,
  onSelectTask
}, ref) => {
  const headerRef = useRef<HTMLDivElement>(null);
  
  const [dragState, setDragState] = useState<DragState>({ type: null, taskId: null, initialMouseX: 0 });
  const [tempLine, setTempLine] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);

  const columnWidth = viewMode === 'Month' ? 2 : viewMode === 'Quarter' ? 10 : 30; // pixels per day
  
  const startDate = useMemo(() => new Date(year, 0, 1), [year]);
  const endDate = useMemo(() => new Date(year, 11, 31), [year]);
  const totalDays = diffDays(endDate, startDate) + 1;
  const chartWidth = totalDays * columnWidth;

  const dateToX = (date: Date) => diffDays(date, startDate) * columnWidth;

  const criticalPath = useMemo(() => calculateCriticalPath(tasks, dependencies), [tasks, dependencies]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handlePointerDown = (e: React.PointerEvent, task: Task, type: DragState['type']) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectTask(task.id);
    setDragState({
      type,
      taskId: task.id,
      initialMouseX: e.clientX,
      initialDate: task.start,
      initialEndDate: task.end
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.type || !dragState.taskId) return;

    const dx = (e.clientX - dragState.initialMouseX) / columnWidth;
    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task) return;

    if (dragState.type === 'move') {
      const daysShift = Math.round(dx);
      if (dragState.initialDate && dragState.initialEndDate) {
         const newStart = addDays(dragState.initialDate, daysShift);
         const newEnd = addDays(dragState.initialEndDate, daysShift);
         onUpdateTask({ ...task, start: newStart, end: newEnd });
      }
    } else if (dragState.type === 'resize-left') {
       const daysShift = Math.round(dx);
       if (dragState.initialDate) {
         const newStart = addDays(dragState.initialDate, daysShift);
         if (newStart.getTime() < task.end.getTime()) {
            onUpdateTask({ ...task, start: newStart });
         }
       }
    } else if (dragState.type === 'resize-right') {
       const daysShift = Math.round(dx);
       if (dragState.initialEndDate) {
         const newEnd = addDays(dragState.initialEndDate, daysShift);
         if (newEnd.getTime() > task.start.getTime()) {
            onUpdateTask({ ...task, end: newEnd });
         }
       }
    } else if (dragState.type === 'create-link') {
       const taskIndex = tasks.findIndex(t => t.id === dragState.taskId);
       const startX = dateToX(task.end) + 10; 
       const startY = (taskIndex * ROW_HEIGHT) + (ROW_HEIGHT / 2);
       
       const rect = (ref as React.RefObject<HTMLDivElement>)?.current?.getBoundingClientRect();
       const scrollLeft = (ref as React.RefObject<HTMLDivElement>)?.current?.scrollLeft || 0;
       const scrollTop = (ref as React.RefObject<HTMLDivElement>)?.current?.scrollTop || 0;

       if (rect) {
         setTempLine({
           x1: startX,
           y1: startY,
           x2: e.clientX - rect.left + scrollLeft,
           y2: e.clientY - rect.top + scrollTop
         });
       }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState.type === 'create-link' && tempLine) {
        const rect = (ref as React.RefObject<HTMLDivElement>)?.current?.getBoundingClientRect();
        const scrollLeft = (ref as React.RefObject<HTMLDivElement>)?.current?.scrollLeft || 0;
        const scrollTop = (ref as React.RefObject<HTMLDivElement>)?.current?.scrollTop || 0;

        if(rect) {
             const mouseY = e.clientY - rect.top + scrollTop;
             const targetRowIndex = Math.floor(mouseY / ROW_HEIGHT);

             if (targetRowIndex >= 0 && targetRowIndex < tasks.length) {
                 const targetTask = tasks[targetRowIndex];
                 if (targetTask.id !== dragState.taskId) {
                     const exists = dependencies.some(d => d.fromTaskId === dragState.taskId && d.toTaskId === targetTask.id);
                     if (!exists) {
                         onAddDependency({
                             id: `dep-${Date.now()}`,
                             fromTaskId: dragState.taskId!,
                             toTaskId: targetTask.id,
                             type: 'FinishToStart'
                         });
                     }
                 }
             }
        }
    }

    setDragState({ type: null, taskId: null, initialMouseX: 0 });
    setTempLine(null);
  };

  const renderTimeAxis = () => {
    const months = [];
    const ticks = [];
    
    for (let m = 0; m < 12; m++) {
      const d = new Date(year, m, 1);
      const nextD = new Date(year, m + 1, 1);
      const x = dateToX(d);
      const w = dateToX(nextD) - x;
      months.push(
        <g key={`m-${m}`}>
          <rect x={x} y={0} width={w} height={25} fill="#f8fafc" stroke="#e2e8f0" />
          <text x={x + w/2} y={18} fontSize="12" textAnchor="middle" className="font-semibold text-slate-600">
            {d.toLocaleString('default', { month: 'long' })}
          </text>
        </g>
      );
    }
    
    for (let i = 0; i <= totalDays; i += 7) {
       const x = i * columnWidth;
       ticks.push(
         <line key={`tick-${i}`} x1={x} y1={25} x2={x} y2={HEADER_HEIGHT} stroke="#e2e8f0" />
       );
       const date = addDays(startDate, i);
       if (columnWidth > 5) {
         ticks.push(
           <text key={`txt-${i}`} x={x + 5} y={45} fontSize="10" fill="#94a3b8">
             {date.getDate()}
           </text>
         );
       }
    }
    return <g>{months}{ticks}</g>;
  };

  const renderGrid = () => {
    const lines = [];
    for (let m = 0; m < 12; m++) {
         const d = new Date(year, m, 1);
         const x = dateToX(d);
         lines.push(<line key={`grid-${m}`} x1={x} y1={0} x2={x} y2={tasks.length * ROW_HEIGHT} stroke="#f1f5f9" strokeDasharray="4 4" />);
    }
    const today = new Date();
    if (today.getFullYear() === year) {
        const x = dateToX(today);
        lines.push(<line key="today" x1={x} y1={0} x2={x} y2={tasks.length * ROW_HEIGHT} stroke="red" strokeWidth="1" opacity="0.5" />);
    }
    return <g>{lines}</g>;
  };

  const renderDependencies = () => {
     return dependencies.map(dep => {
         const fromTask = tasks.find(t => t.id === dep.fromTaskId);
         const toTask = tasks.find(t => t.id === dep.toTaskId);
         if (!fromTask || !toTask) return null;

         const fromIdx = tasks.indexOf(fromTask);
         const toIdx = tasks.indexOf(toTask);
         
         const startX = dateToX(fromTask.end);
         const startY = (fromIdx * ROW_HEIGHT) + (ROW_HEIGHT / 2);
         const endX = dateToX(toTask.start);
         const endY = (toIdx * ROW_HEIGHT) + (ROW_HEIGHT / 2);

         const midX = (startX + endX) / 2;
         const path = startX < endX 
            ? `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
            : `M ${startX} ${startY} L ${startX + 10} ${startY} L ${startX + 10} ${startY + (ROW_HEIGHT/2)} L ${endX - 10} ${endY - (ROW_HEIGHT/2)} L ${endX - 10} ${endY} L ${endX} ${endY}`;
         
         const isCrit = criticalPath.has(fromTask.id) && criticalPath.has(toTask.id);

         return (
             <g key={dep.id} onClick={() => onDeleteDependency(dep.id)} className="cursor-pointer group">
                 {/* Invisible thick line for easier clicking */}
                 <path d={path} fill="none" stroke="transparent" strokeWidth="12" />
                 {/* Visible line */}
                 <path d={path} fill="none" stroke={isCrit ? "#ef4444" : "#cbd5e1"} strokeWidth="2" markerEnd="url(#arrowhead)" className="group-hover:stroke-blue-500" />
             </g>
         );
     });
  };

  const getTaskColor = (task: Task, isMilestone: boolean, isSummary: boolean, isCrit: boolean) => {
     if (!task.isActive) return '#e2e8f0';
     
     // Specific Status Colors
     if (task.status === 'Blocked') return '#ef4444'; // Red-500
     if (task.status === 'Completed') return '#22c55e'; // Green-500
     if (task.status === 'In Progress') return '#eab308'; // Yellow-500
     if (task.status === 'Not Started') return '#3b82f6'; // Blue-500
     
     // Fallback
     if (isSummary) return '#334155'; // Use dark slate only if status fails, though status should always exist
     return '#3b82f6';
  };

  const getTaskBorderColor = (task: Task, isMilestone: boolean, isSummary: boolean, isCrit: boolean) => {
      if (!task.isActive) return '#94a3b8';
      if (isCrit) return '#dc2626'; // Dark Red for critical path
      
      // Border matches status but darker
      if (task.status === 'Blocked') return '#b91c1c'; 
      if (task.status === 'Completed') return '#15803d'; 
      if (task.status === 'In Progress') return '#a16207'; 
      if (task.status === 'Not Started') return '#1d4ed8'; 
      
      if (isSummary) return '#0f172a';
      return '#3b82f6';
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden select-none bg-white">
      <div className="h-[40px] bg-white border-b border-gray-200 flex-shrink-0"></div>

      <div ref={headerRef} className="h-[50px] overflow-hidden bg-white border-b border-gray-200 flex-shrink-0 relative">
        <svg width={Math.max(chartWidth, 1000)} height={HEADER_HEIGHT}>
            {renderTimeAxis()}
        </svg>
      </div>

      <div 
        ref={ref} 
        className="flex-1 overflow-auto relative"
        onScroll={handleScroll}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg width={Math.max(chartWidth, 1000)} height={Math.max(tasks.length * ROW_HEIGHT, 1)}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>

          {renderGrid()}
          {renderDependencies()}
          {tempLine && (
              <line x1={tempLine.x1} y1={tempLine.y1} x2={tempLine.x2} y2={tempLine.y2} stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
          )}

          <g>
            {tasks.map((task, index) => {
              const x = dateToX(task.start);
              const w = Math.max(dateToX(task.end) - x, 4);
              const y = index * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2;
              const isMilestone = task.type === 'milestone';
              const isSummary = task.type === 'summary';
              const isCrit = criticalPath.has(task.id);
              
              const color = getTaskColor(task, isMilestone, isSummary, isCrit);
              const borderColor = getTaskBorderColor(task, isMilestone, isSummary, isCrit);

              return (
                <g key={task.id} className="group">
                  <rect 
                      x={0} 
                      y={index * ROW_HEIGHT} 
                      width={Math.max(chartWidth, 1000)} 
                      height={ROW_HEIGHT} 
                      fill={selectedTaskId === task.id ? "#eff6ff" : "transparent"} 
                      className="hover:fill-gray-50 transition-colors"
                  />

                  {isMilestone ? (
                      <g transform={`translate(${x}, ${y + BAR_HEIGHT/2})`}>
                           <polygon 
                              points="0,-10 10,0 0,10 -10,0" 
                              fill={color} 
                              stroke={borderColor}
                              strokeWidth={2}
                              onPointerDown={(e) => handlePointerDown(e, task, 'move')}
                              className="cursor-move"
                           />
                      </g>
                  ) : isSummary ? (
                      <g>
                           <rect
                              x={x}
                              y={y + 2}
                              width={w}
                              height={12}
                              fill={color}
                              className="cursor-move opacity-90"
                              onPointerDown={(e) => handlePointerDown(e, task, 'move')}
                          />
                           <polygon 
                              points={`${x},${y+2} ${x},${y+18} ${x+6},${y+18} ${x+6},${y+14} ${x+4},${y+14} ${x+4},${y+2}`}
                              fill={color}
                           />
                           <polygon 
                              points={`${x+w},${y+2} ${x+w},${y+18} ${x+w-6},${y+18} ${x+w-6},${y+14} ${x+w-4},${y+14} ${x+w-4},${y+2}`}
                              fill={color}
                           />
                      </g>
                  ) : (
                      <g>
                          <rect
                              x={x}
                              y={y}
                              width={w}
                              height={BAR_HEIGHT}
                              rx={4}
                              fill={color}
                              stroke={borderColor}
                              strokeWidth={1}
                              onPointerDown={(e) => handlePointerDown(e, task, 'move')}
                              className="cursor-move shadow-sm"
                          />
                          {task.progress > 0 && (
                              <rect
                                  x={x}
                                  y={y + BAR_HEIGHT - 4}
                                  width={w * (task.progress / 100)}
                                  height={4}
                                  rx={2}
                                  fill="rgba(0,0,0,0.2)"
                                  pointerEvents="none"
                              />
                          )}
                          <text x={x + w + 8} y={y + 14} fontSize="11" fill="#475569" pointerEvents="none">
                              {task.assignee !== 'Unassigned' ? `(${task.assignee})` : ''}
                          </text>

                          <rect 
                              x={x - 4} y={y} width={8} height={BAR_HEIGHT} 
                              fill="transparent" 
                              className="cursor-ew-resize hover:fill-blue-400 opacity-50"
                              onPointerDown={(e) => handlePointerDown(e, task, 'resize-left')}
                          />
                          <rect 
                              x={x + w - 4} y={y} width={8} height={BAR_HEIGHT} 
                              fill="transparent" 
                              className="cursor-ew-resize hover:fill-blue-400 opacity-50"
                              onPointerDown={(e) => handlePointerDown(e, task, 'resize-right')}
                          />
                          
                          <circle 
                              cx={x + w} cy={y + BAR_HEIGHT/2} r={4} 
                              fill="white" stroke={borderColor} 
                              className="opacity-0 group-hover:opacity-100 cursor-crosshair hover:fill-blue-500"
                              onPointerDown={(e) => handlePointerDown(e, task, 'create-link')}
                          />
                      </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
});

export default GanttChart;