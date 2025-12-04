import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

interface StatusBadgeProps {
  status: string;
  type: 'listing' | 'tenant' | 'lead' | 'contract';
  label?: string;
  style?: ViewStyle;
}

export default function StatusBadge({ status, type, label, style }: StatusBadgeProps) {
  const { t } = useTranslation();
  const getStatusColor = () => {
    if (type === 'listing') {
      switch (status) {
        case 'available':
          return '#22C55E';
        case 'published':
          return '#22C55E';
        case 'draft':
          return '#94A3B8';
        case 'reserved':
          return '#F97316';
        case 'rented':
          return '#8B5CF6';
        default:
          return '#94A3B8';
      }
    } else if (type === 'tenant') {
      switch (status) {
        case 'active':
          return '#22C55E';
        case 'ending_soon':
          return '#F97316';
        case 'ended':
          return '#94A3B8';
        default:
          return '#94A3B8';
      }
    } else if (type === 'contract') {
      switch (status) {
        case 'draft':
          return '#94A3B8';
        case 'available':
          return '#3B82F6';
        case 'active':
          return '#22C55E';
        case 'ending_soon':
          return '#F97316';
        case 'ended':
          return '#64748B';
        case 'terminated':
          return '#EF4444';
        default:
          return '#94A3B8';
      }
    } else if (type === 'lead') {
      switch (status) {
        case 'new':
          return '#3B82F6';
        case 'contacted':
          return '#F59E0B';
        case 'qualified':
          return '#10B981';
        case 'converted':
          return '#8B5CF6';
        case 'lost':
          return '#EF4444';
        default:
          return '#94A3B8';
      }
    }
    return '#94A3B8';
  };

  const getStatusLabel = () => {
    if (label) return label;
    
    if (type === 'listing') {
      const statusMap: Record<string, string> = {
        'available': 'Disponible',
        'published': t('listings.status.published') || 'Published',
        'draft': t('listings.status.draft') || 'Draft',
        'reserved': t('listings.status.reserved') || 'Reserved',
        'rented': t('listings.status.rented') || 'Rented',
      };
      return statusMap[status] || status;
    } else if (type === 'tenant') {
      const statusMap: Record<string, string> = {
        'active': t('tenants.status.active') || 'Active',
        'ending_soon': t('tenants.status.ending_soon') || 'Ending Soon',
        'ended': t('tenants.status.ended') || 'Ended',
      };
      return statusMap[status] || status;
    } else if (type === 'contract') {
      const statusMap: Record<string, string> = {
        'draft': 'Borrador',
        'available': 'Disponible',
        'active': 'Activo',
        'ending_soon': 'Por Vencer',
        'ended': 'Finalizado',
        'terminated': 'Terminado',
      };
      return statusMap[status] || status;
    } else if (type === 'lead') {
      const statusMap: Record<string, string> = {
        'new': t('leads.status.new') || 'New',
        'contacted': t('leads.status.contacted') || 'Contacted',
        'qualified': t('leads.status.qualified') || 'Qualified',
        'converted': t('leads.status.converted') || 'Converted',
        'lost': t('leads.status.lost') || 'Lost',
      };
      return statusMap[status] || status;
    }
    return status;
  };

  const color = getStatusColor();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + '20' },
        style,
      ]}
    >
      <Text style={[styles.text, { color }]}>
        {getStatusLabel()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
