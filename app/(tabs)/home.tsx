import { Tabs } from 'expo-router';
import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useUser } from '../../context/UserContext';
import { getMembershipsByClient } from '../../lib/mindBodyMemberships';
import { getServicesByServiceId } from '../../lib/mindBodyServices';
import { getStoredUserToken } from '../../lib/mindBodyUserToken';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

<Tabs.Screen
  name="home"
  options={{ headerShown: false }}
/>

export default function HomeScreen() {

  const { user } = useUser();
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [serviceCount, setServiceCount] = useState<number | null>(null);
  //const [idserviceName, setIdServiceName] = useState<string | null>(null);
  const [serviceJson, setserviceJson] = useState<any>(null);
  const [MembershipsJson, setMembershipsJson] = useState<any>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchMembership = async () => {
      if (user?.UniqueId) {
        try {
          const memberships = await getMembershipsByClient(String(user?.UniqueId), getStoredUserToken() ?? undefined);
          //setMembershipJson(memberships);
          if (memberships?.ClientMemberships?.length > 0) {

            const membership = memberships.ClientMemberships[0].Memberships[0];
            setMembershipsJson(memberships);
            console.log("Token:", getStoredUserToken());
            console.log("Memberships fetched:", MembershipsJson);
            console.log("Membership fetched:", memberships?.ClientMemberships);
            const services = await getServicesByServiceId(membership.ProductId, getStoredUserToken() ?? undefined);
            const service = services?.Services[0];
            const expirationDate = new Date(membership.ExpirationDate);
            const today = new Date();
            const timeDiff = expirationDate.getTime() - today.getTime();
            const daysdiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            setDaysLeft(daysdiff);
            setserviceJson(service);
            console.log("Membership fetched:", membership);
            console.log("Service fetched:", service);
            console.log("Token:", getStoredUserToken());
            console.log("ServiceName", service?.Name);
            setServiceName(service?.Name ?? null);
            setServiceCount(membership.Count ?? null);
            //setIdServiceName(membership.ProductId ?? null);
          }
        } catch (error) {
          console.error("Error fetching membership:", error);
        }
      }
    };

    fetchMembership();
  }, [user]);

  // Datos simulados
  const nextClass = {
    name: "Yoga Vinyasa",
    instructor: "María González",
    time: "16:30",
    date: "Hoy"
  };

  const recommended = [
    { name: "Yoga Flow", desc: "Todos los niveles", img: "https://source.unsplash.com/random/100x100?yoga,1" },
    { name: "Pilates", desc: "Todos los niveles", img: "https://source.unsplash.com/random/100x100?yoga,2" },
    { name: "Meditación", desc: "Todos los niveles", img: "https://source.unsplash.com/random/100x100?yoga,3" },
  ];

  return (
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.title}>Namaste, {user?.FirstName ?? 'Yogi'}</Text>
          <Text style={styles.subtitle}>¡Bienvenida de vuelta a tu espacio!</Text>
        </View>

        {/* Próxima clase */}
        <View style={styles.cardPrimary}>
          <Text style={styles.cardTitle}>Próxima clase</Text>
          <Text style={styles.className}>{nextClass.name}</Text>
          <Text style={styles.classInstructor}>con {nextClass.instructor}</Text>
          <View style={styles.classRow}>
            <Text style={styles.classTime}>{nextClass.date}, {nextClass.time}</Text>
            <TouchableOpacity style={styles.reserveBtn}>
              <Text style={styles.reserveBtnText}>Reservar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{serviceCount != null && serviceCount > 1000 ? "Ilimitadas" : serviceCount}</Text>
            <Text style={styles.statLabel}>Clases restantes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{daysLeft}</Text>
            <Text style={styles.statLabel}>Días restantes</Text>
          </View>
        </View>

        {/* Plan actual */}
  
        <View style={styles.card}>
        { serviceName && (  
          <View style={styles.planRow}>
            <View style={ styles.statCard2 }>
              <Text style={styles.planLabel}>
                {
                  "Tu plan"
                }
              </Text>
              <Text style={styles.planType}>
                {serviceName ? serviceName : "Sin membresía activa"}
              </Text>
            </View>
          </View>
        )} 
        </View>

        {/* Clases recomendadas */}
        <Text style={styles.sectionTitle}>Próximas clases</Text>
        {recommended.map((item, idx) => (
          <View key={idx} style={styles.recoCard}>
            <Image source={{ uri: item.img }} style={styles.recoImg} />
            <View style={styles.recoInfo}>
              <Text style={styles.recoName}>{item.name}</Text>
              <Text style={styles.recoDesc}>{item.desc}</Text>
              <TouchableOpacity>
                <Text style={styles.recoBtn}>Ver horarios</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#78aaa9',
    marginBottom: 2,
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 15,
    marginBottom: 8,
  },
  cardPrimary: {
    backgroundColor: '#78aaa9',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  className: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  classInstructor: {
    color: '#e8f1e8',
    fontSize: 14,
    marginBottom: 8,
  },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTime: {
    color: '#e8f1e8',
    fontSize: 15,
  },
  reserveBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  reserveBtnText: {
    color: '#78aaa9',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8, // antes 18
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: '#78aaa9',
  },
    statCard2: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginHorizontal: -15,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: '#78aaa9',
  },  
    statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#78aaa9',
  },
  statLabel: {
    color: '#4b5563',
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12, // antes 18, opcional
    elevation: 2,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planLabel: {
    color: '#78aaa9',
    fontWeight: 'bold',
    fontSize: 15,
    
  },
  planType: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#444',
  },
  planIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
    marginTop: 2,
  },
  recoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  recoImg: {
    width: 72,
    height: 72,
    backgroundColor: '#e8f1e8',
  },
  recoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recoName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#444',
  },
  recoDesc: {
    color: '#4b5563',
    fontSize: 13,
    marginBottom: 2,
  },
  recoBtn: {
    color: '#78aaa9',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
});