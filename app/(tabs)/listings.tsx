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

interface Listing {
  _id: string;
  title: string;
  price_per_week: number;
  address: string;
  suburb?: string;
  room_type?: string;
  status: string;
  images: string[];
  available_from?: string;
  bond?: number;
  bills_included?: boolean;
  preferred_tenants?: string[];
  house_features?: string[];
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#7BA89E';
      case 'draft':
        return '#828489';
      case 'reserved':
        return '#E89E8C';
      case 'rented':
        return '#9E90A2';
      default:
        return '#828489';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      published: 'Publicado',
      draft: 'Borrador',
      reserved: 'Reservado',
      rented: 'Alquilado',
    };
    return statusMap[status] || status;
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

  const renderListing = ({ item }: { item: Listing }) => (
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
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.listingDetails}>
          <View style={styles.detailRow}>
            <MapPin size={16} color="#828489" />
            <Text style={styles.detailText}>
              {item.address}{item.suburb ? `, ${item.suburb}` : ''}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <DollarSign size={16} color="#4D7EA8" />
            <Text style={styles.priceText}>
              ${item.price_per_week}/semana
            </Text>
            {item.bills_included && (
              <View style={styles.billsBadge}>
                <Text style={styles.billsText}>+ servicios</Text>
              </View>
            )}
          </View>

          {item.room_type && (
            <View style={styles.detailRow}>
              <Building2 size={16} color="#828489" />
              <Text style={styles.detailText}>{getRoomTypeLabel(item.room_type)}</Text>
            </View>
          )}

          {item.available_from && (
            <View style={styles.detailRow}>
              <Calendar size={16} color="#7BA89E" />
              <Text style={styles.detailText}>
                Disponible desde {formatDate(item.available_from)}
              </Text>
            </View>
          )}
        </View>

        {item.bond !== undefined && (
          <View style={styles.listingFooter}>
            <Text style={styles.footerText}>
              Depósito: ${item.bond}
            </Text>
          </View>
        )}
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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('listings.title')}</Text>
          <Text style={styles.count}>
            {listings.length} {listings.length === 1 ? t('listings.count_one') : t('listings.count_other')}
          </Text>
        </View>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ {t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listings}
        renderItem={renderListing}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4D7EA8" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Building2 size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>{t('listings.noListings')}</Text>
            <Text style={styles.emptySubtext}>Desliza hacia abajo para recargar</Text>
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
  loadingContainer: {
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#828489',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 8,
  },
});
