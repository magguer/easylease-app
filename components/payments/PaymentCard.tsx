import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Payment } from '@/types';
import { DollarSign, Calendar, FileText, ArrowUpRight, ArrowDownLeft } from '@tamagui/lucide-icons';
import { format } from 'date-fns';

interface PaymentCardProps {
    payment: Payment;
    onPress?: (payment: Payment) => void;
}

export default function PaymentCard({ payment, onPress }: PaymentCardProps) {
    const isIncome = payment.type === 'rent' || payment.type === 'bond';
    const statusColor =
        payment.status === 'paid' ? '#4CAF50' :
            payment.status === 'pending' ? '#FFC107' :
                payment.status === 'overdue' ? '#F44336' : '#9E9E9E';

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress?.(payment)} disabled={!onPress}>
            <View style={styles.header}>
                <View style={styles.typeContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#E8F5E9' : '#FFEBEE' }]}>
                        {isIncome ? <ArrowDownLeft size={20} color="#2E7D32" /> : <ArrowUpRight size={20} color="#C62828" />}
                    </View>
                    <View>
                        <Text style={styles.typeText}>{payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}</Text>
                        <Text style={styles.dateText}>{format(new Date(payment.date), 'MMM dd, yyyy')}</Text>
                    </View>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={[styles.amountText, { color: isIncome ? '#2E7D32' : '#C62828' }]}>
                        {isIncome ? '+' : '-'}${payment.amount.toFixed(2)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {payment.status.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>

            {payment.description && (
                <View style={styles.footer}>
                    <Text style={styles.description} numberOfLines={1}>{payment.description}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    dateText: {
        fontSize: 14,
        color: '#828489',
        marginTop: 2,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    footer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    description: {
        fontSize: 14,
        color: '#555',
    },
});
