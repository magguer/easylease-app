import { View, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { DollarSign } from '@tamagui/lucide-icons';
import ListHeader from '@/components/ui/ListHeader';
import EmptyState from '@/components/ui/EmptyState';

export default function FinancialScreen() {
  const { t } = useTranslation();
  const transactions: any[] = [];

  return (
    <View style={styles.container}>
      <ListHeader
        title={t('financial.title')}
        count={transactions.length}
        countLabel={transactions.length === 1 ? t('financial.count_one') : t('financial.count_other')}
      />

      <FlatList
        data={transactions}
        renderItem={() => null}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={DollarSign}
            title={t('financial.noTransactions')}
            subtitle={t('financial.comingSoon')}
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
