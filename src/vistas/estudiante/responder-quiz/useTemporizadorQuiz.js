/**
 * @file useTemporizadorQuiz.js
 * @brief HU-3.2, CA-3.2.1: control de tiempo durante la prueba.
 *
 * El tiempo restante se calcula comparando la hora actual con `fechaInicio`,
 * no restando un segundo por cada tick: así no se desfasa si la pestaña queda
 * en segundo plano. El límite es el menor entre `fechaInicio + tiempoLimiteMin`
 * y la `fechaCierre` del quiz (CONTRATO_FRONTEND_HU-3.2.md, sección Temporizador).
 */

import { useEffect, useRef, useState } from 'react';

/** @brief Milisegundos en un segundo. */
const MS_POR_SEGUNDO = 1000;
/** @brief Milisegundos en un minuto. */
const MS_POR_MINUTO = 60 * MS_POR_SEGUNDO;

/**
 * @brief Instante (en ms) en que se acaba el tiempo, o null si faltan datos válidos.
 *
 * @param {Object} datos
 * @param {string|null} datos.fechaInicio - ISO 8601; null si el quiz no ha iniciado.
 * @param {number} datos.tiempoLimiteMin - Tiempo límite en minutos.
 * @param {string} [datos.fechaCierre] - ISO 8601.
 * @return {number|null}
 */
export function calcularLimiteMs({ fechaInicio, tiempoLimiteMin, fechaCierre }) {
  if (!fechaInicio) return null;

  const inicio = new Date(fechaInicio).getTime();
  const finPorTiempo = inicio + tiempoLimiteMin * MS_POR_MINUTO;
  if (!Number.isFinite(finPorTiempo)) return null;

  const cierre = new Date(fechaCierre).getTime();
  return Number.isFinite(cierre) ? Math.min(finPorTiempo, cierre) : finPorTiempo;
}

/**
 * @brief Segundos que faltan hasta el límite; nunca negativo.
 * @param {number|null} limiteMs - Instante límite en ms.
 * @param {number} ahoraMs - Instante actual en ms.
 * @return {number|null}
 */
export function calcularSegundosRestantes(limiteMs, ahoraMs) {
  return Math.max(0, Math.ceil((limiteMs - ahoraMs) / MS_POR_SEGUNDO));
}

/**
 * @brief Hook del cronómetro regresivo del quiz.
 * @param {Object} props
 * @param {string|null} props.fechaInicio - ISO 8601; null mientras no se pulsa "Iniciar".
 * @param {number} props.tiempoLimiteMin - Tiempo límite en minutos.
 * @param {string} [props.fechaCierre] - ISO 8601.
 * @param {Function} [props.onTiempoAgotado] - Se llama una sola vez cuando el tiempo llega a 0.
 * @return {{ segundosRestantes: number|null, agotado: boolean }}
 *   `segundosRestantes` es null mientras el quiz no ha iniciado.
 */
export function useTemporizadorQuiz({
  fechaInicio,
  tiempoLimiteMin,
  fechaCierre,
  onTiempoAgotado,
}) {
  const limiteMs = calcularLimiteMs({ fechaInicio, tiempoLimiteMin, fechaCierre });
  const [ahora, setAhora] = useState(() => Date.now());

  // Siempre se llama la versión más reciente de la función, sin reiniciar el temporizador.
  const alAgotarRef = useRef(onTiempoAgotado);
  useEffect(() => {
    alAgotarRef.current = onTiempoAgotado;
  });

  // Repinta el reloj cada segundo; el valor mostrado sale de comparar fechas.
  useEffect(() => {
    if (limiteMs === null) return undefined;

    const id = setInterval(() => setAhora(Date.now()), MS_POR_SEGUNDO);
    return () => clearInterval(id);
  }, [limiteMs]);

  // Avisa una sola vez en el instante exacto del límite (CA-3.2.1).
  useEffect(() => {
    if (limiteMs === null) return undefined;

    let avisado = false;
    const espera = Math.max(0, limiteMs - Date.now());
    const id = setTimeout(() => {
      setAhora(Date.now());
      if (!avisado) {
        avisado = true;
        alAgotarRef.current?.();
      }
    }, espera);

    return () => clearTimeout(id);
  }, [limiteMs]);

  if (limiteMs === null) return { segundosRestantes: null, agotado: false };

  const segundosRestantes = calcularSegundosRestantes(limiteMs, ahora);
  return { segundosRestantes, agotado: segundosRestantes === 0 };
}