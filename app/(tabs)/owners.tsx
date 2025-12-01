import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { UserSquare2, Mail, Phone, Home, Users } from '@tamagui/lucide-icons';
import ListHeader from '@/components/ui/ListHeader';
import EmptyState from '@/components/ui/EmptyState';

interface Partner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  listingsCount?: number;
  totalListings?: number;
  rentedListings?: number;
  tenantsCount?: number;
}

export default function PartnersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  const loadPartners = async () => {
    try {
      // Load all data in parallel
      const [ownersRes, listingsRes, tenantsRes] = await Promise.all([
        api.owners.getAll(),
        api.listings.getAll(),
        api.tenants.getAll(),
      ]);

      const ownersData = ownersRes.data || [];
      const listingsData = listingsRes.data || [];
      const tenantsData = tenantsRes.data || [];

      setListings(listingsData);
      setTenants(tenantsData);

      // Calculate stats for each owner
      const partnersWithStats = ownersData.map((owner: Partner) => {
        // Get owner's listings
        const ownerListings = listingsData.filter(
          (listing: any) => (listing.owner_id?._id || listing.owner_id) === owner._id
        );

        // Get rented listings
        const rentedListings = ownerListings.filter(
          (listing: any) => listing.status === 'rented'
        );

        // Get owner's tenants (tenants in owner's properties)
        const ownerListingIds = ownerListings.map((l: any) => l._id);
        const ownerTenants = tenantsData.filter(
          (tenant: any) => ownerListingIds.includes(tenant.listing_id?._id || tenant.listing_id)
        );

        return {
          ...owner,
          totalListings: ownerListings.length,
          rentedListings: rentedListings.length,
          tenantsCount: ownerTenants.length,
        };
      });

      setPartners(partnersWithStats);
    } catch (error) {
      console.error('Error loading owners:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPartners();
  };

  const renderPartner = ({ item }: { item: Partner }) => (
    <TouchableOpacity 
      style={styles.partnerCard}
      onPress={() => router.push(`/owner/${item._id}`)}
    >
      <View style={styles.partnerHeader}>
        <View style={styles.avatarContainer}>
          <UserSquare2 size={32} color="#7BA89E" />
        </View>
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerName}>{item.name}</Text>
          {item.company && (
            <Text style={styles.companyName}>{item.company}</Text>
          )}
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.status === 'active' ? '#7BA89E' : '#828489' },
          ]}
        />
      </View>

      <View style={styles.partnerDetails}>
        <View style={styles.detailRow}>
          <Mail size={16} color="#828489" />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Phone size={16} color="#828489" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
      </View>

      <View style={styles.partnerFooter}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Home size={16} color="#7BA89E" />
            <Text style={styles.statValue}>{item.totalListings || 0}</Text>
            <Text style={styles.statLabel}>{t('dashboard.totalListings')}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Home size={16} color="#4D7EA8" />
            <Text style={styles.statValue}>{item.rentedListings || 0}</Text>
            <Text style={styles.statLabel}>{t('dashboard.rented')}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Users size={16} color="#4D7EA8" />
            <Text style={styles.statValue}>{item.tenantsCount || 0}</Text>
            <Text style={styles.statLabel}>{t('navigation.tenants')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ListHeader
        title={t('partners.title')}
        count={partners.length}
        countLabel={partners.length === 1 ? t('partners.count_one') : t('partners.count_other')}
        buttonText={t('common.addNew')}
        onButtonPress={() => router.push('/owner/create')}
        buttonColor="#7BA89E"
      />

      <FlatList
        data={partners}
        renderItem={renderPartner}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4D7EA8" />
        }
        ListEmptyComponent={
          <EmptyState
            icon={UserSquare2}
            title={t('partners.noPartners')}
            subtitle={t('common.pullToRefresh')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  list: {
    padding: 16,
  },
  partnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F1EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#272932',
  },
  companyName: {
    fontSize: 14,
    color: '#828489',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  partnerDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#828489',
  },
  partnerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#828489',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#272932',
  },
  statLabel: {
    fontSize: 11,
    color: '#828489',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
});
