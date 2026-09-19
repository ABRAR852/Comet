import { useColorScheme } from "react-native";
import { Colors } from "../components/Colors";

export function useTheme(){

    const schema = useColorScheme();
    const theme = schema === 'dark' ? 'dark' : 'light';
    return Colors[theme];
}