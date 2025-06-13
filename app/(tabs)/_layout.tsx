import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image, View, Text, StyleSheet } from 'react-native';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#78aaa9',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerLeft: () => (
          <Image
            source={require('../../assets/108-yoga.png')}
            style={styles.headerLogo}
          />
        ),
        headerTitle: () => (
          <Text style={styles.headerTitleText}>108yoga</Text>
        ),
        headerTitleAlign: 'center',
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';

          if (route.name === 'home') iconName = 'home';
          else if (route.name === 'classes') iconName = 'calendar';
          else if (route.name === 'profile') iconName = 'user';

          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          tabBarLabel: 'Clases',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginRight: 8,
    resizeMode: 'contain',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78aaa9',
    textAlign: 'center',
  },
});
