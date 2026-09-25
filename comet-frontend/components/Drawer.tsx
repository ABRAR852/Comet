import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useThemeColors";
import { useEffect, useState } from "react";
import { getConv, getMgs } from "../services/Services";
import { useRouter } from "expo-router";

export interface Conversation {
    id: string;
    title: string;
    updated_at?: string; 
    created_at?: string; 
}

export function MyDrawer (props: any) {
    
    const colors = useTheme();
    const styles = getStyles(colors);
    const insets = useSafeAreaInsets();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setErorr] = useState<string | null>(null);
    const router = useRouter();

    const getConversations = async () => {
        try {
            setLoading(true);

            const response = await getConv();
            setConversations(response);
            
        } catch (error) {
            setErorr('Something went wrong!');
        }finally{
            setLoading(false);
        }
    }

    const sendConvIdToMainScreen = async (convId: string) => {
        router.setParams({convId});

        props.navigation.closeDrawer();
    };

    useEffect(() => {
        getConversations();
    },[]);

    return (

        <View style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>

            <View style={styles.newChatContainer}>
                <Text style={styles.newChatText}>New Chat</Text>
            </View>

            <ScrollView  showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyContainer}>
                <Text style={styles.sectionTitle}>Recents</Text>
                {loading ? (
                    <ActivityIndicator size='small' color={'black'} />
                ) : error ? (
                      <Text style={styles.errorText}>Failed to load. Tap to retry.</Text>
                ) : conversations.length == 0 ? (
                    <Text style={styles.subText}>No past conversations</Text>
                ) : (
                    conversations.map((item, index) => (
                        <TouchableOpacity
                        key={item.id || index.toString()}
                        style={styles.itemRow}
                        activeOpacity={0.6}
                        onPress={() => sendConvIdToMainScreen(item.id)}>
                            <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
                                {item.title || 'New Chat'}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

        </View>
        
    );
}

function getStyles(colors: ReturnType<typeof useTheme>){
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background
        },
        newChatContainer: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#383838',
        },
        newChatText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        historyContainer: {
            padding: 16,
        },
        sectionTitle: {
            color: colors.placeholdertext,
            fontSize: 12,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: 12,
        },
        subText: {
            color: colors.text,
            fontSize: 13,
            marginTop: 8,
        },
        errorText: {
            color: '#ef4444',
            fontSize: 13,
            marginTop: 8,
        },
        itemRow: {
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderRadius: 6,
            marginBottom: 4,
        },
        itemTitle: {
            color: colors.text,
            fontSize: 14,
        },
    });
    
}