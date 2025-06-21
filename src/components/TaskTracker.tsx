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
  formatDuration
} from '../utils/utils';
import { styles } from '../styles';
import { useTaskLogic } from '../hooks/useTasksLogic'
import TaskModal from './TaskModal';
import TaskCard from './TaskCard';
import Timeline from './Timeline';

const TaskTracker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [now, setNow] = useState(Date.now());
  const [modalVisible, setModalVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const {
    taskData,
    tasks,
    isAutoIdleDisabled,
    setIsAutoIdleDisabled,
    addTask,
    toggleTask,
    clearDayTasks,
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

  const timeline = getTimeline(taskData, selectedDate, now);
  const totalTrackedTime = getTotalTrackedTime(tasks, now);
  const totalIdleTime = getTotalIdleTime(taskData, selectedDate, now);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 50 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
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
              onPress={() => setModalVisible(true)}
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
          </>
        )}

        <Text style={[styles.badge, styles.badgeInfo]}>
          Total Active Time: {formatDuration(totalTrackedTime)}
        </Text>

        <Text style={[styles.badge, styles.badgeWarning]}>
          Total Idle Time: {formatDuration(totalIdleTime)}
        </Text>

        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            now={now}
            onToggle={toggleTask}
          />
        ))}

        <Timeline entries={timeline} />
      </ScrollView>

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddTask={addTask}
      />
    </SafeAreaView>
  );
};

export default TaskTracker;
