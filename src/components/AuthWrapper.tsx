import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [step, setStep] = useState<'welcome' | 'login' | 'authenticated'>('welcome');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animaciones
  const [fadeWelcome] = useState(() => new Animated.Value(0));
  const [fadeLogin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // 1. Animación inicial: Desvanecer bienvenidos hacia adentro
    Animated.timing(fadeWelcome, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 2. Temporizador de 3 segundos para cambiar al formulario de Login
    const timer = setTimeout(() => {
      // Desvanecer bienvenidos hacia afuera
      Animated.timing(fadeWelcome, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setStep('login');
        // Desvanecer login hacia adentro
        Animated.timing(fadeLogin, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [fadeWelcome, fadeLogin]);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa todos los campos.');
      return;
    }

    if (username === 'admin' && password === '123') {
      setError('');
      setIsLoading(true);
      
      // Pequeño loader para dar una sensación de procesamiento premium
      setTimeout(() => {
        setIsLoading(false);
        setStep('authenticated');
      }, 800);
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  if (step === 'authenticated') {
    return <>{children}</>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#090D16" />

      {step === 'welcome' && (
        <Animated.View style={[styles.welcomeContainer, { opacity: fadeWelcome }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SENA</Text>
          </View>
          <Text style={styles.welcomeTitle}>Bienvenido</Text>
          <Text style={styles.welcomeSubtitle}>Adso 3145650</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.developerLabel}>Desarrollado por</Text>
          <Text style={styles.developerName}>Mario Fernando Ortiz Parra</Text>
        </Animated.View>
      )}

      {step === 'login' && (
        <Animated.View style={[styles.loginContainer, { opacity: fadeLogin }]}>
          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>Iniciar Sesión</Text>
            <Text style={styles.loginSubtitle}>Ingresa tus credenciales para continuar</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Ej. usuario"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (error) setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="••••••••"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed ? styles.buttonPressed : null,
                isLoading ? styles.buttonDisabled : null,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Ingresar</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    marginBottom: 16,
  },
  badgeText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
    marginBottom: 40,
  },
  developerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  developerName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  loginContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#121829',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  loginHeader: {
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  loginSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: -8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputError: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
