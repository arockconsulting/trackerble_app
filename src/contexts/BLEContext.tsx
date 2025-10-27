import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { tagsApi, pairTagToCurrentMember } from '../services/api';
// import { useAuth } from './AuthContext';

interface Tag {
  id: string;
  name: string;
  macAddress: string;
  status: string;
  batteryLevel: number;
  lastConnection: string;
  category: string;
  group: string;
}

interface BLEContextData {
  manager: BleManager;
  isScanning: boolean;
  devices: Device[];
  connectedTags: Tag[];
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectDevice: (device: Device) => Promise<void>;
  bleState: State;
  loadConnectedTags: (token: string) => Promise<void>;
}

const BLEContext = createContext<BLEContextData>({} as BLEContextData);

interface BLEProviderProps {
  children: ReactNode;
}

export const BLEProvider: React.FC<BLEProviderProps> = ({ children }) => {
  const [manager, setManager] = useState<BleManager | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedTags, setConnectedTags] = useState<Tag[]>([]);
  const [bleState, setBleState] = useState<State>(State.Unknown);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  // const { user, token } = useAuth();

  useEffect(() => {
    // Inicializar BLE Manager de forma segura
    const initBLE = async () => {
      try {
        if (Platform.OS === 'web') {
          console.log('BLE not available on web platform');
          return;
        }
        
        const bleManager = new BleManager();
        setManager(bleManager);
      } catch (error) {
        console.warn('BLE Manager initialization failed:', error);
      }
    };

    initBLE();
    requestLocationPermission();
    
    return () => {
      if (manager) {
        manager.destroy();
      }
    };
  }, []);

  // useEffect(() => {
  //   if (user && token) {
  //     loadConnectedTags();
  //   }
  // }, [user, token]);

  const initializeBLE = () => {
    if (!manager) return;
    
    try {
      manager.onStateChange((state) => {
        setBleState(state);
        if (state === State.PoweredOn) {
          console.log('BLE is ready');
        }
      }, true);
    } catch (error) {
      console.warn('BLE initialization error:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadConnectedTags = async (token: string) => {
    try {
      const tags = await tagsApi.getTags(token);
      setConnectedTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const startScan = async () => {
    if (!manager) {
      console.warn('BLE Manager not available');
      return;
    }

    if (bleState !== State.PoweredOn) {
      console.warn('BLE is not ready');
      return;
    }

    try {
      setIsScanning(true);
      setDevices([]);

      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }

        if (device) {
          setDevices(prev => {
            const exists = prev.find(d => d.id === device.id);
            if (!exists) {
              return [...prev, device];
            }
            return prev.map(d => d.id === device.id ? device : d);
          });

          // Verificar se é uma tag cadastrada
          checkIfRegisteredTag(device);
        }
      });

      // Parar scan após 10 segundos
      setTimeout(() => {
        stopScan();
      }, 10000);

    } catch (error) {
      console.error('Error starting scan:', error);
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (manager) {
      manager.stopDeviceScan();
    }
    setIsScanning(false);
  };

  const checkIfRegisteredTag = async (device: Device) => {
    try {
      const tag = await tagsApi.getTagByMacAddress(device.id);
      
      if (tag) {
        // Tag encontrada! Atualizar status
        await updateTagStatus(tag, device);
        
        // Notificar usuário
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Tag Encontrada! 🏷️',
            body: `Tag "${tag.name}" está próxima`,
          },
          trigger: null,
        });
      }
    } catch (error) {
      // Tag não encontrada ou erro na API
      console.log('Tag not registered or API error:', error);
    }
  };

  const updateTagStatus = async (tag: Tag, device: Device) => {
    if (!currentLocation) return;

    try {
      await tagsApi.updateTagStatus(tag.id, {
        status: 'active',
        location: {
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
        },
        rssi: device.rssi || 0,
        batteryLevel: tag.batteryLevel,
      });

      // Atualizar lista de tags conectadas
      setConnectedTags(prev => 
        prev.map(t => t.id === tag.id ? { ...t, status: 'active' } : t)
      );

    } catch (error) {
      console.error('Error updating tag status:', error);
    }
  };

  const connectToDevice = async (device: Device) => {
    try {
      await device.connect();
      await device.discoverAllServicesAndCharacteristics();
      
      console.log('Connected to device:', device.name || device.id);
      
      // Pair flow: ensure tag exists, assign to current member, and update location
      try {
        await pairTagToCurrentMember({
          macAddress: device.id,
          name: device.name || device.id,
          location: currentLocation ? {
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
          } : undefined,
          rssi: device.rssi || 0,
        });
      } catch (pairErr) {
        console.warn('Pair flow failed:', pairErr);
      }

      // Atualizar UI
      setConnectedTags(prev => 
        prev.map(t => t.macAddress === device.id ? { ...t, status: 'active' } : t)
      );

    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  };

  const disconnectDevice = async (device: Device) => {
    try {
      await device.cancelConnection();
      
      console.log('Disconnected from device:', device.name || device.id);
      
      // Atualizar status da tag
      const tag = connectedTags.find(t => t.macAddress === device.id);
      if (tag) {
        // await tagsApi.updateTagStatus(tag.id, {
        //   status: 'disconnected',
        // }, token);
      }

    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  return (
    <BLEContext.Provider
      value={{
        manager: manager || ({} as BleManager),
        isScanning,
        devices,
        connectedTags,
        startScan,
        stopScan,
        connectToDevice,
        disconnectDevice,
        bleState,
        loadConnectedTags,
      }}
    >
      {children}
    </BLEContext.Provider>
  );
};

export const useBLE = (): BLEContextData => {
  const context = useContext(BLEContext);
  if (!context) {
    throw new Error('useBLE must be used within a BLEProvider');
  }
  return context;
};
