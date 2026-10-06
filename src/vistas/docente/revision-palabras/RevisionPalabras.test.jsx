// vistas/docente/revision-palabras/RevisionPalabras.test.jsx
// HU-004: botón "Actualizar" y hora de la última actualización del panel de revisión.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
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
  rechazarCoautoria: vi.fn(),
}));

import {
  listarTarjetasPendientes,
  listarTarjetasAprobadas,
} from '../../../cliente-api/tarjetasApi';
import { listarCoautoriasPendientes } from '../../../cliente-api/coautoriaApi';

const TARJETA_APROBADA = {
  id_tarjeta: 10,
  palabra: 'horse',
  definicion: 'animal',
  estudiante: 'Juan Estudiante',
};

const HORA_VISIBLE = /Última actualización: \d{2}:\d{2}/;

describe('RevisionPalabras: actualización manual', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listarTarjetasPendientes.mockResolvedValue([]);
    listarTarjetasAprobadas.mockResolvedValue([TARJETA_APROBADA]);
    listarCoautoriasPendientes.mockResolvedValue([]);
    // El componente registra con console.error las listas que fallan; se silencia en las pruebas.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra la hora de la última actualización cuando termina la carga inicial', async () => {
    render(<RevisionPalabras />);

    expect(await screen.findByText(HORA_VISIBLE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeEnabled();
    expect(screen.queryByText(/No se pudo actualizar/)).not.toBeInTheDocument();
  });

  it('vuelve a consultar las tres listas al pulsar Actualizar y bloquea el botón mientras carga', async () => {
    render(<RevisionPalabras />);
    await screen.findByText(HORA_VISIBLE);
    expect(listarTarjetasPendientes).toHaveBeenCalledTimes(1);

    let terminarConsulta;
    listarTarjetasPendientes.mockReturnValueOnce(
      new Promise((resolver) => {
        terminarConsulta = resolver;
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    const botonOcupado = await screen.findByRole('button', { name: 'Actualizando…' });
    expect(botonOcupado).toBeDisabled();

    // Un clic adicional mientras carga no debe lanzar otra consulta.
    fireEvent.click(botonOcupado);
    expect(listarTarjetasPendientes).toHaveBeenCalledTimes(2);

    terminarConsulta([]);
    expect(await screen.findByRole('button', { name: 'Actualizar' })).toBeEnabled();

    expect(listarTarjetasPendientes).toHaveBeenCalledTimes(2);
    expect(listarTarjetasAprobadas).toHaveBeenCalledTimes(2);
    expect(listarCoautoriasPendientes).toHaveBeenCalledTimes(2);
  });

  it('si falla solo la lista de coautorías, avisa cuál falló y actualiza las demás', async () => {
    listarCoautoriasPendientes.mockRejectedValue(new Error('Error 500'));

    render(<RevisionPalabras />);

    expect(
      await screen.findByText('No se pudo actualizar: coautorías. Se muestran los datos anteriores.')
    ).toBeInTheDocument();

    // La hora avanza porque al menos una lista se actualizó.
    expect(screen.getByText(HORA_VISIBLE)).toBeInTheDocument();

    // El historial sí se cargó.
    fireEvent.click(screen.getByRole('tab', { name: /Historial Aprobadas/ }));
    expect(screen.getByText('horse')).toBeInTheDocument();
  });

  it('si fallan las tres listas, nombra las tres y la hora no avanza', async () => {
    listarTarjetasPendientes.mockRejectedValue(new Error('sin conexión'));
    listarTarjetasAprobadas.mockRejectedValue(new Error('sin conexión'));
    listarCoautoriasPendientes.mockRejectedValue(new Error('sin conexión'));

    render(<RevisionPalabras />);

    expect(
      await screen.findByText(
        'No se pudo actualizar: nuevos términos, historial, coautorías. Se muestran los datos anteriores.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Última actualización: —/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeEnabled();
  });

  it('conserva los datos anteriores de una lista cuando su actualización falla', async () => {
    render(<RevisionPalabras />);
    await screen.findByText(HORA_VISIBLE);
    fireEvent.click(screen.getByRole('tab', { name: /Historial Aprobadas/ }));
    expect(screen.getByText('horse')).toBeInTheDocument();

    listarTarjetasAprobadas.mockRejectedValueOnce(new Error('Error 500'));
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(
      await screen.findByText('No se pudo actualizar: historial. Se muestran los datos anteriores.')
    ).toBeInTheDocument();
    expect(screen.getByText('horse')).toBeInTheDocument();
  });

  it('se recupera: una actualización exitosa después de un fallo limpia el aviso', async () => {
    listarCoautoriasPendientes.mockRejectedValueOnce(new Error('Error 500'));

    render(<RevisionPalabras />);
    await screen.findByText(/No se pudo actualizar: coautorías/);

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() =>
      expect(screen.queryByText(/No se pudo actualizar/)).not.toBeInTheDocument()
    );
    expect(screen.getByText(HORA_VISIBLE)).toBeInTheDocument();
  });
});