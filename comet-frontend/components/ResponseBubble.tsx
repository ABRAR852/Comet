import { View, StyleSheet } from "react-native";
import { heightPercentageToDP as hp , widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTheme } from "../../comet-frontend/hooks/useThemeColors";
import Markdown from "react-native-markdown-display";
import { memo, useMemo } from "react";
interface ResponseBubble {
    content: string;
}

function ResponseBubble ({ content }: ResponseBubble ) {

    const colors = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const markdownStyles = useMemo(() => getMarkdownStyles(colors), [colors]);

    return (

        <View style={styles.responseBubble}>
            <Markdown style={markdownStyles}>{content}</Markdown>
        </View>

    );
}

export default memo(ResponseBubble);

function getStyles(colors: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        responseBubble: {
            width: '100%',
            alignSelf: 'flex-start',
        }
    });

}
function getMarkdownStyles(colors: ReturnType<typeof useTheme>) {
  return {
    body: { color: colors.text, fontSize: wp(4), lineHeight: hp(3), fontFamily: 'Albert-Medium'},
    heading1: { fontSize: wp(6), fontFamily: 'Albert-Bold', fontWeight: 'normal' as const, color: colors.text, marginTop: hp(1.2), marginBottom: hp(0.7) },
    heading2: { fontSize: wp(5), fontFamily: 'Albert-SemiBold', fontWeight: 'normal' as const, color: colors.text, marginTop: hp(1), marginBottom: hp(0.5) },
    heading3: { fontSize: wp(4.5), fontFamily: 'Albert-Medium', fontWeight: 'normal' as const, color: colors.text, marginTop: hp(0.8), marginBottom: hp(0.5) },
    heading4: { fontSize: wp(4.2), fontFamily: 'Albert-SemiBold', color: colors.text, marginTop: hp(0.8), marginBottom: hp(0.4) },
    heading5: { fontSize: wp(4), fontFamily: 'Albert-SemiBold', color: colors.text, marginTop: hp(0.6), marginBottom: hp(0.4) },
    heading6: { fontSize: wp(3.8), fontFamily: 'Albert-Medium', color: colors.text, marginTop: hp(0.6), marginBottom: hp(0.3) },
    strong: { fontFamily: 'Albert-Bold', fontWeight: 'normal' as const, color: colors.text },
    em: { fontFamily: 'Albert-BoldItalic', fontStyle: 'normal' as const, fontWeight: 'normal' as const },
    paragraph: { fontFamily: 'Albert-Medium', marginBottom: hp(3), marginTop: 0,},
    bullet_list: { marginVertical: hp(0.5) },
    ordered_list: { marginVertical: hp(0.5) },
    list_item: { flexDirection: 'row' as const, marginBottom: hp(0.5) },
    code_inline: {
      backgroundColor: colors.bubbleBG,
      paddingHorizontal: wp(1),
      borderRadius: wp(2),
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: colors.bubbleBG,
      color: colors.text,
      padding: wp(3),
      borderRadius: wp(2),
      fontFamily: 'monospace',
      fontSize: wp(3.5),
    },
    fence: {
      backgroundColor: colors.bubbleBG,
      color: colors.text,
      marginBottom: hp(2),
      padding: wp(4),
      borderRadius: wp(3),
      borderColor: '#414141',
      borderWidth: wp(0.0),
      fontFamily: 'monospace',
      fontSize: wp(3.5),
    },
  };
}