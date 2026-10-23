// vistas/docente/revision-palabras/RevisionPalabras.test.jsx
// HU-004: actualización manual, aprobación de tarjetas y coautorías.

import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from 'vitest';

import { RevisionPalabras } from './RevisionPalabras';

vi.mock('../../../cliente-api/tarjetasApi', () => ({
  listarTarjetasPendientes: vi.fn(),
  listarTarjetasAprobadas: vi.fn(),
  editarTarjeta: vi.fn(),
  aprobarTarjeta: vi.fn(),
  rechazarTarjeta: vi.fn(),
  actualizarContextoTarjeta: vi.fn(),
}));

vi.mock('../../../cliente-api/coautoriaApi', () => ({
  listarCoautoriasPendientes: vi.fn(),
  aprobarCoautoria: vi.fn(),
}));

import {
  listarTarjetasPendientes,
  listarTarjetasAprobadas,
  editarTarjeta,
  aprobarTarjeta,
  actualizarContextoTarjeta,
} from '../../../cliente-api/tarjetasApi';

import {
  listarCoautoriasPendientes,
  aprobarCoautoria,
} from '../../../cliente-api/coautoriaApi';

const TARJETA_APROBADA = {
  id_tarjeta: 10,
  palabra: 'horse',
  definicion: 'animal',
  estudiante: 'Juan Estudiante',
};

const TARJETA_PENDIENTE = {
  id_tarjeta: 30,
  palabra: 'house',
  traduccion: 'casa',
  definicion: 'vivienda',
  ejemplo: 'My house',
  estudiante: 'Ana',
};

const CONTEXTO_VALIDO = {
  registro: 'Formal',
  variante_regional: 'Británico',
};

const HORA_VISIBLE = /Last updated: \d{2}:\d{2}/;

async function completarContextoYConfirmar() {
  const dialog = screen.getByRole('dialog');

  fireEvent.click(
    within(dialog).getByRole('radio', { name: 'Formal' }),
  );

  fireEvent.change(
    within(dialog).getByLabelText(/regional variant/i),
    { target: { value: 'Británico' } },
  );

  fireEvent.click(
    within(dialog).getByRole('button', {
      name: /confirm and approve/i,
    }),
  );
}

describe('RevisionPalabras: actualización manual', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    listarTarjetasPendientes.mockResolvedValue([]);
    listarTarjetasAprobadas.mockResolvedValue([TARJETA_APROBADA]);
    listarCoautoriasPendientes.mockResolvedValue([]);

    editarTarjeta.mockResolvedValue({});
    aprobarTarjeta.mockResolvedValue({});
    actualizarContextoTarjeta.mockResolvedValue({});
    aprobarCoautoria.mockResolvedValue({});

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra la hora de la última actualización cuando termina la carga inicial', async () => {
    render(<RevisionPalabras />);

    expect(await screen.findByText(HORA_VISIBLE)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Refresh' }),
    ).toBeEnabled();

    expect(
      screen.queryByText(/Could not refresh/),
    ).not.toBeInTheDocument();
  });

  it('vuelve a consultar las tres listas al actualizar y bloquea el botón mientras carga', async () => {
    render(<RevisionPalabras />);

    await screen.findByText(HORA_VISIBLE);
    expect(listarTarjetasPendientes).toHaveBeenCalledTimes(1);

    let terminarConsulta;

    listarTarjetasPendientes.mockReturnValueOnce(
      new Promise((resolver) => {
        terminarConsulta = resolver;
      }),
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Refresh' }),
    );

    const botonOcupado = await screen.findByRole('button', {
      name: /refreshing/i,
    });

    expect(botonOcupado).toBeDisabled();

    fireEvent.click(botonOcupado);
    expect(listarTarjetasPendientes).toHaveBeenCalledTimes(2);

    terminarConsulta([]);

    expect(
      await screen.findByRole('button', { name: 'Refresh' }),
    ).toBeEnabled();

    expect(listarTarjetasPendientes).toHaveBeenCalledTimes(2);
    expect(listarTarjetasAprobadas).toHaveBeenCalledTimes(2);
    expect(listarCoautoriasPendientes).toHaveBeenCalledTimes(2);
  });

  it('si falla la lista de coautorías, informa el error y actualiza las demás', async () => {
    listarCoautoriasPendientes.mockRejectedValue(
      new Error('Error 500'),
    );

    render(<RevisionPalabras />);

    expect(
      await screen.findByText(
        'Could not refresh: co-authorships. The previous data is being shown.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(HORA_VISIBLE)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('tab', { name: /approved history/i }),
    );

    expect(screen.getByText('horse')).toBeInTheDocument();
  });

  it('si fallan las tres listas, informa los errores y muestra que no hay hora previa', async () => {
    listarTarjetasPendientes.mockRejectedValue(
      new Error('sin conexión'),
    );
    listarTarjetasAprobadas.mockRejectedValue(
      new Error('sin conexión'),
    );
    listarCoautoriasPendientes.mockRejectedValue(
      new Error('sin conexión'),
    );

    render(<RevisionPalabras />);

    expect(
      await screen.findByText(
        'Could not refresh: new terms, history, co-authorships. The previous data is being shown.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Refresh' }),
    ).toBeEnabled();
  });

  it('conserva los datos anteriores si falla la actualización de una lista', async () => {
    render(<RevisionPalabras />);

    await screen.findByText(HORA_VISIBLE);

    fireEvent.click(
      screen.getByRole('tab', { name: /approved history/i }),
    );

    expect(screen.getByText('horse')).toBeInTheDocument();

    listarTarjetasAprobadas.mockRejectedValueOnce(
      new Error('Error 500'),
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Refresh' }),
    );

    expect(
      await screen.findByText(
        'Could not refresh: history. The previous data is being shown.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('horse')).toBeInTheDocument();
  });

  it('se recupera de un fallo y limpia el aviso después de actualizar correctamente', async () => {
    listarCoautoriasPendientes.mockRejectedValueOnce(
      new Error('Error 500'),
    );

    render(<RevisionPalabras />);

    await screen.findByText(/Could not refresh: co-authorships/);

    fireEvent.click(
      screen.getByRole('button', { name: 'Refresh' }),
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/Could not refresh/),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText(HORA_VISIBLE)).toBeInTheDocument();
  });

  it('abre el modal de contexto al aprobar una tarjeta pendiente y permite cancelarlo', async () => {
    listarTarjetasPendientes.mockResolvedValue([
      {
        ...TARJETA_PENDIENTE,
        id_tarjeta: 20,
      },
    ]);

    render(<RevisionPalabras />);

    await screen.findByText('house');

    fireEvent.click(
      screen.getByRole('button', { name: /^approve$/i }),
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: /cancel/i,
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(editarTarjeta).not.toHaveBeenCalled();
    expect(aprobarTarjeta).not.toHaveBeenCalled();
  });

  it('permite editar una tarjeta pendiente y abre el modal al guardar', async () => {
    listarTarjetasPendientes.mockResolvedValue([
      {
        ...TARJETA_PENDIENTE,
        id_tarjeta: 21,
        palabra: 'book',
        traduccion: 'libro',
        definicion: 'conjunto de páginas escritas',
        ejemplo: '',
      },
    ]);

    render(<RevisionPalabras />);

    await screen.findByText('book');

    fireEvent.click(
      screen.getByRole('button', { name: /edit/i }),
    );

    fireEvent.change(
      screen.getByLabelText(/translation/i),
      { target: { value: 'libro impreso' } },
    );

    fireEvent.click(
      screen.getByRole('button', { name: /save and approve/i }),
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('guarda las correcciones, aprueba la tarjeta y actualiza su contexto', async () => {
    listarTarjetasPendientes.mockResolvedValue([
      TARJETA_PENDIENTE,
    ]);

    render(<RevisionPalabras />);

    await screen.findByText('house');

    fireEvent.click(
      screen.getByRole('button', { name: /^approve$/i }),
    );

    await completarContextoYConfirmar();

    await waitFor(() => {
      expect(editarTarjeta).toHaveBeenCalledWith(30, {
        traduccion: 'casa',
        definicion: 'vivienda',
        ejemplo: 'My house',
      });

      expect(aprobarTarjeta).toHaveBeenCalledWith(30);

      expect(actualizarContextoTarjeta).toHaveBeenCalledWith(
        30,
        CONTEXTO_VALIDO,
      );
    });
  });

  it('muestra un error si falla el guardado de las correcciones', async () => {
    listarTarjetasPendientes.mockResolvedValue([
      TARJETA_PENDIENTE,
    ]);

    editarTarjeta.mockRejectedValueOnce(
      new Error('Error al guardar'),
    );

    render(<RevisionPalabras />);

    await screen.findByText('house');

    fireEvent.click(
      screen.getByRole('button', { name: /^approve$/i }),
    );

    await completarContextoYConfirmar();

    await waitFor(() => {
      expect(editarTarjeta).toHaveBeenCalledWith(30, {
        traduccion: 'casa',
        definicion: 'vivienda',
        ejemplo: 'My house',
      });
    });

    expect(aprobarTarjeta).not.toHaveBeenCalled();
    expect(actualizarContextoTarjeta).not.toHaveBeenCalled();
  });

  it('no guarda el contexto si falla la aprobación de la tarjeta', async () => {
    listarTarjetasPendientes.mockResolvedValue([
      {
        ...TARJETA_PENDIENTE,
        id_tarjeta: 32,
        palabra: 'water',
        traduccion: 'agua',
        definicion: 'líquido',
      },
    ]);

    aprobarTarjeta.mockRejectedValueOnce(
      new Error('Error al aprobar'),
    );

    render(<RevisionPalabras />);

    await screen.findByText('water');

    fireEvent.click(
      screen.getByRole('button', { name: /^approve$/i }),
    );

    await completarContextoYConfirmar();

    await waitFor(() => {
      expect(aprobarTarjeta).toHaveBeenCalledWith(32);
    });

    expect(actualizarContextoTarjeta).not.toHaveBeenCalled();
  });

  it('aprueba una coautoría y vuelve a consultar las listas', async () => {
    listarCoautoriasPendientes.mockResolvedValue([
      {
        id_aporte: 40,
        palabra: 'run',
        traduccion_aportada: 'correr',
        definicion_aportada: 'moverse rápidamente',
        ejemplo_aportado: 'I run every day',
        estudiante: 'Carlos',
      },
    ]);

    render(<RevisionPalabras />);

    // Primero se selecciona la pestaña que contiene las coautorías.
    fireEvent.click(
      screen.getByRole('tab', { name: /co-authorship/i }),
    );

    // Espera la tarjeta una vez que la pestaña está visible.
    const tarjeta = await screen.findByText('correr');
    const contenedor = tarjeta.closest('.tarjeta-pendiente');

    expect(contenedor).not.toBeNull();

    fireEvent.click(
      within(contenedor).getByRole('button', { name: /approve/i }),
    );

    await waitFor(() => {
      expect(aprobarCoautoria).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(listarCoautoriasPendientes).toHaveBeenCalledTimes(2);
    });
  });

  it('maneja un error al aprobar una coautoría', async () => {
    listarCoautoriasPendientes.mockResolvedValue([
      {
        id_aporte: 41,
        palabra: 'walk',
        traduccion_aportada: 'caminar',
        definicion_aportada: 'desplazarse a pie',
        ejemplo_aportado: 'I walk to school',
        estudiante: 'Laura',
      },
    ]);

    aprobarCoautoria.mockRejectedValueOnce(
      new Error('Error al aprobar la coautoría'),
    );

    render(<RevisionPalabras />);

    fireEvent.click(
      screen.getByRole('tab', { name: /co-authorship/i }),
    );

    const tarjeta = await screen.findByText('caminar');
    const contenedor = tarjeta.closest('.tarjeta-pendiente');

    expect(contenedor).not.toBeNull();

    fireEvent.click(
      within(contenedor).getByRole('button', { name: /approve/i }),
    );

    await waitFor(() => {
      expect(aprobarCoautoria).toHaveBeenCalled();
    });
  });
});