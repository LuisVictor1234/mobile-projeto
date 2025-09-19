const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { nome, nomeCompleto, email, senha, confirmarSenha, dataNascimento, data_nascimento } = req.body;
    const finalNome = nome || nomeCompleto;
    const finalData = dataNascimento || data_nascimento;

    if (!finalNome || !email || !senha) return res.status(400).json({ error: 'missing fields' });
    if (confirmarSenha && senha !== confirmarSenha) return res.status(400).json({ error: 'Senhas não coincidem' });

    const hashed = await bcrypt.hash(senha, 10);
    db.run(
      `INSERT INTO users (nome,email,senha,data_nascimento) VALUES (?,?,?,?)`,
      [finalNome, email, hashed, finalData || null],
      function (err) {
        if (err) return res.status(400).json({ error: 'Email já cadastrado' });
        const userId = this.lastID;
        res.status(201).json({ id: userId, nome: finalNome, email, data_nascimento: finalData });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const userId = req.user.id;
  db.get(`SELECT id, nome, email, data_nascimento FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

router.put('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { nome, nomeCompleto, email, newPassword, currentPassword, dataNascimento, data_nascimento } = req.body;
  const finalNome = nome || nomeCompleto;
  const finalData = dataNascimento || data_nascimento;

  db.get(`SELECT * FROM users WHERE id = ?`, [id], async (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Not found' });

    if ((newPassword || (email && email !== user.email)) && !currentPassword) {
      return res.status(400).json({ error: 'Confirme sua senha atual' });
    }

    if (currentPassword) {
      const ok = await bcrypt.compare(currentPassword, user.senha);
      if (!ok) return res.status(401).json({ error: 'Senha atual inválida' });
    }

    const senhaFinal = newPassword ? await bcrypt.hash(newPassword, 10) : user.senha;
    const nomeFinal = finalNome ?? user.nome;
    const emailFinal = email ?? user.email;
    const dnFinal = finalData ?? user.data_nascimento;

    db.run(
      `UPDATE users SET nome = ?, email = ?, senha = ?, data_nascimento = ? WHERE id = ?`,
      [nomeFinal, emailFinal, senhaFinal, dnFinal, id],
      function (err2) {
        if (err2) return res.status(500).json({ error: 'Update failed' });
        res.json({ id, nome: nomeFinal, email: emailFinal, data_nascimento: dnFinal });
      }
    );
  });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ success: true });
  });
});

module.exports = router;
