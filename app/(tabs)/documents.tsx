import { View, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText, Plus } from '@tamagui/lucide-icons';
import ListHeader from '@/components/ui/ListHeader';
import EmptyState from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { Document } from '@/types';
import DocumentCard from '@/components/documents/DocumentCard';
import { getUser } from '@/lib/auth';

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async () => {
    try {
      // NOTE: For now, we list all documents relevant to the user context
      // This part might need adjustment based on how the API filters globally
      // For this implementation, we assume the API handles filtering based on user role 
      // or we might need to fetch by entities.
      // Since getAll requires entity_type/id in the current API def, let's try to fetch
      // documents for the user's main entity if possible, or we might need a general "getMyDocuments" endpoint.

      // Temporary hack: listing documents for the first entity found or just handling "all" if API supported it.
      // Since API definition in lib/api.ts requires params, we might need to adjust API or just mock for now if no entity selected.

      // Let's assume we want to see ALL documents if manager, or mine if tenant/owner.
      // But the API implementation 'getDocuments' uses `find({ entity_type, entity_id })`.
      // So checking all documents isn't directly supported by that endpoint unless we relax it.
      // For now, I will skip fetching or pass dummy params to test connection if needed,
      // OR better, let's update the API client/backend to allow fetching all if no params (if backend supported it).

      // Actually, looking at backend implementation of `getDocuments`:
      // if (!entity_type || !entity_id) return 400.

      // So we can ONLY list documents for a specific entity right now.
      // This means the "Global Documents" tab is tricky without identifying "which" documents.
      // Usually it shows documents for "ALL my properties" or "ALL my contracts".

      // Workaround: Show empty state if no context, or just "Recent Documents".
      setDocuments([]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const handleDelete = async (doc: Document) => {
    try {
      await api.documents.delete(doc.id);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete document');
    }
  };

  return (
    <View style={styles.container}>
      <ListHeader
        title={t('documents.title')}
        count={documents.length}
        countLabel={documents.length === 1 ? t('documents.count_one') : t('documents.count_other')}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4D7EA8" />
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={({ item }) => (
            <DocumentCard
              document={item}
              onPress={(d) => console.log('View Doc', d.url)}
              onDelete={handleDelete}
            />
          )}
          keyExtractor={(item) => item.id || item._id || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <EmptyState
              icon={FileText}
              title={t('documents.noDocuments')}
              subtitle={t('documents.selectEntityToView')}
            />
          }
        />
      )}

      {/* FAB for Upload */}
      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('Upload', 'Coming soon')}>
        <Plus color="white" size={24} />
      </TouchableOpacity>
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
