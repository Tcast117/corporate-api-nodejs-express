# API Corporativa con Autenticación JWT

## Descripción General

Esta API REST está construida con **Node.js** y **Express** e implementa autenticación JWT (JSON Web Tokens) para proteger los endpoints. La API proporciona funcionalidades para procesamiento de archivos PDF y un sistema completo de autenticación de usuarios.

## Estructura del Proyecto

```
corporate-api-nodejs-express/
├── index.js                 # Servidor principal y configuración de rutas
├── package.json            # Dependencias y scripts del proyecto
├── lib/
│   ├── auth.js            # Middleware y funciones de autenticación
│   ├── auth-routes.js     # Rutas de autenticación (login, register, verify)
│   └── pdf-lib.js         # Rutas para procesamiento de PDF
├── uploads/               # Directorio para archivos temporales (creado automáticamente)
└── README.md             # Este archivo de documentación
```

## Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web para Node.js
- **JSON Web Tokens (JWT)**: Para autenticación stateless
- **bcryptjs**: Para hashing seguro de contraseñas
- **pdf-lib**: Para manipulación de documentos PDF
- **multer**: Para manejo de archivos subidos

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Iniciar el Servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
node index.js
```

El servidor estará disponible en: `http://localhost:3000`

## Sistema de Autenticación

### Usuarios por Defecto

La API incluye un usuario administrador por defecto:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Flujo de Autenticación

1. **Registro/Login**: El cliente envía credenciales a `/api/auth/login` o `/api/auth/register`
2. **Token JWT**: El servidor responde con un token JWT válido por 24 horas
3. **Autorización**: El cliente incluye el token en el header `Authorization: Bearer <token>`
4. **Verificación**: El middleware `authenticateToken` valida el token en rutas protegidas

## Endpoints de la API

### 📍 Endpoints Públicos

#### `GET /`
Información general de la API y endpoints disponibles.

**Respuesta:**
```json
{
  "message": "¡Bienvenido a la API Corporativa!",
  "version": "1.0.0",
  "endpoints": {
    "auth": {
      "login": "POST /api/auth/login",
      "register": "POST /api/auth/register",
      "verify": "GET /api/auth/verify"
    },
    "pdf": {
      "extraer_pagina": "POST /api/pdf/pagina_pdf",
      "contar_paginas": "POST /api/pdf/contar_paginas"
    }
  }
}
```

#### `GET /health`
Estado del servidor.

**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

### 🔐 Endpoints de Autenticación

#### `POST /api/auth/login`
Iniciar sesión con credenciales de usuario.

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

**Errores Posibles:**
- `400`: Datos incompletos
- `401`: Credenciales inválidas

#### `POST /api/auth/register`
Registrar un nuevo usuario.

**Body:**
```json
{
  "username": "nuevo_usuario",
  "password": "contraseña_segura"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 2,
    "username": "nuevo_usuario"
  }
}
```

**Errores Posibles:**
- `400`: Datos incompletos o contraseña muy corta
- `409`: Usuario ya existe

#### `GET /api/auth/verify`
Verificar la validez del token actual.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

### 📄 Endpoints de PDF (Protegidos)

> **Nota**: Todos los endpoints de PDF requieren autenticación JWT.

#### `POST /api/pdf/pagina_pdf`
Extrae una página específica de un PDF.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `archivo`: Archivo PDF (file)
- `pagina`: Número de página a extraer (string/number)

**Respuesta:** Descarga directa del archivo PDF con la página extraída.

**Errores Posibles:**
- `400`: Página fuera de rango
- `401`: Token requerido
- `403`: Token inválido
- `500`: Error procesando PDF

#### `POST /api/pdf/contar_paginas`
Cuenta el número total de páginas de un PDF.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `archivo`: Archivo PDF (file)

**Respuesta Exitosa (200):**
```json
{
  "paginas": 25
}
```

### 🛡️ Endpoint Protegido de Ejemplo

#### `GET /api/protected`
Endpoint de ejemplo que requiere autenticación.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "message": "¡Acceso autorizado!",
  "user": {
    "id": 1,
    "username": "admin"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Ejemplos de Uso

### 1. Iniciar Sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 2. Usar Token para Acceder a Rutas Protegidas

```bash
# Primero obtener el token del login anterior
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Usar el token para acceder a rutas protegidas
curl -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Subir PDF y Contar Páginas

```bash
curl -X POST http://localhost:3000/api/pdf/contar_paginas \
  -H "Authorization: Bearer $TOKEN" \
  -F "archivo=@documento.pdf"
```

### 4. Extraer Página de PDF

```bash
curl -X POST http://localhost:3000/api/pdf/pagina_pdf \
  -H "Authorization: Bearer $TOKEN" \
  -F "archivo=@documento.pdf" \
  -F "pagina=3" \
  -o "pagina_3.pdf"
```

## Detalles Técnicos

### Configuración JWT

- **Secreto**: Configurable mediante variable de entorno `JWT_SECRET`
- **Expiración**: 24 horas por defecto
- **Algoritmo**: HS256 (HMAC with SHA-256)

### Seguridad

- **Contraseñas**: Hasheadas con bcrypt (factor de costo: 10)
- **Tokens**: Firmados con clave secreta y verificados en cada request
- **Validación**: Middleware de autenticación en todas las rutas protegidas
- **Errores**: Manejo consistente de errores con códigos HTTP apropiados

### Almacenamiento

- **Usuarios**: Almacenados en memoria (para producción usar base de datos)
- **Archivos**: Guardados temporalmente en directorio `uploads/`
- **Limpieza**: Los archivos temporales se eliminan automáticamente

## Estructura del Código

### `index.js`
Archivo principal que:
- Configura el servidor Express
- Define middleware globales
- Integra todos los routers
- Maneja errores y rutas no encontradas

### `lib/auth.js`
Módulo de autenticación que contiene:
- Middleware `authenticateToken`
- Funciones para manejo de usuarios
- Utilidades para JWT y bcrypt
- Base de datos en memoria de usuarios

### `lib/auth-routes.js`
Router con endpoints de autenticación:
- `POST /login`: Autenticación de usuarios
- `POST /register`: Registro de nuevos usuarios
- `GET /verify`: Verificación de tokens

### `lib/pdf-lib.js`
Router con endpoints de PDF protegidos:
- `POST /pagina_pdf`: Extraer página específica
- `POST /contar_paginas`: Contar páginas totales

## Variables de Entorno

```bash
# Puerto del servidor (opcional, default: 3000)
PORT=3000

# Clave secreta para JWT (recomendado en producción)
JWT_SECRET=mi_clave_secreta_muy_segura_2024
```

## Consideraciones para Producción

1. **Base de Datos**: Migrar usuarios de memoria a base de datos persistente
2. **Variables de Entorno**: Usar archivo `.env` para configuración sensible
3. **HTTPS**: Implementar certificados SSL/TLS
4. **Rate Limiting**: Agregar limitación de requests por IP
5. **Logging**: Implementar sistema de logs estructurado
6. **Validación**: Agregar validación más robusta de inputs
7. **CORS**: Configurar políticas de CORS según necesidades

## Códigos de Error Comunes

- **400**: Bad Request - Datos incompletos o inválidos
- **401**: Unauthorized - Token faltante o credenciales incorrectas
- **403**: Forbidden - Token inválido o expirado
- **404**: Not Found - Ruta no existe
- **409**: Conflict - Usuario ya existe
- **500**: Internal Server Error - Error del servidor

## Licencia

Este proyecto está bajo la licencia ISC.