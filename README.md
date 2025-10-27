# 📱 BLE SaaS Mobile App

App móvel desenvolvido com Expo React Native para rastreamento de tags Bluetooth Low Energy.

## 🛠️ Tecnologias

- **Expo** - Plataforma de desenvolvimento React Native
- **React Native** - Framework mobile
- **React Native BLE PLX** - Biblioteca para Bluetooth
- **React Navigation** - Navegação entre telas
- **React Native Paper** - Componentes UI Material Design
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- Dispositivo móvel ou emulador
- Conta Expo (gratuita)

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start

# Ou executar diretamente no dispositivo
npm run android  # Android
npm run ios      # iOS
```

## 📱 Funcionalidades

### 🔐 Autenticação
- Login com email/senha
- Registro de usuários
- Armazenamento seguro de tokens
- Logout automático

### 📡 Scanner BLE
- Escaneamento de dispositivos BLE próximos
- Conexão automática com tags cadastradas
- Monitoramento de RSSI e bateria
- Notificações quando tags são encontradas

### 🏷️ Gestão de Tags
- Visualização de tags cadastradas
- Status em tempo real (ativo/inativo/desconectado)
- Histórico de conexões
- Informações de bateria e localização

### 📊 Dashboard
- Estatísticas em tempo real
- Tags conectadas
- Atividade recente
- Métricas de uso

### 🔔 Notificações
- Alertas de conexão/desconexão
- Notificações de baixa bateria
- Avisos de tags perdidas

## 🏗️ Estrutura do App

```
src/
├── App.tsx                    # Componente principal
├── contexts/                  # Contextos React
│   ├── AuthContext.tsx       # Contexto de autenticação
│   └── BLEContext.tsx        # Contexto do Bluetooth
├── navigation/                # Navegação
│   ├── AuthNavigator.tsx     # Navegação de autenticação
│   └── MainNavigator.tsx     # Navegação principal
├── screens/                   # Telas do app
│   ├── auth/                 # Telas de autenticação
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   └── main/                 # Telas principais
│       ├── DashboardScreen.tsx
│       ├── ScannerScreen.tsx
│       ├── TagsScreen.tsx
│       ├── ProfileScreen.tsx
│       └── TagDetailScreen.tsx
├── services/                  # Serviços
│   └── api.ts               # Cliente da API
├── theme/                    # Tema
│   └── theme.ts             # Configuração do tema
└── types/                    # Tipos TypeScript
```

## 🔧 Configuração

### Permissões

O app solicita automaticamente as seguintes permissões:

#### Android
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

#### iOS
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Este app precisa acessar o Bluetooth para conectar com tags BLE.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Este app precisa acessar sua localização para rastrear tags BLE.</string>
```

### Configuração da API

Edite o arquivo `src/services/api.ts` para configurar a URL da API:

```typescript
const API_BASE_URL = 'http://your-api-url.com'; // URL da sua API
```

## 📱 Como Usar

### 1. Login
- Abra o app
- Digite seu email e senha
- Toque em "Entrar"

### 2. Scanner BLE
- Vá para a aba "Scanner"
- Toque em "Iniciar Scan"
- Aguarde o app encontrar dispositivos próximos
- Tags cadastradas aparecerão automaticamente

### 3. Visualizar Tags
- Vá para a aba "Tags"
- Veja todas as suas tags cadastradas
- Toque em uma tag para ver detalhes

### 4. Dashboard
- Na tela inicial, veja estatísticas em tempo real
- Monitore tags conectadas
- Visualize atividade recente

## 🔄 Sincronização

O app sincroniza dados automaticamente com a API:
- Status das tags em tempo real
- Logs de conexão
- Informações de localização
- Níveis de bateria

## 📊 Monitoramento

### Métricas Coletadas
- Status de conexão das tags
- Nível de bateria
- Localização GPS (quando disponível)
- RSSI (força do sinal)
- Timestamp dos eventos

### Alertas Automáticos
- Tag desconectada por mais de 10 minutos
- Bateria abaixo de 10%
- Tag encontrada após período offline

## 🚀 Build e Deploy

### Build para Produção

```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios

# Build universal
expo build
```

### Deploy no Expo

```bash
# Publicar atualização
expo publish

# Publicar com canal específico
expo publish --release-channel production
```

## 🧪 Testes

### Testes no Dispositivo
1. Instale o app Expo Go
2. Escaneie o QR code do terminal
3. O app será carregado no seu dispositivo

### Testes no Emulador
```bash
# Android
npm run android

# iOS (apenas macOS)
npm run ios
```

## 🔧 Troubleshooting

### Problemas Comuns

#### Bluetooth não funciona
- Verifique se o Bluetooth está ligado
- Confirme as permissões do app
- Reinicie o app

#### Tags não aparecem
- Verifique se as tags estão cadastradas na API
- Confirme a conexão com a internet
- Verifique se o MAC address está correto

#### Erro de conexão com API
- Verifique a URL da API
- Confirme se o backend está rodando
- Verifique a conexão de internet

## 📝 Logs

Para debug, use:
```bash
# Ver logs do Expo
expo logs

# Logs do dispositivo Android
adb logcat

# Logs do dispositivo iOS
# Use o Xcode Console
```

## 🔐 Segurança

- Tokens JWT armazenados de forma segura
- Comunicação HTTPS com a API
- Validação de dados no cliente
- Timeout automático de sessão

## 📈 Performance

### Otimizações Implementadas
- Lazy loading de telas
- Cache de dados local
- Debounce no scanner BLE
- Compressão de imagens
- Bundle splitting

## 🆘 Suporte

Para suporte técnico:
- Verifique a documentação da API
- Consulte os logs do app
- Teste em diferentes dispositivos
- Verifique as permissões do sistema
