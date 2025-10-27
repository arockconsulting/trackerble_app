import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, TextInput, Button, Chip, RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  { id: 'pessoal', name: 'Pessoal', icon: 'person-outline', color: '#6366f1' },
  { id: 'educacao', name: 'Educação', icon: 'school-outline', color: '#8b5cf6' },
  { id: 'trabalho', name: 'Trabalho', icon: 'briefcase-outline', color: '#06b6d4' },
  { id: 'casa', name: 'Casa', icon: 'home-outline', color: '#10b981' },
  { id: 'veiculo', name: 'Veículo', icon: 'car-outline', color: '#f59e0b' },
  { id: 'outros', name: 'Outros', icon: 'ellipsis-horizontal-outline', color: '#6b7280' },
];

export default function AddTagScreen({ navigation }: any) {
  const [tagName, setTagName] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('pessoal');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!tagName.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome da tag');
      return;
    }

    if (!macAddress.trim()) {
      Alert.alert('Erro', 'Por favor, informe o endereço MAC');
      return;
    }

    // Validar formato MAC
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(macAddress)) {
      Alert.alert('Erro', 'Formato de endereço MAC inválido');
      return;
    }

    setLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Sucesso',
        'Tag adicionada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao adicionar tag');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomMAC = () => {
    const hex = '0123456789ABCDEF';
    let mac = '';
    for (let i = 0; i < 6; i++) {
      if (i > 0) mac += ':';
      for (let j = 0; j < 2; j++) {
        mac += hex[Math.floor(Math.random() * 16)];
      }
    }
    setMacAddress(mac);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.background}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Adicionar Tag</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form Card */}
          <Card style={styles.formCard} elevation={4}>
            <Card.Content style={styles.formContent}>
              <Text style={styles.formTitle}>Informações da Tag</Text>
              <Text style={styles.formSubtitle}>
                Preencha os dados para cadastrar uma nova tag
              </Text>

              {/* Tag Name */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Nome da tag *"
                  value={tagName}
                  onChangeText={setTagName}
                  style={styles.input}
                  left={<TextInput.Icon icon="tag-outline" />}
                  mode="outlined"
                  placeholder="Ex: Chaveiro do João"
                />
              </View>

              {/* MAC Address */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Endereço MAC *"
                  value={macAddress}
                  onChangeText={setMacAddress}
                  style={styles.input}
                  left={<TextInput.Icon icon="bluetooth" />}
                  right={
                    <TextInput.Icon
                      icon="dice-6"
                      onPress={generateRandomMAC}
                    />
                  }
                  mode="outlined"
                  placeholder="AA:BB:CC:DD:EE:FF"
                  autoCapitalize="characters"
                />
                <Text style={styles.helpText}>
                  Toque no ícone de dados para gerar um MAC aleatório
                </Text>
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Descrição (opcional)"
                  value={description}
                  onChangeText={setDescription}
                  style={styles.input}
                  left={<TextInput.Icon icon="text" />}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  placeholder="Adicione uma descrição para esta tag..."
                />
              </View>

              {/* Category Selection */}
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>Categoria</Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                      style={[
                        styles.categoryItem,
                        selectedCategory === category.id && styles.selectedCategoryItem
                      ]}
                    >
                      <View style={[
                        styles.categoryIcon,
                        { backgroundColor: selectedCategory === category.id ? category.color : '#f1f5f9' }
                      ]}>
                        <Ionicons 
                          name={category.icon as any} 
                          size={24} 
                          color={selectedCategory === category.id ? 'white' : category.color} 
                        />
                      </View>
                      <Text style={[
                        styles.categoryName,
                        selectedCategory === category.id && styles.selectedCategoryName
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
                contentStyle={styles.saveButtonContent}
                labelStyle={styles.saveButtonLabel}
              >
                {loading ? 'Salvando...' : 'Adicionar Tag'}
              </Button>
            </Card.Content>
          </Card>

          {/* Help Card */}
          <Card style={styles.helpCard} elevation={2}>
            <Card.Content>
              <View style={styles.helpHeader}>
                <Ionicons name="information-circle" size={24} color="#6366f1" />
                <Text style={styles.helpTitle}>Como encontrar o endereço MAC?</Text>
              </View>
              <Text style={styles.helpDescription}>
                1. Conecte a tag ao seu dispositivo{'\n'}
                2. Vá em Configurações > Bluetooth{'\n'}
                3. Toque no nome da tag{'\n'}
                4. O endereço MAC aparecerá na tela
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  formCard: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  formContent: {
    padding: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'transparent',
  },
  helpText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  selectedCategoryItem: {
    backgroundColor: '#e0e7ff',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedCategoryName: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  saveButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  helpDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});