import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useRef } from 'react';
import { BlurTargetView } from 'expo-blur';

export default function RootLayout() {
  const schema = useColorScheme();
  const targetRef = useRef(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={schema === 'dark' ? 'light' : 'dark'} />
      <BlurTargetView ref={targetRef} style={{flex: 1}}>
          <Drawer
          screenOptions={{
            headerShown: false,

            // 1. Drawer Container (Background Color & Width)
            drawerStyle: {
              backgroundColor: '#121212', // Background color of drawer panel
              width: 250,
            },

            // 2. Active Tab Highlight
            drawerActiveTintColor: '#ffffff',       // Text & Icon color of the active tab
            drawerActiveBackgroundColor: '#3b82f6', // Background pill color of the active tab

            // 3. Inactive Tabs
            drawerInactiveTintColor: '#9ca3af',     // Text & Icon color of inactive tabs
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

      </BlurTargetView>
      
    </GestureHandlerRootView>
  );
}