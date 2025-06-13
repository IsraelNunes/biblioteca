const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (pool) => {

  router.post('/register', async (req, res) => {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (!['bibliotecario', 'leitor'].includes(perfil)) {
      return res.status(400).json({ message: 'Perfil inválido. Deve ser "bibliotecario" ou "leitor".' });
    }

    try {
      const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(409).json({ message: 'Este email já está cadastrado.' });
      }

      const hashedPassword = await bcrypt.hash(senha, 10);

      const [result] = await pool.query(
        'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
        [nome, email, hashedPassword, perfil]
      );

      res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: result.insertId });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ message: 'Erro ao registrar usuário.', error: error.message });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
      const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      const user = users[0];

      if (!user) {
        return res.status(401).json({ message: 'Email ou senha inválidos.' });
      }

      const isMatch = await bcrypt.compare(senha, user.senha);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email ou senha inválidos.' });
      }

      const token = jwt.sign(
        { id: user.id, perfil: user.perfil },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login bem-sucedido!',
        token,
        perfil: user.perfil,
        userId: user.id,
        nome: user.nome
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro ao fazer login.', error: error.message });
    }
  });

  return router;
};