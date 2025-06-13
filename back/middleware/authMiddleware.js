const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token de autenticação ausente.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token de autenticação inválido ou expirado.' });
    }
    req.user = user;
    next();
  });
}

function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.perfil) {
      return res.status(403).json({ message: 'Acesso negado: Perfil de usuário não disponível.' });
    }
    if (!allowedRoles.includes(req.user.perfil)) {
      return res.status(403).json({ message: 'Acesso negado: Você não tem permissão para esta ação.' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};