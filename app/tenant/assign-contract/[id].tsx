import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import DetailHeader from '@/components/ui/DetailHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import {
  Home,
  MapPin,
  DollarSign,
  Calendar,
  Plus,
  CheckCircle,
} from '@tamagui/lucide-icons';

interface Contract {
  _id: string;
  listing_id: {
    _id: string;
    title: string;
    address: string;
    suburb: string;
    images: string[];
  };
  weekly_rent: number;
  bond_amount: number;
  payment_frequency: string;
  bills_included: boolean;
  start_date: string;
  end_date: string;
  status: string;
}

interface Tenant {
  _id: string;
  name: string;
  email: string;
}

export default function AssignContractScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tenant info
      const tenantResponse = await api.tenants.getById(id);
      setTenant(tenantResponse.data);

      // Load available contracts
      const contractsResponse = await api.contracts.getAll({ status: 'available' });
      setContracts(contractsResponse.data);
    } catch (error: any) {
      console.error('Error loading data:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || 'Error al cargar los datos'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssignContract = async (contractId: string) => {
    Alert.alert(
      'Asignar Contrato',
      `¿Estás seguro de asignar este contrato a ${tenant?.name}?`,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              // Update contract with tenant and change status to active
              await api.contracts.update(contractId, {
                tenant_id: id,
                status: 'active',
              });
              
              Alert.alert(
                t('common.success'),
                'Contrato asignado exitosamente',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error assigning contract:', error);
              Alert.alert(
                t('common.error'),
                error.response?.data?.error || 'Error al asignar el contrato'
              );
            }
          },
        },
      ]
    );
  };

  const handleCreateNewContract = () => {
    router.push({
      pathname: '/contract/create',
      params: { tenant_id: id },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'Semanal';
      case 'fortnightly':
        return 'Quincenal';
      case 'monthly':
        return 'Mensual';
      default:
        return frequency;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader title={`Asignar contrato a ${tenant?.name}`} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Contratos Disponibles</Text>
          <Text style={styles.headerSubtitle}>
            Selecciona un contrato disponible o crea uno nuevo
          </Text>
        </View>

        {/* Create New Contract Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNewContract}
        >
          <View style={styles.createButtonContent}>
            <View style={styles.createIconContainer}>
              <Plus size={24} color="#FFFFFF" />
            </View>
            <View style={styles.createButtonText}>
              <Text style={styles.createButtonTitle}>Crear Nuevo Contrato</Text>
              <Text style={styles.createButtonSubtitle}>
                Configurar un contrato personalizado
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Available Contracts List */}
        {contracts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon={Home}
              title="No hay contratos disponibles"
              subtitle="Aún no hay contratos disponibles para asignar. Crea un nuevo contrato para este inquilino."
            />
          </View>
        ) : (
          <View style={styles.contractsList}>
            <Text style={styles.listTitle}>
              {contracts.length} {contracts.length === 1 ? 'contrato disponible' : 'contratos disponibles'}
            </Text>
            
            {contracts.map((contract) => (
              <View key={contract._id} style={styles.contractCard}>
                {/* Property Info */}
                <View style={styles.contractHeader}>
                  <Home size={20} color="#4D7EA8" />
                  <View style={styles.contractHeaderText}>
                    <Text style={styles.contractTitle}>
                      {contract.listing_id.title}
                    </Text>
                    <View style={styles.addressRow}>
                      <MapPin size={14} color="#828489" />
                      <Text style={styles.contractAddress}>
                        {contract.listing_id.address}, {contract.listing_id.suburb}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Contract Details */}
                <View style={styles.contractDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <DollarSign size={16} color="#7BA89E" />
                      <Text style={styles.detailLabel}>Renta</Text>
                    </View>
                    <Text style={styles.detailValue}>${contract.weekly_rent}/sem</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <DollarSign size={16} color="#828489" />
                      <Text style={styles.detailLabel}>Depósito</Text>
                    </View>
                    <Text style={styles.detailValue}>${contract.bond_amount}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Calendar size={16} color="#4D7EA8" />
                      <Text style={styles.detailLabel}>Período</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <CheckCircle size={16} color="#828489" />
                      <Text style={styles.detailLabel}>Pago</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {getPaymentFrequencyLabel(contract.payment_frequency)}
                    </Text>
                  </View>

                  {contract.bills_included && (
                    <View style={styles.billsIncludedBadge}>
                      <CheckCircle size={14} color="#7BA89E" />
                      <Text style={styles.billsIncludedText}>Servicios incluidos</Text>
                    </View>
                  )}
                </View>

                {/* Assign Button */}
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => handleAssignContract(contract._id)}
                >
                  <Text style={styles.assignButtonText}>Asignar este contrato</Text>
                </TouchableOpacity>
              </View>
            ))}
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
  content: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#828489',
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#4D7EA8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    flex: 1,
  },
  createButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  createButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    marginTop: 40,
  },
  contractsList: {
    gap: 16,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#828489',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contractCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  contractHeaderText: {
    flex: 1,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contractAddress: {
    fontSize: 13,
    color: '#828489',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  contractDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#828489',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#272932',
  },
  billsIncludedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  billsIncludedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7BA89E',
  },
  assignButton: {
    backgroundColor: '#7BA89E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
