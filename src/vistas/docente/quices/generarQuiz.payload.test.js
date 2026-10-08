// vistas/docente/quices/generarQuiz.payload.test.js
// HU-3.1: cuerpo de la petición a POST /api/v1/quizzes/generate.

import { describe, it, expect } from 'vitest';
import { construirPayloadQuiz } from './generarQuiz.payload';

const FORMATO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function datos(cambiosForm = {}) {
  return {
    cursoId: '1',
    mazosSeleccionados: [5, 6],
    form: {
      titulo: '  Quiz acumulativo semanas 7-8  ',
      fecha_apertura: '2026-10-12T15:00',
      fecha_cierre: '2026-10-14T15:00',
      tiempo_limite_min: '20',
      cantidad_preguntas: '',
      ...cambiosForm,
    },
  };
}

describe('construirPayloadQuiz', () => {
  it('usa los nombres de campo del backend', () => {
    const payload = construirPayloadQuiz(datos());

    expect(Object.keys(payload).sort()).toEqual(
      ['curso_id', 'fecha_apertura', 'fecha_cierre', 'mazo_ids', 'tiempo_limite_min', 'titulo'].sort()
    );
  });

  it('convierte curso, mazos y tiempo a número y recorta el título', () => {
    const payload = construirPayloadQuiz(datos());

    expect(payload.curso_id).toBe(1);
    expect(payload.mazo_ids).toEqual([5, 6]);
    expect(payload.tiempo_limite_min).toBe(20);
    expect(payload.titulo).toBe('Quiz acumulativo semanas 7-8');
  });

  it('envía las fechas en ISO 8601 UTC, sin cambiar el instante elegido', () => {
    const payload = construirPayloadQuiz(datos());

    expect(payload.fecha_apertura).toMatch(FORMATO_UTC);
    expect(payload.fecha_cierre).toMatch(FORMATO_UTC);
    expect(new Date(payload.fecha_apertura).getTime()).toBe(new Date('2026-10-12T15:00').getTime());
    expect(new Date(payload.fecha_cierre).getTime()).toBe(new Date('2026-10-14T15:00').getTime());
  });

  it('no envía cantidad_preguntas cuando el campo está vacío o con espacios', () => {
    expect(construirPayloadQuiz(datos({ cantidad_preguntas: '' }))).not.toHaveProperty('cantidad_preguntas');
    expect(construirPayloadQuiz(datos({ cantidad_preguntas: '   ' }))).not.toHaveProperty('cantidad_preguntas');
  });

  it('envía cantidad_preguntas como número cuando se escribe', () => {
    expect(construirPayloadQuiz(datos({ cantidad_preguntas: '12' })).cantidad_preguntas).toBe(12);
  });
});