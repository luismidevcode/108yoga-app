import { Tabs } from 'expo-router';
import React, {useEffect, useState, useCallback} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { getMembershipsByClient } from '../../lib/mindBodyMemberships';
import { getServicesByServiceId } from '../../lib/mindBodyServices';
import { getStoredUserToken } from '../../lib/mindBodyUserToken';
import { getClassesOfWeek, cancelClientFromClass } from '../../lib/mindBodyClass';
import { findClientSchedule } from '../../lib/mindBodyClients';

<Tabs.Screen
  name="home"
  options={{ headerShown: false }}
/>

export default function HomeScreen() {
  const router = useRouter();

  const { user } = useUser();
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [serviceCount, setServiceCount] = useState<number | null>(null);
  //const [idserviceName, setIdServiceName] = useState<string | null>(null);
  const [serviceJson, setserviceJson] = useState<any>(null);
  const [MembershipsJson, setMembershipsJson] = useState<any>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [nextReservation, setNextReservation] = useState<any>(null);
  const [nextReservationClass, setNextReservationClass] = useState<any>(null);

  // Estado para modal de info/cancelar
  const [infoVisible, setInfoVisible] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const fetchMembership = async () => {
      if (user?.id) {
        try {
          const memberships = await getMembershipsByClient(String(user?.id), getStoredUserToken() ?? undefined);
          //setMembershipJson(memberships);
          if (
            memberships?.ClientMemberships?.length > 0 &&
            memberships.ClientMemberships[0]?.Memberships?.length > 0
          ) {
            const membership = memberships.ClientMemberships[0].Memberships[0];
            if (membership && membership.ProductId) {
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
              console.log("today:", today);
              console.log("timeDiff:", timeDiff);
              console.log("expirationDate:", expirationDate);
              console.log("Days left:", daysdiff);
              console.log("Membership fetched:", membership);
              console.log("Service fetched:", service);
              console.log("Token:", getStoredUserToken());
              console.log("ServiceName", service?.Name);
              setServiceName(service?.Name ?? null);
              setServiceCount(membership.Remaining ?? null);
              //setIdServiceName(membership.ProductId ?? null); 
            }
          }
        } catch (error) {
          console.error("Error fetching membership:", error);
        }
      }
    };

    fetchMembership();
  }, [user]);


  const fetchNextReservation = useCallback(async () => {
    if (user?.id) {
      try {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 14);
        const res = await findClientSchedule(String(user.id), start, end);
        const visits = res?.Visits || [];
        const now = new Date();
        const futureVisits = visits
          .filter((v: any) => new Date(v.StartDateTime) > now)
          .sort((a: any, b: any) => new Date(a.StartDateTime).getTime() - new Date(b.StartDateTime).getTime());
        const next = futureVisits[0] || null;
        setNextReservation(next);

        // Buscar la clase detallada si hay próxima reserva
        if (next) {
          // Busca clases de la semana de la próxima reserva
          const classDate = new Date(next.StartDateTime);
          const weekStart = new Date(classDate);
          weekStart.setDate(classDate.getDate() - classDate.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          const classesRes = await getClassesOfWeek(weekStart, weekEnd);
          const classes = classesRes?.Classes || [];
          const foundClass = classes.find((c: any) => String(c.Id) === String(next.ClassId));
          setNextReservationClass(foundClass || null);
        } else {
          setNextReservationClass(null);
        }
      } catch (e) {
        setNextReservation(null);
        setNextReservationClass(null);
      }
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchNextReservation();
    }, [fetchNextReservation])
  );

  // Puedes definir aquí un array de imágenes para el carrusel
  const yogaCarouselImages = [
    require('../../assets/gallery/108 yoga - Enero-37 2.jpg'),
    require('../../assets/gallery/108 yoga - Enero-41.jpg'),
    require('../../assets/gallery/108 yoga - octubre-28.jpg'),
    require('../../assets/gallery/108 yoga-47.jpg'),
    require('../../assets/gallery/Yoga Abril-71.jpg'),
    require('../../assets/gallery/Yoga Abril-125.jpg'),
    require('../../assets/gallery/Yoga Abril-159.jpg'),
  ];

  return (
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.title}>Namaste, {user?.FirstName ?? 'Yogi'}</Text>
          <Text style={styles.subtitle}>¡Bienvenido a tu espacio de bienestar!</Text>
        </View>

        {/* Próxima reserva */}
        {nextReservation && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setInfoVisible(true)}
          >
            <View style={styles.nextReservationCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Image
                  source={{
                    uri:
                      nextReservationClass?.ClassDescription?.ImageURL ||
                      nextReservation?.ClassDescription?.ImageURL ||
                      'https://source.unsplash.com/random/60x60?yoga'
                  }}
                  style={styles.nextReservationImg}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.nextReservationTitle}>Tu próxima clase reservada</Text>
                  <Text style={styles.nextReservationName}>
                    {nextReservationClass?.ClassDescription?.Name?.trim() ||
                      nextReservation?.Name?.trim() ||
                      'Clase'}
                  </Text>
                  <Text style={styles.nextReservationInstructor}>
                    con {nextReservationClass?.Staff?.Name ||
                      nextReservation?.Staff?.Name ||
                      'Profesor'}
                  </Text>
                  <Text style={styles.nextReservationTime}>
                    {new Date(nextReservation.StartDateTime).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(nextReservation.StartDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Modal de información y cancelar reserva */}
        <Modal
          visible={infoVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setInfoVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 24, width: 320, alignItems: 'center', elevation: 5, maxHeight: '85%' }}>
              {nextReservationClass && (
                <>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#78aaa9', marginBottom: 12 }}>{nextReservationClass.ClassDescription?.Name?.trim()}</Text>
                  <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 18 }}>
                    <Image
                      source={{ uri: nextReservationClass.Staff?.ImageUrl || 'https://source.unsplash.com/random/60x60?person' }}
                      style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#e8f1e8' }}
                    />
                    <Text style={{ fontWeight: 'bold', color: '#78aaa9', marginTop: 8, fontSize: 14 }}>Profesor:</Text>
                    <Text style={{ color: '#4b5563', fontSize: 13, marginBottom: 2 }}>{nextReservationClass.Staff?.Name}</Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', color: '#78aaa9', marginTop: 6, marginBottom: 2, fontSize: 14, alignSelf: 'flex-start' }}>Descripción:</Text>
                  <Text style={{ color: '#444', fontSize: 14, marginBottom: 2, alignSelf: 'flex-start' }}>{nextReservationClass.ClassDescription?.Description?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ').replace(/&uuml;/g, 'ü').replace(/&amp;/g, '&')}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 18, justifyContent: 'space-between' }}>
                    <TouchableOpacity
                      style={[styles.reserveBtn, { backgroundColor: '#aaa', marginRight: 8 }]}
                      onPress={() => setInfoVisible(false)}
                      disabled={reserving}
                    >
                      <Text style={styles.reserveText}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reserveBtn, { backgroundColor: '#e74c3c' }]}
                      disabled={reserving}
                      onPress={async () => {
                        if (!user?.UniqueId) return;
                        setReserving(true);
                        try {
                          await cancelClientFromClass(Number(nextReservationClass.Id), String(user.UniqueId));
                          setInfoVisible(false);
                          alert('Reserva cancelada.');
                          // Refresca la próxima reserva
                          fetchNextReservation();
                        } catch {
                          alert('No se pudo cancelar la reserva.');
                        } finally {
                          setReserving(false);
                        }
                      }}
                    >
                      <Text style={styles.reserveText}>{reserving ? 'Cancelando...' : 'Cancelar'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Stats */}
        {(serviceCount !== null || daysLeft !== null) && (
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
        )}
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

        {/* Carrusel de imágenes de yoga */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carouselScroll}
          >
            {yogaCarouselImages.map((img, idx) => (
              <Image
                key={idx}
                source={img}
                style={styles.carouselImg}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
    marginBottom: 8, // reducido para acercar la galería
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
  galleryContainer: {
    marginBottom: 24,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryImg: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#e8f1e8',
  },
  carouselContainer: {
    marginTop: 0, 
    marginBottom: 24,
    alignItems: 'center',
    width: '100%',
  },
  carouselScroll: {
    width: '100%',
  },
  carouselImg: {
    width: width - 48, 
    height: 400,
    borderRadius: 16,
    marginRight: 0,
    backgroundColor: '#e8f1e8',
    alignSelf: 'center',
  },
  nextReservationCard: {
    backgroundColor: '#78aaa9',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  nextReservationImg: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#e8f1e8',
  },
  nextReservationTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  nextReservationName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  nextReservationInstructor: {
    color: '#e8f1e8',
    fontSize: 14,
    marginBottom: 2,
  },
  nextReservationTime: {
    color: '#e8f1e8',
    fontSize: 13,
  },
   reserveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});