import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import DetailHeader from '@/components/ui/DetailHeader';
import {
  User,
  Mail,
  Phone,
  Building,
  FileText,
  AlertCircle,
  Home,
  Users,
  ChevronRight,
  MapPin,
} from '@tamagui/lucide-icons';

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: string;
  notes?: string;
  total_listings?: number;
  active_listings?: number;
}

interface Listing {
  _id: string;
  title: string;
  address: string;
  suburb?: string;
  price_per_week: number;
  status: string;
}

interface Tenant {
  _id: string;
  name: string;
  email: string;
  status: string;
  current_contract_id: {
    listing_id: {
      _id: string;
      title: string;
    };
  };
}

export default function OwnerDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadOwner();
    loadOwnerListings();
    loadOwnerTenants();
    loadUserRole();
  }, [id]);

  const loadUserRole = async () => {
    const user = await getUser();
    setUserRole(user?.role || null);
  };

  const loadOwner = async () => {
    try {
      setLoading(true);
      const response = await api.owners.getById(id);
      setOwner(response.data);
    } catch (error: any) {
      console.error('Error loading owner:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('partners.messages.loadError')
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadOwnerListings = async () => {
    try {
      const response = await api.listings.getAll();
      console.log('All listings:', response.data.length);
      console.log('Looking for owner ID:', id);

      // Filter listings by owner_id (not owner_partner_id)
      const ownerListings = response.data.filter(
        (listing: any) => {
          const ownerId = listing.owner_id?._id || listing.owner_id;
          console.log('Listing:', listing.title, 'Owner ID:', ownerId);
          return ownerId === id;
        }
      );

      console.log('Owner listings found:', ownerListings.length);
      setListings(ownerListings); // Store all listings
    } catch (error) {
      console.error('Error loading owner listings:', error);
    }
  };

  const loadOwnerTenants = async () => {
    try {
      const response = await api.tenants.getAll();
      // Filter tenants whose listing belongs to this owner
      const listingsResponse = await api.listings.getAll();
      const ownerListingIds = listingsResponse.data
        .filter((listing: any) => {
          const ownerId = listing.owner_id?._id || listing.owner_id;
          return ownerId === id;
        })
        .map((listing: any) => listing._id);

      const ownerTenants = response.data.filter(
        (tenant: any) => {
          const listingId = tenant.current_contract_id?.listing_id?._id;
          return listingId && ownerListingIds.includes(listingId);
        }
      );
      setTenants(ownerTenants); // Store all tenants
    } catch (error) {
      console.error('Error loading owner tenants:', error);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleEdit = () => {
    router.push(`/owner/edit/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#7BA89E';
      case 'inactive':
        return '#828489';
      default:
        return '#828489';
    }
  };

  const getStatusText = (status: string) => {
    return t(`partners.status.${status}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  if (!owner) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#E89E8C" />
        <Text style={styles.errorText}>{t('partners.noPartners')}</Text>
      </View>
    );
  }

  const canEdit = userRole === 'manager';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title={t('partners.detail.title')}
        showEdit={canEdit}
        onEdit={handleEdit}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Owner Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.ownerName}>{owner.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(owner.status) }]}>
                <Text style={styles.statusText}>{getStatusText(owner.status)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Contact Info */}
          <View style={styles.infoSection}>
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => handleEmail(owner.email)}
            >
              <Mail size={20} color="#7BA89E" />
              <Text style={styles.infoText}>{owner.email}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => handleCall(owner.phone)}
            >
              <Phone size={20} color="#7BA89E" />
              <Text style={styles.infoText}>{owner.phone}</Text>
            </TouchableOpacity>

            {owner.company && (
              <View style={styles.infoRow}>
                <Building size={20} color="#7BA89E" />
                <Text style={styles.infoText}>{owner.company}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Properties Summary */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Home size={24} color="#7BA89E" />
            <Text style={styles.sectionTitle}>{t('partners.fields.listings')}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('dashboard.totalListings')}</Text>
              <Text style={styles.detailValue}>{listings.length}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('dashboard.rented')}</Text>
              <Text style={styles.detailValue}>
                {listings.filter(l => l.status === 'rented').length}
              </Text>
            </View>
          </View>
        </View>

        {/* Properties List */}
        {listings.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Home size={24} color="#7BA89E" />
              <Text style={styles.sectionTitle}>{t('navigation.listings')}</Text>
              <Text style={styles.sectionCount}>({listings.length})</Text>
            </View>

            {listings.slice(0, 2).map((listing) => (
              <TouchableOpacity
                key={listing._id}
                style={styles.listItem}
                onPress={() => router.push(`/listing/${listing._id}`)}
              >
                <View style={styles.listItemContent}>
                  <View style={styles.listItemIcon}>
                    <Home size={20} color="#7BA89E" />
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{listing.title}</Text>
                    <View style={styles.listItemMeta}>
                      <MapPin size={14} color="#828489" />
                      <Text style={styles.listItemSubtitle}>
                        {listing.address}{listing.suburb ? `, ${listing.suburb}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.listItemPrice}>${listing.price_per_week}/semana</Text>
                  </View>
                  <ChevronRight size={20} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            ))}

            {listings.length > 2 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => router.push('/(tabs)/listings')}
              >
                <Text style={styles.showMoreButtonText}>
                  {t('common.view')} {listings.length - 2} más
                </Text>
                <ChevronRight size={18} color="#4D7EA8" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tenants List */}
        {tenants.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Users size={24} color="#7BA89E" />
              <Text style={styles.sectionTitle}>{t('navigation.tenants')}</Text>
              <Text style={styles.sectionCount}>({tenants.length})</Text>
            </View>

            {tenants.slice(0, 2).map((tenant) => (
              <TouchableOpacity
                key={tenant._id}
                style={styles.listItem}
                onPress={() => router.push(`/tenant/${tenant._id}`)}
              >
                <View style={styles.listItemContent}>
                  <View style={styles.listItemIcon}>
                    <User size={20} color="#4D7EA8" />
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{tenant.name}</Text>
                    <Text style={styles.listItemSubtitle}>{tenant.email}</Text>
                    <Text style={styles.listItemMeta2}>{tenant.current_contract_id?.listing_id?.title}</Text>
                  </View>
                  <ChevronRight size={20} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            ))}

            {tenants.length > 2 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => router.push('/(tabs)/tenants')}
              >
                <Text style={styles.showMoreButtonText}>
                  {t('common.view')} {tenants.length - 2} más
                </Text>
                <ChevronRight size={18} color="#4D7EA8" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Notes */}
        {owner.notes && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FileText size={24} color="#828489" />
              <Text style={styles.sectionTitle}>{t('partners.fields.notes')}</Text>
            </View>
            <Text style={styles.notesText}>{owner.notes}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#828489',
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4D7EA8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#272932',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#272932',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: -6,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#828489',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4D7EA8',
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemInfo: {
    flex: 1,
    gap: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listItemMeta2: {
    fontSize: 12,
    color: '#94A3B8',
  },
  listItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7BA89E',
    marginTop: 4,
  },
  showMoreButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  showMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4D7EA8',
  },
  notesText: {
    fontSize: 14,
    color: '#272932',
    lineHeight: 20,
  },
});
