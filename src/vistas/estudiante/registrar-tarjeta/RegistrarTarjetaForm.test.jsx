
// vistas/estudiante/registrar-tarjeta/RegistrarTarjetaForm.test.jsx
// HU-002 / HU-003: el estudiante registra una palabra en un mazo abierto.
// Con coautorías desactivadas, la palabra repetida de otro estudiante se registra como aporte;
// si el mismo estudiante ya la envió, se le avisa y no se registra.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { RegistrarTarjetaForm } from './RegistrarTarjetaForm';

vi.hoisted(() => {
  vi.stubEnv('VITE_ENABLE_COAUTHORSHIP', 'false');
});

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ inscripcionId: 44 }),
}));

vi.mock('../../../cliente-api/mazosApi', () => ({
  listarMazos: vi.fn(),
}));

vi.mock('../../../cliente-api/tarjetasApi', () => ({
  verificarDuplicado: vi.fn(),
  registrarTarjeta: vi.fn(),
}));

import { listarMazos } from '../../../cliente-api/mazosApi';
import {
  registrarTarjeta,
  verificarDuplicado,
} from '../../../cliente-api/tarjetasApi';

const MAZOS = [
  {
    id_mazo: 3,
    estado: 'abierto',
    fecha_apertura: '2020-01-01',
    nombre_lectura: 'Beloved',
  },
  {
    id_mazo: 4,
    estado: 'cerrado',
    fecha_apertura: '2020-01-01',
    nombre_lectura: 'Closed book',
  },
  {
    id_mazo: 5,
    estado: 'abierto',
    fecha_apertura: '2999-01-01',
    nombre_lectura: 'Future book',
  },
];

const MENSAJE_YA_ENVIADA =
  'You already submitted this word in this deck, so it is not counted again.';

const MENSAJE_REPETIDA =
  'This word was already in the deck. Your contribution was recorded as a repeated word.';

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: { value: valor },
  });
}

async function llenarFormulario({ ejemplo = '' } = {}) {
  await screen.findByRole('option', { name: 'Beloved' });

  escribir(/^Word/, 'wick');
  escribir(/^Translation/, 'mecha');
  escribir(/^Definition/, 'The cord of a candle');

  if (ejemplo) {
    escribir(/^Example/, ejemplo);
  }

  escribir(/^Reading deck/, '3');
}

function enviar() {
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Submit word for approval',
    })
  );
}

describe('RegistrarTarjetaForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    listarMazos.mockResolvedValue(MAZOS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('solo ofrece los mazos abiertos cuya fecha de apertura ya llegó', async () => {
    render(<RegistrarTarjetaForm />);

    expect(
      await screen.findByRole('option', { name: 'Beloved' })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('option', { name: 'Closed book' })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('option', { name: 'Future book' })
    ).not.toBeInTheDocument();
  });

  it('avisa cuando no hay mazos abiertos', async () => {
    listarMazos.mockResolvedValue([MAZOS[1]]);

    render(<RegistrarTarjetaForm />);

    expect(
      await screen.findByText(
        /There are no open decks in your courses/
      )
    ).toBeInTheDocument();
  });

  it('muestra un error si no se pueden cargar los mazos', async () => {
    listarMazos.mockRejectedValue(new Error('offline'));

    render(<RegistrarTarjetaForm />);

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'Could not load the available decks.'
    );
  });

  it('valida los campos obligatorios antes de llamar al backend', async () => {
    render(<RegistrarTarjetaForm />);

    await screen.findByRole('option', { name: 'Beloved' });

    enviar();

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent(
      'Complete the required fields: word, translation and definition.'
    );

    expect(verificarDuplicado).not.toHaveBeenCalled();
  });

  it('exige elegir un mazo', async () => {
    render(<RegistrarTarjetaForm />);

    await screen.findByRole('option', { name: 'Beloved' });

    escribir(/^Word/, 'wick');
    escribir(/^Translation/, 'mecha');
    escribir(/^Definition/, 'The cord of a candle');

    enviar();

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent('Select a deck to continue.');

    expect(verificarDuplicado).not.toHaveBeenCalled();
  });

  it('muestra el contador de caracteres del ejemplo', async () => {
    render(<RegistrarTarjetaForm />);

    await screen.findByRole('option', { name: 'Beloved' });

    expect(
      screen.getByText('0/150 characters')
    ).toBeInTheDocument();

    escribir(/^Example/, 'abcde');

    expect(
      screen.getByText('5/150 characters')
    ).toBeInTheDocument();
  });

  it('registra la palabra nueva y limpia el formulario', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: false,
    });

    registrarTarjeta.mockResolvedValue({
      resultado: 'nueva',
    });

    render(<RegistrarTarjetaForm />);

    await llenarFormulario({
      ejemplo: 'The wick burned low.',
    });

    enviar();

    expect(
      await screen.findByRole('status')
    ).toHaveTextContent(
      'Word submitted successfully for teacher review.'
    );

    expect(verificarDuplicado).toHaveBeenCalledWith(
      3,
      'wick',
      'The cord of a candle',
      'The wick burned low.'
    );

    expect(registrarTarjeta).toHaveBeenCalledWith(3, {
      palabra: 'wick',
      traduccion: 'mecha',
      definicion: 'The cord of a candle',
      ejemplo: 'The wick burned low.',
      inscripcion_id: 44,
    });

    expect(
      screen.getByLabelText(/^Word/)
    ).toHaveValue('');
  });

  it('registra la palabra repetida de otro estudiante como aporte cuando las coautorías están desactivadas', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: true,
      resultado: 'coautoria',
      ya_enviada: false,
    });

    registrarTarjeta.mockResolvedValue({
      resultado: 'coautoria',
    });

    render(<RegistrarTarjetaForm />);

    await llenarFormulario();

    enviar();

    expect(
      await screen.findByRole('status')
    ).toHaveTextContent(MENSAJE_REPETIDA);

    expect(registrarTarjeta).toHaveBeenCalledTimes(1);

    expect(
      screen.queryByRole('button', {
        name: 'Confirm and submit',
      })
    ).not.toBeInTheDocument();
  });

  it('también registra la repetida con diferente definición como aporte', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: true,
      resultado: 'acepcion_nueva',
      ya_enviada: false,
    });

    registrarTarjeta.mockResolvedValue({
      resultado: 'acepcion_nueva',
    });

    render(<RegistrarTarjetaForm />);

    await llenarFormulario();

    enviar();

    expect(
      await screen.findByRole('status')
    ).toHaveTextContent(MENSAJE_REPETIDA);

    expect(registrarTarjeta).toHaveBeenCalledTimes(1);
  });

  it('avisa y no registra si el mismo estudiante ya envió la palabra', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: true,
      resultado: 'coautoria',
      ya_enviada: true,
    });

    render(<RegistrarTarjetaForm />);

    await llenarFormulario();

    enviar();

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(MENSAJE_YA_ENVIADA);

    expect(verificarDuplicado).toHaveBeenCalledTimes(1);

    expect(registrarTarjeta).not.toHaveBeenCalled();
  });

  it('muestra el aviso propio si el backend responde 409 CARD_ALREADY_SUBMITTED al registrar', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: false,
    });

    registrarTarjeta.mockRejectedValue(
      Object.assign(new Error('Ya enviaste esta palabra en este mazo.'), {
        status: 409,
        cuerpo: { code: 'CARD_ALREADY_SUBMITTED' },
      })
    );

    render(<RegistrarTarjetaForm />);

    await llenarFormulario();

    enviar();

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(MENSAJE_YA_ENVIADA);
  });

  it('limpia el aviso de palabra ya enviada cuando el estudiante modifica la palabra', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: true,
      resultado: 'coautoria',
      ya_enviada: true,
    });

    render(<RegistrarTarjetaForm />);

    await llenarFormulario();

    enviar();

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(MENSAJE_YA_ENVIADA);

    escribir(/^Word/, 'another word');

    await waitFor(() => {
      expect(
        screen.queryByRole('alert')
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByLabelText(/^Word/)
    ).toHaveValue('another word');

    expect(registrarTarjeta).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del backend si falla la verificación', async () => {
    verificarDuplicado.mockRejectedValue(
      new Error('El mazo está cerrado')
    );

    render(<RegistrarTarjetaForm />);

    await llenarFormulario();

    enviar();

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('El mazo está cerrado');
  });

  it('usa un mensaje propio si el error no trae texto', async () => {
    verificarDuplicado.mockRejectedValue({});

    render(<RegistrarTarjetaForm />);

    await llenarFormulario();

    enviar();

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'Could not process the word. Please try again.'
    );
  });

  it('muestra el error si falla el registro y conserva lo escrito', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: false,
    });

    registrarTarjeta.mockRejectedValue(
      new Error('Server error')
    );

    render(<RegistrarTarjetaForm />);

    await llenarFormulario();

    enviar();

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Server error');

    expect(
      screen.getByLabelText(/^Word/)
    ).toHaveValue('wick');
  });

  it('escribir después de un error lo limpia', async () => {
    render(<RegistrarTarjetaForm />);

    await screen.findByRole('option', { name: 'Beloved' });

    enviar();

    expect(
      screen.getByRole('alert')
    ).toBeInTheDocument();

    escribir(/^Word/, 'a');

    await waitFor(() => {
      expect(
        screen.queryByRole('alert')
      ).not.toBeInTheDocument();
    });
  });

  it('muestra el botón de cerrar solo si recibe onCerrar', async () => {
    const onCerrar = vi.fn();

    const { rerender } = render(<RegistrarTarjetaForm />);

    await screen.findByRole('option', { name: 'Beloved' });

    expect(
      screen.queryByRole('button', { name: 'Close' })
    ).not.toBeInTheDocument();

    rerender(
      <RegistrarTarjetaForm onCerrar={onCerrar} />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Close' })
    );

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
