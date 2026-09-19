import { StyleSheet, View ,Text, TextInput, KeyboardAvoidingView, Platform, Pressable, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useThemeColors";
import { heightPercentageToDP as hp , widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useState } from "react";
import Ionicons from "@react-native-vector-icons/ionicons";

export default function ChatScreen (){
    const colors = useTheme();
    const styles = getStyles(colors);
    const [text, setText] = useState('');
    const [query, setQuery] = useState('');

    const handleSend = () => {
        if(!text.trim()) return;
        setQuery(text);
        setText('');
    }
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>

                    <View style={styles.content}>
                        {query ? (
                            <View style={styles.userBubble}>
                                <Text style={styles.userBubbleText}>{query}</Text>
                            </View>
                        ) : (
                            <Text style={styles.welcometext}>Ask anything!</Text>
                        )}
                    </View>

                    <View style={styles.inputWrapper}>
                        <TouchableOpacity style={[styles.sendButton, !text.trim() && styles.sendButtonOpacity]} 
                            activeOpacity={0.5} 
                            onPress={handleSend} 
                            disabled={!text.trim()}>
                            <Ionicons name='arrow-up' size={wp(5)} color={colors.text}></Ionicons>
                        </TouchableOpacity>
                    
                        <TextInput style={styles.inputContainer}
                            onChangeText={setText}
                            value={text}
                            cursorColor={colors.text}
                            placeholder="Ask here"
                            placeholderTextColor={colors.placeholdertext}
                        />
                    </View>

                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
function getStyles(colors: ReturnType<typeof useTheme>) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: wp(2),
        },
        welcometext: {
            fontSize: wp(7),
            color: colors.text,
            fontWeight: '400',
            textAlignVertical: 'center'
        },
        inputWrapper: {
            flexDirection: 'row-reverse',
            alignItems: 'center',
            width: wp(95),
            alignSelf: 'center',
            marginBottom: wp(10),
            paddingRight: wp(2.5),
            borderColor: colors.border,
            borderWidth: wp(0.5),
            borderRadius: wp(8),
            backgroundColor: colors.placeholder,
        },
        inputContainer: {
            flex: 1,
            height: wp(12),
            paddingLeft: wp(5),
            fontSize: wp(4),
            borderRadius: wp(2),
            color: colors.text,
        },
        sendButton: {
            height: wp(9),
            width: wp(9),
            borderRadius: wp(5),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.sendbuttonbackground,
        },
        sendButtonOpacity: {
            opacity: 0.6
        },
        userBubble: {
            alignSelf: 'flex-end',
            maxWidth: wp(80),
            borderTopRightRadius: wp(5),
            borderTopLeftRadius: wp(5),
            borderBottomLeftRadius: wp(5),
            borderBottomRightRadius: wp(0.7),
            paddingVertical: wp(3.5),
            paddingHorizontal: wp(4),
            backgroundColor: colors.placeholder

        },
        userBubbleText: {
            fontSize: wp(4),
            lineHeight: hp(3),
            color: colors.text
        }
        
    });

}
