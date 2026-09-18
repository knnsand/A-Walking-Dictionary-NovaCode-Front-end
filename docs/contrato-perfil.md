# Contrato: Perfil Académico del Estudiante (HU-013)

**Estado:** Frontend implementado contra mocks (`VITE_USE_MOCK=true`). El backend aún no implementa estos endpoints.
**CA de referencia:** CA-5.2.1 (Escenarios de Diseño) — alcance acotado a nivel MCER, código estudiantil y avatar. El equipo decidió alinear el MVP estrictamente con el CA-5.2.1, que es el criterio ejecutable.

## 1. Actualizar perfil

`PATCH /api/v1/users/profile`

**Body enviado por el frontend:**
```json
{
  "estudiante_id": 2,
  "nivel_ingles": "B1",
  "codigo_estudiantil": "20221234",
  "avatar": "data:image/png;base64,..."
}
```

- `estudiante_id` viaja en el body (no en la ruta ni en un token) porque todavía no existe autenticación real (HU-015). El frontend lo obtiene de `VITE_ESTUDIANTE_ID_SIMULADO`. Mismo patrón usado en HU-001/002/014.
- `avatar`: el mock lo trata como string (base64 data URI, producido por `FileReader.readAsDataURL` en el navegador). **Esto es una simplificación del mock, no una implementación real** — ver punto 5.1.

**Respuesta esperada (200) — debe incluir el perfil completo, no solo los campos modificados:**
```json
{
  "estudiante_id": 2,
  "nombre_completo": "Juan Estudiante",
  "correo": "juan.estudiante@correo.edu",
  "rol": "Estudiante",
  "nivel_ingles": "B1",
  "codigo_estudiantil": "20221234",
  "avatar": "..."
}
```

**Errores:** el frontend lee `error.message` asumiendo el formato `{"error": "mensaje"}` en respuestas no-2xx — mismo contrato que usa `httpClient.js` en el resto del proyecto.

## 2. Leer perfil (precarga del formulario)

`GET /api/v1/users/:estudiante_id` → mismo shape que la respuesta del PATCH.

`usuarioRoutes.js` ya define `GET /:id` vía `UsuarioController`, pero no está montada en `app.js`. Si al montarla ya devuelve estos campos (una vez existan en la tabla), probablemente no haga falta un endpoint nuevo.

## 3. Contexto académico (solo lectura)

`GET /api/v1/students/:estudiante_id/context`

```json
{
  "curso_asignado": "Literatura Anglófona",
  "semestre_activo": "2026-2",
  "departamento_universidad": "Universidad del Cauca - Departamento de Sistemas"
}
```

Este endpoint es una invención del frontend para el mock — no corresponde a ninguna ruta ni tabla existente. Antes de implementarlo, vale la pena evaluar:

- `curso_asignado` / `semestre_activo` se derivan de la inscripción del estudiante (HU-014) vía JOIN con `curso` — no deberían requerir columnas nuevas en `usuario`.

## 4. Brechas de esquema (`usuario`, `init.sql`)

| Columna requerida | ¿Existe hoy? |
|---|---|
| `nivel_ingles` | Sí (`VARCHAR(10)`) |
| `codigo_estudiantil` | **No** |
| `avatar` | **No** — tipo de dato pendiente (ver 5.1) |

## 5. Pendiente de decidir con backend

1. **Almacenamiento de `avatar`.** El mock usa base64. Opciones para la implementación real (de menor a mayor complejidad): (a) columna `TEXT` con URL a un servicio de almacenamiento externo, requiere endpoint de subida aparte; (b) columna `TEXT` con base64 directo, más simple pero no escala; (c) archivo en disco/volumen del contenedor + ruta en la columna. No hay recomendación tomada — depende de la infraestructura ya definida en `walking-dictionary-infra`.
2. **`GET /users/:id` genérico vs. endpoint dedicado de perfil**, simétrico al PATCH.
3. **Contexto académico:** ¿endpoint dedicado como el propuesto, o ya existe/está planeado algo de "mi inscripción" del que derivar esto sin construir uno nuevo?