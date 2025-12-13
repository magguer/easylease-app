import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { getUser } from '@/lib/auth';
import { User, Mail, Phone, Save, ArrowLeft } from '@tamagui/lucide-icons';
import { User as UserType } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditUserScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await getUser();
        if (userData) {
            setUser(userData);
            setName(userData.name);
            setEmail(userData.email);
            setPhone(userData.phone || '');
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!name || !email) {
            Alert.alert('Error', t('errors.required'));
            return;
        }

        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            setSaving(false);
            Alert.alert(
                t('common.success'),
                'Profile updated successfully',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }, 1500);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4D7EA8" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.title}>{t('settings.profile')}</Text>
                {/* Using settings.profile as title for Edit Profile too, or could add new key */}
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('partners.form.name')}</Text>
                    <View style={styles.inputContainer}>
                        <User size={20} color="#828489" />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Full Name"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('partners.form.email')}</Text>
                    <View style={styles.inputContainer}>
                        <Mail size={20} color="#828489" />
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="Email"
                            editable={false}
                            style={[styles.input, { color: '#999' }]}
                        />
                    </View>
                    <Text style={styles.helperText}>Email cannot be changed directly.</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('partners.form.phone')}</Text>
                    <View style={styles.inputContainer}>
                        <Phone size={20} color="#828489" />
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder="Phone"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Save size={20} color="white" />
                            <Text style={styles.saveText}>{t('common.save')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    form: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
        height: '100%',
    },
    helperText: {
        fontSize: 12,
        color: '#828489',
        marginTop: 4,
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: '#4D7EA8',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 20,
        elevation: 2,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
