import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    useColorScheme,
} from "react-native";
import { useSafeAreaInsets, EdgeInsets } from "react-native-safe-area-context";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useEffect, useRef, useState } from "react";
import Ionicons from "@react-native-vector-icons/ionicons";
import axios from "axios";
import { BlurView, BlurTargetView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useTheme } from "../../hooks/useThemeColors";
import UserQuery from "../../components/UserQuery";
import ResponseBubble from "../../components/ResponseBubble";
import { getMgs, userQuery } from "../../services/Services";

type Msg = { id: string; role: string; content: string };

function withAlpha(color: string, alpha: number): string {
    const hex = color.replace("#", "");
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }
    if (/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
    return `rgba(0,0,0,${alpha})`;
}

export default function ChatScreen() {
    const colors = useTheme();
    const UIMode = useColorScheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);

    const [messages, setMessages] = useState<Msg[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const flatListRef = useRef<FlatList>(null);
    const targetRef = useRef<View>(null);

    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const router = useRouter();
    const { convId } = useLocalSearchParams<{ convId: string }>();

    const tint = UIMode === "dark" ? "dark" : "light";
    const isEmpty = messages.length === 0;

    const bg = colors.background;
    const fadeColors = [bg, withAlpha(bg, 0.85), withAlpha(bg, 0)] as const;
    const fadeLocations = [0, 0.55, 1] as const;

    const handleSend = async () => {
        const content = text.trim();
        if (!content) return;

        const userMsg: Msg = { id: Date.now().toString(), role: "user", content };
        setMessages((prev) => [...prev, userMsg]);
        setText("");
        Keyboard.dismiss();
        setLoading(true);

        try {
            const data = await userQuery(conversationId, content);
            setConversationId(data.conversationId);
            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "ASSISTANT", content: data.content },
            ]);
        } catch (error) {
            console.log("ERROR WHILE SENDING: ", error);
            const isTimeout = axios.isAxiosError(error) && error.code === "ECONNABORTED";
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "ASSISTANT",
                    content: isTimeout
                        ? "That took too long — try again?"
                        : "Something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getMessages = async (id: string) => {
        try {
            setLoading(true);
            const response = await getMgs(id);
            const list: Msg[] = (response.data ?? []).map((m: any, i: number) => ({
                id: String(m.id ?? `${id}-${i}`),
                role: m.role,
                content: m.content,
            }));
            setMessages(list);
            setConversationId(id);
        } catch (error) {
            console.log("ERROR WHILE GETTING MESSAGES: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (convId) getMessages(convId);
    }, [convId]);

    const startNewChat = () => {
        setMessages([]);
        setConversationId(null);
        setText("");
        setLoading(false);
        router.setParams({ convId: undefined });
    };

    const openDrawer = () => {
        const parent = navigation.getParent<DrawerNavigationProp<any>>();
        if (parent?.openDrawer) parent.openDrawer();
        else navigation?.openDrawer();
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >

                <BlurTargetView
                    ref={targetRef}
                    style={[styles.flex, isEmpty && styles.centered]}
                >
                    {isEmpty ? (
                        <Text style={styles.welcomeText}>Ask anything!</Text>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.messageList}
                            renderItem={({ item }) =>
                                item.role === "ASSISTANT" ? (
                                    <ResponseBubble content={item.content} />
                                ) : (
                                    <UserQuery content={item.content} />
                                )
                            }
                            ListFooterComponent={
                                loading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.text}
                                        style={styles.loader}
                                    />
                                ) : null
                            }
                            onContentSizeChange={() =>
                                flatListRef.current?.scrollToEnd({ animated: true })
                            }
                        />
                    )}
                </BlurTargetView>

                <LinearGradient
                    pointerEvents="none"
                    colors={fadeColors}
                    locations={fadeLocations}
                    style={styles.topFade}
                />

                <LinearGradient
                    pointerEvents="none"
                    colors={[fadeColors[2], fadeColors[1], fadeColors[0]]}
                    locations={fadeLocations}
                    style={styles.bottomFade}
                />

                <BlurView
                    blurTarget={targetRef}
                    blurMethod="dimezisBlurView"
                    tint={tint}
                    intensity={45}
                    style={[styles.roundButton, styles.leftButton]}
                >
                    <TouchableOpacity style={styles.buttonInner} onPress={openDrawer}>
                        <Ionicons
                            name="chatbubbles-outline"
                            size={wp(6)}
                            color={colors.drawerbuttonicon}
                        />
                    </TouchableOpacity>
                </BlurView>

                <BlurView
                    blurTarget={targetRef}
                    blurMethod="dimezisBlurView"
                    tint={tint}
                    intensity={45}
                    style={[styles.roundButton, styles.rightButton]}
                >
                    <TouchableOpacity style={styles.buttonInner} onPress={startNewChat}>
                        <Ionicons
                            name="create-outline"
                            size={wp(6)}
                            color={colors.drawerbuttonicon}
                        />
                    </TouchableOpacity>
                </BlurView>

                <BlurView
                    blurTarget={targetRef}
                    blurMethod="dimezisBlurView"
                    tint={tint}
                    intensity={45}
                    style={styles.inputWrapper}
                >
                    <TouchableOpacity
                        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
                        activeOpacity={0.5}
                        onPress={handleSend}
                        disabled={!text.trim()}
                    >
                        <Ionicons name="arrow-up" size={wp(5)} color={colors.sendbuttonarrow} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.inputText}
                        onChangeText={setText}
                        value={text}
                        cursorColor={colors.text}
                        placeholder="Ask here"
                        placeholderTextColor={colors.placeholdertext}
                    />
                </BlurView>
            </KeyboardAvoidingView>
        </View>
    );
}

function getStyles(colors: ReturnType<typeof useTheme>, insets: EdgeInsets) {
    const buttonTop = insets.top + wp(2.5);
    const buttonHeight = hp(5);
    const inputBottom = insets.bottom + hp(3.5);
    const inputHeight = wp(12);

    const topFadeHeight = buttonTop + buttonHeight + hp(4);
    const bottomFadeHeight = inputBottom + inputHeight + hp(5);

    return StyleSheet.create({
        flex: {
            flex: 1,
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        centered: {
            alignItems: "center",
            justifyContent: "center",
        },
        welcomeText: {
            fontSize: wp(7),
            color: colors.text,
            fontFamily: "News-Regular",
        },
        messageList: {
            paddingHorizontal: wp(3),
            paddingTop: buttonTop + buttonHeight + hp(2),
            paddingBottom: inputBottom + inputHeight + hp(3),
            gap: hp(3),
        },
        loader: {
            marginVertical: hp(1),
            alignSelf: "flex-start",
        },
        topFade: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: topFadeHeight,
        },
        bottomFade: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: bottomFadeHeight,
        },
        roundButton: {
            position: "absolute",
            top: buttonTop,
            height: buttonHeight,
            width: wp(13),
            borderRadius: wp(8),
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
        },
        leftButton: {
            left: wp(2.5),
        },
        rightButton: {
            right: wp(2.5),
        },
        buttonInner: {
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
        },
        inputWrapper: {
            position: "absolute",
            left: wp(2.5),
            right: wp(2.5),
            bottom: inputBottom,
            flexDirection: "row-reverse",
            alignItems: "center",
            paddingRight: wp(1.5),
            borderColor: colors.border,
            borderWidth: wp(0.5),
            borderRadius: wp(8),
            overflow: "hidden",
            zIndex: 10,
        },
        inputText: {
            flex: 1,
            height: inputHeight,
            paddingLeft: wp(5),
            fontSize: wp(4),
            fontFamily: "News-Regular",
            color: colors.text,
        },
        sendButton: {
            height: wp(9),
            width: wp(9),
            borderRadius: wp(5),
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.sendbuttonbackground,
        },
        sendButtonDisabled: {
            opacity: 0.7,
        },
    });
}