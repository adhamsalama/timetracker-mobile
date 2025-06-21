import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle } from 'react-native';
import { Task } from '../types';
import { getDuration, isTaskActive, formatDuration } from '../utils/utils';
import { styles } from '../styles';

interface TaskCardProps {
  task: Task;
  now: number;
  onToggle: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, now, onToggle }) => {
  const active = isTaskActive(task);
  const durationMs = getDuration(task.intervals, now);
  const durationMin = durationMs / 60000;
  const exceeded = durationMin > task.estimatedMinutes;

  const taskStyles: StyleProp<ViewStyle> = [styles.taskCard];

  if (active && exceeded) {
    taskStyles.push(styles.exceedingActiveTask);
  } else if (active) {
    taskStyles.push(styles.nonExceedingActiveTask);
  } else if (exceeded) {
    taskStyles.push(styles.nonActiveTaskExceeded);
  } else {
    taskStyles.push(styles.nonActiveTask);
  }

  return (
    <TouchableOpacity
      onPress={() => onToggle(task.id)}
      style={taskStyles}
    >
      <Text style={{ fontWeight: 'bold' }}>{task.name}</Text>
      <Text>{formatDuration(durationMs)} / {task.estimatedMinutes} min</Text>
      <Text>{active ? 'Active' : 'Paused'}</Text>
    </TouchableOpacity>
  );
};

export default TaskCard;
