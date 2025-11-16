import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { logout, getUser } from '@/lib/auth';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { LogOut, User, Bell } from '@tamagui/lucide-icons';
import type { User as UserType } from '@/types';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await getUser();
    setCurrentUser(user);
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager':
        return '#4D7EA8';
      case 'owner':
        return '#E89E8C';
      case 'tenant':
        return '#B6C2D9';
      default:
        return '#828489';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>

      {/* User Info Section */}
      {currentUser && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usuario actual</Text>
          <View style={styles.card}>
            <View style={styles.userInfo}>
              <View style={styles.userIcon}>
                <User size={32} color="#4D7EA8" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{currentUser.name}</Text>
                <Text style={styles.userEmail}>{currentUser.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(currentUser.role) }]}>
                  <Text style={styles.roleText}>{currentUser.role.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.card}>
          <LanguageSwitcher />
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        <TouchableOpacity style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Bell size={24} color="#4D7EA8" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('settings.pushNotifications')}</Text>
              <Text style={styles.settingSubtitle}>
                Recibe notificaciones de nuevos leads
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
        <TouchableOpacity style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <User size={24} color="#4D7EA8" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('settings.profile')}</Text>
              <Text style={styles.settingSubtitle}>
                Editar información personal
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={24} color="#FFFFFF" />
        <Text style={styles.logoutText}>{t('auth.logout')}</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>
        {t('settings.version')} 0.1.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#272932',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#828489',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B6C2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#828489',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#E89E8C',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  version: {
    textAlign: 'center',
    color: '#828489',
    fontSize: 14,
    marginTop: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#B6C2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#828489',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
