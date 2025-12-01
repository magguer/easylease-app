import { View, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { Wrench } from '@tamagui/lucide-icons';
import ListHeader from '@/components/ui/ListHeader';
import EmptyState from '@/components/ui/EmptyState';

export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const requests: any[] = [];

  return (
    <View style={styles.container}>
      <ListHeader
        title={t('maintenance.title')}
        count={requests.length}
        countLabel={requests.length === 1 ? t('maintenance.count_one') : t('maintenance.count_other')}
        buttonText={t('maintenance.createRequest')}
        onButtonPress={() => {}}
      />

      <FlatList
        data={requests}
        renderItem={() => null}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={Wrench}
            title={t('maintenance.noRequests')}
            subtitle={t('maintenance.comingSoon')}
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
