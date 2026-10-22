// vistas/diccionario-global/DiccionarioGlobal.test.jsx
// HU-016: diccionario global con las palabras aprobadas (listado, búsqueda, filtro por letra y detalle).

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { DiccionarioGlobal } from './DiccionarioGlobal';

vi.mock('../../cliente-api/diccionarioApi', () => ({
  listarDiccionario: vi.fn(),
  obtenerDetallePalabra: vi.fn(),
}));
vi.mock('./EnriquecimientoDiccionario', () => ({
  EnriquecimientoDiccionario: ({ palabra }) => <div>enrichment for {palabra}</div>,
}));

import { listarDiccionario, obtenerDetallePalabra } from '../../cliente-api/diccionarioApi';

const PALABRAS = [
  {
    id_tarjeta: 1,
    palabra: 'Apple',
    traduccion: 'manzana',
    definicion: 'A round fruit',
    ejemplo: 'She ate an apple.',
    semana: 2,
    nombre_lectura: 'Beloved',
    contexto: [
      { id_etiqueta: 1, tipo: 'registro', valor: 'informal' },
      { id_etiqueta: 2, tipo: 'variante_regional', valor: 'británico' },
    ],
  },
  {
    id_tarjeta: 2,
    palabra: 'Banner',
    traduccion: null,
    definicion: '',
    ejemplo: null,
    semana: null,
    nombre_lectura: null,
    contexto: [],
  },
];

const DETALLE = {
  id_tarjeta: 1,
  palabra: 'Apple',
  traduccion: 'manzana',
  definicion: 'A round fruit',
  ejemplo: 'She ate an apple.',
  semana: 2,
  nombre_lectura: 'Beloved',
  autor_lectura: 'Toni Morrison',
  contexto: [{ id_etiqueta: 1, tipo: 'categoria_gramatical', valor: 'sustantivo' }],
};

describe('DiccionarioGlobal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listarDiccionario.mockResolvedValue(PALABRAS);
  });

  it('CA-16.1: muestra el estado de carga y luego las palabras aprobadas', async () => {
    render(<DiccionarioGlobal />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading vocabulary...');

    expect(await screen.findByRole('heading', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Banner' })).toBeInTheDocument();
    expect(screen.getByText('2 words found')).toBeInTheDocument();
    expect(listarDiccionario).toHaveBeenCalledWith('');
  });

  it('pinta traducción, definición, ejemplo, semana y lectura de cada tarjeta', async () => {
    render(<DiccionarioGlobal />);

    await screen.findByRole('heading', { name: 'Apple' });

    expect(screen.getByText('manzana')).toBeInTheDocument();
    expect(screen.getByText('A round fruit')).toBeInTheDocument();
    expect(screen.getByText(/She ate an apple\./)).toBeInTheDocument();
    expect(screen.getByText('WEEK 2')).toBeInTheDocument();
    expect(screen.getByText('Beloved')).toBeInTheDocument();
  });

  it('usa textos por defecto cuando faltan datos de la palabra', async () => {
    render(<DiccionarioGlobal />);

    await screen.findByRole('heading', { name: 'Banner' });

    expect(screen.getByText('No translation available')).toBeInTheDocument();
    expect(screen.getByText('No definition available')).toBeInTheDocument();
    expect(screen.getByText('Unknown reading')).toBeInTheDocument();
  });

  it('traduce las etiquetas de contexto al inglés', async () => {
    render(<DiccionarioGlobal />);

    await screen.findByRole('heading', { name: 'Apple' });

    expect(screen.getByText('Register: Informal')).toBeInTheDocument();
    expect(screen.getByText('Regional Variant: British')).toBeInTheDocument();
  });

  it('usa el singular cuando solo hay una palabra', async () => {
    listarDiccionario.mockResolvedValue([PALABRAS[0]]);
    render(<DiccionarioGlobal />);

    expect(await screen.findByText('1 word found')).toBeInTheDocument();
  });

  it('CA-16.2: la búsqueda envía el término sin espacios sobrantes', async () => {
    render(<DiccionarioGlobal />);
    await screen.findByRole('heading', { name: 'Apple' });

    fireEvent.change(screen.getByLabelText('Search vocabulary'), { target: { value: '  app ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => expect(listarDiccionario).toHaveBeenLastCalledWith('app'));
  });

  it('CA-16.3: si la búsqueda no tiene resultados lo explica con el término buscado', async () => {
    render(<DiccionarioGlobal />);
    await screen.findByRole('heading', { name: 'Apple' });
    listarDiccionario.mockResolvedValue([]);

    fireEvent.change(screen.getByLabelText('Search vocabulary'), { target: { value: 'zzz' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByText('No matching words found')).toBeInTheDocument();
    expect(screen.getByText('No approved vocabulary matches "zzz". Try another search.')).toBeInTheDocument();
  });

  it('sin palabras aprobadas ni búsqueda muestra el mensaje de vacío', async () => {
    listarDiccionario.mockResolvedValue([]);
    render(<DiccionarioGlobal />);

    expect(await screen.findByText('No approved vocabulary is available yet.')).toBeInTheDocument();
  });

  it('el filtro por letra deja solo las palabras que empiezan con esa letra', async () => {
    render(<DiccionarioGlobal />);
    await screen.findByRole('heading', { name: 'Apple' });

    fireEvent.click(screen.getByRole('button', { name: 'B' }));

    expect(screen.queryByRole('heading', { name: 'Apple' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Banner' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('si ninguna palabra empieza con la letra elegida lo indica', async () => {
    render(<DiccionarioGlobal />);
    await screen.findByRole('heading', { name: 'Apple' });

    fireEvent.click(screen.getByRole('button', { name: 'Z' }));

    expect(screen.getByText('No words starting with "Z" were found.')).toBeInTheDocument();
  });

  it('"Clear Filters" borra la búsqueda y la letra', async () => {
    render(<DiccionarioGlobal />);
    await screen.findByRole('heading', { name: 'Apple' });
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    fireEvent.change(screen.getByLabelText('Search vocabulary'), { target: { value: 'ban' } });

    fireEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));

    expect(screen.getByLabelText('Search vocabulary')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'ALL' })).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByRole('heading', { name: 'Apple' })).toBeInTheDocument();
  });

  it('muestra un error si no se puede cargar el diccionario', async () => {
    listarDiccionario.mockRejectedValue(new Error('fail'));
    render(<DiccionarioGlobal />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load the dictionary. Please try again.'
    );
    expect(screen.queryByText(/words? found/)).not.toBeInTheDocument();
  });

  describe('detalle de una palabra', () => {
    async function abrirDetalle() {
      render(<DiccionarioGlobal />);
      await screen.findByRole('heading', { name: 'Apple' });
      fireEvent.click(screen.getAllByRole('button', { name: /View Details/ })[0]);
    }

    it('abre un diálogo con el detalle completo y el enriquecimiento', async () => {
      obtenerDetallePalabra.mockResolvedValue(DETALLE);
      await abrirDetalle();

      const dialogo = await screen.findByRole('dialog');
      expect(obtenerDetallePalabra).toHaveBeenCalledWith(1);
      expect(await within(dialogo).findByText('Toni Morrison')).toBeInTheDocument();
      expect(within(dialogo).getByText('Part of Speech: Noun')).toBeInTheDocument();
      expect(within(dialogo).getByText('enrichment for Apple')).toBeInTheDocument();
      expect(within(dialogo).getByText('Week:')).toBeInTheDocument();
    });

    it('mientras carga muestra el estado de carga del detalle', async () => {
      obtenerDetallePalabra.mockReturnValue(new Promise(() => {}));
      await abrirDetalle();

      expect(await screen.findByText('Loading word details...')).toBeInTheDocument();
    });

    it('si falla la carga del detalle muestra un error dentro del diálogo', async () => {
      obtenerDetallePalabra.mockRejectedValue(new Error('fail'));
      await abrirDetalle();

      expect(await screen.findByText('Unable to load word details. Please try again.')).toBeInTheDocument();
    });

    it('sin ejemplo ni contexto muestra los textos de respaldo', async () => {
      obtenerDetallePalabra.mockResolvedValue({
        id_tarjeta: 1,
        palabra: 'Apple',
        traduccion: '',
        definicion: '',
        ejemplo: null,
        contexto: [],
        nombre_lectura: null,
        semana: null,
      });
      await abrirDetalle();

      expect(await screen.findByText('No example available.')).toBeInTheDocument();
      expect(screen.getByText('No context tags available.')).toBeInTheDocument();
      expect(screen.getByText('Not specified')).toBeInTheDocument();
    });

    it('se cierra con el botón Close', async () => {
      obtenerDetallePalabra.mockResolvedValue(DETALLE);
      await abrirDetalle();
      await screen.findByRole('dialog');

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('se cierra con el botón × y con la tecla Escape', async () => {
      obtenerDetallePalabra.mockResolvedValue(DETALLE);
      await abrirDetalle();
      await screen.findByRole('dialog');

      fireEvent.click(screen.getByRole('button', { name: 'Close word details' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      fireEvent.click(screen.getAllByRole('button', { name: /View Details/ })[0]);
      await screen.findByRole('dialog');
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('se cierra al hacer clic en el fondo, pero no dentro del diálogo', async () => {
      obtenerDetallePalabra.mockResolvedValue(DETALLE);
      await abrirDetalle();
      const dialogo = await screen.findByRole('dialog');

      fireEvent.mouseDown(dialogo);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.mouseDown(dialogo.parentElement);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('ignora una respuesta tardía si el diálogo ya se cerró', async () => {
      let resolver;
      obtenerDetallePalabra.mockReturnValue(new Promise((r) => { resolver = r; }));
      await abrirDetalle();
      await screen.findByRole('dialog');

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      resolver(DETALLE);

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.queryByText('Toni Morrison')).not.toBeInTheDocument();
    });
  });
});
