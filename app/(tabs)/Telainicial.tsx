import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, CheckBox, Input, Overlay, Text } from "react-native-elements";
import { getUserToken } from "../Armazem/userStorage";

const API_URL = 'http://localhost:3000';

interface Tarefa {
  id?: number;
  titulo: string;
  concluida: boolean;
}

interface Lista {
  id: number;
  nome: string;
  descricao?: string;
  tarefas: Tarefa[];
}

export default function ExploreScreen() {
  const router = useRouter();

  const [listas, setListas] = useState<Lista[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeLista, setNomeLista] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tarefaTemp, setTarefaTemp] = useState("");
  const [tarefasTemp, setTarefasTemp] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchListas = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getUserToken();
      if (!token) {
        router.replace("/");
        return;
      }

      const response = await fetch(`${API_URL}/api/lists`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const listasComTarefas = (data as Lista[]).map((lista) => ({
          ...lista,
          tarefas: lista.tarefas || [],
        }));
        setListas(listasComTarefas);
      } else {
        Alert.alert("Erro", (data as { error?: string }).error || "Erro ao carregar listas.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchListas();
    }, [fetchListas])
  );

  const adicionarTarefaTemp = () => {
    if (tarefaTemp.trim()) {
      setTarefasTemp([...tarefasTemp, { titulo: tarefaTemp, concluida: false }]);
      setTarefaTemp("");
    }
  };

  const criarLista = async () => {
    if (!nomeLista.trim()) {
      Alert.alert("Aviso", "O nome da lista é obrigatório.");
      return;
    }

    try {
      const token = await getUserToken();
      if (!token) {
        router.replace("/");
        return;
      }

      const response = await fetch(`${API_URL}/api/lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nomeLista,
          descricao: descricao,
          tarefas: tarefasTemp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", "Lista criada com sucesso!");
        setModalVisible(false);
        setNomeLista("");
        setDescricao("");
        setTarefasTemp([]);
        fetchListas();
      } else {
        Alert.alert("Erro", (data as { error?: string }).error || "Erro ao criar a lista.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  const deletarLista = async (id: number) => {
    try {
      const token = await getUserToken();
      if (!token) {
        router.replace("/");
        return;
      }

      const response = await fetch(`${API_URL}/api/lists/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", "Lista deletada com sucesso!");
        fetchListas();
      } else {
        Alert.alert("Erro", (data as { error?: string }).error || "Erro ao deletar a lista.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  // 🔑 corrigido: salva no banco E recarrega as listas
  const toggleTarefa = async (indexLista: number, indexTarefa: number) => {
    const novasListas = [...listas];
    const tarefa = novasListas[indexLista].tarefas[indexTarefa];
    tarefa.concluida = !tarefa.concluida;
    setListas(novasListas);

    if (!tarefa.id) return;

    try {
      const token = await getUserToken();
      if (!token) {
        router.replace("/");
        return;
      }

      const response = await fetch(`${API_URL}/api/lists/task/${tarefa.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ concluida: tarefa.concluida }),
      });

      if (!response.ok) {
        const data = await response.json();
        Alert.alert("Erro", (data as { error?: string }).error || "Erro ao atualizar tarefa.");
      } else {
        fetchListas(); // força recarregar do banco
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar a tarefa.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a2a66" />
        <Text style={{ marginTop: 10 }}>Carregando listas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={{ flexShrink: 1, paddingRight: 8 }}>Minhas Listas</Text>
        <View style={styles.headerButtons}>
          <Button title="Perfil" onPress={() => router.push("/(tabs)/Perfil")} />
          <Button title="+ Nova Lista" onPress={() => setModalVisible(true)} />
        </View>
      </View>

      <Text style={styles.subtitulo}>
        Organize suas atividades em listas personalizadas
      </Text>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {listas.map((lista, i) => (
          <Card key={lista.id} containerStyle={styles.card}>
            <Card.Title style={styles.cardTitle}>{lista.nome}</Card.Title>
            {lista.descricao && <Text style={styles.cardDescription}>{lista.descricao}</Text>}

            <View style={styles.tarefasContainer}>
              {lista.tarefas.map((tarefa, j) => (
                <CheckBox
                  key={tarefa.id || j}
                  title={tarefa.titulo}
                  checked={tarefa.concluida}
                  onPress={() => toggleTarefa(i, j)}
                  containerStyle={styles.checkboxContainer}
                  textStyle={tarefa.concluida ? styles.tarefaConcluida : null}
                  checkedColor="#4CAF50"
                />
              ))}
            </View>

            <Button
              title="Deletar Lista"
              onPress={() => deletarLista(lista.id)}
              buttonStyle={styles.deleteButton}
            />
          </Card>
        ))}
        {listas.length === 0 && !isLoading && (
          <Text style={styles.noListsText}>Você ainda não tem listas. Crie uma!</Text>
        )}
      </ScrollView>

      <Overlay
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        overlayStyle={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text h4 style={styles.modalTitle}>Nova Lista de Tarefas</Text>
          <Input
            placeholder="Nome da lista"
            value={nomeLista}
            onChangeText={setNomeLista}
            containerStyle={styles.inputContainer}
          />
          <Input
            placeholder="Descrição (opcional)"
            value={descricao}
            onChangeText={setDescricao}
            containerStyle={styles.inputContainer}
          />
          <View style={styles.tarefaInput}>
            <Input
              placeholder="Adicionar tarefa"
              value={tarefaTemp}
              onChangeText={setTarefaTemp}
              onSubmitEditing={adicionarTarefaTemp}
              containerStyle={{ flex: 1 }}
            />
            <Button
              title="+"
              onPress={adicionarTarefaTemp}
              buttonStyle={styles.addButton}
            />
          </View>
          <ScrollView style={styles.tarefasTempList}>
            {tarefasTemp.map((tarefa, index) => (
              <Text key={index} style={styles.tarefaTempItem}>
                - {tarefa.titulo}
              </Text>
            ))}
          </ScrollView>
          <Button
            title="Criar Lista"
            onPress={criarLista}
            buttonStyle={styles.createButton}
          />
        </View>
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardDescription: {
    color: "#555",
    marginBottom: 10,
  },
  tarefasContainer: {
    marginTop: 8,
  },
  checkboxContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    marginLeft: 0,
    paddingLeft: 0,
  },
  tarefaConcluida: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#E53935",
  },
  modal: {
    borderRadius: 10,
    width: "90%",
    padding: 20,
  },
  modalContent: {
    minHeight: 300,
    justifyContent: "space-between",
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 10,
  },
  tarefaInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: "#2196F3",
  },
  tarefasTempList: {
    maxHeight: 100,
  },
  tarefaTempItem: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
  },
  createButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noListsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});
