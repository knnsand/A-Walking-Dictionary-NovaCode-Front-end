// vistas/estudiante/registrar-tarjeta/RegistrarTarjetaForm.test.jsx
// HU-002 / HU-003: el estudiante registra una palabra en un mazo abierto, con alerta de duplicados.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { RegistrarTarjetaForm } from './RegistrarTarjetaForm';

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ inscripcionId: 44 }),
}));
vi.mock('../../../cliente-api/mazosApi', () => ({ listarMazos: vi.fn() }));
vi.mock('../../../cliente-api/tarjetasApi', () => ({
  verificarDuplicado: vi.fn(),
  registrarTarjeta: vi.fn(),
}));

import { listarMazos } from '../../../cliente-api/mazosApi';
import { registrarTarjeta, verificarDuplicado } from '../../../cliente-api/tarjetasApi';

const MAZOS = [
  { id_mazo: 3, estado: 'abierto', fecha_apertura: '2020-01-01', nombre_lectura: 'Beloved' },
  { id_mazo: 4, estado: 'cerrado', fecha_apertura: '2020-01-01', nombre_lectura: 'Closed book' },
  { id_mazo: 5, estado: 'abierto', fecha_apertura: '2999-01-01', nombre_lectura: 'Future book' },
];

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

async function llenarFormulario({ ejemplo = '' } = {}) {
  await screen.findByRole('option', { name: 'Beloved' });
  escribir(/^Word/, 'wick');
  escribir(/^Translation/, 'mecha');
  escribir(/^Definition/, 'The cord of a candle');
  if (ejemplo) escribir(/^Example/, ejemplo);
  escribir(/^Reading deck/, '3');
}

function enviar() {
  fireEvent.click(screen.getByRole('button', { name: 'Submit word for approval' }));
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

    expect(await screen.findByRole('option', { name: 'Beloved' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Closed book' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Future book' })).not.toBeInTheDocument();
  });

  it('avisa cuando no hay mazos abiertos', async () => {
    listarMazos.mockResolvedValue([MAZOS[1]]);
    render(<RegistrarTarjetaForm />);

    expect(await screen.findByText(/There are no open decks in your courses/)).toBeInTheDocument();
  });

  it('muestra un error si no se pueden cargar los mazos', async () => {
    listarMazos.mockRejectedValue(new Error('offline'));
    render(<RegistrarTarjetaForm />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the available decks.');
  });

  it('valida los campos obligatorios antes de llamar al backend', async () => {
    render(<RegistrarTarjetaForm />);
    await screen.findByRole('option', { name: 'Beloved' });

    enviar();

    expect(screen.getByRole('alert')).toHaveTextContent(
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

    expect(screen.getByRole('alert')).toHaveTextContent('Select a deck to continue.');
    expect(verificarDuplicado).not.toHaveBeenCalled();
  });

  it('muestra el contador de caracteres del ejemplo', async () => {
    render(<RegistrarTarjetaForm />);
    await screen.findByRole('option', { name: 'Beloved' });

    expect(screen.getByText('0/150 characters')).toBeInTheDocument();
    escribir(/^Example/, 'abcde');
    expect(screen.getByText('5/150 characters')).toBeInTheDocument();
  });

  it('registra la palabra nueva y limpia el formulario', async () => {
    verificarDuplicado.mockResolvedValue({ duplicado: false });
    registrarTarjeta.mockResolvedValue({ resultado: 'nueva' });
    render(<RegistrarTarjetaForm />);
    await llenarFormulario({ ejemplo: 'The wick burned low.' });

    enviar();

    expect(await screen.findByRole('status')).toHaveTextContent(
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
    expect(screen.getByLabelText(/^Word/)).toHaveValue('');
  });

  it('con una palabra duplicada pide confirmación y no envía hasta confirmar', async () => {
    verificarDuplicado.mockResolvedValue({ duplicado: true, resultado: 'coautoria' });
    registrarTarjeta.mockResolvedValue({ resultado: 'coautoria' });
    render(<RegistrarTarjetaForm />);
    await llenarFormulario();

    enviar();

    expect(
      await screen.findByText(/This word already exists in the deck, with the same definition\./)
    ).toBeInTheDocument();
    expect(registrarTarjeta).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm and submit' }));

    expect(await screen.findByText(/You were registered as a co-author/)).toBeInTheDocument();
    expect(registrarTarjeta).toHaveBeenCalledTimes(1);
  });

  it('con otra definición avisa que se guardará como acepción adicional', async () => {
    verificarDuplicado.mockResolvedValue({ duplicado: true, resultado: 'acepcion_nueva' });
    registrarTarjeta.mockResolvedValue({ resultado: 'acepcion_nueva' });
    render(<RegistrarTarjetaForm />);
    await llenarFormulario();

    enviar();

    expect(
      await screen.findByText(/This word already exists in the deck, with a different definition\./)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm and submit' }));

    expect(await screen.findByText(/Additional meaning registered successfully/)).toBeInTheDocument();
  });

  it('cancelar la confirmación de duplicado no envía nada', async () => {
    verificarDuplicado.mockResolvedValue({ duplicado: true, resultado: 'coautoria' });
    render(<RegistrarTarjetaForm />);
    await llenarFormulario();
    enviar();
    await screen.findByText(/already exists in the deck/);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText(/already exists in the deck/)).not.toBeInTheDocument();
    expect(registrarTarjeta).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del backend si falla la verificación', async () => {
    verificarDuplicado.mockRejectedValue(new Error('El mazo está cerrado'));
    render(<RegistrarTarjetaForm />);
    await llenarFormulario();

    enviar();

    expect(await screen.findByRole('alert')).toHaveTextContent('El mazo está cerrado');
  });

  it('usa un mensaje propio si el error no trae texto', async () => {
    verificarDuplicado.mockRejectedValue({});
    render(<RegistrarTarjetaForm />);
    await llenarFormulario();

    enviar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not process the word. Please try again.'
    );
  });

  it('muestra el error si falla el registro y conserva lo escrito', async () => {
    verificarDuplicado.mockResolvedValue({ duplicado: false });
    registrarTarjeta.mockRejectedValue(new Error('Server error'));
    render(<RegistrarTarjetaForm />);
    await llenarFormulario();

    enviar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error');
    expect(screen.getByLabelText(/^Word/)).toHaveValue('wick');
  });

  it('escribir después de un error lo limpia', async () => {
    render(<RegistrarTarjetaForm />);
    await screen.findByRole('option', { name: 'Beloved' });
    enviar();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    escribir(/^Word/, 'a');

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('muestra el botón de cerrar solo si recibe onCerrar', async () => {
    const onCerrar = vi.fn();
    const { rerender } = render(<RegistrarTarjetaForm />);
    await screen.findByRole('option', { name: 'Beloved' });
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    rerender(<RegistrarTarjetaForm onCerrar={onCerrar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
