const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  console.log('Requisição recebida na rota /api/users/register.');
  console.log('Corpo da requisição:', req.body);

  try {
    const { nome, email, senha } = req.body;
    console.log('Dados recebidos:', { nome, email, senha });

    if (!nome || !email || !senha) {
      console.log('Erro: Preencha todos os campos. Dados recebidos:', req.body);
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    const [userExists] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (userExists.length > 0) {
      console.log('Erro: Email já cadastrado:', email);
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    console.log('Senha criptografada com sucesso.');

    await pool.query(
      "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, hashedPassword]
    );

    console.log('Usuário registrado com sucesso.');
    res.json({ message: "Usuário registrado com sucesso" });
  } catch (err) {
    console.log('Erro no servidor:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log('Tentativa de login para o email:', email);

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      console.log('Login falhou: Usuário não encontrado.');
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(senha, user.senha);

    if (!match) {
      console.log('Login falhou: Senha incorreta.');
      return res.status(400).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    console.log('Login bem-sucedido. Token gerado.');
    res.json({ message: "Login bem-sucedido", token, user });
  } catch (err) {
    console.log('Erro no servidor:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log('Requisição para /me. ID do usuário:', req.user.id);
    const [rows] = await pool.query("SELECT id, nome, email FROM users WHERE id = ?", [
      req.user.id,
    ]);

    if (rows.length === 0) {
      console.log('Erro: Usuário não encontrado para o token.');
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    console.log('Dados do usuário encontrados.');
    res.json(rows[0]);
  } catch (err) {
    console.log('Erro no servidor:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
    const { nome, email, senha } = req.body;
    const { id: userId } = req.user;

    if (!nome && !email && !senha) {
        return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
    }

    try {
        const updateFields = [];
        const updateValues = [];

        if (nome) {
            updateFields.push('nome = ?');
            updateValues.push(nome);
        }
        
        if (email) {
            const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (existingEmail.length > 0) {
                return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
            }
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        
        if (senha) {
            const hashedPassword = await bcrypt.hash(senha, 10);
            updateFields.push('senha = ?');
            updateValues.push(hashedPassword);
        }

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(userId);

        await pool.query(updateQuery, updateValues);
        
        res.status(200).json({ message: 'Perfil atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar o perfil:', error);
        res.status(500).json({ message: 'Erro ao atualizar o perfil.' });
    }
});

module.exports = router;