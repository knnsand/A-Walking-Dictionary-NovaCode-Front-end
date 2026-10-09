// vistas/docente/quices/VistaPreviaQuiz.test.jsx
// HU-3.1: vista previa de preguntas generadas (solo docente).

import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VistaPreviaQuiz } from './VistaPreviaQuiz';

// Se entregan desordenadas a propósito: el componente debe ordenarlas por `orden`.
const PREGUNTAS = [
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
  {
    id_pregunta: 1,
    quiz_id: 1,
    tarjeta_id: 30,
    tipo_pregunta: 'seleccion_multiple',
    enunciado: '¿Cuál es la traducción correcta de "patchwork"?',
    opcion_a: 'posibilidad',
    opcion_b: 'trabajo de retazos',
    opcion_c: 'pertenecer',
    opcion_d: 'isla',
    respuesta_correcta: 'trabajo de retazos',
    orden: 1,
  },
];

describe('VistaPreviaQuiz', () => {
  it('muestra las preguntas ordenadas por el campo orden', () => {
    render(<VistaPreviaQuiz preguntas={PREGUNTAS} />);

    const enunciados = screen.getAllByText(/traducción correcta de/);
    expect(enunciados).toHaveLength(2);
    expect(enunciados[0]).toHaveTextContent('patchwork');
    expect(enunciados[1]).toHaveTextContent('belong');
  });

  it('no pinta las opciones que vienen null', () => {
    render(<VistaPreviaQuiz preguntas={PREGUNTAS} />);

    const preguntaConDosOpciones = screen.getByText(/belong/).closest('li');
    expect(within(preguntaConDosOpciones).getAllByRole('listitem')).toHaveLength(2);

    const preguntaConCuatroOpciones = screen.getByText(/patchwork/).closest('li');
    expect(within(preguntaConCuatroOpciones).getAllByRole('listitem')).toHaveLength(4);
  });

  it('marca con texto solo la opción correcta de cada pregunta', () => {
    render(<VistaPreviaQuiz preguntas={PREGUNTAS} />);

    const opcionCorrecta = screen.getByText('trabajo de retazos').closest('li');
    expect(within(opcionCorrecta).getByText(/Respuesta correcta/)).toBeInTheDocument();

    const opcionIncorrecta = screen.getByText('posibilidad').closest('li');
    expect(within(opcionIncorrecta).queryByText(/Respuesta correcta/)).not.toBeInTheDocument();

    expect(screen.getAllByText(/Respuesta correcta/)).toHaveLength(2);
  });

  it('no renderiza nada cuando no hay preguntas', () => {
    const { container } = render(<VistaPreviaQuiz preguntas={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});