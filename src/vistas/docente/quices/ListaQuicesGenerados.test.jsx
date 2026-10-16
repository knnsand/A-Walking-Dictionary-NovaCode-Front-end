// vistas/docente/quices/ListaQuicesGenerados.test.jsx
// HU-3.3 (CA-3.3.2): listar los quices existentes y exportar el elegido.

import { render, screen, fireEvent, within } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ListaQuicesGenerados } from './ListaQuicesGenerados';
import { TEXTOS } from './generarQuiz.constants';

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));
vi.mock('../../../cliente-api/quizzesApi', () => ({ listarQuices: vi.fn() }));
vi.mock('../../../cliente-api/exportacionesApi', () => ({ exportarQuizPdf: vi.fn() }));

import { listarQuices } from '../../../cliente-api/quizzesApi';
import { exportarQuizPdf } from '../../../cliente-api/exportacionesApi';

// Se entregan en el orden "malo" a propósito: la lista debe mostrar el más reciente primero.
const QUICES = [
  { id_quiz: 1, titulo: 'Quiz semanas 1-4', semana_corte: 4, estado_efectivo: 'cerrado' },
  { id_quiz: 2, titulo: 'Quiz semanas 5-8', semana_corte: 8, estado_efectivo: 'programado' },
];

describe('ListaQuicesGenerados', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('muestra los quices con su semana y estado, el más reciente primero', async () => {
    listarQuices.mockResolvedValue(QUICES);
    render(<ListaQuicesGenerados />);

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Quiz semanas 5-8')).toBeInTheDocument();
    expect(within(items[0]).getByText('Semana 8 · Programado')).toBeInTheDocument();
    expect(within(items[1]).getByText('Quiz semanas 1-4')).toBeInTheDocument();
    expect(within(items[1]).getByText('Semana 4 · Cerrado')).toBeInTheDocument();
  });

  it('exporta el PDF del quiz cuyo botón se pulsa', async () => {
    listarQuices.mockResolvedValue(QUICES);
    exportarQuizPdf.mockResolvedValue(undefined);
    render(<ListaQuicesGenerados />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: `${TEXTOS.botonExportarQuiz} del quiz Quiz semanas 1-4`,
      })
    );

    expect(exportarQuizPdf).toHaveBeenCalledTimes(1);
    expect(exportarQuizPdf).toHaveBeenCalledWith(1);
  });

  it('avisa cuando todavía no hay quices', async () => {
    listarQuices.mockResolvedValue([]);
    render(<ListaQuicesGenerados />);

    expect(await screen.findByText(TEXTOS.sinQuices)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('muestra un aviso si no se pudo cargar la lista', async () => {
    listarQuices.mockRejectedValue(new Error('fallo de red'));
    render(<ListaQuicesGenerados />);

    expect(await screen.findByText(TEXTOS.errorQuices)).toBeInTheDocument();
    expect(screen.queryByText(TEXTOS.sinQuices)).not.toBeInTheDocument();
  });

  it('vuelve a cargar la lista cuando cambia refrescarTrigger', async () => {
    listarQuices.mockResolvedValue(QUICES);
    const { rerender } = render(<ListaQuicesGenerados refrescarTrigger={undefined} />);
    await screen.findAllByRole('listitem');
    expect(listarQuices).toHaveBeenCalledTimes(1);

    rerender(<ListaQuicesGenerados refrescarTrigger={3} />);

    await vi.waitFor(() => expect(listarQuices).toHaveBeenCalledTimes(2));
  });
});
