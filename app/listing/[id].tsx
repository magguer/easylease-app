import { useState, useEffect, useRef } from 'react';
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
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { api } from '../../lib/api';
import { getUser } from '../../lib/auth';
import DetailHeader from '../../components/ui/DetailHeader';
import StatusBadge from '../../components/ui/StatusBadge';
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
  ChevronLeft,
  ChevronRight,
  Bed,
  Users,
  FileText,
} from '@tamagui/lucide-icons';

const { width } = Dimensions.get('window');

interface Listing {
  _id: string;
  title: string;
  address: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  room_type?: string;
  images: string[];
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
  tenant_id?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  active_contract?: {
    _id: string;
    tenant_id: {
      _id: string;
      name: string;
      email: string;
      phone: string;
    };
    start_date: string;
    end_date: string;
    weekly_rent: number;
    bond_amount: number;
    payment_frequency: string;
    bills_included: boolean;
    status: string;
    days_remaining: number;
    is_ending_soon: boolean;
  };
  contracts?: Array<{
    _id: string;
    tenant_id?: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      status: string;
    };
    start_date: string;
    end_date: string;
    weekly_rent: number;
    bond_amount: number;
    payment_frequency: string;
    bills_included: boolean;
    status: string;
    days_remaining: number;
    is_ending_soon: boolean;
  }>;
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
  const flatListRef = useRef<FlatList>(null);

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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  const scrollToImage = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });
    setCurrentImageIndex(index);
  };

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      const nextIndex = (currentImageIndex + 1) % listing.images.length;
      scrollToImage(nextIndex);
    }
  };

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      const prevIndex = currentImageIndex === 0 ? listing.images.length - 1 : currentImageIndex - 1;
      scrollToImage(prevIndex);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B9AA8" />
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
        {/* Image Gallery with Slider */}
        {listing.images && listing.images.length > 0 && (
          <View style={styles.imageSection}>
            <FlatList
              ref={flatListRef}
              data={listing.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              )}
            />
            
            {/* Navigation Arrows */}
            {listing.images.length > 1 && (
              <>
                <TouchableOpacity 
                  style={[styles.arrowButton, styles.arrowLeft]} 
                  onPress={prevImage}
                >
                  <ChevronLeft size={28} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.arrowButton, styles.arrowRight]} 
                  onPress={nextImage}
                >
                  <ChevronRight size={28} color="#FFF" />
                </TouchableOpacity>
              </>
            )}
            
            {/* Image Counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {listing.images.length}
              </Text>
            </View>
            
            {/* Dots Indicator */}
            {listing.images.length > 1 && (
              <View style={styles.imageIndicators}>
                {listing.images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.activeIndicator,
                    ]}
                    onPress={() => scrollToImage(index)}
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
            <StatusBadge 
              status={listing.active_contract ? listing.active_contract.status : 'available'} 
              type={listing.active_contract ? 'contract' : 'listing'} 
            />
          </View>
          
          {/* Show price and bond only from active contract */}
          {listing.active_contract && (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  ${listing.active_contract.weekly_rent}
                </Text>
                <Text style={styles.priceLabel}>/semana</Text>
              </View>
              <Text style={styles.priceSource}>Según contrato activo</Text>
              
              {listing.active_contract.bond_amount > 0 && (
                <View style={styles.bondRow}>
                  <Text style={styles.bondLabel}>Depósito:</Text>
                  <Text style={styles.bondValue}>${listing.active_contract.bond_amount}</Text>
                </View>
              )}
            </>
          )}
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
          <Text style={styles.sectionTitle}>Detalles de la Propiedad</Text>
          
          {/* Room Type */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconLabel}>
              <Bed size={20} color="#5B9AA8" />
              <Text style={styles.detailLabel}>Tipo de Habitación</Text>
            </View>
            <Text style={styles.detailValue}>{getRoomTypeLabel(listing.room_type)}</Text>
          </View>

          {/* Owner */}
          {listing.owner_partner_id && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconLabel}>
                <User size={20} color="#5B9AA8" />
                <Text style={styles.detailLabel}>Propietario</Text>
              </View>
              <Text style={styles.detailValue}>{listing.owner_partner_id.name}</Text>
            </View>
          )}

          {/* House Features */}
          {listing.house_features && listing.house_features.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconLabel}>
                <Home size={20} color="#5B9AA8" />
                <Text style={styles.detailLabel}>Características de la Casa</Text>
              </View>
              <View style={styles.featuresList}>
                {listing.house_features.map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureTagText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Preferred Tenants */}
          {listing.preferred_tenants && listing.preferred_tenants.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconLabel}>
                <Users size={20} color="#5B9AA8" />
                <Text style={styles.detailLabel}>Inquilinos Preferidos</Text>
              </View>
              <View style={styles.featuresList}>
                {listing.preferred_tenants.map((tenant, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureTagText}>{tenant}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Rules */}
          {listing.rules && listing.rules.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconLabel}>
                <FileText size={20} color="#5B9AA8" />
                <Text style={styles.detailLabel}>Reglas de la Casa</Text>
              </View>
              <View style={styles.rulesList}>
                {listing.rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={styles.ruleBullet}>•</Text>
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Status with Contract */}
          {listing.active_contract && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconLabel}>
                <Home size={20} color="#5B9AA8" />
                <Text style={styles.detailLabel}>Estado Actual</Text>
              </View>
              <Text style={styles.detailValue}>
                {listing.active_contract.tenant_id ? 'Ocupado' : 'Contrato sin Inquilino'}
              </Text>
            </View>
          )}
        </View>

        {/* Amenities - removed since house_features already shows them */}

        {/* Description */}
        {listing.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>
        )}

        {/* Contracts Section */}
        <View style={styles.section}>
          <View style={styles.tenantHeader}>
            <View>
              <Text style={styles.sectionTitle}>Contratos</Text>
              {listing.contracts && listing.contracts.length > 0 && (
                <Text style={styles.contractsCount}>
                  {listing.contracts.length} {listing.contracts.length === 1 ? 'contrato' : 'contratos'}
                </Text>
              )}
            </View>
            {(userRole === 'manager' || userRole === 'owner') && (
              <TouchableOpacity
                style={styles.addContractButton}
                onPress={() => router.push(`/contract/create?listing_id=${listing._id}`)}
              >
                <Text style={styles.addContractButtonText}>+ Nuevo</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {listing.contracts && listing.contracts.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contractsScrollContent}
              snapToInterval={width - 60}
              decelerationRate="fast"
            >
              {listing.contracts.map((contract, index) => (
                <TouchableOpacity
                  key={contract._id}
                  style={[
                    styles.contractCard,
                    contract.status === 'active' || contract.status === 'ending_soon' ? styles.activeContractCard : null
                  ]}
                  onPress={() => router.push(`/contract/${contract._id}`)}
                  activeOpacity={0.7}
                >
                  {/* Contract Header */}
                  <View style={styles.contractCardHeader}>
                    <View style={styles.contractHeaderLeft}>
                      {contract.tenant_id ? (
                        <>
                          <View style={styles.contractTenantAvatar}>
                            <User size={24} color="#FFF" />
                          </View>
                          <View style={styles.contractHeaderInfo}>
                            <Text style={styles.contractTenantName} numberOfLines={1}>
                              {contract.tenant_id.name}
                            </Text>
                            <Text style={styles.contractDates} numberOfLines={1}>
                              {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                            </Text>
                          </View>
                        </>
                      ) : (
                        <View style={styles.contractHeaderInfo}>
                          <Text style={styles.contractTenantName} numberOfLines={1}>Sin inquilino</Text>
                          <Text style={styles.contractDates} numberOfLines={1}>
                            {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <StatusBadge status={contract.status} type="contract" />
                  </View>

                  {/* Contract Details */}
                  <View style={styles.contractDetailsGrid}>
                    <View style={styles.contractDetailBox}>
                      <Text style={styles.contractDetailLabel}>Renta Semanal</Text>
                      <Text style={styles.contractDetailValue}>${contract.weekly_rent}</Text>
                    </View>
                    <View style={styles.contractDetailBox}>
                      <Text style={styles.contractDetailLabel}>Depósito</Text>
                      <Text style={styles.contractDetailValue}>${contract.bond_amount}</Text>
                    </View>
                    <View style={styles.contractDetailBox}>
                      <Text style={styles.contractDetailLabel}>Cuentas</Text>
                      <View style={styles.contractDetailValueRow}>
                        {contract.bills_included ? (
                          <Check size={16} color="#22C55E" />
                        ) : (
                          <X size={16} color="#EF4444" />
                        )}
                        <Text style={styles.contractDetailValue}>
                          {contract.bills_included ? 'Incluidas' : 'No'}
                        </Text>
                      </View>
                    </View>
                    {(contract.status === 'active' || contract.status === 'ending_soon') && (
                      <View style={styles.contractDetailBox}>
                        <Text style={styles.contractDetailLabel}>Días Restantes</Text>
                        <Text style={[
                          styles.contractDetailValue,
                          contract.days_remaining < 30 && styles.warningText
                        ]}>
                          {contract.days_remaining}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Contact Info - Only if tenant is assigned */}
                  {contract.tenant_id && (
                    <>
                      <View style={styles.contractDivider} />
                      <View style={styles.contractContactRow}>
                        <View style={styles.contractContactItem}>
                          <Mail size={14} color="#64748B" />
                          <Text style={styles.contractContactText} numberOfLines={1}>
                            {contract.tenant_id.email}
                          </Text>
                        </View>
                        {contract.tenant_id.phone && (
                          <View style={styles.contractContactItem}>
                            <Phone size={14} color="#64748B" />
                            <Text style={styles.contractContactText} numberOfLines={1}>
                              {contract.tenant_id.phone}
                            </Text>
                          </View>
                        )}
                      </View>
                    </>
                  )}
                  
                  {/* View Details Footer */}
                  <View style={styles.contractFooter}>
                    <Text style={styles.contractFooterText}>Toca para ver detalles completos</Text>
                    <ChevronRight size={16} color="#5B9AA8" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noContractsContainer}>
              <FileText size={48} color="#CBD5E1" />
              <Text style={styles.noContractsText}>No hay contratos registrados</Text>
              <Text style={styles.noContractsSubtext}>
                Crea un nuevo contrato para comenzar
              </Text>
            </View>
          )}
        </View>

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
    backgroundColor: '#5B9AA8',
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
    backgroundColor: '#000',
  },
  mainImage: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#1F2937',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  arrowLeft: {
    left: 16,
  },
  arrowRight: {
    right: 16,
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#5B9AA8',
  },
  priceLabel: {
    fontSize: 18,
    color: '#64748B',
    marginLeft: 4,
  },
  priceSource: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  bondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bondLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  bondValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
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
  highlightCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#272932',
    textAlign: 'center',
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#272932',
    textAlign: 'right',
    maxWidth: '50%',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  featureTag: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureTagText: {
    fontSize: 12,
    color: '#5B9AA8',
    fontWeight: '600',
  },
  rulesList: {
    flex: 1,
    gap: 6,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  ruleBullet: {
    fontSize: 16,
    color: '#5B9AA8',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  ruleText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    lineHeight: 20,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    alignItems: 'center',
    width: (width - 64) / 4,
  },
  amenityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#64748B',
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B9AA8',
  },
  tenantCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tenantCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tenantAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4D7EA8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 6,
  },
  tenantStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tenantStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tenantDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  tenantContactRow: {
    gap: 12,
  },
  tenantContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tenantContactText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  tenantDetailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  tenantDetailItem: {
    flex: 1,
  },
  tenantDetailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  tenantDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#272932',
  },
  warningText: {
    color: '#F97316',
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
  addContractButton: {
    backgroundColor: '#5B9AA8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addContractButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contractsCount: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  contractsScrollContent: {
    paddingRight: 20,
    gap: 16,
  },
  contractsList: {
    gap: 16,
  },
  contractCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    width: width - 60,
    marginRight: 0,
  },
  activeContractCard: {
    borderColor: '#5B9AA8',
    borderWidth: 2,
    backgroundColor: '#F0F9FF',
  },
  contractCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  contractHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  contractTenantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B9AA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractHeaderInfo: {
    flex: 1,
  },
  contractTenantName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 4,
  },
  contractDates: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  contractDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  contractDetailBox: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contractDetailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contractDetailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#272932',
  },
  contractDetailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contractDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  contractContactRow: {
    gap: 10,
  },
  contractContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  contractContactText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  contractFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  contractFooterText: {
    fontSize: 13,
    color: '#5B9AA8',
    fontWeight: '600',
  },
  noContractsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noContractsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
  },
  noContractsSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
});
