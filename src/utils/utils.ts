import { Interval, Task, TimelineEntry, DailyTasks } from '../types';
import { IDLE_TASK_ID } from '../constants';

export const formatDuration = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const getDuration = (intervals: Interval[], now: number): number =>
  intervals.reduce((sum, { start, end }) => sum + ((end || now) - start), 0);

export const isTaskActive = (task: Task): boolean => {
  const last = task.intervals[task.intervals.length - 1];
  return last && !last.end;
};

export const getTimeline = (taskData: DailyTasks, selectedDate: string, now: number): TimelineEntry[] => {
  const dayTasks = taskData[selectedDate] || [];
  const entries: TimelineEntry[] = [];

  dayTasks.forEach(task => {
    const totalMs = getDuration(task.intervals, now);
    const exceeded = totalMs / 60000 > task.estimatedMinutes;

    task.intervals.forEach(({ start, end }) => {
      entries.push({
        taskName: task.name,
        start,
        end: end ?? now,
        isIdle: task.id === IDLE_TASK_ID,
        exceeded: task.id === IDLE_TASK_ID ? undefined : exceeded,
      });
    });
  });

  entries.sort((a, b) => a.start - b.start);
  return entries;
};

export const getTotalTrackedTime = (tasks: Task[], now: number): number => {
  const intervals: { start: number; end: number }[] = [];

  tasks.forEach(task => {
    task.intervals.forEach(({ start, end }) => {
      intervals.push({ start, end: end ?? now });
    });
  });

  intervals.sort((a, b) => a.start - b.start);
  const merged: typeof intervals = [];

  for (const curr of intervals) {
    if (!merged.length || curr.start > merged[merged.length - 1].end) {
      merged.push({ ...curr });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, curr.end);
    }
  }

  return merged.reduce((sum, { start, end }) => sum + (end - start), 0);
};

export const getTotalIdleTime = (taskData: DailyTasks, selectedDate: string, now: number): number => {
  const idleTask = taskData[selectedDate]?.find(t => t.id === IDLE_TASK_ID);
  return idleTask ? getDuration(idleTask.intervals, now) : 0;
};
