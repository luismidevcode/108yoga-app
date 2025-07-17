import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';



export default function TabLayout() {

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={({
          route,
        }: {
          route: { name: string };
        }) => ({
          tabBarActiveTintColor: '#78aaa9',
          tabBarInactiveTintColor: 'gray',
          headerShown: true,
          headerStyle: styles.headerStyle,
          header: () => {
            let title = '108yoga';
            if (route.name === 'booking') title = 'Reservar';
            else if (route.name === 'profile') title = 'Perfil';
            return (
              <View>
                {/* Banner Beta en el header */}
                <SafeAreaView style={styles.betaBannerSafeArea} edges={['top']}>
                  <View style={styles.betaBanner}>
                    <View style={styles.betaBannerContent}>
                      <Feather name="info" size={16} color="#78aaa9" style={styles.betaBannerIcon} />
                      <View style={styles.betaBannerTextRow}>
                        <Text style={styles.betaBannerTextBold}>Versión Beta: </Text>
                        <Text style={styles.betaBannerText}>¡Tu feedback nos ayuda a mejorar!</Text>
                      </View>
                    </View>
                  </View>
                </SafeAreaView>
                {/* Header principal */}
                <View style={styles.headerMainContainer}>
                  {/* Izquierda: logo y badge */}
                  <View style={styles.headerLeft}>
                    <Image
                      source={require('../../assets/108-yoga.png')}
                      style={styles.headerLogo}
                    />
                    <View style={styles.betaBadge}>
                      <Text style={styles.betaBadgeText}>BETA</Text>
                    </View>
                  </View>
                  {/* Centro: título */}
                  <View style={styles.headerCenter}>
                    <Text style={styles.headerTitleText}>{title}</Text>
                  </View>
                  {/* Derecha: espacio vacío para balancear */}
                  <View style={styles.headerRight} />
                </View>
              </View>
            );
          },
          headerTitleAlign: 'center',
          tabBarIcon: ({
            color,
            size,
          }: {
            color: string;
            size: number;
          }) => {
            let iconName = 'home';
            if (route.name === 'home') iconName = 'home';
            else if (route.name === 'booking') iconName = 'calendar';
            else if (route.name === 'profile') iconName = 'user';
            return <Feather name={iconName as any} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: 'Inicio',
            headerTitle: '108yoga',
            headerTitleStyle: styles.bookingHeaderTitle,
          }}
        />
        <Tabs.Screen
          name="booking"
          options={{
            tabBarLabel: 'Reservar',
            headerTitle: 'Reservar',
            headerTitleStyle: styles.bookingHeaderTitle,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: 'Perfil',
            headerTitle: 'Perfil',
            headerTitleStyle: styles.bookingHeaderTitle,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Layout ---
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // bg-gray-50
  },

  // --- Header ---
  headerStyle: {
    backgroundColor: '#fff',
    shadowColor: 'transparent',
    elevation: 0,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginLeft: 8,
    marginRight: 6,
    resizeMode: 'contain',
  },
  headerTitleText: {
    color: '#78aaa9',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4, // Ajustado para centrar mejor
    alignItems: 'center',
  },
  bookingHeaderTitle: {
    textAlign: 'left',
    color: '#78aaa9',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // --- Beta Badge ---
  betaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f2f1',
    borderRadius: 6,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#78aaa9',
    marginTop: 10, // <--- Reducido aún más
  },
  betaBadgeText: {
    color: '#78aaa9',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // --- Beta Banner ---
  betaBannerSafeArea: {
    backgroundColor: '#e6f2f1',
  },
  betaBanner: {
    backgroundColor: '#e6f2f1',
    borderBottomWidth: 1,
    borderBottomColor: '#b6d8d6',
    paddingHorizontal: 12,
    paddingVertical: 4, // <--- Reducido aún más
  },
  betaBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  betaBannerTextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  headerMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 140,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    maxWidth: 140,
  },
  betaBannerIcon: {
    marginRight: 6,
  },
  betaBannerText: {
    color: '#78aaa9',
    fontSize: 13,
    fontWeight: '500',
  },
  betaBannerTextBold: {
    fontWeight: 'bold',
    color: '#78aaa9',
  },
});
