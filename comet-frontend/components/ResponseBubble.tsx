import { View, StyleSheet } from "react-native";
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
            alignSelf: 'flex-start',
        }
    });

}
function getMarkdownStyles(colors: ReturnType<typeof useTheme>) {
  return {
    body: { color: colors.text, fontSize: wp(4), lineHeight: hp(3) },
    heading1: { fontSize: wp(5.5), fontWeight: '700' as const, color: colors.text, marginTop: hp(1.2), marginBottom: hp(0.7) },
    heading2: { fontSize: wp(5), fontWeight: '700' as const, color: colors.text, marginTop: hp(1), marginBottom: hp(0.5) },
    heading3: { fontSize: wp(4.5), fontWeight: '600' as const, color: colors.text, marginTop: hp(0.8), marginBottom: hp(0.5) },
    strong: { fontWeight: '700' as const, color: colors.text },
    paragraph: { marginTop: 0, marginBottom: hp(1) },
    bullet_list: { marginVertical: hp(0.5) },
    ordered_list: { marginVertical: hp(0.5) },
    list_item: { flexDirection: 'row' as const, marginBottom: hp(0.5) },
    code_inline: {
      backgroundColor: colors.background,
      paddingHorizontal: wp(1),
      borderRadius: 4,
      fontFamily: 'monospace',
    },
  };
}