import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, PermissionsAndroid, Platform } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useBLE } from '../../contexts/BLEContext';
import { Device } from 'react-native-ble-plx';

const ScannerScreen: React.FC = () => {
  const { 
    isScanning, 
    devices, 
    bleState, 
    startScan, 
    stopScan,
    connectToDevice,
    disconnectDevice,
    connectedTags
  } = useBLE();
  
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      
      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );
      
      if (!allGranted) {
        Alert.alert(
          'Permissões Necessárias',
          'Este app precisa das permissões de localização e Bluetooth para funcionar corretamente.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleStartScan = async () => {
    if (bleState !== 'PoweredOn') {
      Alert.alert(
        'Bluetooth Desligado',
        'Por favor, ligue o Bluetooth para começar a escanear.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await startScan();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar o scanner BLE');
    }
  };

  const handleConnect = async (device: Device) => {
    try {
      setConnecting(device.id);
      await connectToDevice(device);
      Alert.alert('Sucesso', `Conectado ao dispositivo ${device.name || device.id}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao dispositivo');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (device: Device) => {
    try {
      await disconnectDevice(device);
      Alert.alert('Sucesso', `Desconectado do dispositivo ${device.name || device.id}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível desconectar do dispositivo');
    }
  };

  const isConnected = (deviceId: string) => {
    return connectedTags.some(tag => tag.macAddress === deviceId);
  };

  const isRegisteredTag = (deviceId: string) => {
    return connectedTags.some(tag => tag.macAddress === deviceId);
  };

  const renderDevice = ({ item: device }: { item: Device }) => {
    const connected = isConnected(device.id);
    const registered = isRegisteredTag(device.id);
    const connecting = connecting === device.id;

    return (
      <Card style={styles.deviceCard}>
        <Card.Content>
          <View style={styles.deviceHeader}>
            <View style={styles.deviceInfo}>
              <Title style={styles.deviceName}>
                {device.name || 'Dispositivo Desconhecido'}
              </Title>
              <Paragraph style={styles.deviceMac}>
                {device.id}
              </Paragraph>
              {device.rssi && (
                <Paragraph style={styles.deviceRssi}>
                  RSSI: {device.rssi} dBm
                </Paragraph>
              )}
            </View>
            
            <View style={styles.deviceActions}>
              {registered && (
                <Chip 
                  style={[styles.registeredChip, { backgroundColor: connected ? '#4CAF50' : '#FF9800' }]}
                  textStyle={styles.chipText}
                >
                  {connected ? 'Conectado' : 'Registrado'}
                </Chip>
              )}
              
              <IconButton
                icon={connected ? 'bluetooth-off' : 'bluetooth'}
                size={24}
                onPress={() => connected ? handleDisconnect(device) : handleConnect(device)}
                disabled={connecting}
                iconColor={connected ? '#F44336' : '#6200EE'}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const getBleStateText = () => {
    switch (bleState) {
      case 'PoweredOn':
        return 'Bluetooth Ligado';
      case 'PoweredOff':
        return 'Bluetooth Desligado';
      case 'Unauthorized':
        return 'Bluetooth Não Autorizado';
      case 'Unsupported':
        return 'Bluetooth Não Suportado';
      default:
        return 'Bluetooth Desconhecido';
    }
  };

  const getBleStateColor = () => {
    switch (bleState) {
      case 'PoweredOn':
        return '#4CAF50';
      case 'PoweredOff':
        return '#F44336';
      case 'Unauthorized':
        return '#FF9800';
      case 'Unsupported':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <View style={styles.statusInfo}>
            <Ionicons 
              name="bluetooth" 
              size={24} 
              color={getBleStateColor()} 
            />
            <View style={styles.statusText}>
              <Title style={styles.statusTitle}>Status do Bluetooth</Title>
              <Paragraph style={[styles.statusSubtitle, { color: getBleStateColor() }]}>
                {getBleStateText()}
              </Paragraph>
            </View>
          </View>
          
          <Chip 
            style={[styles.scanChip, { backgroundColor: isScanning ? '#F44336' : '#6200EE' }]}
            textStyle={styles.chipText}
          >
            {isScanning ? 'Escanando...' : 'Parado'}
          </Chip>
        </Card.Content>
      </Card>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <Button
          mode={isScanning ? 'outlined' : 'contained'}
          onPress={isScanning ? stopScan : handleStartScan}
          disabled={bleState !== 'PoweredOn'}
          style={styles.scanButton}
          contentStyle={styles.buttonContent}
        >
          {isScanning ? (
            <>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              Parar Scan
            </>
          ) : (
            'Iniciar Scan'
          )}
        </Button>
        
        {devices.length > 0 && (
          <Button
            mode="text"
            onPress={stopScan}
            style={styles.clearButton}
          >
            Limpar Lista
          </Button>
        )}
      </View>

      {/* Devices List */}
      <View style={styles.listContainer}>
        <Title style={styles.listTitle}>
          Dispositivos Encontrados ({devices.length})
        </Title>
        
        {devices.length === 0 && !isScanning ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="bluetooth-outline" size={48} color="#9E9E9E" />
              <Paragraph style={styles.emptyText}>
                Nenhum dispositivo encontrado.{'\n'}
                Toque em "Iniciar Scan" para começar.
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scanChip: {
    borderRadius: 16,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  scanButton: {
    flex: 1,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  clearButton: {
    borderRadius: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  deviceCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceMac: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registeredChip: {
    borderRadius: 12,
  },
  emptyCard: {
    elevation: 1,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    lineHeight: 20,
  },
});

export default ScannerScreen;
