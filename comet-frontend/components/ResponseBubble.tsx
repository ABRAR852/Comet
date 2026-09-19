import { View, Text, StyleSheet } from "react-native";
import { heightPercentageToDP as hp , widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTheme } from "../../comet-frontend/hooks/useThemeColors";
interface ResponseBubble {
    content: string;
}

export default function ResponseBubble ({ content }: ResponseBubble ) {

    const colors = useTheme();
    const styles = getStyles(colors);

    return (

        <View style={styles.responseBubble}>
            <Text style={styles.responseText}>{content}</Text>
        </View>

    );
}

function getStyles(colors: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        responseBubble: {
            alignSelf: 'flex-start',
            paddingVertical: wp(3.5),
            paddingHorizontal: wp(4),
        },
        responseText: {
            fontSize: wp(4),
            lineHeight: hp(3),
            color: colors.text
        }
    });

}