// vistas/estudiante/registrar-tarjeta/ModalRegistrarTarjeta.test.jsx
// El modal se cierra con Escape, con clic en el fondo o con el botón de cerrar.

import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ModalRegistrarTarjeta } from './ModalRegistrarTarjeta';

vi.mock('./RegistrarTarjetaForm', () => ({
  RegistrarTarjetaForm: ({ onCerrar }) => (
    <button type="button" onClick={onCerrar}>
      inner close
    </button>
  ),
}));

describe('ModalRegistrarTarjeta', () => {
  const onCerrar = vi.fn();

  beforeEach(() => {
    onCerrar.mockReset();
  });

  it('se muestra como un diálogo modal con su etiqueta accesible', () => {
    render(<ModalRegistrarTarjeta onCerrar={onCerrar} />);

    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(dialogo).toHaveAttribute('aria-label');
  });

  it('se cierra con la tecla Escape', () => {
    render(<ModalRegistrarTarjeta onCerrar={onCerrar} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('otras teclas no lo cierran', () => {
    render(<ModalRegistrarTarjeta onCerrar={onCerrar} />);

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('se cierra al hacer clic en el fondo, pero no dentro de la tarjeta', () => {
    render(<ModalRegistrarTarjeta onCerrar={onCerrar} />);

    fireEvent.click(screen.getByRole('button', { name: 'inner close' }).closest('.modal-card'));
    expect(onCerrar).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('dialog'));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('le pasa onCerrar al formulario', () => {
    render(<ModalRegistrarTarjeta onCerrar={onCerrar} />);

    fireEvent.click(screen.getByRole('button', { name: 'inner close' }));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('deja de escuchar Escape al desmontarse', () => {
    const { unmount } = render(<ModalRegistrarTarjeta onCerrar={onCerrar} />);
    unmount();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCerrar).not.toHaveBeenCalled();
  });
});
