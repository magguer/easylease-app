import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, User } from '@tamagui/lucide-icons';
import { getUser } from '@/lib/auth'; // Assuming we can get user info or pass it down
import { useState, useEffect } from 'react';
import { User as UserType } from '@/types';

interface GlobalHeaderProps {
    onMenuPress?: () => void;
    onProfilePress?: () => void;
}

export default function GlobalHeader({ onMenuPress, onProfilePress }: GlobalHeaderProps) {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<UserType | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <TouchableOpacity style={styles.button} onPress={onMenuPress}>
                    <Menu size={24} color="#1A1A1A" />
                </TouchableOpacity>

                <View style={styles.center}>
                    {/* Optional: App Logo or Title here if needed */}
                    <Text style={styles.title}>EasyLease</Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={onProfilePress}>
                    <View style={styles.avatarContainer}>
                        <User size={20} color="#4D7EA8" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        zIndex: 100,
    },
    content: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    button: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        // flex: 1,
        // alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4D7EA8',
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E3F2FD',
    },
});
