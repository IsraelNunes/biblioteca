const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

module.exports = (pool) => {

  router.post('/', authenticateToken, authorizeRoles(['leitor']), async (req, res) => {
    const { livro_id, data_devolucao_prevista } = req.body;
    const leitor_id = req.user.id;
    const data_emprestimo = new Date().toISOString().slice(0, 10);

    if (!livro_id || !data_devolucao_prevista) {
      return res.status(400).json({ message: 'ID do livro e data de devolução prevista são obrigatórios.' });
    }

    try {
      const [books] = await pool.query('SELECT quantidade_disponivel FROM livros WHERE id = ?', [livro_id]);
      if (books.length === 0 || books[0].quantidade_disponivel <= 0) {
        return res.status(400).json({ message: 'Livro não disponível para empréstimo ou não encontrado.' });
      }

      const [result] = await pool.query(
        'INSERT INTO emprestimos (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status) VALUES (?, ?, ?, ?, "ativo")',
        [livro_id, leitor_id, data_emprestimo, data_devolucao_prevista]
      );

      await pool.query('UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?', [livro_id]);

      res.status(201).json({ message: 'Empréstimo solicitado com sucesso!', loanId: result.insertId });

    } catch (error) {
      console.error('Erro ao solicitar empréstimo:', error);
      res.status(500).json({ message: 'Erro ao solicitar empréstimo.', error: error.message });
    }
  });

  router.get('/usuario/:leitor_id', authenticateToken, async (req, res) => {
    const requestedLeitorId = parseInt(req.params.leitor_id);
    const currentUser = req.user;

    if (currentUser.perfil === 'leitor' && currentUser.id !== requestedLeitorId) {
      return res.status(403).json({ message: 'Acesso negado: Você não tem permissão para ver os empréstimos de outro usuário.' });
    }

    try {
      const [loans] = await pool.query(
        `SELECT e.*, l.titulo AS titulo_livro
         FROM emprestimos e
         JOIN livros l ON e.livro_id = l.id
         WHERE e.leitor_id = ?`,
        [requestedLeitorId]
      );
      res.status(200).json(loans);
    } catch (error) {
      console.error('Erro ao buscar empréstimos do usuário:', error);
      res.status(500).json({ message: 'Erro ao buscar empréstimos do usuário.', error: error.message });
    }
  });

  router.get('/', authenticateToken, authorizeRoles(['bibliotecario']), async (req, res) => {
    try {
      const [loans] = await pool.query(
        `SELECT e.*, l.titulo AS titulo_livro, u.nome AS nome_leitor
         FROM emprestimos e
         JOIN livros l ON e.livro_id = l.id
         JOIN usuarios u ON e.leitor_id = u.id`
      );
      res.status(200).json(loans);
    } catch (error) {
      console.error('Erro ao buscar todos os empréstimos:', error);
      res.status(500).json({ message: 'Erro ao buscar todos os empréstimos.', error: error.message });
    }
  });

  router.put('/:id/status', authenticateToken, authorizeRoles(['bibliotecario']), async (req, res) => {
    const { id } = req.params;
    const { status, data_devolucao_real } = req.body;

    if (!status || !['ativo', 'devolvido', 'atrasado'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    try {
      const [loan] = await pool.query('SELECT livro_id, status FROM emprestimos WHERE id = ?', [id]);
      if (loan.length === 0) {
        return res.status(404).json({ message: 'Empréstimo não encontrado.' });
      }

      if (status === 'devolvido' && loan[0].status !== 'devolvido') {
        await pool.query(
          'UPDATE emprestimos SET status = ?, data_devolucao_real = ? WHERE id = ?',
          [status, data_devolucao_real || new Date().toISOString().slice(0, 10), id]
        );
        await pool.query('UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?', [loan[0].livro_id]);
      } else {
        await pool.query(
          'UPDATE emprestimos SET status = ? WHERE id = ?',
          [status, id]
        );
      }

      res.status(200).json({ message: `Status do empréstimo atualizado para "${status}"!` });

    } catch (error) {
      console.error('Erro ao atualizar status do empréstimo:', error);
      res.status(500).json({ message: 'Erro ao atualizar status do empréstimo.', error: error.message });
    }
  });

  router.delete('/:id', authenticateToken, authorizeRoles(['bibliotecario']), async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM emprestimos WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Empréstimo não encontrado para exclusão.' });
      }
      res.status(200).json({ message: 'Empréstimo excluído com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir empréstimo:', error);
      res.status(500).json({ message: 'Erro ao excluir empréstimo.', error: error.message });
    }
  });

  return router;
};