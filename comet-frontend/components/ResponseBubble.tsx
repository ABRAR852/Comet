import { View,Text, StyleSheet } from "react-native";
import { heightPercentageToDP as hp , widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTheme } from "../../comet-frontend/hooks/useThemeColors";
import Markdown from "react-native-markdown-display";
interface ResponseBubble {
    content: string;
}

export default function ResponseBubble ({ content }: ResponseBubble ) {

    const colors = useTheme();
    const styles = getStyles(colors);
    const markdownStyles = getMarkdownStyles(colors);

    return (

        <View style={styles.responseBubble}>
            <Markdown style={markdownStyles}>{content}</Markdown>
        </View>

    );
}

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
    body: { color: colors.text, fontSize: wp(4), lineHeight: hp(3), fontFamily: 'News-Medium'},
    heading1: { fontSize: wp(6), fontFamily: 'News-Bold', fontWeight: 'normal' as const, color: colors.text, marginTop: hp(1.2), marginBottom: hp(0.7) },
    heading2: { fontSize: wp(5), fontFamily: 'News-SemiBold', fontWeight: 'normal' as const, color: colors.text, marginTop: hp(1), marginBottom: hp(0.5) },
    heading3: { fontSize: wp(4.5), fontFamily: 'News-Medium', fontWeight: 'normal' as const, color: colors.text, marginTop: hp(0.8), marginBottom: hp(0.5) },
    heading4: { fontSize: wp(4.2), fontFamily: 'News-SemiBold', color: colors.text, marginTop: hp(0.8), marginBottom: hp(0.4) },
    heading5: { fontSize: wp(4), fontFamily: 'News-SemiBold', color: colors.text, marginTop: hp(0.6), marginBottom: hp(0.4) },
    heading6: { fontSize: wp(3.8), fontFamily: 'News-Medium', color: colors.text, marginTop: hp(0.6), marginBottom: hp(0.3) },
    strong: { fontFamily: 'News-Bold', fontWeight: 'normal' as const, color: colors.text },
    em: { fontFamily: 'News-LightItalic', fontStyle: 'normal' as const, fontWeight: 'normal' as const },
    paragraph: { fontFamily: 'News-Regular', marginBottom: hp(1)},
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