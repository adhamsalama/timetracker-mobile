import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { styles } from '../styles';
import { Task } from '../types';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (name: string, estimatedMinutes: number, tags: string[]) => void;
  mode: 'add' | 'edit';
  initialTask?: Task;
  onEditTask?: (id: string, name: string, estimatedMinutes: number, tags: string[]) => void;
  onDeleteTask?: (id: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onClose,
  onAddTask,
  mode,
  initialTask,
  onEditTask,
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Pre-fill form fields in edit mode
  React.useEffect(() => {
    if (visible && mode === 'edit' && initialTask) {
      setNewTaskName(initialTask.name);
      setEstimatedMinutes(initialTask.estimatedMinutes.toString());
      setTags(initialTask.tags || []);
      setTagInput('');
    } else if (visible && mode === 'add') {
      setNewTaskName('');
      setEstimatedMinutes('');
      setTags([]);
      setTagInput('');
    }
  }, [visible, mode, initialTask]);

  const handleSubmit = () => {
    if (!newTaskName || !estimatedMinutes) return;

    if (mode === 'edit' && onEditTask && initialTask) {
      onEditTask(initialTask.id, newTaskName, Number(estimatedMinutes), tags);
    } else {
      onAddTask(newTaskName, Number(estimatedMinutes), tags);
    }
    setNewTaskName('');
    setEstimatedMinutes('');
    setTagInput('');
    setTags([]);
    onClose();
  };

  const handleClose = () => {
    setNewTaskName('');
    setEstimatedMinutes('');
    setTagInput('');
    setTags([]);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {mode === 'edit' ? 'Edit Task' : 'New Task'}
          </Text>
          <TextInput
            placeholder="Task name"
            placeholderTextColor={'#888'}
            value={newTaskName}
            onChangeText={setNewTaskName}
            style={styles.input}
          />
          <TextInput
            placeholder="Estimated minutes"
            placeholderTextColor={'#888'}
            value={estimatedMinutes}
            onChangeText={setEstimatedMinutes}
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <TextInput
              placeholder="Add tag"
              placeholderTextColor={'#888'}
              value={tagInput}
              onChangeText={setTagInput}
              style={[styles.input, { flex: 1, marginRight: 10, marginBottom: 0 }]}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity onPress={addTag} style={[styles.button, { paddingHorizontal: 15 }]}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ maxHeight: 50, marginBottom: 10 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => removeTag(tag)}
                  style={{
                    backgroundColor: '#e0e0e0',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 15,
                    marginRight: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, marginRight: 5 }}>{tag}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>
              {mode === 'edit' ? 'Save' : 'Add'}
            </Text>
          </TouchableOpacity>
          {mode === 'edit' && onDeleteTask && initialTask && (
            <TouchableOpacity
              onPress={() => {
                // Confirm before deleting
                // (You can use Alert if you want a confirmation dialog)
                // For now, just call onDeleteTask
                // If you want a confirmation, uncomment the Alert below
                /*
                Alert.alert(
                  'Delete Task',
                  `Are you sure you want to delete "${initialTask.name}"?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => { onDeleteTask(initialTask.id); handleClose(); } },
                  ]
                );
                */
                onDeleteTask(initialTask.id);
                handleClose();
              }}
              style={[styles.button, { backgroundColor: '#dc3545', marginTop: 10 }]}
            >
              <Text style={styles.buttonText}>Delete Task</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TaskModal;
