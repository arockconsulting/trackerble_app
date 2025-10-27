import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, FAB, Chip, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Tag {
  id: string;
  name: string;
  macAddress: string;
  status: 'online' | 'offline' | 'low-battery';
  batteryLevel: number;
  lastSeen: string;
  location: string;
  category: string;
}

const mockTags: Tag[] = [
  {
    id: '1',
    name: 'Chaveiro do João',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    status: 'online',
    batteryLevel: 85,
    lastSeen: '2 min atrás',
    location: 'Casa',
    category: 'Pessoal',
  },
  {
    id: '2',
    name: 'Mochila da Maria',
    macAddress: '11:22:33:44:55:66',
    status: 'low-battery',
    batteryLevel: 15,
    lastSeen: '1 hora atrás',
    location: 'Escola',
    category: 'Educação',
  },
  {
    id: '3',
    name: 'Carteira do Pedro',
    macAddress: '77:88:99:AA:BB:CC',
    status: 'offline',
    batteryLevel: 60,
    lastSeen: '3 horas atrás',
    location: 'Shopping',
    category: 'Pessoal',
  },
];

export default function TagsScreen({ navigation }: any) {
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = ['Todas', 'Pessoal', 'Educação', 'Trabalho', 'Casa'];

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tag.macAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'low-battery': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'low-battery': return 'Bateria baixa';
      case 'offline': return 'Offline';
      default: return 'Desconhecido';
    }
  };

  const handleAddTag = () => {
    navigation.navigate('AddTag');
  };

  const handleTagPress = (tag: Tag) => {
    navigation.navigate('TagDetail', { tag });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Minhas Tags</Text>
          <Text style={styles.headerSubtitle}>
            {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''} encontrada{filteredTags.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Buscar tags..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
          />
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        {/* Tags List */}
        <ScrollView style={styles.tagsContainer} showsVerticalScrollIndicator={false}>
          {filteredTags.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bluetooth-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Nenhuma tag encontrada</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Tente ajustar sua busca' : 'Adicione sua primeira tag'}
              </Text>
            </View>
          ) : (
            filteredTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => handleTagPress(tag)}
                style={styles.tagCardContainer}
              >
                <Card style={styles.tagCard} elevation={2}>
                  <Card.Content style={styles.tagContent}>
                    <View style={styles.tagHeader}>
                      <View style={styles.tagInfo}>
                        <Text style={styles.tagName}>{tag.name}</Text>
                        <Text style={styles.tagMac}>{tag.macAddress}</Text>
                      </View>
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
                      <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={16} color="#64748b" />
                        <Text style={styles.detailText}>{tag.location}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={16} color="#64748b" />
                        <Text style={styles.detailText}>{tag.lastSeen}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="battery-outline" size={16} color="#64748b" />
                        <Text style={styles.detailText}>{tag.batteryLevel}%</Text>
                      </View>
                    </View>

                    <View style={styles.tagFooter}>
                      <Chip 
                        mode="outlined" 
                        compact
                        style={styles.categoryTag}
                        textStyle={styles.categoryTagText}
                      >
                        {tag.category}
                      </Chip>
                      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Add Tag FAB */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddTag}
          label="Adicionar Tag"
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    marginRight: 10,
    backgroundColor: 'white',
  },
  selectedCategoryChip: {
    backgroundColor: '#6366f1',
  },
  categoryText: {
    color: '#64748b',
  },
  selectedCategoryText: {
    color: 'white',
  },
  tagsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  tagCardContainer: {
    marginBottom: 12,
  },
  tagCard: {
    backgroundColor: 'white',
    borderRadius: 16,
  },
  tagContent: {
    padding: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  tagMac: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
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
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  tagFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#f1f5f9',
  },
  categoryTagText: {
    color: '#475569',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
  },
});