import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useRef } from 'react';
import { BlurTargetView } from 'expo-blur';
import { MyDrawer } from '../components/Drawer';

export default function RootLayout() {
  const schema = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={schema === 'dark' ? 'light' : 'dark'} />
      <Drawer
        drawerContent={(props) => <MyDrawer {...props}/>}
          screenOptions={{
            headerShown: false,

            drawerStyle: {
              backgroundColor: '#d8d8d8',
              width: 250,
            },

            // 2. Active Tab Highlight
            drawerActiveTintColor: '#ffffff',
            drawerActiveBackgroundColor: '#8a8a8a',

            // 3. Inactive Tabs
            drawerInactiveTintColor: '#9ca3af',
            drawerInactiveBackgroundColor: 'transparent',

            // 4. Tab Item Shape & Spacing
            drawerItemStyle: {
              borderRadius: 8,
              marginVertical: 4,
              paddingHorizontal: 8,
            },

            // 5. Label Text Typography
            drawerLabelStyle: {
              fontSize: 15,
              fontWeight: '600',
            },
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              drawerLabel: 'Home',
              headerShown: false,
            }}
          />
        </Drawer>
      
    </GestureHandlerRootView>
  );
}