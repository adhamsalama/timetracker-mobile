import { useState, useEffect } from 'react';
import { Task, DailyTasks } from '../types';
import { IDLE_TASK_ID } from '../constants';
import { loadTaskData, saveTaskData, ensureIdleTaskExists } from '../storageService';

export const useTaskLogic = (selectedDate: string) => {
  const [taskData, setTaskData] = useState<DailyTasks>({});
  const [isAutoIdleDisabled, setIsAutoIdleDisabled] = useState(false);

  // Load data from AsyncStorage
  useEffect(() => {
    loadTaskData().then(data => {
      const dataWithIdle = ensureIdleTaskExists(data, selectedDate);
      setTaskData(dataWithIdle);
    });
  }, [selectedDate]);

  // Ensure idle task exists when date changes
  useEffect(() => {
    setTaskData(prev => ensureIdleTaskExists(prev, selectedDate));
  }, [selectedDate]);

  // Save data to AsyncStorage
  useEffect(() => {
    if (Object.keys(taskData).length > 0) {
      saveTaskData(taskData);
    }
  }, [taskData]);

  const addTask = (name: string, estimate: number, tags: string[] = []) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name,
      intervals: [],
      estimatedMinutes: estimate,
      tags,
    };

    setTaskData(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newTask],
    }));
  };

  const toggleTask = (taskId: string) => {
    const nowTime = Date.now();
    setTaskData(prev => {
      const dayTasks = prev[selectedDate] || [];
      const idleTask = dayTasks.find(t => t.id === IDLE_TASK_ID)!;
      const newTasks: Task[] = [];
      let toggledActive = false;

      for (const task of dayTasks) {
        const last = task.intervals[task.intervals.length - 1];
        const isTarget = task.id === taskId;

        if (last && !last.end) {
          newTasks.push({
            ...task,
            intervals: [...task.intervals.slice(0, -1), { ...last, end: nowTime }],
          });
        } else if (isTarget) {
          newTasks.push({
            ...task,
            intervals: [...task.intervals, { start: nowTime }],
          });
          toggledActive = true;
        } else {
          newTasks.push(task);
        }
      }

      const idleLast = idleTask.intervals[idleTask.intervals.length - 1];
      const isIdleRunning = idleLast && !idleLast.end;

      if (isIdleRunning && toggledActive) {
        idleTask.intervals[idleTask.intervals.length - 1].end = nowTime;
      } else if (!isIdleRunning && !toggledActive && !isAutoIdleDisabled && !newTasks.some(t => {
        const last = t.intervals[t.intervals.length - 1];
        return last && !last.end && t.id !== IDLE_TASK_ID;
      })) {
        idleTask.intervals.push({ start: nowTime });
      }

      return {
        ...prev,
        [selectedDate]: [...newTasks.filter(t => t.id !== IDLE_TASK_ID), idleTask],
      };
    });
  };

  const clearDayTasks = () => {
    setTaskData(prev => ({
      ...prev,
      [selectedDate]: [],
    }));
  };

  const editTask = (id: string, name: string, estimatedMinutes: number, tags: string[]) => {
    setTaskData(prev => {
      const dayTasks = prev[selectedDate] || [];
      const updatedTasks = dayTasks.map(task =>
        task.id === id
          ? { ...task, name, estimatedMinutes, tags }
          : task
      );
      return {
        ...prev,
        [selectedDate]: updatedTasks,
      };
    });
  };

  const tasks = taskData[selectedDate]?.filter(t => t.id !== IDLE_TASK_ID) || [];

  const deleteTask = (id: string) => {
    setTaskData(prev => {
      const dayTasks = prev[selectedDate] || [];
      const updatedTasks = dayTasks.filter(task => task.id !== id);
      return {
        ...prev,
        [selectedDate]: updatedTasks,
      };
    });
  };

  return {
    taskData,
    tasks,
    isAutoIdleDisabled,
    setIsAutoIdleDisabled,
    addTask,
    toggleTask,
    clearDayTasks,
    editTask,
    deleteTask,
  };
};
