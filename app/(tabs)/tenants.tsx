import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Mail, Phone, Home, Calendar, Clock } from '@tamagui/lucide-icons';
import { useTranslation } from '../../hooks/useTranslation';
import { api } from '../../lib/api';
import ListHeader from '../../components/ui/ListHeader';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';

interface Tenant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  // listing_id: removed
  current_contract_id: {
    _id: string;
    start_date: string;
    end_date: string;
    weekly_rent: number;
    bond_amount: number;
    bond_paid: boolean;
    status: string;
    days_remaining?: number;
    listing_id: {
      _id: string;
      address: string;
      suburb: string;
      title?: string;
    } | null;
  } | null;
  status: 'active' | 'ending_soon' | 'ended' | 'terminated' | 'available';
}

export default function TenantsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadTenants = async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await api.tenants.getAll(params);
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
  }, [filterStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTenants();
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
            <Users size={20} color="#272932" />
            <Text style={styles.tenantName}>{item.name}</Text>
          </View>
          <StatusBadge status={item.status} type="tenant" />
        </View>
      </View>

      <View style={styles.contactRow}>
        <Mail size={16} color="#828489" />
        <Text style={styles.contactText}>{item.email}</Text>
      </View>

      <View style={styles.contactRow}>
        <Phone size={16} color="#828489" />
        <Text style={styles.contactText}>{item.phone}</Text>
      </View>

      {item.current_contract_id && item.current_contract_id.listing_id && (
        <>
          <View style={styles.propertySection}>
            <View style={styles.propertyRow}>
              <Home size={16} color="#828489" />
              <Text style={styles.propertyText}>
                {item.current_contract_id.listing_id.address}, {item.current_contract_id.listing_id.suburb}
              </Text>
            </View>
          </View>

          <View style={styles.leaseSection}>
            <View style={styles.leaseRow}>
              <View style={styles.leaseItem}>
                <Text style={styles.leaseLabel}>{t('tenants.lease.start')}</Text>
                <Text style={styles.leaseValue}>{formatDate(item.current_contract_id.start_date)}</Text>
              </View>
              <View style={styles.leaseItem}>
                <Text style={styles.leaseLabel}>{t('tenants.lease.end')}</Text>
                <Text style={styles.leaseValue}>{formatDate(item.current_contract_id.end_date)}</Text>
              </View>
            </View>
            {item.current_contract_id.days_remaining !== undefined && item.current_contract_id.days_remaining > 0 && (
              <View style={styles.daysRemainingBadge}>
                <Clock size={14} color="#F97316" />
                <Text style={styles.daysRemainingText}>
                  {item.current_contract_id.days_remaining} {t('tenants.lease.daysRemaining')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.rentInfo}>
              <Text style={styles.rentLabel}>{t('tenants.financial.weeklyRent')}</Text>
              <Text style={styles.rentAmount}>${item.current_contract_id.weekly_rent}</Text>
            </View>
            <View style={styles.bondInfo}>
              <Text style={styles.bondLabel}>{t('tenants.financial.bond')}</Text>
              <Text style={styles.bondAmount}>${item.current_contract_id.bond_amount}</Text>
            </View>
          </View>
        </>
      )}
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
      <ListHeader
        title={t('navigation.tenants')}
        count={tenants.length}
        countLabel={tenants.length === 1 ? t('tenants.count_one') : t('tenants.count_other')}
        buttonText={t('common.addNew')}
        onButtonPress={() => router.push('/tenant/create')}
        buttonColor="#4D7EA8"
      />

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>
              {t('tenants.filters.all')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'active' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('active')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'active' && styles.filterButtonTextActive]}>
              {t('tenants.filters.active')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'ending_soon' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('ending_soon')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'ending_soon' && styles.filterButtonTextActive]}>
              {t('tenants.filters.endingSoon')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'ended' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('ended')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'ended' && styles.filterButtonTextActive]}>
              {t('tenants.filters.ended')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
          <EmptyState
            icon={Users}
            title={t('tenants.noTenants')}
            subtitle={t('common.pullToRefresh')}
            iconColor="#CBD5E1"
          />
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filtersScroll: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
    backgroundColor: '#4D7EA8',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
});
