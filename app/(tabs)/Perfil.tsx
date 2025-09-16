import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Card, Input, Text } from "react-native-elements";

export default function PerfilScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("Luis Victor");
  const [dataNascimento, setDataNascimento] = useState("14/05/1990");
  const [email, setEmail] = useState("Luis.victor@email.com");
  const [senha, setSenha] = useState("********");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");

  const handleSalvar = () => {
    if (
      senhaConfirmacao === "" &&
      (email !== "Luis.victor@email.com" || senha !== "********")
    ) {
      Alert.alert(
        "Confirme sua senha",
        "É necessário confirmar sua senha para salvar alterações."
      );
      return;
    }

    Alert.alert("Sucesso", "Informações atualizadas!");
    setSenhaConfirmacao("");
  };

  const handleLogout = () => {
    router.replace("/");
  };
  
  const handleGoBackToHome = () => {
      router.replace('/Telainicial');
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={handleGoBackToHome}>
          <Ionicons name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <Text h4 style={{ marginBottom: 10 }}>Meu Perfil</Text>

      <Card containerStyle={styles.card}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Avatar
            size="large"
            rounded
            source={{ uri: "https://via.placeholder.com/150" }}
          />
          <Text style={{ marginTop: 10 }}>{nome}</Text>
          <Text style={{ color: "gray" }}>Membro desde 2024</Text>
        </View>

        <Input
          label="Data de Nascimento"
          value={dataNascimento}
          onChangeText={setDataNascimento}
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          rightIcon={{ name: "edit", color: "gray" }}
        />

        <Input
          label="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          rightIcon={{ name: "edit", color: "gray" }}
        />

        <Input
          label="Confirme sua senha"
          secureTextEntry
          value={senhaConfirmacao}
          onChangeText={setSenhaConfirmacao}
        />

        <Button
          title="Salvar Alterações"
          onPress={handleSalvar}
          containerStyle={{ marginBottom: 10 }}
          buttonStyle={{ backgroundColor: "#2196F3", borderRadius: 10 }}
        />
        <Button
          title="Logout"
          onPress={handleLogout}
          buttonStyle={{ backgroundColor: "red", borderRadius: 10 }}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  backButtonContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1,
  },
  card: {
    borderRadius: 10,
    padding: 20,
  },
});