import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ListHeaderProps {
  title: string;
  count: number;
  countLabel: string;
  buttonText?: string;
  onButtonPress?: () => void;
  buttonColor?: string;
}

export default function ListHeader({
  title,
  count,
  countLabel,
  buttonText,
  onButtonPress,
  buttonColor = '#4D7EA8',
}: ListHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>
          {count} {countLabel}
        </Text>
      </View>
      {buttonText && onButtonPress && (
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: buttonColor }]} 
          onPress={onButtonPress}
        >
          <Text style={styles.createButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#272932',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
