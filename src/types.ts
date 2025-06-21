export interface Interval {
  start: number;
  end?: number;
}

export interface Task {
  id: string;
  name: string;
  intervals: Interval[];
  estimatedMinutes: number;
}

export type DailyTasks = Record<string, Task[]>;

export interface TimelineEntry {
  taskName: string;
  start: number;
  end: number;
  isIdle: boolean;
  exceeded?: boolean;
}
