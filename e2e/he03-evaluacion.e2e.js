// HE-03 — Evaluación Automatizada y Exportación (HU-3.1, HU-3.2, HU-3.3), desde el navegador

import { test, expect } from '@playwright/test';
import { iniciarSesion, api } from './soporte/sesion.js';

/** Valor para <input type="datetime-local"> en hora local del navegador (America/Bogota). */
function datetimeLocal(minutosDesdeAhora) {
  const fecha = new Date(Date.now() + minutosDesdeAhora * 60000);
  const bogota = new Date(fecha.getTime() - 5 * 3600000); // UTC-5, sin horario de verano
  return bogota.toISOString().slice(0, 16);
}

test.describe('HU-3.1 — Generar quices acumulativos', () => {
  test.beforeEach(async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente/quices');
  });

  test('CA-3.1.1 + CA-3.1.3 La docente genera un quiz programado con las tarjetas aprobadas', async ({ page }) => {
    await page.getByLabel('Curso').selectOption({ label: 'Literatura Anglófona' });
    await page.getByRole('checkbox', { name: /Stitch by Stitch/ }).check();
    await page.getByRole('checkbox', { name: /Just Ask!/ }).check();
    await page.getByLabel('Título del quiz').fill('Quiz acumulativo semanas 1 y 2 (E2E)');
    await page.getByLabel('Fecha y hora de apertura').fill(datetimeLocal(60 * 24));
    await page.getByLabel('Fecha y hora de cierre').fill(datetimeLocal(60 * 26));
    await page.getByLabel('Tiempo límite (minutos)').fill('30');
    await page.getByLabel('Cantidad de preguntas (opcional)').fill('5');
    await page.getByRole('button', { name: 'Generar Quiz' }).click();

    await expect(page.getByText('Quiz generado')).toBeVisible();
    await expect(page.getByText('Programado').first()).toBeVisible();
    // CA-3.1.2: la vista previa de la docente muestra las preguntas con su respuesta correcta
    await expect(page.getByRole('heading', { name: 'Vista previa (solo docente)' })).toBeVisible();
    await expect(page.getByText('Respuesta correcta')).toHaveCount(5);
  });

  test('CA-3.1.3 Validación: el cierre debe ser posterior a la apertura', async ({ page }) => {
    await page.getByLabel('Curso').selectOption({ label: 'Literatura Anglófona' });
    await page.getByRole('checkbox', { name: /Stitch by Stitch/ }).check();
    await page.getByLabel('Título del quiz').fill('Quiz inválido');
    await page.getByLabel('Fecha y hora de apertura').fill(datetimeLocal(120));
    await page.getByLabel('Fecha y hora de cierre').fill(datetimeLocal(60));
    await page.getByLabel('Tiempo límite (minutos)').fill('30');
    await page.getByRole('button', { name: 'Generar Quiz' }).click();
    await expect(page.getByText('El cierre debe ser posterior a la apertura.')).toBeVisible();
  });
});

test.describe('HU-3.2 — Responder quiz y recibir nota', () => {
  let quiz;
  let preguntas;

  /** Las opciones se ven como "C) remendar". */
  const opcion = (page, pregunta, texto) =>
    page
      .getByRole('group')
      .filter({ hasText: pregunta.enunciado })
      .getByRole('radio', { name: new RegExp(`^[A-D]\\) ${texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) });

  test.beforeAll(async () => {
    // Quiz abierto ahora mismo (por la interfaz la apertura solo puede ser futura)
    const generado = await api('POST', '/quizzes/generate', 'ana', {
      curso_id: 1,
      titulo: 'Quiz para responder (E2E)',
      mazo_ids: [1, 2],
      fecha_apertura: new Date(Date.now() - 60000).toISOString(),
      fecha_cierre: new Date(Date.now() + 2 * 3600000).toISOString(),
      tiempo_limite_min: 20,
      cantidad_preguntas: 4,
    });
    quiz = generado.quiz;
    preguntas = generado.preguntas;
  });

  test('CA-3.2.2 El estudiante responde, finaliza y ve su calificación con el desglose', async ({ page, context }) => {
    await iniciarSesion(context, 'juan');
    await page.goto(`/estudiante/quices/${quiz.id_quiz}`);
    await expect(page.getByRole('heading', { name: 'Quiz para responder (E2E)' })).toBeVisible();
    await page.getByRole('button', { name: 'Iniciar' }).click();

    // CA-3.2.1: hay cronómetro visible
    await expect(page.getByRole('timer')).toBeVisible();

    // Juan contesta todas bien
    for (const pregunta of preguntas) {
      await opcion(page, pregunta, pregunta.respuesta_correcta).check();
    }
    await page.getByRole('button', { name: 'Finalizar examen' }).click();

    await expect(page.getByRole('heading', { name: 'Resultado' })).toBeVisible();
    await expect(page.getByText('Calificación')).toBeVisible();
    await expect(page.getByText('5').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Detalle por pregunta' })).toBeVisible();
  });

  test('CA-3.2.2 Si faltan preguntas, avisa antes de enviar y las cuenta como incorrectas', async ({ page, context }) => {
    await iniciarSesion(context, 'maria');
    await page.goto(`/estudiante/quices/${quiz.id_quiz}`);
    await page.getByRole('button', { name: 'Iniciar' }).click();

    const primera = preguntas[0];
    await opcion(page, primera, primera.respuesta_correcta).check();
    await page.getByRole('button', { name: 'Finalizar examen' }).click();

    await expect(page.getByRole('alert')).toContainText(`Te faltan ${preguntas.length - 1} preguntas por contestar.`);
    await page.getByRole('button', { name: 'Enviar de todas formas' }).click();
    await expect(page.getByRole('heading', { name: 'Resultado' })).toBeVisible();
    await expect(page.getByText('Sin contestar').first()).toBeVisible();
  });

  test('CA-3.2.3 En el mismo navegador, al volver a entrar ve el resultado previo y no puede reintentar', async ({ page, context }) => {
    await iniciarSesion(context, 'carlos');
    await page.goto(`/estudiante/quices/${quiz.id_quiz}`);
    await page.getByRole('button', { name: 'Iniciar' }).click();
    await opcion(page, preguntas[0], preguntas[0].respuesta_correcta).check();
    await page.getByRole('button', { name: 'Finalizar examen' }).click();
    await page.getByRole('button', { name: 'Enviar de todas formas' }).click();
    await expect(page.getByRole('heading', { name: 'Resultado' })).toBeVisible();

    await page.goto(`/estudiante/quices/${quiz.id_quiz}`);
    await expect(page.getByText('Ya enviaste este quiz y no se permite un nuevo intento.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar' })).toHaveCount(0);
  });

  test('CA-3.2.3 Desde otro dispositivo también ve el resultado previo en vez de "Iniciar"', async ({ page, context }) => {
    test.fail(true, 'ERROR CONOCIDO: ResponderQuiz.jsx solo recuerda el envío en localStorage y no consulta GET /quizzes/:id/result (ya existe en el backend, docs/contrato-quiz-estudiante.md 2.2). En otro navegador el estudiante ve "Iniciar"; el resumen solo aparece tras reintentar y recibir el 409.');
    // Juan envió el quiz en la primera prueba; este es un navegador nuevo (sin su localStorage)
    await iniciarSesion(context, 'juan');
    await page.goto(`/estudiante/quices/${quiz.id_quiz}`);
    await expect(page.getByText('Ya enviaste este quiz y no se permite un nuevo intento.')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('HU-3.3 — Exportar mazos y quices a PDF', () => {
  // En develop el front todavía no tiene el botón de exportar (lo está haciendo el equipo).
  test.fixme('CA-3.3.1 La docente descarga el PDF de un mazo — FALTA el botón en el front', async () => {});
  test.fixme('CA-3.3.2 La docente descarga el PDF del quiz con hoja de respuestas — FALTA el botón en el front', async () => {});
});
