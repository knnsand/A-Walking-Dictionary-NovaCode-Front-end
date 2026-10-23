import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  logout: vi.fn(),
  auth: {
    rol: 'docente',
    usuario: {
      nombre_completo: 'Docente de prueba',
      email: 'docente@ejemplo.com',
    },
    perfilCompleto: true,
    logout: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock('../../contexto/useAuth', () => ({
  useAuth: () => mocks.auth,
}));

vi.mock('./Sidebar', () => ({
  Sidebar: ({
    rol,
    nombreUsuario,
    correoUsuario,
    perfilCompleto,
    abierto,
    onCerrar,
    onAbrirCrearMazo,
    onAbrirRegistrarTarjeta,
    onAbrirUnirseCurso,
    onCerrarSesion,
  }) => (
    <aside>
      <span data-testid="rol">{rol}</span>
      <span data-testid="nombre">{nombreUsuario ?? 'sin nombre'}</span>
      <span data-testid="correo">{correoUsuario ?? 'sin correo'}</span>
      <span data-testid="perfil">{String(perfilCompleto)}</span>
      <span data-testid="sidebar-abierto">{String(abierto)}</span>
      <button onClick={onCerrar}>Cerrar menú</button>
      <button onClick={onAbrirCrearMazo}>Abrir crear mazo</button>
      <button onClick={onAbrirRegistrarTarjeta}>Abrir registrar tarjeta</button>
      <button onClick={onAbrirUnirseCurso}>Abrir unirse curso</button>
      <button onClick={onCerrarSesion}>Cerrar sesión</button>
    </aside>
  ),
}));

vi.mock('./EncabezadoPagina', () => ({
  EncabezadoPagina: ({ onAbrirMenu }) => (
    <button onClick={onAbrirMenu}>Alternar menú</button>
  ),
}));

vi.mock('../../vistas/docente/ModalCrearMazo', () => ({
  ModalCrearMazo: ({ onCerrar, onMazoCreado }) => (
    <section>
      <span>Modal crear mazo</span>
      <button onClick={onCerrar}>Cerrar modal mazo</button>
      <button onClick={onMazoCreado}>Mazo creado</button>
    </section>
  ),
}));

vi.mock('../../vistas/estudiante/registrar-tarjeta/ModalRegistrarTarjeta', () => ({
  ModalRegistrarTarjeta: ({ onCerrar }) => (
    <section>
      <span>Modal registrar tarjeta</span>
      <button onClick={onCerrar}>Cerrar modal tarjeta</button>
    </section>
  ),
}));

vi.mock('../../vistas/estudiante/unirse-curso/ModalUnirseCurso', () => ({
  ModalUnirseCurso: ({ onCerrar }) => (
    <section>
      <span>Modal unirse curso</span>
      <button onClick={onCerrar}>Cerrar modal curso</button>
    </section>
  ),
}));

import { LayoutPrincipal } from './LayoutPrincipal';

function UbicacionActual() {
  const location = useLocation();

  return (
    <span data-testid="ubicacion">
      {location.pathname}
      {location.state?.refrescar ? '-refrescar' : ''}
    </span>
  );
}

function renderLayout({ rolFijo, contadores } = {}) {
  return render(
    <MemoryRouter initialEntries={['/prueba']}>
      <Routes>
        <Route
          path="*"
          element={
            <LayoutPrincipal rolFijo={rolFijo} contadores={contadores}>
              <span>Contenido de prueba</span>
            </LayoutPrincipal>
          }
        />
      </Routes>
      <UbicacionActual />
    </MemoryRouter>
  );
}

describe('LayoutPrincipal', () => {
  beforeEach(() => {
    mocks.navigate.mockClear();
    mocks.auth = {
      rol: 'docente',
      usuario: {
        nombre_completo: 'Docente de prueba',
        email: 'docente@ejemplo.com',
      },
      perfilCompleto: true,
      logout: mocks.logout,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('renderiza el contenido de la ruta y el rol de sesión', () => {
    renderLayout({ contadores: { pendientes: 3 } });

    expect(screen.getByTestId('rol').textContent).toBe('docente');
    expect(screen.getByTestId('nombre').textContent).toBe('Docente de prueba');
    expect(screen.getByTestId('correo').textContent).toBe('docente@ejemplo.com');
    expect(screen.getByTestId('perfil').textContent).toBe('true');
    expect(document.querySelector('.app-shell--docente')).not.toBeNull();
  });

  it('permite forzar el rol invitado y oculta los datos del usuario', () => {
    renderLayout({ rolFijo: 'invitado' });

    expect(screen.getByTestId('rol').textContent).toBe('invitado');
    expect(screen.getByTestId('nombre').textContent).toBe('sin nombre');
    expect(screen.getByTestId('correo').textContent).toBe('sin correo');
    expect(screen.getByTestId('perfil').textContent).toBe('true');
    expect(document.querySelector('.app-shell--invitado')).not.toBeNull();
  });

  it('permite abrir y cerrar el menú lateral', () => {
    renderLayout();

    expect(screen.getByTestId('sidebar-abierto').textContent).toBe('false');

    fireEvent.click(screen.getByRole('button', { name: 'Alternar menú' }));
    expect(screen.getByTestId('sidebar-abierto').textContent).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(screen.getByTestId('sidebar-abierto').textContent).toBe('false');
  });

  it('abre y cierra el modal de crear mazo', () => {
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir crear mazo' }));
    expect(screen.getByText('Modal crear mazo')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar modal mazo' }));
    expect(screen.queryByText('Modal crear mazo')).toBeNull();
  });

  it('navega a mazos cuando se crea un mazo', () => {
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir crear mazo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mazo creado' }));

    expect(mocks.navigate).toHaveBeenCalledWith(
      '/docente/mazos',
      expect.objectContaining({
        state: expect.objectContaining({ refrescar: expect.any(Number) }),
      })
    );
  });

  it('cierra la sesión y navega al login', () => {
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('solo muestra el modal de registrar tarjeta para estudiantes', () => {
    mocks.auth.rol = 'estudiante';
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir registrar tarjeta' }));
    expect(screen.getByText('Modal registrar tarjeta')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar modal tarjeta' }));
    expect(screen.queryByText('Modal registrar tarjeta')).toBeNull();
  });

  it('solo muestra el modal de unirse a curso para estudiantes', () => {
    mocks.auth.rol = 'estudiante';
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir unirse curso' }));
    expect(screen.getByText('Modal unirse curso')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar modal curso' }));
    expect(screen.queryByText('Modal unirse curso')).toBeNull();
  });

  it('no muestra los modales exclusivos de estudiante para docentes', () => {
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir registrar tarjeta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir unirse curso' }));

    expect(screen.queryByText('Modal registrar tarjeta')).toBeNull();
    expect(screen.queryByText('Modal unirse curso')).toBeNull();
  });

  it('usa el perfil incompleto de la sesión cuando no es invitado', () => {
    mocks.auth.perfilCompleto = false;
    renderLayout();

    expect(screen.getByTestId('perfil').textContent).toBe('false');
  });
});
