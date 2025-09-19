const express = require("express");
const path = require("path");
const fs = require("fs");

// Importar routers
const authRoutes = require("./lib/auth-routes");
const pdfRoutes = require("./lib/pdf-lib");
const { authenticateToken } = require("./lib/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Rutas públicas
app.get("/", (req, res) => {
  res.json({
    message: "¡Bienvenido a la API Corporativa!",
    version: "1.0.0",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        register: "POST /api/auth/register",
        verify: "GET /api/auth/verify",
      },
      pdf: {
        extraer_pagina: "POST /api/pdf/pagina_pdf",
        contar_paginas: "POST /api/pdf/contar_paginas",
      },
    },
    authentication: "Usar JWT Token en header: Authorization: Bearer <token>",
  });
});

// Endpoint de estado del servidor
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rutas de autenticación (públicas)
app.use("/api/auth", authRoutes);

// Rutas de PDF (protegidas)
app.use("/api/pdf", pdfRoutes);

// Ruta protegida de ejemplo
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "¡Acceso autorizado!",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    message: "El endpoint solicitado no existe",
    available_routes: [
      "GET /",
      "GET /health",
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/auth/verify",
      "POST /api/pdf/pagina_pdf",
      "POST /api/pdf/contar_paginas",
      "GET /api/protected",
    ],
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    message: "Ha ocurrido un error inesperado",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  console.log(
    `📚 Documentación disponible en la ruta raíz: http://localhost:${PORT}`
  );
  console.log(`🔐 Usuario por defecto: admin / admin123`);
});
