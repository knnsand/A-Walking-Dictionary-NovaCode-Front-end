// vistas/docente/quices/GenerarQuiz.test.jsx
// HU-3.1: pantalla de configuración y generación del quiz acumulativo.

import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { GenerarQuiz } from './GenerarQuiz';
import { TEXTOS, ERRORES_VALIDACION } from './generarQuiz.constants';

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }));

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ logout: logoutMock }),
}));
vi.mock('../../../cliente-api/cursosApi', () => ({ listarCursos: vi.fn() }));
vi.mock('../../../cliente-api/mazosApi', () => ({ listarMazos: vi.fn() }));
vi.mock('../../../cliente-api/quizzesApi', () => ({ generarQuiz: vi.fn() }));

import { listarCursos } from '../../../cliente-api/cursosApi';
import { listarMazos } from '../../../cliente-api/mazosApi';
import { generarQuiz } from '../../../cliente-api/quizzesApi';

const CURSOS = [
  { id_curso: 1, nombre: 'Literatura Anglófona I' },
  { id_curso: 2, nombre: 'Literatura Anglófona II' },
];

// GET /decks devuelve los mazos de todos los cursos: la pantalla filtra por curso_id.
const MAZOS = [
  { id_mazo: 5, curso_id: 1, semana: 7, nombre_lectura: 'Their Eyes Were Watching God' },
  { id_mazo: 6, curso_id: 1, semana: 8, nombre_lectura: 'Wide Sargasso Sea' },
  { id_mazo: 9, curso_id: 2, semana: 3, nombre_lectura: 'Beloved' },
];

const MAZO_7 = 'Semana 7 · Their Eyes Were Watching God';
const MAZO_8 = 'Semana 8 · Wide Sargasso Sea';
const MAZO_OTRO_CURSO = 'Semana 3 · Beloved';

const RESPUESTA = {
  quiz: {
    id_quiz: 1,
    curso_id: 1,
    titulo: 'Quiz acumulativo',
    semana_corte: 8,
    estado: 'programado',
    estado_efectivo: 'programado',
  },
  preguntas: [
    {
      id_pregunta: 1,
      quiz_id: 1,
      tarjeta_id: 30,
      tipo_pregunta: 'seleccion_multiple',
      enunciado: '¿Cuál es la traducción correcta de "patchwork"?',
      opcion_a: 'posibilidad',
      opcion_b: 'trabajo de retazos',
      opcion_c: null,
      opcion_d: null,
      respuesta_correcta: 'trabajo de retazos',
      orden: 1,
    },
    {
      id_pregunta: 2,
      quiz_id: 1,
      tarjeta_id: 31,
      tipo_pregunta: 'seleccion_multiple',
      enunciado: '¿Cuál es la traducción correcta de "belong"?',
      opcion_a: 'isla',
      opcion_b: 'pertenecer',
      opcion_c: null,
      opcion_d: null,
      respuesta_correcta: 'pertenecer',
      orden: 2,
    },
  ],
};

// Fechas lejanas para que la validación "apertura posterior a ahora" no dependa del día de la prueba.
const APERTURA = '2099-01-10T08:00';
const CIERRE = '2099-01-12T08:00';

async function elegirCurso(idCurso, nombreCurso) {
  await screen.findByRole('option', { name: nombreCurso });
  fireEvent.change(screen.getByLabelText(TEXTOS.etiquetaCurso), { target: { value: String(idCurso) } });
}

// Rellena un formulario válido: curso 1, mazos 7 y 8 y los campos de texto.
async function completarFormularioValido({ cantidad } = {}) {
  await elegirCurso(1, 'Literatura Anglófona I');
  fireEvent.click(await screen.findByLabelText(MAZO_7));
  fireEvent.click(screen.getByLabelText(MAZO_8));

  fireEvent.change(screen.getByLabelText(TEXTOS.etiquetaTitulo), { target: { value: 'Quiz acumulativo' } });
  fireEvent.change(screen.getByLabelText(TEXTOS.etiquetaApertura), { target: { value: APERTURA } });
  fireEvent.change(screen.getByLabelText(TEXTOS.etiquetaCierre), { target: { value: CIERRE } });
  fireEvent.change(screen.getByLabelText(TEXTOS.etiquetaTiempo), { target: { value: '30' } });
  if (cantidad) {
    fireEvent.change(screen.getByLabelText(TEXTOS.etiquetaCantidad), { target: { value: cantidad } });
  }
}

function pulsarGenerar() {
  fireEvent.click(screen.getByRole('button', { name: TEXTOS.botonGenerar }));
}

describe('GenerarQuiz', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listarCursos.mockResolvedValue(CURSOS);
    listarMazos.mockResolvedValue(MAZOS);
  });

  it('carga los cursos en el selector', async () => {
    render(<GenerarQuiz />);

    expect(await screen.findByRole('option', { name: 'Literatura Anglófona I' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Literatura Anglófona II' })).toBeInTheDocument();
  });

  it('muestra solo los mazos del curso elegido, y ninguno antes de elegirlo', async () => {
    render(<GenerarQuiz />);
    await screen.findByRole('option', { name: 'Literatura Anglófona I' });
    expect(screen.queryByLabelText(MAZO_7)).not.toBeInTheDocument();

    await elegirCurso(1, 'Literatura Anglófona I');

    expect(await screen.findByLabelText(MAZO_7)).toBeInTheDocument();
    expect(screen.getByLabelText(MAZO_8)).toBeInTheDocument();
    expect(screen.queryByLabelText(MAZO_OTRO_CURSO)).not.toBeInTheDocument();
  });

  it('descarta los mazos seleccionados al cambiar de curso', async () => {
    render(<GenerarQuiz />);
    await elegirCurso(1, 'Literatura Anglófona I');
    fireEvent.click(await screen.findByLabelText(MAZO_7));
    expect(screen.getByLabelText(MAZO_7)).toBeChecked();

    fireEvent.change(screen.getByLabelText(TEXTOS.etiquetaCurso), { target: { value: '2' } });
    expect(screen.queryByLabelText(MAZO_7)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(TEXTOS.etiquetaCurso), { target: { value: '1' } });
    expect(screen.getByLabelText(MAZO_7)).not.toBeChecked();
  });

  it('con el formulario vacío muestra los errores y no llama al backend', async () => {
    render(<GenerarQuiz />);
    await screen.findByRole('option', { name: 'Literatura Anglófona I' });

    pulsarGenerar();

    expect(screen.getByText(ERRORES_VALIDACION.curso)).toBeInTheDocument();
    expect(screen.getByText(ERRORES_VALIDACION.tituloVacio)).toBeInTheDocument();
    expect(screen.getByText(ERRORES_VALIDACION.aperturaVacia)).toBeInTheDocument();
    expect(screen.getByText(ERRORES_VALIDACION.cierreVacio)).toBeInTheDocument();
    expect(screen.getByText(ERRORES_VALIDACION.tiempoInvalido)).toBeInTheDocument();
    expect(generarQuiz).not.toHaveBeenCalled();
  });

  it('pide seleccionar al menos un mazo cuando hay curso pero ningún mazo marcado', async () => {
    render(<GenerarQuiz />);
    await elegirCurso(1, 'Literatura Anglófona I');
    await screen.findByLabelText(MAZO_7);

    pulsarGenerar();

    expect(screen.getByText(ERRORES_VALIDACION.mazos)).toBeInTheDocument();
    expect(generarQuiz).not.toHaveBeenCalled();
  });

  it('envía el cuerpo del contrato (mazo_ids, fechas en UTC, sin cantidad_preguntas) y muestra el resultado', async () => {
    generarQuiz.mockResolvedValue(RESPUESTA);
    render(<GenerarQuiz />);
    await completarFormularioValido();

    pulsarGenerar();

    expect(await screen.findByText(/Quiz generado: «Quiz acumulativo» con 2 preguntas/)).toBeInTheDocument();
    expect(generarQuiz).toHaveBeenCalledTimes(1);
    expect(generarQuiz).toHaveBeenCalledWith({
      curso_id: 1,
      titulo: 'Quiz acumulativo',
      mazo_ids: [5, 6],
      fecha_apertura: new Date(APERTURA).toISOString(),
      fecha_cierre: new Date(CIERRE).toISOString(),
      tiempo_limite_min: 30,
    });

    // Vista previa para la docente y formulario limpio para un nuevo quiz.
    expect(screen.getByText(TEXTOS.vistaPreviaTitulo)).toBeInTheDocument();
    expect(screen.getAllByText(/Respuesta correcta/)).toHaveLength(2);
    expect(screen.getByLabelText(TEXTOS.etiquetaTitulo)).toHaveValue('');
    expect(screen.getByLabelText(MAZO_7)).not.toBeChecked();
  });

  it('incluye cantidad_preguntas en el cuerpo cuando la docente la escribe', async () => {
    generarQuiz.mockResolvedValue(RESPUESTA);
    render(<GenerarQuiz />);
    await completarFormularioValido({ cantidad: '12' });

    pulsarGenerar();

    await screen.findByText(/Quiz generado/);
    expect(generarQuiz).toHaveBeenCalledWith(expect.objectContaining({ cantidad_preguntas: 12 }));
  });

  it('muestra el mensaje de error que devuelve el backend', async () => {
    const mensaje =
      'Se necesitan al menos 2 tarjetas en estado revisado_docente en los mazos seleccionados para generar un quiz';
    generarQuiz.mockRejectedValue(new Error(mensaje));
    render(<GenerarQuiz />);
    await completarFormularioValido();

    pulsarGenerar();

    expect(await screen.findByText(mensaje)).toBeInTheDocument();
    expect(screen.queryByText(TEXTOS.vistaPreviaTitulo)).not.toBeInTheDocument();
    // Ante un error se conservan los datos escritos para poder corregirlos.
    expect(screen.getByLabelText(TEXTOS.etiquetaTitulo)).toHaveValue('Quiz acumulativo');
  });

  it('si la sesión venció, avisa y cierra la sesión', async () => {
    generarQuiz.mockRejectedValue(new Error('Token inválido o expirado'));
    render(<GenerarQuiz />);
    await completarFormularioValido();

    pulsarGenerar();

    expect(await screen.findByText(TEXTOS.sesionVencida)).toBeInTheDocument();
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('bloquea el botón mientras se envía para no crear dos quices', async () => {
    let terminarEnvio;
    generarQuiz.mockReturnValueOnce(
      new Promise((resolver) => {
        terminarEnvio = resolver;
      })
    );
    render(<GenerarQuiz />);
    await completarFormularioValido();

    pulsarGenerar();

    const botonOcupado = await screen.findByRole('button', { name: TEXTOS.botonGenerando });
    expect(botonOcupado).toBeDisabled();

    // Un clic adicional mientras se envía no debe lanzar otra petición.
    fireEvent.click(botonOcupado);
    expect(generarQuiz).toHaveBeenCalledTimes(1);

    terminarEnvio(RESPUESTA);
    expect(await screen.findByRole('button', { name: TEXTOS.botonGenerar })).toBeEnabled();
    expect(generarQuiz).toHaveBeenCalledTimes(1);
  });
});