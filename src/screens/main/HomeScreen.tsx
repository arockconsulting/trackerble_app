import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useBLE } from '../../contexts/BLEContext';
import { tagsApi } from '../../services/api';

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

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { isScanning, startScan, stopScan, devices } = useBLE();
  const [tags, setTags] = useState<Tag[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalTags: 0,
    activeTags: 0,
    lowBattery: 0,
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const userTags = await tagsApi.getTags();
      setTags(userTags);
      
      // Calcular estatísticas
      const activeTags = userTags.filter(tag => tag.status === 'active').length;
      const lowBattery = userTags.filter(tag => tag.batteryLevel < 20).length;
      
      setStats({
        totalTags: userTags.length,
        activeTags,
        lowBattery,
      });
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTags();
    setRefreshing(false);
  };

  const handleScan = async () => {
    if (isScanning) {
      stopScan();
    } else {
      await startScan();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#FF9800';
      case 'disconnected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'Desconhecido';
    }
  };

  const getBatteryColor = (batteryLevel: number) => {
    if (batteryLevel > 50) return '#4CAF50';
    if (batteryLevel > 20) return '#FF9800';
    return '#F44336';
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name}!</Text>
            <Text style={styles.subtitle}>Gerencie suas tags BLE</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="bluetooth" size={24} color="#4facfe" />
            <Text style={styles.statNumber}>{stats.totalTags}</Text>
            <Text style={styles.statLabel}>Total Tags</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{stats.activeTags}</Text>
            <Text style={styles.statLabel}>Ativas</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="battery-dead" size={24} color="#F44336" />
            <Text style={styles.statNumber}>{stats.lowBattery}</Text>
            <Text style={styles.statLabel}>Bateria Baixa</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isScanning && styles.actionButtonActive]}
            onPress={handleScan}
          >
            <LinearGradient
              colors={isScanning ? ['#FF6B6B', '#FF8E8E'] : ['#4facfe', '#00f2fe']}
              style={styles.actionGradient}
            >
              <Ionicons
                name={isScanning ? "stop" : "search"}
                size={24}
                color="white"
              />
              <Text style={styles.actionText}>
                {isScanning ? 'Parar Scan' : 'Escanear Tags'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddTag')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.actionGradient}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.actionText}>Nova Tag</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tags List */}
        <View style={styles.tagsContainer}>
          <View style={styles.tagsHeader}>
            <Text style={styles.tagsTitle}>Suas Tags</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TagsList')}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {tags.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bluetooth" size={60} color="#ccc" />
              <Text style={styles.emptyTitle}>Nenhuma tag cadastrada</Text>
              <Text style={styles.emptySubtitle}>
                Adicione sua primeira tag para começar
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddTag')}
              >
                <Text style={styles.emptyButtonText}>Adicionar Tag</Text>
              </TouchableOpacity>
            </View>
          ) : (
            tags.slice(0, 3).map((tag) => (
              <View key={tag.id} style={styles.tagCard}>
                <View style={styles.tagInfo}>
                  <Text style={styles.tagName}>{tag.name}</Text>
                  <Text style={styles.tagMac}>{tag.macAddress}</Text>
                </View>
                <View style={styles.tagStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(tag.status) },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {getStatusText(tag.status)}
                  </Text>
                </View>
                <View style={styles.tagBattery}>
                  <Ionicons
                    name="battery-half"
                    size={16}
                    color={getBatteryColor(tag.batteryLevel)}
                  />
                  <Text
                    style={[
                      styles.batteryText,
                      { color: getBatteryColor(tag.batteryLevel) },
                    ]}
                  >
                    {tag.batteryLevel}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.activityTitle}>Atividade Recente</Text>
          <View style={styles.activityItem}>
            <Ionicons name="bluetooth" size={20} color="#4facfe" />
            <Text style={styles.activityText}>
              {devices.length} dispositivos encontrados
            </Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="location" size={20} color="#4CAF50" />
            <Text style={styles.activityText}>
              Última atualização: agora
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionButtonActive: {
    transform: [{ scale: 0.98 }],
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tagsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tagsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#4facfe',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#4facfe',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tagMac: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tagStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  tagBattery: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  activityContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
  },
});
