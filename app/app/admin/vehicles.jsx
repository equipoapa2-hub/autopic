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

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    status: 'disponible',
    fuelType: 'gasolina',
    capacity: ''
  });
  const [createFormData, setCreateFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    status: 'disponible',
    fuelType: 'gasolina',
    capacity: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
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
    loadVehicles();
  }, [search, statusFilter, fuelTypeFilter]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (fuelTypeFilter) params.append('fuelType', fuelTypeFilter);

      const response = await fetch(`${API_URL}/admin/vehicles?${params}`);
      const data = await response.json();

      if (response.ok) {
        setVehicles(data);
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudieron cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteModalVisible(true);
  };

  const confirmDeleteVehicle = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/vehicles/${vehicleToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadVehicles();
        setDeleteModalVisible(false);
        setVehicleToDelete(null);
        showAlert('success', 'Éxito', 'Vehículo eliminado correctamente');
      } else {
        const data = await response.json();
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo eliminar el vehículo');
    }
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      color: vehicle.color,
      status: vehicle.status,
      fuelType: vehicle.fuelType,
      capacity: vehicle.capacity.toString()
    });
    setModalVisible(true);
  };

  const handleUpdateVehicle = async () => {
    if (!formData.plate || !formData.brand || !formData.model || !formData.year || !formData.color || !formData.capacity) {
      showAlert('warning', 'Validación', 'Todos los campos obligatorios deben ser completados');
      return;
    }

    try {
      setFormLoading(true);
      const updateData = {
        ...formData,
        year: parseInt(formData.year),
        capacity: parseInt(formData.capacity)
      };

      const response = await fetch(`${API_URL}/admin/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setModalVisible(false);
        loadVehicles();
        showAlert('success', 'Éxito', 'Vehículo actualizado correctamente');
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo actualizar el vehículo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (!createFormData.plate || !createFormData.brand || !createFormData.model || !createFormData.year || !createFormData.color || !createFormData.capacity) {
      showAlert('warning', 'Validación', 'Todos los campos obligatorios deben ser completados');
      return;
    }

    try {
      setFormLoading(true);
      const vehicleData = {
        ...createFormData,
        year: parseInt(createFormData.year),
        capacity: parseInt(createFormData.capacity)
      };

      const response = await fetch(`${API_URL}/admin/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      const data = await response.json();

      if (response.ok) {
        setCreateModalVisible(false);
        setCreateFormData({
          plate: '',
          brand: '',
          model: '',
          year: '',
          color: '',
          status: 'disponible',
          fuelType: 'gasolina',
          capacity: ''
        });
        loadVehicles();
        showAlert('success', 'Éxito', 'Vehículo creado correctamente');
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo crear el vehículo');
    } finally {
      setFormLoading(false);
    }
  };

  const openCreateModal = () => {
    setCreateFormData({
      plate: '',
      brand: '',
      model: '',
      year: '',
      color: '',
      status: 'disponible',
      fuelType: 'gasolina',
      capacity: ''
    });
    setCreateModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible': return '#4CAF50';
      case 'en_uso': return '#FF9800';
      case 'mantenimiento': return '#2196F3';
      case 'deshabilitado': return '#f44336';
      default: return '#8e8e93';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'en_uso': return 'En Uso';
      case 'mantenimiento': return 'Mantenimiento';
      case 'deshabilitado': return 'Deshabilitado';
      default: return status;
    }
  };

  const getFuelTypeText = (fuelType) => {
    switch (fuelType) {
      case 'gasolina': return 'Gasolina';
      case 'diésel': return 'Diésel';
      case 'eléctrico': return 'Eléctrico';
      case 'híbrido': return 'Híbrido';
      default: return fuelType;
    }
  };

  const VehicleCard = ({ vehicle }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleIcon}>
          <Ionicons name="car-sport" size={32} color="#03624C" />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
          <Text style={styles.vehicleModel}>{vehicle.brand} {vehicle.model}</Text>
          <Text style={styles.vehicleDetails}>{vehicle.year} • {vehicle.color}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) }]}>
          <Text style={styles.statusText}>{getStatusText(vehicle.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="people" size={14} color="#8e8e93" />
            <Text style={styles.infoText}>{vehicle.capacity} pasajeros</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="flash" size={14} color="#8e8e93" />
            <Text style={styles.infoText}>{getFuelTypeText(vehicle.fuelType)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={14} color="#8e8e93" />
            <Text style={styles.infoText}>
              {new Date(vehicle.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditVehicle(vehicle)}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => openDeleteModal(vehicle)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && vehicles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2CC295" />
        <Text style={styles.loadingText}>Cargando vehículos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Gestión de Vehículos</Text>
            <Text style={styles.subtitle}>
              {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} encontrado{vehicles.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Nuevo Vehículo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8e8e93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por placa, marca o modelo..."
              placeholderTextColor="#8e8e93"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, statusFilter === '' && styles.filterButtonActive]}
              onPress={() => setStatusFilter('')}
            >
              <Text style={[styles.filterButtonText, statusFilter === '' && styles.filterButtonActiveText]}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, statusFilter === 'disponible' && styles.filterButtonActive]}
              onPress={() => setStatusFilter('disponible')}
            >
              <Text style={[styles.filterButtonText, statusFilter === 'disponible' && styles.filterButtonActiveText]}>
                Disponible
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, statusFilter === 'en_uso' && styles.filterButtonActive]}
              onPress={() => setStatusFilter('en_uso')}
            >
              <Text style={[styles.filterButtonText, statusFilter === 'en_uso' && styles.filterButtonActiveText]}>
                En Uso
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, fuelTypeFilter === '' && styles.filterButtonActive]}
              onPress={() => setFuelTypeFilter('')}
            >
              <Text style={[styles.filterButtonText, fuelTypeFilter === '' && styles.filterButtonActiveText]}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, fuelTypeFilter === 'gasolina' && styles.filterButtonActive]}
              onPress={() => setFuelTypeFilter('gasolina')}
            >
              <Text style={[styles.filterButtonText, fuelTypeFilter === 'gasolina' && styles.filterButtonActiveText]}>
                Gasolina
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, fuelTypeFilter === 'diésel' && styles.filterButtonActive]}
              onPress={() => setFuelTypeFilter('diésel')}
            >
              <Text style={[styles.filterButtonText, fuelTypeFilter === 'diésel' && styles.filterButtonActiveText]}>
                Diésel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.vehiclesGrid} showsVerticalScrollIndicator={true}>
        <View style={styles.gridContainer}>
          {vehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </View>

        {vehicles.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="car-outline" size={80} color="#e5e5ea" />
            </View>
            <Text style={styles.emptyStateTitle}>No se encontraron vehículos</Text>
            <Text style={styles.emptyStateText}>
              {search || statusFilter || fuelTypeFilter ? 'Intenta ajustar los filtros de búsqueda' : 'No hay vehículos registrados en el sistema'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Vehículo</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#8e8e93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={true}>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Placa *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.plate}
                    onChangeText={(text) => setFormData({ ...formData, plate: text })}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Marca *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.brand}
                    onChangeText={(text) => setFormData({ ...formData, brand: text })}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Modelo *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.model}
                    onChangeText={(text) => setFormData({ ...formData, model: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Año *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.year}
                    onChangeText={(text) => setFormData({ ...formData, year: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Color *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.color}
                    onChangeText={(text) => setFormData({ ...formData, color: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Capacidad *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.capacity}
                    onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estado *</Text>
                <View style={styles.selectContainer}>
                  <View style={styles.select}>
                    <Text style={styles.selectText}>{getStatusText(formData.status)}</Text>
                    <Ionicons name="chevron-down" size={16} color="#8e8e93" />
                  </View>
                </View>
                <View style={styles.radioGroup}>
                  {['disponible', 'en_uso', 'mantenimiento', 'deshabilitado'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[styles.radioOption, formData.status === status && styles.radioOptionSelected]}
                      onPress={() => setFormData({ ...formData, status })}
                    >
                      <Ionicons
                        name={formData.status === status ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={formData.status === status ? '#2CC295' : '#8e8e93'}
                      />
                      <Text style={styles.radioLabel}>{getStatusText(status)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Combustible *</Text>
                <View style={styles.selectContainer}>
                  <View style={styles.select}>
                    <Text style={styles.selectText}>{getFuelTypeText(formData.fuelType)}</Text>
                    <Ionicons name="chevron-down" size={16} color="#8e8e93" />
                  </View>
                </View>
                <View style={styles.radioGroup}>
                  {['gasolina', 'diésel', 'eléctrico', 'híbrido'].map((fuelType) => (
                    <TouchableOpacity
                      key={fuelType}
                      style={[styles.radioOption, formData.fuelType === fuelType && styles.radioOptionSelected]}
                      onPress={() => setFormData({ ...formData, fuelType })}
                    >
                      <Ionicons
                        name={formData.fuelType === fuelType ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={formData.fuelType === fuelType ? '#2CC295' : '#8e8e93'}
                      />
                      <Text style={styles.radioLabel}>{getFuelTypeText(fuelType)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={formLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateVehicle}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={createModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Nuevo Vehículo</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCreateModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#8e8e93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={true}>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Placa *</Text>
                  <TextInput
                    style={styles.input}
                    value={createFormData.plate}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, plate: text })}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Marca *</Text>
                  <TextInput
                    style={styles.input}
                    value={createFormData.brand}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, brand: text })}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Modelo *</Text>
                  <TextInput
                    style={styles.input}
                    value={createFormData.model}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, model: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Año *</Text>
                  <TextInput
                    style={styles.input}
                    value={createFormData.year}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, year: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Color *</Text>
                  <TextInput
                    style={styles.input}
                    value={createFormData.color}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, color: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Capacidad *</Text>
                  <TextInput
                    style={styles.input}
                    value={createFormData.capacity}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, capacity: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estado *</Text>
                <View style={styles.radioGroup}>
                  {['disponible', 'en_uso', 'mantenimiento', 'deshabilitado'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[styles.radioOption, createFormData.status === status && styles.radioOptionSelected]}
                      onPress={() => setCreateFormData({ ...createFormData, status })}
                    >
                      <Ionicons
                        name={createFormData.status === status ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={createFormData.status === status ? '#2CC295' : '#8e8e93'}
                      />
                      <Text style={styles.radioLabel}>{getStatusText(status)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Combustible *</Text>
                <View style={styles.radioGroup}>
                  {['gasolina', 'diésel', 'eléctrico', 'híbrido'].map((fuelType) => (
                    <TouchableOpacity
                      key={fuelType}
                      style={[styles.radioOption, createFormData.fuelType === fuelType && styles.radioOptionSelected]}
                      onPress={() => setCreateFormData({ ...createFormData, fuelType })}
                    >
                      <Ionicons
                        name={createFormData.fuelType === fuelType ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={createFormData.fuelType === fuelType ? '#2CC295' : '#8e8e93'}
                      />
                      <Text style={styles.radioLabel}>{getFuelTypeText(fuelType)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                onPress={handleCreateVehicle}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="car" size={18} color="#fff" />
                    <Text style={styles.saveButtonText}>Crear Vehículo</Text>
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

            <Text style={styles.confirmTitle}>Eliminar Vehículo</Text>

            <Text style={styles.confirmMessage}>
              ¿Estás seguro de que quieres eliminar el vehículo{'\n'}
              <Text style={styles.confirmVehicleName}>
                {vehicleToDelete?.plate} - {vehicleToDelete?.brand} {vehicleToDelete?.model}
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
                onPress={confirmDeleteVehicle}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center"
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
    outlineWidth: 0,
    fontFamily: 'Poppins-Regular'
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  vehiclesGrid: {
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    minWidth: 280,
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
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  vehicleModel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 14,
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
    marginBottom: 20,
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
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2CC295',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
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
    maxHeight: '80%',
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
    fontFamily: 'Poppins-Bold',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
  },
  selectContainer: {
    marginBottom: 12,
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
    fontFamily: 'Poppins-Regular',
  },
  selectText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
  },
  radioGroup: {
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  radioOptionSelected: {
    borderColor: '#2CC295',
    backgroundColor: '#f8fff9',
  },
  radioLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
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
    fontFamily: 'Poppins-Bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-SemiBold',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
  },
  confirmVehicleName: {
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Bold',
  },
  deleteConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Bold',
  },
});