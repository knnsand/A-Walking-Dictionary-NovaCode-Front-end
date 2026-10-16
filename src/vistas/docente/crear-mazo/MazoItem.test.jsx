// vistas/docente/crear-mazo/MazoItem.test.jsx
// HU-3.3: la docente puede exportar el mazo a PDF; los demás roles no ven el botón.

import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { MazoItem } from './MazoItem';

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));
vi.mock('../../../cliente-api/mazosApi', () => ({ actualizarEstadoMazo: vi.fn() }));
vi.mock('../../../cliente-api/exportacionesApi', () => ({ exportarMazoPdf: vi.fn() }));

import { exportarMazoPdf } from '../../../cliente-api/exportacionesApi';

const MAZO = {
  id_mazo: 3,
  curso_id: 1,
  semana: 2,
  nombre_lectura: 'Wide Sargasso Sea',
  autor: 'Jean Rhys',
  estado: 'abierto',
  variante_regional_predeterminada: 'Jamaicano',
};

const NOMBRE_BOTON = 'Exportar a PDF el mazo Wide Sargasso Sea';

function renderizar(rol) {
  return render(
    <ul>
      <MazoItem mazo={MAZO} rol={rol} />
    </ul>
  );
}

describe('MazoItem — exportar a PDF (HU-3.3)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('la docente ve el botón y al pulsarlo exporta el mazo correcto', async () => {
    exportarMazoPdf.mockResolvedValue(undefined);
    renderizar('docente');

    fireEvent.click(screen.getByRole('button', { name: NOMBRE_BOTON }));

    expect(exportarMazoPdf).toHaveBeenCalledTimes(1);
    expect(exportarMazoPdf).toHaveBeenCalledWith(3);
    expect(await screen.findByRole('button', { name: NOMBRE_BOTON })).toBeEnabled();
  });

  it('conserva el botón de abrir/cerrar el mazo junto al de exportar', () => {
    renderizar('docente');

    expect(screen.getByRole('button', { name: 'Cerrar el mazo Wide Sargasso Sea' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: NOMBRE_BOTON })).toBeInTheDocument();
  });

  it.each(['estudiante', 'invitado'])('el rol %s no ve el botón de exportar', (rol) => {
    renderizar(rol);

    expect(screen.queryByRole('button', { name: NOMBRE_BOTON })).not.toBeInTheDocument();
    expect(screen.queryByText('Exportar a PDF')).not.toBeInTheDocument();
  });
});
