// vistas/quices/listaQuices.format.test.js
import { describe, it, expect } from 'vitest';
import { formatearFecha, textoNota } from './listaQuices.format';

describe('formatearFecha', () => {
  it('formatea una fecha ISO válida', () => {
    expect(formatearFecha('2026-10-09T18:00:00.000Z')).toMatch(/2026/);
  });

  it('devuelve cadena vacía si la fecha no es válida o falta', () => {
    expect(formatearFecha('no es una fecha')).toBe('');
    expect(formatearFecha(undefined)).toBe('');
  });
});

describe('textoNota', () => {
  it('muestra la nota con un decimal', () => {
    expect(textoNota({ calificacion: 4.5 })).toBe(' · Nota 4.5');
    expect(textoNota({ calificacion: '3' })).toBe(' · Nota 3.0');
  });

  it('no muestra nada si no hay calificación numérica', () => {
    expect(textoNota({})).toBe('');
    expect(textoNota(null)).toBe('');
    expect(textoNota({ calificacion: null })).toBe('');
    expect(textoNota({ calificacion: '' })).toBe('');
    expect(textoNota({ calificacion: 'abc' })).toBe('');
  });
});
