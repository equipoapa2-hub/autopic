import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
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

export default function NewRecord() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    startMileage: '',
    notes: ''
  });
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [activeUsage, setActiveUsage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info',
    title: '',
    message: ''
  });
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  useEffect(() => {
    loadAvailableVehicles();
    checkActiveUsage();
  }, []);

  const loadAvailableVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/user/vehicles/available`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setVehicles(data);
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudieron cargar los vehículos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const checkActiveUsage = async () => {
    try {
      const response = await fetch(`${API_URL}/user/usage/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data) {
        setActiveUsage(data);
      } else {
        setActiveUsage(null);
      }
    } catch (error) {
      console.error('Error checking active usage:', error);
      setActiveUsage(null);
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    try {

      await Promise.all([
        loadAvailableVehicles(),
        checkActiveUsage()
      ]);
    } catch (error) {
      showAlert('error', 'Error', 'Error al actualizar los datos');
    } finally {
      setRefreshing(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSubmit = () => {
    if (!selectedVehicle) {
      showAlert('warning', 'Validación', 'Por favor selecciona un vehículo');
      return;
    }

    if (!formData.startMileage) {
      showAlert('warning', 'Validación', 'Por favor ingresa el kilometraje inicial');
      return;
    }

    setConfirmModalVisible(true);
  };

  const confirmUsage = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(`${API_URL}/user/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          startMileage: formData.startMileage,
          notes: formData.notes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfirmModalVisible(false);
        setSuccessModalVisible(true);
        setFormData({ startMileage: '', notes: '' });
        setSelectedVehicle(null);
        setTimeout(() => {
          checkActiveUsage();
          loadAvailableVehicles();
        }, 500);
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo registrar el uso del vehículo');
    } finally {
      setFormLoading(false);
    }
  };

  const VehicleCard = ({ vehicle, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[
        styles.vehicleCard,
        isSelected && styles.vehicleCardSelected
      ]}
      onPress={() => onSelect(vehicle)}
    >
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleIcon}>
          <Ionicons name="car-sport" size={24} color="#03624C" />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
          <Text style={styles.vehicleModel}>{vehicle.brand} {vehicle.model}</Text>
          <Text style={styles.vehicleDetails}>{vehicle.color} • {vehicle.capacity} pasajeros</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#2CC295" />
        )}
      </View>
      <View style={styles.vehicleFooter}>
        <View style={styles.fuelBadge}>
          <Ionicons name="flash" size={12} color="#fff" />
          <Text style={styles.fuelText}>
            {vehicle.fuelType === 'gasolina' ? 'Gasolina' :
              vehicle.fuelType === 'diésel' ? 'Diésel' :
                vehicle.fuelType === 'eléctrico' ? 'Eléctrico' : 'Híbrido'}
          </Text>
        </View>
        <Text style={styles.availableText}>Disponible</Text>
      </View>
    </TouchableOpacity>
  );

  if (activeUsage) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2CC295']}
              tintColor="#2CC295"
            />
          }
        >
          <View style={styles.activeUsageContainer}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={48} color="#FF9800" />
            </View>
            <Text style={styles.activeUsageTitle}>Uso Activo En Curso</Text>
            <Text style={styles.activeUsageText}>
              Actualmente tienes un vehículo en uso. Debes completar el uso actual antes de registrar uno nuevo.
            </Text>
            <Text style={styles.vehicleInfo}>
              Vehículo: {activeUsage.Vehicle.plate} - {activeUsage.Vehicle.brand} {activeUsage.Vehicle.model}
            </Text>
            <Text style={styles.startInfo}>
              Iniciado: {new Date(activeUsage.startDate).toLocaleString('es-ES')}
            </Text>
            <TouchableOpacity
              style={styles.viewHistoryButton}
              onPress={() => { router.push('/user/history'); }}
            >
              <Text style={styles.viewHistoryText}>Ver Historial</Text>
            </TouchableOpacity>

            <View style={styles.refreshHint}>
              <Ionicons name="refresh-circle" size={20} color="#8e8e93" />
              <Text style={styles.refreshHintText}>
                Desliza hacia abajo para actualizar
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2CC295" />
        <Text style={styles.loadingText}>Cargando vehículos disponibles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2CC295']}
            tintColor="#2CC295"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Nuevo Registro de Uso</Text>
          <Text style={styles.subtitle}>
            Selecciona un vehículo disponible y registra el kilometraje inicial
          </Text>
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículos Disponibles</Text>
          <Text style={styles.sectionSubtitle}>
            {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} disponible{vehicles.length !== 1 ? 's' : ''}
          </Text>

          {vehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={64} color="#e5e5ea" />
              <Text style={styles.emptyStateTitle}>No hay vehículos disponibles</Text>
              <Text style={styles.emptyStateText}>
                Todos los vehículos están en uso o en mantenimiento en este momento.
              </Text>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={16} color="#2CC295" />
                <Text style={styles.refreshButtonText}>Recargar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.vehiclesGrid}>
              {vehicles.map(vehicle => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selectedVehicle?.id === vehicle.id}
                  onSelect={handleVehicleSelect}
                />
              ))}
            </View>
          )}
        </View>

        {selectedVehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles del Uso</Text>

            <View style={styles.selectedVehicle}>
              <Text style={styles.selectedVehicleTitle}>Vehículo Seleccionado</Text>
              <Text style={styles.selectedVehicleInfo}>
                {selectedVehicle.plate} - {selectedVehicle.brand} {selectedVehicle.model}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Kilometraje Inicial *</Text>
              <TextInput
                style={styles.input}
                value={formData.startMileage}
                onChangeText={(text) => setFormData({ ...formData, startMileage: text })}
                placeholder="Ej: 15000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notas (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Observaciones o propósito del viaje..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!formData.startMileage || formLoading) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!formData.startMileage || formLoading}
            >
              {formLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Registrar Uso</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={confirmModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="car-sport" size={32} color="#2CC295" />
              <Text style={styles.modalTitle}>Confirmar Uso de Vehículo</Text>
            </View>

            <View style={styles.confirmationDetails}>
              <Text style={styles.confirmationText}>
                Estás a punto de registrar el uso del vehículo:
              </Text>
              <Text style={styles.confirmationVehicle}>
                {selectedVehicle?.plate} - {selectedVehicle?.brand} {selectedVehicle?.model}
              </Text>
              <Text style={styles.confirmationDetail}>
                Kilometraje inicial: {formData.startMileage} km
              </Text>
              {formData.notes && (
                <Text style={styles.confirmationDetail}>
                  Notas: {formData.notes}
                </Text>
              )}
              <Text style={styles.confirmationWarning}>
                ⚠️ El vehículo cambiará a estado "En Uso"
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmModalVisible(false)}
                disabled={formLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmUsage}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successHeader}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.successTitle}>¡Uso Registrado Exitosamente!</Text>
            </View>

            <View style={styles.successDetails}>
              <Text style={styles.successText}>
                El vehículo ha sido asignado para tu uso.
              </Text>
              <Text style={styles.successVehicle}>
                {selectedVehicle?.plate} - {selectedVehicle?.brand} {selectedVehicle?.model}
              </Text>
              <Text style={styles.successTime}>
                Hora de inicio: {new Date().toLocaleString('es-ES')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.successButtonText}>Aceptar</Text>
            </TouchableOpacity>
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
  scrollContainer: {
    flex: 1,
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
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  vehiclesGrid: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleCardSelected: {
    borderColor: '#2CC295',
    backgroundColor: '#f8fff9',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  vehicleModel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  vehicleDetails: {
    fontSize: 12,
    color: '#8e8e93',
    fontFamily: 'Poppins-Regular',
  },
  vehicleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fuelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2CC295',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fuelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  availableText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8e8e93',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  selectedVehicle: {
    backgroundColor: '#f0f7f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2CC295',
  },
  selectedVehicleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2CC295',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  selectedVehicleInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Medium',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2CC295',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
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
    fontFamily: 'Poppins-Regular',
  },
  activeUsageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  warningIcon: {
    marginBottom: 24,
  },
  activeUsageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  activeUsageText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  vehicleInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  startInfo: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  viewHistoryButton: {
    backgroundColor: '#2CC295',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewHistoryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  refreshHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  refreshHintText: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f7f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2CC295',
  },
  refreshButtonText: {
    color: '#2CC295',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
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
  confirmationDetails: {
    marginBottom: 24,
  },
  confirmationText: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  confirmationVehicle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  confirmationDetail: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  confirmationWarning: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
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
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#AACBC4',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: '#2CC295',
    flexDirection: 'row',
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
  successHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  successDetails: {
    marginBottom: 24,
  },
  successText: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  successVehicle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  successTime: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  successButton: {
    backgroundColor: '#2CC295',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});