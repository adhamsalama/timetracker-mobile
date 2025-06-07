import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Interval {
  start: number;
  end?: number;
}

interface Task {
  id: string;
  name: string;
  intervals: Interval[];
  estimatedMinutes: number;
}

interface TimelineEntry {
  taskName: string;
  start: number;
  end: number;
  isIdle: boolean;
  exceeded?: boolean;
}

const IDLE_TASK_ID = '__idle__';
const getTodayDate = () => new Date().toISOString().split('T')[0];

const TaskTracker = () => {
  const [taskData, setTaskData] = useState<Record<string, Task[]>>({});
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [now, setNow] = useState(Date.now());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const stored = global?.localStorage?.getItem('taskData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed[selectedDate]?.some((t: Task) => t.id === IDLE_TASK_ID)) {
          parsed[selectedDate] = [
            ...(parsed[selectedDate] || []),
            { id: IDLE_TASK_ID, name: 'Idle', intervals: [], estimatedMinutes: 0 },
          ];
        }
        setTaskData(parsed);
      } catch { }
    }
  }, []);

  useEffect(() => {
    if (!taskData[selectedDate]?.some((t) => t.id === IDLE_TASK_ID)) {
      setTaskData((prev) => ({
        ...prev,
        [selectedDate]: [
          ...(prev[selectedDate] || []),
          { id: IDLE_TASK_ID, name: 'Idle', intervals: [], estimatedMinutes: 0 },
        ],
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (Object.keys(taskData).length) {
      global?.localStorage?.setItem('taskData', JSON.stringify(taskData));
    }
  }, [taskData]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const tasks = taskData[selectedDate]?.filter((t) => t.id !== IDLE_TASK_ID) || [];

  const addTask = () => {
    Alert.prompt('Task name?', undefined, (name) => {
      if (!name) return Alert.alert('No name!');
      Alert.prompt('Estimated time (minutes)?', undefined, (estStr) => {
        const estimatedMinutes = parseInt(estStr || '', 10);
        if (isNaN(estimatedMinutes) || estimatedMinutes <= 0) {
          return Alert.alert('Invalid estimate!');
        }
        const newTask: Task = {
          id: Math.random().toString(36),
          name,
          intervals: [],
          estimatedMinutes,
        };
        setTaskData((prev) => ({
          ...prev,
          [selectedDate]: [...(prev[selectedDate] || []), newTask],
        }));
      });
    });
  };

  const toggleTask = (taskId: string) => {
    const nowTime = Date.now();
    setTaskData((prev) => {
      const dayTasks = prev[selectedDate] || [];
      const idleTask = dayTasks.find((t) => t.id === IDLE_TASK_ID)!;
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
      } else if (!isIdleRunning && !toggledActive && !newTasks.some((t) => {
        const last = t.intervals[t.intervals.length - 1];
        return last && !last.end && t.id !== IDLE_TASK_ID;
      })) {
        idleTask.intervals.push({ start: nowTime });
      }
      return {
        ...prev,
        [selectedDate]: [...newTasks.filter((t) => t.id !== IDLE_TASK_ID), idleTask],
      };
    });
  };

  const getDuration = (intervals: Interval[]) =>
    intervals.reduce((sum, { start, end }) => sum + ((end || now) - start), 0);

  const isActive = (task: Task) => {
    const last = task.intervals[task.intervals.length - 1];
    return last && !last.end;
  };

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return h > 0
      ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTimeline = (): TimelineEntry[] => {
    const dayTasks = taskData[selectedDate] || [];
    const entries: TimelineEntry[] = [];
    dayTasks.forEach((task) => {
      const totalMs = getDuration(task.intervals);
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🕒 Task Time Tracker</Text>
      <Button title="Add Task" onPress={addTask} />
      <Text>Active: {tasks.filter(isActive).length}</Text>
      <Text>Total Tracked: {formatDuration(tasks.reduce((sum, t) => sum + getDuration(t.intervals), 0))}</Text>
      <Text>Idle Time: {formatDuration(getDuration(taskData[selectedDate]?.find(t => t.id === IDLE_TASK_ID)?.intervals || []))}</Text>

      <Text>Select Date:</Text>
      <Button title={selectedDate} onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={new Date(selectedDate)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(_, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (date) setSelectedDate(date.toISOString().split('T')[0]);
          }}
        />
      )}

      {tasks.map((task) => (
        <TouchableOpacity key={task.id} onPress={() => toggleTask(task.id)} style={styles.card}>
          <Text style={styles.taskTitle}>{task.name}</Text>
          <Text>{formatDuration(getDuration(task.intervals))} / {task.estimatedMinutes} min</Text>
          <Text>{isActive(task) ? 'Active' : 'Paused'}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.timelineTitle}>📊 Timeline</Text>
      {getTimeline().map((item, i) => (
        <TouchableOpacity key={i} style={styles.timelineItem} onPress={() => {
          const task = tasks.find((t) => t.name === item.taskName);
          if (task) toggleTask(task.id);
        }}>
          <Text style={{ fontWeight: 'bold' }}>{item.taskName}</Text>
          <Text>{new Date(item.start).toLocaleTimeString()} – {new Date(item.end).toLocaleTimeString()}</Text>
          <Text>{formatDuration(item.end - item.start)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timelineTitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  timelineItem: {
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    marginBottom: 8,
  },
});

export default TaskTracker;
