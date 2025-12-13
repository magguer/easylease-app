import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { DollarSign, Plus } from '@tamagui/lucide-icons';
import ListHeader from '@/components/ui/ListHeader';
import EmptyState from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { Payment } from '@/types';
import PaymentCard from '@/components/payments/PaymentCard';
import CreatePaymentModal from '@/components/payments/CreatePaymentModal';

export default function PaymentsScreen() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const fetchPayments = async () => {
    try {
      const data = await api.payments.getAll();
      setPayments(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handleCreatePayment = () => {
    Alert.alert('Coming Soon', 'Create Payment Modal will be implemented here.');
    // TODO: Implement Create Payment Modal
  };

  return (
    <View style={styles.container}>
      <ListHeader
        title={t('payments.title')}
        count={payments.length}
        countLabel={payments.length === 1 ? t('payments.count_one') : t('payments.count_other')}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4D7EA8" />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={({ item }) => (
            <PaymentCard payment={item} onPress={(p) => console.log('View Payment', p.id)} />
          )}
          keyExtractor={(item) => item.id || item._id || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <EmptyState
              icon={DollarSign}
              title={t('payments.noPayments')}
              subtitle={t('payments.startByAdding')}
            />
          }
        />
      )}

      {/* FAB for Create Payment */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsCreateModalVisible(true)}>
        <Plus color="white" size={24} />
      </TouchableOpacity>

      <CreatePaymentModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={fetchPayments}
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
    paddingBottom: 80, // Space for FAB
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4D7EA8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
