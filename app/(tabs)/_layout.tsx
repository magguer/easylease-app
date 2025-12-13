import { useState, useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';
import { getUser } from '@/lib/auth';
import { UserRole } from '@/types';
import { Home, Building2, Users, UserSquare2, Settings, FileText, DollarSign, Wrench } from '@tamagui/lucide-icons';

import GlobalHeader from '@/components/ui/GlobalHeader';
import NavigationMenu from '@/components/ui/NavigationMenu';
import { Alert } from 'react-native';

export default function TabsLayout() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    // Get user role on mount
    const loadUserRole = async () => {
      const user = await getUser();
      setUserRole(user?.role || null);
      setLoading(false);
    };
    loadUserRole();
  }, []);

  const handleMenuPress = () => {
    Alert.alert('Menu', 'Opened Navigation Drawer');
    // TODO: Implement Drawer navigation or Sidebar
  };

  const handleProfilePress = () => {
    router.push('/user/profile' as any);
  };

  // Show loading while checking user role
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  // Don't render if no role
  if (!userRole) {
    return null;
  }

  // Render tabs based on user role with specific order
  const renderTabsByRole = () => {
    const commonScreenOptions = {
      headerShown: false,
      tabBarActiveTintColor: '#4D7EA8',
      tabBarInactiveTintColor: '#828489',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E0E0E0',
        borderTopWidth: 1,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        height: 70 + Math.max(insets.bottom, 0),
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    };

    if (userRole === 'manager') {
      return (
        <Tabs key={`tabs-${language}`} screenOptions={commonScreenOptions}>
          {/* Manager Order: Owners - Tenants - Home - Listings - Leads */}
          <Tabs.Screen
            name="owners"
            options={{
              title: t('navigation.partners'),
              tabBarIcon: ({ color }) => <UserSquare2 size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="tenants"
            options={{
              title: t('navigation.tenants'),
              tabBarIcon: ({ color, size }) => <UserSquare2 size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: '',
              tabBarIcon: ({ color, focused }) => (
                <View style={styles.floatingButton}>
                  <View style={[styles.floatingButtonInner, focused && styles.floatingButtonActive]}>
                    <Home size={28} color="#FFFFFF" />
                  </View>
                </View>
              ),
              tabBarItemStyle: { marginTop: -20 },
            }}
          />
          <Tabs.Screen
            name="listings"
            options={{
              title: t('navigation.listings'),
              tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="leads"
            options={{
              title: t('navigation.leads'),
              tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
            }}
          />
          {/* Hidden tabs for manager */}
          <Tabs.Screen name="payments" options={{ href: null }} />
          <Tabs.Screen name="maintenance" options={{ href: null }} />
          <Tabs.Screen name="financial" options={{ href: null }} />
          <Tabs.Screen name="documents" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
        </Tabs>
      );
    }

    if (userRole === 'owner') {
      return (
        <Tabs key={`tabs-${language}`} screenOptions={commonScreenOptions}>
          {/* Owner Order: Propiedades - Inquilinos - Home - Clientes - Finanzas */}
          <Tabs.Screen
            name="listings"
            options={{
              title: t('navigation.myProperties'),
              tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="tenants"
            options={{
              title: t('navigation.myTenants'),
              tabBarIcon: ({ color, size }) => <UserSquare2 size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: '',
              tabBarIcon: ({ color, focused }) => (
                <View style={styles.floatingButton}>
                  <View style={[styles.floatingButtonInner, focused && styles.floatingButtonActive]}>
                    <Home size={28} color="#FFFFFF" />
                  </View>
                </View>
              ),
              tabBarItemStyle: { marginTop: -20 },
            }}
          />
          <Tabs.Screen
            name="leads"
            options={{
              title: t('navigation.myLeads'),
              tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="financial"
            options={{
              title: t('navigation.financial'),
              tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
            }}
          />
          {/* Hidden tabs for owner */}
          <Tabs.Screen name="owners" options={{ href: null }} />
          <Tabs.Screen name="payments" options={{ href: null }} />
          <Tabs.Screen name="maintenance" options={{ href: null }} />
          <Tabs.Screen name="documents" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
        </Tabs>
      );
    }

    if (userRole === 'tenant') {
      return (
        <Tabs key={`tabs-${language}`} screenOptions={commonScreenOptions}>
          {/* Tenant Order: Pagos - Documentos - Home - Mantenimiento - Config */}
          <Tabs.Screen
            name="payments"
            options={{
              title: t('navigation.payments'),
              tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="documents"
            options={{
              title: t('navigation.documents'),
              tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: '',
              tabBarIcon: ({ color, focused }) => (
                <View style={styles.floatingButton}>
                  <View style={[styles.floatingButtonInner, focused && styles.floatingButtonActive]}>
                    <Home size={28} color="#FFFFFF" />
                  </View>
                </View>
              ),
              tabBarItemStyle: { marginTop: -20 },
            }}
          />
          <Tabs.Screen
            name="maintenance"
            options={{
              title: t('navigation.maintenance'),
              tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
            }}
          />
          {/* Hidden tabs for tenant */}
          <Tabs.Screen name="owners" options={{ href: null }} />
          <Tabs.Screen name="tenants" options={{ href: null }} />
          <Tabs.Screen name="listings" options={{ href: null }} />
          <Tabs.Screen name="leads" options={{ href: null }} />
          <Tabs.Screen name="financial" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
        </Tabs>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <GlobalHeader
        onMenuPress={() => setMenuVisible(true)}
        onProfilePress={handleProfilePress}
      />
      <NavigationMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        userRole={userRole}
      />
      {renderTabsByRole()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  floatingButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    marginBottom: -20,
  },
  floatingButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4D7EA8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonActive: {
    backgroundColor: '#3D6888',
    transform: [{ scale: 1.05 }],
  },
});
