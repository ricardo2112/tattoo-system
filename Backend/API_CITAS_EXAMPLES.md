# 📅 API de Citas - Ejemplos de Uso

## Base URL
```
http://localhost:5000/api/cita
```

---

## 📝 Endpoints Disponibles

### 1. Listar Todas las Citas

**GET** `/api/cita`

**Response:**
```json
[
  {
    "idCita": 1,
    "titulo": "Consulta - Juan Perez",
    "descripcion": "Consulta inicial",
    "fechaInicio": "2025-11-27T10:00:00",
    "fechaFin": "2025-11-27T10:20:00",
    "duracionMinutos": 20,
    "zona": "Estudio Principal",
    "googleEventId": "abc123xyz",
    "estado": "pendiente",
    "citaTatuajes": []
  }
]
```

---

### 2. Obtener Cita por ID

**GET** `/api/cita/{id}`

**Ejemplo:**
```bash
GET http://localhost:5000/api/cita/1
```

---

### 3. Crear Cita de Consulta (20 minutos)

**POST** `/api/cita?clienteEmail=cliente@example.com&clienteNombre=Juan Perez`

**Body:**
```json
{
  "titulo": "Consulta - Juan Perez",
  "descripcion": "Consulta inicial para ver diseños",
  "fechaInicio": "2025-11-27T10:00:00",
  "fechaFin": "2025-11-27T10:20:00",
  "duracionMinutos": 20,
  "zona": "Estudio Principal",
  "estado": "pendiente"
}
```

**Características:**
- ⏱️ Duración: 20 minutos
- 🔵 Color en Google Calendar: Azul
- 📧 Se envía invitación al email del cliente
- 🔔 Recordatorios: 24h (email) + 30min (popup)

---

### 4. Crear Cita de Servicio (Tatuaje/Piercing)

**POST** `/api/cita?clienteEmail=maria@example.com&clienteNombre=Maria Garcia`

**Body:**
```json
{
  "titulo": "Tatuaje - Maria Garcia",
  "descripcion": "Sesión completa - diseño de rosa en brazo",
  "fechaInicio": "2025-11-27T14:00:00",
  "fechaFin": "2025-11-27T16:00:00",
  "duracionMinutos": 120,
  "zona": "Sala 1",
  "estado": "confirmada"
}
```

**Características:**
- ⏱️ Duración: Variable (en este caso 2 horas)
- 🟢 Color en Google Calendar: Verde
- 📧 Se envía invitación al email del cliente
- 🔔 Recordatorios: 24h (email) + 30min (popup)

---

### 5. Crear Cita Sin Email (Sin invitación)

**POST** `/api/cita`

**Body:**
```json
{
  "titulo": "Cita de prueba",
  "descripcion": "Sesión de prueba sin invitación",
  "fechaInicio": "2025-11-28T09:00:00",
  "fechaFin": "2025-11-28T10:00:00",
  "duracionMinutos": 60,
  "zona": "Sala 2",
  "estado": "pendiente"
}
```

---

### 6. Actualizar Cita

**PUT** `/api/cita/{id}?clienteEmail=nuevo@example.com`

**Ejemplo:**
```bash
PUT http://localhost:5000/api/cita/1?clienteEmail=juanupdated@example.com
```

**Body:**
```json
{
  "titulo": "Tatuaje - Juan Perez (Modificado)",
  "descripcion": "Sesión modificada - cambio de diseño",
  "fechaInicio": "2025-11-27T15:00:00",
  "fechaFin": "2025-11-27T17:00:00",
  "duracionMinutos": 120,
  "zona": "Sala 2",
  "estado": "confirmada"
}
```

**Comportamiento:**
- ✅ Si existe `googleEventId`: Actualiza el evento en Google Calendar
- ✅ Si NO existe `googleEventId`: Crea un nuevo evento en Google Calendar
- 📧 Envía actualización al nuevo email (si se proporciona)

---

### 7. Eliminar Cita

**DELETE** `/api/cita/{id}`

**Ejemplo:**
```bash
DELETE http://localhost:5000/api/cita/1
```

**Comportamiento:**
- ✅ Elimina la cita de la base de datos
- ✅ Elimina el evento de Google Calendar (si existe)
- 📧 Envía notificación de cancelación a los invitados

---

### 8. Obtener Citas por Estado

**GET** `/api/cita/estado/{estado}`

**Estados válidos:**
- `pendiente`
- `confirmada`
- `realizada`
- `cancelada`

**Ejemplo:**
```bash
GET http://localhost:5000/api/cita/estado/confirmada
```

---

### 9. Obtener Citas por Fecha

**GET** `/api/cita/fecha/{fecha}`

**Ejemplo:**
```bash
GET http://localhost:5000/api/cita/fecha/2025-11-27
```

---

### 10. Obtener Tatuajes Asociados a una Cita

**GET** `/api/cita/{idCita}/tatuajes`

**Ejemplo:**
```bash
GET http://localhost:5000/api/cita/1/tatuajes
```

---

## 🎨 Tipos de Citas y Colores

| Tipo | Duración | Color Google Calendar | ColorId |
|------|----------|----------------------|---------|
| Consulta | 20 minutos | 🔵 Azul | 9 |
| Servicio | > 20 minutos | 🟢 Verde | 10 |

---

## 📧 Parámetros de Query Opcionales

Todos los endpoints POST y PUT soportan estos parámetros opcionales:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `clienteEmail` | string | Email del cliente para enviar invitación |
| `clienteNombre` | string | Nombre del cliente para la invitación |

**Ejemplo:**
```
POST /api/cita?clienteEmail=cliente@example.com&clienteNombre=Juan Perez
```

---

## 📝 Modelo de Datos

```typescript
{
  "idCita": number,                    // Auto-generado
  "titulo": string (max 60),           // Requerido
  "descripcion": string (max 200),     // Opcional
  "fechaInicio": DateTime,             // Requerido
  "fechaFin": DateTime,                // Requerido
  "duracionMinutos": number,           // Opcional
  "zona": string (max 30),             // Opcional
  "googleEventId": string (max 200),   // Auto-generado
  "fechaCreacion": DateTime,           // Auto-generado
  "fechaActualizacion": DateTime,      // Auto-actualizado
  "estado": string (max 20),           // Default: "pendiente"
  "citaTatuajes": Array                // Relación
}
```

---

## ⚠️ Validaciones

### Crear/Actualizar Cita

- ❌ `fechaInicio` debe ser menor que `fechaFin`
- ❌ `id` debe ser mayor que 0
- ✅ `estado` por defecto es "pendiente"

**Errores posibles:**

```json
{
  "message": "La fecha de inicio debe ser anterior a la fecha de fin"
}
```

```json
{
  "message": "La cita con ID 999 no existe"
}
```

---

## 🔒 Comportamiento de Google Calendar

### Si Google Calendar está habilitado (`Enabled: true`):

1. **Al crear**: Se crea evento en Google Calendar
2. **Al actualizar**: Se actualiza el evento existente o se crea uno nuevo
3. **Al eliminar**: Se elimina el evento de Google Calendar

### Si Google Calendar falla:

- ✅ La operación en la BD continúa normalmente
- ⚠️ Se registra un warning en los logs
- ✅ El sistema es resiliente y no falla

### Si Google Calendar está deshabilitado (`Enabled: false`):

- ✅ Solo se guarda en la base de datos
- ℹ️ No se sincroniza con Google Calendar

---

## 🧪 Testing con Postman/Thunder Client

### Colección de Pruebas

```json
{
  "name": "Citas API",
  "requests": [
    {
      "name": "Crear Cita Consulta",
      "method": "POST",
      "url": "http://localhost:5000/api/cita?clienteEmail=test@example.com&clienteNombre=Test User",
      "body": {
        "titulo": "Consulta - Test",
        "descripcion": "Prueba de consulta",
        "fechaInicio": "2025-11-28T10:00:00",
        "fechaFin": "2025-11-28T10:20:00",
        "duracionMinutos": 20,
        "zona": "Estudio Principal"
      }
    },
    {
      "name": "Listar Citas",
      "method": "GET",
      "url": "http://localhost:5000/api/cita"
    }
  ]
}
```

---

## 📚 Más Información

- [QUICK_START.md](QUICK_START.md) - Guía de inicio rápido
- [GOOGLE_CALENDAR_SETUP.md](GOOGLE_CALENDAR_SETUP.md) - Configuración de Google Calendar
- [GOOGLE_CALENDAR_COMPARISON.md](GOOGLE_CALENDAR_COMPARISON.md) - Service Account vs OAuth2
