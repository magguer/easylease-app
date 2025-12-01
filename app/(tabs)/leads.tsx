import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import { Users, Phone, Mail, MessageCircle } from '@tamagui/lucide-icons';
import ListHeader from '@/components/ui/ListHeader';
import EmptyState from '@/components/ui/EmptyState';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  listing_id?: {
    _id: string;
    title: string;
    slug: string;
    address: string;
  };
  status: string;
  createdAt: string;
}

export default function LeadsScreen() {
  const { t } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeads = async () => {
    try {
      const response = await api.leads.getAll();
      setLeads(response.data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeads();
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWhatsApp = (phone: string) => {
    Linking.openURL(`whatsapp://send?phone=${phone}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return '#E89E8C';
      case 'contacted':
        return '#4D7EA8';
      case 'qualified':
        return '#9E90A2';
      case 'converted':
        return '#7BA89E';
      default:
        return '#828489';
    }
  };

  const renderLead = ({ item }: { item: Lead }) => (
    <View style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <Text style={styles.leadName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{t(`leads.status.${item.status}`)}</Text>
        </View>
      </View>

      {item.listing_id && (
        <Text style={styles.listingInfo}>
          📍 {item.listing_id.title}
        </Text>
      )}

      {item.message && (
        <Text style={styles.leadMessage} numberOfLines={2}>
          {item.message}
        </Text>
      )}

      <View style={styles.leadActions}>
        {item.phone && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCall(item.phone!)}
            >
              <Phone size={20} color="#4D7EA8" />
              <Text style={styles.actionText}>{t('leads.actions.call')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleWhatsApp(item.phone!)}
            >
              <MessageCircle size={20} color="#7BA89E" />
              <Text style={styles.actionText}>WhatsApp</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEmail(item.email)}
        >
          <Mail size={20} color="#4D7EA8" />
          <Text style={styles.actionText}>{t('leads.actions.email')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D7EA8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ListHeader
        title={t('leads.title')}
        count={leads.length}
        countLabel={leads.length === 1 ? t('leads.count_one') : t('leads.count_other')}
      />

      <FlatList
        data={leads}
        renderItem={renderLead}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4D7EA8" />
        }
        ListEmptyComponent={
          <EmptyState
            icon={Users}
            title={t('leads.noLeads')}
            subtitle={t('common.pullToRefresh')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  list: {
    padding: 16,
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#272932',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listingInfo: {
    fontSize: 13,
    color: '#4D7EA8',
    marginBottom: 8,
    fontWeight: '500',
  },
  leadMessage: {
    fontSize: 14,
    color: '#828489',
    marginBottom: 16,
  },
  leadActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#B6C2D9',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#272932',
  },
});
