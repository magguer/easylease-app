import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import { UserSquare2, Mail, Phone } from '@tamagui/lucide-icons';

interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: string;
  listingsCount?: number;
}

export default function PartnersScreen() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPartners = async () => {
    try {
      const data = await api.partners.getAll();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPartners();
  };

  const renderPartner = ({ item }: { item: Partner }) => (
    <TouchableOpacity style={styles.partnerCard}>
      <View style={styles.partnerHeader}>
        <View style={styles.avatarContainer}>
          <UserSquare2 size={32} color="#7BA89E" />
        </View>
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerName}>{item.name}</Text>
          {item.company && (
            <Text style={styles.companyName}>{item.company}</Text>
          )}
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.status === 'active' ? '#7BA89E' : '#828489' },
          ]}
        />
      </View>

      <View style={styles.partnerDetails}>
        <View style={styles.detailRow}>
          <Mail size={16} color="#828489" />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Phone size={16} color="#828489" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
      </View>

      {item.listingsCount !== undefined && (
        <View style={styles.partnerFooter}>
          <Text style={styles.footerText}>
            {item.listingsCount} {t('partners.fields.listings').toLowerCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.title}>{t('partners.title')}</Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>{t('partners.createPartner')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={partners}
        renderItem={renderPartner}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4D7EA8" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UserSquare2 size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>{t('partners.noPartners')}</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#272932',
  },
  createButton: {
    backgroundColor: '#7BA89E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  partnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F1EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#272932',
  },
  companyName: {
    fontSize: 14,
    color: '#828489',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  partnerDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#828489',
  },
  partnerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#828489',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#828489',
    marginTop: 16,
  },
});
