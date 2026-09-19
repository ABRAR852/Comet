import {Stack} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout () {
    const schema = useColorScheme();
    return (
        <>
            <StatusBar style={schema === 'dark' ? 'light' : 'dark'}/>
            <Stack screenOptions={{ headerShown: false, statusBarAnimation: 'fade'}} >
                <Stack.Screen name='(tabs)' options={{headerShown: false}}/>
            </Stack>
        </>
    );
}