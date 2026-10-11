// vistas/estudiante/responder-quiz/ResultadoQuiz.test.jsx
// HU-3.2: pantalla de resultado (CA-3.2.2 y CA-3.2.3).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ResultadoQuiz } from './ResultadoQuiz';

const resultado = {
  id_resultado: 5,
  quiz_id: 12,
  estudiante_id: 3,
  fecha_inicio: '2026-10-10T15:00:00.000Z',
  fecha_envio: '2026-10-10T15:02:05.000Z',
  puntaje_obtenido: 1,
  puntaje_maximo: 3,
  calificacion: 1.67,
  tiempo_empleado_seg: 125,
};

const fila = (idPregunta, respuestaEstudiante, esCorrecta) => ({
  id_respuesta: idPregunta,
  resultado_id: 5,
  pregunta_id: idPregunta,
  respuesta_estudiante: respuestaEstudiante,
  es_correcta: esCorrecta,
  puntaje_obtenido: esCorrecta ? 1 : 0,
});

// Una correcta, una incorrecta y una sin contestar.
const respuestas = [fila(101, 'cocinar', true), fila(102, 'Isla', false), fila(103, null, false)];

const pregunta = (id, orden, enunciado) => ({
  id_pregunta: id,
  tipo_pregunta: 'seleccion_multiple',
  enunciado,
  opcion_a: 'a',
  opcion_b: 'b',
  opcion_c: 'c',
  opcion_d: 'd',
  orden,
});

const preguntas = [
  pregunta(101, 1, 'Enunciado uno'),
  pregunta(102, 2, 'Enunciado dos'),
  pregunta(103, 3, 'Enunciado tres'),
];

const itemDe = (enunciado) => screen.getByText(enunciado).closest('li');

function montar(props = {}) {
  render(
    <ResultadoQuiz
      resultado={resultado}
      respuestas={respuestas}
      preguntas={preguntas}
      titulo="Quiz semana 3"
      {...props}
    />
  );
}

describe('ResultadoQuiz', () => {
  it('CA-3.2.2: muestra el título, la nota con dos decimales, aciertos, errores y tiempo', () => {
    montar();

    expect(screen.getByRole('heading', { name: 'Resultado' })).toBeInTheDocument();
    expect(screen.getByText('Quiz semana 3')).toBeInTheDocument();
    expect(screen.getByText('1.67')).toBeInTheDocument();
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('convierte los números que llegan como texto (PostgreSQL suele devolverlos así)', () => {
    montar({
      resultado: {
        ...resultado,
        puntaje_obtenido: '1',
        puntaje_maximo: '3',
        calificacion: '4',
        tiempo_empleado_seg: '65',
      },
    });

    expect(screen.getByText('4.00')).toBeInTheDocument();
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
    expect(screen.getByText('01:05')).toBeInTheDocument();
  });

  it('muestra un guion si la nota o el tiempo no son números', () => {
    montar({ resultado: { ...resultado, calificacion: 'abc', tiempo_empleado_seg: undefined } });

    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('muestra el detalle por pregunta ordenado por `orden`', () => {
    montar({ preguntas: [preguntas[2], preguntas[0], preguntas[1]] });

    expect(screen.getByRole('heading', { name: 'Detalle por pregunta' })).toBeInTheDocument();
    const enunciados = screen.getAllByText(/^Enunciado /).map((el) => el.textContent);
    expect(enunciados).toEqual(['Enunciado uno', 'Enunciado dos', 'Enunciado tres']);
  });

  it('marca cada pregunta como correcta, incorrecta o sin contestar', () => {
    montar();

    const correcta = itemDe('Enunciado uno');
    expect(correcta).toHaveClass('resultado-quiz__item--correcta');
    expect(within(correcta).getByText('Correcta')).toBeInTheDocument();
    expect(within(correcta).getByText('Tu respuesta: cocinar')).toBeInTheDocument();

    const incorrecta = itemDe('Enunciado dos');
    expect(incorrecta).toHaveClass('resultado-quiz__item--incorrecta');
    expect(within(incorrecta).getByText('Incorrecta')).toBeInTheDocument();
    expect(within(incorrecta).getByText('Tu respuesta: Isla')).toBeInTheDocument();

    const sin = itemDe('Enunciado tres');
    expect(sin).toHaveClass('resultado-quiz__item--sin');
    expect(within(sin).getByText('Sin contestar')).toBeInTheDocument();
    expect(within(sin).queryByText(/Tu respuesta/)).not.toBeInTheDocument();
  });

  it('una pregunta que no trae fila en `respuestas` se muestra como sin contestar', () => {
    montar({ respuestas: [fila(101, 'cocinar', true)] });

    const sin = itemDe('Enunciado dos');
    expect(within(sin).getByText('Sin contestar')).toBeInTheDocument();
  });

  it('en el primer envío no muestra el aviso de reintento', () => {
    montar();

    expect(screen.queryByText(/no se permite un nuevo intento/)).not.toBeInTheDocument();
  });

  it('CA-3.2.3: si el quiz ya se había enviado, avisa que no hay nuevo intento y muestra el resumen previo', () => {
    montar({ yaEnviado: true });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Ya enviaste este quiz y no se permite un nuevo intento.'
    );
    expect(screen.getByText('1.67')).toBeInTheDocument();
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
  });

  it('sin enunciados muestra la nota y los conteos con un aviso en lugar del detalle', () => {
    montar({ preguntas: null });

    expect(screen.getByText('1.67')).toBeInTheDocument();
    expect(screen.getByText('No se pudo cargar el detalle de las preguntas.')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Detalle por pregunta' })
    ).not.toBeInTheDocument();
  });

  it('muestra el botón para salir solo si se pasa onVolver', () => {
    const { unmount } = render(
      <ResultadoQuiz resultado={resultado} respuestas={respuestas} preguntas={preguntas} />
    );
    expect(screen.queryByRole('button', { name: 'Volver al panel' })).not.toBeInTheDocument();
    unmount();

    const onVolver = vi.fn();
    montar({ onVolver });

    fireEvent.click(screen.getByRole('button', { name: 'Volver al panel' }));
    expect(onVolver).toHaveBeenCalledTimes(1);
  });
});