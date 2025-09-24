import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_TOKEN_KEY = 'userToken';

export const saveUserToken = async (token: string) => {
    try {
        await AsyncStorage.setItem(USER_TOKEN_KEY, token);
    } catch (error) {
        console.error('Erro ao salvar o token:', error);
    }
};

export const getUserToken = async () => {
    try {
        const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
        return token;
    } catch (error) {
        console.error('Erro ao buscar o token:', error);
        return null;
    }
};

export const removeUserToken = async () => {
    try {
        await AsyncStorage.removeItem(USER_TOKEN_KEY);
    } catch (error) {
        console.error('Erro ao remover o token:', error);
    }
};