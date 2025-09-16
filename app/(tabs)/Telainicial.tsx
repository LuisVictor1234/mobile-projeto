import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, CheckBox, Input, Overlay, Text } from "react-native-elements";

interface Tarefa {
  titulo: string;
  concluida: boolean;
}

interface Lista {
  nome: string;
  descricao?: string;
  tarefas: Tarefa[];
}

export default function ExploreScreen() {
  const router = useRouter();

  const [listas, setListas] = useState<Lista[]>([
    {
      nome: "Tarefas da Semana",
      descricao: "Principais atividades para esta semana",
      tarefas: [
        { titulo: "Fazer compras no supermercado", concluida: false },
        { titulo: "Agendar consulta médica", concluida: true },
        { titulo: "Estudar React", concluida: false },
      ],
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [nomeLista, setNomeLista] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tarefaTemp, setTarefaTemp] = useState("");
  const [tarefasTemp, setTarefasTemp] = useState<Tarefa[]>([]);

  const adicionarTarefaTemp = () => {
    if (tarefaTemp.trim()) {
      setTarefasTemp([...tarefasTemp, { titulo: tarefaTemp, concluida: false }]);
      setTarefaTemp("");
    }
  };

  const criarLista = () => {
    if (!nomeLista.trim()) return;

    const novaLista: Lista = {
      nome: nomeLista,
      descricao,
      tarefas: tarefasTemp,
    };

    setListas([...listas, novaLista]);
    setModalVisible(false);
    setNomeLista("");
    setDescricao("");
    setTarefasTemp([]);
  };

  const toggleTarefa = (indexLista: number, indexTarefa: number) => {
    const novasListas = [...listas];
    novasListas[indexLista].tarefas[indexTarefa].concluida =
      !novasListas[indexLista].tarefas[indexTarefa].concluida;
    setListas(novasListas);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4>Minhas Listas de Tarefas</Text>
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
          <Card key={i} containerStyle={styles.card}>
            <Card.Title style={styles.cardTitle}>{lista.nome}</Card.Title>
            {lista.descricao && <Text style={styles.cardDescription}>{lista.descricao}</Text>}
            <View style={styles.tarefasContainer}>
              {lista.tarefas.map((tarefa, j) => (
                <CheckBox
                  key={j}
                  title={tarefa.titulo}
                  checked={tarefa.concluida}
                  onPress={() => toggleTarefa(i, j)}
                  containerStyle={styles.checkboxContainer}
                  textStyle={tarefa.concluida ? styles.tarefaConcluida : null}
                  checkedColor="#4CAF50"
                />
              ))}
            </View>
          </Card>
        ))}
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
              title="Adicionar"
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
});