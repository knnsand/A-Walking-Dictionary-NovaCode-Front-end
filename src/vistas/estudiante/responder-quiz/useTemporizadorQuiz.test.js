// vistas/estudiante/responder-quiz/useTemporizadorQuiz.test.js
// HU-3.2, CA-3.2.1: control de tiempo durante la prueba.
// Se usan temporizadores simulados de Vitest: el reloj avanza sin esperas reales.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  calcularLimiteMs,
  calcularSegundosRestantes,
  useTemporizadorQuiz,
} from './useTemporizadorQuiz';

const BASE = new Date('2026-10-10T15:00:00.000Z');
const FECHA_INICIO = BASE.toISOString();
const CIERRE_LEJANO = '2026-10-12T23:59:00.000Z';

const mas = (ms) => new Date(BASE.getTime() + ms).toISOString();
const avanzar = (ms) => act(() => vi.advanceTimersByTime(ms));

describe('calcularLimiteMs', () => {
  it('devuelve inicio + tiempo límite cuando el cierre queda más lejos', () => {
    const limite = calcularLimiteMs({
      fechaInicio: FECHA_INICIO,
      tiempoLimiteMin: 10,
      fechaCierre: CIERRE_LEJANO,
    });
    expect(limite).toBe(BASE.getTime() + 10 * 60 * 1000);
  });

  it('usa la fecha de cierre cuando llega antes que el tiempo límite', () => {
    const limite = calcularLimiteMs({
      fechaInicio: FECHA_INICIO,
      tiempoLimiteMin: 10,
      fechaCierre: mas(30 * 1000),
    });
    expect(limite).toBe(BASE.getTime() + 30 * 1000);
  });

  it('usa solo el tiempo límite si no hay fecha de cierre válida', () => {
    const limite = calcularLimiteMs({ fechaInicio: FECHA_INICIO, tiempoLimiteMin: 5 });
    expect(limite).toBe(BASE.getTime() + 5 * 60 * 1000);
  });

  it('devuelve null si el quiz no ha iniciado', () => {
    expect(calcularLimiteMs({ fechaInicio: null, tiempoLimiteMin: 10 })).toBeNull();
  });
});

describe('calcularSegundosRestantes', () => {
  it('redondea hacia arriba y nunca es negativo', () => {
    expect(calcularSegundosRestantes(10_500, 10_000)).toBe(1);
    expect(calcularSegundosRestantes(1_000, 5_000)).toBe(0);
  });
});

describe('useTemporizadorQuiz', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const montar = (props = {}) =>
    renderHook(() =>
      useTemporizadorQuiz({
        fechaInicio: FECHA_INICIO,
        tiempoLimiteMin: 10,
        fechaCierre: CIERRE_LEJANO,
        ...props,
      })
    );

  it('no corre mientras el quiz no ha iniciado', () => {
    const { result } = montar({ fechaInicio: null });

    expect(result.current).toEqual({ segundosRestantes: null, agotado: false });
  });

  it('el tiempo restante baja con el paso del tiempo', () => {
    const { result } = montar();
    expect(result.current.segundosRestantes).toBe(600);

    avanzar(5_000);

    expect(result.current.segundosRestantes).toBe(595);
    expect(result.current.agotado).toBe(false);
  });

  it('usa la fecha de cierre cuando llega antes que el tiempo límite', () => {
    const { result } = montar({ fechaCierre: mas(30 * 1000) });

    expect(result.current.segundosRestantes).toBe(30);
  });

  it('no se desfasa si el reloj avanza más de lo que marcan los ticks', () => {
    const { result } = montar();

    // Simula una pestaña dormida: pasa un minuto sin que corra ningún tick.
    vi.setSystemTime(new Date(BASE.getTime() + 60 * 1000));
    avanzar(1_000);

    expect(result.current.segundosRestantes).toBe(539);
  });

  it('llama onTiempoAgotado una sola vez cuando el tiempo llega a 0', () => {
    const onTiempoAgotado = vi.fn();
    const { result } = montar({ tiempoLimiteMin: 1, onTiempoAgotado });

    avanzar(59_000);
    expect(onTiempoAgotado).not.toHaveBeenCalled();
    expect(result.current.segundosRestantes).toBe(1);

    avanzar(1_000);
    expect(onTiempoAgotado).toHaveBeenCalledTimes(1);
    expect(result.current.segundosRestantes).toBe(0);
    expect(result.current.agotado).toBe(true);

    avanzar(10_000);
    expect(onTiempoAgotado).toHaveBeenCalledTimes(1);
  });

  it('no llama onTiempoAgotado si el componente se desmonta antes del límite', () => {
    const onTiempoAgotado = vi.fn();
    const { unmount } = montar({ tiempoLimiteMin: 1, onTiempoAgotado });

    unmount();
    avanzar(120_000);

    expect(onTiempoAgotado).not.toHaveBeenCalled();
  });
});