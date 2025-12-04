import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomAlert from '../../components/CustomAlert';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
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

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo cerrar sesión');
    } finally {
      setLoading(false);
      setLogoutModalVisible(false);
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <Ionicons name={icon} size={20} color="#2CC295" />
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value || 'No especificado'}</Text>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2CC295" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name?.charAt(0)}{user.lastName1?.charAt(0)}
              </Text>
            </View>
            <View style={styles.userBasicInfo}>
              <Text style={styles.userName}>
                {user.name} {user.lastName1} {user.lastName2 || ''}
              </Text>
              <View style={[
                styles.roleBadge,
                user.role === 'admin' ? styles.adminBadge : styles.userBadge
              ]}>
                <Ionicons
                  name={user.role === 'admin' ? "shield-checkmark" : "person"}
                  size={12}
                  color="#fff"
                />
                <Text style={styles.roleText}>
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.infoCard}>
            <InfoRow
              icon="person"
              label="Nombre completo"
              value={`${user.name} ${user.lastName1} ${user.lastName2 || ''}`.trim()}
            />
            <View style={styles.separator} />
            <InfoRow
              icon="mail"
              label="Correo electrónico"
              value={user.email}
            />
            <View style={styles.separator} />
            <InfoRow
              icon="call"
              label="Teléfono"
              value={user.phone}
            />
            <View style={styles.separator} />
            <InfoRow
              icon="calendar"
              label="Fecha de registro"
              value={new Date(user.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
          <View style={styles.infoCard}>
            <InfoRow
              icon="key"
              label="Rol en el sistema"
              value={user.role === 'admin' ? 'Administrador' : 'Usuario estándar'}
            />
            <View style={styles.separator} />
            <InfoRow
              icon="time"
              label="Miembro desde"
              value={new Date(user.createdAt).toLocaleDateString('es-ES')}
            />
            <View style={styles.separator} />
            <InfoRow
              icon="refresh"
              label="Última actualización"
              value={new Date(user.updatedAt).toLocaleDateString('es-ES')}
            />
          </View>
        </View>

        <View style={styles.noteSection}>
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Información de contacto</Text>
              <Text style={styles.noteText}>
                Si necesitas actualizar tu información personal, por favor contacta al administrador del sistema.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="log-out" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {logoutModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="log-out" size={32} color="#ff3b30" />
              <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            </View>

            <Text style={styles.modalMessage}>
              ¿Estás seguro de que quieres cerrar sesión?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
                disabled={loading}
              >
                <Ionicons name="log-out" size={16} color="#fff" />
                <Text style={styles.confirmButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2CC295',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  userBasicInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#03624C',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#2CC295',
  },
  userBadge: {
    backgroundColor: '#6c757d',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#17876D',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  infoRow: {
    padding: 16,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,

  },
  infoLabelText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#8e8e93',
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  noteSection: {
    padding: 24,
    paddingTop: 0,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  noteText: {
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  bottomSpacer: {
    height: 100,
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ff3b30',
    paddingVertical: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    fontFamily: 'Poppins-Bold',
  },
  modalMessage: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'Poppins-Medium',
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
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: '#ff3b30',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButtonText: {
    color: '#8e8e93',
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