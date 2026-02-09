import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Purchases from 'react-native-purchases';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PortfolioScreen from './src/screens/PortfolioScreen';
import AddAssetScreen from './src/screens/AddAssetScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const REVENUECAT_API_KEY = 'appl_XXXXXXXXXXXXXXXXXXXXXXXX';

export default function App() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        Purchases.setDebugLogsEnabled(true);
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });

        const customerInfo = await Purchases.getCustomerInfo();
        setIsPremium(customerInfo.entitlements.active?.premium !== undefined);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('RevenueCat init error:', error);
      }
    };

    initRevenueCat();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Portfolio') {
              iconName = focused ? 'pie-chart' : 'pie-chart-outline';
            } else if (route.name === 'Add') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Analytics') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: '#0f172a',
            borderTopColor: '#1e293b',
          },
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen
          name="Portfolio"
          component={PortfolioScreen}
          options={{ title: 'My Portfolio' }}
        />
        <Tab.Screen
          name="Add"
          component={AddAssetScreen}
          options={{ title: 'Add Asset' }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            title: 'Analytics',
            tabBarBadge: !isPremium ? 'LOCK' : undefined,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
