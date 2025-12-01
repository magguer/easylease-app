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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import DetailHeader from '@/components/ui/DetailHeader';

interface FormData {
  name: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  notes: string;
}

export default function EditTenantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    notes: '',
  });

  useEffect(() => {
    loadTenant();
  }, [id]);

  const loadTenant = async () => {
    try {
      const response = await api.tenants.getById(id);
      const tenant = response.data;

      setFormData({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        emergency_contact_name: tenant.emergency_contact?.name || '',
        emergency_contact_phone: tenant.emergency_contact?.phone || '',
        emergency_contact_relationship: tenant.emergency_contact?.relationship || '',
        notes: tenant.notes || '',
      });
    } catch (error: any) {
      console.error('Error loading tenant:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('tenants.form.loadError')
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
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), t('tenants.form.fullNameRequired'));
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert(t('common.error'), t('tenants.form.emailRequired'));
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert(t('common.error'), t('tenants.form.phoneRequired'));
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        emergency_contact: {
          name: formData.emergency_contact_name.trim() || undefined,
          phone: formData.emergency_contact_phone.trim() || undefined,
          relationship: formData.emergency_contact_relationship.trim() || undefined,
        },
        notes: formData.notes.trim() || undefined,
      };

      await api.tenants.update(id, payload);
      Alert.alert(
        t('common.success'),
        t('tenants.form.updateSuccess'),
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('tenants.form.updateError')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.confirm'),
      t('tenants.form.deleteConfirmMessage'),
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
              await api.tenants.delete(id);
              Alert.alert(
                t('common.success'),
                t('tenants.form.deleteSuccess'),
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)/tenants'),
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error deleting tenant:', error);
              Alert.alert(
                t('common.error'),
                error.response?.data?.error || t('tenants.form.deleteError')
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
        <DetailHeader title={t('tenants.editTenant')} showEdit={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D7EA8" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title={t('tenants.editTenant')}
        showEdit={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tenants.form.personalInfo')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.fullName')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder={t('tenants.form.fullNamePlaceholder')}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.email')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder={t('tenants.form.emailPlaceholder')}
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.phone')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder={t('tenants.form.phonePlaceholder')}
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
              placeholder={t('tenants.form.contactNamePlaceholder')}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('tenants.form.contactPhone')}</Text>
            <TextInput
              style={styles.input}
              value={formData.emergency_contact_phone}
              onChangeText={(value) => updateField('emergency_contact_phone', value)}
              placeholder={t('tenants.form.contactPhonePlaceholder')}
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
              placeholder={t('tenants.form.relationshipPlaceholder')}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tenants.form.notes')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            placeholder={t('tenants.form.notesPlaceholder')}
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Delete Section */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>{t('tenants.form.dangerZone')}</Text>
          <Text style={styles.dangerDescription}>
            {t('tenants.form.dangerZoneDescription')}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={saving}
          >
            <Text style={styles.deleteButtonText}>{t('tenants.form.deleteTenant')}</Text>
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
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('tenants.form.saveChanges')}</Text>
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
  textArea: {
    height: 100,
    paddingTop: 12,
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
    backgroundColor: '#4D7EA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectContainer: {
    marginTop: 8,
  },
  optionsScroll: {
    flexGrow: 0,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    minWidth: 100,
  },
  optionButtonActive: {
    backgroundColor: '#4D7EA8',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
});
