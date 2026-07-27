import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import VenderScreen from '../screens/Vender';
import GastosScreen from '../screens/Gastos';
import CajaScreen from '../screens/Caja';
import AnalisisScreen from '../screens/Analisis';
import MenuScreen from '../screens/Menu';
import type { RootTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Vender" component={VenderScreen} />
        <Tab.Screen name="Gastos" component={GastosScreen} />
        <Tab.Screen name="Caja" component={CajaScreen} />
        <Tab.Screen name="Analisis" component={AnalisisScreen} options={{ title: 'Análisis' }} />
        <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Menú' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
