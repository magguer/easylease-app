import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Edit3, Trash2 } from '@tamagui/lucide-icons';

interface DetailHeaderProps {
  title: string;
  showEdit?: boolean;
  showDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DetailHeader({
  title,
  showEdit = false,
  showDelete = false,
  onEdit,
  onDelete,
}: DetailHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ArrowLeft size={24} color="#272932" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      <View style={styles.actions}>
        {showDelete && onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
            <Trash2 size={24} color="#EF4444" />
          </TouchableOpacity>
        )}
        {showEdit && onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
            <Edit3 size={24} color="#4D7EA8" />
          </TouchableOpacity>
        )}
        {!showEdit && !showDelete && <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#272932',
    flex: 1,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
});
