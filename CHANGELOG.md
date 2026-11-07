# Changelog

Todos los cambios relevantes del front-end se documentan aquí. El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Aún no se ha publicado ninguna versión (no hay etiquetas de git; `package.json` está en 0.0.0), por eso todo está en «Sin publicar».

Notas:
- Fechas en formato AAAA-MM-DD. `#N` es el número del Pull Request.
- `HU-x.y` es la numeración del backlog; `HU-0xx` es la numeración de sprint del equipo.
- Este es un resumen construido a partir del historial de git.

## [Sin publicar]

### Agregado
- 2026-11-02 · HU-021: reporte de resultados por quiz en PDF. (#65)
- 2026-10-30 · HU-019: reporte del modo de estudio en PDF. (#63)
- 2026-10-30 · Aviso al back-end para reconstruir el SUPERPROMPT en cada fusión a `develop`. (#64)
- 2026-10-29 · HU-020: reporte de estudiantes del curso en PDF. (#61)
- 2026-10-29 · Documentación del código con comentarios estilo Doxygen. (#60)
- 2026-10-28 · HU-018: reporte de progreso individual en PDF. (#59)
- 2026-10-23 · Plantilla de Pull Request. (#58)
- 2026-10-22 · SonarQube Cloud (#56), pruebas de cobertura con Vitest (#54) y diccionario global de vocabulario aprobado, HU-016 (#52, #53).
- 2026-10-21 · CI del front (lint, pruebas y build) y análisis estático con CodeQL. (#49)
- 2026-10-20 · Tablero de métricas de las pruebas E2E. (#47)
- 2026-10-19 · HU-011: sugerencias de palabras relacionadas. (#46)
- 2026-10-18 · Pruebas E2E con Playwright y su workflow. (#45)
- 2026-10-18 · HU-009: exportar a PDF. (#44)
- 2026-10-10 · HU-3.2: responder quiz con temporizador. (#43)
- 2026-10-08 · HU-3.1: generar quiz acumulativo. (#42)
- 2026-10-06 · HU-001: crear mazos. (#39)
- 2026-10-02 · HU-010: estudio con repetición espaciada (SM-2). (#32)
- 2026-09-23 a 2026-09-29 · Perfil académico, HU-013 (#16); inscripción a cursos, HU-014 (#17); login con Google, HU-015 (#18); registro de estudiante, HU-012.
- 2026-09-26 · HU-006: analítica de participación. (#22)

### Cambiado
- 2026-10-14 a 2026-10-22 · Interfaz migrada a inglés con `i18next` y `react-i18next`; textos en `src/i18n/locales/en.json`. (#46, #48, #50, #51)
- 2026-10-08 · Se quita el rechazo en las coautorías, porque el backend ya no lo tiene. (#41)
- 2026-10-03 a 2026-10-06 · Mejoras visuales y modo oscuro. (#35, #37, #40)

### Corregido
- 2026-10-30 · Ajuste del modo oscuro.
- 2026-10-01 · Reescritura de rutas SPA para Vercel (`vercel.json`). (#30)

### Seguridad
- 2026-10-22 · Issues de SonarCloud: CSRF, promesas flotantes y accesibilidad. (#57)
- 2026-10-16 · H-10: actualización de dependencias vulnerables.