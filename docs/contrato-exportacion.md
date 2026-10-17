# Contrato de datos — Exportar mazos y quices a PDF (HU-3.3)

Este documento describe lo que el frontend implementa y consume para exportar mazos y quices
a PDF (HU-3.3 en el backlog Gherkin; HU-009 en la numeración de sprint del equipo). Refleja la
implementación real del backend (rama `develop`) y su contrato
`docs/CONTRATO_FRONTEND_HU-3.3.md`.

Última actualización: 2026-10-09.

## Origen de la información
- HU-3.3 y criterios CA-3.3.1, CA-3.3.2 y CA-3.3.3 (backlog Gherkin).
- Contrato del backend `docs/CONTRATO_FRONTEND_HU-3.3.md` (actualizado el 2026-10-07).
- `MazoController.exportarPdf`, `QuizController.exportarPdf`, `mazoRoutes.js` y `quizRoutes.js`
  del backend (rama `develop`).
- `docs/contrato-quiz.md` (frontend): decisión del 2026-10-08 de que el listado de quices
  corresponde a HU-3.3.

## Endpoints

| Método y ruta                     | Archivo descargado | Quién lo usa | Criterio |
|-----------------------------------|--------------------|--------------|----------|
| `GET /api/v1/decks/:id/export-pdf`   | `mazo-{id}.pdf` | Docente | CA-3.3.1, CA-3.3.3 |
| `GET /api/v1/quizzes/:id/export-pdf` | `quiz-{id}.pdf` | Docente | CA-3.3.2, CA-3.3.3 |
| `GET /api/v1/quizzes`                | (JSON, lista)   | Docente | Elegir el quiz a exportar (CA-3.3.2) |

Nota: el endpoint de PDF del quiz no está en el backlog; es un adicional aprobado por el equipo
(2026-10-07) porque CA-3.3.2 pide el PDF del quiz.

## Autenticación y autorización
- Los dos endpoints de PDF exigen `Authorization: Bearer <token>` de un usuario con rol
  **docente**. Sin token responden 401; con otro rol, 403.
- Decisión del equipo: por ahora solo exporta la docente. CA-3.3.1 menciona «docente o
  estudiante»; queda anotado para reconsiderar el PDF del mazo para estudiantes.
- El frontend muestra los botones solo con rol docente (`MazoItem` con `rol === 'docente'` y la
  pantalla `/docente/quices`, protegida por `RutaSoloDocente`).

## Respuesta exitosa
- HTTP 200, `Content-Type: application/pdf`, `Content-Disposition: attachment`. **No es JSON.**
- `apiRequest` no sirve para estos endpoints porque siempre llama a `response.json()`. El
  frontend usa `apiDescargarArchivo` (`httpClient.js`): pide el archivo con el token de la
  sesión, lo lee como blob y dispara la descarga.
- El nombre del archivo lo define el frontend (`mazo-{id}.pdf`, `quiz-{id}.pdf`), porque el
  navegador no expone la cabecera `Content-Disposition` en peticiones CORS por defecto.

### Qué contiene cada PDF
- **Mazo:** encabezado con lectura, autor, semana y variante regional; por cada tarjeta término,
  traducción, definición y, si existen, ejemplo y contexto. **Solo tarjetas `revisado_docente`.**
- **Quiz:** hoja de preguntas con sus opciones y, en página separada, la hoja de respuestas para
  la docente. El PDF incluye la clave de respuestas: por eso solo lo descarga la docente.
- Un mazo sin tarjetas aprobadas **no da error**: el PDF trae el aviso «Este mazo todavía no
  tiene tarjetas revisado_docente para exportar». El frontend no deshabilita el botón porque el
  listado de mazos (`GET /decks`) no trae el número de tarjetas aprobadas.

## Errores

El backend responde `{ "error": "mensaje legible" }` con el código HTTP correspondiente.

| HTTP | Mensaje del backend (resumen) | Qué muestra el frontend |
|------|--------------------------------|--------------------------|
| 401  | `Token de autenticación no proporcionado` / `Token inválido o expirado` | «Tu sesión venció…» y cierra la sesión |
| 403  | `No tiene permisos para acceder a este recurso` | «Tu cuenta no tiene rol docente…» |
| 400  | `id inválido` | El mensaje del backend |
| 404  | `Mazo no encontrado` / `Quiz no encontrado` | El mensaje del backend |
| 404  | `El quiz no tiene preguntas generadas todavía` | El mensaje del backend |
| 500  | (mensaje técnico, p. ej. carácter que la fuente del PDF no soporta) | «No se pudo generar el PDF. Intenta de nuevo.» |

Limitación conocida: `apiDescargarArchivo` (igual que `apiRequest`) no expone el código HTTP,
solo el mensaje. Por eso el frontend reconoce cada caso por su texto
(`clasificarErrorExportacion` en `exportarPdf.constants.js`) y cualquier mensaje desconocido, como
un 500 técnico o un fallo de red, se reemplaza por el mensaje genérico.

## Dónde está en la interfaz
- **Mazos de estudio** (`/docente/mazos`): botón «Exportar a PDF» en la tarjeta de cada mazo,
  junto a «Cerrar/Abrir mazo». Solo rol docente.
- **Quices** (`/docente/quices`):
  - Botón «Exportar versión impresa» junto a la vista previa del quiz recién generado.
  - Lista «Quices generados» (`GET /quizzes`, más recientes primero) con un botón por quiz. Se
    recarga al generar un quiz nuevo. Permite exportar un quiz aunque ya se haya recargado la página.
- Mientras se genera el PDF el botón muestra «Generando PDF…» y se bloquea para no pedirlo dos
  veces.

## Modo con datos simulados
No hay mock de PDF. Con `VITE_USE_MOCK=true` las exportaciones avisan que no están disponibles
con datos simulados; para probarlas hay que usar el backend real (`VITE_USE_MOCK=false`).

## Supuestos pendientes de validar
1. **Solo tarjetas aprobadas en el PDF del mazo:** el backlog no aclara si deben ir todas; el
   backend exporta únicamente las `revisado_docente`.
2. **Caracteres especiales:** la fuente del PDF cubre español e inglés, pero un emoji o un
   alfabeto no latino hace fallar la exportación con 500.
3. **Listado de quices:** `GET /quizzes` devuelve los quices de todos los cursos y no está
   protegido por rol en el backend. El frontend lo muestra tal cual, sin filtrar por curso.

## Fuera del alcance de esta historia
- Exportar el PDF del mazo desde el rol estudiante (decisión del equipo, ver «Autenticación»).
- Previsualizar el PDF dentro de la aplicación: solo se descarga.

## Historial de cambios
### 2026-10-09
- Primera versión: cliente `exportacionesApi.js`, helper `apiDescargarArchivo`, botón
  `BotonExportarPdf`, botón en `MazoItem` y en la pantalla de quices, y lista de quices generados.
