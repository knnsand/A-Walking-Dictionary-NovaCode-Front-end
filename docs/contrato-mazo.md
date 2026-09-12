# Contrato de datos — Mazo

Este documento describe la forma de datos que el frontend espera enviar y
recibir para el recurso `Mazo`, basado en la clase `Mazo` del backend y en
los criterios de aceptación de HU-001 (Entrega 1, EPIC-001). No reemplaza el
modelo de datos real, que vive en el repositorio de backend; es un contrato
de referencia para el frontend.

## Origen de la información
- Clase `Mazo` (backend), compartida por el equipo el 2026-09-04.
- HU-001 — Criterios de aceptación y especificaciones técnicas (Entrega 1, p.19-20).
- Confirmaciones del equipo durante la implementación (2026-09-05).

## Endpoint confirmado
`POST /api/v1/decks`

## Forma del objeto Mazo

| Campo                              | Tipo (frontend)   | Origen                          | Obligatorio en el formulario |
|-------------------------------------|-------------------|----------------------------------|-------------------------------|
| `id_mazo`                           | string/number     | Generado por el backend          | No |
| `curso_id`                          | number            | Seleccionado de una lista (ver dependencia GET /api/v1/courses) | Sí — campo `<select>` |
| `docente_id`                        | number            | Temporalmente desde `VITE_DOCENTE_ID_SIMULADO`; posteriormente desde la sesión autenticada | Sí — lo envía el frontend mientras no exista HU-015 |
| `nombre_lectura`                    | string            | Formulario                       | Sí |
| `autor`                             | string            | Formulario                       | Sí |
| `semana`                            | string/number     | Formulario                       | Sí |
| `variante_regional_predeterminada`  | string            | Formulario (lista fija: Británico, Nigeriano, Jamaicano, Ghanés) | Sí |
| `estado`                            | string (`"abierto"`\|`"cerrado"`) | Formulario, default `"abierto"` | Sí, con valor por defecto |
| `fecha_apertura`                    | string (ISO date) | Formulario                       | **No** — confirmado por backend (William): la gestiona el frontend |
| `fecha_cierre`                      | string (ISO date) | Formulario                       | **No** — confirmado por backend (William): la gestiona el frontend |
| `fecha_creacion`                    | string (ISO date) | Generado por el backend          | No — nunca la envía el frontend |

## Reglas de validación (frontend)
- `fecha_cierre` debe ser igual o posterior a `fecha_apertura`.
- Solo un usuario con rol Docente puede acceder al formulario (restricción de UX sobre el rol simulado del Sprint 1; la validación real de seguridad debe existir también en el backend — pendiente de confirmar con el equipo de backend).

## Dependencia de cursos

- El frontend obtiene los cursos mediante `GET /api/v1/courses`.
- Para la integración actual se utiliza el backend real con `VITE_USE_MOCK=false`.

## Docente simulado para creación de mazos (temporal, Sprint 1)

**Decisión:** mientras no exista HU-015 (login real), el frontend obtiene el `docente_id`
que envía en `POST /api/v1/decks` desde la variable de entorno `VITE_DOCENTE_ID_SIMULADO`,
expuesta a través de `AuthContext`/`AuthProvider` — mismo mecanismo ya usado para simular
el `rol`.

**Valor esperado:** debe coincidir con el `id_usuario` del docente sembrado en `seed.sql`
del backend ("Ana Docente"). Verificar con:
`SELECT id_usuario, nombre_completo, rol FROM usuario WHERE rol = 'docente';`

**Pendiente de eliminar cuando llegue HU-015:** en ese momento, `docente_id` debe derivarse
de la sesión autenticada (token JWT), no de una variable de entorno — tal como ya lo
anticipa el comentario de `MazoController.crear()` en el backend.