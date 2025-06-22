import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, View, ScrollView } from 'react-native';
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

  return (
    <TouchableOpacity
      onPress={(e) => {
        // Prevent toggling if the delete button was pressed
        if ((e as any).deletePressed) return;
        onToggle(task.id);
      }}
      onLongPress={() => onEdit(task)}
      style={taskStyles}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>{task.name}</Text>
        <TouchableOpacity
          onPress={e => {
            // Mark the event so parent onPress knows not to toggle
            (e as any).deletePressed = true;
            e.stopPropagation?.();
            onDelete(task);
          }}
          style={{ marginLeft: 8, padding: 4 }}
          onPressOut={e => {
            // Mark the event so parent onPress knows not to toggle
            (e as any).deletePressed = true;
            e.stopPropagation?.();
          }}
        >
          <Text>❌</Text>
        </TouchableOpacity>
      </View>
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
