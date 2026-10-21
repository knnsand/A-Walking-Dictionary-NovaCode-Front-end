// vistas/estudiante/responder-quiz/ResponderQuiz.test.jsx
// HU-3.2: contenedor que une portada, formulario y resultado (CA-3.2.1, CA-3.2.2, CA-3.2.3).
// El servicio se simula con una propiedad y la ruta con un enrutador en memoria.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResponderQuiz } from './ResponderQuiz';
import {
  guardarBorrador,
  guardarResultado,
  leerBorrador,
  leerResultado,
} from './responderQuiz.storage';

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }));

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ estudianteId: 3, logout: logoutMock }),
}));

const QUIZ_ABIERTO = {
  id_quiz: 12,
  curso_id: 1,
  titulo: 'Quiz semana 3',
  fecha_apertura: '2026-10-10T13:00:00.000Z',
  fecha_cierre: '2099-01-01T00:00:00.000Z',
  tiempo_limite_min: 10,
  // El backend deja `estado` fijo en "programado": lo que manda es `estado_efectivo`.
  estado: 'programado',
  estado_efectivo: 'abierto',
};

const PREGUNTAS = [
  {
    id_pregunta: 101,
    tipo_pregunta: 'seleccion_multiple',
    enunciado: 'Primera pregunta',
    opcion_a: 'comer',
    opcion_b: 'cocinar',
    opcion_c: 'beber',
    opcion_d: 'dormir',
    orden: 1,
  },
  {
    id_pregunta: 102,
    tipo_pregunta: 'seleccion_multiple',
    enunciado: 'Segunda pregunta',
    opcion_a: 'Isla',
    opcion_b: 'pertenecer',
    opcion_c: 'posibilidad',
    opcion_d: null,
    orden: 2,
  },
];

const RESULTADO = {
  id_resultado: 5,
  quiz_id: 12,
  estudiante_id: 3,
  fecha_inicio: '2026-10-10T15:00:00.000Z',
  fecha_envio: '2026-10-10T15:02:05.000Z',
  puntaje_obtenido: 1,
  puntaje_maximo: 2,
  calificacion: 2.5,
  tiempo_empleado_seg: 125,
};

const RESPUESTAS = [
  {
    id_respuesta: 1,
    resultado_id: 5,
    pregunta_id: 101,
    respuesta_estudiante: 'cocinar',
    es_correcta: true,
    puntaje_obtenido: 1,
  },
  {
    id_respuesta: 2,
    resultado_id: 5,
    pregunta_id: 102,
    respuesta_estudiante: null,
    es_correcta: false,
    puntaje_obtenido: 0,
  },
];

const ENVIO_OK = { resultado: RESULTADO, respuestas: RESPUESTAS, yaEnviado: false };

// El servicio se crea una sola vez por prueba: si cambiara en cada render, la
// pantalla volvería a cargar sin parar.
function crearServicio() {
  return {
    obtenerQuiz: vi.fn().mockResolvedValue(QUIZ_ABIERTO),
    obtenerPreguntasQuiz: vi.fn().mockResolvedValue({ quiz: QUIZ_ABIERTO, preguntas: PREGUNTAS }),
    enviarRespuestasQuiz: vi.fn().mockResolvedValue(ENVIO_OK),
  };
}

function montar(servicio) {
  render(
    <MemoryRouter initialEntries={['/estudiante/quices/12']}>
      <Routes>
        <Route path="/estudiante/quices/:idQuiz" element={<ResponderQuiz servicio={servicio} />} />
        <Route path="/estudiante" element={<p>Panel del estudiante</p>} />
      </Routes>
    </MemoryRouter>
  );
}

const botonIniciar = () => screen.findByRole('button', { name: 'Start' });
const radio = (texto) => screen.getByRole('radio', { name: new RegExp(texto) });
const botonFinalizar = () => screen.getByRole('button', { name: 'Finish exam' });

async function iniciar() {
  fireEvent.click(await botonIniciar());
  await screen.findAllByRole('radio');
}

async function iniciarYContestarTodo() {
  await iniciar();
  fireEvent.click(radio('cocinar'));
  fireEvent.click(radio('pertenecer'));
}

describe('ResponderQuiz', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('muestra "Cargando" y luego la portada con "Iniciar" habilitado', async () => {
    const servicio = crearServicio();
    montar(servicio);

    expect(screen.getByText('Loading the quiz…')).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Quiz semana 3' })).toBeInTheDocument();
    expect(await botonIniciar()).toBeEnabled();
    expect(servicio.obtenerQuiz).toHaveBeenCalledWith('12');
    expect(servicio.obtenerPreguntasQuiz).not.toHaveBeenCalled();
  });

  it('al pulsar "Iniciar" pide las preguntas, muestra el formulario y guarda el borrador', async () => {
    const servicio = crearServicio();
    montar(servicio);

    await iniciar();

    expect(servicio.obtenerPreguntasQuiz).toHaveBeenCalledWith('12');
    expect(screen.getByText('1. Primera pregunta')).toBeInTheDocument();
    expect(screen.getByText('2. Segunda pregunta')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
    expect(leerBorrador('12')).toEqual({ fechaInicio: expect.any(String), respuestas: {} });
  });

  it('CA-3.2.2: al finalizar envía las respuestas, muestra el resultado y limpia el borrador', async () => {
    const servicio = crearServicio();
    montar(servicio);
    await iniciarYContestarTodo();

    fireEvent.click(botonFinalizar());

    expect(await screen.findByRole('heading', { name: 'Result' })).toBeInTheDocument();
    expect(servicio.enviarRespuestasQuiz).toHaveBeenCalledTimes(1);
    expect(servicio.enviarRespuestasQuiz).toHaveBeenCalledWith('12', {
      fecha_inicio: expect.any(String),
      respuestas: [
        { pregunta_id: 101, respuesta_estudiante: 'cocinar' },
        { pregunta_id: 102, respuesta_estudiante: 'pertenecer' },
      ],
    });

    // Nota y detalle por pregunta.
    expect(screen.getByText('2.50')).toBeInTheDocument();
    expect(screen.getByText('Primera pregunta')).toBeInTheDocument();
    expect(screen.queryByText(/a new attempt is not allowed/)).not.toBeInTheDocument();

    // Se recuerda el resultado (con las preguntas) y se borra el borrador.
    expect(leerBorrador('12')).toBeNull();
    const guardado = leerResultado('12', 3);
    expect(guardado.resultado).toEqual(RESULTADO);
    expect(guardado.preguntas).toEqual(PREGUNTAS);
  });

  it('CA-3.2.3: si el backend responde que ya se había enviado, muestra el resumen con el aviso', async () => {
    const servicio = crearServicio();
    servicio.enviarRespuestasQuiz.mockResolvedValue({ ...ENVIO_OK, yaEnviado: true });
    montar(servicio);
    await iniciarYContestarTodo();

    fireEvent.click(botonFinalizar());

    expect(
      await screen.findByText(/You have already submitted this quiz and a new attempt is not allowed/)
    ).toBeInTheDocument();
    expect(screen.getByText('2.50')).toBeInTheDocument();
    expect(leerResultado('12', 3)).not.toBeNull();
  });

  it('CA-3.2.3: con un resultado guardado en el navegador lo muestra directo, sin formulario', async () => {
    guardarResultado('12', 3, { resultado: RESULTADO, respuestas: RESPUESTAS, preguntas: PREGUNTAS });
    const servicio = crearServicio();
    montar(servicio);

    expect(await screen.findByRole('heading', { name: 'Result' })).toBeInTheDocument();
    expect(
      screen.getByText(/You have already submitted this quiz and a new attempt is not allowed/)
    ).toBeInTheDocument();
    expect(screen.getByText('Quiz semana 3')).toBeInTheDocument();
    expect(screen.getByText('Primera pregunta')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();
    expect(servicio.obtenerPreguntasQuiz).not.toHaveBeenCalled();
  });

  it('con un resultado guardado lo muestra aunque falle la consulta del quiz', async () => {
    guardarResultado('12', 3, { resultado: RESULTADO, respuestas: RESPUESTAS, preguntas: PREGUNTAS });
    const servicio = crearServicio();
    servicio.obtenerQuiz.mockRejectedValue(new Error('Quiz no encontrado'));
    montar(servicio);

    expect(await screen.findByRole('heading', { name: 'Result' })).toBeInTheDocument();
    expect(screen.getByText('2.50')).toBeInTheDocument();
    expect(screen.queryByText('Quiz no encontrado')).not.toBeInTheDocument();
  });

  it('CA-3.2.1: si hay un borrador y el quiz sigue abierto, retoma el intento con sus respuestas', async () => {
    guardarBorrador('12', {
      fechaInicio: new Date().toISOString(),
      respuestas: { 101: 'cocinar' },
    });
    const servicio = crearServicio();
    montar(servicio);

    expect(await screen.findByRole('radio', { name: /cocinar/ })).toBeChecked();
    expect(screen.getByText('Answered: 1 of 2')).toBeInTheDocument();
    expect(servicio.obtenerPreguntasQuiz).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();
  });

  it('ignora el borrador si el quiz ya no está abierto y muestra la portada', async () => {
    guardarBorrador('12', { fechaInicio: new Date().toISOString(), respuestas: {} });
    const servicio = crearServicio();
    servicio.obtenerQuiz.mockResolvedValue({ ...QUIZ_ABIERTO, estado_efectivo: 'cerrado' });
    montar(servicio);

    expect(await botonIniciar()).toBeDisabled();
    expect(screen.getByText(/This quiz closed on/)).toBeInTheDocument();
    expect(servicio.obtenerPreguntasQuiz).not.toHaveBeenCalled();
  });

  it('si falla la carga muestra el error y "Reintentar" vuelve a cargar', async () => {
    const servicio = crearServicio();
    servicio.obtenerQuiz
      .mockRejectedValueOnce(new Error('Quiz no encontrado'))
      .mockResolvedValueOnce(QUIZ_ABIERTO);
    montar(servicio);

    expect(await screen.findByText('Quiz no encontrado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await botonIniciar()).toBeEnabled();
    expect(servicio.obtenerQuiz).toHaveBeenCalledTimes(2);
  });

  it('si fallan las preguntas al iniciar, muestra el error y se queda en la portada', async () => {
    const servicio = crearServicio();
    servicio.obtenerPreguntasQuiz.mockRejectedValue(
      new Error('El quiz ya cerró y no acepta más respuestas')
    );
    montar(servicio);

    fireEvent.click(await botonIniciar());

    expect(
      await screen.findByText('El quiz ya cerró y no acepta más respuestas')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(leerBorrador('12')).toBeNull();
    expect(logoutMock).not.toHaveBeenCalled();
  });

  it('si al iniciar la sesión venció (401), cierra la sesión', async () => {
    const servicio = crearServicio();
    servicio.obtenerPreguntasQuiz.mockRejectedValue(
      Object.assign(new Error('Token inválido o expirado'), { status: 401 })
    );
    montar(servicio);

    fireEvent.click(await botonIniciar());

    expect(await screen.findByText('Token inválido o expirado')).toBeInTheDocument();
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('si falla el envío conserva el formulario y las respuestas y permite reintentar', async () => {
    const servicio = crearServicio();
    servicio.enviarRespuestasQuiz
      .mockRejectedValueOnce(new Error('Error de red al enviar'))
      .mockResolvedValueOnce(ENVIO_OK);
    montar(servicio);
    await iniciarYContestarTodo();

    fireEvent.click(botonFinalizar());

    expect(await screen.findByText('Error de red al enviar')).toBeInTheDocument();
    expect(radio('cocinar')).toBeChecked();
    expect(leerBorrador('12')).not.toBeNull();
    expect(leerResultado('12', 3)).toBeNull();

    fireEvent.click(botonFinalizar());

    expect(await screen.findByRole('heading', { name: 'Result' })).toBeInTheDocument();
    expect(servicio.enviarRespuestasQuiz).toHaveBeenCalledTimes(2);
  });

  it('"Volver al panel" lleva al panel del estudiante', async () => {
    guardarResultado('12', 3, { resultado: RESULTADO, respuestas: RESPUESTAS, preguntas: PREGUNTAS });
    montar(crearServicio());

    fireEvent.click(await screen.findByRole('button', { name: 'Back to the panel' }));

    expect(await screen.findByText('Panel del estudiante')).toBeInTheDocument();
  });
});