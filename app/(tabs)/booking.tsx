import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Pressable } from 'react-native';
import { getClassesOfWeek, addClientToClass, cancelClientFromClass } from '../../lib/mindBodyClass'; // Ajusta según ruta
import { useUser } from '../../context/UserContext';
import { findClientSchedule } from '../../lib/mindBodyClients';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { getMembershipsByClient, getPurchasesByClient } from '../../lib/mindBodyMemberships';
import { getStoredUserToken } from '../../lib/mindBodyUserToken';

const weekDays = [
  { label: 'Dom', value: 0 },
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 },
  { label: 'Jue', value: 4 },
  { label: 'Vie', value: 5 },
  { label: 'Sáb', value: 6 },
];

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function stripHtml(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ').replace(/&uuml;/g, 'ü').replace(/&amp;/g, '&');
}

export default function BookingScreen() {
  const { user } = useUser();
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [weeklyClasses, setWeeklyClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [reserving, setReserving] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoClass, setInfoClass] = useState<any>(null);
  const [clientSchedule, setClientSchedule] = useState<any[]>([]);
  const [cancelVisible, setCancelVisible] = useState(false); // Nuevo estado para modal cancelar
  const scrollRef = useRef<ScrollView>(null);
  // Estado local para controlar si ya se enfocó la clase
  const [hasFocusedClass, setHasFocusedClass] = useState(false);
  const [pendingFocusClassData, setPendingFocusClassData] = useState<any>(null);
  const [shouldScrollToFirstClass, setShouldScrollToFirstClass] = useState(false);
  const [activeServices, setActiveServices] = useState<any[]>([]); // Estado para servicios activos


  const fetchWeekClasses = async (
    start: Date) => {
    const end = addDays(start, 6);
    end.setHours(18, 0, 0, 0);
    setLoading(true);
    try {
      const res = await getClassesOfWeek(start, end);
      setWeeklyClasses(res.Classes ?? []);
    } catch (err) {
      console.error('Error al obtener clases:', err);
      setWeeklyClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
  React.useCallback(() => {
    setShouldScrollToFirstClass(true);
  }, [])
);

  useFocusEffect(
  React.useCallback(() => {
    if (user?.id) {
      const start = weekStart;
      const end = addDays(weekStart, 6);
      end.setHours(23, 59, 59, 999); // Cambiado para incluir todo el día
      console.log('useFocusEffect - Buscando reservas desde:', start.toISOString(), 'hasta:', end.toISOString());
      findClientSchedule(String(user.id), start, end)
        .then(res => {
          console.log('useFocusEffect - Reservas encontradas:', res.Visits?.length || 0, res.Visits);
          setClientSchedule(res.Visits || []);
        })
        .catch(() => setClientSchedule([]));
    }
  }, [user?.id, weekStart])
);

  // Efecto para seleccionar el día y hacer scroll si viene focusClassId
  useEffect(() => {
    fetchWeekClasses(weekStart);
  }, [weekStart]);


  useEffect(() => {
    if (user?.id) {
      const start = weekStart;
      const end = addDays(weekStart, 6);
      // Cambiado para incluir todo el día hasta las 23:59
      end.setHours(23, 59, 59, 999);
      console.log('useEffect - Buscando reservas desde:', start.toISOString(), 'hasta:', end.toISOString());
      findClientSchedule(String(user.id), start, end).then(res => {
        console.log('useEffect - Reservas encontradas:', res.Visits?.length || 0, res.Visits?.map((v: any) => ({
          ClassId: v.ClassId,
          StartDateTime: v.StartDateTime,
          dayOfWeek: new Date(v.StartDateTime).getDay()
        })));
        setClientSchedule(res.Visits || []);
      }).catch(() => setClientSchedule([]));
    }
  }, [weekStart]);

  const daysOfWeek = weekDays.map((day, idx) => {
    const date = addDays(weekStart, idx);
    return {
      ...day,
      date,
      dayNumber: date.getDate(),
      isToday: date.toDateString() === new Date().toDateString(),
    };
  });

  const selectedDate = addDays(weekStart, selectedDay);
  const selectedDayString = selectedDate.toISOString().split('T')[0]; // formato yyyy-mm-dd

  const availableClasses = weeklyClasses.filter(cl => {
    const classDate = cl.StartDateTime?.split('T')[0];
    return classDate === selectedDayString;
  }
  ).sort((a, b) => new Date(a.StartDateTime).getTime() - new Date(b.StartDateTime).getTime());

  // Encuentra el índice de la primera clase habilitada
  const firstEnabledIndex = availableClasses.findIndex(item => {
    const start = new Date(item.StartDateTime);
    const now = new Date();
    const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60);
    return !(diffMinutes < 0 || diffMinutes < -20);
  });
  useEffect(() => {
  setShouldScrollToFirstClass(true);
}, [selectedDay]);

  // Efecto para hacer scroll automático a la primera clase habilitada
useEffect(() => {
  if (!shouldScrollToFirstClass || !scrollRef.current) return;

  setTimeout(() => {
    if (firstEnabledIndex > 0) {
      scrollRef.current?.scrollTo({ y: firstEnabledIndex * 100, animated: true });
    } else {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
    setShouldScrollToFirstClass(false); // Evita scrolls innecesarios
  }, 300);
}, [shouldScrollToFirstClass, availableClasses.length, firstEnabledIndex, selectedDay, hasFocusedClass]);



  // Helper para saber si el usuario tiene reservada la clase
  const isClassReserved = (classId: number) => {
    // Si clientSchedule tiene Visits, úsalo; si es array, úsalo directo
    const visits = Array.isArray(clientSchedule) ? clientSchedule : (clientSchedule || []);
    const isReserved = visits.some((v: any) => String(v.ClassId) === String(classId));
    
    // Debug específico para sábados
    const now = new Date();
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 6) { // Si es sábado
      console.log(`SÁBADO - isClassReserved para clase ${classId}:`, {
        classId,
        isReserved,
        totalVisits: visits.length,
        visits: visits.map((v: any) => ({ ClassId: v.ClassId, StartDateTime: v.StartDateTime }))
      });
    }
    
    return isReserved;
  };

  useEffect(() => {
    const fetchActiveServices = async () => {
      if (user?.id) {
        try {
          // Usar las fechas predefinidas (1 año y 1 mes atrás hasta hoy)
          const purchases = await getPurchasesByClient(String(user?.id));
          const currentDate = new Date();
  
          // 1. Filtrar solo compras con servicios
          const services = purchases.Purchases.filter((p: any) =>
            Array.isArray(p.Sale.PurchasedItems) &&
            p.Sale.PurchasedItems.some((item: any) => item.IsService)
          );
  
          // 2. Filtrar solo servicios activos (no expirados)
          const activeServicesFound = services.filter((service: any) => {
            const serviceItem = service.Sale.PurchasedItems.find(
              (item: any) => item.IsService
            );
            if (serviceItem && serviceItem.ExpDate) {
              const expDate = new Date(serviceItem.ExpDate);
              return expDate > currentDate; // Solo servicios no expirados
            }
            return false;
          });
  
          // 3. Ordenar por fecha de expiración (más próximo a expirar primero)
          activeServicesFound.sort((a: any, b: any) => {
            const expDateA = new Date(a.Sale.PurchasedItems.find((item: any) => item.IsService).ExpDate);
            const expDateB = new Date(b.Sale.PurchasedItems.find((item: any) => item.IsService).ExpDate);
            return expDateA.getTime() - expDateB.getTime();
          });

          // Guardar servicios activos en el estado
          setActiveServices(activeServicesFound);
  
          console.log(`Servicios activos encontrados: ${activeServicesFound.length}`);
  
          // 4. Mostrar información de todos los servicios activos
          if (activeServicesFound.length > 0) {
            activeServicesFound.forEach((service: any, index: number) => {
              const serviceItem = service.Sale.PurchasedItems.find(
                (item: any) => item.IsService
              );
              
              const expDate = new Date(serviceItem.ExpDate);
              const daysUntilExpiration = Math.ceil(
                (expDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
              );
  
              console.log(`Servicio activo ${index + 1}:`, {
                id: service.Sale.Id,
                descripcion: serviceItem.Description,
                fechaVenta: service.Sale.SaleDate,
                expira: serviceItem.ExpDate,
                diasParaExpirar: daysUntilExpiration
              });
            });
          } else {
            console.log("No se encontraron servicios activos para este cliente.");
          }
        } catch (error) {
          console.error("Error fetching active services:", error);
          setActiveServices([]);
        }
      }
    };
  
    fetchActiveServices();
  }, [user]);


const hasActiveMembership = () => {
  return Array.isArray(activeServices) && activeServices.length > 0;
};
  return (
    <View style={styles.bg}>
      {/* Modal de información de clase */}
      <Modal
        visible={infoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            {infoClass && (
              <>
                <Text style={styles.modalTitle}>{infoClass.ClassDescription?.Name?.trim()}</Text>
                {/* Imagen y nombre del profesor, mejor organizados */}
                <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 18 }}>
                  <Image
                    source={{ uri: infoClass.Staff?.ImageUrl || 'https://source.unsplash.com/random/60x60?person' }}
                    style={styles.teacherImg}
                  />
                  <Text style={[styles.infoLabel, { marginTop: 8 }]}>Profesor:</Text>
                  <Text style={styles.classInstructor}>{infoClass.Staff?.Name}</Text>
                </View>
                <Text style={styles.infoLabel}>Descripción:</Text>
                <Text style={styles.infoText}>{stripHtml(infoClass.ClassDescription?.Description)}</Text>
                <View style={{ flexDirection: 'row', marginTop: 18, justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={[styles.reserveBtn, { backgroundColor: '#aaa', marginRight: 8 }]}
                    onPress={() => setInfoVisible(false)}
                  >
                    <Text style={styles.reserveText}>Cerrar</Text>
                  </TouchableOpacity>
                  {isClassReserved(infoClass.Id) ? (
                    <TouchableOpacity
                      style={[styles.reserveBtn, { backgroundColor: '#e74c3c' }]}
                      onPress={() => {
                        setInfoVisible(false);
                        setSelectedClass(infoClass);
                        setCancelVisible(true);
                      }}
                    >
                      <Text style={styles.reserveText}>Cancelar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.reserveBtn}
                      onPress={() => {
                        if (!hasActiveMembership()) {
                          alert('Necesitas un plan activo para reservar una clase.');
                          return;
                        }
                        setInfoVisible(false);
                        setSelectedClass(infoClass);
                        setConfirmVisible(true);
                      }}
                    >
                      <Text style={styles.reserveText}>Reservar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de reserva */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedClass && (
              <>
                <Text style={styles.modalTitle}>Confirmar reserva</Text>
                <Image
                  source={{ uri: selectedClass.ClassDescription?.ImageURL || 'https://source.unsplash.com/random/100x100?yoga' }}
                  style={styles.modalImg}
                />
                <Text style={styles.className}>{selectedClass.ClassDescription?.Name.trim()}</Text>
                <Text style={styles.classInstructor}>con {selectedClass.Staff?.Name}</Text>
                <Text style={styles.classTime}>
                  {new Date(selectedClass.StartDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })} - {new Date(selectedClass.EndDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 18, justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={[styles.reserveBtn, { backgroundColor: '#aaa', marginRight: 8 }]}
                    onPress={() => setConfirmVisible(false)}
                    disabled={reserving}
                  >
                    <Text style={styles.reserveText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.reserveBtn}
                    disabled={reserving}
                    onPress={async () => {
                      if (!user?.UniqueId) return;
                      setReserving(true);
                      try {
                        await addClientToClass(Number(selectedClass.Id), String(user.id));
                        setConfirmVisible(false);
                        alert('Reserva realizada con éxito 🎉');
                        // Actualiza el schedule después de reservar
                        const start = weekStart;
                        const end = addDays(weekStart, 6);
                        end.setHours(23, 59, 59, 999); // Asegurar que incluya todo el día
                        console.log('Después de reservar - Actualizando schedule desde:', start.toISOString(), 'hasta:', end.toISOString());
                        const res = await findClientSchedule(String(user.id), start, end);
                        console.log('Después de reservar - Nuevas reservas:', res.Visits?.length || 0, res.Visits);
                        setClientSchedule(res.Visits || []);
                      } catch (err) {
                        alert('Error al reservar esta clase.');
                      } finally {
                        setReserving(false);
                      }
                    }}
                  >
                    <Text style={styles.reserveText}>{reserving ? 'Reservando...' : 'Confirmar'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de cancelación */}
      <Modal
        visible={cancelVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedClass && (
              <>
                <Text style={styles.modalTitle}>Cancelar reserva</Text>
                <Image
                  source={{ uri: selectedClass.ClassDescription?.ImageURL || 'https://source.unsplash.com/random/100x100?yoga' }}
                  style={styles.modalImg}
                />
                <Text style={styles.className}>{selectedClass.ClassDescription?.Name.trim()}</Text>
                <Text style={styles.classInstructor}>con {selectedClass.Staff?.Name}</Text>
                <Text style={styles.classTime}>
                  {new Date(selectedClass.StartDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })} - {new Date(selectedClass.EndDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 18, justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={[styles.reserveBtn, { backgroundColor: '#aaa', marginRight: 8 }]}
                    onPress={() => setCancelVisible(false)}
                    disabled={reserving}
                  >
                    <Text style={styles.reserveText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.reserveBtn, { backgroundColor: '#e74c3c' }]}
                    disabled={reserving}
                    onPress={async () => {
                      if (!user?.UniqueId) return;
                      setReserving(true);
                      try {
                        await cancelClientFromClass(Number(selectedClass.Id), String(user.id));
                        setCancelVisible(false);
                        alert('Reserva cancelada.');
                        // Actualiza el schedule
                        const start = weekStart;
                        const end = addDays(weekStart, 6);
                        end.setHours(23, 59, 59, 999); // Asegurar que incluya todo el día
                        console.log('Después de cancelar - Actualizando schedule desde:', start.toISOString(), 'hasta:', end.toISOString());
                        const res = await findClientSchedule(String(user.id), start, end);
                        console.log('Después de cancelar - Nuevas reservas:', res.Visits?.length || 0, res.Visits);
                        setClientSchedule(res.Visits || []);
                      } catch {
                        alert('No se pudo cancelar la reserva.');
                      } finally {
                        setReserving(false);
                      }
                    }}
                  >
                    <Text style={styles.reserveText}>{reserving ? 'Cancelando...' : 'Sí, cancelar'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Navegación de semana */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => {
          const prev = addDays(weekStart, -7);
          setWeekStart(prev);
          setSelectedDay(0);
        }} style={styles.weekNavBtn}>
          <Text style={styles.weekNavBtnText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.weekNavText}>
          {daysOfWeek[0].date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {daysOfWeek[6].date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => {
          const next = addDays(weekStart, 7);
          setWeekStart(next);
          setSelectedDay(0);
        }} style={styles.weekNavBtn}>
          <Text style={styles.weekNavBtnText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Calendario de días */}
      <View style={styles.calendarRow}>
        {daysOfWeek.map((day, idx) => (
          <TouchableOpacity
            key={day.value}
            style={[
              styles.calendarDay,
              selectedDay === idx && styles.calendarDaySelected,
              day.isToday && styles.calendarDayToday,
            ]}
            onPress={() => {
              setSelectedDay(idx);
              setHasFocusedClass(true); // Permitir navegación manual después de enfocar
            }}
          >
            <Text style={[
              styles.calendarDayText,
              selectedDay === idx && styles.calendarDayTextSelected,
            ]}>
              {day.label}
            </Text>
            <Text style={[
              styles.calendarDayNumber,
              selectedDay === idx && styles.calendarDayTextSelected,
            ]}>
              {day.dayNumber}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido de clases */}
      <ScrollView contentContainerStyle={styles.scroll} ref={scrollRef}>
        {loading && <ActivityIndicator size="large" color="#888" style={{ marginTop: 20 }} />}

        {!loading && availableClasses.length === 0 && (
          <View style={styles.noClasses}>
            <Text style={{ color: '#888' }}>No hay clases para este día</Text>
          </View>
        )}

        {availableClasses.map((item, idx) => {
          const start = new Date(item.StartDateTime);
          const now = new Date();
          const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60);
          const isPast = diffMinutes < 0 || diffMinutes < -20;
          const reserved = isClassReserved(item.Id);
          
          // Debug específico para sábados
          const dayOfWeek = start.getDay(); // 0 = domingo, 6 = sábado
          if (dayOfWeek === 6) { // Si es sábado
            console.log(`SÁBADO - Renderizando clase ${item.Id}:`, {
              className: item.ClassDescription?.Name,
              startDateTime: item.StartDateTime,
              classId: item.Id,
              reserved,
              isPast,
              diffMinutes,
              dayOfWeek
            });
          }
          
          return (
            <Pressable
              key={idx}
              style={[
                styles.classCard,
                isPast && { opacity: 0.4 }
              ]}
              onPress={() => {
                if (isPast) return;
                setInfoClass(item);
                setInfoVisible(true);
              }}
              disabled={isPast}
            >
              <Image source={{ uri: item.ClassDescription?.ImageURL || 'https://source.unsplash.com/random/100x100?yoga' }} style={styles.classImg} />
              <View style={styles.classInfoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.className}>{item.ClassDescription?.Name.trim()}</Text>
                  <Text style={styles.classInstructor}>con {item.Staff?.Name}</Text>
                  <Text style={styles.classTime}>
                    {new Date(item.StartDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })} - {new Date(item.EndDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Text>
                </View>
                {!isPast && (
                  reserved ? (
                    <TouchableOpacity
                      style={[styles.reserveBtn, { backgroundColor: '#e74c3c' }]}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        setSelectedClass(item);
                        setCancelVisible(true); // Mostrar modal de cancelar
                      }}
                      disabled={reserving}
                    >
                      <Text style={styles.reserveText}>Cancelar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.reserveBtn}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        setSelectedClass(item);
                        if (!hasActiveMembership()) {
                          alert('Necesitas un plan activo para reservar una clase.');
                          return;
                        }
                        if (diffMinutes < 0) {
                          alert('No puedes reservar esta clase porque ya ha comenzado.');
                          return;
                        }
                        if (diffMinutes < 20) {
                          alert('No puedes reservar esta clase porque comienza en menos de 20 minutos.');
                          return;
                        }
                        setConfirmVisible(true);
                      }}
                    >
                      <Text style={styles.reserveText}>Reservar</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Aquí irían tus estilos como ya los tenías


const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#fff',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 2,
    backgroundColor: '#fff',
    marginBottom: 12,
    marginTop: 6,
  },
  weekNavBtn: {
    padding: 6,
    borderRadius: 6,
  },
  weekNavBtnText: {
    fontSize: 20,
    color: '#78aaa9',
    fontWeight: 'bold',
  },
  weekNavText: {
    fontSize: 15,
    color: '#444',
    fontWeight: 'bold',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  calendarDay: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#e8f1e8',
    minWidth: 38,
  },
  calendarDaySelected: {
    backgroundColor: '#78aaa9',
  },
  calendarDayToday: {
    borderWidth: 1.5,
    borderColor: '#78aaa9',
  },
  calendarDayText: {
    color: '#78aaa9',
    fontWeight: 'bold',
    fontSize: 13,
  },
  calendarDayTextSelected: {
    color: '#fff',
  },
  calendarDayNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#78aaa9',
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
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
  classCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    borderWidth: 0.5,
    borderColor: '#78aaa9',
  },
  classImg: {
    width: 72,
    height: 72,
    backgroundColor: '#e8f1e8',
  },
  classInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  classInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'space-between',
  },
  className: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#444',
  },
  classInstructor: {
    color: '#4b5563',
    fontSize: 13,
    marginBottom: 2,
  },
  classTime: {
    color: '#4b5563',
    fontSize: 13,
    marginBottom: 4,
  },
  reserveBtn: {
    backgroundColor: '#78aaa9',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'auto', // Cambiado para permitir alineación por el row
  },
  reserveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noClasses: {
    alignItems: 'center',
    marginVertical: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    width: 300,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78aaa9',
    marginBottom: 12,
  },
  modalImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#e8f1e8',
  },
  infoModalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    width: 320,
    alignItems: 'center',
    elevation: 5,
    maxHeight: '85%',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#78aaa9',
    marginTop: 6,
    marginBottom: 2,
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  infoText: {
    color: '#444',
    fontSize: 14,
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  teacherImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f1e8',
  },

});

