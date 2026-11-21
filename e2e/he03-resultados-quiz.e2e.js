// HU-022 — Panel docente de revisión de resultados de quices (épica HE-03), con sesión de docente
//
// La preparación crea su propio quiz abierto en Literatura Anglófona: Juan lo responde bien,
// María lo envía en blanco y Carlos no lo presenta. Las estadísticas esperadas se leen de la API
// (dependen de cuántos estudiantes haya inscritos cuando corre la prueba).

import { test, expect } from '@playwright/test';
import { api, iniciarSesion } from './soporte/sesion.js';

const TITULO_QUIZ = `Quiz de resultados (E2E) ${Date.now()}`;
let quiz;
let preguntas;

/** Envía el quiz como `estudiante`, contestando bien si `bien`, o en blanco si no. */
async function responderQuiz(estudiante, bien) {
  await api('POST', `/quizzes/${quiz.id_quiz}/submit`, estudiante, {
    fecha_inicio: new Date(Date.now() - 2 * 60000).toISOString(),
    respuestas: preguntas.map((p) => ({
      pregunta_id: p.id_pregunta,
      respuesta_estudiante: bien ? p.respuesta_correcta : null,
    })),
  });
}

const filaDe = (page, estudiante) => page.getByRole('row').filter({ hasText: estudiante });
const indicador = (page, nombre) => page.getByRole('article').filter({ hasText: new RegExp(`^${nombre}`) });

test.beforeAll(async () => {
  ({ quiz, preguntas } = await api('POST', '/quizzes/generate', 'ana', {
    curso_id: 1,
    titulo: TITULO_QUIZ,
    mazo_ids: [1, 2],
    fecha_apertura: new Date(Date.now() - 60000).toISOString(),
    fecha_cierre: new Date(Date.now() + 2 * 3600000).toISOString(),
    tiempo_limite_min: 20,
    cantidad_preguntas: 4,
  }));
  await responderQuiz('juan', true);
  await responderQuiz('maria', false);
});

test.describe('HU-022 — Revisión de resultados de quices', () => {
  test.beforeEach(async ({ context }) => {
    await iniciarSesion(context, 'ana');
  });

  test('CA-22.1 La docente abre el panel de resultados desde la lista de quices', async ({ page }) => {
    await page.goto('/docente/quices');
    await page.getByRole('link', { name: `View results for quiz ${TITULO_QUIZ}` }).click();

    await expect(page).toHaveURL(new RegExp(`/docente/quices/${quiz.id_quiz}/resultados$`));
    await expect(page.getByRole('heading', { name: TITULO_QUIZ })).toBeVisible();
    await page.getByRole('link', { name: 'Back to quizzes' }).click();
    await expect(page).toHaveURL(/\/docente\/quices$/);
  });

  test('CA-22.2 Muestra estadísticas, resultados individuales y las preguntas más difíciles', async ({ page }) => {
    const { estadisticas } = await api('GET', `/quizzes/${quiz.id_quiz}/teacher-results`, 'ana');
    await page.goto(`/docente/quices/${quiz.id_quiz}/resultados`);

    await expect(indicador(page, 'Participants')).toContainText('2');
    await expect(indicador(page, 'Average')).toContainText('2.50');
    await expect(indicador(page, 'Highest grade')).toContainText('5.00');
    await expect(indicador(page, 'Lowest grade')).toContainText('0.00');
    await expect(indicador(page, 'Participation')).toContainText(`${estadisticas.porcentaje_participacion}%`);

    await expect(filaDe(page, 'Juan Estudiante')).toContainText('5.00');
    await expect(filaDe(page, 'Juan Estudiante')).toContainText('4/4');
    await expect(filaDe(page, 'Maria Estudiante')).toContainText('0/4');
    // Quien no presentó aparece marcado y sin botón de respuestas.
    await expect(filaDe(page, 'Carlos Estudiante')).toContainText('Not submitted');
    await expect(filaDe(page, 'Carlos Estudiante').getByRole('button', { name: 'View answers' })).toHaveCount(0);

    // Juan acertó todo y María nada: cada pregunta tiene 50 % de error.
    await expect(page.getByRole('heading', { name: 'Most difficult questions' })).toBeVisible();
    await expect(page.getByText('50%', { exact: true })).toHaveCount(preguntas.length);
  });

  test('CA-22.3 La docente revisa las respuestas de cada estudiante', async ({ page }) => {
    await page.goto(`/docente/quices/${quiz.id_quiz}/resultados`);

    await filaDe(page, 'Maria Estudiante').getByRole('button', { name: 'View answers' }).click();
    await expect(page.getByRole('heading', { name: 'Answers by: Maria Estudiante' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 4, name: /^Question \d+$/ })).toHaveCount(preguntas.length);
    await expect(page.getByText("Student's answer: Unanswered")).toHaveCount(preguntas.length);
    await expect(page.getByText('Incorrect', { exact: true })).toHaveCount(preguntas.length);

    await filaDe(page, 'Juan Estudiante').getByRole('button', { name: 'View answers' }).click();
    await expect(page.getByRole('heading', { name: 'Answers by: Juan Estudiante' })).toBeVisible();
    await expect(page.getByText('Correct', { exact: true })).toHaveCount(preguntas.length);
    await expect(page.getByText('Incorrect', { exact: true })).toHaveCount(0);
  });

  test('CA-22.4 Solo la docente consulta los resultados: estudiante y administrador reciben 403', async () => {
    for (const usuario of ['juan', 'admin']) {
      await expect(api('GET', `/quizzes/${quiz.id_quiz}/teacher-results`, usuario)).rejects.toThrow(/ 403 /);
    }
  });

  test('CA-22.4 Un estudiante que abre la ruta del panel vuelve a su propia vista', async ({ browser }) => {
    const contexto = await browser.newContext();
    await iniciarSesion(contexto, 'juan');
    const pagina = await contexto.newPage();
    await pagina.goto(`/docente/quices/${quiz.id_quiz}/resultados`);

    await expect(pagina).toHaveURL(/\/estudiante\/mazos$/);
    await expect(pagina.getByText('Quiz results review')).toHaveCount(0);
    await contexto.close();
  });
});
