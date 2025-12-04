import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../../constants';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    availableVehicles: 0,
    activeUsages: 0
  });
  const [recentUsages, setRecentUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setLoading(true);

      const [usersResponse, vehiclesResponse, availableVehiclesResponse, activeUsagesResponse, recentUsagesResponse] = await Promise.all([
        fetch(`${API_URL}/admin/users`),
        fetch(`${API_URL}/admin/vehicles`),
        fetch(`${API_URL}/admin/vehicles?status=disponible`),
        fetch(`${API_URL}/admin/vehicle-usage?status=activo`),
        fetch(`${API_URL}/admin/vehicle-usage`)
      ]);

      const usersData = await usersResponse.json();
      const vehiclesData = await vehiclesResponse.json();
      const availableVehiclesData = await availableVehiclesResponse.json();
      const activeUsagesData = await activeUsagesResponse.json();
      const recentUsagesData = await recentUsagesResponse.json();

      if (usersResponse.ok && vehiclesResponse.ok && availableVehiclesResponse.ok && activeUsagesResponse.ok && recentUsagesResponse.ok) {
        setStats({
          totalUsers: usersData.length,
          totalVehicles: vehiclesData.length,
          availableVehicles: availableVehiclesData.length,
          activeUsages: activeUsagesData.length
        });
        setRecentUsages(recentUsagesData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({ icon, title, description, onPress, color }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
    </TouchableOpacity>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    return status === 'activo' ? '#FF9800' : '#61D3AB';
  };

  const getUserName = (user) => {
    return `${user.name} ${user.lastName1} ${user.lastName2 || ''}`.trim();
  };

  const getVehicleInfo = (vehicle) => {
    return `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2d4d31" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Inicio</Text>
        <Text style={styles.subtitle}>Resumen del sistema</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="people"
          title="Total Usuarios"
          value={stats.totalUsers}
          color="#0B749C"
          onPress={() => router.push('/admin/users')}
        />
        <StatCard
          icon="car-sport"
          title="Total Vehículos"
          value={stats.totalVehicles}
          color="#1FBAC0"
          onPress={() => router.push('/admin/vehicles')}
        />
        <StatCard
          icon="checkmark-circle"
          title="Vehículos Disponibles"
          value={stats.availableVehicles}
          color="#61D3AB"
          onPress={() => router.push('/admin/vehicles?status=disponible')}
        />
        <StatCard
          icon="time"
          title="Usos Activos"
          value={stats.activeUsages}
          color="#9CEE8D"
          onPress={() => router.push('/admin/vehicle-usage?status=activo')}
        />
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="people"
            title="Gestionar Usuarios"
            description="Administrar usuarios del sistema"
            color="#03624C"
            onPress={() => router.push('/admin/users')}
          />
          <QuickAction
            icon="car-sport"
            title="Gestionar Vehículos"
            description="Administrar flota vehicular"
            color="#007AFF"
            onPress={() => router.push('/admin/vehicles')}
          />
          <QuickAction
            icon="time"
            title="Ver Usos Activos"
            description="Monitorear usos en curso"
            color="#FF9800"
            onPress={() => router.push('/admin/vehicle-usage?status=activo')}
          />
        </View>
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos Registros de Uso</Text>
          <TouchableOpacity onPress={() => router.push('/admin/vehicle-usage')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableContainer}>
          <table style={styles.htmlTable}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeaderCell}>Usuario</th>
                <th style={styles.tableHeaderCell}>Vehículo</th>
                <th style={styles.tableHeaderCell}>Fecha Inicio</th>
                <th style={styles.tableHeaderCell}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentUsages.map((usage) => (
                <tr key={usage.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{getUserName(usage.User)}</td>
                  <td style={styles.tableCell}>{getVehicleInfo(usage.Vehicle)}</td>
                  <td style={styles.tableCell}>{formatDate(usage.startDate)}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(usage.status)
                    }}>
                      {usage.status === 'activo' ? 'Activo' : 'Completado'}
                    </span>
                  </td>
                </tr>
              ))}

              {recentUsages.length === 0 && (
                <tr>
                  <td colSpan="4" style={styles.emptyCell}>
                    <div style={styles.emptyTable}>
                      <Ionicons name="time-outline" size={32} color="#e5e5ea" />
                      <Text style={styles.emptyTableText}>No hay registros de uso</Text>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    maxWidth: 1200,
    width: "100%",
    marginHorizontal: "auto"
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
    fontFamily: 'Poppins-Bold'
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  statTitle: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  actionsSection: {
    padding: 16,
  },
  recentSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#17876D',
    fontFamily: 'Poppins-SemiBold'
  },
  seeAllText: {
    fontSize: 14,
    color: '#17876D',
    fontWeight: '600',
  },
  actionsGrid: {
    gap: 12,
    marginTop: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    fontFamily: 'Poppins-Medium'
  },
  actionDescription: {
    fontSize: 14,
    color: '#8e8e93',
    fontFamily: 'Poppins-Regular'
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular'
  },
  emptyTable: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTableText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
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
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  htmlTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa',
  },
  tableHeaderCell: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '16px',
    fontFamily: "inherit",
    fontWeight: '600',
    color: '#1a1a1a',
    borderBottom: '1px solid #e9ecef',
    fontFamily: 'Poppins-Regular'
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  tableCell: {
    padding: '16px',
    fontSize: '16px',
    color: '#1a1a1a',
    fontFamily: "inherit",
    borderBottom: '1px solid #f0f0f0',
    fontFamily: 'Poppins-Regular'
  },
  emptyCell: {
    padding: '40px 16px',
    textAlign: 'center',
  },
  statusBadge: {
    display: 'block',
    paddingHorizontal: 8,
    lineHeight: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    textAlign: 'center',
    minWidth: 70,
  },
  emptyTable: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  emptyTableText: {
    fontSize: '14px',
    color: '#8e8e93',
  },
});