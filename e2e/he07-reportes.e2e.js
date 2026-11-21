// HE-07 — Generación de reportes (HU-018 a HU-021): descarga de los PDF desde la interfaz, con
// sesión de estudiante y de docente, y restricción de acceso por la API.
//
// La preparación no depende de otras pruebas: crea su propio quiz abierto en Literatura Anglófona,
// que Juan responde bien, María envía sin contestar y Carlos no presenta, y Juan valora una
// tarjeta con "Repetir" para que aparezca entre las palabras de mayor dificultad. Carlos no tiene
// repasos ni quices en ninguna prueba: es el estudiante "sin actividad".
//
// Los textos que se buscan son los del PDF, que genera el back en español.

import { test, expect } from '@playwright/test';
import { api, firmarJwt, iniciarSesion, USUARIOS } from './soporte/sesion.js';
import { descargarPdf, textoDelPdf } from './soporte/pdf.js';
import { API_URL } from './soporte/entorno.js';

const CURSO = { id: 1, nombre: 'Literatura Anglófona' };
const TITULO_QUIZ = `Quiz de reportes (E2E) ${Date.now()}`;

let palabraDificil;

/** Descarga un PDF directo de la API como `usuario` (sin pasar por la interfaz). */
async function pdfDeApi(ruta, usuario) {
  const respuesta = await fetch(`${API_URL}/api/v1${ruta}`, {
    headers: { Authorization: `Bearer ${firmarJwt(USUARIOS[usuario])}` },
  });
  expect(respuesta.status).toBe(200);
  return textoDelPdf(Buffer.from(await respuesta.arrayBuffer()));
}

/** Envía el quiz como `estudiante`, contestando bien si `bien`, o en blanco si no. */
async function responderQuiz(estudiante, quiz, preguntas, bien) {
  await api('POST', `/quizzes/${quiz.id_quiz}/submit`, estudiante, {
    fecha_inicio: new Date(Date.now() - 2 * 60000).toISOString(),
    respuestas: preguntas.map((p) => ({
      pregunta_id: p.id_pregunta,
      respuesta_estudiante: bien ? p.respuesta_correcta : null,
    })),
  });
}

test.beforeAll(async () => {
  const { quiz, preguntas } = await api('POST', '/quizzes/generate', 'ana', {
    curso_id: CURSO.id,
    titulo: TITULO_QUIZ,
    mazo_ids: [1, 2],
    fecha_apertura: new Date(Date.now() - 60000).toISOString(),
    fecha_cierre: new Date(Date.now() + 2 * 3600000).toISOString(),
    tiempo_limite_min: 20,
    cantidad_preguntas: 4,
  });
  await responderQuiz('juan', quiz, preguntas, true);
  await responderQuiz('maria', quiz, preguntas, false);

  // Juan repasa una tarjeta y la marca "Repetir" (factor de facilidad SM-2 bajo).
  const { id_inscripcion } = await api('GET', `/students/${USUARIOS.juan.id_usuario}/context`, 'juan');
  const { tarjetas } = await api('POST', '/study/review-session', 'juan', { inscripcion_id: id_inscripcion });
  palabraDificil = tarjetas[0].palabra;
  for (let i = 0; i < 3; i++) {
    await api('POST', '/study/review-session/review', 'juan', {
      inscripcion_id: id_inscripcion,
      tarjeta_id: tarjetas[0].id_tarjeta,
      valoracion: 'Repetir',
    });
  }
});

test.describe('HU-018 — Reporte de progreso individual en PDF', () => {
  test('CA-18.1 + CA-18.2 El estudiante descarga su propio reporte con datos, aportes, quices y repaso', async ({ page, context }) => {
    await iniciarSesion(context, 'juan');
    await page.goto('/estudiante/progreso');

    const { nombre, texto } = await descargarPdf(page, page.getByRole('button', { name: 'Download PDF' }));

    expect(nombre).toBe(`student-progress-${USUARIOS.juan.id_usuario}.pdf`);
    expect(texto).toContain('REPORTE · PROGRESO INDIVIDUAL');
    expect(texto).toContain('Juan Estudiante');
    expect(texto).toMatch(/Código estudiantil\n\d+/);
    expect(texto).toMatch(/Nivel MCER\n[ABC][12]/);
    expect(texto).toContain('Palabras aportadas');
    expect(texto).toContain(TITULO_QUIZ); // CA-18.2: el quiz que presentó, con su calificación
    expect(texto).toMatch(/Tarjetas repasadas: [1-9]/);
    expect(texto).not.toContain('Maria Estudiante');
  });

  test('CA-18.1 + CA-18.2 La docente descarga el reporte de un estudiante sin actividad', async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto(`/docente/cursos/${CURSO.id}`);

    const { texto } = await descargarPdf(
      page,
      page.getByRole('button', { name: 'Download progress report for Carlos Estudiante' })
    );

    expect(texto).toContain('Carlos Estudiante');
    expect(texto).toContain('Sin actividad registrada');
  });

  test('CA-18.3 Un estudiante no puede descargar el reporte de otro (403)', async () => {
    await expect(
      api('GET', `/reports/students/${USUARIOS.maria.id_usuario}/progress/export-pdf`, 'juan')
    ).rejects.toThrow(/ 403 .*REPORT_FORBIDDEN/);
  });
});

test.describe('HU-019 — Reporte del modo de estudio en PDF', () => {
  test('CA-19.1 + CA-19.2 La docente descarga el reporte general: repaso por estudiante y palabras difíciles', async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto(`/docente/cursos/${CURSO.id}`);

    const { texto } = await descargarPdf(
      page,
      page.getByRole('button', { name: 'Download Study Mode Report PDF' })
    );

    expect(texto).toContain('REPORTE · MODO DE ESTUDIO');
    expect(texto).toContain('Juan Estudiante');
    expect(texto).toMatch(/Tarjetas repasadas: [1-9]\d* .*Repaso vencido: \d+/);
    for (const valoracion of ['Repetir', 'Difícil', 'Buena', 'Fácil']) expect(texto).toContain(valoracion);
    // Carlos no ha repasado.
    expect(texto).toMatch(/Carlos Estudiante[\s\S]*?Sin actividad de estudio/);
    // CA-19.2: la palabra marcada "Repetir" está entre las de mayor dificultad.
    expect(texto).toContain('Palabras de mayor dificultad');
    expect(texto).toContain(palabraDificil);
  });

  test('CA-19.1 El estudiante descarga solo su propio reporte del modo de estudio', async ({ page, context }) => {
    await iniciarSesion(context, 'juan');
    await page.goto('/estudiante/progreso');

    const { texto } = await descargarPdf(page, page.getByRole('button', { name: 'Download My Study Report' }));

    expect(texto).toContain('Juan Estudiante');
    expect(texto).toContain(palabraDificil);
    expect(texto).not.toContain('Maria Estudiante');
    expect(texto).not.toContain('Carlos Estudiante');
  });

  test('CA-19.3 Un estudiante no puede descargar el reporte de otro (403) ni ver al resto del grupo', async () => {
    await expect(
      api('GET', `/reports/study-mode/export-pdf?student_id=${USUARIOS.maria.id_usuario}`, 'juan')
    ).rejects.toThrow(/ 403 .*REPORT_FORBIDDEN/);

    // Sin student_id (el "reporte general"), el back le entrega solo el suyo (regla de
    // ReporteEstudioService, acordada por el equipo): no aparece ningún otro estudiante.
    const texto = await pdfDeApi('/reports/study-mode/export-pdf', 'juan');
    expect(texto).toContain('Juan Estudiante');
    expect(texto).not.toContain('Maria Estudiante');
    expect(texto).not.toContain('Carlos Estudiante');
  });
});

test.describe('HU-020 — Reporte de estudiantes del curso en PDF', () => {
  test('CA-20.1 + CA-20.2 La docente descarga el reporte del curso con aportes y notas de los quices', async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto(`/docente/cursos/${CURSO.id}`);

    const { texto } = await descargarPdf(
      page,
      // El nombre del curso se ve traducido en la interfaz; en el PDF va como está en la base.
      page.getByRole('button', { name: /^Export the report of all students in / })
    );

    expect(texto).toContain('REPORTE · ESTUDIANTES DEL CURSO');
    expect(texto).toContain(CURSO.nombre);
    expect(texto).toContain('Estudiantes y aportes');
    for (const estudiante of ['Juan Estudiante', 'Maria Estudiante', 'Carlos Estudiante']) {
      expect(texto).toContain(estudiante);
    }
    // CA-20.2: notas por quiz y "No presentó" para quien no lo envió (Carlos).
    expect(texto).toContain('Notas de los quices');
    expect(texto).toContain('Promedio');
    expect(texto).toContain('No presentó');
  });

  test('CA-20.3 Un estudiante no puede descargar el reporte del curso (403)', async () => {
    await expect(api('GET', `/reports/students/export-pdf?curso_id=${CURSO.id}`, 'juan')).rejects.toThrow(/ 403 /);
  });
});

test.describe('HU-021 — Reporte de resultados por quiz en PDF', () => {
  test('CA-21.1 + CA-21.2 La docente exporta los resultados del quiz con estadísticas del grupo', async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente/quices');

    const { texto } = await descargarPdf(
      page,
      page.getByRole('button', { name: `Export the results report of the quiz ${TITULO_QUIZ}` })
    );

    expect(texto).toContain('REPORTE · RESULTADOS DEL QUIZ');
    expect(texto).toContain(TITULO_QUIZ);
    expect(texto).toContain('Resultados individuales');
    expect(texto).toContain('Juan Estudiante');
    expect(texto).toContain('Maria Estudiante');
    expect(texto).toMatch(/Carlos Estudiante[\s\S]*?No presentó/);
    expect(texto).toContain('Estadísticas del grupo');
    expect(texto).toContain('Preguntas con mayor porcentaje de error');
  });

  test('CA-21.3 Un estudiante no puede descargar los resultados de un quiz (403)', async () => {
    const quices = await api('GET', '/quizzes', 'ana');
    const quiz = quices.find((q) => q.titulo === TITULO_QUIZ);
    await expect(api('GET', `/reports/quizzes/${quiz.id_quiz}/results/export-pdf`, 'juan')).rejects.toThrow(/ 403 /);
  });
});
