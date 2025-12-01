import { View, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { DollarSign } from '@tamagui/lucide-icons';
import ListHeader from '@/components/ui/ListHeader';
import EmptyState from '@/components/ui/EmptyState';

export default function PaymentsScreen() {
  const { t } = useTranslation();
  const payments: any[] = [];

  return (
    <View style={styles.container}>
      <ListHeader
        title={t('payments.title')}
        count={payments.length}
        countLabel={payments.length === 1 ? t('payments.count_one') : t('payments.count_other')}
      />

      <FlatList
        data={payments}
        renderItem={() => null}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={DollarSign}
            title={t('payments.noPayments')}
            subtitle={t('payments.comingSoon')}
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
