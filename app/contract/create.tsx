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

interface Listing {
  _id: string;
  title: string;
  address: string;
  price_per_week?: number; // Opcional - ahora viene del contrato
}

interface Tenant {
  _id: string;
  name: string;
  email: string;
}

export default function CreateContractScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { listing_id, tenant_id } = useLocalSearchParams<{ listing_id?: string; tenant_id?: string }>();

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form data
  const [selectedListingId, setSelectedListingId] = useState(listing_id || '');
  const [selectedTenantId, setSelectedTenantId] = useState(tenant_id || '');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });
  const [weeklyRent, setWeeklyRent] = useState('');
  const [bondAmount, setBondAmount] = useState('');
  const [bondPaid, setBondPaid] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('weekly');
  const [billsIncluded, setBillsIncluded] = useState(true);
  const [noticePeriodDays, setNoticePeriodDays] = useState('14');
  const [status, setStatus] = useState<'draft' | 'available' | 'active'>('draft');
  
  // Terms
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [parkingSpaces, setParkingSpaces] = useState('0');
  const [specialConditions, setSpecialConditions] = useState('');

  // Date pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-calculate bond (usually 4 weeks rent) when weekly rent changes
    if (weeklyRent && !bondAmount) {
      const rent = parseFloat(weeklyRent);
      if (rent > 0) {
        setBondAmount((rent * 4).toString());
      }
    }
  }, [weeklyRent]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // If listing_id is provided, load that specific listing
      if (listing_id) {
        const [listingRes, tenantsRes] = await Promise.all([
          api.listings.getById(listing_id),
          api.tenants.getAll(),
        ]);
        
        setListings([listingRes.data]);
      } else {
        // Otherwise, load all available listings
        const [listingsRes, tenantsRes] = await Promise.all([
          api.listings.getAll({ status: 'available' }),
          api.tenants.getAll(),
        ]);
        
        setListings(listingsRes.data || []);
      }
      
      // Load tenants
      const tenantsRes = await api.tenants.getAll();
      
      // Filter tenants that don't have an active contract
      const availableTenants = (tenantsRes.data || []).filter(
        (tenant: any) => !tenant.current_contract_id
      );
      setTenants(availableTenants);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('common.error'), 'Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    // Validations
    if (!selectedListingId) {
      Alert.alert(t('common.error'), 'Selecciona una propiedad');
      return;
    }

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

    try {
      setLoading(true);

      const contractData = {
        listing_id: selectedListingId,
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

      await api.contracts.create(contractData);

      Alert.alert(
        'Éxito',
        'Contrato creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating contract:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || 'Error al crear el contrato'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loadingData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <DetailHeader title="Nuevo Contrato" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B9AA8" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader title="Nuevo Contrato" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Listing Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Home size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Propiedad</Text>
          </View>
          {listing_id && (
            <Text style={styles.sectionSubtitle}>
              Esta propiedad fue preseleccionada
            </Text>
          )}

          {listings.length === 0 ? (
            <Text style={styles.noDataText}>No hay propiedades disponibles</Text>
          ) : (
            <View style={styles.selectContainer}>
              {listings.map((listing) => (
                <View
                  key={listing._id}
                  style={[
                    styles.selectOption,
                    styles.selectOptionActive,
                  ]}
                >
                  <View style={styles.radioButton}>
                    <View style={styles.radioButtonInner} />
                  </View>
                  <View style={styles.selectOptionText}>
                    <Text style={styles.selectOptionTitle}>{listing.title}</Text>
                    <Text style={styles.selectOptionSubtitle}>{listing.address}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tenant Selection (Optional) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Inquilino (Opcional)</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Puedes asignar un inquilino ahora o después
          </Text>

          {tenants.length === 0 ? (
            <Text style={styles.noDataText}>No hay inquilinos disponibles</Text>
          ) : (
            <View style={styles.selectContainer}>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  !selectedTenantId && styles.selectOptionActive,
                ]}
                onPress={() => setSelectedTenantId('')}
              >
                <View style={styles.radioButton}>
                  {!selectedTenantId && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.selectOptionTitle}>Sin asignar</Text>
              </TouchableOpacity>

              {tenants.map((tenant) => (
                <TouchableOpacity
                  key={tenant._id}
                  style={[
                    styles.selectOption,
                    selectedTenantId === tenant._id && styles.selectOptionActive,
                  ]}
                  onPress={() => setSelectedTenantId(tenant._id)}
                >
                  <View style={styles.radioButton}>
                    {selectedTenantId === tenant._id && <View style={styles.radioButtonInner} />}
                  </View>
                  <View style={styles.selectOptionText}>
                    <Text style={styles.selectOptionTitle}>{tenant.name}</Text>
                    <Text style={styles.selectOptionSubtitle}>{tenant.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Fechas del Contrato</Text>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.label}>Fecha de Inicio</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateField}>
              <Text style={styles.label}>Fecha de Fin</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Financial */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color="#5B9AA8" />
            <Text style={styles.sectionTitle}>Información Financiera</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Renta Semanal</Text>
            <TextInput
              style={styles.input}
              value={weeklyRent}
              onChangeText={setWeeklyRent}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Depósito (Bond)</Text>
            <TextInput
              style={styles.input}
              value={bondAmount}
              onChangeText={setBondAmount}
              keyboardType="numeric"
              placeholder="0"
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
              <Text style={styles.statusButtonSubtext}>
                Para revisar después
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'available' && styles.statusButtonActive,
              ]}
              onPress={() => setStatus('available')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === 'available' && styles.statusButtonTextActive,
                ]}
              >
                Disponible
              </Text>
              <Text style={styles.statusButtonSubtext}>
                Publicar en la web
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
              <Text style={styles.statusButtonSubtext}>
                Con inquilino asignado
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Crear Contrato</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      <DatePickerModal
        visible={showStartDatePicker}
        initialDate={startDate.toISOString()}
        onSelect={(dateString: string) => {
          setStartDate(new Date(dateString));
          setShowStartDatePicker(false);
        }}
        onClose={() => setShowStartDatePicker(false)}
        title="Fecha de Inicio"
      />

      <DatePickerModal
        visible={showEndDatePicker}
        initialDate={endDate.toISOString()}
        minimumDate={startDate.toISOString()}
        onSelect={(dateString: string) => {
          setEndDate(new Date(dateString));
          setShowEndDatePicker(false);
        }}
        onClose={() => setShowEndDatePicker(false)}
        title="Fecha de Fin"
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
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#272932',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  selectContainer: {
    gap: 12,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectOptionActive: {
    borderColor: '#5B9AA8',
    backgroundColor: '#F0F9FF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5B9AA8',
  },
  selectOptionText: {
    flex: 1,
  },
  selectOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
    marginBottom: 2,
  },
  selectOptionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#272932',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#272932',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    gap: 12,
  },
  statusButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#5B9AA8',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  statusButtonTextActive: {
    color: '#5B9AA8',
  },
  statusButtonSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#5B9AA8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
