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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import DetailHeader from '@/components/ui/DetailHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Home,
  FileText,
  Check,
  X,
  ChevronRight,
  AlertCircle,
} from '@tamagui/lucide-icons';

interface Contract {
  _id: string;
  tenant_id?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  listing_id: {
    _id: string;
    title: string;
    address: string;
    room_type: string;
    images?: string[];
  };
  owner_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  start_date: string;
  end_date: string;
  signed_date?: string;
  weekly_rent: number;
  bond_amount: number;
  bond_paid: boolean;
  payment_frequency: string;
  bills_included: boolean;
  notice_period_days: number;
  status: string;
  termination_reason?: string;
  termination_date?: string;
  terms: {
    pets_allowed: boolean;
    smoking_allowed: boolean;
    parking_spaces: number;
    special_conditions: string;
  };
  days_remaining?: number;
  is_ending_soon?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    loadContract();
    loadUserRole();
  }, [id]);

  const loadUserRole = async () => {
    const user = await getUser();
    if (user) {
      setUserRole(user.role);
    }
  };

  const loadContract = async () => {
    try {
      const response = await api.contracts.getById(id as string);
      setContract(response.data);
    } catch (error: any) {
      console.error('Error loading contract:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || 'Error al cargar el contrato'
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPaymentFrequencyLabel = (frequency: string) => {
    const map: Record<string, string> = {
      weekly: 'Semanal',
      fortnightly: 'Quincenal',
      monthly: 'Mensual',
    };
    return map[frequency] || frequency;
  };

  const handleRestartContract = async () => {
    Alert.alert(
      'Reiniciar Contrato',
      '¿Estás seguro de que deseas reactivar este contrato? Esto cambiará el estado a "activo" y eliminará la información de terminación.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.contracts.restart(id as string);
              Alert.alert('Éxito', 'Contrato reiniciado exitosamente');
              loadContract(); // Reload contract data
            } catch (error: any) {
              console.error('Error restarting contract:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Error al reiniciar el contrato'
              );
            }
          },
        },
      ]
    );
  };

  const handleDuplicateContract = async () => {
    Alert.alert(
      'Duplicar Contrato',
      'Se creará un nuevo contrato DRAFT basado en este contrato, manteniendo todos los términos y condiciones. Podrás modificarlo antes de activarlo.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Duplicar',
          onPress: async () => {
            try {
              // Calculate new dates: start today, end 1 year from now
              const startDate = new Date();
              const endDate = new Date();
              endDate.setFullYear(endDate.getFullYear() + 1);

              const response = await api.contracts.duplicate(id as string, {
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
              });
              
              Alert.alert(
                'Éxito',
                'Contrato duplicado exitosamente',
                [
                  {
                    text: 'Ver Nuevo Contrato',
                    onPress: () => router.push(`/contract/${response.data._id}`),
                  },
                  {
                    text: 'Ir a Propiedad',
                    onPress: () => router.push(`/listing/${contract?.listing_id._id}`),
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error duplicating contract:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Error al duplicar el contrato'
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <DetailHeader title="Detalle del Contrato" showEdit={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B9AA8" />
        </View>
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <X size={64} color="#EF4444" />
        <Text style={styles.errorText}>Contrato no encontrado</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title="Detalle del Contrato"
        showEdit={userRole === 'manager' || userRole === 'owner'}
        onEdit={() => router.push(`/contract/edit/${id}`)}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status and Dates */}
        <View style={styles.headerSection}>
          <View style={styles.statusRow}>
            <StatusBadge status={contract.status} type="contract" />
            {contract.is_ending_soon && (
              <View style={styles.warningBadge}>
                <AlertCircle size={16} color="#F97316" />
                <Text style={styles.warningText}>Próximo a vencer</Text>
              </View>
            )}
          </View>
          
          <View style={styles.dateRange}>
            <Calendar size={20} color="#5B9AA8" />
            <Text style={styles.dateRangeText}>
              {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
            </Text>
          </View>

          {contract.days_remaining !== undefined && contract.status === 'active' && (
            <Text style={styles.daysRemaining}>
              {contract.days_remaining} días restantes
            </Text>
          )}
        </View>

        {/* Property Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Home size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Propiedad</Text>
          </View>
          <TouchableOpacity
            style={styles.propertyCard}
            onPress={() => router.push(`/listing/${contract.listing_id._id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle}>{contract.listing_id.title}</Text>
              <Text style={styles.propertyAddress}>{contract.listing_id.address}</Text>
              {contract.listing_id.room_type && (
                <Text style={styles.propertyDetail}>
                  {contract.listing_id.room_type === 'master' && 'Habitación Principal'}
                  {contract.listing_id.room_type === 'double' && 'Habitación Doble'}
                  {contract.listing_id.room_type === 'single' && 'Habitación Individual'}
                </Text>
              )}
            </View>
            <ChevronRight size={24} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Tenant Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Inquilino</Text>
          </View>
          {contract.tenant_id ? (
            <TouchableOpacity
              style={styles.tenantCard}
              onPress={() => router.push(`/tenant/${contract.tenant_id?._id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.tenantAvatar}>
                <User size={28} color="#FFF" />
              </View>
              <View style={styles.tenantInfo}>
                <Text style={styles.tenantName}>{contract.tenant_id.name}</Text>
                <View style={styles.contactRow}>
                  <Mail size={14} color="#64748B" />
                  <Text style={styles.contactText}>{contract.tenant_id.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Phone size={14} color="#64748B" />
                  <Text style={styles.contactText}>{contract.tenant_id.phone}</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#94A3B8" />
            </TouchableOpacity>
          ) : (
            <View style={styles.noTenantCard}>
              <User size={32} color="#CBD5E1" />
              <Text style={styles.noTenantText}>Sin inquilino asignado</Text>
              <Text style={styles.noTenantSubtext}>
                Este contrato aún no tiene un inquilino
              </Text>
            </View>
          )}
        </View>

        {/* Financial Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Información Financiera</Text>
          </View>

          <View style={styles.financialGrid}>
            <View style={styles.financialBox}>
              <Text style={styles.financialLabel}>Renta</Text>
              <Text style={styles.financialValue}>${contract.weekly_rent}</Text>
              <Text style={styles.financialFrequency}>
                {getPaymentFrequencyLabel(contract.payment_frequency)}
              </Text>
            </View>
            <View style={styles.financialBox}>
              <Text style={styles.financialLabel}>Depósito</Text>
              <Text style={styles.financialValue}>${contract.bond_amount}</Text>
              <View style={styles.bondPaidRow}>
                {contract.bond_paid ? (
                  <Check size={14} color="#22C55E" />
                ) : (
                  <X size={14} color="#EF4444" />
                )}
                <Text style={styles.bondPaidText}>
                  {contract.bond_paid ? 'Pagado' : 'Pendiente'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cuentas Incluidas</Text>
            <View style={styles.detailValueRow}>
              {contract.bills_included ? (
                <Check size={18} color="#22C55E" />
              ) : (
                <X size={18} color="#EF4444" />
              )}
              <Text style={styles.detailValue}>
                {contract.bills_included ? 'Sí' : 'No'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Período de Aviso</Text>
            <Text style={styles.detailValue}>{contract.notice_period_days} días</Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
          </View>

          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Mascotas Permitidas</Text>
            <View style={styles.termValue}>
              {contract.terms.pets_allowed ? (
                <Check size={18} color="#22C55E" />
              ) : (
                <X size={18} color="#EF4444" />
              )}
            </View>
          </View>

          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Fumar Permitido</Text>
            <View style={styles.termValue}>
              {contract.terms.smoking_allowed ? (
                <Check size={18} color="#22C55E" />
              ) : (
                <X size={18} color="#EF4444" />
              )}
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Espacios de Estacionamiento</Text>
            <Text style={styles.detailValue}>{contract.terms.parking_spaces}</Text>
          </View>

          {contract.terms.special_conditions && (
            <View style={styles.specialConditions}>
              <Text style={styles.specialConditionsLabel}>Condiciones Especiales</Text>
              <Text style={styles.specialConditionsText}>
                {contract.terms.special_conditions}
              </Text>
            </View>
          )}
        </View>

        {/* Termination Info */}
        {contract.status === 'terminated' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
                Información de Terminación
              </Text>
            </View>

            {contract.termination_date && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha de Terminación</Text>
                <Text style={styles.detailValue}>
                  {formatDate(contract.termination_date)}
                </Text>
              </View>
            )}

            {contract.termination_reason && (
              <View style={styles.terminationReason}>
                <Text style={styles.terminationReasonLabel}>Motivo</Text>
                <Text style={styles.terminationReasonText}>
                  {contract.termination_reason}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            {(userRole === 'manager' || userRole === 'owner') && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.duplicateButton}
                  onPress={handleDuplicateContract}
                  activeOpacity={0.7}
                >
                  <FileText size={18} color="#FFF" />
                  <Text style={styles.duplicateButtonText}>Duplicar Contrato</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.restartButton}
                  onPress={handleRestartContract}
                  activeOpacity={0.7}
                >
                  <Text style={styles.restartButtonText}>Reiniciar Contrato</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Ended Contract Actions */}
        {contract.status === 'ended' && (userRole === 'manager' || userRole === 'owner') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#5B9AA8" />
              <Text style={styles.sectionTitle}>Acciones</Text>
            </View>
            
            <TouchableOpacity
              style={styles.duplicateButtonFull}
              onPress={handleDuplicateContract}
              activeOpacity={0.7}
            >
              <FileText size={20} color="#FFF" />
              <View style={styles.duplicateButtonContent}>
                <Text style={styles.duplicateButtonTitle}>Duplicar Contrato</Text>
                <Text style={styles.duplicateButtonSubtitle}>
                  Crear nuevo contrato draft con los mismos términos
                </Text>
              </View>
              <ChevronRight size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Owner Info (only for manager) */}
        {userRole === 'manager' && contract.owner_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propietario</Text>
            <View style={styles.ownerCard}>
              <Text style={styles.ownerName}>{contract.owner_id.name}</Text>
              <Text style={styles.ownerContact}>{contract.owner_id.email}</Text>
              <Text style={styles.ownerContact}>{contract.owner_id.phone}</Text>
            </View>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Creado</Text>
            <Text style={styles.metadataValue}>{formatDate(contract.createdAt)}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Última actualización</Text>
            <Text style={styles.metadataValue}>{formatDate(contract.updatedAt)}</Text>
          </View>
        </View>

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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#5B9AA8',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F97316',
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateRangeText: {
    fontSize: 16,
    color: '#272932',
    fontWeight: '600',
  },
  daysRemaining: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#272932',
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  propertyDetail: {
    fontSize: 13,
    color: '#94A3B8',
  },
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  tenantAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5B9AA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 13,
    color: '#64748B',
  },
  noTenantCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noTenantText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
  },
  noTenantSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  financialGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  financialBox: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  financialValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 4,
  },
  financialFrequency: {
    fontSize: 12,
    color: '#64748B',
  },
  bondPaidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bondPaidText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#272932',
  },
  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  termLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  termValue: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialConditions: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  specialConditionsLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '600',
  },
  specialConditionsText: {
    fontSize: 14,
    color: '#272932',
    lineHeight: 20,
  },
  terminationReason: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  terminationReasonLabel: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 8,
    fontWeight: '600',
  },
  terminationReasonText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    marginTop: 16,
    gap: 12,
  },
  duplicateButton: {
    backgroundColor: '#5B9AA8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  duplicateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  duplicateButtonFull: {
    backgroundColor: '#5B9AA8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  duplicateButtonContent: {
    flex: 1,
  },
  duplicateButtonTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  duplicateButtonSubtitle: {
    color: '#E0F2F1',
    fontSize: 13,
    fontWeight: '500',
  },
  restartButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ownerCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metadataLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  metadataValue: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
