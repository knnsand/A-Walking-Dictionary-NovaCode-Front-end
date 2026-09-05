# Contrato de datos — Mazo

Este documento describe la forma de datos que el frontend espera enviar y
recibir para el recurso `Mazo`, basado en la clase `Mazo` ya definida en el
repositorio de backend y en las especificaciones técnicas de HU-001
(Entrega 1, EPIC-001). No reemplaza el modelo de datos real, que vive en el
repositorio de backend; es un contrato de referencia para el frontend.

## Origen de la información
- Clase `Mazo` (backend), compartida por el equipo el 2026-09-04.
- HU-001 — Criterios de aceptación y especificaciones técnicas (Entrega 1, p.19-20).

## Forma del objeto Mazo

| Campo                              | Tipo (frontend) | Origen                          | Obligatorio en el formulario |
|-------------------------------------|------------------|----------------------------------|-------------------------------|
| `id_mazo`                           | string/number    | Generado por el backend          | No |
| `curso_id`                          | number           | Seleccionado de una lista (ver dependencia GET /api/v1/courses) | Sí — campo `<select>` |
| `id_docente`                        | string/number    | Inferido de la sesión (backend)  | No — nunca lo envía el frontend |
| `nombre_lectura`                    | string           | Formulario                       | Sí |
| `autor`                             | string           | Formulario                       | Sí |
| `semana`                            | string/number    | Formulario                       | Sí |
| `variante_regional_predeterminada`  | string           | Formulario (lista fija)          | Sí |
| `estado`                            | string (`"abierto"`\|`"cerrado"`) | Formulario, default `"abierto"` | Sí, con valor por defecto |
| `fecha_apertura` / `fecha_cierre`   | string (ISO date)| Formulario                       | Pendiente (no está en criterios de aceptación) |
| `fecha_creacion`                    | string (ISO date)| Generado por el backend          | No |



## Pendiente real (no resuelto)
- Endpoint para listar cursos (`GET /api/v1/courses` sugerido). Mientras no exista,
  se usará mock local con un único curso, siguiendo el mismo patrón de VITE_USE_MOCK.

## Ejemplo de payload esperado al crear un mazo (HU-001)

```json
{
  "curso_id": 1,
  "nombre_lectura": "Things Fall Apart",
  "autor": "Chinua Achebe",
  "semana": 3,
  "variante_regional_predeterminada": "nigeriano",
  "estado": "abierto",
  "fecha_apertura": "2026-09-08",
  "fecha_cierre": "2026-09-14"
}
```

`curso_id: 1` se usa como valor de ejemplo únicamente;
## Actualizacion

1. Ausencia de `id_docente` en la clase `Mazo` del backend, pese a que Entrega 1
   lo menciona como llave foránea de la tabla `mazos` entonces sera agregada
2. Ruta real del endpoint: Entrega 1 documenta `POST /api/v1/decks`;
3. Si `curso_id`  debe ser seleccionado por la docente.