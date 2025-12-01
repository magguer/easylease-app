import { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import DetailHeader from '@/components/ui/DetailHeader';
import ImageUpload, { uploadLocalImages } from '@/components/ui/ImageUpload';
import { Image as ImageIcon } from '@tamagui/lucide-icons';

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

export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const response = await api.listings.getById(id);
      const listing = response.data;

      setFormData({
        title: listing.title || '',
        address: listing.address || '',
        suburb: listing.suburb || '',
        room_type: listing.room_type || 'single',
        description: listing.description || '',
        parking: listing.house_features?.includes('parking') || false,
        internet: listing.house_features?.includes('internet') || false,
        furnished: listing.house_features?.includes('furnished') || false,
        pets_allowed: listing.house_features?.includes('pets_allowed') || false,
        images: listing.images || [],
      });
    } catch (error: any) {
      console.error('Error loading listing:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('listings.form.loadError')
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert(t('common.error'), t('listings.form.titleRequired'));
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert(t('common.error'), t('listings.form.addressRequired'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Upload any new local images first
      let uploadedImageUrls = formData.images;
      const hasLocalImages = formData.images.some(uri => !uri.startsWith('http'));
      if (hasLocalImages) {
        try {
          uploadedImageUrls = await uploadLocalImages(formData.images);
        } catch (uploadError) {
          Alert.alert(
            t('common.error'),
            'Failed to upload images. Please try again.'
          );
          setSaving(false);
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

      await api.listings.update(id, payload);
      Alert.alert(
        t('common.success'),
        t('listings.messages.updateSuccess'),
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating listing:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('listings.form.updateError')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.confirm'),
      t('listings.form.deleteConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.listings.delete(id);
              Alert.alert(
                t('common.success'),
                t('listings.messages.deleteSuccess'),
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)/listings'),
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error deleting listing:', error);
              Alert.alert(
                t('common.error'),
                error.response?.data?.error || t('listings.form.deleteError')
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
        <DetailHeader title={t('listings.editListing')} showEdit={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B9AA8" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title={t('listings.editListing')}
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

        {/* Delete Section */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>{t('listings.form.dangerZone')}</Text>
          <Text style={styles.dangerDescription}>
            {t('listings.form.dangerZoneDescription')}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={saving}
          >
            <Text style={styles.deleteButtonText}>{t('listings.form.deleteListing')}</Text>
          </TouchableOpacity>
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
          <Text style={styles.cancelButtonText}>{t('listings.form.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('listings.form.saveChanges')}</Text>
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
    flexWrap: 'wrap',
  },
  radioButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    alignItems: 'center',
    minWidth: 80,
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
  dangerSection: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
