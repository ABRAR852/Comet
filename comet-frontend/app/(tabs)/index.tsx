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
    Animated
} from "react-native";
import { useSafeAreaInsets, EdgeInsets } from "react-native-safe-area-context";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useEffect, useRef, useState } from "react";
import Ionicons from "@react-native-vector-icons/ionicons";
import { BlurView, BlurTargetView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useTheme } from "../../hooks/useThemeColors";
import UserQuery from "../../components/UserQuery";
import ResponseBubble from "../../components/ResponseBubble";
import { getMgs, userQuery } from "../../services/Services";
import { streamChat } from "../../services/StreamChat";
import {Svg, Path} from "react-native-svg";

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
    const [streaming, setStreaming] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const flatListRef = useRef<FlatList>(null);
    const targetRef = useRef<View>(null);
    const abortRef = useRef<AbortController | null>(null);

    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const router = useRouter();
    const { convId } = useLocalSearchParams<{ convId: string }>();

    const tint = UIMode === "dark" ? "dark" : "light";
    const isEmpty = messages.length === 0;

    const bg = colors.background;
    const fadeColors = [bg, withAlpha(bg, 0.85), withAlpha(bg, 0)] as const;
    const fadeLocations = [0, 0.55, 1] as const;
    const last = messages[messages.length - 1];
    const waitingForFirstToken = loading && last?.role === "ASSISTANT" && last.content === "";

    const stickRef = useRef(true);
    const draggingRef = useRef(false);
    const offsetRef = useRef(0);
    const posRef = useRef(0);
    const contentHRef = useRef(0);
    const layoutHRef = useRef(0);

    const [showJump, setShowJump] = useState(false);
    const jumpAnim = useRef(new Animated.Value(0)).current;
    const SHOW_AT = 450;
    const HIDE_AT = 350;

    const handleStop = () => {
        abortRef.current?.abort();
    };

    const handleSend = async () => {
        const content = text.trim();
        if (!content || loading) return;

        const botId = (Date.now() + 1).toString();
        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: "user", content },
            { id: botId, role: "ASSISTANT", content: "" },
        ]);
        setText("");
        Keyboard.dismiss();
        setLoading(true);
        setStreaming(true);
        stickRef.current = true;

        const controller = new AbortController();
        abortRef.current = controller;

        const append = (chunk: string) =>
            setMessages((prev) =>
                prev.map((m) => (m.id === botId ? { ...m, content: m.content + chunk } : m))
            );

        let queue = "";
        const BASE_CPS = 70;
        const MAX_CPS = 700;
        const COMMIT_MS = 33;

        let carry = 0;
        let lastFrame = performance.now();
        let lastCommit = lastFrame;
        let running = true;
        let raf = 0;

        const loop = (now: number) => {
            if (!running) return;
            const dt = Math.min(now - lastFrame, 100);
            lastFrame = now;

            if (queue.length) {
                const cps = Math.min(MAX_CPS, BASE_CPS + queue.length * 0.8);
                carry += (cps * dt) / 1000;
            } else {
                carry = 0;
            }

            if (carry >= 1 && now - lastCommit >= COMMIT_MS) {
                const n = Math.min(Math.floor(carry), queue.length);
                carry -= n;
                const chunk = queue.slice(0, n);
                queue = queue.slice(n);
                lastCommit = now;
                append(chunk);
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const stopLoop = () => { running = false; cancelAnimationFrame(raf); };

        const waitForDrain = () =>
            new Promise<void>((resolve) => {
                const w = setInterval(() => {
                    if (!queue || controller.signal.aborted) {
                        clearInterval(w);
                        resolve();
                    }
                }, 30);
            });

        try {
            await streamChat({
                conversationId,
                content,
                signal: controller.signal,
                onMeta: (m) => setConversationId(m.conversationId),
                onToken: (t) => (queue += t),
            });
        } catch (error) {
            console.log("ERROR WHILE STREAMING: ", error);
            if (!controller.signal.aborted) {
                queue += "\n\nSomething went wrong. Please try again.";
            }
        } finally {
            await waitForDrain();
            stopLoop();
            if (abortRef.current === controller) {
                abortRef.current = null;
                setStreaming(false);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!streaming) return;
        posRef.current = offsetRef.current;
        let raf = 0;

        const tick = () => {
            if (stickRef.current && !draggingRef.current) {
                const target = Math.max(0, contentHRef.current - layoutHRef.current);
                const diff = target - posRef.current;
                if (diff > 0.5) {
                    const next = diff < 1 ? target : posRef.current + diff * 0.15;
                    posRef.current = next;
                    flatListRef.current?.scrollToOffset({ offset: next, animated: false });
                }
            }
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            if (stickRef.current) {
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 60);
            }
        };
    }, [streaming]);

    const getMessages = async (id: string) => {
        abortRef.current?.abort();
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
        abortRef.current?.abort();
        setMessages([]);
        setConversationId(null);
        setText("");
        setLoading(false);
        setShowJump(false);
        setStreaming(false);
        router.setParams({ convId: undefined });
    };

    useEffect(() => {
        Animated.timing(jumpAnim, {
            toValue: showJump && !isEmpty ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showJump, isEmpty]);

    const openDrawer = () => {
        const parent = navigation.getParent<DrawerNavigationProp<any>>();
        if (parent?.openDrawer) parent.openDrawer();
        else navigation?.openDrawer();
    };

    const jumpButton = () => {
        stickRef.current = true;
        const goToBottom = (animated: boolean) => {
            const target = Math.max(0, contentHRef.current - layoutHRef.current);
            flatListRef.current?.scrollToOffset({ offset: target, animated });
        };

        goToBottom(true);
        setTimeout(() => goToBottom(false), 350);
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
                        scrollEventThrottle={16}
                        onLayout={(e) => { layoutHRef.current = e.nativeEvent.layout.height; }}
                        onContentSizeChange={(_, h) => {
                            contentHRef.current = h;
                            if (!streaming && stickRef.current) {
                                flatListRef.current?.scrollToEnd({ animated: false });
                            }
                        }}
                        onScrollBeginDrag={() => {
                            draggingRef.current = true;
                            stickRef.current = false;
                        }}
                        onScrollEndDrag={() => { draggingRef.current = false; }}
                        onMomentumScrollEnd={() => { draggingRef.current = false; }}
                        onScroll={(e) => {
                            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
                            offsetRef.current = contentOffset.y;

                            const dist = contentSize.height - layoutMeasurement.height - contentOffset.y;

                            if(contentSize.height <= layoutMeasurement.height){
                                setShowJump(false);
                            }else if(dist > SHOW_AT){
                                setShowJump(true);
                            }else if(dist < HIDE_AT){
                                setShowJump(false);
                            }

                            if (draggingRef.current || !stickRef.current) {
                                posRef.current = contentOffset.y;
                                const dist = contentSize.height - layoutMeasurement.height - contentOffset.y;
                                if (!draggingRef.current && dist < 30) stickRef.current = true;
                            }
                        }}
                            renderItem={({ item }) =>
                            item.role === "ASSISTANT" ? (
                                item.content ? <ResponseBubble content={item.content} /> : null
                            ) : (
                                <UserQuery content={item.content} />
                            )
                        }
                        ListFooterComponent={
                            waitingForFirstToken ? (
                                <ActivityIndicator size="small" color={colors.text} style={styles.loader} />
                            ) : null
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

                <Animated.View
                    pointerEvents={showJump && !isEmpty ? "auto" : "none"}
                    style={[
                        styles.jumpWrap,
                        {
                            opacity: jumpAnim,
                            transform: [
                                {
                                    translateY: jumpAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [180, 0],
                                    }),
                                },
                                {
                                    scale: jumpAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.85, 1],
                                    }),
                                },
                                {
                                    rotate: jumpAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ["-90deg", "0deg"],
                                    })
                                }
                            ],
                        },
                    ]}
                >
                    <BlurView
                        blurTarget={targetRef}
                        blurMethod="dimezisBlurView"
                        tint={tint}
                        intensity={45}
                        style={styles.topButtonWrapper}
                    >
                        <TouchableOpacity onPress={jumpButton}>
                            <Svg style={styles.topButton} viewBox="0 0 524 835" >

                                <Path d= "M17.2089 574.062C17.2089 574.062 167.385 577.381 209.738 521.26C252.092 465.138 260.884 30.5154 260.884 30.5154C260.884 30.5154 252.097 465.412 313.456 521.109C368.618 576.815 506.138 573.351 506.138 573.351C506.138 573.351 368.608 570.288 313.609 626.154C258.609 682.02 262.034 821.301 262.034 821.301C262.034 821.301 265.053 682.011 209.891 626.305C154.729 570.599 17.2089 574.062 17.2089 574.062Z" fill={colors.text}/>
                                <Path d= "M0.833187 573.788C0.833187 573.788 161.287 577.286 206.539 518.081C251.792 458.876 261.194 0.379785 261.194 0.379785C261.194 0.379785 251.798 459.165 317.355 517.92C376.291 576.685 523.222 573.029 523.222 573.029C523.222 573.029 376.281 569.8 317.516 628.735C258.751 687.671 262.407 834.603 262.407 834.603C262.407 834.603 265.636 687.661 206.7 628.897C147.765 570.132 0.833187 573.788 0.833187 573.788Z" fill={colors.text} fillOpacity={"0.3"}/>

                            </Svg>
                        </TouchableOpacity>
                    </BlurView>
                </Animated.View>

                <BlurView
                    blurTarget={targetRef}
                    blurMethod="dimezisBlurView"
                    tint={tint}
                    intensity={45}
                    style={styles.inputWrapper}
                >
                    <TouchableOpacity
                        style={[styles.sendButton, !streaming && !text.trim() && styles.sendButtonDisabled]}
                        activeOpacity={0.5}
                        onPress={streaming ? handleStop : handleSend}
                        disabled={!streaming && !text.trim()}
                    >
                        <Ionicons
                            name={streaming ? "stop" : "arrow-up"}
                            size={wp(5)}
                            color={colors.sendbuttonarrow}
                        />
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
    const inputBottom = insets.bottom + hp(1);
    const inputHeight = wp(12);

    const topFadeHeight = buttonTop + buttonHeight + hp(4);
    const bottomFadeHeight = inputBottom + inputHeight + hp(4);

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
            paddingBottom: inputBottom + inputHeight + hp(7),
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
        topButtonWrapper: {
            borderRadius: wp(12),
            right: wp(2),
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            padding: wp(1)
        },
        topButton: {
            height: hp(4.5),
            width: wp(10),
        },
        jumpWrap: {
            position: "absolute",
            bottom: inputBottom + inputHeight + hp(7),
            right: wp(7),
            zIndex: 10,
        },
    });
}