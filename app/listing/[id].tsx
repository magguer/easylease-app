import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { api } from '../../lib/api';
import { getUser } from '../../lib/auth';
import DetailHeader from '../../components/ui/DetailHeader';
import {
  MapPin,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Trash2,
  Home,
  Wifi,
  Car,
  Dog,
  Package,
  Bath,
  Check,
  X,
} from '@tamagui/lucide-icons';

const { width } = Dimensions.get('window');

interface Listing {
  _id: string;
  title: string;
  price_per_week: number;
  address: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  room_type?: string;
  status: string;
  images: string[];
  available_from?: string;
  bond?: number;
  bills_included?: boolean;
  preferred_tenants?: string[];
  house_features?: string[];
  description?: string;
  bathroom_type?: string;
  parking?: boolean;
  internet?: boolean;
  furnished?: boolean;
  pets_allowed?: boolean;
  min_stay_weeks?: number;
  max_stay_weeks?: number;
  owner_partner_id?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    loadListing();
    loadUserRole();
  }, [id]);

  const loadUserRole = async () => {
    const user = await getUser();
    setUserRole(user?.role || '');
  };

  const loadListing = async () => {
    try {
      const response = await api.listings.getById(id as string);
      setListing(response.data);
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#22C55E';
      case 'draft':
        return '#94A3B8';
      case 'reserved':
        return '#F97316';
      case 'rented':
        return '#8B5CF6';
      default:
        return '#94A3B8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'reserved':
        return 'Reservado';
      case 'rented':
        return 'Rentado';
      default:
        return status;
    }
  };

  const getRoomTypeLabel = (roomType?: string) => {
    switch (roomType) {
      case 'master':
        return 'Habitación Principal';
      case 'double':
        return 'Habitación Doble';
      case 'single':
        return 'Habitación Individual';
      default:
        return roomType || 'N/A';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <X size={64} color="#EF4444" />
        <Text style={styles.errorText}>Propiedad no encontrada</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title={t('listings.detail.title')}
        showEdit={userRole === 'manager' || userRole === 'owner'}
        onEdit={() => router.push(`/listing/edit/${id}`)}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {listing.images && listing.images.length > 0 && (
          <View style={styles.imageSection}>
            <Image
              source={{ uri: listing.images[currentImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {listing.images.length > 1 && (
              <View style={styles.imageIndicators}>
                {listing.images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.activeIndicator,
                    ]}
                    onPress={() => setCurrentImageIndex(index)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Title and Status */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(listing.status) + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(listing.status) }]}>
                {getStatusLabel(listing.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.price}>${listing.price_per_week}/semana</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.locationRow}>
            <MapPin size={20} color="#64748B" />
            <Text style={styles.address}>
              {listing.address}
              {listing.suburb && `, ${listing.suburb}`}
              {listing.state && `, ${listing.state}`}
              {listing.postcode && ` ${listing.postcode}`}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tipo de Habitación</Text>
              <Text style={styles.detailValue}>{getRoomTypeLabel(listing.room_type)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Disponible desde</Text>
              <Text style={styles.detailValue}>{formatDate(listing.available_from)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Depósito</Text>
              <Text style={styles.detailValue}>${listing.bond || 0}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cuentas Incluidas</Text>
              <Text style={styles.detailValue}>{listing.bills_included ? 'Sí' : 'No'}</Text>
            </View>
            {listing.bathroom_type && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Baño</Text>
                <Text style={styles.detailValue}>{listing.bathroom_type}</Text>
              </View>
            )}
            {listing.min_stay_weeks && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Estadía Mínima</Text>
                <Text style={styles.detailValue}>{listing.min_stay_weeks} semanas</Text>
              </View>
            )}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comodidades</Text>
          <View style={styles.amenitiesGrid}>
            {listing.parking && (
              <View style={styles.amenityItem}>
                <Car size={24} color="#4D7EA8" />
                <Text style={styles.amenityText}>Estacionamiento</Text>
              </View>
            )}
            {listing.internet && (
              <View style={styles.amenityItem}>
                <Wifi size={24} color="#4D7EA8" />
                <Text style={styles.amenityText}>Internet</Text>
              </View>
            )}
            {listing.furnished && (
              <View style={styles.amenityItem}>
                <Package size={24} color="#4D7EA8" />
                <Text style={styles.amenityText}>Amoblado</Text>
              </View>
            )}
            {listing.pets_allowed && (
              <View style={styles.amenityItem}>
                <Dog size={24} color="#4D7EA8" />
                <Text style={styles.amenityText}>Mascotas</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {listing.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>
        )}

        {/* Owner Info (only for manager) */}
        {userRole === 'manager' && listing.owner_partner_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propietario</Text>
            <View style={styles.ownerCard}>
              <Text style={styles.ownerName}>{listing.owner_partner_id.name}</Text>
              <Text style={styles.ownerContact}>{listing.owner_partner_id.email}</Text>
              <Text style={styles.ownerContact}>{listing.owner_partner_id.phone}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
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
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4D7EA8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#E5E7EB',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFF',
    width: 24,
  },
  titleSection: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#272932',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4D7EA8',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  address: {
    fontSize: 16,
    color: '#64748B',
    flex: 1,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  amenityItem: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  amenityText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#64748B',
  },
  ownerCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
    marginBottom: 8,
  },
  ownerContact: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
});
