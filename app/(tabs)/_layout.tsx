import { useState, useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';
import { getUser } from '@/lib/auth';
import { UserRole } from '@/types';
import { Home, Building2, Users, UserSquare2, Settings, FileText, DollarSign, Wrench } from '@tamagui/lucide-icons';

export default function TabsLayout() {
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role on mount
    const loadUserRole = async () => {
      const user = await getUser();
      setUserRole(user?.role || null);
      setLoading(false);
    };
    loadUserRole();
  }, []);

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

  // Helper to determine if a tab should be shown
  const shouldShowTab = (tabName: string): boolean => {
    const managerTabs = ['listings', 'leads', 'index', 'tenants', 'partners'];
    const ownerTabs = ['listings', 'leads', 'index', 'tenants', 'financial'];
    const tenantTabs = ['payments', 'maintenance', 'index', 'documents', 'settings'];

    switch (userRole) {
      case 'manager':
        return managerTabs.includes(tabName);
      case 'owner':
        return ownerTabs.includes(tabName);
      case 'tenant':
        return tenantTabs.includes(tabName);
      default:
        return false;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Tabs
        key={`tabs-${language}`}
        screenOptions={{
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
        }}
      >
        {/* Listings - Manager & Owner */}
        <Tabs.Screen
          name="listings"
          options={{
            href: shouldShowTab('listings') ? undefined : null,
            title: userRole === 'owner' ? t('navigation.myProperties') : t('navigation.listings'),
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Building2 size={size} color={color} />
            ),
          }}
        />

        {/* Leads - Manager & Owner */}
        <Tabs.Screen
          name="leads"
          options={{
            href: shouldShowTab('leads') ? undefined : null,
            title: userRole === 'owner' ? t('navigation.myLeads') : t('navigation.leads'),
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Users size={size} color={color} />
            ),
          }}
        />

        {/* Payments - Tenant only */}
        <Tabs.Screen
          name="payments"
          options={{
            href: shouldShowTab('payments') ? undefined : null,
            title: t('navigation.payments'),
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <DollarSign size={size} color={color} />
            ),
          }}
        />

        {/* Maintenance - Tenant only */}
        <Tabs.Screen
          name="maintenance"
          options={{
            href: shouldShowTab('maintenance') ? undefined : null,
            title: t('navigation.maintenance'),
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Wrench size={size} color={color} />
            ),
          }}
        />

        {/* Dashboard/Home - All roles - CENTRAL FLOATING BUTTON */}
        <Tabs.Screen
          name="index"
          options={{
            href: shouldShowTab('index') ? undefined : null,
            title: '', // Sin título para el botón central
            tabBarIcon: ({ color, focused }: { color: string; size: number; focused: boolean }) => (
              <View style={styles.floatingButton}>
                <View style={[styles.floatingButtonInner, focused && styles.floatingButtonActive]}>
                  <Home size={28} color="#FFFFFF" />
                </View>
              </View>
            ),
            tabBarItemStyle: {
              marginTop: -20, // Eleva el botón
            },
          }}
        />

        {/* Tenants - Manager & Owner */}
        <Tabs.Screen
          name="tenants"
          options={{
            href: shouldShowTab('tenants') ? undefined : null,
            title: userRole === 'owner' ? t('navigation.myTenants') : t('navigation.tenants'),
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <UserSquare2 size={size} color={color} />
            ),
          }}
        />

        {/* Financial - Owner only */}
        <Tabs.Screen
          name="financial"
          options={{
            href: shouldShowTab('financial') ? undefined : null,
            title: t('navigation.financial'),
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <DollarSign size={size} color={color} />
            ),
          }}
        />

        {/* Partners - Manager only */}
        <Tabs.Screen
          name="partners"
          options={{
            href: shouldShowTab('partners') ? undefined : null,
            title: t('navigation.partners'),
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Building2 size={size} color={color} />
            ),
          }}
        />

        {/* Documents - Tenant only */}
        <Tabs.Screen
          name="documents"
          options={{
            href: shouldShowTab('documents') ? undefined : null,
            title: t('navigation.documents'),
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <FileText size={size} color={color} />
            ),
          }}
        />

        {/* Settings - All roles */}
        <Tabs.Screen
          name="settings"
          options={{
            href: shouldShowTab('settings') ? undefined : null,
            title: t('navigation.settings'),
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
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
