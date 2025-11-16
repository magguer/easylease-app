import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import type { User, DashboardStats } from '@/types';
import { Building2, Users, UserSquare2, Plus, TrendingUp, DollarSign, Calendar, Home as HomeIcon, Settings as SettingsIcon } from '@tamagui/lucide-icons';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
      
      // Load stats based on role
      if (userData?.role === 'manager') {
        const response = await api.dashboard.getStats();
        console.log('Manager Dashboard Response:', response);
        // Backend returns: { data: { stats: { listings: {}, leads: {}, ... }}}
        const statsData = {
          totalListings: response.data.stats.listings.total,
          activeListings: response.data.stats.listings.active,
          totalLeads: response.data.stats.leads.total,
          newLeads: response.data.stats.leads.new,
          totalPartners: response.data.stats.partners.total,
          totalTenants: response.data.stats.tenants.total,
          activeTenants: response.data.stats.tenants.active,
          tenantsEndingSoon: response.data.stats.tenants.ending_soon,
        };
        setStats(statsData);
      }
      // For owner and tenant, we'll implement specific data loading
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  // Render different dashboards based on role
  if (user?.role === 'manager') {
    return <ManagerDashboard stats={stats} refreshing={refreshing} onRefresh={onRefresh} />;
  } else if (user?.role === 'owner') {
    return <OwnerDashboard user={user} refreshing={refreshing} onRefresh={onRefresh} />;
  } else if (user?.role === 'tenant') {
    return <TenantDashboard user={user} refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return null;
}

// MANAGER DASHBOARD
function ManagerDashboard({ stats, refreshing, onRefresh }: { stats: DashboardStats | null; refreshing: boolean; onRefresh: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4D7EA8" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('dashboard.title')}</Text>
          <Text style={styles.subtitle}>{t('dashboard.welcome')}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <SettingsIcon size={24} color="#4D7EA8" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Building2 size={32} color="#4D7EA8" />
          <Text style={styles.statValue}>{stats?.totalListings || 0}</Text>
          <Text style={styles.statLabel}>{t('dashboard.totalListings')}</Text>
          <Text style={styles.statSubtext}>
            {stats?.activeListings || 0} {t('dashboard.activeListings').toLowerCase()}
          </Text>
        </View>

        <View style={[styles.statCard, styles.accentCard]}>
          <Users size={32} color="#9E90A2" />
          <Text style={styles.statValue}>{stats?.totalLeads || 0}</Text>
          <Text style={styles.statLabel}>{t('dashboard.totalLeads')}</Text>
          <Text style={styles.statSubtext}>
            {stats?.newLeads || 0} {t('dashboard.newLeads').toLowerCase()}
          </Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <UserSquare2 size={32} color="#7BA89E" />
          <Text style={styles.statValue}>{stats?.totalTenants || 0}</Text>
          <Text style={styles.statLabel}>Total Inquilinos</Text>
          <Text style={styles.statSubtext}>
            {stats?.activeTenants || 0} activos
          </Text>
        </View>

        <View style={[styles.statCard, styles.warningCard]}>
          <Building2 size={32} color="#E89E8C" />
          <Text style={styles.statValue}>{stats?.totalPartners || 0}</Text>
          <Text style={styles.statLabel}>{t('dashboard.totalPartners')}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/listings')}
        >
          <View style={styles.actionIconContainer}>
            <Plus size={24} color="#4D7EA8" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('listings.createListing')}</Text>
            <Text style={styles.actionSubtitle}>{t('listings.fields.title')}, {t('listings.fields.price').toLowerCase()}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/leads')}
        >
          <View style={styles.actionIconContainer}>
            <TrendingUp size={24} color="#9E90A2" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('leads.title')}</Text>
            <Text style={styles.actionSubtitle}>{t('leads.status.new')}, {t('leads.status.contacted').toLowerCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// OWNER DASHBOARD
function OwnerDashboard({ user, refreshing, onRefresh }: { user: User; refreshing: boolean; onRefresh: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOwnerStats = async () => {
    try {
      const response = await api.dashboard.getStats();
      console.log('Owner Dashboard Stats:', JSON.stringify(response.data, null, 2));
      setStats(response.data);
    } catch (error) {
      console.error('Error loading owner stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  const totalProperties = stats?.stats?.listings?.total || 0;
  const rentedProperties = stats?.stats?.listings?.active || 0;
  const totalTenants = stats?.stats?.tenants?.total || 0;
  const activeTenants = stats?.stats?.tenants?.active || 0;
  const monthlyIncome = stats?.stats?.income?.monthly || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4D7EA8" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('dashboard.title')}</Text>
          <Text style={styles.subtitle}>{t('dashboard.welcomeTenant')}, {user.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <SettingsIcon size={24} color="#4D7EA8" />
        </TouchableOpacity>
      </View>

      {/* Owner Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Building2 size={32} color="#4D7EA8" />
          <Text style={styles.statValue}>{totalProperties}</Text>
          <Text style={styles.statLabel}>{t('dashboard.myProperties')}</Text>
          <Text style={styles.statSubtext}>{rentedProperties} {t('dashboard.rented')}</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <UserSquare2 size={32} color="#7BA89E" />
          <Text style={styles.statValue}>{totalTenants}</Text>
          <Text style={styles.statLabel}>{t('dashboard.myTenants')}</Text>
          <Text style={styles.statSubtext}>{activeTenants} {t('dashboard.active')}</Text>
        </View>

        <View style={[styles.statCard, styles.successCard]}>
          <DollarSign size={32} color="#7BA89E" />
          <Text style={styles.statValue}>${monthlyIncome.toLocaleString()}</Text>
          <Text style={styles.statLabel}>{t('dashboard.monthlyIncome')}</Text>
          <Text style={styles.statSubtext}>{t('dashboard.thisMonth')}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/listings')}
        >
          <View style={styles.actionIconContainer}>
            <Building2 size={24} color="#4D7EA8" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('dashboard.myProperties')}</Text>
            <Text style={styles.actionSubtitle}>{t('dashboard.myPropertiesSubtitle')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/leads')}
        >
          <View style={styles.actionIconContainer}>
            <Users size={24} color="#9E90A2" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('dashboard.myLeads')}</Text>
            <Text style={styles.actionSubtitle}>{t('dashboard.viewLeadsSubtitle')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/tenants')}
        >
          <View style={styles.actionIconContainer}>
            <UserSquare2 size={24} color="#7BA89E" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('dashboard.myTenants')}</Text>
            <Text style={styles.actionSubtitle}>{t('dashboard.myTenantsSubtitle')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/financial')}
        >
          <View style={styles.actionIconContainer}>
            <DollarSign size={24} color="#7BA89E" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('dashboard.financialSummary')}</Text>
            <Text style={styles.actionSubtitle}>{t('dashboard.financialSubtitle')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// TENANT DASHBOARD
function TenantDashboard({ user, refreshing, onRefresh }: { user: User; refreshing: boolean; onRefresh: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4D7EA8" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('dashboard.myHome')}</Text>
        <Text style={styles.subtitle}>{t('dashboard.welcomeTenant')}, {user.name}</Text>
      </View>

      {/* Tenant Info */}
      <View style={[styles.infoCard, styles.primaryCard]}>
        <View style={styles.infoRow}>
          <HomeIcon size={24} color="#4D7EA8" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('dashboard.yourProperty')}</Text>
            <Text style={styles.infoValue}>123 Example Street, Apt 4B</Text>
          </View>
        </View>
      </View>

      <View style={[styles.infoCard, styles.warningCard]}>
        <View style={styles.infoRow}>
          <Calendar size={24} color="#E89E8C" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('dashboard.nextPayment')}</Text>
            <Text style={styles.infoValue}>1 de Diciembre, 2025</Text>
            <Text style={styles.infoSubtext}>$1,500 AUD</Text>
          </View>
        </View>
      </View>

      <View style={[styles.infoCard, styles.successCard]}>
        <View style={styles.infoRow}>
          <Calendar size={24} color="#7BA89E" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('dashboard.leaseEnd')}</Text>
            <Text style={styles.infoValue}>30 de Junio, 2026</Text>
            <Text style={styles.infoSubtext}>6 {t('dashboard.monthsRemaining')}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/payments')}
        >
          <View style={styles.actionIconContainer}>
            <DollarSign size={24} color="#4D7EA8" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('dashboard.paymentHistory')}</Text>
            <Text style={styles.actionSubtitle}>{t('dashboard.paymentHistorySubtitle')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/maintenance')}
        >
          <View style={styles.actionIconContainer}>
            <TrendingUp size={24} color="#9E90A2" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('dashboard.requestMaintenance')}</Text>
            <Text style={styles.actionSubtitle}>{t('dashboard.maintenanceSubtitle')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/documents')}
        >
          <View style={styles.actionIconContainer}>
            <Building2 size={24} color="#7BA89E" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('dashboard.myDocuments')}</Text>
            <Text style={styles.actionSubtitle}>{t('dashboard.documentsSubtitle')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#828489',
  },
  statsGrid: {
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  primaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4D7EA8',
  },
  accentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9E90A2',
  },
  secondaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#7BA89E',
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E89E8C',
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#7BA89E',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#272932',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#828489',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#828489',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#828489',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#828489',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B6C2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#828489',
  },
});
