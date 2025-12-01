import { View, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText } from '@tamagui/lucide-icons';
import ListHeader from '@/components/ui/ListHeader';
import EmptyState from '@/components/ui/EmptyState';

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const documents: any[] = [];

  return (
    <View style={styles.container}>
      <ListHeader
        title={t('documents.title')}
        count={documents.length}
        countLabel={documents.length === 1 ? t('documents.count_one') : t('documents.count_other')}
      />

      <FlatList
        data={documents}
        renderItem={() => null}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={FileText}
            title={t('documents.noDocuments')}
            subtitle={t('documents.comingSoon')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  list: {
    padding: 16,
  },
});
