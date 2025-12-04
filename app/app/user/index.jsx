import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserHome() {
  const router = useRouter();

  const QuickAction = ({ icon, title, description, onPress, color }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>Gestión Vehicular AutoPic</Text>
        </View>
        <View style={styles.logoContainer}>
          <Ionicons name="car-sport" size={32} color="#03624C" />
        </View>
      </View>

      <View style={styles.actionsSection}>
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="add-circle"
            title="Nuevo Registro"
            description="Registrar uso de vehículo"
            color="#2CC295"
            onPress={() => router.push('/user/new-record')}
          />
          <QuickAction
            icon="list"
            title="Historial"
            description="Ver mis registros anteriores"
            color="#9CEE8D"
            onPress={() => router.push('/user/history')}
          />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Sobre AutoPIC</Text>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#2CC295" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Registro Vehicular</Text>
            <Text style={styles.infoText}>
              AutoPIC es una plataforma para el registro y control de uso 
              de vehículos de Pic Petroleum, lleva un control preciso del uso de vehículos.
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.instructionsSection, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <View style={styles.instructionStep}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Registra el inicio</Text>
              <Text style={styles.instructionText}>
                Selecciona un vehículo disponible y registra el kilometraje inicial
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionItem}>
            <View style={styles.instructionStep}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Realiza tu viaje</Text>
              <Text style={styles.instructionText}>
                Usa el vehículo para tus desplazamientos profesionales
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionItem}>
            <View style={styles.instructionStep}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Finaliza el registro</Text>
              <Text style={styles.instructionText}>
                Al terminar, ingresa el kilometraje final y observaciones
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
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
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#17876D',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
    fontWeight: '700',
    color: '#2CC295',
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  actionsSection: {
    marginTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  actionsGrid: {
    gap: 12,
  },
  quickActionCard: {
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#17876D',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  actionDescription: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  infoSection: {
    padding: 24,
    paddingBottom: 0,
    fontFamily: 'Poppins-Regular',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Poppins-Regular',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#17876D',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  infoText: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  instructionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2CC295',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#17876D',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  instructionText: {
    fontSize: 12,
    color: '#8e8e93',
    lineHeight: 16,
    fontFamily: 'Poppins-Regular',
  },
  supportSection: {
    padding: 24,
    paddingTop: 8,
  },
  supportCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f7f0',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2CC295',
  },
  supportContent: {
    flex: 1,
    marginLeft: 12,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#17876D',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  supportText: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  supportContact: {
    fontSize: 12,
    color: '#2CC295',
    fontWeight: '500',
  },
});