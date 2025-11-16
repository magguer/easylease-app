import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { Languages } from '@tamagui/lucide-icons';

export const LanguageSwitcher = () => {
  const { t, changeLanguage, isEnglish, isSpanish } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Languages size={20} color="#4D7EA8" />
        <Text style={styles.headerText}>{t('settings.language')}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            isEnglish && styles.buttonActive,
          ]}
          onPress={() => changeLanguage('en')}
        >
          <Text style={[styles.buttonText, isEnglish && styles.buttonTextActive]}>
            {t('settings.english')} 🇺🇸
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isSpanish && styles.buttonActive,
          ]}
          onPress={() => changeLanguage('es')}
        >
          <Text style={[styles.buttonText, isSpanish && styles.buttonTextActive]}>
            {t('settings.spanish')} 🇪🇸
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#B6C2D9',
    borderColor: '#4D7EA8',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#828489',
  },
  buttonTextActive: {
    fontWeight: '600',
    color: '#4D7EA8',
  },
});
