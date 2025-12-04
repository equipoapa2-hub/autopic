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

export default function VehicleUsage() {
  const [usages, setUsages] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    vehicleId: '',
    startDate: '',
    startMileage: '',
    notes: ''
  });
  const [completeFormData, setCompleteFormData] = useState({
    endMileage: '',
    notes: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [usageToDelete, setUsageToDelete] = useState(null);
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
    loadData();
  }, [statusFilter, userFilter, vehicleFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      const usageParams = new URLSearchParams();
      if (statusFilter) usageParams.append('status', statusFilter);
      if (userFilter) usageParams.append('userId', userFilter);
      if (vehicleFilter) usageParams.append('vehicleId', vehicleFilter);

      const [usageResponse, usersResponse, vehiclesResponse] = await Promise.all([
        fetch(`${API_URL}/admin/vehicle-usage?${usageParams}`),
        fetch(`${API_URL}/admin/users`),
        fetch(`${API_URL}/admin/vehicles`)
      ]);

      const usageData = await usageResponse.json();
      const usersData = await usersResponse.json();
      const vehiclesData = await vehiclesResponse.json();

      if (usageResponse.ok && usersResponse.ok && vehiclesResponse.ok) {
        setUsages(usageData);
        setUsers(usersData);
        setVehicles(vehiclesData);
      } else {
        showAlert('error', 'Error', 'No se pudieron cargar los datos');
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (usage) => {
    setUsageToDelete(usage);
    setDeleteModalVisible(true);
  };

  const confirmDeleteUsage = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/vehicle-usage/${usageToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData();
        setDeleteModalVisible(false);
        setUsageToDelete(null);
        showAlert('success', 'Éxito', 'Registro de uso eliminado correctamente');
      } else {
        const data = await response.json();
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo eliminar el registro de uso');
    }
  };

  const handleCompleteUsage = async () => {
    if (!completeFormData.endMileage) {
      showAlert('warning', 'Validación', 'El kilometraje final es obligatorio');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch(`${API_URL}/admin/vehicle-usage/${selectedUsage.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setCompleteModalVisible(false);
        setCompleteFormData({ endMileage: '', notes: '' });
        loadData();
        showAlert('success', 'Éxito', 'Uso de vehículo completado correctamente');
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo completar el uso del vehículo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateUsage = async () => {
    if (!formData.userId || !formData.vehicleId || !formData.startDate || !formData.startMileage) {
      showAlert('warning', 'Validación', 'Todos los campos obligatorios deben ser completados');
      return;
    }

    try {
      setFormLoading(true);
      const usageData = {
        ...formData,
        startMileage: parseInt(formData.startMileage),
        startDate: new Date(formData.startDate).toISOString()
      };

      const response = await fetch(`${API_URL}/admin/vehicle-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usageData),
      });

      const data = await response.json();

      if (response.ok) {
        setCreateModalVisible(false);
        setFormData({
          userId: '',
          vehicleId: '',
          startDate: '',
          startMileage: '',
          notes: ''
        });
        loadData();
        showAlert('success', 'Éxito', 'Registro de uso creado correctamente');
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo crear el registro de uso');
    } finally {
      setFormLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      userId: '',
      vehicleId: '',
      startDate: new Date().toISOString().slice(0, 16),
      startMileage: '',
      notes: ''
    });
    setCreateModalVisible(true);
  };

  const openCompleteModal = (usage) => {
    setSelectedUsage(usage);
    setCompleteFormData({
      endMileage: '',
      notes: usage.notes || ''
    });
    setCompleteModalVisible(true);
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
      case 'activo': return 'Activo';
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

  const getUserName = (user) => {
    return `${user.name} ${user.lastName1} ${user.lastName2 || ''}`.trim();
  };

  const getVehicleInfo = (vehicle) => {
    return `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`;
  };

  const UsageCard = ({ usage }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.usageIcon}>
          <Ionicons name="time" size={32} color="#03624C" />
        </View>
        <View style={styles.usageInfo}>
          <Text style={styles.userName}>{getUserName(usage.User)}</Text>
          <Text style={styles.vehicleInfo}>{getVehicleInfo(usage.Vehicle)}</Text>
          <Text style={styles.dateInfo}>
            Inicio: {formatDate(usage.startDate)}
          </Text>
          {usage.endDate && (
            <Text style={styles.dateInfo}>
              Fin: {formatDate(usage.endDate)}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(usage.status) }]}>
          <Text style={styles.statusText}>{getStatusText(usage.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="speedometer" size={14} color="#8e8e93" />
            <Text style={styles.infoText}>
              KM Inicio: {usage.startMileage}
            </Text>
          </View>
          {usage.endMileage && (
            <View style={styles.infoItem}>
              <Ionicons name="speedometer" size={14} color="#8e8e93" />
              <Text style={styles.infoText}>
                KM Fin: {usage.endMileage}
              </Text>
            </View>
          )}
          {usage.notes && (
            <View style={styles.infoItem}>
              <Ionicons name="document-text" size={14} color="#8e8e93" />
              <Text style={styles.infoText} numberOfLines={2}>
                {usage.notes}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardActions}>
        {usage.status === 'activo' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => openCompleteModal(usage)}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Completar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => openDeleteModal(usage)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && usages.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2CC295" />
        <Text style={styles.loadingText}>Cargando registros de uso...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Uso de Vehículos</Text>
            <Text style={styles.subtitle}>
              {usages.length} registro{usages.length !== 1 ? 's' : ''} encontrado{usages.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Nuevo Registro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Estado:</Text>
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
                Activos
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

          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Usuario:</Text>
            <TouchableOpacity
              style={[styles.filterButton, userFilter === '' && styles.filterButtonActive]}
              onPress={() => setUserFilter('')}
            >
              <Text style={[styles.filterButtonText, userFilter === '' && styles.filterButtonActiveText]}>
                Todos
              </Text>
            </TouchableOpacity>
            {users.map(user => (
              <TouchableOpacity
                key={user.id}
                style={[styles.filterButton, userFilter === user.id.toString() && styles.filterButtonActive]}
                onPress={() => setUserFilter(userFilter === user.id.toString() ? '' : user.id.toString())}
              >
                <Text style={[styles.filterButtonText, userFilter === user.id.toString() && styles.filterButtonActiveText]}>
                  {user.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Vehículo:</Text>
            <TouchableOpacity
              style={[styles.filterButton, vehicleFilter === '' && styles.filterButtonActive]}
              onPress={() => setVehicleFilter('')}
            >
              <Text style={[styles.filterButtonText, vehicleFilter === '' && styles.filterButtonActiveText]}>
                Todos
              </Text>
            </TouchableOpacity>
            {vehicles.map(vehicle => (
              <TouchableOpacity
                key={vehicle.id}
                style={[styles.filterButton, vehicleFilter === vehicle.id.toString() && styles.filterButtonActive]}
                onPress={() => setVehicleFilter(vehicleFilter === vehicle.id.toString() ? '' : vehicle.id.toString())}
              >
                <Text style={[styles.filterButtonText, vehicleFilter === vehicle.id.toString() && styles.filterButtonActiveText]}>
                  {vehicle.plate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView style={styles.usagesGrid} showsVerticalScrollIndicator={true}>
        <View style={styles.gridContainer}>
          {usages.map(usage => (
            <UsageCard key={usage.id} usage={usage} />
          ))}
        </View>

        {usages.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="time-outline" size={80} color="#e5e5ea" />
            </View>
            <Text style={styles.emptyStateTitle}>No se encontraron registros</Text>
            <Text style={styles.emptyStateText}>
              {statusFilter || userFilter || vehicleFilter ? 'Intenta ajustar los filtros de búsqueda' : 'No hay registros de uso de vehículos'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={createModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Registro de Uso</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCreateModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#8e8e93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={true}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Usuario *</Text>
                <select
                  style={styles.select}
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                >
                  <option value="">Seleccionar usuario</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {getUserName(user)}
                    </option>
                  ))}
                </select>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehículo *</Text>
                <select
                  style={styles.select}
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehicles.filter(v => v.status === 'disponible').map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {getVehicleInfo(vehicle)}
                    </option>
                  ))}
                </select>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha y Hora de Inicio *</Text>
                <input
                  type="datetime-local"
                  style={styles.datetimeInput}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kilometraje Inicial *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.startMileage}
                  onChangeText={(text) => setFormData({ ...formData, startMileage: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Observaciones adicionales"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}
                disabled={formLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateUsage}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="time" size={18} color="#fff" />
                    <Text style={styles.saveButtonText}>Crear Registro</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={completeModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCompleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Completar Uso de Vehículo</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCompleteModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#8e8e93" />
              </TouchableOpacity>
            </View>

            <View style={styles.usagePreview}>
              <Text style={styles.previewTitle}>
                {selectedUsage && getUserName(selectedUsage.User)}
              </Text>
              <Text style={styles.previewSubtitle}>
                {selectedUsage && getVehicleInfo(selectedUsage.Vehicle)}
              </Text>
              <Text style={styles.previewText}>
                KM Inicial: {selectedUsage?.startMileage}
              </Text>
              <Text style={styles.previewText}>
                Inicio: {selectedUsage && formatDate(selectedUsage.startDate)}
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kilometraje Final *</Text>
                <TextInput
                  style={styles.input}
                  value={completeFormData.endMileage}
                  onChangeText={(text) => setCompleteFormData({ ...completeFormData, endMileage: text })}
                  placeholder="Ingrese el kilometraje final"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={completeFormData.notes}
                  onChangeText={(text) => setCompleteFormData({ ...completeFormData, notes: text })}
                  placeholder="Observaciones adicionales"
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
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCompleteUsage}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.saveButtonText}>Completar Uso</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmIcon}>
              <Ionicons name="warning" size={48} color="#ff3b30" />
            </View>

            <Text style={styles.confirmTitle}>Eliminar Registro</Text>

            <Text style={styles.confirmMessage}>
              ¿Estás seguro de que quieres eliminar el registro de uso de{'\n'}
              <Text style={styles.confirmUsageName}>
                {usageToDelete && getUserName(usageToDelete.User)}
              </Text>
              {'\n'}con el vehículo{'\n'}
              <Text style={styles.confirmUsageName}>
                {usageToDelete && getVehicleInfo(usageToDelete.Vehicle)}
              </Text>
              ? Esta acción no se puede deshacer.
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelConfirmButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelConfirmText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteConfirmButton]}
                onPress={confirmDeleteUsage}
              >
                <Ionicons name="trash" size={16} color="#fff" />
                <Text style={styles.deleteConfirmText}>Eliminar</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    width: "100%",
    maxWidth: 1200,
    marginHorizontal: "auto"
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17876D',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold'
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular'
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2CC295',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#2CC295',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold'
  },
  filtersRow: {
    gap: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '600',
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
    fontFamily: 'Poppins-Regular'
  },
  filterButtonActiveText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold'
  },
  usagesGrid: {
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: 16,
  },
  card: {
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  usageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  usageInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold'
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  dateInfo: {
    fontSize: 12,
    color: '#8e8e93',
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
    fontFamily: 'Poppins-Bold'
  },
  cardBody: {
    marginBottom: 16,
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#8e8e93',
    fontFamily: 'Poppins-Regular'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: 350,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: 175,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold'
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
    fontFamily: 'Poppins-Regular'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold'
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular'
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
    padding: 0,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold'
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular'
  },
  datetimeInput: {
    borderWidth: 0,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular'
  },
  selectContainer: {
    marginBottom: 8,
  },
  select: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    fontFamily: 'Poppins-Regular'
  },
  selectText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular'
  },
  optionsContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  optionSelected: {
    backgroundColor: '#2CC295',
  },
  optionText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular'
  },
  usagePreview: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold'
  },
  previewSubtitle: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold'
  },
  previewText: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: '#AACBC4',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#2CC295',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular'
  },
  confirmModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmIcon: {
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold'
  },
  confirmMessage: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Poppins-Regular'
  },
  confirmUsageName: {
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold'
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelConfirmButton: {
    backgroundColor: '#AACBC4',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  deleteConfirmButton: {
    backgroundColor: '#ff3b30',
  },
  cancelConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular'
  },
  deleteConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular'
  },
  select: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular'
  },
});