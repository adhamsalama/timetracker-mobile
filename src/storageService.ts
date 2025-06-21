import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyTasks } from './types';
import { IDLE_TASK_ID } from './constants';

export const loadTaskData = async (): Promise<DailyTasks> => {
  try {
    const stored = await AsyncStorage.getItem('taskData');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading task data:', error);
  }
  return {};
};

export const saveTaskData = async (taskData: DailyTasks): Promise<void> => {
  try {
    await AsyncStorage.setItem('taskData', JSON.stringify(taskData));
  } catch (error) {
    console.error('Error saving task data:', error);
  }
};

export const ensureIdleTaskExists = (taskData: DailyTasks, selectedDate: string): DailyTasks => {
  if (!taskData[selectedDate]?.some(t => t.id === IDLE_TASK_ID)) {
    return {
      ...taskData,
      [selectedDate]: [
        ...(taskData[selectedDate] || []),
        {
          id: IDLE_TASK_ID,
          name: 'Idle',
          intervals: [],
          estimatedMinutes: 0,
          tags: [],
        },
      ],
    };
  }
  return taskData;
};
