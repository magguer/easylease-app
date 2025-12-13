import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Home, Building2, Users, UserSquare2, Settings, FileText,
    DollarSign, Wrench, X, LogOut
} from '@tamagui/lucide-icons';
import { UserRole } from '@/types';
import { logout } from '@/lib/auth';

interface NavigationMenuProps {
    visible: boolean;
    onClose: () => void;
    userRole: UserRole | null;
}

export default function NavigationMenu({ visible, onClose, userRole }: NavigationMenuProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    if (!userRole) return null;

    const navigateTo = (route: string) => {
        onClose();
        // Small delay to allow modal to close smoothly before pushing
        setTimeout(() => {
            router.push(route as any);
        }, 300);
    };

    const handleLogout = async () => {
        onClose();
        await logout();
        router.replace('/(auth)/login');
    };

    const menuItems = {
        manager: [
            { id: 'index', label: 'Home', icon: Home, route: '/(tabs)' },
            { id: 'owners', label: t('navigation.partners'), icon: UserSquare2, route: '/(tabs)/owners' },
            { id: 'tenants', label: t('navigation.tenants'), icon: UserSquare2, route: '/(tabs)/tenants' },
            { id: 'listings', label: t('navigation.listings'), icon: Building2, route: '/(tabs)/listings' },
            { id: 'leads', label: t('navigation.leads'), icon: Users, route: '/(tabs)/leads' },
            { id: 'settings', label: t('navigation.settings'), icon: Settings, route: '/(tabs)/settings' },
        ],
        owner: [
            { id: 'index', label: 'Home', icon: Home, route: '/(tabs)' },
            { id: 'listings', label: t('navigation.myProperties'), icon: Building2, route: '/(tabs)/listings' },
            { id: 'tenants', label: t('navigation.myTenants'), icon: UserSquare2, route: '/(tabs)/tenants' },
            { id: 'leads', label: t('navigation.myLeads'), icon: Users, route: '/(tabs)/leads' },
            { id: 'financial', label: t('navigation.financial'), icon: DollarSign, route: '/(tabs)/financial' },
            { id: 'settings', label: t('navigation.settings'), icon: Settings, route: '/(tabs)/settings' },
        ],
        tenant: [
            { id: 'index', label: 'Home', icon: Home, route: '/(tabs)' },
            { id: 'payments', label: t('navigation.payments'), icon: DollarSign, route: '/(tabs)/payments' },
            { id: 'documents', label: t('navigation.documents'), icon: FileText, route: '/(tabs)/documents' },
            { id: 'maintenance', label: t('navigation.maintenance'), icon: Wrench, route: '/(tabs)/maintenance' },
            { id: 'settings', label: t('navigation.settings'), icon: Settings, route: '/(tabs)/settings' },
        ],
    };

    const currentItems = menuItems[userRole as keyof typeof menuItems] || [];

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection="left"
            animationIn="slideInLeft"
            animationOut="slideOutLeft"
            style={styles.modal}
            useNativeDriver
            hideModalContentWhileAnimating
        >
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>Menu</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    {currentItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.route || (item.route !== '/(tabs)' && pathname.startsWith(item.route));

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.menuItem, isActive && styles.menuItemActive]}
                                onPress={() => navigateTo(item.route)}
                            >
                                <Icon size={22} color={isActive ? '#4D7EA8' : '#666'} />
                                <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <LogOut size={22} color="#F44336" />
                        <Text style={[styles.menuText, { color: '#F44336' }]}>{t('common.logout') || 'Logout'}</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 0, // Full screen
        justifyContent: 'flex-start', // Align content to start (left if row, top if col?) Default is col.
        // We want the modal to fill the screen but the child to be on the left.
        // react-native-modal with margin 0 fills screen. 
        // We need to ensure the horizontal alignment is correct.
        flexDirection: 'row',
    },
    container: {
        width: '80%', // Drawer width
        maxWidth: 300,
        backgroundColor: 'white',
        height: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        paddingVertical: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 16,
    },
    menuItemActive: {
        backgroundColor: '#F0F7FF',
        borderRightWidth: 3,
        borderRightColor: '#4D7EA8',
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    menuTextActive: {
        color: '#4D7EA8',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 10,
    }
});
