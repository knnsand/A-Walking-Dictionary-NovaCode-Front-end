// vistas/quices/ListaQuices.test.jsx
// HU-009: lista de quices compartida por docente y estudiante.
//   - docente: lista con exportar a PDF por tarjeta (HU-3.3, CA-3.3.2).
//   - estudiante: lista que enlaza a /estudiante/quices/:idQuiz.

import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ListaQuices } from './ListaQuices';

vi.mock('../../contexto/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));
vi.mock('../../cliente-api/quizzesApi', () => ({ listarQuices: vi.fn() }));
vi.mock('../../cliente-api/exportacionesApi', () => ({ exportarQuizPdf: vi.fn() }));

import { listarQuices } from '../../cliente-api/quizzesApi';
import { exportarQuizPdf } from '../../cliente-api/exportacionesApi';

// Se entregan en el orden "malo" a propósito: la lista debe mostrar el más reciente primero.
// El quiz 2 tiene `estado: 'programado'` pero `estado_efectivo: 'abierto'`: se debe leer el segundo.
const QUICES = [
  {
    id_quiz: 1,
    titulo: 'Quiz semanas 1-4',
    semana_corte: 4,
    fecha_apertura: '2026-10-01T15:00:00.000Z',
    fecha_cierre: '2026-10-02T15:00:00.000Z',
    tiempo_limite_min: 60,
    estado: 'programado',
    estado_efectivo: 'cerrado',
  },
  {
    id_quiz: 2,
    titulo: 'Quiz semanas 5-8',
    semana_corte: 8,
    fecha_apertura: '2026-10-09T15:00:00.000Z',
    fecha_cierre: '2026-10-16T15:00:00.000Z',
    tiempo_limite_min: 30,
    estado: 'programado',
    estado_efectivo: 'abierto',
  },
];

function renderLista(props) {
  return render(
    <MemoryRouter>
      <ListaQuices {...props} />
    </MemoryRouter>
  );
}

describe('ListaQuices', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('como docente', () => {
    it('muestra los quices con su semana y su estado efectivo, el más reciente primero', async () => {
      listarQuices.mockResolvedValue(QUICES);
      renderLista({ rol: 'docente' });

      const items = await screen.findAllByRole('listitem');
      expect(items).toHaveLength(2);

      expect(within(items[0]).getByText('Quiz semanas 5-8')).toBeInTheDocument();
      expect(within(items[0]).getByText('Open')).toBeInTheDocument();
      expect(within(items[0]).getByText('8')).toBeInTheDocument();

      expect(within(items[1]).getByText('Quiz semanas 1-4')).toBeInTheDocument();
      expect(within(items[1]).getByText('Closed')).toBeInTheDocument();
    });

    it('muestra apertura, cierre y tiempo límite', async () => {
      listarQuices.mockResolvedValue([QUICES[1]]);
      renderLista({ rol: 'docente' });

      const [item] = await screen.findAllByRole('listitem');
      expect(within(item).getByText('Opening:')).toBeInTheDocument();
      expect(within(item).getByText('Closing:')).toBeInTheDocument();
      expect(within(item).getByText(/30 min/)).toBeInTheDocument();
    });

    it('exporta el PDF del quiz cuyo botón se pulsa', async () => {
      listarQuices.mockResolvedValue(QUICES);
      exportarQuizPdf.mockResolvedValue(undefined);
      renderLista({ rol: 'docente' });

      fireEvent.click(
        await screen.findByRole('button', {
          name: 'Export printable version of the quiz Quiz semanas 1-4',
        })
      );

      expect(exportarQuizPdf).toHaveBeenCalledTimes(1);
      expect(exportarQuizPdf).toHaveBeenCalledWith(1);
    });

    it('no ofrece acciones de estudiante', async () => {
      listarQuices.mockResolvedValue(QUICES);
      renderLista({ rol: 'docente' });

      await screen.findAllByRole('listitem');
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('avisa cuando todavía no hay quices', async () => {
      listarQuices.mockResolvedValue([]);
      renderLista({ rol: 'docente' });

      expect(await screen.findByText('No quiz has been generated yet.')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('muestra un aviso si no se pudo cargar la lista', async () => {
      listarQuices.mockRejectedValue(new Error('fallo de red'));
      renderLista({ rol: 'docente' });

      expect(await screen.findByText('Could not load the quizzes.')).toBeInTheDocument();
      expect(screen.queryByText('No quiz has been generated yet.')).not.toBeInTheDocument();
    });

    it('vuelve a cargar la lista cuando cambia refrescarTrigger', async () => {
      listarQuices.mockResolvedValue(QUICES);
      const { rerender } = renderLista({ rol: 'docente', refrescarTrigger: undefined });
      await screen.findAllByRole('listitem');
      expect(listarQuices).toHaveBeenCalledTimes(1);

      rerender(
        <MemoryRouter>
          <ListaQuices rol="docente" refrescarTrigger={3} />
        </MemoryRouter>
      );

      await vi.waitFor(() => expect(listarQuices).toHaveBeenCalledTimes(2));
    });
  });

  describe('como estudiante', () => {
    it('enlaza cada quiz a su pantalla y ajusta la acción según el estado', async () => {
      listarQuices.mockResolvedValue(QUICES);
      renderLista({ rol: 'estudiante' });

      const responder = await screen.findByRole('link', { name: 'Take quiz' });
      expect(responder).toHaveAttribute('href', '/estudiante/quices/2');

      const detalle = screen.getByRole('link', { name: 'View details' });
      expect(detalle).toHaveAttribute('href', '/estudiante/quices/1');
    });

    it('marca como respondido el quiz con resultado y muestra la nota', async () => {
      listarQuices.mockResolvedValue([
        { ...QUICES[1], resultado: { id_resultado: 7, calificacion: 4.5 } },
      ]);
      renderLista({ rol: 'estudiante' });

      expect(await screen.findByText(/Answered · Grade 4\.5/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View result' })).toHaveAttribute(
        'href',
        '/estudiante/quices/2'
      );
      expect(screen.queryByRole('link', { name: 'Take quiz' })).not.toBeInTheDocument();
    });

    it('no ofrece exportar a PDF (solo la docente puede)', async () => {
      listarQuices.mockResolvedValue(QUICES);
      renderLista({ rol: 'estudiante' });

      await screen.findAllByRole('listitem');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('avisa cuando todavía no hay quices', async () => {
      listarQuices.mockResolvedValue([]);
      renderLista({ rol: 'estudiante' });

      expect(await screen.findByText('There are no quizzes available yet.')).toBeInTheDocument();
    });

    it('usa el servicio recibido por props en lugar de la API', async () => {
      const servicio = { listarQuices: vi.fn().mockResolvedValue([QUICES[1]]) };
      renderLista({ rol: 'estudiante', servicio });

      expect(await screen.findByText('Quiz semanas 5-8')).toBeInTheDocument();
      expect(servicio.listarQuices).toHaveBeenCalledTimes(1);
      expect(listarQuices).not.toHaveBeenCalled();
    });
  });

  describe('modo embebido', () => {
    it('muestra su propio subtítulo de sección cuando va dentro de otra pantalla', async () => {
      listarQuices.mockResolvedValue(QUICES);
      renderLista({ rol: 'docente', embebida: true });

      expect(await screen.findByRole('heading', { level: 2, name: 'Generated quizzes' })).toBeInTheDocument();
    });

    it('no pinta subtítulo propio cuando es la pantalla completa (el layout pone el título)', async () => {
      listarQuices.mockResolvedValue(QUICES);
      renderLista({ rol: 'estudiante' });

      await screen.findAllByRole('listitem');
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });
  });
});
