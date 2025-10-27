import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
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
  description: string;
  lastLocation?: {
    lat: number;
    lng: number;
  };
}

interface ConnectionLog {
  id: string;
  timestamp: string;
  event: string;
  location?: {
    lat: number;
    lng: number;
  };
  rssi?: number;
  batteryLevel?: number;
}

type TagDetailRouteProp = RouteProp<{ TagDetail: { tagId: string } }, 'TagDetail'>;

const TagDetailScreen: React.FC = () => {
  const route = useRoute<TagDetailRouteProp>();
  const { tagId } = route.params;
  const { token } = useAuth();
  const [tag, setTag] = useState<Tag | null>(null);
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTagDetails();
  }, [tagId]);

  const loadTagDetails = async () => {
    if (!token) return;

    try {
      const [tagData, logsData] = await Promise.all([
        tagsApi.getTagById(tagId, token),
        tagsApi.getTagLogs(tagId, token, 20),
      ]);
      
      setTag(tagData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading tag details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTagDetails();
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

  const getBatteryColor = (batteryLevel: number) => {
    if (batteryLevel > 50) return '#4CAF50';
    if (batteryLevel > 20) return '#FF9800';
    return '#F44336';
  };

  const getEventText = (event: string) => {
    switch (event) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'rssi_updated':
        return 'Sinal Atualizado';
      default:
        return event;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'connected':
        return '#4CAF50';
      case 'disconnected':
        return '#F44336';
      case 'rssi_updated':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (!tag) {
    return (
      <View style={styles.errorContainer}>
        <Title>Tag não encontrada</Title>
        <Button onPress={() => {/* Navigate back */}}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Tag Info Card */}
      <Card style={styles.tagCard}>
        <Card.Content>
          <View style={styles.tagHeader}>
            <View style={styles.tagInfo}>
              <Title style={styles.tagName}>{tag.name}</Title>
              <Paragraph style={styles.tagMac}>{tag.macAddress}</Paragraph>
              {tag.category && (
                <Paragraph style={styles.tagCategory}>
                  {tag.category} • {tag.group}
                </Paragraph>
              )}
            </View>
            
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(tag.status) }]}
              textStyle={styles.chipText}
            >
              {getStatusText(tag.status)}
            </Chip>
          </View>

          {tag.description && (
            <Paragraph style={styles.tagDescription}>
              {tag.description}
            </Paragraph>
          )}

          <View style={styles.tagMetrics}>
            <View style={styles.metric}>
              <Ionicons name="battery-half" size={20} color={getBatteryColor(tag.batteryLevel)} />
              <View style={styles.metricInfo}>
                <Paragraph style={styles.metricLabel}>Bateria</Paragraph>
                <Paragraph style={[styles.metricValue, { color: getBatteryColor(tag.batteryLevel) }]}>
                  {tag.batteryLevel}%
                </Paragraph>
              </View>
            </View>

            <View style={styles.metric}>
              <Ionicons name="time" size={20} color="#666" />
              <View style={styles.metricInfo}>
                <Paragraph style={styles.metricLabel}>Última Conexão</Paragraph>
                <Paragraph style={styles.metricValue}>
                  {tag.lastConnection ? formatDate(tag.lastConnection) : 'Nunca'}
                </Paragraph>
              </View>
            </View>
          </View>

          {tag.lastLocation && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color="#2196F3" />
              <View style={styles.metricInfo}>
                <Paragraph style={styles.metricLabel}>Última Localização</Paragraph>
                <Paragraph style={styles.metricValue}>
                  {tag.lastLocation.lat.toFixed(6)}, {tag.lastLocation.lng.toFixed(6)}
                </Paragraph>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Connection Logs */}
      <Card style={styles.logsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Histórico de Conexões</Title>
          
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <View style={styles.logInfo}>
                  <View style={styles.logHeader}>
                    <Paragraph style={styles.logEvent}>
                      {getEventText(log.event)}
                    </Paragraph>
                    <Chip 
                      style={[styles.eventChip, { backgroundColor: getEventColor(log.event) }]}
                      textStyle={styles.eventChipText}
                    >
                      {log.event}
                    </Chip>
                  </View>
                  
                  <Paragraph style={styles.logTime}>
                    {formatDate(log.timestamp)}
                  </Paragraph>
                  
                  {log.rssi && (
                    <Paragraph style={styles.logDetail}>
                      RSSI: {log.rssi} dBm
                    </Paragraph>
                  )}
                  
                  {log.batteryLevel && (
                    <Paragraph style={styles.logDetail}>
                      Bateria: {log.batteryLevel}%
                    </Paragraph>
                  )}
                  
                  {log.location && (
                    <Paragraph style={styles.logDetail}>
                      Local: {log.location.lat.toFixed(4)}, {log.location.lng.toFixed(4)}
                    </Paragraph>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyLogs}>
              <Ionicons name="time-outline" size={48} color="#9E9E9E" />
              <Paragraph style={styles.emptyText}>
                Nenhum histórico de conexão encontrado
              </Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tagCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tagMac: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  tagCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    borderRadius: 16,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  tagMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  logsCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200EE',
  },
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logInfo: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logEvent: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  eventChip: {
    borderRadius: 12,
  },
  eventChipText: {
    color: 'white',
    fontSize: 10,
  },
  logTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  logDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyLogs: {
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

export default TagDetailScreen;
