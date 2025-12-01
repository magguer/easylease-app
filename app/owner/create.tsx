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
import UserAccountSection, { generateRandomPassword } from '@/components/ui/UserAccountSection';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  create_user_account: boolean;
  user_password: string;
}

export default function CreatePartnerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active',
    create_user_account: true,
    user_password: generateRandomPassword(),
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), t('partners.fields.name') + ' is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert(t('common.error'), t('partners.fields.email') + ' is required');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert(t('common.error'), t('partners.fields.phone') + ' is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || undefined,
        status: formData.status,
        create_user_account: formData.create_user_account,
        user_password: formData.create_user_account ? formData.user_password : undefined,
      };

      const response = await api.owners.create(payload);
      
      // Show success message with user credentials if created
      let message = t('partners.messages.createSuccess');
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
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating partner:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('partners.messages.createSuccess')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DetailHeader
        title={t('partners.addOwner')}
        showEdit={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tenants.form.personalInfo')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.fields.name')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="e.g., John Doe"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.fields.email')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="email@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <UserAccountSection
            email={formData.email}
            createUserAccount={formData.create_user_account}
            userPassword={formData.user_password}
            onToggleCreateAccount={(value) => updateField('create_user_account', value)}
            onPasswordChange={(password) => updateField('user_password', password)}
          />

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.fields.phone')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="+1234567890"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.fields.company')}</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(value) => updateField('company', value)}
              placeholder={t('partners.fields.company') + ' (optional)'}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('partners.fields.status')} *</Text>
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
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('partners.form.createOwner')}</Text>
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
