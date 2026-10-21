import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from './Sidebar';

vi.mock('../../contexto/useTheme', () => ({
  useTheme: () => ({ tema: 'claro', alternarTema: () => {} }),
}));

function montar(props = {}) {
  render(
    <MemoryRouter>
      <Sidebar rol="estudiante" nombreUsuario="Ana" abierto={false} {...props} />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('con el perfil incompleto muestra el aviso con el enlace a Settings & Profile', () => {
    montar({ perfilCompleto: false });

    const aviso = screen.getByRole('status');
    expect(aviso).toHaveTextContent(/Go to Settings & Profile and complete your academic profile/);

    const enlace = within(aviso).getByRole('link', { name: 'Settings & Profile' });
    expect(enlace).toHaveAttribute('href', '/estudiante/configuracion-perfil');
  });

  it('con el perfil completo no muestra el aviso', () => {
    montar({ perfilCompleto: true });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('el estudiante ve sus acciones y su rol traducido', () => {
    montar();

    expect(screen.getByRole('button', { name: '+ Add Word to Deck' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join a course' })).toBeInTheDocument();
    // El valor del rol sigue siendo "estudiante"; solo cambia lo que se muestra.
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  it('el invitado ve el modo de consulta pública, el enlace para iniciar sesión y el nombre por defecto', () => {
    montar({ rol: 'invitado', nombreUsuario: undefined });

    expect(screen.getByText(/Public Browsing Mode/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    // Nombre y rol del invitado se muestran como "Guest".
    expect(screen.getAllByText('Guest')).toHaveLength(2);
  });
});