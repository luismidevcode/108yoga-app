import { View, Text, TouchableOpacity } from 'react-native';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { logout } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Pantalla de perfil</Text>
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginTop: 24,
          backgroundColor: '#78aaa9',
          paddingVertical: 12,
          paddingHorizontal: 32,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}