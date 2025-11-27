# Sistema de Registro Completo de Tatuajes

## Descripción

Este sistema permite registrar un tatuaje completo incluyendo:
- Cliente (nuevo o existente)
- Tutor (si el cliente es menor de edad)
- Información del tatuaje
- Cita asociada
- Formulario de consentimiento según la edad

## Arquitectura

El sistema sigue principios SOLID y mantiene bajo acoplamiento:

- **Single Responsibility**: Cada servicio tiene una responsabilidad única
- **Open/Closed**: El sistema es extensible sin modificar código existente
- **Liskov Substitution**: Las interfaces pueden ser reemplazadas por sus implementaciones
- **Interface Segregation**: Interfaces específicas para cada servicio
- **Dependency Inversion**: Uso de interfaces en lugar de implementaciones concretas

## Flujo del Proceso

1. **Validación del Cliente**
   - Si `IdCliente` está presente → Se busca el cliente existente
   - Si `IdCliente` es null → Se crea un nuevo cliente con los datos proporcionados

2. **Verificación de Edad**
   - Si tiene fecha de nacimiento → Se calcula la edad
   - Si es menor de 18 años → Se requiere un tutor

3. **Gestión del Tutor** (solo para menores de edad)
   - Si `IdTutor` está presente → Se busca el tutor existente
   - Si `IdTutor` es null → Se crea un nuevo tutor
   - Se asigna el tutor al cliente

4. **Creación del Tatuaje**
   - Se valida que el usuario registrador exista
   - Se crea el tatuaje asociado al cliente

5. **Creación de la Cita**
   - Se crea la cita con los datos proporcionados
   - Se sincroniza con Google Calendar si está configurado
   - Se asocia la cita al tatuaje

6. **Generación del Formulario**
   - Se obtiene el formulario según el evento:
     - `tatuaje_menor_edad` para menores
     - `tatuaje_mayor_edad` para mayores
   - Se devuelve el HTML del formulario para imprimir o generar PDF

## Endpoints

### Registrar Tatuaje Completo

**POST** `/api/tatuaje/registrar-completo`

```json
{
  "cliente": {
    "idCliente": null,  // null para crear nuevo, o ID para usar existente
    "identificacion": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "fechaNacimiento": "2010-05-15",  // Menor de edad
    "nacionalidad": "Ecuatoriana",
    "telefono": "0987654321",
    "email": "juan@example.com",
    "condicionMedica": "Ninguna",
    "enfermedadPiel": "Ninguna"
  },
  "tutor": {
    "idTutor": null,  // null para crear nuevo, o ID para usar existente
    "identificacion": "0987654321",
    "nombre": "María",
    "apellido": "Pérez",
    "parentezco": "Madre"
  },
  "tatuaje": {
    "artista": "Carlos Artista",
    "detalle": "Dragón en el hombro",
    "precio": 150.00,
    "zonaTatuaje": "Hombro",
    "imagen": "url-de-la-imagen.jpg",
    "estadoPago": "parcial"
  },
  "cita": {
    "titulo": "Tatuaje - Juan Pérez",
    "descripcion": "Primera sesión de tatuaje de dragón",
    "fechaInicio": "2025-12-01T10:00:00",
    "fechaFin": "2025-12-01T13:00:00",
    "duracionMinutos": 180,
    "zona": "Hombro"
  },
  "registradoPor": 1  // ID del usuario que registra
}
```

#### Respuesta Exitosa (201 Created)

```json
{
  "cliente": {
    "idCliente": 10,
    "identificacion": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "fechaNacimiento": "2010-05-15T00:00:00",
    "edad": 15,
    ...
  },
  "tutor": {
    "idTutor": 5,
    "identificacion": "0987654321",
    "nombre": "María",
    "apellido": "Pérez",
    "parentezco": "Madre"
  },
  "tatuaje": {
    "idTatuaje": 25,
    "idCliente": 10,
    "artista": "Carlos Artista",
    "detalle": "Dragón en el hombro",
    "precio": 150.00,
    ...
  },
  "cita": {
    "idCita": 100,
    "titulo": "Tatuaje - Juan Pérez",
    "fechaInicio": "2025-12-01T10:00:00",
    "fechaFin": "2025-12-01T13:00:00",
    "googleEventId": "abc123xyz",
    ...
  },
  "esMenorDeEdad": true,
  "formulario": {
    "idFormulario": 1,
    "nombreFormulario": "Consentimiento Menor",
    "descripcion": "Formulario de consentimiento para menores de edad"
  },
  "formularioHtml": "<html>...formulario completo...</html>",
  "mensaje": "Tatuaje registrado exitosamente. Cliente menor de edad - Se requiere consentimiento del tutor."
}
```

### Ejemplo con Cliente Mayor de Edad

```json
{
  "cliente": {
    "idCliente": null,
    "identificacion": "1234567890",
    "nombre": "Ana",
    "apellido": "García",
    "fechaNacimiento": "1995-05-15",  // Mayor de edad
    "telefono": "0987654321",
    "email": "ana@example.com"
  },
  "tutor": null,  // No se requiere tutor
  "tatuaje": {
    "artista": "Carlos Artista",
    "detalle": "Rosa en el brazo",
    "precio": 120.00,
    "zonaTatuaje": "Brazo",
    "estadoPago": "parcial"
  },
  "cita": {
    "fechaInicio": "2025-12-01T10:00:00",
    "fechaFin": "2025-12-01T12:00:00"
  },
  "registradoPor": 1
}
```

### Ejemplo con Cliente Existente

```json
{
  "cliente": {
    "idCliente": 5  // Usar cliente existente con ID 5
  },
  "tutor": null,
  "tatuaje": {
    "artista": "Carlos Artista",
    "detalle": "Segundo tatuaje",
    "precio": 200.00,
    "zonaTatuaje": "Espalda"
  },
  "cita": {
    "fechaInicio": "2025-12-05T14:00:00",
    "fechaFin": "2025-12-05T17:00:00"
  },
  "registradoPor": 1
}
```

## Gestión de Formularios

### Obtener Todos los Eventos

**GET** `/api/formulario/eventos`

```json
[
  {
    "idEvento": 1,
    "evento": "tatuaje_menor_edad",
    "idFormulario": 1,
    "formulario": { ... }
  },
  {
    "idEvento": 2,
    "evento": "tatuaje_mayor_edad",
    "idFormulario": 2,
    "formulario": { ... }
  }
]
```

### Asignar Formulario a Evento

**PUT** `/api/formulario/eventos/{idEvento}/asignar/{idFormulario}`

Ejemplo: `/api/formulario/eventos/1/asignar/5`

### Crear un Nuevo Formulario

**POST** `/api/formulario`

```json
{
  "nombreFormulario": "Consentimiento Menor",
  "descripcion": "Formulario de consentimiento para menores de edad",
  "cuerpoHtml": "<html>...contenido del formulario...</html>",
  "activo": true
}
```

## Validaciones

El sistema incluye las siguientes validaciones:

1. **Cliente menor de edad sin tutor**: Error 400
2. **Usuario registrador no existe**: Error 404
3. **Cliente con ID inexistente**: Error 404
4. **Tutor con ID inexistente**: Error 404
5. **Fechas de cita inválidas**: Error según la validación de CitaService

## Transacciones

Todo el proceso se ejecuta dentro de una **transacción de base de datos**:
- Si algún paso falla, se hace rollback completo
- Se garantiza la consistencia de datos
- No quedan registros huérfanos

## Características de Código Limpio

1. **Separación de Responsabilidades**
   - `ClienteService`: Gestión de clientes
   - `TutorService`: Gestión de tutores
   - `TatuajeService`: Orquestación del proceso completo
   - `CitaService`: Gestión de citas
   - `FormularioService`: Gestión de formularios

2. **Reutilización de Código**
   - Se usan servicios existentes en lugar de duplicar lógica
   - DTOs para transferencia de datos
   - Validaciones centralizadas

3. **Principio DRY (Don't Repeat Yourself)**
   - Métodos privados para cálculos reutilizables (ej: `CalcularEdad`)
   - Servicios compartidos entre componentes

4. **Manejo de Errores**
   - Excepciones específicas por tipo de error
   - Mensajes descriptivos
   - Logging de errores internos

## Próximos Pasos (Frontend)

El frontend puede:
1. Mostrar el formulario HTML recibido
2. Ofrecer opciones para:
   - Imprimir el formulario
   - Generar PDF del formulario
   - Guardar para más tarde
   - Continuar sin imprimir

## Eventos de Formulario Disponibles

- `tatuaje_menor_edad`: Para tatuajes en menores de 18 años
- `tatuaje_mayor_edad`: Para tatuajes en mayores de 18 años
- `piercing_menor_edad`: Para piercings en menores de 18 años
- `piercing_mayor_edad`: Para piercings en mayores de 18 años
- `borrado_laser`: Para servicios de borrado láser

## Migración de Base de Datos

Ejecutar el script SQL proporcionado para crear las tablas de formularios:

```sql
CREATE TABLE Formulario(
    id_formulario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_formulario VARCHAR(20) NOT NULL,
    cuerpo_html TEXT,
    descripción VARCHAR(50),
    activo BOOL default true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE EventoFormulario(
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_formulario INT,
    evento VARCHAR(20) NOT NULL,
    CONSTRAINT evento_formulario
    FOREIGN KEY (id_formulario) REFERENCES Formulario (id_formulario)
);

INSERT INTO EventoFormulario (evento) VALUES ('tatuaje_menor_edad');
INSERT INTO EventoFormulario (evento) VALUES ('tatuaje_mayor_edad');
INSERT INTO EventoFormulario (evento) VALUES ('piercing_menor_edad');
INSERT INTO EventoFormulario (evento) VALUES ('piercing_mayor_edad');
INSERT INTO EventoFormulario (evento) VALUES ('borrado_laser');
```
