export type ViewMode = 'Month' | 'Quarter' | 'Year';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';

export interface Dependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: 'FinishToStart'; // Currently supporting FS
}

export interface Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number; // 0 to 100
  isActive: boolean;
  status: TaskStatus;
  assignee: string;
  type: 'task' | 'milestone' | 'summary';
  category: string; // The tab category
  description?: string;
  
  // Hierarchy fields
  parentId?: string;
  isExpanded?: boolean; // Only relevant for summary tasks
  isDescriptionExpanded?: boolean; // For UI toggle of description field
  depth: number; // 0 for root, 1 for child, etc.
}

export interface ProjectData {
  title: string;
  year: number;
  tasks: Task[];
  dependencies: Dependency[];
  teamMembers: string[];
  categories: string[];
}

export interface DragState {
  type: 'move' | 'resize-left' | 'resize-right' | 'create-link' | null;
  taskId: string | null;
  initialMouseX: number;
  initialDate?: Date;
  initialEndDate?: Date;
}

export const CATEGORIES = [
  "Responsible AI",
  "Governance",
  "Data Management",
  "Privacy",
  "Design",
  "Implementation",
  "Verification",
  "Operations"
] as const;

export type Category = string;