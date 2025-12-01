import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import DetailHeader from '@/components/ui/DetailHeader';
import DatePickerModal from '@/components/ui/DatePickerModal';
import { Calendar, DollarSign, Users, Home } from '@tamagui/lucide-icons';

interface Contract {
  _id: string;
  tenant_id?: {
    _id: string;
    name: string;
    email: string;
  };
  listing_id: {
    _id: string;
    title: string;
    address: string;
  };
  start_date: string;
  end_date: string;
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
}

interface Tenant {
  _id: string;
  name: string;
  email: string;
}

export default function EditContractScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Form data
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [weeklyRent, setWeeklyRent] = useState('');
  const [bondAmount, setBondAmount] = useState('');
  const [bondPaid, setBondPaid] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('weekly');
  const [billsIncluded, setBillsIncluded] = useState(true);
  const [noticePeriodDays, setNoticePeriodDays] = useState('14');
  const [status, setStatus] = useState<'draft' | 'active' | 'ending_soon' | 'ended' | 'terminated'>('draft');
  const [terminationReason, setTerminationReason] = useState('');
  const [terminationDate, setTerminationDate] = useState<Date | null>(null);
  
  // Terms
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [parkingSpaces, setParkingSpaces] = useState('0');
  const [specialConditions, setSpecialConditions] = useState('');

  // Date pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTerminationDatePicker, setShowTerminationDatePicker] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [contractRes, tenantsRes] = await Promise.all([
        api.contracts.getById(id),
        api.tenants.getAll(),
      ]);
      
      const contractData = contractRes.data;
      setContract(contractData);

      // Set form values
      setSelectedTenantId(contractData.tenant_id?._id || '');
      setStartDate(new Date(contractData.start_date));
      setEndDate(new Date(contractData.end_date));
      setWeeklyRent(contractData.weekly_rent.toString());
      setBondAmount(contractData.bond_amount.toString());
      setBondPaid(contractData.bond_paid);
      setPaymentFrequency(contractData.payment_frequency as any);
      setBillsIncluded(contractData.bills_included ?? true);
      setNoticePeriodDays(contractData.notice_period_days?.toString() || '14');
      setStatus(contractData.status as any);
      setTerminationReason(contractData.termination_reason || '');
      if (contractData.termination_date) {
        setTerminationDate(new Date(contractData.termination_date));
      }
      
      // Terms
      setPetsAllowed(contractData.terms?.pets_allowed || false);
      setSmokingAllowed(contractData.terms?.smoking_allowed || false);
      setParkingSpaces(contractData.terms?.parking_spaces?.toString() || '0');
      setSpecialConditions(contractData.terms?.special_conditions || '');

      // Load available tenants
      const availableTenants = (tenantsRes.data || []).filter(
        (tenant: any) => !tenant.current_contract_id || tenant._id === contractData.tenant_id?._id
      );
      setTenants(availableTenants);
    } catch (error) {
      console.error('Error loading contract:', error);
      Alert.alert(t('common.error'), 'Error al cargar el contrato');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validations
    if (!weeklyRent || parseFloat(weeklyRent) <= 0) {
      Alert.alert(t('common.error'), 'Ingresa una renta válida');
      return;
    }

    if (!bondAmount || parseFloat(bondAmount) <= 0) {
      Alert.alert(t('common.error'), 'Ingresa un depósito válido');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert(t('common.error'), 'La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    if (status === 'terminated' && !terminationReason) {
      Alert.alert(t('common.error'), 'Ingresa el motivo de terminación');
      return;
    }

    try {
      setSaving(true);

      const contractData: any = {
        tenant_id: selectedTenantId || null,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        weekly_rent: parseFloat(weeklyRent),
        bond_amount: parseFloat(bondAmount),
        bond_paid: bondPaid,
        payment_frequency: paymentFrequency,
        bills_included: billsIncluded,
        notice_period_days: parseInt(noticePeriodDays) || 14,
        status,
        terms: {
          pets_allowed: petsAllowed,
          smoking_allowed: smokingAllowed,
          parking_spaces: parseInt(parkingSpaces) || 0,
          special_conditions: specialConditions,
        },
      };

      if (status === 'terminated') {
        contractData.termination_reason = terminationReason;
        contractData.termination_date = terminationDate?.toISOString() || new Date().toISOString();
      }

      await api.contracts.update(id, contractData);

      Alert.alert(
        'Éxito',
        'Contrato actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating contract:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || 'Error al actualizar el contrato'
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <DetailHeader title="Editar Contrato" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B9AA8" />
        </View>
      </View>
    );
  }

  if (!contract) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader title="Editar Contrato" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Property Info (Read-only) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Home size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Propiedad</Text>
          </View>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyLabel}>Título</Text>
            <Text style={styles.readOnlyValue}>{contract.listing_id.title}</Text>
          </View>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyLabel}>Dirección</Text>
            <Text style={styles.readOnlyValue}>{contract.listing_id.address}</Text>
          </View>
        </View>

        {/* Tenant Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Inquilino</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Seleccionar Inquilino (Opcional)</Text>
            {tenants.map((tenant) => (
              <TouchableOpacity
                key={tenant._id}
                style={[
                  styles.tenantOption,
                  selectedTenantId === tenant._id && styles.tenantOptionSelected,
                ]}
                onPress={() => setSelectedTenantId(tenant._id)}
              >
                <View style={styles.radioCircle}>
                  {selectedTenantId === tenant._id && <View style={styles.radioCircleSelected} />}
                </View>
                <View style={styles.tenantInfo}>
                  <Text style={styles.tenantName}>{tenant.name}</Text>
                  <Text style={styles.tenantEmail}>{tenant.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {tenants.length === 0 && (
              <Text style={styles.noTenantsText}>No hay inquilinos disponibles</Text>
            )}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Fechas del Contrato</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Inicio</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Calendar size={18} color="#64748B" />
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Fin</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Calendar size={18} color="#64748B" />
              <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Información Financiera</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Renta Semanal ($)</Text>
            <TextInput
              style={styles.input}
              value={weeklyRent}
              onChangeText={setWeeklyRent}
              keyboardType="numeric"
              placeholder="275"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Depósito ($)</Text>
            <TextInput
              style={styles.input}
              value={bondAmount}
              onChangeText={setBondAmount}
              keyboardType="numeric"
              placeholder="1100"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Depósito Pagado</Text>
            <Switch
              value={bondPaid}
              onValueChange={setBondPaid}
              trackColor={{ false: '#E5E7EB', true: '#86D3C1' }}
              thumbColor={bondPaid ? '#5B9AA8' : '#F1F5F9'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frecuencia de Pago</Text>
            <View style={styles.frequencyButtons}>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  paymentFrequency === 'weekly' && styles.frequencyButtonActive,
                ]}
                onPress={() => setPaymentFrequency('weekly')}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    paymentFrequency === 'weekly' && styles.frequencyButtonTextActive,
                  ]}
                >
                  Semanal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  paymentFrequency === 'fortnightly' && styles.frequencyButtonActive,
                ]}
                onPress={() => setPaymentFrequency('fortnightly')}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    paymentFrequency === 'fortnightly' && styles.frequencyButtonTextActive,
                  ]}
                >
                  Quincenal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  paymentFrequency === 'monthly' && styles.frequencyButtonActive,
                ]}
                onPress={() => setPaymentFrequency('monthly')}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    paymentFrequency === 'monthly' && styles.frequencyButtonTextActive,
                  ]}
                >
                  Mensual
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Período de Aviso (días)</Text>
            <TextInput
              style={styles.input}
              value={noticePeriodDays}
              onChangeText={setNoticePeriodDays}
              keyboardType="numeric"
              placeholder="14"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Cuentas Incluidas</Text>
            <Switch
              value={billsIncluded}
              onValueChange={setBillsIncluded}
              trackColor={{ false: '#E5E7EB', true: '#86D3C1' }}
              thumbColor={billsIncluded ? '#5B9AA8' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Términos del Contrato</Text>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Mascotas Permitidas</Text>
            <Switch
              value={petsAllowed}
              onValueChange={setPetsAllowed}
              trackColor={{ false: '#E5E7EB', true: '#86D3C1' }}
              thumbColor={petsAllowed ? '#5B9AA8' : '#F1F5F9'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Fumar Permitido</Text>
            <Switch
              value={smokingAllowed}
              onValueChange={setSmokingAllowed}
              trackColor={{ false: '#E5E7EB', true: '#86D3C1' }}
              thumbColor={smokingAllowed ? '#5B9AA8' : '#F1F5F9'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Espacios de Estacionamiento</Text>
            <TextInput
              style={styles.input}
              value={parkingSpaces}
              onChangeText={setParkingSpaces}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condiciones Especiales</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={specialConditions}
              onChangeText={setSpecialConditions}
              multiline
              numberOfLines={4}
              placeholder="Ingresa cualquier condición especial del contrato"
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del Contrato</Text>
          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'draft' && styles.statusButtonActive,
              ]}
              onPress={() => setStatus('draft')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === 'draft' && styles.statusButtonTextActive,
                ]}
              >
                Borrador
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'active' && styles.statusButtonActive,
              ]}
              onPress={() => setStatus('active')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === 'active' && styles.statusButtonTextActive,
                ]}
              >
                Activo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'terminated' && styles.statusButtonActive,
              ]}
              onPress={() => setStatus('terminated')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === 'terminated' && styles.statusButtonTextActive,
                ]}
              >
                Terminado
              </Text>
            </TouchableOpacity>
          </View>

          {/* Termination fields */}
          {status === 'terminated' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Motivo de Terminación</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={terminationReason}
                  onChangeText={setTerminationReason}
                  multiline
                  numberOfLines={3}
                  placeholder="Explica el motivo de la terminación del contrato"
                  placeholderTextColor="#94A3B8"
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha de Terminación</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowTerminationDatePicker(true)}
                >
                  <Calendar size={18} color="#64748B" />
                  <Text style={styles.dateButtonText}>
                    {terminationDate ? formatDate(terminationDate) : 'Seleccionar fecha'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      <DatePickerModal
        visible={showStartDatePicker}
        date={startDate}
        onDateChange={setStartDate}
        onClose={() => setShowStartDatePicker(false)}
        title="Fecha de Inicio"
      />
      <DatePickerModal
        visible={showEndDatePicker}
        date={endDate}
        onDateChange={setEndDate}
        onClose={() => setShowEndDatePicker(false)}
        title="Fecha de Fin"
      />
      <DatePickerModal
        visible={showTerminationDatePicker}
        date={terminationDate || new Date()}
        onDateChange={setTerminationDate}
        onClose={() => setShowTerminationDatePicker(false)}
        title="Fecha de Terminación"
      />
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
  readOnlyField: {
    marginBottom: 12,
  },
  readOnlyLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  readOnlyValue: {
    fontSize: 15,
    color: '#272932',
    fontWeight: '500',
  },
  pickerContainer: {
    gap: 12,
  },
  pickerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#272932',
    marginBottom: 4,
  },
  tenantOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  tenantOptionSelected: {
    borderColor: '#5B9AA8',
    backgroundColor: '#F0F9FF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5B9AA8',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#272932',
    marginBottom: 2,
  },
  tenantEmail: {
    fontSize: 13,
    color: '#64748B',
  },
  noTenantsText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#272932',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#272932',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 15,
    color: '#272932',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#5B9AA8',
    borderColor: '#5B9AA8',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  frequencyButtonTextActive: {
    color: '#FFF',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#5B9AA8',
    borderColor: '#5B9AA8',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  statusButtonTextActive: {
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#5B9AA8',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
