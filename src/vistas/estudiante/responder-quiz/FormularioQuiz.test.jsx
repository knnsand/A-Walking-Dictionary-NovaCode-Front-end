// vistas/estudiante/responder-quiz/FormularioQuiz.test.jsx
// HU-3.2: formulario del quiz (CA-3.2.1). Se usan temporizadores simulados de
// Vitest: el reloj avanza sin esperas reales.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { FormularioQuiz } from './FormularioQuiz';
import { leerBorrador } from './responderQuiz.storage';

const BASE = new Date('2026-10-10T15:00:00.000Z');
const FECHA_INICIO = BASE.toISOString();
const CIERRE_LEJANO = '2026-10-12T23:59:00.000Z';

const quiz = {
  id_quiz: 12,
  titulo: 'Quiz semana 3',
  tiempo_limite_min: 10,
  fecha_cierre: CIERRE_LEJANO,
};

const preguntaUno = {
  id_pregunta: 101,
  tipo_pregunta: 'seleccion_multiple',
  enunciado: 'Primera pregunta',
  opcion_a: 'comer',
  opcion_b: 'cocinar',
  opcion_c: 'beber',
  opcion_d: 'dormir',
  orden: 1,
};

const preguntaDos = {
  id_pregunta: 102,
  tipo_pregunta: 'seleccion_multiple',
  enunciado: 'Segunda pregunta',
  opcion_a: 'Isla',
  opcion_b: 'pertenecer',
  opcion_c: 'posibilidad',
  opcion_d: null,
  orden: 2,
};

const preguntas = [preguntaUno, preguntaDos];

function montar(props = {}) {
  const onEnviar = vi.fn();
  render(
    <FormularioQuiz
      quiz={quiz}
      preguntas={preguntas}
      fechaInicio={FECHA_INICIO}
      onEnviar={onEnviar}
      {...props}
    />
  );
  return { onEnviar };
}

const radio = (texto) => screen.getByRole('radio', { name: new RegExp(texto) });
const elegir = (texto) => fireEvent.click(radio(texto));
const botonFinalizar = () => screen.getByRole('button', { name: 'Finish exam' });
const avanzar = (ms) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe('FormularioQuiz', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el título, el progreso y todas las preguntas en una página, ordenadas por `orden`', () => {
    montar({ preguntas: [preguntaDos, preguntaUno] });

    expect(screen.getByRole('heading', { name: 'Quiz semana 3' })).toBeInTheDocument();
    expect(screen.getByText('Answered: 0 of 2')).toBeInTheDocument();
    // 4 opciones en la primera pregunta y 3 en la segunda (la cuarta viene null).
    expect(screen.getAllByRole('radio')).toHaveLength(7);

    const enunciados = screen.getAllByText(/^\d+\. /).map((el) => el.textContent);
    expect(enunciados).toEqual(['1. Primera pregunta', '2. Segunda pregunta']);
  });

  it('recupera las respuestas del borrador al montarse', () => {
    montar({ respuestasIniciales: { 101: 'beber' } });

    expect(radio('beber')).toBeChecked();
    expect(screen.getByText('Answered: 1 of 2')).toBeInTheDocument();
  });

  it('al elegir una opción actualiza el progreso y guarda el borrador', () => {
    montar();

    elegir('cocinar');

    expect(radio('cocinar')).toBeChecked();
    expect(screen.getByText('Answered: 1 of 2')).toBeInTheDocument();
    expect(leerBorrador(12)).toEqual({
      fechaInicio: FECHA_INICIO,
      respuestas: { 101: 'cocinar' },
    });
  });

  it('cambiar de opción reemplaza la respuesta anterior', () => {
    montar();

    elegir('cocinar');
    elegir('comer');

    expect(radio('comer')).toBeChecked();
    expect(radio('cocinar')).not.toBeChecked();
    expect(screen.getByText('Answered: 1 of 2')).toBeInTheDocument();
  });

  it('con todo contestado, "Finalizar examen" envía el cuerpo sin pedir confirmación', () => {
    const { onEnviar } = montar();

    elegir('cocinar');
    elegir('pertenecer');
    fireEvent.click(botonFinalizar());

    expect(onEnviar).toHaveBeenCalledTimes(1);
    expect(onEnviar).toHaveBeenCalledWith({
      fecha_inicio: FECHA_INICIO,
      respuestas: [
        { pregunta_id: 101, respuesta_estudiante: 'cocinar' },
        { pregunta_id: 102, respuesta_estudiante: 'pertenecer' },
      ],
    });
    expect(screen.queryByText(/left to answer/)).not.toBeInTheDocument();
  });

  it('si falta una pregunta pide confirmación y no envía; "Volver al quiz" la cierra', () => {
    const { onEnviar } = montar();

    elegir('comer');
    fireEvent.click(botonFinalizar());

    expect(screen.getByText('You have 1 question left to answer.')).toBeInTheDocument();
    expect(onEnviar).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Back to the quiz' }));

    expect(screen.queryByText(/left to answer/)).not.toBeInTheDocument();
    expect(onEnviar).not.toHaveBeenCalled();
  });

  it('si faltan varias avisa en plural y "Enviar de todas formas" envía null en las no contestadas', () => {
    const { onEnviar } = montar();

    fireEvent.click(botonFinalizar());
    expect(screen.getByText('You have 2 questions left to answer.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Submit anyway' }));

    expect(onEnviar).toHaveBeenCalledTimes(1);
    expect(onEnviar).toHaveBeenCalledWith({
      fecha_inicio: FECHA_INICIO,
      respuestas: [
        { pregunta_id: 101, respuesta_estudiante: null },
        { pregunta_id: 102, respuesta_estudiante: null },
      ],
    });
    expect(screen.queryByText(/left to answer/)).not.toBeInTheDocument();
  });

  it('CA-3.2.1: al agotarse el tiempo envía lo contestado una sola vez, bloquea el formulario y no pide confirmación', () => {
    const { onEnviar } = montar({ quiz: { ...quiz, tiempo_limite_min: 1 } });

    elegir('cocinar');
    avanzar(59_000);
    expect(onEnviar).not.toHaveBeenCalled();

    avanzar(1_000);

    expect(onEnviar).toHaveBeenCalledTimes(1);
    expect(onEnviar).toHaveBeenCalledWith({
      fecha_inicio: FECHA_INICIO,
      respuestas: [
        { pregunta_id: 101, respuesta_estudiante: 'cocinar' },
        { pregunta_id: 102, respuesta_estudiante: null },
      ],
    });
    expect(screen.getByText(/Time is up/)).toBeInTheDocument();
    screen.getAllByRole('radio').forEach((opcion) => expect(opcion).toBeDisabled());
    expect(screen.queryByText(/left to answer/)).not.toBeInTheDocument();

    avanzar(10_000);
    expect(onEnviar).toHaveBeenCalledTimes(1);
  });

  it('con el tiempo agotado el botón sigue permitiendo reintentar el envío, sin confirmación', () => {
    const { onEnviar } = montar({ quiz: { ...quiz, tiempo_limite_min: 1 } });

    avanzar(60_000);
    expect(onEnviar).toHaveBeenCalledTimes(1);

    fireEvent.click(botonFinalizar());

    expect(onEnviar).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/left to answer/)).not.toBeInTheDocument();
  });

  it('mientras se envía deshabilita el botón y las opciones', () => {
    montar({ enviando: true });

    expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled();
    screen.getAllByRole('radio').forEach((opcion) => expect(opcion).toBeDisabled());
  });

  it('muestra el error del último envío fallido', () => {
    montar({ errorEnvio: 'Error de red al enviar' });

    expect(screen.getByText('Error de red al enviar')).toBeInTheDocument();
  });

  it('el cronómetro muestra el tiempo restante y baja con el paso del tiempo', () => {
    montar();

    expect(screen.getByRole('timer')).toHaveTextContent('10:00');

    avanzar(5_000);

    expect(screen.getByRole('timer')).toHaveTextContent('09:55');
  });
});