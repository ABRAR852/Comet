import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import chat from '../app/(tabs)/chat';

const Drawer = createDrawerNavigator();

export default function MyDrawer () {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Chat" component={chat} />
        </Drawer.Navigator>
    );
}