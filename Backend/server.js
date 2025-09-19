const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    data_nascimento TEXT
  )
`);

app.post('/users', async (req, res) => {
  try {
    const { nome, nomeCompleto, email, senha, confirmarSenha, dataNascimento, data_nascimento } = req.body;

    const finalNome = nome || nomeCompleto;
    const finalData = dataNascimento || data_nascimento;

    if (!email || !senha || !finalNome) {
      return res.status(400).json({ error: 'missing fields' });
    }

    if (confirmarSenha && senha !== confirmarSenha) {
      return res.status(400).json({ error: 'Senhas não coincidem' });
    }

    const hashed = await bcrypt.hash(senha, 10);

    db.run(
      `INSERT INTO users (nome,email,senha,data_nascimento) VALUES (?,?,?,?)`,
      [finalNome, email, hashed, finalData || null],
      function (err) {
        if (err) {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
        const userId = this.lastID;
        res.status(201).json({ id: userId, nome: finalNome, email, data_nascimento: finalData });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
