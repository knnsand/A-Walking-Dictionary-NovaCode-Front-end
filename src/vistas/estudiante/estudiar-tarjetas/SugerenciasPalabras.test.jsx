// vistas/estudiante/estudiar-tarjetas/SugerenciasPalabras.test.jsx
// HU-011: sugerencias de palabras relacionadas (textos en inglés desde en.json).

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import SugerenciasPalabras from './SugerenciasPalabras';

vi.mock('../../../cliente-api/enriquecimientoApi', () => ({ obtenerFamiliaPalabras: vi.fn() }));

import { obtenerFamiliaPalabras } from '../../../cliente-api/enriquecimientoApi';

describe('SugerenciasPalabras', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('no pinta nada si no hay palabra', () => {
    const { container } = render(<SugerenciasPalabras palabra="  " />);

    expect(container).toBeEmptyDOMElement();
    expect(obtenerFamiliaPalabras).not.toHaveBeenCalled();
  });

  it('muestra el título con la palabra, el estado de carga y luego los términos sin repetir ni incluir la palabra', async () => {
    obtenerFamiliaPalabras.mockResolvedValue({
      sugerencias: { sustantivos: { sinonimos: ['Joy', 'joy', 'delight', { palabra: 'glee' }, 'happy'] } },
    });
    render(<SugerenciasPalabras palabra="happy" />);

    expect(screen.getByRole('heading', { name: 'Explore related words' })).toBeInTheDocument();
    expect(screen.getByText('Expand your vocabulary starting from “happy”.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Looking for related words…');

    expect(await screen.findByText('Joy')).toBeInTheDocument();
    expect(screen.getByText('delight')).toBeInTheDocument();
    expect(screen.getByText('glee')).toBeInTheDocument();
    expect(screen.queryByText('joy')).not.toBeInTheDocument();
    expect(screen.queryByText('happy', { selector: 'span' })).not.toBeInTheDocument();
    expect(screen.getByText(/check their meaning in the context of the reading/)).toBeInTheDocument();
  });

  it('avisa cuando no hay sugerencias', async () => {
    obtenerFamiliaPalabras.mockResolvedValue({ sugerencias: [] });
    render(<SugerenciasPalabras palabra="happy" />);

    expect(await screen.findByText('There are no suggestions available for this word.')).toBeInTheDocument();
  });

  it('muestra un aviso si no se pudieron cargar', async () => {
    obtenerFamiliaPalabras.mockRejectedValue(new Error('fallo de red'));
    render(<SugerenciasPalabras palabra="happy" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load the suggestions. Please try again.'
    );
  });
});
