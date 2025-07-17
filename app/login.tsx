import { supabase } from '../lib/supabase';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import GradientContainer from '../components/GradientContainer';
import { findClientByEmail } from '../lib/mindBodyClients'; 
import { getUserToken   } from '../lib/mindBodyUserToken'; 
import { getStoredUserToken } from '../lib/mindBodyUserToken';
import { useRouter } from 'expo-router'; // Asegúrate de tener instalado expo-router
import { useUser } from '../context/UserContext'; // ajusta si tu ruta es diferente



export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false); // Nuevo estado para error OTP
  const [message, setMessage] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [initError, setInitError] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const { saveUser } = useUser();
  const [clientData, setClientData] = useState<any>(null);
  const [findClientResponse, setFindClientResponse] = useState<any>(null);

  // Nueva función para intentar obtener el token y manejar el error
  const tryGetUserToken = async () => {
    try {
      await getUserToken();
      const token = getStoredUserToken();
      setUserToken(token);
      setInitError(false);
    } catch {
      setInitError(true);
      Alert.alert(
        'Error',
        'Ocurrió un error al iniciar la app. Pruebe la conexión a internet.',
        [
          {
            text: 'Reintentar',
            onPress: () => {
              tryGetUserToken();
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  useEffect(() => {
    tryGetUserToken();
    // Cambia esto para obtener el token de forma asíncrona
    const fetchToken = async () => {
      const token = await getStoredUserToken();
      setUserToken(token);
    };
    fetchToken();
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailValid(validateEmail(value) || value === '');
    if (message) {
      setMessage(''); 
    }
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      setEmailValid(false);
      setMessage('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    setLoading(true);
    setMessage('');
    // Verificar si el cliente ya existe en MindBody
    try {
      const result = await findClientByEmail(email);
      setFindClientResponse(result);
      const clients = result.Clients || result.clients || [];
      if (!clients.length) {
        setMessage('No se encontró un cliente con ese correo electrónico');
        setLoading(false);
        return;
      }
      setClientData(clients[0]); // Guarda el cliente para usarlo después del OTP

      // BYPASS OTP para pruebas con correo específico
      if (email === 'luismiguelbotero2327@gmail.com') {
        await saveUser(clients[0]);
        setLoading(false);
        router.replace('/(tabs)/home');
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({ email });
      setLoading(false);
      if (error) {
        setMessage(error.message);
      } else {
        setStep('otp');
        setMessage('Te enviamos un código a tu correo.');
      }
    } catch (error: any) {
      console.log('findClientByEmail error:', error);
      setMessage('Error: ' + (error?.message || JSON.stringify(error))); // <-- Mostrar error en pantalla
      setLoading(false);
    }
  };
  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage('');
    setOtpError(false);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    setLoading(false);
    if (error) {
      setOtp('');
      setOtpError(true);
      
      // Opcional: enfocar el primer input
      setTimeout(() => {
        otpInputs[0].current?.focus();
      }, 100);
    } else {
      setOtpError(false);
      setMessage('');
      if (clientData) {
        await saveUser(clientData); // Guarda los datos del usuario en el contexto
      }
      router.replace('/(tabs)/home');
    }
  };

    // Referencias para los inputs OTP
  const otpInputs = Array.from({ length: 6 }, () => useRef<TextInput>(null));

  // Maneja el cambio de cada dígito OTP
  const handleOtpChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return; // Solo permite dígitos o vacío
    let newOtp = otp.split('');
    newOtp[idx] = value;
    newOtp = newOtp.map((v, i) => v || ''); // Asegura longitud 6
    setOtp(newOtp.join(''));
    if (value && idx < 5) {
      otpInputs[idx + 1].current?.focus();
    }
    if (!value && idx > 0) {
      otpInputs[idx - 1].current?.focus();
    }
  };

  // Maneja el retroceso para moverse al input anterior
  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpInputs[idx - 1].current?.focus();
    }
  };

  return (
    <GradientContainer style={styles.bg}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Image
            source={require('../assets/108-yoga.png')} 
            style={{ width: 100, height: 100, marginBottom: 20 }}
            resizeMode="contain"
          />
          {/* Botón de prueba para saltar login */}
          {/*__DEV__ && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#e53935', marginBottom: 12 }]}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Entrar (PRUEBA)</Text>
            </TouchableOpacity>
          )*/}
          {/* Solo muestra el texto si no hay error */}
          {!initError && (
            <>
              {//<Text style={styles.subtitle}>{userToken}</Text>
              }
              <Text style={styles.title}>Inicia sesión</Text>
              {//<Text style={styles.subtitle} >{JSON.stringify(findClientResponse)}</Text>
              }
              <Text style={styles.subtitle}>
                {step === 'email'
                  ? 'Ingresa tu correo para continuar'
                  : `Ingresa el código enviado a ${email}`}
              </Text>
            </>
          )}
          {!initError && (
            <>
              {step === 'email' ? (
                <>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#aaa"
                  />
                  <TouchableOpacity
                    style={[styles.button, !email || loading ? styles.buttonDisabled : null]}
                    onPress={handleSendOtp}
                    disabled={!email || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Continuar</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Código de verificación</Text>
                  <View style={styles.otpContainer}>
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <TextInput
                        key={idx}
                        ref={otpInputs[idx]}
                        style={[
                          styles.otpInput,
                          otpError && { borderColor: '#e53935' }
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={otp[idx] || ''}
                        onChangeText={value => {
                          setOtpError(false);
                          handleOtpChange(value, idx);
                        }}
                        onKeyPress={e => handleOtpKeyPress(e, idx)}
                        autoFocus={idx === 0}
                        placeholder="•"
                        placeholderTextColor="#aaa"
                        textAlign="center"
                        returnKeyType="next"
                      />
                    ))}
                  </View>
                  {otpError && (
                    <Text style={styles.otpErrorText}>Código inválido</Text>
                  )}
                  <TouchableOpacity
                    style={[styles.button, otp.length !== 6 || loading ? styles.buttonDisabled : null]}
                    onPress={handleVerifyOtp}
                    disabled={otp.length !== 6 || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Verificar código</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.linkButton} onPress={() => {
                    setStep('email');
                    setMessage('');
                    setOtpError(false); // Quitar mensaje de código inválido al volver
                  }}>
                    <Text style={styles.linkText}>Volver</Text>
                  </TouchableOpacity>
                </>
              )}
              {message ? <Text style={styles.message}>{message}</Text> : null}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </GradientContainer>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#e0c3fc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
  },  
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#78aaa9',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 15,
    marginBottom: 18,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    color: '#444',
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#78aaa9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#e8f1e8',
  },
  button: {
    width: '100%',
    backgroundColor: '#78aaa9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#c1d4d3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    color: '#78aaa9', // Cambiado de #6a11cb a #78aaa9
    fontWeight: 'bold',
    fontSize: 15,
  },
  message: {
    marginTop: 18,
    color: '#78aaa9',
    textAlign: 'center',
    fontSize: 15,
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: '#6a11cb',
  },
    otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  otpInput: {
    width: 40,
    height: 48,
    borderWidth: 1,
    borderColor: '#78aaa9',
    borderRadius: 8,
    marginHorizontal: 4,
    fontSize: 22,
    color: '#222',
    backgroundColor: '#e8f1e8',
    textAlign: 'center',
  },
  otpErrorText: {
    color: '#e53935',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: 'bold',
  },
});