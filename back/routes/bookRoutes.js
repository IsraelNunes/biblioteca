const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

module.exports = (pool) => {

  router.get('/', authenticateToken, async (req, res) => {
    try {
      const [books] = await pool.query('SELECT * FROM livros');
      res.status(200).json(books);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      res.status(500).json({ message: 'Erro ao buscar livros.', error: error.message });
    }
  });

  router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const [book] = await pool.query('SELECT * FROM livros WHERE id = ?', [id]);
      if (book.length === 0) {
        return res.status(404).json({ message: 'Livro não encontrado.' });
      }
      res.status(200).json(book[0]);
    } catch (error) {
      console.error('Erro ao buscar livro por ID:', error);
      res.status(500).json({ message: 'Erro ao buscar livro.', error: error.message });
    }
  });

  router.post('/', authenticateToken, authorizeRoles(['bibliotecario']), async (req, res) => {
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    if (!titulo || !autor || quantidade_disponivel === undefined || quantidade_disponivel < 0) {
      return res.status(400).json({ message: 'Título, autor e quantidade disponível são obrigatórios.' });
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)',
        [titulo, autor, ano_publicacao, quantidade_disponivel]
      );
      res.status(201).json({ message: 'Livro adicionado com sucesso!', bookId: result.insertId });
    } catch (error) {
      console.error('Erro ao adicionar livro:', error);
      res.status(500).json({ message: 'Erro ao adicionar livro.', error: error.message });
    }
  });

  router.put('/:id', authenticateToken, authorizeRoles(['bibliotecario']), async (req, res) => {
    const { id } = req.params;
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    if (!titulo || !autor || quantidade_disponivel === undefined || quantidade_disponivel < 0) {
      return res.status(400).json({ message: 'Título, autor e quantidade disponível são obrigatórios para atualização.' });
    }

    try {
      const [result] = await pool.query(
        'UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id = ?',
        [titulo, autor, ano_publicacao, quantidade_disponivel, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Livro não encontrado para atualização.' });
      }
      res.status(200).json({ message: 'Livro atualizado com sucesso!' });
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      res.status(500).json({ message: 'Erro ao atualizar livro.', error: error.message });
    }
  });

  router.delete('/:id', authenticateToken, authorizeRoles(['bibliotecario']), async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM livros WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Livro não encontrado para exclusão.' });
      }
      res.status(200).json({ message: 'Livro excluído com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir livro:', error);
      res.status(500).json({ message: 'Erro ao excluir livro.', error: error.message });
    }
  });

  return router;
};