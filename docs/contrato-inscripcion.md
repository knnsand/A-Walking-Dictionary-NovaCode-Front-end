# Contrato de inscripción a cursos — HU-014

**Estado:** Frontend preparado para integración con el backend real.

La implementación frontend de HU-014 utiliza los endpoints reales del backend y ya no depende de mocks para las operaciones de inscripción.

## 1. Inscripción de estudiante mediante código de acceso

`POST /api/v1/courses/enroll`

### Body enviado por el frontend

```json
{
  "estudiante_id": 2,
  "codigo_acceso": "ABCD2345"
}
```

### Reglas

* `estudiante_id` es el identificador del usuario que desea inscribirse.
* `codigo_acceso` corresponde al código generado para un curso.
* El backend normaliza el código con `trim()` y `toUpperCase()`.
* El usuario debe existir.
* El usuario debe tener rol `estudiante`.
* El código debe corresponder a un curso existente.
* No se permite registrar dos veces al mismo estudiante en el mismo curso.

### Respuesta exitosa

`201 Created`

```json
{
  "id_inscripcion": 3,
  "curso_id": 1,
  "estudiante_id": 2,
  "fecha_inscripcion": "2026-09-23T16:00:00.000Z",
  "estado": "activa"
}
```

### Errores relevantes

* `400` — faltan `estudiante_id` o `codigo_acceso`.
* `400` — el usuario no tiene rol de estudiante.
* `404` — estudiante no encontrado.
* `404` — código de acceso inválido.
* `409` — el estudiante ya está inscrito en el curso.

## 2. Asignación directa de estudiante por correo

`POST /api/v1/courses/:id/assign`

### Parámetro de ruta

`id` corresponde al `id_curso`.

### Body enviado por el frontend

```json
{
  "email": "estudiante@correo.edu"
}
```

### Reglas

* El curso debe existir.
* El correo debe corresponder a un usuario existente.
* El usuario debe tener rol `estudiante`.
* No se permite registrar dos veces al mismo estudiante en el mismo curso.

### Respuesta exitosa

`201 Created`

```json
{
  "id_inscripcion": 4,
  "curso_id": 1,
  "estudiante_id": 3,
  "fecha_inscripcion": "2026-09-23T16:00:00.000Z",
  "estado": "activa"
}
```

### Errores relevantes

* `400` — el `id` del curso no es válido.
* `400` — no se proporcionó el correo.
* `400` — el usuario no tiene rol de estudiante.
* `404` — curso no encontrado.
* `404` — estudiante no encontrado.
* `409` — el estudiante ya está inscrito en el curso.

## 3. Generación del código de acceso

`POST /api/v1/courses/:id/access-code`

Este endpoint genera y almacena un código de acceso único para el curso.

### Respuesta exitosa

`200 OK`

```json
{
  "id_curso": 1,
  "codigo_acceso": "ABCD2345"
}
```

El backend genera códigos de 8 caracteres utilizando letras mayúsculas y números, evitando caracteres ambiguos.

## 4. Consulta de cursos

`GET /api/v1/courses`

El frontend utiliza este endpoint para obtener los cursos disponibles en el formulario de asignación directa.

La respuesta corresponde a la colección de cursos almacenados en la tabla `curso`.

Ejemplo:

```json
[
  {
    "id_curso": 1,
    "nombre": "Literatura Anglófona",
    "periodo": "2026-2",
    "fecha_inicio": "2026-08-01",
    "fecha_fin": "2026-12-15",
    "docente_id": 1,
    "estado": "abierto",
    "codigo_acceso": "ABCD2345"
  }
]
```

## 5. Integración actual del frontend

El cliente de inscripciones utiliza:

| Operación              | Método | Endpoint                          |
| ---------------------- | ------ | --------------------------------- |
| Inscribirse por código | POST   | `/api/v1/courses/enroll`          |
| Asignar por correo     | POST   | `/api/v1/courses/:id/assign`      |
| Generar código         | POST   | `/api/v1/courses/:id/access-code` |
| Listar cursos          | GET    | `/api/v1/courses`                 |

Actualmente `estudiante_id` todavía se obtiene desde la identificación simulada del frontend.

Con la integración de HU-015, la identificación del estudiante deberá derivarse de la sesión autenticada y dejar de depender de `VITE_ESTUDIANTE_ID_SIMULADO`.

## 6. Manejo de errores

El frontend utiliza `httpClient.js`, que transforma las respuestas no exitosas del backend en errores mediante `error.message`.

Cuando la API devuelve:

```json
{
  "error": "Mensaje del error"
}
```

el mensaje es mostrado por la interfaz.

## 7. Estado de los mocks

Los mocks utilizados específicamente por HU-014 fueron eliminados:

```text
src/cliente-api/mocks/inscripcionesMock.js
src/cliente-api/mocks/cursosMock.js
```

La lógica de inscripción y consulta de cursos utiliza actualmente el backend real.

La carpeta `src/cliente-api/mocks/` puede mantenerse mientras otras historias de usuario continúen dependiendo de mocks.
