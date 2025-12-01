import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import { Building2, MapPin, DollarSign, Calendar, Home } from '@tamagui/lucide-icons';
import ListHeader from '@/components/ui/ListHeader';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

interface Listing {
  _id: string;
  title: string;
  address: string;
  suburb?: string;
  room_type?: string;
  images: string[];
  preferred_tenants?: string[];
  house_features?: string[];
  active_contract?: {
    _id: string;
    status: string;
    tenant_id?: {
      name: string;
      email: string;
    };
    weekly_rent: number;
    start_date: string;
    end_date: string;
  };
}

export default function ListingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = async () => {
    try {
      const response = await api.listings.getAll();
      // API devuelve { success: true, data: [...], count: X }
      setListings(response.data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const getRoomTypeLabel = (roomType?: string) => {
    if (!roomType) return '';
    const typeMap: { [key: string]: string } = {
      master: 'Habitación Principal',
      double: 'Habitación Doble',
      single: 'Habitación Individual',
    };
    return typeMap[roomType] || roomType;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getListingStatus = (listing: Listing): { status: string; type: 'listing' | 'contract' } => {
    // Si tiene un contrato activo, mostrar el estado del contrato
    if (listing.active_contract) {
      return {
        status: listing.active_contract.status,
        type: 'contract'
      };
    }
    
    // Si no tiene contrato activo, mostrar "available" (disponible)
    return {
      status: 'available',
      type: 'listing'
    };
  };

  const renderListing = ({ item }: { item: Listing }) => {
    const { status, type } = getListingStatus(item);
    
    return (
    <TouchableOpacity 
      style={styles.listingCard}
      onPress={() => router.push(`/listing/${item._id}`)}
    >
      {/* Image */}
      {item.images && item.images.length > 0 ? (
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.listingImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Home size={48} color="#E0E0E0" />
        </View>
      )}

      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <Text style={styles.listingTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <StatusBadge status={status} type={type} />
        </View>

        <View style={styles.listingDetails}>
          <View style={styles.detailRow}>
            <MapPin size={16} color="#828489" />
            <Text style={styles.detailText}>
              {item.address}{item.suburb ? `, ${item.suburb}` : ''}
            </Text>
          </View>
          
          {item.room_type && (
            <View style={styles.detailRow}>
              <Building2 size={16} color="#828489" />
              <Text style={styles.detailText}>{getRoomTypeLabel(item.room_type)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  };

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
        title={t('listings.title')}
        count={listings.length}
        countLabel={listings.length === 1 ? t('listings.count_one') : t('listings.count_other')}
        buttonText={t('common.addNew')}
        onButtonPress={() => router.push('/listing/create')}
        buttonColor="#5B9AA8"
      />

      <FlatList
        data={listings}
        renderItem={renderListing}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4D7EA8" />
        }
        ListEmptyComponent={
          <EmptyState
            icon={Building2}
            title={t('listings.noListings')}
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
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingContent: {
    padding: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  listingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#272932',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listingDetails: {
    gap: 10,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#828489',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4D7EA8',
  },
  billsBadge: {
    backgroundColor: '#B6C2D9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  billsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4D7EA8',
  },
  listingFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#828489',
    fontWeight: '500',
  },
});
