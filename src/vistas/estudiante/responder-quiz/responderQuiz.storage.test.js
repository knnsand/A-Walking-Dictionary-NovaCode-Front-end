// vistas/estudiante/responder-quiz/responderQuiz.storage.test.js
// HU-3.2: respaldo del intento en sessionStorage.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {borrarBorrador, guardarBorrador, guardarResultado, leerBorrador, leerResultado,} from './responderQuiz.storage';

const INICIO = '2026-10-10T15:00:00.000Z';

describe('responderQuiz.storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('guarda y recupera el inicio y las respuestas de un quiz', () => {
    guardarBorrador(12, { fechaInicio: INICIO, respuestas: { 101: 'cocinar' } });

    expect(leerBorrador(12)).toEqual({
      fechaInicio: INICIO,
      respuestas: { 101: 'cocinar' },
    });
  });

  it('devuelve null si no hay borrador', () => {
    expect(leerBorrador(12)).toBeNull();
  });

  it('separa los borradores por quiz', () => {
    guardarBorrador(12, { fechaInicio: INICIO, respuestas: { 101: 'a' } });
    guardarBorrador(13, { fechaInicio: INICIO, respuestas: { 201: 'b' } });

    expect(leerBorrador(12).respuestas).toEqual({ 101: 'a' });
    expect(leerBorrador(13).respuestas).toEqual({ 201: 'b' });
  });

  it('borrarBorrador elimina solo el borrador de ese quiz', () => {
    guardarBorrador(12, { fechaInicio: INICIO, respuestas: {} });
    guardarBorrador(13, { fechaInicio: INICIO, respuestas: {} });

    borrarBorrador(12);

    expect(leerBorrador(12)).toBeNull();
    expect(leerBorrador(13)).not.toBeNull();
  });

  it('ignora un borrador dañado: JSON inválido o sin fechaInicio', () => {
    sessionStorage.setItem('quiz_12_borrador', '{no es json');
    expect(leerBorrador(12)).toBeNull();

    sessionStorage.setItem('quiz_12_borrador', JSON.stringify({ respuestas: { 101: 'a' } }));
    expect(leerBorrador(12)).toBeNull();
  });

  it('si el borrador no trae respuestas válidas, las deja vacías', () => {
    sessionStorage.setItem('quiz_12_borrador', JSON.stringify({ fechaInicio: INICIO }));

    expect(leerBorrador(12)).toEqual({ fechaInicio: INICIO, respuestas: {} });
  });

  it('si el almacenamiento falla, no lanza error y leer devuelve null', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cuota excedida');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('acceso bloqueado');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('acceso bloqueado');
    });

    expect(() => guardarBorrador(12, { fechaInicio: INICIO, respuestas: {} })).not.toThrow();
    expect(leerBorrador(12)).toBeNull();
    expect(() => borrarBorrador(12)).not.toThrow();
  });
});


describe('resultado ya enviado (CA-3.2.3)', () => {
const datos = {
    resultado: { id_resultado: 5, quiz_id: 12, puntaje_obtenido: 1, puntaje_maximo: 2 },
    respuestas: [{ pregunta_id: 101, respuesta_estudiante: 'cocinar', es_correcta: true }],
    preguntas: [{ id_pregunta: 101, enunciado: 'Primera pregunta', orden: 1 }],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('guarda y recupera el resultado de un quiz para un estudiante', () => {
    guardarResultado(12, 3, datos);

    expect(leerResultado(12, 3)).toEqual(datos);
  });

  it('devuelve null si no hay resultado guardado', () => {
    expect(leerResultado(12, 3)).toBeNull();
  });

  
  it('si se guardó sin preguntas, leer devuelve preguntas en null', () => {
    guardarResultado(12, 3, { resultado: datos.resultado, respuestas: datos.respuestas });

    expect(leerResultado(12, 3)).toEqual({
      resultado: datos.resultado,
      respuestas: datos.respuestas,
      preguntas: null,
    });
  });

  it('ignora `preguntas` si lo guardado no es una lista', () => {
    localStorage.setItem(
      'quiz_12_resultado_3',
      JSON.stringify({ resultado: {}, respuestas: [], preguntas: 'no es lista' })
    );

    expect(leerResultado(12, 3).preguntas).toBeNull();
  });

  it('separa los resultados por estudiante (computador compartido)', () => {
    guardarResultado(12, 3, datos);

    expect(leerResultado(12, 4)).toBeNull();
  });

  it('separa los resultados por quiz', () => {
    guardarResultado(12, 3, datos);

    expect(leerResultado(13, 3)).toBeNull();
  });

  it('sin id de estudiante no guarda ni lee nada', () => {
    guardarResultado(12, null, datos);

    expect(localStorage.length).toBe(0);
    expect(leerResultado(12, null)).toBeNull();
  });

  it('ignora un dato dañado: JSON inválido, sin resultado o con respuestas que no son una lista', () => {
    localStorage.setItem('quiz_12_resultado_3', '{no es json');
    expect(leerResultado(12, 3)).toBeNull();

    localStorage.setItem('quiz_12_resultado_3', JSON.stringify({ respuestas: [] }));
    expect(leerResultado(12, 3)).toBeNull();

    localStorage.setItem(
      'quiz_12_resultado_3',
      JSON.stringify({ resultado: {}, respuestas: 'no es lista' })
    );
    expect(leerResultado(12, 3)).toBeNull();
  });

  it('si el almacenamiento falla, no lanza error y leer devuelve null', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cuota excedida');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('acceso bloqueado');
    });

    expect(() => guardarResultado(12, 3, datos)).not.toThrow();
    expect(leerResultado(12, 3)).toBeNull();
  });
});