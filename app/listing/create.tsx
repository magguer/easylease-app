import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import DetailHeader from '@/components/ui/DetailHeader';
import { Home, DollarSign, MapPin, Calendar, Image as ImageIcon } from '@tamagui/lucide-icons';

interface FormData {
  title: string;
  price_per_week: string;
  bond: string;
  bills_included: boolean;
  address: string;
  suburb: string;
  room_type: string;
  available_from: string;
  min_term_weeks: string;
  description: string;
  parking: boolean;
  internet: boolean;
  furnished: boolean;
  pets_allowed: boolean;
  status: string;
}

export default function CreateListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    price_per_week: '',
    bond: '',
    bills_included: true,
    address: '',
    suburb: '',
    room_type: 'single',
    available_from: '',
    min_term_weeks: '12',
    description: '',
    parking: false,
    internet: false,
    furnished: false,
    pets_allowed: false,
    status: 'draft',
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert(t('common.error'), 'Title is required');
      return false;
    }
    if (!formData.price_per_week || parseFloat(formData.price_per_week) <= 0) {
      Alert.alert(t('common.error'), 'Valid price is required');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert(t('common.error'), 'Address is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        price_per_week: parseFloat(formData.price_per_week),
        bond: formData.bond ? parseFloat(formData.bond) : 0,
        bills_included: formData.bills_included,
        address: formData.address.trim(),
        suburb: formData.suburb.trim() || undefined,
        room_type: formData.room_type,
        available_from: formData.available_from || new Date().toISOString(),
        min_term_weeks: parseInt(formData.min_term_weeks) || 12,
        house_features: [
          formData.parking && 'parking',
          formData.internet && 'internet',
          formData.furnished && 'furnished',
          formData.pets_allowed && 'pets_allowed',
        ].filter(Boolean),
        status: formData.status,
      };

      const response = await api.listings.create(payload);
      Alert.alert(
        t('common.success'),
        'Listing created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.push(`/listing/${response.data._id}`),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating listing:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || 'Failed to create listing'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title={t('listings.createListing')}
        showEdit={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => updateField('title', value)}
              placeholder="e.g., Cozy room in shared house"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Room Type *</Text>
            <View style={styles.radioGroup}>
              {['single', 'double', 'master'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.radioButton,
                    formData.room_type === type && styles.radioButtonActive,
                  ]}
                  onPress={() => updateField('room_type', type)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.room_type === type && styles.radioTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Status *</Text>
            <View style={styles.radioGroup}>
              {['draft', 'published'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.radioButton,
                    formData.status === status && styles.radioButtonActive,
                  ]}
                  onPress={() => updateField('status', status)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.status === status && styles.radioTextActive,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>

          <View style={styles.row}>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.label}>Price per Week * ($)</Text>
              <TextInput
                style={styles.input}
                value={formData.price_per_week}
                onChangeText={(value) => updateField('price_per_week', value)}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.label}>Bond ($)</Text>
              <TextInput
                style={styles.input}
                value={formData.bond}
                onChangeText={(value) => updateField('bond', value)}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.switchField}>
            <Text style={styles.label}>Bills Included</Text>
            <Switch
              value={formData.bills_included}
              onValueChange={(value) => updateField('bills_included', value)}
              trackColor={{ false: '#E5E7EB', true: '#7BA89E' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="123 Main St"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Suburb</Text>
            <TextInput
              style={styles.input}
              value={formData.suburb}
              onChangeText={(value) => updateField('suburb', value)}
              placeholder="Brisbane CBD"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lease Terms</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Available From</Text>
            <TextInput
              style={styles.input}
              value={formData.available_from}
              onChangeText={(value) => updateField('available_from', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Minimum Term (weeks)</Text>
            <TextInput
              style={styles.input}
              value={formData.min_term_weeks}
              onChangeText={(value) => updateField('min_term_weeks', value)}
              placeholder="12"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>

          <View style={styles.switchField}>
            <Text style={styles.label}>Parking</Text>
            <Switch
              value={formData.parking}
              onValueChange={(value) => updateField('parking', value)}
              trackColor={{ false: '#E5E7EB', true: '#7BA89E' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchField}>
            <Text style={styles.label}>Internet</Text>
            <Switch
              value={formData.internet}
              onValueChange={(value) => updateField('internet', value)}
              trackColor={{ false: '#E5E7EB', true: '#7BA89E' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchField}>
            <Text style={styles.label}>Furnished</Text>
            <Switch
              value={formData.furnished}
              onValueChange={(value) => updateField('furnished', value)}
              trackColor={{ false: '#E5E7EB', true: '#7BA89E' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchField}>
            <Text style={styles.label}>Pets Allowed</Text>
            <Switch
              value={formData.pets_allowed}
              onValueChange={(value) => updateField('pets_allowed', value)}
              trackColor={{ false: '#E5E7EB', true: '#7BA89E' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* TODO: Images Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          <View style={styles.imagePlaceholder}>
            <ImageIcon size={48} color="#94A3B8" />
            <Text style={styles.imagePlaceholderText}>
              Image upload coming soon
            </Text>
          </View>
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
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Create Listing</Text>
          )}
        </TouchableOpacity>
      </View>
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
  field: {
    marginBottom: 16,
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
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
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
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  imagePlaceholder: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
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
});
