import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Card, Input, Text } from "react-native-elements";

export default function PerfilScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("Luis Victor");
  const [email, setEmail] = useState("Luis.victor@email.com");
  const [senha, setSenha] = useState("********");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");

  const [campoEditando, setCampoEditando] = useState<null | "email" | "senha" | "nome">(null);
  const [novoValor, setNovoValor] = useState("");

  const handleSalvar = () => {
    if (campoEditando && senhaConfirmacao.trim() === "") {
      Alert.alert("Confirme sua senha", "Digite sua senha para confirmar a alteração.");
      return;
    }

    if (campoEditando === "email") setEmail(novoValor);
    if (campoEditando === "senha") setSenha(novoValor);
    if (campoEditando === "nome") setNome(novoValor);

    setCampoEditando(null);
    setSenhaConfirmacao("");
    setNovoValor("");
    Alert.alert("Sucesso", "Informações atualizadas!");
  };

  const handleLogout = () => {
    router.replace("/");
  };

  const handleGoBackToHome = () => {
    router.replace('/Telainicial');
  };

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
                onPress={() => setCampoEditando(null)}
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
});
