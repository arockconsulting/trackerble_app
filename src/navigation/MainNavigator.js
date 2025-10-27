import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import TagsScreen from '../screens/main/TagsScreen.js';
import AddTagScreen from '../screens/main/AddTagScreen.js';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TagsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TagsList" component={TagsScreen} />
    <Stack.Screen name="AddTag" component={AddTagScreen} />
  </Stack.Navigator>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Tags') {
            iconName = focused ? 'bluetooth' : 'bluetooth-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Tags" 
        component={TagsStack}
        options={{
          tabBarLabel: 'Tags',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={TagsScreen} // Placeholder for now
        options={{
          tabBarLabel: 'Mapa',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={TagsScreen} // Placeholder for now
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;