import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
}

export default function TagsListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const userTags = await tagsApi.getTags();
      setTags(userTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTags();
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

  const getBatteryIcon = (batteryLevel: number) => {
    if (batteryLevel > 75) return 'battery-full';
    if (batteryLevel > 50) return 'battery-half';
    if (batteryLevel > 25) return 'battery-quarter';
    return 'battery-dead';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pessoa':
        return 'person';
      case 'animal':
        return 'paw';
      case 'objeto':
        return 'cube';
      case 'veiculo':
        return 'car';
      default:
        return 'tag';
    }
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'familia':
        return '#E91E63';
      case 'trabalho':
        return '#2196F3';
      case 'pessoal':
        return '#4CAF50';
      case 'outros':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const filteredTags = tags.filter(tag => {
    if (filter === 'all') return true;
    if (filter === 'active') return tag.status === 'active';
    if (filter === 'inactive') return tag.status === 'inactive';
    if (filter === 'low-battery') return tag.batteryLevel < 20;
    return true;
  });

  const renderTag = ({ item }: { item: Tag }) => (
    <TouchableOpacity
      style={styles.tagCard}
      onPress={() => navigation.navigate('TagDetail', { tag: item })}
    >
      <View style={styles.tagHeader}>
        <View style={styles.tagInfo}>
          <View style={styles.tagIconContainer}>
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={24}
              color="white"
            />
          </View>
          <View style={styles.tagDetails}>
            <Text style={styles.tagName}>{item.name}</Text>
            <Text style={styles.tagMac}>{item.macAddress}</Text>
          </View>
        </View>
        <View style={styles.tagStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.tagFooter}>
        <View style={styles.tagBattery}>
          <Ionicons
            name={getBatteryIcon(item.batteryLevel)}
            size={16}
            color={getBatteryColor(item.batteryLevel)}
          />
          <Text
            style={[
              styles.batteryText,
              { color: getBatteryColor(item.batteryLevel) },
            ]}
          >
            {item.batteryLevel}%
          </Text>
        </View>

        <View style={styles.tagGroup}>
          <View
            style={[
              styles.groupBadge,
              { backgroundColor: getGroupColor(item.group) },
            ]}
          >
            <Text style={styles.groupText}>
              {item.group.charAt(0).toUpperCase() + item.group.slice(1)}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bluetooth" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Nenhuma tag encontrada</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all'
          ? 'Adicione sua primeira tag para começar'
          : 'Nenhuma tag corresponde ao filtro selecionado'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('AddTag')}
      >
        <Text style={styles.emptyButtonText}>Adicionar Tag</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Minhas Tags</Text>
          <Text style={styles.subtitle}>{tags.length} tags cadastradas</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTag')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Todas', icon: 'list' },
            { key: 'active', label: 'Ativas', icon: 'checkmark-circle' },
            { key: 'inactive', label: 'Inativas', icon: 'pause-circle' },
            { key: 'low-battery', label: 'Bateria Baixa', icon: 'battery-dead' },
          ].map((filterItem) => (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.filterButton,
                filter === filterItem.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterItem.key)}
            >
              <Ionicons
                name={filterItem.icon as any}
                size={16}
                color={filter === filterItem.key ? 'white' : '#666'}
              />
              <Text
                style={[
                  styles.filterText,
                  filter === filterItem.key && styles.filterTextActive,
                ]}
              >
                {filterItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tags List */}
      <View style={styles.listContainer}>
        <FlatList
          data={filteredTags}
          renderItem={renderTag}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  filterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  filterTextActive: {
    color: '#333',
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tagCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tagIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tagDetails: {
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
  tagFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  tagGroup: {
    flex: 1,
    alignItems: 'center',
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groupText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#4facfe',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
