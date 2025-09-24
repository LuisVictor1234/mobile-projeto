import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Card, Input, Text } from "react-native-elements";
import { getUserToken, removeUserToken } from "../Armazem/userStorage";

// URL base do seu servidor backend
const API_URL = 'http://localhost:3000'; 

export default function PerfilScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [campoEditando, setCampoEditando] = useState<null | "email" | "senha" | "nome">(null);
  const [novoValor, setNovoValor] = useState("");

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getUserToken();
      if (!token) {
        router.replace("/");
        return;
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setNome(data.nome);
        setEmail(data.email);
        setSenha("********"); 
      } else {
        Alert.alert("Erro", data.error || "Não foi possível carregar os dados do usuário.");
        router.replace("/");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
      router.replace("/");
    } finally {
      setIsLoading(false);
    }
  }, []);
useFocusEffect(
  useCallback(() => {
    fetchUserData();
  }, [])
);

  const handleSalvar = async () => {
    if (campoEditando === "senha" && novoValor !== senhaConfirmacao) {
      Alert.alert("Erro", "As novas senhas não coincidem.");
      return;
    }

    if (!senhaConfirmacao.trim()) {
      Alert.alert("Confirme sua senha", "Digite sua senha atual para confirmar a alteração.");
      return;
    }

    try {
      const token = await getUserToken();
      if (!token) {
        router.replace("/");
        return;
      }
      
      const updateData: { [key: string]: string } = {
        current_password: senhaConfirmacao,
      };
      
      if (campoEditando === "nome") {
        updateData.nome = novoValor;
      } else if (campoEditando === "email") {
        updateData.email = novoValor;
      } else if (campoEditando === "senha") {
        updateData.new_password = novoValor;
      }
      
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert("Sucesso", "Informações atualizadas!");
        setCampoEditando(null);
        setNovoValor("");
        setSenhaConfirmacao("");
        fetchUserData(); 
      } else {
        Alert.alert("Erro", data.error || "Erro ao atualizar informações.");
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  const handleLogout = async () => {
    await removeUserToken();
    router.replace("/");
  };

  const handleGoBackToHome = () => {
    router.replace('/Telainicial');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a2a66" />
        <Text style={{ marginTop: 10 }}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBackToHome}>
        <Ionicons name="arrow-back-circle" size={36} color="#0a2a66" />
      </TouchableOpacity>

      <Text h4 style={{ marginBottom: 10, textAlign: "center" }}>Meu Perfil</Text>

      <Card containerStyle={styles.card}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Avatar
            size="large"
            rounded
            source={{ uri: "https://via.placeholder.com/150" }}
          />
          <Text style={{ marginTop: 10, fontWeight: "600", fontSize: 16 }}>{nome}</Text>
          <Text style={{ color: "gray" }}>Membro desde 2024</Text>
        </View>

        <Input
          label="Email"
          value={email}
          editable={false}
          rightIcon={
            <Ionicons name="pencil" size={20} color="gray" onPress={() => setCampoEditando("email")} />
          }
        />

        <Input
          label="Senha"
          value={senha}
          secureTextEntry
          editable={false}
          rightIcon={
            <Ionicons name="pencil" size={20} color="gray" onPress={() => setCampoEditando("senha")} />
          }
        />

        <Button
          title="Logout"
          onPress={handleLogout}
          buttonStyle={{ backgroundColor: "red", borderRadius: 10 }}
        />
      </Card>

      <Modal visible={campoEditando !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text h4 style={{ marginBottom: 10 }}>Editar {campoEditando}</Text>

            <Input
              placeholder={`Novo ${campoEditando}`}
              value={novoValor}
              onChangeText={setNovoValor}
              secureTextEntry={campoEditando === "senha"}
            />

            <Input
              placeholder="Confirme sua senha atual"
              value={senhaConfirmacao}
              onChangeText={setSenhaConfirmacao}
              secureTextEntry
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Button
                title="Cancelar"
                type="outline"
                onPress={() => {
                  setCampoEditando(null);
                  setNovoValor("");
                  setSenhaConfirmacao("");
                }}
                containerStyle={{ flex: 1, marginRight: 5 }}
              />
              <Button
                title="Salvar"
                onPress={handleSalvar}
                containerStyle={{ flex: 1, marginLeft: 5 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 1,
  },
  card: {
    borderRadius: 10,
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});