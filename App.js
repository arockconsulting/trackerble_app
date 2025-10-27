import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { authApi, tagsApi, familiesApi } from './api';
let BleManagerCls = null;
try {
  // Optional dependency – only available after installing and building Dev Client
  // eslint-disable-next-line global-require
  BleManagerCls = require('react-native-ble-plx').BleManager;
} catch (_) {
  BleManagerCls = null;
}
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockTags = [
  {
    id: '1',
    name: 'Chaveiro do João',
    status: 'online',
    battery: 85,
    lastSeen: '2 min atrás',
    location: 'Casa',
  },
  {
    id: '2',
    name: 'Mochila da Maria',
    status: 'low-battery',
    battery: 15,
    lastSeen: '1 hora atrás',
    location: 'Escola',
  },
  {
    id: '3',
    name: 'Carteira do Pedro',
    status: 'offline',
    battery: 60,
    lastSeen: '3 horas atrás',
    location: 'Shopping',
  },
];

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      const token = response?.access_token || response?.token;
      const user = response?.user;

      if (!token) {
        throw new Error('Credenciais inválidas');
      }

      // Salvar token no AsyncStorage
      await AsyncStorage.setItem('@auth_token', token);
      if (user) {
        await AsyncStorage.setItem('@user_data', JSON.stringify(user));
      }

      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      onLogin();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Erro', 'Credenciais inválidas ou erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>📱</Text>
          </View>
          <Text style={styles.title}>BLE Tracker</Text>
          <Text style={styles.subtitle}>Sua família conectada</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Entrar</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Use: admin@teste.com / 123456
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Recursos</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>📍 Rastreamento em tempo real</Text>
            <Text style={styles.featureItem}>👥 Gestão familiar</Text>
            <Text style={styles.featureItem}>🔒 Segurança garantida</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function MainScreen({ onLogout }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [macInput, setMacInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [manager, setManager] = useState(null);
  const [connectingId, setConnectingId] = useState(null);
  const bleAvailable = !!BleManagerCls;

  // Carregar tags da API quando o componente montar
  React.useEffect(() => {
    loadTags();
    if (bleAvailable && !manager) {
      try { setManager(new BleManagerCls()); } catch (_) {}
    }
    return () => {
      try { manager && manager.destroy(); } catch (_) {}
    };
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagsApi.getTags();
      setTags(response);
    } catch (error) {
      console.error('Error loading tags:', error);
      // Usar dados mockados em caso de erro
      setTags(mockTags);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'low-battery': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'low-battery': return 'Bateria baixa';
      case 'offline': return 'Offline';
      default: return 'Desconhecido';
    }
  };

  const handleAddTag = () => {
    setShowAdd(true);
  };

  const handleSaveTag = async () => {
    if (!macInput) {
      Alert.alert('Erro', 'Informe o MAC Address da tag');
      return;
    }
    setSaving(true);
    try {
      // 1) Buscar membro vinculado ao usuário
      const member = await familiesApi.me();
      if (!member || !member._id) {
        throw new Error('Nenhum membro vinculado ao usuário atual');
      }

      // 2) Encontrar ou criar tag por MAC
      let tag = null;
      try {
        tag = await tagsApi.getTagByMacAddress(macInput);
      } catch (_) {}

      if (!tag || !tag._id) {
        tag = await tagsApi.createTag({
          name: nameInput || macInput,
          macAddress: macInput,
        });
      }

      // 3) Vincular ao membro
      await tagsApi.assignToMember(tag._id, member._id);

      // 4) Atualizar lista e fechar formulário
      await loadTags();
      setShowAdd(false);
      setMacInput('');
      setNameInput('');
      Alert.alert('Sucesso', 'Tag adicionada e vinculada');
    } catch (e) {
      console.error('Add tag error:', e);
      Alert.alert('Erro', e?.message || 'Falha ao adicionar tag');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_data');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

  const handleTagPress = (tag) => {
    Alert.alert(tag.name, `Status: ${getStatusText(tag.status)}\nBateria: ${tag.battery}%\nÚltima vez: ${tag.lastSeen}`);
  };

  const requestBlePermissions = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
  };

  const startScan = async () => {
    const ok = await requestBlePermissions();
    if (!ok) {
      Alert.alert('Permissão', 'Permissões de Bluetooth/Localização necessárias');
      return;
    }
    if (!bleAvailable) {
      Alert.alert('BLE não disponível', 'Instale o Dev Client e a lib de BLE para usar o scanner.');
      return;
    }
    setDevices([]);
    setIsScanning(true);
    manager && manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn('Scan error:', error);
        setIsScanning(false);
        return;
      }
      if (device) {
        setDevices(prev => {
          if (prev.find(d => d.id === device.id)) return prev.map(d => d.id === device.id ? device : d);
          return [...prev, device];
        });
      }
    });
    setTimeout(() => stopScan(), 10000);
  };

  const stopScan = () => {
    try { manager && manager.stopDeviceScan(); } catch (_) {}
    setIsScanning(false);
  };

  const handleConnectDevice = async (device) => {
    try {
      setConnectingId(device.id);
      await device.connect();
      await device.discoverAllServicesAndCharacteristics();
      // Pair flow: member -> tag by MAC -> assign
      const member = await familiesApi.me();
      if (!member || !member._id) throw new Error('Nenhum membro vinculado ao usuário');
      let tag = null;
      try { tag = await tagsApi.getTagByMacAddress(device.id); } catch (_) {}
      if (!tag || !tag._id) {
        tag = await tagsApi.createTag({ name: device.name || device.id, macAddress: device.id });
      }
      await tagsApi.assignToMember(tag._id, member._id);
      Alert.alert('Pareado', `Tag vinculada: ${tag.name || device.id}`);
      setShowScanner(false);
      await loadTags();
    } catch (e) {
      console.error('Connect/pair error:', e);
      Alert.alert('Erro', e?.message || 'Falha ao conectar/parear');
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Tags</Text>
        <Text style={styles.headerSubtitle}>
          {tags.length} tag{tags.length !== 1 ? 's' : ''} encontrada{tags.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {showAdd && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Adicionar Tag</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>MAC Address</Text>
            <TextInput
              style={styles.input}
              placeholder="AA:BB:CC:DD:EE:FF"
              placeholderTextColor="#999"
              value={macInput}
              onChangeText={setMacInput}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Chaveiro João"
              placeholderTextColor="#999"
              value={nameInput}
              onChangeText={setNameInput}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={[styles.loginButton, saving && styles.loginButtonDisabled]} 
              onPress={handleSaveTag}
              disabled={saving}
            >
              <Text style={styles.loginButtonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: '#9ca3af' }]} 
              onPress={() => { setShowAdd(false); setMacInput(''); setNameInput(''); }}
            >
              <Text style={styles.loginButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.tagsContainer} showsVerticalScrollIndicator={false}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            onPress={() => handleTagPress(tag)}
            style={styles.tagCard}
          >
            <View style={styles.tagHeader}>
              <Text style={styles.tagName}>{tag.name}</Text>
              <View style={styles.tagStatus}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(tag.status) }
                  ]} 
                />
                <Text style={styles.statusText}>
                  {getStatusText(tag.status)}
                </Text>
              </View>
            </View>

            <View style={styles.tagDetails}>
              <Text style={styles.detailText}>📍 {tag.location}</Text>
              <Text style={styles.detailText}>⏰ {tag.lastSeen}</Text>
              <Text style={styles.detailText}>🔋 {tag.battery}%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
        <Text style={styles.addButtonText}>+ Adicionar Tag</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.addButton, { backgroundColor: '#0ea5e9' }]} onPress={() => setShowScanner(true)}>
        <Text style={styles.addButtonText}>🔎 Escanear BLE</Text>
      </TouchableOpacity>

      {showScanner && (
        <View style={[styles.formContainer, { marginHorizontal: 20 }]}> 
          <Text style={styles.formTitle}>Scanner BLE</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <TouchableOpacity style={[styles.loginButton, !bleAvailable && styles.loginButtonDisabled]} onPress={isScanning ? stopScan : startScan} disabled={!bleAvailable}>
              <Text style={styles.loginButtonText}>{isScanning ? 'Parar' : 'Iniciar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.loginButton, { backgroundColor: '#9ca3af' }]} onPress={() => { setShowScanner(false); stopScan(); }}>
              <Text style={styles.loginButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 250 }}>
            {devices.map((d) => (
              <View key={d.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                <Text style={{ fontWeight: '600', color: '#111827' }}>{d.name || 'Dispositivo'}</Text>
                <Text style={{ color: '#6b7280', fontFamily: 'monospace' }}>{d.id}</Text>
                <View style={{ flexDirection: 'row', marginTop: 6, gap: 8 }}>
                  <TouchableOpacity 
                    style={[styles.loginButton, connectingId === d.id && styles.loginButtonDisabled]} 
                    onPress={() => handleConnectDevice(d)}
                    disabled={!!connectingId}
                  >
                    <Text style={styles.loginButtonText}>{connectingId === d.id ? 'Conectando...' : 'Conectar & Parear'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {devices.length === 0 && (
              <Text style={{ color: '#6b7280' }}>
                {bleAvailable ? 'Nenhum dispositivo encontrado ainda.' : 'BLE não disponível neste build. Instale o Dev Client e a lib de BLE.'}
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <MainScreen onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 50,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  loginButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 15,
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featuresTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featuresList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    position: 'absolute',
    top: 60,
    left: 20,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tagCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tagName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  tagStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  tagDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#6366f1',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
