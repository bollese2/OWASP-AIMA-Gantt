import { Task, Dependency, TaskStatus } from './types';

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const diffDays = (d1: Date, d2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((d1.getTime() - d2.getTime()) / oneDay);
};

// Returns tasks that should be visible in the Gantt chart
export const getVisibleTasks = (tasks: Task[]): Task[] => {
  const visibleTasks: Task[] = [];
  const hiddenParentIds = new Set<string>();

  for (const task of tasks) {
    if (task.parentId && hiddenParentIds.has(task.parentId)) {
      hiddenParentIds.add(task.id);
      continue;
    }

    visibleTasks.push(task);

    if (task.type === 'summary' && !task.isExpanded) {
      hiddenParentIds.add(task.id);
    }
  }

  return visibleTasks;
};

export const calculateCriticalPath = (tasks: Task[], dependencies: Dependency[]): Set<string> => {
  const criticalPathIds = new Set<string>();
  
  const adj: Record<string, string[]> = {};
  const reverseAdj: Record<string, string[]> = {};
  const taskMap = new Map<string, Task>();

  tasks.forEach(t => {
    taskMap.set(t.id, t);
    adj[t.id] = [];
    reverseAdj[t.id] = [];
  });

  dependencies.forEach(d => {
    if (adj[d.fromTaskId]) adj[d.fromTaskId].push(d.toTaskId);
    if (reverseAdj[d.toTaskId]) reverseAdj[d.toTaskId].push(d.fromTaskId);
  });

  let maxEndDate = 0;
  let endTaskId = '';

  tasks.forEach(t => {
    if (!t.isActive || t.type === 'summary') return; 
    if (t.end.getTime() > maxEndDate) {
      maxEndDate = t.end.getTime();
      endTaskId = t.id;
    }
  });

  if (!endTaskId) return criticalPathIds;

  const visited = new Set<string>();
  const queue = [endTaskId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    criticalPathIds.add(currentId);

    const parents = reverseAdj[currentId] || [];
    const currentTask = taskMap.get(currentId);
    
    if (!currentTask) continue;

    parents.forEach(parentId => {
      const parentTask = taskMap.get(parentId);
      if (parentTask && parentTask.isActive && parentTask.type !== 'summary') {
         const gap = currentTask.start.getTime() - parentTask.end.getTime();
         if (gap < (24 * 60 * 60 * 1000) + 1000) { 
           queue.push(parentId);
         }
      }
    });
  }

  return criticalPathIds;
};

// Recalculates start/end dates and status for summary tasks based on their children
export const recalculateParentDates = (tasks: Task[]): Task[] => {
  // Create a deep clone to avoid mutation side-effects during calculation
  const taskMap = new Map<string, Task>();
  tasks.forEach(t => taskMap.set(t.id, { ...t }));

  const parentToChildren = new Map<string, string[]>();
  tasks.forEach(t => {
    if (t.parentId) {
      if (!parentToChildren.has(t.parentId)) parentToChildren.set(t.parentId, []);
      parentToChildren.get(t.parentId)!.push(t.id);
    }
  });

  let maxDepth = 0;
  tasks.forEach(t => maxDepth = Math.max(maxDepth, t.depth));

  // Iterate from bottom up
  for (let d = maxDepth - 1; d >= 0; d--) {
    const tasksAtDepth = Array.from(taskMap.values()).filter(t => t.depth === d && t.type === 'summary');
    tasksAtDepth.forEach(parent => {
       const childrenIds = parentToChildren.get(parent.id);
       if (childrenIds && childrenIds.length > 0) {
         let minStart: number | null = null;
         let maxEnd: number | null = null;
         
         const children = childrenIds.map(childId => taskMap.get(childId)!);
         const activeChildren = children.filter(c => c.isActive);

         // 1. Calculate Dates (based on active children, or all if none active? Usually active)
         if (activeChildren.length > 0) {
             activeChildren.forEach(child => {
                const childStart = new Date(child.start).getTime();
                const childEnd = new Date(child.end).getTime();
                if (minStart === null || childStart < minStart) minStart = childStart;
                if (maxEnd === null || childEnd > maxEnd) maxEnd = childEnd;
             });
         } else {
             // If all inactive, we might still want dates to encompass inactive tasks or keep existing
             // Let's encompass all tasks if none are active
             children.forEach(child => {
                const childStart = new Date(child.start).getTime();
                const childEnd = new Date(child.end).getTime();
                if (minStart === null || childStart < minStart) minStart = childStart;
                if (maxEnd === null || childEnd > maxEnd) maxEnd = childEnd;
             });
         }

         const p = taskMap.get(parent.id)!;
         if (minStart !== null && maxEnd !== null) {
           p.start = new Date(minStart);
           p.end = new Date(maxEnd);
         }

         // 2. Calculate Status & Activity
         // Rule: "if all subordinate task bars are gray, then the superior task bar is gray."
         if (activeChildren.length === 0) {
             p.isActive = false;
         } else {
             p.isActive = true;
             // Priority: Red > Green > Blue
             // We can use a set to check presence
             const statuses = new Set(activeChildren.map(c => c.status));
             
             if (statuses.has('Blocked')) {
                 p.status = 'Blocked';
             } else if (statuses.has('Completed')) {
                 p.status = 'Completed';
             } else if (statuses.has('Not Started')) {
                 p.status = 'Not Started';
             } else {
                 p.status = 'In Progress'; // Fallback (e.g. only Yellows)
             }
         }
       }
    });
  }

  // Return list preserving original order
  return tasks.map(t => taskMap.get(t.id)!);
};

// Helper to find the index range of a task and its descendants in a flat list
// Useful for moving "folders" of tasks together
export const getTaskBlockRange = (tasks: Task[], startIndex: number): { start: number, end: number } => {
    if (startIndex < 0 || startIndex >= tasks.length) return { start: -1, end: -1 };
    
    const rootTask = tasks[startIndex];
    let endIndex = startIndex;
    
    // Scan forward until we find a task with depth <= rootTask.depth
    for (let i = startIndex + 1; i < tasks.length; i++) {
        if (tasks[i].depth > rootTask.depth) {
            endIndex = i;
        } else {
            break;
        }
    }
    return { start: startIndex, end: endIndex };
};