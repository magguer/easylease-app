import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { getUser } from '@/lib/auth';
import { User, Mail, Phone, Edit3, ArrowLeft } from '@tamagui/lucide-icons';
import { User as UserType } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserType | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadUser();
        }, [])
    );

    const loadUser = async () => {
        const userData = await getUser();
        setUser(userData);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4D7EA8" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.title}>{t('settings.profile')}</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push('/user/editUser')}
                >
                    <Edit3 size={24} color="#4D7EA8" />
                </TouchableOpacity>
            </View>

            <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                    <User size={48} color="#4D7EA8" />
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <View style={styles.iconContainer}>
                            <Mail size={20} color="#666" />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>{t('partners.form.email')}</Text>
                            <Text style={styles.infoValue}>{user?.email}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconContainer}>
                            <Phone size={20} color="#666" />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>{t('partners.form.phone')}</Text>
                            <Text style={styles.infoValue}>{user?.phone || '-'}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
    },
    backButton: {
        padding: 8,
    },
    editButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: 'white',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4D7EA8',
        backgroundColor: '#F0F7FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    infoSection: {
        padding: 16,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: '#828489',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 4,
        marginLeft: 56, // indent to align with text
    }
});
