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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    lastName1: '',
    lastName2: '',
    email: '',
    phone: '',
    role: 'user'
  });
  const [createFormData, setCreateFormData] = useState({
    name: '',
    lastName1: '',
    lastName2: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const response = await fetch(`${API_URL}/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadUsers();
        setDeleteModalVisible(false);
        setUserToDelete(null);
        showAlert('success', 'Éxito', 'Usuario eliminado correctamente');
      } else {
        const data = await response.json();
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo eliminar el usuario');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      lastName1: user.lastName1,
      lastName2: user.lastName2 || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
    setModalVisible(true);
  };

  const handleUpdateUser = async () => {
    if (!formData.name || !formData.lastName1 || !formData.email) {
      showAlert('warning', 'Validación', 'Nombre, primer apellido y email son obligatorios');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setModalVisible(false);
        loadUsers();
        showAlert('success', 'Éxito', 'Usuario actualizado correctamente');
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo actualizar el usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createFormData.name || !createFormData.lastName1 || !createFormData.email || !createFormData.password) {
      showAlert('warning', 'Validación', 'Todos los campos obligatorios deben ser completados');
      return;
    }

    if (createFormData.password !== createFormData.confirmPassword) {
      showAlert('warning', 'Validación', 'Las contraseñas no coinciden');
      return;
    }

    if (createFormData.password.length < 6) {
      showAlert('warning', 'Validación', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setFormLoading(true);
      const userData = {
        name: createFormData.name,
        lastName1: createFormData.lastName1,
        lastName2: createFormData.lastName2,
        email: createFormData.email,
        phone: createFormData.phone,
        role: createFormData.role,
        passwordHash: createFormData.password
      };

      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setCreateModalVisible(false);
        setCreateFormData({
          name: '',
          lastName1: '',
          lastName2: '',
          email: '',
          phone: '',
          role: 'user',
          password: '',
          confirmPassword: ''
        });
        loadUsers();
        showAlert('success', 'Éxito', 'Usuario creado correctamente');
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo crear el usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      showAlert('warning', 'Validación', 'Ambos campos de contraseña son obligatorios');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('warning', 'Validación', 'Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showAlert('warning', 'Validación', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordModalVisible(false);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        showAlert('success', 'Éxito', 'Contraseña actualizada correctamente');
      } else {
        showAlert('error', 'Error', data.error);
      }
    } catch (error) {
      showAlert('error', 'Error', 'No se pudo actualizar la contraseña');
    } finally {
      setFormLoading(false);
    }
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setPasswordModalVisible(true);
  };

  const openCreateModal = () => {
    setCreateFormData({
      name: '',
      lastName1: '',
      lastName2: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    });
    setCreateModalVisible(true);
  };

  const UserCard = ({ user }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0)}{user.lastName1.charAt(0)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.name} {user.lastName1} {user.lastName2}
          </Text>
        </View>
        <View style={[styles.roleBadge, user.role === 'admin' ? styles.adminBadge : styles.userBadge]}>
          <Ionicons
            name={user.role === 'admin' ? "shield-checkmark" : "person"}
            size={12}
            color="#fff"
          />
          <Text style={styles.roleText}>
            {user.role === 'admin' ? 'Admin' : 'Usuario'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="call" size={14} color="#8e8e93" />
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={14} color="#8e8e93" />
            <Text style={styles.infoText}>
              {user.email}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditUser(user)}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.passwordButton]}
          onPress={() => openPasswordModal(user)}
        >
          <Ionicons name="key-outline" size={16} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => openDeleteModal(user)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2CC295" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Gestión de Usuarios</Text>
            <Text style={styles.subtitle}>
              {users.length} usuario{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Nuevo Usuario</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8e8e93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar usuarios..."
              placeholderTextColor="#8e8e93"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, roleFilter === '' && styles.filterButtonActive]}
              onPress={() => setRoleFilter('')}
            >
              <Text style={[styles.filterButtonText, roleFilter === '' && styles.filterButtonActiveText]}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, roleFilter === 'user' && styles.filterButtonActive]}
              onPress={() => setRoleFilter('user')}
            >
              <Text style={[styles.filterButtonText, roleFilter === 'user' && styles.filterButtonActiveText]}>
                Usuarios
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, roleFilter === 'admin' && styles.filterButtonActive]}
              onPress={() => setRoleFilter('admin')}
            >
              <Text style={[styles.filterButtonText, roleFilter === 'admin' && styles.filterButtonActiveText]}>
                Admins
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.usersGrid} showsVerticalScrollIndicator={true}>
        <View style={styles.gridContainer}>
          {users.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </View>

        {users.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={80} color="#e5e5ea" />
            </View>
            <Text style={styles.emptyStateTitle}>No se encontraron usuarios</Text>
            <Text style={styles.emptyStateText}>
              {search || roleFilter ? 'Intenta ajustar los filtros de búsqueda' : 'No hay usuarios registrados en el sistema'}
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
              <Text style={styles.modalTitle}>Editar Usuario</Text>
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
                  <Text style={styles.label}>Nombre *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Ingresa el nombre"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Primer Apellido *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName1}
                    onChangeText={(text) => setFormData({ ...formData, lastName1: text })}
                    placeholder="Primer apellido"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Segundo Apellido</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName2}
                  onChangeText={(text) => setFormData({ ...formData, lastName2: text })}
                  placeholder="Segundo apellido (opcional)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Teléfono (opcional)"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rol *</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[styles.radioOption, formData.role === 'user' && styles.radioOptionSelected]}
                    onPress={() => setFormData({ ...formData, role: 'user' })}
                  >
                    <Ionicons
                      name={formData.role === 'user' ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={formData.role === 'user' ? '#2CC295' : '#8e8e93'}
                    />
                    <Text style={styles.radioLabel}>Usuario</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioOption, formData.role === 'admin' && styles.radioOptionSelected]}
                    onPress={() => setFormData({ ...formData, role: 'admin' })}
                  >
                    <Ionicons
                      name={formData.role === 'admin' ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={formData.role === 'admin' ? '#2CC295' : '#8e8e93'}
                    />
                    <Text style={styles.radioLabel}>Administrador</Text>
                  </TouchableOpacity>
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
                onPress={handleUpdateUser}
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
              <Text style={styles.modalTitle}>Crear Nuevo Usuario</Text>
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
                  <Text style={styles.label}>Nombre *</Text>
                  <TextInput
                    style={styles.input}
                    value={createFormData.name}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, name: text })}
                    placeholder="Ingresa el nombre"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Primer Apellido *</Text>
                  <TextInput
                    style={styles.input}
                    value={createFormData.lastName1}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, lastName1: text })}
                    placeholder="Primer apellido"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Segundo Apellido</Text>
                <TextInput
                  style={styles.input}
                  value={createFormData.lastName2}
                  onChangeText={(text) => setCreateFormData({ ...createFormData, lastName2: text })}
                  placeholder="Segundo apellido (opcional)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={createFormData.email}
                  onChangeText={(text) => setCreateFormData({ ...createFormData, email: text })}
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={createFormData.phone}
                  onChangeText={(text) => setCreateFormData({ ...createFormData, phone: text })}
                  placeholder="Teléfono (opcional)"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={createFormData.password}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, password: text })}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry={!showCreatePassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCreatePassword(!showCreatePassword)}
                  >
                    <Ionicons name={showCreatePassword ? "eye-off" : "eye"} size={20} color="#8e8e93" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Contraseña *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={createFormData.confirmPassword}
                    onChangeText={(text) => setCreateFormData({ ...createFormData, confirmPassword: text })}
                    placeholder="Repite la contraseña"
                    secureTextEntry={!showCreateConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCreateConfirmPassword(!showCreateConfirmPassword)}
                  >
                    <Ionicons name={showCreateConfirmPassword ? "eye-off" : "eye"} size={20} color="#8e8e93" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rol *</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[styles.radioOption, createFormData.role === 'user' && styles.radioOptionSelected]}
                    onPress={() => setCreateFormData({ ...createFormData, role: 'user' })}
                  >
                    <Ionicons
                      name={createFormData.role === 'user' ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={createFormData.role === 'user' ? '#2CC295' : '#8e8e93'}
                    />
                    <Text style={styles.radioLabel}>Usuario</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioOption, createFormData.role === 'admin' && styles.radioOptionSelected]}
                    onPress={() => setCreateFormData({ ...createFormData, role: 'admin' })}
                  >
                    <Ionicons
                      name={createFormData.role === 'admin' ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={createFormData.role === 'admin' ? '#2CC295' : '#8e8e93'}
                    />
                    <Text style={styles.radioLabel}>Administrador</Text>
                  </TouchableOpacity>
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
                onPress={handleCreateUser}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={18} color="#fff" />
                    <Text style={styles.saveButtonText}>Crear Usuario</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={passwordModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#8e8e93" />
              </TouchableOpacity>
            </View>

            <View style={styles.userPreview}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarSmallText}>
                  {selectedUser?.name?.charAt(0)}{selectedUser?.lastName1?.charAt(0)}
                </Text>
              </View>
              <Text style={styles.userPreviewName}>
                {selectedUser?.name} {selectedUser?.lastName1}
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nueva Contraseña *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.newPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#8e8e93" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Contraseña *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                    placeholder="Repite la contraseña"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#8e8e93" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPasswordModalVisible(false)}
                disabled={formLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleChangePassword}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="key" size={18} color="#fff" />
                    <Text style={styles.saveButtonText}>Actualizar Contraseña</Text>
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

            <Text style={styles.confirmTitle}>Eliminar Usuario</Text>

            <Text style={styles.confirmMessage}>
              ¿Estás seguro de que quieres eliminar a{' '}
              <Text style={styles.confirmUserName}>
                {userToDelete?.name} {userToDelete?.lastName1}
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
                onPress={confirmDeleteUser}
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
    fontFamily: 'Poppins-Bold'
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
    fontFamily: 'Poppins-Regular'
  },
  filterButtonActiveText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold'
  },
  usersGrid: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#03624C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Bold'
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold'
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 5,
  },
  adminBadge: {
    backgroundColor: '#2CC295',
  },
  userBadge: {
    backgroundColor: '#8e8e93',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  passwordButton: {
    backgroundColor: '#1FBAC0',
  },
  deleteButton: {
    backgroundColor: '#fb534bff',
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
    maxHeight: '90%',
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
    marginVertical: 10,
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
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    fontFamily: 'Poppins-Regular'
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular'
  },
  eyeButton: {
    padding: 16,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  radioOptionSelected: {
    borderColor: '#2CC295',
    backgroundColor: '#f8fff9',
  },
  radioLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  userPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2CC295',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-Bold'
  },
  userPreviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold'
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
    fontFamily: 'Poppins-Regular'
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
  confirmUserName: {
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
});