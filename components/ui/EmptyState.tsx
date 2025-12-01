import { View, Text, StyleSheet } from 'react-native';
import { ComponentType } from 'react';

interface IconProps {
  size?: number;
  color?: string;
}

interface EmptyStateProps {
  icon: ComponentType<IconProps>;
  title: string;
  subtitle?: string;
  iconSize?: number;
  iconColor?: string;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  subtitle,
  iconSize = 64,
  iconColor = '#E0E0E0'
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon size={iconSize} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#828489',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 8,
    textAlign: 'center',
  },
});
