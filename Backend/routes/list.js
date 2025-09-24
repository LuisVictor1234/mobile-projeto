const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { nome, descricao } = req.body;
    const { id: userId } = req.user;

    if (!nome) {
        return res.status(400).json({ error: 'O nome da lista é obrigatório.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO lists (user_id, nome, descricao) VALUES (?, ?, ?)',
            [userId, nome, descricao]
        );
        res.status(201).json({ id: result.insertId, message: 'Lista criada com sucesso.' });
    } catch (error) {
        console.error('Erro ao criar a lista:', error);
        res.status(500).json({ error: 'Erro ao criar a lista.' });
    }
});

router.get('/', async (req, res) => {
    const { id: userId } = req.user;
    try {
        const [lists] = await pool.query('SELECT id, nome, descricao FROM lists WHERE user_id = ?', [userId]);
        res.json(lists);
    } catch (error) {
        console.error('Erro ao buscar as listas:', error);
        res.status(500).json({ error: 'Erro ao buscar as listas.' });
    }
});

module.exports = router;