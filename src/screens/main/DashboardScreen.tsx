import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip, FAB, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useBLE } from '../../contexts/BLEContext';
import { tagsApi } from '../../services/api';

interface Stats {
  totalTags: number;
  activeTags: number;
  inactiveTags: number;
  disconnectedTags: number;
  recentConnections: any[];
}

const DashboardScreen: React.FC = () => {
  const { user, token } = useAuth();
  const { connectedTags } = useBLE();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!token) return;

    try {
      const statsData = await tagsApi.getStats(token);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Card */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>
              Olá, {user?.name}! 👋
            </Title>
            <Paragraph style={styles.welcomeSubtitle}>
              Bem-vindo ao BLE Tracker
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="list" size={24} color="#6200EE" />
                <Title style={styles.statNumber}>{stats.totalTags}</Title>
                <Paragraph style={styles.statLabel}>Total de Tags</Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Title style={styles.statNumber}>{stats.activeTags}</Title>
                <Paragraph style={styles.statLabel}>Ativas</Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="pause-circle" size={24} color="#FF9800" />
                <Title style={styles.statNumber}>{stats.inactiveTags}</Title>
                <Paragraph style={styles.statLabel}>Inativas</Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="close-circle" size={24} color="#F44336" />
                <Title style={styles.statNumber}>{stats.disconnectedTags}</Title>
                <Paragraph style={styles.statLabel}>Desconectadas</Paragraph>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Connected Tags */}
        <Card style={styles.tagsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Tags Conectadas</Title>
            {connectedTags.length > 0 ? (
              connectedTags.map((tag) => (
                <View key={tag.id} style={styles.tagItem}>
                  <View style={styles.tagInfo}>
                    <Paragraph style={styles.tagName}>{tag.name}</Paragraph>
                    <Paragraph style={styles.tagMac}>{tag.macAddress}</Paragraph>
                  </View>
                  <Chip 
                    style={[styles.statusChip, { backgroundColor: getStatusColor(tag.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusText(tag.status)}
                  </Chip>
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhuma tag conectada no momento
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Recent Connections */}
        {stats?.recentConnections && stats.recentConnections.length > 0 && (
          <Card style={styles.logsCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Conexões Recentes</Title>
              {stats.recentConnections.slice(0, 5).map((log, index) => (
                <View key={index} style={styles.logItem}>
                  <View style={styles.logInfo}>
                    <Paragraph style={styles.logEvent}>{log.event}</Paragraph>
                    <Paragraph style={styles.logTime}>
                      {new Date(log.timestamp).toLocaleString()}
                    </Paragraph>
                  </View>
                  <Chip 
                    style={[styles.eventChip, { 
                      backgroundColor: log.event === 'connected' ? '#4CAF50' : '#F44336' 
                    }]}
                    textStyle={styles.eventChipText}
                  >
                    {log.event === 'connected' ? 'Conectado' : 'Desconectado'}
                  </Chip>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="bluetooth"
        label="Scanner"
        onPress={() => {/* Navigate to scanner */}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#6200EE',
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: 'white',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    elevation: 2,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tagsCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  logsCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
    marginBottom: 80,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  tagMac: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    borderRadius: 16,
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logInfo: {
    flex: 1,
  },
  logEvent: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  logTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventChip: {
    borderRadius: 12,
  },
  eventChipText: {
    color: 'white',
    fontSize: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});

export default DashboardScreen;
