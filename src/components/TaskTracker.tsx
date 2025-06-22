import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { getTodayDate } from '../constants';
import {
  getTimeline,
  getTotalTrackedTime,
  getTotalIdleTime,
  formatDuration,
  getAllTags,
  filterTasksByTag,
  getTotalTimeForTag
} from '../utils/utils';
import { styles } from '../styles';
import { useTaskLogic } from '../hooks/useTasksLogic';
import TaskModal from './TaskModal';
import TaskCard from './TaskCard';
import Timeline from './Timeline';
import TagFilter from './TagsFilter';
import { DailyTasks, Task } from '../types';

function confirmDeleteTask(taskName: string, onConfirm: () => void) {
  Alert.alert(
    'Delete Task',
    `Are you sure you want to delete "${taskName}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]
  );
}

const TaskTracker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [now, setNow] = useState(Date.now());
  const [modalVisible, setModalVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    taskData,
    tasks,
    isAutoIdleDisabled,
    setIsAutoIdleDisabled,
    addTask,
    toggleTask,
    clearDayTasks,
    editTask, // <-- new function from useTaskLogic
    deleteTask, // <-- new function from useTaskLogic
  } = useTaskLogic(selectedDate);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: new Date(selectedDate),
      mode: 'date',
      is24Hour: true,
      onChange: (_, date) => {
        if (date) {
          setSelectedDate(date.toISOString().split('T')[0]);
        }
      },
    });
  };

  const handleClearDay = () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to clear the day\'s tasks?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: clearDayTasks },
      ]
    );
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleDeleteTask = (task: Task) => {
    confirmDeleteTask(task.name, () => deleteTask(task.id));
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingTask(null);
  };

  const handleEditTaskSubmit = (id: string, name: string, estimatedMinutes: number, tags: string[]) => {
    editTask(id, name, estimatedMinutes, tags);
    setModalVisible(false);
    setEditingTask(null);
  };

  const filteredTasks = filterTasksByTag(tasks, selectedTag);

  // Filter the taskData object by tag
  const filteredTaskData: DailyTasks = selectedTag === null
    ? taskData
    : Object.keys(taskData).reduce((acc, date) => {
      const tasksForDate = taskData[date];
      const filteredTasksForDate = tasksForDate.filter((task: Task) =>
        task.tags && task.tags.includes(selectedTag)
      );
      if (filteredTasksForDate.length > 0) {
        acc[date] = filteredTasksForDate;
      }
      return acc;
    }, {} as DailyTasks);

  // Use filtered data for timeline
  const timeline = getTimeline(filteredTaskData, selectedDate, now);
  const totalTrackedTime = getTotalTrackedTime(tasks, now);
  const totalIdleTime = getTotalIdleTime(taskData, selectedDate, now);
  const allTags = getAllTags(tasks);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 50 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: "center" }}>
          🕒 Task Time Tracker
        </Text>

        <TouchableOpacity
          onPress={() => setShowControls(!showControls)}
          style={[styles.button, { backgroundColor: '#6c757d' }]}
        >
          <Text style={styles.buttonText}>
            {showControls ? '🙈 Hide Controls' : '👀 Show Controls'}
          </Text>
        </TouchableOpacity>

        {showControls && (
          <>
            <TouchableOpacity
              onPress={() => { setModalVisible(true); setEditingTask(null); }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>➕ Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsAutoIdleDisabled(!isAutoIdleDisabled)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                Auto Idle tracking: {isAutoIdleDisabled ? "No" : "Yes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={showDatepicker} style={styles.button}>
              <Text style={styles.buttonText}>📅 {selectedDate}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearDay}
              style={[styles.button, { backgroundColor: '#dc3545' }]}
            >
              <Text style={styles.buttonText}>🗑️ Clear Day</Text>
            </TouchableOpacity>

            <TagFilter
              allTags={allTags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
              tasks={tasks} // Pass all tasks for time calculation
              now={now}
              getTotalTimeForTag={getTotalTimeForTag}
            />
          </>
        )}

        <Text style={[styles.badge, styles.badgeInfo]}>
          Total Active Time: {formatDuration(totalTrackedTime)}
        </Text>

        <Text style={[styles.badge, styles.badgeWarning]}>
          Total Idle Time: {formatDuration(totalIdleTime)}
        </Text>

        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            now={now}
            onToggle={toggleTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        ))}

        <Timeline entries={timeline} />
      </ScrollView>

      <TaskModal
        visible={modalVisible}
        onClose={handleModalClose}
        onAddTask={addTask}
        mode={editingTask ? "edit" : "add"}
        initialTask={editingTask || undefined}
        onEditTask={handleEditTaskSubmit}
        onDeleteTask={(id: string) => {
          const task = tasks.find(t => t.id === id);
          if (task) {
            confirmDeleteTask(task.name, () => deleteTask(id));
          }
        }}
      />
    </SafeAreaView>
  );
};

export default TaskTracker;
