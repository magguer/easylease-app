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
  company: string;
  status: string;
  notes: string;
}

export default function EditOwnerScreen() {
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
    company: '',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    loadOwner();
  }, [id]);

  const loadOwner = async () => {
    try {
      const response = await api.owners.getById(id);
      const owner = response.data;

      setFormData({
        name: owner.name || '',
        email: owner.email || '',
        phone: owner.phone || '',
        company: owner.company || '',
        status: owner.status || 'active',
        notes: owner.notes || '',
      });
    } catch (error: any) {
      console.error('Error loading owner:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('partners.messages.loadError')
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
      Alert.alert(t('common.error'), t('partners.form.nameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert(t('common.error'), t('partners.form.emailRequired'));
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert(t('common.error'), t('partners.form.phoneRequired'));
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
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      };

      await api.owners.update(id, payload);
      Alert.alert(
        t('common.success'),
        t('partners.messages.updateSuccess'),
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating owner:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('partners.messages.updateError')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.confirm'),
      t('partners.form.deleteConfirmMessage'),
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
              await api.owners.delete(id);
              Alert.alert(
                t('common.success'),
                t('partners.messages.deleteSuccess'),
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)/owners'),
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error deleting owner:', error);
              Alert.alert(
                t('common.error'),
                error.response?.data?.error || t('partners.messages.deleteError')
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
        <DetailHeader title={t('partners.editPartner')} showEdit={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D7EA8" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title={t('partners.editPartner')}
        showEdit={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('partners.form.personalInfo')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.form.name')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder={t('partners.form.namePlaceholder')}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.form.email')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder={t('partners.form.emailPlaceholder')}
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.form.phone')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder={t('partners.form.phonePlaceholder')}
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.form.company')}</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(value) => updateField('company', value)}
              placeholder={t('partners.form.companyPlaceholder')}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.form.status')} *</Text>
            <View style={styles.radioGroup}>
              {['active', 'inactive'].map((status) => (
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
                    {t(`partners.status.${status}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.form.notes')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => updateField('notes', value)}
              placeholder={t('partners.form.notesPlaceholder')}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Delete Section */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>{t('partners.form.dangerZone')}</Text>
          <Text style={styles.dangerDescription}>
            {t('partners.form.dangerZoneDescription')}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={saving}
          >
            <Text style={styles.deleteButtonText}>{t('partners.form.deleteOwner')}</Text>
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
          <Text style={styles.cancelButtonText}>{t('partners.form.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('partners.form.saveChanges')}</Text>
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
    backgroundColor: '#7BA89E',
    borderColor: '#7BA89E',
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
    backgroundColor: '#7BA89E',
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
