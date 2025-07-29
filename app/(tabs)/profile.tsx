import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import { useUser } from '../../context/UserContext';
import { getMembershipsByClient } from '../../lib/mindBodyMemberships';
import { getServicesByServiceId } from '../../lib/mindBodyServices';
import { getStoredUserToken } from '../../lib/mindBodyUserToken';
import { useRouter } from 'expo-router';


// Mock de datos de cliente y membresía (reemplazar por import real si es necesario)


export default function ProfileScreen() {
  const { user } = useUser();
  const { logout } = useUser();
  const router = useRouter();
  const [MembershipsJson, setMembershipsJson] = useState<any>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [nextReservation, setNextReservation] = useState<any>(null);
  const [nextReservationClass, setNextReservationClass] = useState<any>(null);
  const [serviceJson, setserviceJson] = useState<any>(null);
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [serviceCount, setServiceCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchMembership = async () => {
      if (user?.id) {
        try {
          const memberships = await getMembershipsByClient(String(user?.id), getStoredUserToken() ?? undefined);
          if (memberships?.ClientMemberships?.length > 0 && memberships.ClientMemberships[0].Memberships?.length > 0) {
            const membership = memberships.ClientMemberships[0].Memberships[0];
            setMembershipsJson(memberships);
            const services = await getServicesByServiceId(membership.ProductId, getStoredUserToken() ?? undefined);
            const service = services?.Services[0];
            const expirationDate = new Date(membership.ExpirationDate);
            const today = new Date();
            const timeDiff = expirationDate.getTime() - today.getTime();
            const daysdiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            setDaysLeft(daysdiff);
            setserviceJson(service);
            setServiceName(service?.Name ?? null);
            setServiceCount(membership.Count ?? null);
          }
        } catch (error) {
          console.error("Error fetching membership:", error);
        }
      }
    };
    fetchMembership();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.FirstName.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user?.FirstName && user.LastName ? `${user.FirstName} ${user.LastName}` : ''}</Text>
        </View>

        {/* Membership Info */}
        {MembershipsJson?.ClientMemberships?.[0]?.Memberships?.[0] && (
          <View style={styles.cardPrimary}>
            <Text style={styles.cardTitle}>Tu membresía</Text>
            <Text style={styles.membershipType}>{serviceName}</Text>
            <Text style={styles.cardText}>
              Fecha de Activación: {new Date(MembershipsJson.ClientMemberships[0].Memberships[0].ActiveDate).toLocaleDateString()}
            </Text>
            <Text style={styles.cardText}>
              Fecha de Expiración: {new Date(MembershipsJson.ClientMemberships[0].Memberships[0].ExpirationDate).toLocaleDateString()}
            </Text>
            <Text style={styles.cardText}>
              Clases disponibles: {serviceCount != null && serviceCount > 1000 ? "Ilimitadas" : serviceCount}
            </Text>
          </View>
        )}

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{user?.FirstName && user?.LastName ? `${user.FirstName} ${user.LastName}` : ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{user?.MobilePhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Miembro desde:</Text>
            <Text style={styles.infoValue}>
              {new Date(user?.CreationDate ?? '').toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones de cuenta</Text>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  header: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#78aaa9', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#78aaa9' },
  cardPrimary: {
    backgroundColor: '#78aaa9', borderRadius: 12, padding: 20, marginBottom: 32,
  },
  cardTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  membershipType: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  cardText: { color: '#fff', marginBottom: 2 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { width: 120, color: '#888' },
  infoValue: { color: '#222', flex: 1 },
  logoutButton: {
    marginTop: 12,
    backgroundColor: '#78aaa9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});