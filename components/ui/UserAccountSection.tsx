import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert, Clipboard } from 'react-native';
import { Eye, EyeOff, RefreshCw, Copy } from '@tamagui/lucide-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';

interface UserAccountSectionProps {
  email: string;
  createUserAccount: boolean;
  userPassword: string;
  onToggleCreateAccount: (value: boolean) => void;
  onPasswordChange: (password: string) => void;
}

// Function to generate random password
export const generateRandomPassword = () => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export default function UserAccountSection({
  email,
  createUserAccount,
  userPassword,
  onToggleCreateAccount,
  onPasswordChange,
}: UserAccountSectionProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(true);

  const copyCredentialsToClipboard = () => {
    const credentials = `Email: ${email}\n${t('tenants.form.password')}: ${userPassword}`;
    Clipboard.setString(credentials);
    Alert.alert(
      t('tenants.form.credentialsCopied'),
      t('tenants.form.credentialsCopiedDesc'),
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      {/* Create User Account Switch */}
      <View style={styles.switchField}>
        <View style={styles.switchLabelContainer}>
          <Text style={styles.label}>{t('tenants.form.createUserAccount')}</Text>
          <Text style={styles.switchDescription}>
            {t('tenants.form.createUserAccountDesc')}
          </Text>
        </View>
        <Switch
          value={createUserAccount}
          onValueChange={onToggleCreateAccount}
          trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
          thumbColor={createUserAccount ? '#FFFFFF' : '#F1F5F9'}
        />
      </View>

      {/* Password Field - Only show if createUserAccount is true */}
      {createUserAccount && (
        <View style={styles.field}>
          <Text style={styles.label}>{t('tenants.form.password')} *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={userPassword}
              onChangeText={onPasswordChange}
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
              onPress={() => onPasswordChange(generateRandomPassword())}
            >
              <RefreshCw size={16} color="#4D7EA8" />
              <Text style={styles.generateButtonText}>{t('tenants.form.generate')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.passwordHint}>
            {t('tenants.form.passwordHint')}: {userPassword}
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
    </>
  );
}

const styles = StyleSheet.create({
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  switchDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
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
    backgroundColor: '#7BA89E',
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
});
