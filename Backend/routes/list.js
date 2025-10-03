const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
const { nome, descricao, tarefas } = req.body;
const userId = req.user.id;

if (!nome || nome.trim() === "") {
 return res.status(400).json({ error: "O nome da lista é obrigatório." });
}

let connection;
try {
 connection = await pool.getConnection();
 await connection.beginTransaction();

 const [listResult] = await connection.query(
 "INSERT INTO lists (user_id, nome, descricao) VALUES (?, ?, ?)",
 [userId, nome, descricao || null]
 );

 const listId = listResult.insertId;

 if (tarefas && Array.isArray(tarefas) && tarefas.length > 0) {
 const taskValues = tarefas.map((t) => [
  listId,
  t.titulo || "",
  t.concluida ? 1 : 0,
 ]);

 await connection.query(
  "INSERT INTO tasks (list_id, title, is_completed) VALUES ?",
  [taskValues]
 );
 }

 const [createdTasks] = await connection.query(
 "SELECT id, title, is_completed FROM tasks WHERE list_id = ?",
 [listId]
 );

 await connection.commit();

 res.status(201).json({
 id: listId,
 nome,
 descricao,
 tarefas: createdTasks.map((t) => ({
  id: t.id,
  titulo: t.title,
  concluida: !!t.is_completed,
 })),
 message: "Lista criada com sucesso!",
 });
} catch (error) {
 if (connection) await connection.rollback();
 console.error("Erro ao criar lista:", error);
 res.status(500).json({ error: "Erro ao criar lista." });
} finally {
 if (connection) connection.release();
}
});

router.get("/", authenticateToken, async (req, res) => {
const userId = req.user.id;

try {
 const [rawLists] = await pool.query(
 "SELECT id, nome, descricao FROM lists WHERE user_id = ? ORDER BY created_at DESC",
 [userId]
 );

 if (rawLists.length === 0) {
 return res.json([]);
 }

 const listIds = rawLists.map((l) => l.id);
 const [tasks] = await pool.query(
 "SELECT id, list_id, title, is_completed FROM tasks WHERE list_id IN (?)",
 [listIds.length ? listIds : [0]]
 );

 const listsMap = rawLists.reduce((acc, list) => {
 acc[list.id] = {
  id: list.id,
  nome: list.nome,
  descricao: list.descricao,
  tarefas: [],
 };
 return acc;
 }, {});

 tasks.forEach((task) => {
 if (listsMap[task.list_id]) {
  listsMap[task.list_id].tarefas.push({
  id: task.id,
  titulo: task.title,
  concluida: !!task.is_completed,
  });
 }
 });

 res.json(Object.values(listsMap));
} catch (error) {
 console.error("Erro ao buscar listas:", error);
 res.status(500).json({ error: "Erro ao buscar listas." });
}
});

router.put("/:id", authenticateToken, async (req, res) => {
const { id } = req.params;
const { nome, descricao, tarefas } = req.body; 
const userId = req.user.id;

let connection;
try {
 connection = await pool.getConnection();
 await connection.beginTransaction();

 const nomeUpdate = nome || null;
 const descricaoUpdate = descricao || null;
    
 const [result] = await connection.query(
 "UPDATE lists SET nome = ?, descricao = ? WHERE id = ? AND user_id = ?",
 [nomeUpdate, descricaoUpdate, id, userId]
 );

 if (result.affectedRows === 0) {
 await connection.rollback();
 return res.status(404).json({ error: "Lista não encontrada ou sem permissão para editar." });
 }

 if (tarefas && Array.isArray(tarefas)) {
 await connection.query("DELETE FROM tasks WHERE list_id = ?", [id]);

 if (tarefas.length > 0) {
  const taskValues = tarefas.map((t) => [
  id,
  t.titulo || "",
  t.concluida ? 1 : 0,
  ]);
  await connection.query(
  "INSERT INTO tasks (list_id, title, is_completed) VALUES ?",
  [taskValues]
  );
 }
 }

 await connection.commit();
 res.json({ message: "Lista e tarefas atualizadas com sucesso!" });
} catch (error) {
 if (connection) await connection.rollback();
 console.error("Erro ao atualizar lista:", error);
 res.status(500).json({ error: "Erro ao atualizar lista." });
} finally {
 if (connection) connection.release();
}
});

router.put("/task/:id", authenticateToken, async (req, res) => {
const taskId = req.params.id;
const { concluida } = req.body;
const value = concluida ? 1 : 0;

try {
 const [result] = await pool.query(
 "UPDATE tasks SET is_completed = ? WHERE id = ?",
 [value, taskId]
 );

 if (result.affectedRows === 0) {
 return res.status(404).json({ error: "Tarefa não encontrada." });
 }

 res.json({ message: "Tarefa atualizada com sucesso." });
} catch (error) {
 console.error("Erro ao atualizar tarefa:", error);
 res.status(500).json({ error: "Erro ao atualizar tarefa." });
}
});

router.delete("/:id", authenticateToken, async (req, res) => {
const listId = req.params.id;
const userId = req.user.id;

let connection;
try {
connection = await pool.getConnection();
await connection.beginTransaction();

await connection.query("DELETE FROM tasks WHERE list_id = ?", [listId]);

const [result] = await connection.query(
"DELETE FROM lists WHERE id = ? AND user_id = ?",
[listId, userId]
);

await connection.commit();

if (result.affectedRows === 0) {
return res.status(404).json({ error: "Lista não encontrada." });
}

res.json({ message: "Lista deletada com sucesso!" });
} catch (error) {
if (connection) await connection.rollback();
console.error("Erro ao deletar lista:", error);
res.status(500).json({ error: "Erro ao deletar lista." });
} finally {
if (connection) connection.release();
}
});

module.exports = router;