// vistas/estudiante/responder-quiz/responderQuiz.storage.test.js
// HU-3.2: respaldo del intento en sessionStorage.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { borrarBorrador, guardarBorrador, leerBorrador } from './responderQuiz.storage';

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