import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getClassesOfWeek, addClientToClass } from '../../lib/mindBodyClass'; // Ajusta según ruta
import { useUser } from '../../context/UserContext';

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

export default function BookingScreen() {
  const { user } = useUser();
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [weeklyClasses, setWeeklyClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWeekClasses = async (start: Date) => {
    const end = addDays(start, 6);
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

  useEffect(() => {
    fetchWeekClasses(weekStart);
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


  return (
    <View style={styles.bg}>
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
            onPress={() => setSelectedDay(idx)}
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
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading && <ActivityIndicator size="large" color="#888" style={{ marginTop: 20 }} />}

        {!loading && availableClasses.length === 0 && (
          <View style={styles.noClasses}>
            <Text style={{ color: '#888' }}>No hay clases para este día</Text>
          </View>
        )}

        {availableClasses.map((item, idx) => (
          <View key={idx} style={styles.classCard}>
            <Image source={{ uri: item.ClassDescription?.ImageURL || 'https://source.unsplash.com/random/100x100?yoga' }} style={styles.classImg} />
            <View style={styles.classInfoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.className}>{item.ClassDescription?.Name.trim()}</Text>
                <Text style={styles.classInstructor}>con {item.Staff?.Name}</Text>
                <Text style={styles.classTime}>
                   {new Date(item.StartDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.EndDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.reserveBtn}
                
                onPress={async () => {
                  try {
                    if (!user?.UniqueId) return;

                    await addClientToClass(Number(item.Id), String(user.UniqueId));
                    alert('Reserva realizada con éxito 🎉');
                    console.log('Reserva exitosa para clase:', item.ClassDescription?.Name);
                    console.log('Clase ID:', item.Id);
                    console.log('Usuario ID:', user.UniqueId);
                  } catch (err) {
                    console.error('Error al reservar:', err);
                    alert('Error al reservar esta clase.');
                    console.log('Reserva exitosa para clase:', item.ClassDescription?.Name);
                    console.log('Clase ID:', item.Id);
                    console.log('Usuario ID:', user?.UniqueId);
                  }
                }}
              >
                <Text style={styles.reserveText}>Reservar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
});
