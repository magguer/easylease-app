import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

export default function App() {
  const { t, isLoading, language, changeLanguage } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('common.appName')}</Text>
        
        <Text style={styles.subtitle}>{t('dashboard.welcome')}</Text>
        
        <View style={styles.languageContainer}>
          <Text style={styles.languageLabel}>{t('settings.language')}</Text>
          
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => changeLanguage('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'en' && styles.languageButtonTextActive,
                ]}
              >
                {t('settings.english')} 🇺🇸
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'es' && styles.languageButtonActive,
              ]}
              onPress={() => changeLanguage('es')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'es' && styles.languageButtonTextActive,
                ]}
              >
                {t('settings.spanish')} 🇪🇸
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>{t('auth.loginButton')}</Text>
        </TouchableOpacity>
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#272932',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#828489',
    textAlign: 'center',
    marginBottom: 24,
  },
  languageContainer: {
    gap: 12,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#B6C2D9',
    borderColor: '#4D7EA8',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#828489',
  },
  languageButtonTextActive: {
    color: '#4D7EA8',
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4D7EA8',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


