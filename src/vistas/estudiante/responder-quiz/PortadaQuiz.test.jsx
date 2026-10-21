// vistas/estudiante/responder-quiz/PortadaQuiz.test.jsx
// HU-3.2: portada del quiz. El botón "Iniciar" solo se habilita si el quiz está abierto.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PortadaQuiz } from './PortadaQuiz';

const quizBase = {
  id_quiz: 12,
  curso_id: 1,
  titulo: 'Quiz semana 3',
  fecha_apertura: '2026-10-10T13:00:00.000Z',
  fecha_cierre: '2026-10-12T23:59:00.000Z',
  tiempo_limite_min: 10,
  // El backend deja `estado` fijo en "programado": lo que manda es `estado_efectivo`.
  estado: 'programado',
};

const quizCon = (estadoEfectivo) => ({ ...quizBase, estado_efectivo: estadoEfectivo });
const botonIniciar = () => screen.getByRole('button', { name: 'Start' });

describe('PortadaQuiz', () => {
  it('muestra el título, el estado y el tiempo límite', () => {
    render(<PortadaQuiz quiz={quizCon('abierto')} onIniciar={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Quiz semana 3' })).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('10 minutes')).toBeInTheDocument();
  });

  it('con el quiz abierto habilita "Iniciar" y llama a onIniciar al pulsarlo', () => {
    const onIniciar = vi.fn();
    render(<PortadaQuiz quiz={quizCon('abierto')} onIniciar={onIniciar} />);

    expect(botonIniciar()).toBeEnabled();
    expect(screen.getByText(/You can only submit the quiz once/)).toBeInTheDocument();

    fireEvent.click(botonIniciar());
    expect(onIniciar).toHaveBeenCalledTimes(1);
  });

  it('con el quiz programado deshabilita "Iniciar" y muestra cuándo estará disponible', () => {
    const onIniciar = vi.fn();
    render(<PortadaQuiz quiz={quizCon('programado')} onIniciar={onIniciar} />);

    expect(botonIniciar()).toBeDisabled();
    expect(screen.getByText(/Available on/)).toBeInTheDocument();
    expect(screen.queryByText(/You can only submit the quiz once/)).not.toBeInTheDocument();

    fireEvent.click(botonIniciar());
    expect(onIniciar).not.toHaveBeenCalled();
  });

  it('con el quiz cerrado deshabilita "Iniciar" y avisa que ya cerró', () => {
    const onIniciar = vi.fn();
    render(<PortadaQuiz quiz={quizCon('cerrado')} onIniciar={onIniciar} />);

    expect(botonIniciar()).toBeDisabled();
    expect(screen.getByText(/This quiz closed on/)).toBeInTheDocument();

    fireEvent.click(botonIniciar());
    expect(onIniciar).not.toHaveBeenCalled();
  });

  it('usa estado_efectivo y no estado: un quiz con estado "programado" pero abierto se puede iniciar', () => {
    render(<PortadaQuiz quiz={quizCon('abierto')} onIniciar={() => {}} />);

    expect(quizCon('abierto').estado).toBe('programado');
    expect(botonIniciar()).toBeEnabled();
  });
});