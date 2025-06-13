import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { Redirect } from 'expo-router';
import { useEffect,useState } from 'react';
import { useUser } from '../context/UserContext'; 
import { getUserToken } from '../lib/mindBodyUserToken';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user, loading } = useUser();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    // Llama y guarda el token MindBody al abrir la app
    getUserToken()
    .then(() => setTokenReady(true))
    .catch(() => setTokenReady(true));
  }, []);

  useEffect(() => {
    if (!loading && tokenReady) {
      SplashScreen.hideAsync();
    }
  }, [loading, tokenReady]);

  if (loading || !tokenReady) {
    return null; // Splash sigue visible
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }
  return <Redirect href="/login" />;
}

/*

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );s
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
*/