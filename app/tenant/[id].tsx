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
  Home,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  MapPin,
} from '@tamagui/lucide-icons';

interface Tenant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  listing_id: {
    _id: string;
    title: string;
    address: string;
    suburb: string;
  };
  lease_start: string;
  lease_end: string;
  lease_duration_weeks: number;
  days_remaining: number;
  weekly_rent: number;
  bond_paid: number;
  payment_method: string;
  status: string;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

export default function TenantDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadTenant();
    loadUserRole();
  }, [id]);

  const loadUserRole = async () => {
    const user = await getUser();
    setUserRole(user?.role || null);
  };

  const loadTenant = async () => {
    try {
      setLoading(true);
      const response = await api.tenants.getById(id);
      setTenant(response.data);
    } catch (error: any) {
      console.error('Error loading tenant:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || 'Failed to load tenant details'
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleEdit = () => {
    // TODO: Navigate to edit screen
    Alert.alert('Edit', 'Edit functionality coming soon');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#7BA89E';
      case 'ending_soon':
        return '#E89E8C';
      case 'ended':
        return '#828489';
      default:
        return '#828489';
    }
  };

  const getStatusText = (status: string) => {
    return t(`tenants.status.${status}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  if (!tenant) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#E89E8C" />
        <Text style={styles.errorText}>Tenant not found</Text>
      </View>
    );
  }

  const canEdit = userRole === 'manager' || userRole === 'owner';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title={t('tenants.detail.title')}
        showEdit={canEdit}
        onEdit={handleEdit}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tenant Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.tenantName}>{tenant.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tenant.status) }]}>
                <Text style={styles.statusText}>{getStatusText(tenant.status)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Contact Info */}
          <View style={styles.infoSection}>
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => handleEmail(tenant.email)}
            >
              <Mail size={20} color="#4D7EA8" />
              <Text style={styles.infoText}>{tenant.email}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => handleCall(tenant.phone)}
            >
              <Phone size={20} color="#4D7EA8" />
              <Text style={styles.infoText}>{tenant.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Property Info */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Home size={24} color="#4D7EA8" />
            <Text style={styles.sectionTitle}>Property</Text>
          </View>

          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>{tenant.listing_id.title}</Text>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#828489" />
              <Text style={styles.propertyAddress}>
                {tenant.listing_id.address}, {tenant.listing_id.suburb}
              </Text>
            </View>
          </View>
        </View>

        {/* Lease Details */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color="#4D7EA8" />
            <Text style={styles.sectionTitle}>Lease Information</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{formatDate(tenant.lease_start)}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>End Date</Text>
              <Text style={styles.detailValue}>{formatDate(tenant.lease_end)}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{tenant.lease_duration_weeks} weeks</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Days Remaining</Text>
              <Text style={[
                styles.detailValue,
                tenant.days_remaining < 30 && styles.warningText
              ]}>
                {tenant.days_remaining} days
              </Text>
            </View>
          </View>
        </View>

        {/* Financial Details */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <DollarSign size={24} color="#7BA89E" />
            <Text style={styles.sectionTitle}>Financial Details</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weekly Rent</Text>
              <Text style={styles.detailValue}>${tenant.weekly_rent}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bond Paid</Text>
              <Text style={styles.detailValue}>${tenant.bond_paid}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>
                {tenant.payment_method.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        {tenant.emergency_contact && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <AlertCircle size={24} color="#E89E8C" />
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
            </View>

            <View style={styles.emergencyContact}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{tenant.emergency_contact.name}</Text>
              </View>

              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleCall(tenant.emergency_contact.phone)}
              >
                <Phone size={16} color="#4D7EA8" />
                <Text style={styles.infoText}>{tenant.emergency_contact.phone}</Text>
              </TouchableOpacity>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Relationship</Text>
                <Text style={styles.detailValue}>{tenant.emergency_contact.relationship}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {tenant.notes && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FileText size={24} color="#828489" />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{tenant.notes}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#272932',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
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
  tenantName: {
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
  propertyInfo: {
    gap: 8,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#272932',
  },
  propertyAddress: {
    fontSize: 14,
    color: '#828489',
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
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
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
  },
  warningText: {
    color: '#E89E8C',
  },
  emergencyContact: {
    gap: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#272932',
    lineHeight: 20,
  },
});
