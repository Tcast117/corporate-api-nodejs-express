const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Clave secreta para firmar los tokens JWT (en producción debería estar en variables de entorno)
const JWT_SECRET =
  process.env.JWT_SECRET || "mi_clave_secreta_super_segura_2024";

// Base de datos en memoria para usuarios (en producción usar una base de datos real)
const users = [
  {
    id: 1,
    username: "admin",
    // Contraseña: 'admin123' hasheada
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  },
];

/**
 * Middleware para verificar tokens JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Token de acceso requerido",
      message:
        "Debe proporcionar un token JWT válido en el header Authorization: Bearer <token>",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: "Token inválido o expirado",
        message: "El token proporcionado no es válido o ha expirado",
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Genera un token JWT para un usuario
 * @param {Object} user - Datos del usuario
 * @returns {string} Token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "24h" } // Token expira en 24 horas
  );
};

/**
 * Busca un usuario por nombre de usuario
 * @param {string} username - Nombre de usuario
 * @returns {Object|null} Usuario encontrado o null
 */
const findUserByUsername = (username) => {
  return users.find((user) => user.username === username);
};

/**
 * Busca un usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Object|null} Usuario encontrado o null
 */
const findUserById = (id) => {
  return users.find((user) => user.id === id);
};

/**
 * Crea un nuevo usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Object} Usuario creado
 */
const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
  };
  users.push(newUser);
  return newUser;
};

/**
 * Verifica la contraseña de un usuario
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {boolean} True si la contraseña es correcta
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  authenticateToken,
  generateToken,
  findUserByUsername,
  findUserById,
  createUser,
  verifyPassword,
  JWT_SECRET,
};
