import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import VenderScreen from '../screens/Vender';
import GastosScreen from '../screens/Gastos';
import CajaScreen from '../screens/Caja';
import AnalisisScreen from '../screens/Analisis';
import MenuScreen from '../screens/Menu';
import { colors } from '../theme/colors';
import type { RootTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }> = {
  Vender: { outline: 'cart-outline', filled: 'cart' },
  Gastos: { outline: 'cash-outline', filled: 'cash' },
  Caja: { outline: 'wallet-outline', filled: 'wallet' },
  Analisis: { outline: 'bar-chart-outline', filled: 'bar-chart' },
  Menu: { outline: 'restaurant-outline', filled: 'restaurant' },
};

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIcon: ({ color, size, focused }) => {
            const icons = TAB_ICONS[route.name as keyof RootTabParamList];
            return <Ionicons name={focused ? icons.filled : icons.outline} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Vender" component={VenderScreen} />
        <Tab.Screen name="Gastos" component={GastosScreen} />
        <Tab.Screen name="Caja" component={CajaScreen} />
        <Tab.Screen name="Analisis" component={AnalisisScreen} options={{ title: 'Análisis' }} />
        <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Menú' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
