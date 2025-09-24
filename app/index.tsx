import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { saveUserToken } from './Armazem/userStorage';

const API_URL = 'http://localhost:3000'; 

export default function IndexScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    senha,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                await saveUserToken(data.token);

                Alert.alert('Sucesso', 'Login realizado com sucesso!');
                router.replace("/(tabs)/Telainicial");
            } else {
                Alert.alert('Erro', data.error || 'Credenciais inválidas!');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão e a URL da API.');
        }
    };

    const handleNavigateToRegister = () => {
        router.push('/Registro');
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Entrar</Text>
                <Text style={styles.subtitle}>Digite suas credenciais para acessar sua conta</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Senha</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite sua senha"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>

                <Text style={styles.registerText}>
                    Não tem uma conta?{' '}
                    <Text style={styles.registerLink} onPress={handleNavigateToRegister}>
                        Cadastre-se
                    </Text>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f7f7f7',
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#0a2a66',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    registerText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#444',
    },
    registerLink: {
        color: '#0a2a66',
        fontWeight: '600',
    },
});