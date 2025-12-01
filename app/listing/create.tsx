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
import ImageUpload, { uploadLocalImages } from '@/components/ui/ImageUpload';
import { Home, MapPin, Image as ImageIcon } from '@tamagui/lucide-icons';

interface FormData {
  title: string;
  address: string;
  suburb: string;
  room_type: string;
  description: string;
  parking: boolean;
  internet: boolean;
  furnished: boolean;
  pets_allowed: boolean;
  images: string[];
}

export default function CreateListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    address: '',
    suburb: '',
    room_type: 'single',
    description: '',
    parking: false,
    internet: false,
    furnished: false,
    pets_allowed: false,
    images: [],
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert(t('common.error'), t('listings.form.titleRequired'));
      return false;
    }
    // price_per_week is now optional - will come from contract
    if (!formData.address.trim()) {
      Alert.alert(t('common.error'), t('listings.form.addressRequired'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Upload images first if there are any local images
      let uploadedImageUrls = formData.images;
      if (formData.images.length > 0) {
        try {
          uploadedImageUrls = await uploadLocalImages(formData.images);
        } catch (uploadError) {
          Alert.alert(
            t('common.error'),
            'Failed to upload images. Please try again.'
          );
          setLoading(false);
          return;
        }
      }

      const payload = {
        title: formData.title.trim(),
        address: formData.address.trim(),
        suburb: formData.suburb.trim() || undefined,
        room_type: formData.room_type,
        house_features: [
          formData.parking && 'parking',
          formData.internet && 'internet',
          formData.furnished && 'furnished',
          formData.pets_allowed && 'pets_allowed',
        ].filter(Boolean),
        images: uploadedImageUrls,
      };

      const response = await api.listings.create(payload);
      Alert.alert(
        t('common.success'),
        t('listings.messages.createSuccess'),
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
        error.response?.data?.error || t('common.error')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title={t('listings.addListing')}
        showEdit={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('listings.form.basicInformation')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('listings.form.title')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => updateField('title', value)}
              placeholder={t('listings.form.titlePlaceholder')}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('listings.form.roomType')} *</Text>
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
                    {t(`listings.form.${type}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('listings.form.location')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('listings.form.address')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder={t('listings.form.addressPlaceholder')}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('listings.form.suburb')}</Text>
            <TextInput
              style={styles.input}
              value={formData.suburb}
              onChangeText={(value) => updateField('suburb', value)}
              placeholder={t('listings.form.suburbPlaceholder')}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('listings.form.amenities')}</Text>

          <View style={styles.switchField}>
            <Text style={styles.label}>{t('listings.form.parking')}</Text>
            <Switch
              value={formData.parking}
              onValueChange={(value) => updateField('parking', value)}
              trackColor={{ false: '#E5E7EB', true: '#7BA89E' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchField}>
            <Text style={styles.label}>{t('listings.form.internet')}</Text>
            <Switch
              value={formData.internet}
              onValueChange={(value) => updateField('internet', value)}
              trackColor={{ false: '#E5E7EB', true: '#7BA89E' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchField}>
            <Text style={styles.label}>{t('listings.form.furnished')}</Text>
            <Switch
              value={formData.furnished}
              onValueChange={(value) => updateField('furnished', value)}
              trackColor={{ false: '#E5E7EB', true: '#7BA89E' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchField}>
            <Text style={styles.label}>{t('listings.form.petsAllowed')}</Text>
            <Switch
              value={formData.pets_allowed}
              onValueChange={(value) => updateField('pets_allowed', value)}
              trackColor={{ false: '#E5E7EB', true: '#7BA89E' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Images Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('listings.form.images')}</Text>
          <ImageUpload
            images={formData.images}
            onImagesChange={(images) => updateField('images', images)}
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
          <Text style={styles.cancelButtonText}>{t('listings.form.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('listings.form.createListing')}</Text>
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
  fieldHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontStyle: 'italic',
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
    backgroundColor: '#5B9AA8',
    borderColor: '#5B9AA8',
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
    backgroundColor: '#5B9AA8',
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
