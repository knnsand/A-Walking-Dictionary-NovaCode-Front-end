# A Walking Dictionary 

Aplicación web de vocabulario contextualizado para el curso de Literatura Anglófona (Licenciatura en Educación Bilingüe, Universidad del Cauca). Digitaliza el ejercicio "A Walking Dictionary": los estudiantes registran palabras nuevas por lectura semanal, la docente las revisa y valida, y el sistema genera quices automáticos a partir del vocabulario aprobado.

## Equipo — Grupo 1

- Thalía Bernal
- Karen Sandoval
- William Serna
- Manuela Meneses

**Docente:** Ph.D. MSc. César Jesús Pardo Calvache — Proyecto II, Segundo Semestre 2026.

## Repositorios

| Repositorio | Contenido |
| --- | --- |
| [Front-end](https://github.com/knnsand/A-Walking-Dictionary-NovaCode-Front-end) (este) | Aplicación React, pruebas unitarias y E2E, contratos de datos y manuales de usuario |
| [Back-end](https://github.com/wsernam/A-Walking-Dictionary-NovaCode-Back-end) | API REST, esquema de base de datos, arquitectura y especificación de la API |

La documentación de ambos repositorios se indexa en [`docs/README.md`](docs/README.md).

## Stack técnico

| Capa | Tecnología |
| --- | --- |
| UI | React 19 (SPA), Vite 8, `react-router-dom` 7, `lucide-react` |
| Internacionalización | `i18next` + `react-i18next` (interfaz en inglés: `src/i18n/locales/en.json`) |
| Autenticación | Login con Google (`@react-oauth/google`); el backend emite el JWT |
| Pruebas | Vitest + Testing Library (unitarias), Playwright (E2E) |
| Calidad | ESLint, SonarQube Cloud, CodeQL |
| Despliegue | Vercel (`vercel.json` reescribe todas las rutas a `index.html`) |
| Backend | API REST de [este repositorio hermano](https://github.com/wsernam/A-Walking-Dictionary-NovaCode-Back-end) bajo `/api/v1` |

## Estructura del repositorio

```
.
├── src/
│   ├── cliente-api/      # Clientes HTTP de la API (un archivo por recurso) y mocks
│   ├── componentes/      # Componentes compartidos (comunes/)
│   ├── contexto/         # Contextos y proveedores (sesión, tema, encabezado)
│   ├── i18n/             # Configuración de i18next y textos (locales/en.json)
│   └── vistas/           # Pantallas por rol: autenticacion, docente, estudiante, invitado,
│                         # diccionario-global, mazos-estudio, quices
├── e2e/                  # Pruebas E2E con Playwright (ver e2e/README.md)
├── docs/                 # Documentación (ver docs/README.md)
├── public/               # Archivos estáticos
├── Dockerfile            # Imagen de desarrollo (Node 22, Vite en el puerto 3000)
└── vercel.json           # Reescritura SPA para Vercel
```

## Requisitos

- Node.js 22 (`.nvmrc`) y npm.
- El [backend](https://github.com/wsernam/A-Walking-Dictionary-NovaCode-Back-end) corriendo en `http://localhost:5000`, con `CORS_ORIGINS` que incluya `http://localhost:3000`.
- Un *Client ID* de Google OAuth (el mismo que usa el backend en `GOOGLE_CLIENT_ID`).

## Instalación y ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear el archivo de entorno a partir del ejemplo y completar los valores:
   ```bash
   cp .env.example .env.local
   ```
3. Arrancar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir `http://localhost:3000`.

Para generar la versión de producción: `npm run build` (la salida queda en `dist/`) y `npm run preview` para revisarla.

## Variables de entorno

Se leen con el prefijo `VITE_` de `.env.local` (plantilla: `.env.example`).

| Variable | Descripción |
| --- | --- |
| `VITE_API_BASE_URL` | URL base de la API. Local: `http://localhost:5000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth para el botón de login |
| `VITE_USE_MOCK` | `true` hace que los clientes de la API usen datos simulados en vez del backend |
| `VITE_DOCENTE_ID_SIMULADO` | Id del docente simulado (ver `.env.example`) |
| `VITE_INSCRIPCION_ID_SIMULADA` | Inscripción de respaldo si no se puede consultar la real (`AuthProvider.jsx`) |
| `VITE_ESTUDIANTE_ID_SIMULADO` | Id del estudiante simulado (ver `.env.example`) |

> `VITE_GOOGLE_CLIENT_ID` se usa en `src/main.jsx` pero todavía no aparece en `.env.example`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga (puerto 3000) |
| `npm run build` | Build de producción con Vite |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:coverage` | Pruebas unitarias con cobertura |
| `npm run test:e2e` | Pruebas E2E con Playwright (requieren backend y PostgreSQL; ver [`e2e/README.md`](e2e/README.md)) |
| `npm run test:e2e:resumen` | Genera el tablero HTML de métricas de la última ejecución E2E |

## Documentación

Índice completo en [`docs/README.md`](docs/README.md): contratos de datos con el backend, pruebas E2E y bitácora de trabajo con IA.

## Flujo de trabajo (Git)

Se sigue un flujo tipo **Gitflow**, adaptado al ritmo de sprints del curso (3 sprints en 16 semanas).


### Convenciones de nombre

- Minúsculas, palabras separadas por guion (`-`), sin tildes ni ñ.
- El nombre describe la funcionalidad o módulo, no la persona ni la fecha. Ej: `feature/gestion-electivas`, no `feature/manuela-tarea1`.
- Cuando la rama corresponde a una historia de usuario del backlog, se puede incluir el ID: `feature/HU-002-registro-palabra`.

## Contribuir

El flujo de trabajo (ramas, commits y Pull Requests) está en [`CONTRIBUTING.md`](CONTRIBUTING.md). Para reportar una vulnerabilidad, ver [`SECURITY.md`](SECURITY.md). El historial de cambios está en [`CHANGELOG.md`](CHANGELOG.md).
