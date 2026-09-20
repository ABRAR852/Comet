import { StyleSheet, View ,Text, FlatList, TextInput, KeyboardAvoidingView, 
    Keyboard, 
    Platform, 
    TouchableOpacity, 
    PanResponder, 
    TouchableWithoutFeedback } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useThemeColors";
import { heightPercentageToDP as hp , widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useRef, useState } from "react";
import Ionicons from "@react-native-vector-icons/ionicons";
import UserQuery from "../../components/UserQuery";
import { LinearGradient } from "expo-linear-gradient";
import { userQuery } from "../../services/Services";
import { ActivityIndicator } from "react-native";
import ResponseBubble from "../../components/ResponseBubble";
import axios from "axios";

interface aiMsg {
    conversationId: string;
    content: string;
}

export default function ChatScreen (){
    const colors = useTheme();
    const styles = getStyles(colors);
    const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const inputGesRef = useRef<TextInput>(null);

    const handleSend = async () => {
        if(!text.trim()) return;
        const useMsg = {id: Date.now().toString(), role: 'user', content: text}
        setMessages(pre => [...pre, useMsg]);
        setText('');
        Keyboard.dismiss();
        setLoading(true);

        try {
            const data = await userQuery(conversationId, useMsg.content);
            setConversationId(data.conversationId);
            const assistantMsg = {id: (Date.now() + 1 ).toString(),
                role: 'assistant', 
                content: data.content};
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.log("ERROR WHILE SENDING: ", error);
            const isTimeout = axios.isAxiosError(error) && error.code === 'ECONNABORTED';
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: isTimeout
                ? "That took too long — try again?"
                : "Something went wrong. Please try again.",
            };
            setMessages(prev => [...prev, errorMessage]);
        }finally{
            setLoading(false);
        }
    }

    const panResponder = useRef (
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 20 && gestureState.vy < -0.2;
            },
            onPanResponderRelease: () => {
                inputGesRef.current?.focus();
            },
        })
    ).current;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
                    <View style={messages.length > 0 ? styles.queryContent : styles.emptyContent}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={{flex: 1}}>
                                {messages.length > 0 ? (
                                    <FlatList showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.messageList} 
                                        ref={flatListRef}
                                        data={messages} 
                                        keyExtractor={(item) => item.id} 
                                        renderItem={({item}) => item.role === 'assistant' ? (
                                            <ResponseBubble content={item.content}/>
                                        ) : (
                                            <UserQuery content={item.content}/>
                                        )}

                                        ListFooterComponent={
                                            loading ? <ActivityIndicator size={'small'} color= {colors.text} 
                                                style={{ marginVertical: hp(1) }}/> : null 
                                        }
                                        onContentSizeChange={() => {
                                            flatListRef.current?.scrollToEnd({ animated: true });
                                            setTimeout(() => {
                                                flatListRef.current?.scrollToEnd({ animated: true });
                                            }, 100);
                                        }}
                                    />
                                ) : (
                                    <Text style={styles.welcometext}>Ask anything!</Text>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                            
                            <View {...panResponder.panHandlers} style={styles.inputGes}/>
                                <LinearGradient colors={['transparent', colors.background + 'cc', colors.background]} 
                                    locations={[0, 0.51, 1.5]}
                                    style={styles.fadeOverlay} pointerEvents="none"/>
                            </View>
                    
                            <View style={styles.inputWrapper}>
                                <TouchableOpacity style={[styles.sendButton, !text.trim() && styles.sendButtonOpacity]} 
                                    activeOpacity={0.5} 
                                    onPress={handleSend} 
                                    disabled={!text.trim()}>
                                    <Ionicons name='arrow-up' size={wp(5)} color={colors.text}></Ionicons>
                                </TouchableOpacity>
                            
                                <TextInput style={styles.inputText}
                                    onChangeText={setText}
                                    value={text}
                                    ref={inputGesRef}
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
        emptyContent:{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: wp(2),
        },
        queryContent: {
            flex: 1,
            justifyContent: 'center',
            padding: wp(2),
            position: 'relative',
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
            marginBottom: hp(1.5),
            paddingRight: wp(2.5),
            borderColor: colors.border,
            borderWidth: wp(0.5),
            borderRadius: wp(8),
            backgroundColor: colors.placeholder,
        },
        inputText: {
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
        messageList: {
            paddingHorizontal: wp(1),
            paddingTop: hp(5),
            paddingBottom: hp(15),
            gap: hp(3),
        },
        fadeOverlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: hp(6),
        },
        inputGes: {
            width: '100%',
            height: hp(10),
            alignItems: 'center',
            justifyContent: 'center',
        }
        
    });

}
