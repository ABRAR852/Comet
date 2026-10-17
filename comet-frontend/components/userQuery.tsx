import { View, Text, StyleSheet } from "react-native";
import { heightPercentageToDP as hp , widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTheme } from "../../comet-frontend/hooks/useThemeColors";
import { memo, useMemo } from "react";

interface UserQuery {
    content: string;
}

function UserQuery ({ content }: UserQuery ) {

    const colors = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    return (

        <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>{content}</Text>
        </View>

    );
}

export default memo(UserQuery);

function getStyles(colors: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        userBubble: {
            alignSelf: 'flex-end',
            maxWidth: wp(80),
            marginTop: hp(3),
            marginBottom: hp(3),
            borderTopRightRadius: wp(5),
            borderTopLeftRadius: wp(5),
            borderBottomLeftRadius: wp(5),
            borderBottomRightRadius: wp(0.7),
            paddingVertical: wp(3.5),
            paddingHorizontal: wp(4),
            backgroundColor: colors.bubbleBG

        },
        userBubbleText: {
            fontSize: wp(4),
            lineHeight: hp(3),
            color: colors.text,
        }
    });

}