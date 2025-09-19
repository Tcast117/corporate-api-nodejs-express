const express = require("express");
const {
  generateToken,
  findUserByUsername,
  createUser,
  verifyPassword,
} = require("./auth");

const router = express.Router();

/**
 * Endpoint para iniciar sesión
 * POST /api/auth/login
 * Body: { username: string, password: string }
 * Response: { token: string, user: { id: number, username: string } }
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar que se proporcionen username y password
    if (!username || !password) {
      return res.status(400).json({
        error: "Datos incompletos",
        message: "Se requieren username y password",
      });
    }

    // Buscar el usuario
    const user = findUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Usuario o contraseña incorrectos",
      });
    }

    // Verificar la contraseña
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Usuario o contraseña incorrectos",
      });
    }

    // Generar token JWT
    const token = generateToken(user);

    // Responder con el token y datos del usuario (sin la contraseña)
    res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error procesando la solicitud de login",
    });
  }
});

/**
 * Endpoint para registrar un nuevo usuario
 * POST /api/auth/register
 * Body: { username: string, password: string }
 * Response: { message: string, user: { id: number, username: string } }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar que se proporcionen username y password
    if (!username || !password) {
      return res.status(400).json({
        error: "Datos incompletos",
        message: "Se requieren username y password",
      });
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: "Contraseña muy corta",
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Verificar que el usuario no exista
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        error: "Usuario ya existe",
        message: "El nombre de usuario ya está en uso",
      });
    }

    // Crear el nuevo usuario
    const newUser = await createUser(username, password);

    // Responder con los datos del usuario (sin la contraseña)
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error procesando la solicitud de registro",
    });
  }
});

/**
 * Endpoint para verificar el token actual
 * GET /api/auth/verify
 * Headers: Authorization: Bearer <token>
 * Response: { valid: boolean, user: { id: number, username: string } }
 */
router.get("/verify", require("./auth").authenticateToken, (req, res) => {
  // Si llegamos aquí, el token es válido (middleware ya lo verificó)
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
    },
  });
});

module.exports = router;
