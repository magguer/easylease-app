import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Document } from '@/types';
import { FileText, Download, Trash2 } from '@tamagui/lucide-icons';
import { format } from 'date-fns';

interface DocumentCardProps {
    document: Document;
    onPress?: (document: Document) => void;
    onDelete?: (document: Document) => void;
}

export default function DocumentCard({ document, onPress, onDelete }: DocumentCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress?.(document)} disabled={!onPress}>
            <View style={styles.iconContainer}>
                <FileText size={24} color="#4D7EA8" />
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{document.title}</Text>
                <Text style={styles.subtitle}>
                    {document.type.toUpperCase()} • {document.createdAt ? format(new Date(document.createdAt), 'dd/MM/yyyy') : '-'}
                </Text>
            </View>

            {onDelete && (
                <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(document)}>
                    <Trash2 size={18} color="#F44336" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#828489',
    },
    deleteButton: {
        padding: 8,
    },
});
