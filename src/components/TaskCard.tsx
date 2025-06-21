import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, View, ScrollView } from 'react-native';
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

      {task.tags && task.tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
        >
          <View style={{ flexDirection: 'row' }}>
            {task.tags.map((tag, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#007bff',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginRight: 6,
                }}
              >
                <Text style={{ color: 'white', fontSize: 10 }}>{tag}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </TouchableOpacity>
  );
};

export default TaskCard;
