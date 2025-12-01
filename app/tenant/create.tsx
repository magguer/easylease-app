import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, RefreshCw, Copy, Calendar } from '@tamagui/lucide-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import DetailHeader from '@/components/ui/DetailHeader';
import DatePickerModal from '@/components/ui/DatePickerModal';

interface FormData {
  name: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  listing_id: string;
  notes: string;
  create_user_account: boolean;
  user_password: string;
  create_contract: boolean;
  contract_start_date: string;
  contract_end_date: string;
  weekly_rent: string;
  bond_amount: string;
  bond_paid: boolean;
  payment_frequency: string;
}

interface Listing {
  _id: string;
  title: string;
  address: string;
  price_per_week: number;
  status: string;
}

// Function to generate random password
const generateRandomPassword = () => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export default function CreateTenantScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingListings, setLoadingListings] = useState(true);
  const [availableListings, setAvailableListings] = useState<Listing[]>([]);
  const [showPassword, setShowPassword] = useState(true);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    listing_id: '',
    notes: '',
    create_user_account: true,
    user_password: generateRandomPassword(),
    create_contract: true, // Default to creating contract
    contract_start_date: '',
    contract_end_date: '',
    weekly_rent: '',
    bond_amount: '',
    bond_paid: false,
    payment_frequency: 'weekly',
  });

  useEffect(() => {
    loadAvailableListings();
  }, []);

  const loadAvailableListings = async () => {
    try {
      const response = await api.listings.getAll();
      // Filter for published listings
      const published = response.data.filter(
        (listing: Listing) => listing.status === 'published'
      );
      setAvailableListings(published);
    } catch (error) {
      console.error('Error loading listings:', error);
      Alert.alert(t('common.error'), 'Failed to load available listings');
    } finally {
      setLoadingListings(false);
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-fill weekly_rent and calculate bond when listing is selected
    if (field === 'listing_id') {
      if (value) {
        const selectedListing = availableListings.find((l) => l._id === value);
        if (selectedListing) {
          const rent = selectedListing.price_per_week;
          setFormData((prev) => ({
            ...prev,
            listing_id: value,
            weekly_rent: rent.toString(),
            bond_amount: (rent * 4).toString(), // 4 weeks bond
          }));
        }
      } else {
        // Si se deselecciona, limpiar datos del contrato
        setFormData((prev) => ({
          ...prev,
          listing_id: '',
          create_contract: false,
          weekly_rent: '',
          bond_amount: '',
        }));
      }
    }
  };

  const copyCredentialsToClipboard = () => {
    const credentials = `Email: ${formData.email}\n${t('tenants.form.password')}: ${formData.user_password}`;
    Clipboard.setString(credentials);
    Alert.alert(
      t('tenants.form.credentialsCopied'),
      t('tenants.form.credentialsCopiedDesc'),
      [{ text: 'OK' }]
    );
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), 'Tenant name is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert(t('common.error'), 'Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert(t('common.error'), 'Phone number is required');
      return false;
    }
    
    // Validate contract fields if creating contract
    if (formData.create_contract) {
      if (!formData.listing_id) {
        Alert.alert(t('common.error'), 'Please select a listing to create a contract');
        return false;
      }
      if (!formData.contract_start_date) {
        Alert.alert(t('common.error'), 'Contract start date is required');
        return false;
      }
      if (!formData.contract_end_date) {
        Alert.alert(t('common.error'), 'Contract end date is required');
        return false;
      }
      if (!formData.weekly_rent || parseFloat(formData.weekly_rent) <= 0) {
        Alert.alert(t('common.error'), 'Valid weekly rent is required');
        return false;
      }
      if (!formData.bond_amount || parseFloat(formData.bond_amount) < 0) {
        Alert.alert(t('common.error'), 'Valid bond amount is required');
        return false;
      }
      
      // Validate dates
      const startDate = new Date(formData.contract_start_date);
      const endDate = new Date(formData.contract_end_date);
      if (endDate <= startDate) {
        Alert.alert(t('common.error'), 'Contract end date must be after start date');
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        emergency_contact: {
          name: formData.emergency_contact_name.trim() || undefined,
          phone: formData.emergency_contact_phone.trim() || undefined,
          relationship: formData.emergency_contact_relationship.trim() || undefined,
        },
        listing_id: formData.listing_id || undefined,
        notes: formData.notes.trim() || undefined,
        create_user_account: formData.create_user_account,
        user_password: formData.create_user_account ? formData.user_password : undefined,
        create_contract: formData.create_contract,
      };

      // Add contract data if creating contract
      if (formData.create_contract) {
        payload.contract_data = {
          start_date: formData.contract_start_date,
          end_date: formData.contract_end_date,
          weekly_rent: parseFloat(formData.weekly_rent),
          bond_amount: parseFloat(formData.bond_amount),
          bond_paid: formData.bond_paid,
          payment_frequency: formData.payment_frequency,
          status: 'active',
        };
      }

      const response = await api.tenants.create(payload);
      
      // Build success message
      let message = t('tenants.form.createSuccess');
      
      if (response.contract?.contract_id) {
        message += `\n\n✅ ${t('tenants.form.contractCreated')}`;
      }
      
      if (response.user?.temporary_password) {
        message += `\n\n${t('tenants.form.userAccountCreated')}:\nEmail: ${response.user.email}\n${t('tenants.form.temporaryPassword')}: ${response.user.temporary_password}\n\n${t('tenants.form.shareCredentials')}`;
      } else if (response.user?.message) {
        message += `\n\n${response.user.message}`;
      }
      
      Alert.alert(
        t('common.success'),
        message,
        [
          {
            text: 'OK',
            onPress: () => router.push(`/tenant/${response.data._id}`),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('tenants.form.createError')
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingListings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <DetailHeader title={t('tenants.addTenant')} showEdit={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D7EA8" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader title={t('tenants.addTenant')} showEdit={false} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tenants.form.personalInfo')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.fullName')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="John Doe"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.email')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="john@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Create User Account Switch */}
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.label}>{t('tenants.form.createUserAccount')}</Text>
              <Text style={styles.switchDescription}>
                {t('tenants.form.createUserAccountDesc')}
              </Text>
            </View>
            <Switch
              value={formData.create_user_account}
              onValueChange={(value) => updateField('create_user_account', value)}
              trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
              thumbColor={formData.create_user_account ? '#FFFFFF' : '#F1F5F9'}
            />
          </View>

          {/* Password Field - Only show if create_user_account is true */}
          {formData.create_user_account && (
            <View style={styles.field}>
              <Text style={styles.label}>{t('tenants.form.password')} *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.user_password}
                  onChangeText={(value) => updateField('user_password', value)}
                  placeholder="Enter password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordIconButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#64748B" />
                  ) : (
                    <Eye size={20} color="#64748B" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={() => updateField('user_password', generateRandomPassword())}
                >
                  <RefreshCw size={16} color="#4D7EA8" />
                  <Text style={styles.generateButtonText}>{t('tenants.form.generate')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>
                {t('tenants.form.passwordHint')}: {formData.user_password}
              </Text>
              
              {/* Copy Credentials Button */}
              <TouchableOpacity
                style={styles.copyCredentialsButton}
                onPress={copyCredentialsToClipboard}
              >
                <Copy size={18} color="#FFF" />
                <Text style={styles.copyCredentialsButtonText}>
                  {t('tenants.form.copyCredentials')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.phone')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="+61 400 000 000"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tenants.form.emergencyContact')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.contactName')}</Text>
            <TextInput
              style={styles.input}
              value={formData.emergency_contact_name}
              onChangeText={(value) => updateField('emergency_contact_name', value)}
              placeholder="Jane Doe"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.contactPhone')}</Text>
            <TextInput
              style={styles.input}
              value={formData.emergency_contact_phone}
              onChangeText={(value) => updateField('emergency_contact_phone', value)}
              placeholder="+61 400 000 000"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.relationship')}</Text>
            <TextInput
              style={styles.input}
              value={formData.emergency_contact_relationship}
              onChangeText={(value) => updateField('emergency_contact_relationship', value)}
              placeholder="Mother, Father, Friend, etc."
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Listing Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tenants.form.selectListing')}</Text>
          <Text style={styles.sectionDescription}>
            {t('tenants.form.selectListingOptional')}
          </Text>
          
          {availableListings.length === 0 ? (
            <Text style={styles.noListingsText}>
              {t('tenants.form.noListingsAvailable')}
            </Text>
          ) : (
            <View style={styles.listingSelector}>
              {/* Option to deselect */}
              <TouchableOpacity
                style={[
                  styles.listingOption,
                  !formData.listing_id && styles.listingOptionActive,
                ]}
                onPress={() => updateField('listing_id', '')}
              >
                <View style={styles.listingOptionContent}>
                  <Text
                    style={[
                      styles.listingTitle,
                      !formData.listing_id && styles.listingTitleActive,
                    ]}
                  >
                    {t('tenants.form.noAssignment')}
                  </Text>
                  <Text
                    style={[
                      styles.listingAddress,
                      !formData.listing_id && styles.listingAddressActive,
                    ]}
                  >
                    Sin propiedad asignada
                  </Text>
                </View>
              </TouchableOpacity>
              
              {availableListings.map((listing) => (
                <TouchableOpacity
                  key={listing._id}
                  style={[
                    styles.listingOption,
                    formData.listing_id === listing._id && styles.listingOptionActive,
                  ]}
                  onPress={() => updateField('listing_id', listing._id)}
                >
                  <View style={styles.listingOptionContent}>
                    <Text
                      style={[
                        styles.listingTitle,
                        formData.listing_id === listing._id && styles.listingTitleActive,
                      ]}
                    >
                      {listing.title}
                    </Text>
                    <Text
                      style={[
                        styles.listingAddress,
                        formData.listing_id === listing._id && styles.listingAddressActive,
                      ]}
                    >
                      {listing.address}
                    </Text>
                    <Text
                      style={[
                        styles.listingPrice,
                        formData.listing_id === listing._id && styles.listingPriceActive,
                      ]}
                    >
                      ${listing.price_per_week}/week
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Create Contract Switch */}
        <View style={styles.section}>
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.label}>{t('tenants.form.createContract')}</Text>
              <Text style={styles.switchDescription}>
                {t('tenants.form.createContractDesc')}
              </Text>
            </View>
            <Switch
              value={formData.create_contract}
              onValueChange={(value) => updateField('create_contract', value)}
              trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
              thumbColor={formData.create_contract ? '#FFFFFF' : '#F1F5F9'}
              disabled={!formData.listing_id}
            />
          </View>
        </View>

        {/* Contract Information - Only show if creating contract */}
        {formData.create_contract && formData.listing_id && (
          <>
            {/* Contract Dates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('tenants.form.contractInfo')}</Text>

              <View style={styles.row}>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>{t('tenants.form.contractStart')} *</Text>
                  <TouchableOpacity
                    style={styles.dateInputContainer}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Calendar size={20} color="#64748B" style={styles.dateIcon} />
                    <Text style={[styles.dateText, !formData.contract_start_date && styles.placeholderText]}>
                      {formData.contract_start_date || 'YYYY-MM-DD'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>{t('tenants.form.contractEnd')} *</Text>
                  <TouchableOpacity
                    style={styles.dateInputContainer}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Calendar size={20} color="#64748B" style={styles.dateIcon} />
                    <Text style={[styles.dateText, !formData.contract_end_date && styles.placeholderText]}>
                      {formData.contract_end_date || 'YYYY-MM-DD'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Financial Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('tenants.form.financialInfo')}</Text>

              <View style={styles.row}>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>{t('tenants.form.weeklyRent')} * ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.weekly_rent}
                    onChangeText={(value) => updateField('weekly_rent', value)}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>{t('tenants.form.bondAmount')} ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.bond_amount}
                    onChangeText={(value) => updateField('bond_amount', value)}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.switchField}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.label}>{t('tenants.form.bondPaid')}</Text>
                  <Text style={styles.switchDescription}>
                    {t('tenants.form.bondPaidDesc')}
                  </Text>
                </View>
                <Switch
                  value={formData.bond_paid}
                  onValueChange={(value) => updateField('bond_paid', value)}
                  trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
                  thumbColor={formData.bond_paid ? '#FFFFFF' : '#F1F5F9'}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('tenants.form.paymentFrequency')}</Text>
                <View style={styles.radioGroup}>
                  {[
                    { value: 'weekly', label: t('tenants.paymentFrequency.weekly') },
                    { value: 'fortnightly', label: t('tenants.paymentFrequency.fortnightly') },
                    { value: 'monthly', label: t('tenants.paymentFrequency.monthly') },
                  ].map((method) => (
                    <TouchableOpacity
                      key={method.value}
                      style={[
                        styles.radioButton,
                        formData.payment_frequency === method.value && styles.radioButtonActive,
                      ]}
                      onPress={() => updateField('payment_frequency', method.value)}
                    >
                      <Text
                        style={[
                          styles.radioText,
                          formData.payment_frequency === method.value && styles.radioTextActive,
                        ]}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tenants.form.notes')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            placeholder="Additional notes or comments..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading || availableListings.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('tenants.createTenant')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onSelect={(date) => {
          updateField('contract_start_date', date);
          setShowStartDatePicker(false);
        }}
        initialDate={formData.contract_start_date || undefined}
        title={t('tenants.form.contractStart')}
      />

      <DatePickerModal
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onSelect={(date) => {
          updateField('contract_end_date', date);
          setShowEndDatePicker(false);
        }}
        initialDate={formData.contract_end_date || undefined}
        minimumDate={formData.contract_start_date || undefined}
        title={t('tenants.form.contractEnd')}
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
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#272932',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionHeaderWithButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  field: {
    marginBottom: 16,
  },
  switchField: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  fieldHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#272932',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#1E293B',
  },
  placeholderText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#272932',
  },
  passwordIconButton: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#4D7EA8',
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4D7EA8',
  },
  passwordHint: {
    fontSize: 12,
    color: '#4D7EA8',
    marginTop: 8,
    fontWeight: '500',
  },
  copyCredentialsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#4D7EA8',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  copyCredentialsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  listingSelector: {
    gap: 12,
  },
  listingOption: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFF',
  },
  listingOptionActive: {
    borderColor: '#4D7EA8',
    backgroundColor: '#F0F7FF',
  },
  listingOptionContent: {
    gap: 4,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
  },
  listingTitleActive: {
    color: '#4D7EA8',
  },
  listingAddress: {
    fontSize: 14,
    color: '#64748B',
  },
  listingAddressActive: {
    color: '#4D7EA8',
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7BA89E',
    marginTop: 4,
  },
  listingPriceActive: {
    color: '#4D7EA8',
  },
  noListingsText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: '#4D7EA8',
    borderColor: '#4D7EA8',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  radioTextActive: {
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4D7EA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  modalDoneButton: {
    backgroundColor: '#4D7EA8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
