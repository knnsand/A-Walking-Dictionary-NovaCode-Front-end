// vistas/estudiante/responder-quiz/responderQuiz.format.test.js
// HU-3.2: funciones puras de formato (fechas, cronómetro y minutos).

import { describe, expect, it } from 'vitest';
import { formatearFecha, formatearTiempo, textoMinutos } from './responderQuiz.format';

describe('formatearFecha', () => {
  it('devuelve una fecha legible que incluye el año', () => {
    // No se compara el texto exacto: depende de la zona horaria del equipo.
    const texto = formatearFecha('2026-10-10T15:00:00.000Z');

    expect(texto).not.toBe('');
    expect(texto).toMatch(/2026/);
  });

  it('devuelve cadena vacía si la fecha no es válida', () => {
    expect(formatearFecha('no es una fecha')).toBe('');
    expect(formatearFecha(undefined)).toBe('');
  });
});

describe('formatearTiempo', () => {
  it('formatea los segundos como mm:ss', () => {
    expect(formatearTiempo(125)).toBe('02:05');
    expect(formatearTiempo(600)).toBe('10:00');
  });

  it('devuelve 00:00 para cero y para valores negativos', () => {
    expect(formatearTiempo(0)).toBe('00:00');
    expect(formatearTiempo(-5)).toBe('00:00');
  });

  it('descarta los decimales', () => {
    expect(formatearTiempo(59.9)).toBe('00:59');
  });

  it('no convierte a horas: una hora se muestra como 60:00', () => {
    expect(formatearTiempo(3600)).toBe('60:00');
  });
});

describe('textoMinutos', () => {
  it('usa singular para 1 y plural para el resto', () => {
    expect(textoMinutos(1)).toBe('1 minuto');
    expect(textoMinutos(10)).toBe('10 minutos');
  });
});