import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, View, ScrollView, Alert } from 'react-native';
import { Task } from '../types';
import { getDuration, isTaskActive, formatDuration } from '../utils/utils';
import { styles } from '../styles';

interface TaskCardProps {
  task: Task;
  now: number;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, now, onToggle, onEdit, onDelete }) => {
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

  // Calculate percentage of time left (if not exceeded)
  let fillPercent = 0;
  if (task.estimatedMinutes > 0 && durationMin < task.estimatedMinutes) {
    fillPercent = Math.max(0, 1 - durationMin / task.estimatedMinutes);
  }

  // Compute background fill color (darker green for more time left)
  const fillColor = fillPercent > 0
    ? `rgba(0,100,0,${0.15 + 0.45 * fillPercent})`
    : undefined;

  const handleLongPress = () => {
    onEdit(task);
  };

  return (
    <TouchableOpacity
      onPress={() => onToggle(task.id)}
      onLongPress={handleLongPress}
      style={taskStyles}
      activeOpacity={0.8}
    >
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, zIndex: 0, flexDirection: 'row' }}>
        {fillPercent > 0 && (
          <View
            style={{
              height: '100%',
              width: `${Math.round(fillPercent * 100)}%`,
              backgroundColor: fillColor,
            }}
          />
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
        <Text style={{ fontWeight: 'bold' }}>{task.name}</Text>
      </View>
      <Text style={{ zIndex: 1 }}>{formatDuration(durationMs)} / {task.estimatedMinutes} min</Text>
      <Text style={{ zIndex: 1 }}>{active ? 'Active' : 'Paused'}</Text>

      {task.tags && task.tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8, zIndex: 1 }}
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
