import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type DailyTasks = Record<string, Task[]>;

interface TimelineEntry {
  taskName: string;
  start: number;
  end: number;
  isIdle: boolean;
  exceeded?: boolean;
}

const IDLE_TASK_ID = '__idle__';
const getTodayDate = () => new Date().toISOString().split('T')[0];

const TaskTracker: React.FC = () => {
  const [taskData, setTaskData] = useState<DailyTasks>({});
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [now, setNow] = useState(Date.now());
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('taskData').then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            if (!parsed[selectedDate]?.some((t: Task) => t.id === IDLE_TASK_ID)) {
              parsed[selectedDate] = [
                ...(parsed[selectedDate] || []),
                {
                  id: IDLE_TASK_ID,
                  name: 'Idle',
                  intervals: [],
                  estimatedMinutes: 0,
                },
              ];
            }
            setTaskData(parsed);
          }
        } catch { }
      }
    });
  }, []);

  useEffect(() => {
    if (!taskData[selectedDate]?.some(t => t.id === IDLE_TASK_ID)) {
      setTaskData(prev => ({
        ...prev,
        [selectedDate]: [
          ...(prev[selectedDate] || []),
          {
            id: IDLE_TASK_ID,
            name: 'Idle',
            intervals: [],
            estimatedMinutes: 0,
          },
        ],
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!Object.keys(taskData).length) return;
    AsyncStorage.setItem('taskData', JSON.stringify(taskData));
  }, [taskData]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const tasks = taskData[selectedDate]?.filter(t => t.id !== IDLE_TASK_ID) || [];

  const addTask = (name: string, estimate: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name,
      intervals: [],
      estimatedMinutes: estimate,
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
      } else if (!isIdleRunning && !toggledActive && !newTasks.some(t => {
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
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTimeline = (): TimelineEntry[] => {
    const dayTasks = taskData[selectedDate] || [];
    const entries: TimelineEntry[] = [];

    dayTasks.forEach(task => {
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

  const getTotalTrackedTime = (): number => {
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

  const getTotalIdleTime = (): number => {
    const idleTask = taskData[selectedDate]?.find(t => t.id === IDLE_TASK_ID);
    return idleTask ? getDuration(idleTask.intervals) : 0;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          🕒 Task Time Tracker
        </Text>

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
          <Text style={styles.buttonText}>➕ Add Task</Text>
        </TouchableOpacity>

        {tasks.map(task => {
          const active = isActive(task);
          const durationMs = getDuration(task.intervals);
          const durationMin = durationMs / 60000;
          const exceeded = durationMin > task.estimatedMinutes;
          return (
            <TouchableOpacity
              key={task.id}
              onPress={() => toggleTask(task.id)}
              style={[styles.taskCard, exceeded ? styles.taskExceeded : active ? styles.taskActive : null]}
            >
              <Text style={{ fontWeight: 'bold' }}>{task.name}</Text>
              <Text>{formatDuration(durationMs)} / {task.estimatedMinutes} min</Text>
              <Text>{active ? 'Active' : 'Paused'}</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={{ fontSize: 18, marginVertical: 16 }}>📊 Timeline</Text>
        {getTimeline().map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.timelineItem, item.isIdle ? styles.timelineIdle : styles.timelineActive]}
            onPress={() => {
              const task = tasks.find(t => t.name === item.taskName);
              if (task) toggleTask(task.id);
            }}
          >
            <View>
              <Text style={{ fontWeight: 'bold' }}>{item.taskName}</Text>
              <Text style={{ fontSize: 12 }}>
                {new Date(item.start).toLocaleTimeString()} – {new Date(item.end).toLocaleTimeString()}
              </Text>
            </View>
            <Text
              style={[styles.timelineBadge, item.isIdle
                ? styles.badgeIdle
                : item.exceeded
                  ? styles.badgeExceeded
                  : styles.badgeNormal]}
            >
              {formatDuration(item.end - item.start)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TextInput
              placeholder="Task name"
              value={newTaskName}
              onChangeText={setNewTaskName}
              style={styles.input}
            />
            <TextInput
              placeholder="Estimated minutes"
              value={estimatedMinutes}
              onChangeText={setEstimatedMinutes}
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => {
                if (!newTaskName || !estimatedMinutes) return;
                addTask(newTaskName, Number(estimatedMinutes));
                setNewTaskName('');
                setEstimatedMinutes('');
                setModalVisible(false);
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: { color: 'white', textAlign: 'center' },
  modalContainer: {
    flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginBottom: 10,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    color: 'red', textAlign: 'center',
  },
  taskCard: {
    padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 10,
  },
  taskActive: {
    borderLeftWidth: 4, borderLeftColor: 'green',
  },
  taskExceeded: {
    borderLeftWidth: 4, borderLeftColor: 'red',
  },
  timelineItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 10, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8,
    borderWidth: 1, borderColor: '#ccc',
  },
  timelineActive: {
    borderLeftWidth: 4, borderLeftColor: '#0dcaf0',
  },
  timelineIdle: {
    borderLeftWidth: 4, borderLeftColor: '#ffc107',
  },
  timelineBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  badgeIdle: {
    backgroundColor: '#ffc107',
    color: '#000',
  },
  badgeExceeded: {
    backgroundColor: '#dc3545',
    color: '#fff',
  },
  badgeNormal: {
    backgroundColor: '#0dcaf0',
    color: '#000',
  },
});

export default TaskTracker;
