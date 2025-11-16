import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../hooks/useTranslation';
import { api } from '../../lib/api';

interface Tenant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  listing_id: {
    _id: string;
    address: string;
    suburb: string;
    title?: string;
  };
  lease_start: string;
  lease_end: string;
  weekly_rent: number;
  bond_paid: number;
  status: 'active' | 'ending_soon' | 'ended' | 'terminated';
  payment_method: string;
  days_remaining?: number;
}

export default function TenantsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTenants = async () => {
    try {
      const response = await api.tenants.getAll();
      setTenants(response.data || []);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTenants();
  };

  const getStatusColor = (status: Tenant['status']) => {
    switch (status) {
      case 'active':
        return '#22C55E';
      case 'ending_soon':
        return '#F97316';
      case 'ended':
        return '#94A3B8';
      case 'terminated':
        return '#EF4444';
      default:
        return '#94A3B8';
    }
  };

  const getStatusLabel = (status: Tenant['status']) => {
    switch (status) {
      case 'active':
        return t('tenants.status.active');
      case 'ending_soon':
        return t('tenants.status.ending_soon');
      case 'ended':
        return t('tenants.status.ended');
      case 'terminated':
        return t('tenants.status.terminated');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const renderTenant = ({ item }: { item: Tenant }) => (
    <TouchableOpacity 
      style={styles.tenantCard}
      onPress={() => router.push(`/tenant/${item._id}`)}
    >
      <View style={styles.tenantHeader}>
        <View style={styles.tenantInfo}>
          <View style={styles.nameRow}>
            <Ionicons name="person" size={20} color="#272932" />
            <Text style={styles.tenantName}>{item.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contactRow}>
        <Ionicons name="mail-outline" size={16} color="#828489" />
        <Text style={styles.contactText}>{item.email}</Text>
      </View>

      <View style={styles.contactRow}>
        <Ionicons name="call-outline" size={16} color="#828489" />
        <Text style={styles.contactText}>{item.phone}</Text>
      </View>

      {item.listing_id && (
        <View style={styles.propertySection}>
          <View style={styles.propertyRow}>
            <Ionicons name="home-outline" size={16} color="#828489" />
            <Text style={styles.propertyText}>
              {item.listing_id.address}, {item.listing_id.suburb}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.leaseSection}>
        <View style={styles.leaseRow}>
          <View style={styles.leaseItem}>
            <Text style={styles.leaseLabel}>{t('tenants.lease.start')}</Text>
            <Text style={styles.leaseValue}>{formatDate(item.lease_start)}</Text>
          </View>
          <View style={styles.leaseItem}>
            <Text style={styles.leaseLabel}>{t('tenants.lease.end')}</Text>
            <Text style={styles.leaseValue}>{formatDate(item.lease_end)}</Text>
          </View>
        </View>
        {item.days_remaining !== undefined && item.days_remaining > 0 && (
          <View style={styles.daysRemainingBadge}>
            <Ionicons name="time-outline" size={14} color="#F97316" />
            <Text style={styles.daysRemainingText}>
              {item.days_remaining} {t('tenants.lease.daysRemaining')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.rentInfo}>
          <Text style={styles.rentLabel}>{t('tenants.financial.weeklyRent')}</Text>
          <Text style={styles.rentAmount}>${item.weekly_rent}</Text>
        </View>
        <View style={styles.bondInfo}>
          <Text style={styles.bondLabel}>{t('tenants.financial.bond')}</Text>
          <Text style={styles.bondAmount}>${item.bond_paid}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#272932" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('navigation.tenants')}</Text>
          <Text style={styles.count}>
            {tenants.length} {tenants.length === 1 ? t('tenants.count_one') : t('tenants.count_other')}
          </Text>
        </View>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ {t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tenants}
        renderItem={renderTenant}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>{t('tenants.noTenants')}</Text>
            <Text style={styles.emptySubtext}>{t('tenants.pullToRefresh')}</Text>
          </View>
        }
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#828489',
  },
  createButton: {
    backgroundColor: '#4D7EA8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  tenantCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tenantHeader: {
    marginBottom: 12,
  },
  tenantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#272932',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#64748B',
  },
  propertySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  propertyText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  leaseSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  leaseRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  leaseItem: {
    flex: 1,
  },
  leaseLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  leaseValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  daysRemainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  daysRemainingText: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 16,
  },
  rentInfo: {
    flex: 1,
  },
  rentLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  rentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#272932',
  },
  bondInfo: {
    flex: 1,
  },
  bondLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  bondAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 4,
  },
});
