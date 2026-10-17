// componentes/comunes/BotonExportarPdf.test.jsx
// HU-3.3: botón de exportar a PDF (estado de carga y manejo de errores).

import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { BotonExportarPdf } from './BotonExportarPdf';
import { TEXTOS_EXPORTAR_PDF } from './exportarPdf.constants';

const { logoutMock } = vi.hoisted(() => ({ logoutMock: vi.fn() }));

vi.mock('../../contexto/useAuth', () => ({
  useAuth: () => ({ logout: logoutMock }),
}));

function renderizar(props = {}) {
  return render(<BotonExportarPdf etiqueta="Exportar a PDF" {...props} />);
}

describe('BotonExportarPdf', () => {
  beforeEach(() => {
    logoutMock.mockClear();
    // El componente registra el error original en consola; se silencia para no ensuciar la salida.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('llama a onExportar al hacer clic', async () => {
    const onExportar = vi.fn().mockResolvedValue(undefined);
    renderizar({ onExportar });

    fireEvent.click(screen.getByRole('button', { name: 'Exportar a PDF' }));

    expect(onExportar).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('button', { name: 'Exportar a PDF' })).toBeEnabled();
  });

  it('muestra el indicador de carga, se bloquea y no lanza una segunda exportación', async () => {
    let terminar;
    const onExportar = vi.fn().mockReturnValue(
      new Promise((resolver) => {
        terminar = resolver;
      })
    );
    renderizar({ onExportar });

    fireEvent.click(screen.getByRole('button', { name: 'Exportar a PDF' }));

    const ocupado = await screen.findByRole('button', { name: TEXTOS_EXPORTAR_PDF.cargando });
    expect(ocupado).toBeDisabled();
    fireEvent.click(ocupado);
    expect(onExportar).toHaveBeenCalledTimes(1);

    terminar();
    expect(await screen.findByRole('button', { name: 'Exportar a PDF' })).toBeEnabled();
  });

  it('muestra el mensaje del backend cuando es legible (mazo o quiz no encontrado)', async () => {
    renderizar({ onExportar: vi.fn().mockRejectedValue(new Error('Mazo no encontrado')) });

    fireEvent.click(screen.getByRole('button', { name: 'Exportar a PDF' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Mazo no encontrado');
    expect(logoutMock).not.toHaveBeenCalled();
  });

  it('avisa que el quiz no tiene preguntas con el mensaje del backend', async () => {
    const mensaje = 'El quiz no tiene preguntas generadas todavía';
    renderizar({ onExportar: vi.fn().mockRejectedValue(new Error(mensaje)) });

    fireEvent.click(screen.getByRole('button', { name: 'Exportar a PDF' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(mensaje);
  });

  it('reemplaza un error técnico (500) por un mensaje genérico', async () => {
    const tecnico = 'WinAnsi cannot encode "😀" (0x1f600)';
    renderizar({ onExportar: vi.fn().mockRejectedValue(new Error(tecnico)) });

    fireEvent.click(screen.getByRole('button', { name: 'Exportar a PDF' }));

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent(TEXTOS_EXPORTAR_PDF.errorGenerico);
    expect(alerta).not.toHaveTextContent('WinAnsi');
  });

  it('si la sesión venció, avisa y cierra la sesión', async () => {
    renderizar({ onExportar: vi.fn().mockRejectedValue(new Error('Token inválido o expirado')) });

    fireEvent.click(screen.getByRole('button', { name: 'Exportar a PDF' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTOS_EXPORTAR_PDF.sesionVencida);
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('si el rol no es docente, avisa sin cerrar la sesión', async () => {
    renderizar({
      onExportar: vi.fn().mockRejectedValue(new Error('No tiene permisos para acceder a este recurso')),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Exportar a PDF' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTOS_EXPORTAR_PDF.sinPermiso);
    expect(logoutMock).not.toHaveBeenCalled();
  });

  it('borra el error anterior al reintentar', async () => {
    const onExportar = vi
      .fn()
      .mockRejectedValueOnce(new Error('Mazo no encontrado'))
      .mockResolvedValueOnce(undefined);
    renderizar({ onExportar });

    fireEvent.click(screen.getByRole('button', { name: 'Exportar a PDF' }));
    await screen.findByRole('alert');

    fireEvent.click(screen.getByRole('button', { name: 'Exportar a PDF' }));

    expect(await screen.findByRole('button', { name: 'Exportar a PDF' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('respeta la propiedad disabled', () => {
    renderizar({ onExportar: vi.fn(), disabled: true });

    expect(screen.getByRole('button', { name: 'Exportar a PDF' })).toBeDisabled();
  });
});
