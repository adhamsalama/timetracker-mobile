import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { styles } from '../styles';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (name: string, estimatedMinutes: number) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, onAddTask }) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');

  const handleAddTask = () => {
    if (!newTaskName || !estimatedMinutes) return;

    onAddTask(newTaskName, Number(estimatedMinutes));
    setNewTaskName('');
    setEstimatedMinutes('');
    onClose();
  };

  const handleClose = () => {
    setNewTaskName('');
    setEstimatedMinutes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
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
          <TouchableOpacity onPress={handleAddTask} style={styles.button}>
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TaskModal;
