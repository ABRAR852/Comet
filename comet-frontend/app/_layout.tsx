import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { MyDrawer } from '../components/Drawer';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useFonts } from 'expo-font';
import { fonts } from '../components/Font';

export default function RootLayout() {
  const schema = useColorScheme();
  const [loaded] = useFonts(fonts);
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={schema === 'dark' ? 'light' : 'dark'} />
      <Drawer
        drawerContent={(props) => <MyDrawer {...props}/>}
          screenOptions={{
            headerShown: false,

            drawerStyle: {
              backgroundColor: '#808080',
              width: wp(60),
            },

            drawerActiveTintColor: '#df0808',
            drawerActiveBackgroundColor: '#e60505',

            drawerInactiveTintColor: '#9ca3af',
            drawerInactiveBackgroundColor: 'transparent',

            drawerItemStyle: {
              borderRadius: wp(4),
              marginVertical: wp(2),
              paddingHorizontal: wp(4),
            },

            drawerLabelStyle: {
              fontSize: wp(8),
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