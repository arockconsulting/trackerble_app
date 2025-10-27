import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext.js';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !company || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      await register({ name, email, company, password });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.logoGradient}
              >
                <Ionicons name="person-add" size={50} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Junte-se à nossa plataforma</Text>
          </View>

          {/* Register Form */}
          <Card style={styles.formCard} elevation={8}>
            <Card.Content style={styles.formContent}>
              <Text style={styles.formTitle}>Cadastro</Text>
              <Text style={styles.formSubtitle}>Preencha seus dados</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Nome completo"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  left={<TextInput.Icon icon="account-outline" />}
                  mode="outlined"
                  theme={{
                    colors: {
                      primary: '#6366f1',
                      outline: '#cbd5e1',
                    },
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  left={<TextInput.Icon icon="email-outline" />}
                  mode="outlined"
                  theme={{
                    colors: {
                      primary: '#6366f1',
                      outline: '#cbd5e1',
                    },
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Empresa"
                  value={company}
                  onChangeText={setCompany}
                  style={styles.input}
                  left={<TextInput.Icon icon="domain" />}
                  mode="outlined"
                  theme={{
                    colors: {
                      primary: '#6366f1',
                      outline: '#cbd5e1',
                    },
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  mode="outlined"
                  theme={{
                    colors: {
                      primary: '#6366f1',
                      outline: '#cbd5e1',
                    },
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Confirmar senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock-check-outline" />}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  mode="outlined"
                  theme={{
                    colors: {
                      primary: '#6366f1',
                      outline: '#cbd5e1',
                    },
                  }}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
                contentStyle={styles.registerButtonContent}
                labelStyle={styles.registerButtonLabel}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Já tem conta?{' '}
                  <Text
                    style={styles.loginLink}
                    onPress={() => navigation.navigate('Login')}
                  >
                    Faça login
                  </Text>
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefícios</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.benefitText}>Rastreamento em tempo real</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.benefitText}>Histórico de localização</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.benefitText}>Notificações inteligentes</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.benefitText}>Suporte 24/7</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    overflow: 'hidden',
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  formContent: {
    padding: 25,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'transparent',
  },
  registerButton: {
    marginTop: 15,
    borderRadius: 12,
    paddingVertical: 8,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  registerButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  loginText: {
    color: '#64748b',
    fontSize: 16,
  },
  loginLink: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  benefitsContainer: {
    alignItems: 'center',
  },
  benefitsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  benefitsList: {
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  benefitText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
});