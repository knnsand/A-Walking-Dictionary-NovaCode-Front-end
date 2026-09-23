# Contrato: Perfil Académico del Estudiante (HU-013)

**Estado:** Frontend preparado para integración con el backend real.
El frontend ya no utiliza mocks para HU-013 (`VITE_USE_MOCK=false`).

La implementación del backend de HU-013 existe en su rama de desarrollo y queda pendiente su integración en `develop`.

## 1. Actualizar perfil

`PATCH /api/v1/users/profile`

### Body enviado por el frontend

```json
{
  "estudiante_id": 2,
  "nivel_ingles": "B1",
  "codigo_estudiantil": "20221234",
  "avatar": "https://ejemplo.com/avatar.jpg",
  "intereses": [
    "programación",
    "música",
    "videojuegos"
  ]
}
```

### Consideraciones

* `estudiante_id` viaja actualmente en el body porque la autenticación real todavía no está integrada en el frontend. El valor actual proviene de `VITE_ESTUDIANTE_ID_SIMULADO`.
* Este uso de `estudiante_id` es temporal. Con la integración de HU-015, el identificador deberá derivarse del usuario autenticado y no depender de una variable simulada.
* `nivel_ingles` debe pertenecer al conjunto:
  `A1`, `A2`, `B1`, `B2`, `C1`, `C2`.
* `codigo_estudiantil` admite máximo 20 caracteres.
* `avatar` admite máximo 500 caracteres y no puede enviarse como `data:` URI ni como Base64.
* `intereses` se maneja como un arreglo de cadenas no vacías.

### Respuesta esperada (200)

La respuesta contiene el perfil actualizado:

```json
{
  "estudiante_id": 2,
  "nombre_completo": "Juan Estudiante",
  "correo": "juan.estudiante@correo.edu",
  "rol": "Estudiante",
  "nivel_ingles": "B1",
  "codigo_estudiantil": "20221234",
  "avatar": "https://ejemplo.com/avatar.jpg",
  "intereses": [
    "programación",
    "música",
    "videojuegos"
  ]
}
```

### Errores

El frontend utiliza `error.message` para mostrar los errores de las respuestas no exitosas.

`httpClient.js` espera, cuando es posible, un cuerpo con la estructura:

```json
{
  "error": "Mensaje del error"
}
```

## 2. Leer perfil

`GET /api/v1/users/:id`

Este endpoint se utiliza para precargar la información del estudiante en la pantalla de configuración del perfil.

### Respuesta esperada

```json
{
  "estudiante_id": 2,
  "nombre_completo": "Juan Estudiante",
  "correo": "juan.estudiante@correo.edu",
  "rol": "Estudiante",
  "nivel_ingles": "B1",
  "codigo_estudiantil": "20221234",
  "avatar": "https://ejemplo.com/avatar.jpg",
  "intereses": [
    "programación",
    "música"
  ]
}
```

## 3. Contexto académico

`GET /api/v1/students/:id/context`

Este endpoint proporciona información académica derivada de la relación del estudiante con sus cursos e inscripciones.

### Respuesta esperada

```json
{
  "estudiante_id": 2,
  "curso_asignado": "Literatura Anglófona",
  "semestre_activo": "2026-2",
  "departamento_universidad": null
}
```

### Consideraciones

* `curso_asignado` y `semestre_activo` se obtienen a partir de la información de inscripción del estudiante.
* `departamento_universidad` actualmente puede retornar `null`, debido a que no existe una fuente de datos implementada para ese valor.
* El frontend debe mostrar el valor recibido por el backend y no asumir un valor fijo.

## 4. Campos persistidos

El backend de HU-013 incorpora los siguientes campos asociados al perfil del estudiante:

| Campo                | Tipo / restricción                   |
| -------------------- | ------------------------------------ |
| `nivel_ingles`       | Valores MCER: A1, A2, B1, B2, C1, C2 |
| `codigo_estudiantil` | `VARCHAR(20)`                        |
| `avatar`             | `VARCHAR(500)`                       |
| `intereses`          | Arreglo de cadenas (`TEXT[]`)        |

## 5. Integración con autenticación

Actualmente HU-013 utiliza temporalmente `estudiante_id` para identificar al estudiante.

Con la integración de HU-015:

* El usuario será identificado mediante autenticación.
* Las peticiones deberán utilizar el JWT recibido durante el inicio de sesión.
* El frontend dejará de depender de `VITE_ESTUDIANTE_ID_SIMULADO`.
* Las rutas que requieran autenticación deberán enviar el token mediante:

```http
Authorization: Bearer <token>
```

## 6. Endpoints utilizados por el frontend

| Operación                    | Método | Endpoint                       |
| ---------------------------- | ------ | ------------------------------ |
| Consultar perfil             | GET    | `/api/v1/users/:id`            |
| Actualizar perfil            | PATCH  | `/api/v1/users/profile`        |
| Consultar contexto académico | GET    | `/api/v1/students/:id/context` |

## 7. Estado de los mocks

HU-013 ya no depende de los mocks para ejecutar las operaciones de perfil.

El archivo:

```text
src/cliente-api/mocks/perfilMock.js
```

fue eliminado después de migrar las llamadas a los endpoints reales.

La carpeta `src/cliente-api/mocks/` puede continuar existiendo mientras otras historias de usuario todavía utilicen mocks.
