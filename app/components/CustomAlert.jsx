import { Ionicons } from '@expo/vector-icons';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const CustomAlert = ({ visible, type, title, message, onClose }) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#4CAF50', bgColor: '#E8F5E8' };
      case 'error':
        return { icon: 'close-circle', color: '#f44336', bgColor: '#FFEBEE' };
      case 'warning':
        return { icon: 'warning', color: '#FF9800', bgColor: '#FFF3E0' };
      default:
        return { icon: 'information-circle', color: '#2196F3', bgColor: '#E3F2FD' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: bgColor }]}>
          <View style={styles.alertHeader}>
            <Ionicons name={icon} size={24} color={color} />
            <Text style={[styles.alertTitle, { color }]}>{title}</Text>
          </View>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity
            style={[styles.alertButton, { backgroundColor: color }]}
            onPress={onClose}
          >
            <Text style={styles.alertButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  alertContainer: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 22,
  },
  alertButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;