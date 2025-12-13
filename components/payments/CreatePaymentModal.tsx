import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { X, Check } from '@tamagui/lucide-icons';
import { api } from '@/lib/api';
import { Contract } from '@/types';

interface CreatePaymentModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreatePaymentModal({ visible, onClose, onSuccess }: CreatePaymentModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [fetchingContracts, setFetchingContracts] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('rent');
    const [selectedContractId, setSelectedContractId] = useState('');
    const [description, setDescription] = useState('');

    // Fetch contracts when opening
    useEffect(() => {
        if (visible) {
            fetchContracts();
        }
    }, [visible]);

    const fetchContracts = async () => {
        setFetchingContracts(true);
        try {
            // Get all active contracts to show in dropdown
            const data = await api.contracts.getAll({ status: 'active' });
            setContracts(data);
            if (data.length > 0) {
                setSelectedContractId(data[0]._id || data[0].id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setFetchingContracts(false);
        }
    };

    const handleSubmit = async () => {
        if (!amount || !selectedContractId) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.payments.create({
                amount: parseFloat(amount),
                type,
                contract_id: selectedContractId,
                date: new Date().toISOString(),
                description,
                status: 'paid' // Default to paid for manual entry
            });

            Alert.alert('Success', 'Payment recorded successfully');
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to create payment');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setAmount('');
        setType('rent');
        setDescription('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('payments.createTitle') || 'Record Payment'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {/* Note: In a real app, use a proper Select/Dropdown component */}
                        {fetchingContracts ? (
                            <ActivityIndicator color="#4D7EA8" />
                        ) : contracts.length === 0 ? (
                            <Text style={styles.errorText}>No active contracts found. Please create a contract first.</Text>
                        ) : (
                            <View style={styles.field}>
                                <Text style={styles.label}>Contract</Text>
                                <View style={styles.pickerContainer}>
                                    {/* Mock Dropdown - just showing first one or simplest UI for now */}
                                    <Text style={styles.pickerValue}>
                                        {contracts.find(c => (c._id || c.id) === selectedContractId)?.listing_id?.toString() || 'Select Contract'}
                                    </Text>
                                    {/* If we had more time, we'd implement a full picker here */}
                                </View>
                                <Text style={styles.hint}>Using first active contract for demo</Text>
                            </View>
                        )}

                        <View style={styles.field}>
                            <Text style={styles.label}>Amount ($)</Text>
                            <TextInput
                                style={styles.input}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="0.00"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.row}>
                                {['rent', 'bond', 'bill'].map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeButton, type === t && styles.typeButtonActive]}
                                        onPress={() => setType(t)}
                                    >
                                        <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Notes..."
                                multiline
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Check size={20} color="white" />
                                    <Text style={styles.submitText}>Save Payment</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        paddingBottom: 20, // SafeArea
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    typeButtonActive: {
        backgroundColor: '#E3F2FD',
        borderColor: '#4D7EA8',
    },
    typeText: {
        fontSize: 14,
        color: '#666',
    },
    typeTextActive: {
        color: '#4D7EA8',
        fontWeight: '600',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#FAFAFA',
    },
    pickerValue: {
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    submitButton: {
        backgroundColor: '#4D7EA8',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
