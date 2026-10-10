// vistas/estudiante/responder-quiz/responderQuiz.payload.test.js
// HU-3.2: cuerpo del envío y conteo de preguntas sin contestar.

import { describe, expect, it } from 'vitest';
import {
  construirPayloadEnvio,
  contarSinContestar,
  opcionesDePregunta,
  ordenarPreguntas,
} from './responderQuiz.payload';

const INICIO = '2026-10-10T15:00:00.000Z';

const pregunta = (id, orden, opciones) => ({
  id_pregunta: id,
  tipo_pregunta: 'seleccion_multiple',
  enunciado: `¿Cuál es la traducción correcta de "palabra${id}"?`,
  opcion_a: opciones[0] ?? null,
  opcion_b: opciones[1] ?? null,
  opcion_c: opciones[2] ?? null,
  opcion_d: opciones[3] ?? null,
  orden,
});

const preguntas = [
  pregunta(101, 1, ['comer', 'cocinar', 'beber', 'dormir']),
  pregunta(102, 2, ['Isla', 'pertenecer', 'posibilidad', 'trabajo de retazos']),
  pregunta(103, 3, ['uno', 'dos', 'tres', 'cuatro']),
];

describe('opcionesDePregunta', () => {
  it('devuelve los textos de opcion_a a opcion_d en orden', () => {
    expect(opcionesDePregunta(preguntas[0])).toEqual(['comer', 'cocinar', 'beber', 'dormir']);
  });

  it('omite las opciones que vienen null', () => {
    expect(opcionesDePregunta(pregunta(104, 4, ['sí', 'no']))).toEqual(['sí', 'no']);
  });
});

describe('ordenarPreguntas', () => {
  it('ordena por `orden` sin modificar el arreglo original', () => {
    const desordenadas = [preguntas[2], preguntas[0], preguntas[1]];

    const ordenadas = ordenarPreguntas(desordenadas);

    expect(ordenadas.map((p) => p.id_pregunta)).toEqual([101, 102, 103]);
    expect(desordenadas.map((p) => p.id_pregunta)).toEqual([103, 101, 102]);
  });
});

describe('construirPayloadEnvio', () => {
  it('incluye una entrada por pregunta, con null en las no contestadas', () => {
    const payload = construirPayloadEnvio({
      fechaInicio: INICIO,
      preguntas,
      respuestas: { 101: 'cocinar', 103: 'tres' },
    });

    expect(payload).toEqual({
      fecha_inicio: INICIO,
      respuestas: [
        { pregunta_id: 101, respuesta_estudiante: 'cocinar' },
        { pregunta_id: 102, respuesta_estudiante: null },
        { pregunta_id: 103, respuesta_estudiante: 'tres' },
      ],
    });
  });

  it('envía el texto de la opción tal cual, con mayúsculas y espacios', () => {
    const payload = construirPayloadEnvio({
      fechaInicio: INICIO,
      preguntas,
      respuestas: { 102: 'trabajo de retazos' },
    });

    expect(payload.respuestas[1].respuesta_estudiante).toBe('trabajo de retazos');
  });

  it('descarta una respuesta que no es el texto de ninguna opción (por ejemplo una letra)', () => {
    const payload = construirPayloadEnvio({
      fechaInicio: INICIO,
      preguntas,
      respuestas: { 101: 'b', 102: 'isla' },
    });

    expect(payload.respuestas[0].respuesta_estudiante).toBeNull();
    // "isla" no coincide con "Isla": la comparación del backend es exacta.
    expect(payload.respuestas[1].respuesta_estudiante).toBeNull();
  });

  it('ignora respuestas de preguntas que ya no están en el quiz', () => {
    const payload = construirPayloadEnvio({
      fechaInicio: INICIO,
      preguntas: [preguntas[0]],
      respuestas: { 101: 'beber', 999: 'huérfana' },
    });

    expect(payload.respuestas).toEqual([{ pregunta_id: 101, respuesta_estudiante: 'beber' }]);
  });

  it('con respuestas vacías o ausentes envía todo en null', () => {
    const sinRespuestas = construirPayloadEnvio({ fechaInicio: INICIO, preguntas, respuestas: {} });
    const sinObjeto = construirPayloadEnvio({ fechaInicio: INICIO, preguntas });

    expect(sinRespuestas.respuestas.every((r) => r.respuesta_estudiante === null)).toBe(true);
    expect(sinObjeto.respuestas).toHaveLength(3);
  });

  it('con un quiz sin preguntas envía una lista vacía', () => {
    expect(construirPayloadEnvio({ fechaInicio: INICIO, preguntas: [], respuestas: {} })).toEqual({
      fecha_inicio: INICIO,
      respuestas: [],
    });
  });
});

describe('contarSinContestar', () => {
  it('cuenta las preguntas sin respuesta válida', () => {
    expect(contarSinContestar({ preguntas, respuestas: { 101: 'cocinar' } })).toBe(2);
  });

  it('devuelve 0 cuando todas están contestadas', () => {
    const respuestas = { 101: 'comer', 102: 'Isla', 103: 'uno' };

    expect(contarSinContestar({ preguntas, respuestas })).toBe(0);
  });

  it('cuenta todas cuando no hay respuestas', () => {
    expect(contarSinContestar({ preguntas, respuestas: {} })).toBe(3);
  });

  it('no cuenta como contestada una respuesta que no es una opción válida', () => {
    expect(contarSinContestar({ preguntas, respuestas: { 101: 'a', 102: 'Isla', 103: 'uno' } })).toBe(1);
  });
});