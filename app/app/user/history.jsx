import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CustomAlert from '../../components/CustomAlert';
import { API_URL } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function History() {
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [completeFormData, setCompleteFormData] = useState({
    endMileage: '',
    notes: ''
  });
  const [statusFilter, setStatusFilter] = useState('');
  const { token } = useAuth();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  useEffect(() => {
    loadUserUsages();
  }, [statusFilter]);

  const loadUserUsages = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/user/usage/history`;
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsages(data);
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudieron cargar los registros de uso');
    } finally {
      setLoading(false);
    }
  };

  const openCompleteModal = (usage) => {
    setSelectedUsage(usage);
    setCompleteFormData({
      endMileage: '',
      notes: usage.notes || ''
    });
    setCompleteModalVisible(true);
  };

  const handleCompleteUsage = async () => {
    if (!completeFormData.endMileage) {
      showAlert('warning', 'Validación', 'Por favor ingresa el kilometraje final');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch(`${API_URL}/user/usage/${selectedUsage.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endMileage: completeFormData.endMileage,
          notes: completeFormData.notes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCompleteModalVisible(false);
        setCompleteFormData({ endMileage: '', notes: '' });
        loadUserUsages();
        showAlert('success', 'Éxito', 'Uso completado correctamente');
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo completar el uso del vehículo');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return '#FF9800';
      case 'completado': return '#4CAF50';
      default: return '#8e8e93';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'activo': return 'En Curso';
      case 'completado': return 'Completado';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!endDate) return 'En curso';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const UsageCard = ({ usage }) => (
    <View style={styles.usageCard}>
      <View style={styles.usageHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehiclePlate}>{usage.Vehicle.plate}</Text>
          <Text style={styles.vehicleModel}>{usage.Vehicle.brand} {usage.Vehicle.model}</Text>
          <Text style={styles.vehicleDetails}>{usage.Vehicle.color}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(usage.status) }]}>
          <Text style={styles.statusText}>{getStatusText(usage.status)}</Text>
        </View>
      </View>

      <View style={styles.usageDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="play" size={14} color="#8e8e93" />
            <Text style={styles.detailLabel}>Inicio:</Text>
            <Text style={styles.detailValue}>{formatDate(usage.startDate)}</Text>
          </View>
          {usage.endDate && (
            <View style={styles.detailItem}>
              <Ionicons name="stop" size={14} color="#8e8e93" />
              <Text style={styles.detailLabel}>Fin:</Text>
              <Text style={styles.detailValue}>{formatDate(usage.endDate)}</Text>
            </View>
          )}
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer" size={14} color="#8e8e93" />
            <Text style={styles.detailLabel}>KM Inicial:</Text>
            <Text style={styles.detailValue}>{usage.startMileage}</Text>
          </View>
          {usage.endMileage && (
            <View style={styles.detailItem}>
              <Ionicons name="speedometer" size={14} color="#8e8e93" />
              <Text style={styles.detailLabel}>KM Final:</Text>
              <Text style={styles.detailValue}>{usage.endMileage}</Text>
            </View>
          )}
        </View>

        {usage.endDate && (
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={14} color="#8e8e93" />
              <Text style={styles.detailLabel}>Duración:</Text>
              <Text style={styles.detailValue}>
                {calculateDuration(usage.startDate, usage.endDate)}
              </Text>
            </View>
            {usage.endMileage && (
              <View style={styles.detailItem}>
                <Ionicons name="trending-up" size={14} color="#8e8e93" />
                <Text style={styles.detailLabel}>KM Recorridos:</Text>
                <Text style={styles.detailValue}>
                  {usage.endMileage - usage.startMileage}
                </Text>
              </View>
            )}
          </View>
        )}

        {usage.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text" size={14} color="#8e8e93" />
            <Text style={styles.notesText} numberOfLines={2}>
              {usage.notes}
            </Text>
          </View>
        )}
      </View>

      {usage.status === 'activo' && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => openCompleteModal(usage)}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
          <Text style={styles.completeButtonText}>Finalizar Uso</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2CC295" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Usos</Text>
        <Text style={styles.subtitle}>
          {usages.length} registro{usages.length !== 1 ? 's' : ''} encontrado{usages.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Filtrar por estado:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === '' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('')}
          >
            <Text style={[styles.filterButtonText, statusFilter === '' && styles.filterButtonActiveText]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === 'activo' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('activo')}
          >
            <Text style={[styles.filterButtonText, statusFilter === 'activo' && styles.filterButtonActiveText]}>
              En Curso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === 'completado' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('completado')}
          >
            <Text style={[styles.filterButtonText, statusFilter === 'completado' && styles.filterButtonActiveText]}>
              Completados
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.usagesContainer} showsVerticalScrollIndicator={false}>
        {usages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={80} color="#e5e5ea" />
            <Text style={styles.emptyStateTitle}>
              {statusFilter ? 'No hay registros con ese filtro' : 'No hay registros de uso'}
            </Text>
            <Text style={styles.emptyStateText}>
              {statusFilter ? 
                'Intenta cambiar los filtros de búsqueda' : 
                'Cuando uses vehículos, aparecerán aquí tus registros.'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.usagesList}>
            {usages.map(usage => (
              <UsageCard key={usage.id} usage={usage} />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={completeModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCompleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="car-sport" size={32} color="#2CC295" />
              <Text style={styles.modalTitle}>Finalizar Uso de Vehículo</Text>
            </View>

            <View style={styles.usagePreview}>
              <Text style={styles.previewTitle}>
                {selectedUsage?.Vehicle.plate} - {selectedUsage?.Vehicle.brand} {selectedUsage?.Vehicle.model}
              </Text>
              <Text style={styles.previewText}>
                KM Inicial: {selectedUsage?.startMileage}
              </Text>
              <Text style={styles.previewText}>
                Iniciado: {selectedUsage && formatDate(selectedUsage.startDate)}
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Kilometraje Final *</Text>
                <TextInput
                  style={styles.input}
                  value={completeFormData.endMileage}
                  onChangeText={(text) => setCompleteFormData({ ...completeFormData, endMileage: text })}
                  placeholder="Ingresa el kilometraje final"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notas (Opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={completeFormData.notes}
                  onChangeText={(text) => setCompleteFormData({ ...completeFormData, notes: text })}
                  placeholder="Observaciones finales del viaje..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCompleteModalVisible(false)}
                disabled={formLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCompleteUsage}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.confirmButtonText}>Finalizar Uso</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17876D',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterLabel: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Poppins-Medium',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterButtonActive: {
    backgroundColor: '#2CC295',
    borderColor: '#2CC295',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    fontFamily: 'Poppins-Medium',
  },
  filterButtonActiveText: {
    color: '#fff',
    fontFamily: 'Poppins-Medium',
  },
  usagesContainer: {
    flex: 1,
    padding: 16,
  },
  usagesList: {
    gap: 16,
    marginBottom: 40,
  },
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  vehicleModel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  usageDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  detailValue: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginTop: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: '#8e8e93',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2CC295',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8e8e93',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  usagePreview: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  previewText: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  formContainer: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#AACBC4',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: '#2CC295',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});