// server.js

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let dbPool;

async function initializeDatabasePool() {
  try {
    dbPool = mysql.createPool(dbConfig);
    await dbPool.getConnection();
    console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');

    // Importar e usar rotas de autenticação
    const authRoutes = require('./routes/authRoutes')(dbPool);
    app.use('/api', authRoutes);

    // IMPORTAR E USAR ROTAS DE LIVROS E EMPRÉSTIMOS
    // CERTIFIQUE-SE DE QUE ESTAS LINHAS ESTÃO PRESENTES E CORRETAS
    const bookRoutes = require('./routes/bookRoutes')(dbPool); // <-- DEVE ESTAR AQUI
    const loanRoutes = require('./routes/loanRoutes')(dbPool); // <-- DEVE ESTAR AQUI

    app.use('/api/livros', bookRoutes); // <-- DEVE ESTAR AQUI
    app.use('/api/emprestimos', loanRoutes); // <-- DEVE ESTAR AQUI

    // Iniciar o servidor Express APÓS a conexão com o DB e setup de rotas
    app.listen(PORT, () => {
      console.log(`Servidor Express rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Erro FATAL ao conectar ao banco de dados MySQL:', err);
    process.exit(1);
  }
}

app.get('/', (req, res) => {
  res.send('API da Biblioteca em Node.js está funcionando!');
});

app.get('/test-db', async (req, res) => {
  if (!dbPool) {
    return res.status(503).json({ message: 'Banco de dados não está pronto ainda.' });
  }
  try {
    const [rows] = await dbPool.query('SELECT 1 + 1 AS solution');
    res.json({ message: 'Conexão com o DB bem-sucedida!', solution: rows[0].solution });
  } catch (err) {
    console.error('Erro ao consultar o DB:', err);
    res.status(500).json({ message: 'Erro ao conectar ao banco de dados', error: err.message });
  }
});

initializeDatabasePool();