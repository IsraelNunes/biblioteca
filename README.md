# Sistema de Gerenciamento de Biblioteca

Este projeto é um sistema completo de gerenciamento de biblioteca, composto por um frontend web interativo e um backend robusto para gerenciar os dados.

---

## Visão Geral do Projeto

O objetivo deste trabalho é desenvolver um sistema para gerenciar empréstimos de livros em uma biblioteca. Ele implementa controle de permissões para diferentes tipos de usuários:

- **Bibliotecário**: Responsável por cadastrar, atualizar e remover livros, além de aprovar devoluções. É responsável pelo gerenciamento do acervo e aprovação das devoluções.
- **Leitor**: Responsável por visualizar livros, solicitar empréstimos e solicitar devoluções.

O sistema permite que usuários realizem **cadastro e login**, escolhendo se querem ser bibliotecários ou leitores. Bibliotecários gerenciam o catálogo de livros, realizando as operações de **CRUD** (Create, Read, Update e Delete). Leitores consultam a lista de livros e fazem solicitações de empréstimo.

---

## Tecnologias Utilizadas

### Frontend (`front`)
- **Angular 18**: Framework para construção da interface de usuário.
- **HTML, CSS (SCSS), JavaScript/TypeScript**
- **Angular Router**: Gerenciamento de navegação entre as páginas.
- **Angular Reactive Forms**: Manipulação de formulários com validação.
- **HttpClient**: Comunicação com o backend via HTTP.

### Backend (`back`)
- **Node.js e Express**: Processamento das regras de negócio, gerenciamento de rotas e banco de dados.
- **MySQL**: Banco de dados relacional.
- **Docker e Docker Compose**: Conteinerização da aplicação e banco de dados.
- **Pacotes Utilizados**:
  - `mysql2`: Driver para MySQL
  - `bcryptjs`: Hash de senhas
  - `jsonwebtoken (JWT)`: Autenticação
  - `dotenv`: Variáveis de ambiente
  - `cors`: Middleware para requisições cross-origin
  - `nodemon`: Reinício automático durante desenvolvimento

---

## Estrutura do Banco de Dados

Banco relacional composto por 3 tabelas principais:

### `usuarios`
| Campo     | Tipo                         |
|-----------|------------------------------|
| id        | INTEGER, PK, auto increment  |
| nome      | VARCHAR, obrigatório         |
| email     | VARCHAR, obrigatório         |
| senha     | VARCHAR, obrigatório         |
| perfil    | ENUM('bibliotecario', 'leitor'), obrigatório |

### `livros`
| Campo              | Tipo                          |
|--------------------|-------------------------------|
| id                 | INTEGER, PK, auto increment   |
| titulo             | VARCHAR, obrigatório          |
| autor              | VARCHAR, obrigatório          |
| ano_publicacao     | INTEGER, opcional             |
| quantidade_disponivel | INTEGER, obrigatório     |

### `emprestimos`
| Campo                 | Tipo                                |
|------------------------|-------------------------------------|
| id                    | INTEGER, PK, auto increment         |
| livro_id              | INTEGER, FK                         |
| leitor_id             | INTEGER, FK                         |
| data_emprestimo       | DATE, obrigatório                   |
| data_devolucao_prevista | DATE, obrigatório               |
| data_devolucao_real   | DATE, opcional                      |
| status                | ENUM('ativo', 'devolvido', 'atrasado'), obrigatório |

---

## Como Iniciar o Projeto Localmente

### Pré-requisitos
- Node.js (18.x ou superior)
- Angular CLI:
```bash
npm install -g @angular/cli
```
- Docker Desktop com Docker Compose v2

---

### 1. Clonar o Repositório
```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd [NOME_DA_PASTA_PRINCIPAL_DO_PROJETO] # Ex: biblioteca-web
```

**Estrutura esperada:**
```
.
├── front/
└── back/
```

---

### 2. Configurar e Iniciar o Backend

```bash
cd back
```

#### a. Criar `.env`
```env
# .env
DB_HOST=db
DB_USER=user_biblioteca
DB_PASSWORD=user_password
DB_NAME=biblioteca_db
DB_PORT=3306
JWT_SECRET=sua_chave_secreta_jwt_bem_longa_e_complexa
```

#### b. Iniciar Contêineres Docker
```bash
docker compose up --build -d
```

#### c. Verificar Backend
```bash
docker compose logs backend
```

Testar rotas:
- http://localhost:3000
- http://localhost:3000/test-db

---

### 3. Configurar e Iniciar o Frontend

```bash
cd ../front
```

#### a. Instalar Dependências
```bash
npm install
```

#### b. Rodar Angular
```bash
ng serve --open
```

Acesse: http://localhost:4200

---

## Rotas da Aplicação e Métodos HTTP

- `GET`: Listar livros, detalhes, empréstimos
- `POST`: Registrar usuário, adicionar livro, criar empréstimo
- `PUT`: Atualizar livro ou empréstimo
- `DELETE`: Remover livro ou empréstimo

---

## Fluxo das Requisições

1. Frontend envia requisição HTTP
2. Backend intercepta, valida e executa lógica de negócio
3. Backend consulta MySQL
4. Backend responde com dados, status e mensagens

---

## Credenciais de Acesso para Teste

### Bibliotecário
- **Email**: `admin@biblioteca.com`
- **Senha**: `password123`

### Leitor
- Cadastre um novo leitor pela interface

---

## Uso do Projeto

Acesse: http://localhost:4200

### Painel do Bibliotecário
- Adicionar, editar, remover livros
- Ver e atualizar empréstimos

### Painel do Leitor
- Ver catálogo
- Solicitar empréstimo e devolução
- Acompanhar empréstimos

---

## Regras de Negócio

- Apenas **bibliotecário** pode gerenciar livros
- Apenas **leitor** pode solicitar empréstimo
- Empréstimo:
  - Diminui `quantidade_disponivel`
  - Status inicial: `ativo`
  - Após devolução: `devolvido`
  - Atrasado: data prevista ultrapassada sem devolução

---

## Observações Importantes

- **Persistência**: Volume `db_data` preserva dados
- **Resetar Banco**:
  ```bash
  docker compose down
  docker volume rm biblioteca-backend_db_data
  docker compose up --build -d
  ```
- **Reiniciar Backend após alterações**:
  ```bash
  docker compose up --build -d
  ```
- **Conexão Frontend/Backend**: Frontend se comunica via `http://localhost:3000`
