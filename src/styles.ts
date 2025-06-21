import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
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
  nonExceedingActiveTask: {
    borderWidth: 4, borderColor: 'green',
  },
  exceedingActiveTask: {
    borderWidth: 4, borderColor: 'red',
  },
  nonActiveTaskExceeded: {
    borderLeftWidth: 4, borderLeftColor: 'red',
  },
  nonActiveTask: {
    borderLeftWidth: 4, borderLeftColor: 'green',
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
    backgroundColor: '#28a745',
    color: '#fff',
  },
  badgeInfo: {
    backgroundColor: '#17a2b8',
    color: '#000',
    textAlign: 'center',
  },
  badgeWarning: {
    backgroundColor: '#ffc107',
    color: '#000',
    textAlign: 'center',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
    marginVertical: 5,
  },
});
