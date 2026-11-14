import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  alternarTema: vi.fn(),
  obtenerPerfil: vi.fn(),
  calcularPerfilCompleto: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }) => (
    <div>
      <button onClick={() => onSuccess({ credential: 'token-google' })}>
        Google success
      </button>
      <button onClick={() => onSuccess({})}>
        Google without credential
      </button>
      <button onClick={onError}>Google error</button>
    </div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
  Trans: () => <span>Register</span>,
}));

vi.mock('../../contexto/useAuth', () => ({
  useAuth: () => ({
    loginWithGoogle: mocks.loginWithGoogle,
    logout: mocks.logout,
  }),
}));

vi.mock('../../contexto/useTheme', () => ({
  useTheme: () => ({
    tema: 'claro',
    alternarTema: mocks.alternarTema,
  }),
}));

vi.mock('../../cliente-api/perfilApi', () => ({
  obtenerPerfil: mocks.obtenerPerfil,
}));

vi.mock('../../contexto/perfilCompleto', () => ({
  calcularPerfilCompleto: mocks.calcularPerfilCompleto,
}));

function mostrar() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('muestra las opciones de acceso y permite cambiar el tema', () => {
    mostrar();

    expect(screen.getByRole('heading', { name: 'A Walking Dictionary' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /auth.darkMode/ }));
    expect(mocks.alternarTema).toHaveBeenCalledOnce();
  });

  it('permite entrar como invitado', () => {
    mostrar();

    fireEvent.click(screen.getByRole('button', { name: 'login.continueAsGuest' }));

    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith('/invitado');
  });

  it('muestra error si Google no entrega credenciales', () => {
    mostrar();

    fireEvent.click(screen.getByRole('button', { name: 'Google without credential' }));

    expect(screen.getByRole('alert')).toHaveTextContent('auth.errors.noGoogleCredential');
  });

  it('muestra error cuando Google falla', () => {
    mostrar();

    fireEvent.click(screen.getByRole('button', { name: 'Google error' }));

    expect(screen.getByRole('alert')).toHaveTextContent('login.errors.googleFailed');
  });

  it('redirige al docente después del inicio de sesión', async () => {
    mocks.loginWithGoogle.mockResolvedValue({
      usuario: { rol: 'docente', id_usuario: 1 },
    });
    mostrar();

    fireEvent.click(screen.getByRole('button', { name: 'Google success' }));

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith('/docente', { replace: true })
    );
  });

  it('envía al estudiante con perfil incompleto a configurarlo', async () => {
    mocks.loginWithGoogle.mockResolvedValue({
      usuario: { rol: 'estudiante', id_usuario: 2 },
    });
    mocks.obtenerPerfil.mockResolvedValue({});
    mocks.calcularPerfilCompleto.mockReturnValue(false);
    mostrar();

    fireEvent.click(screen.getByRole('button', { name: 'Google success' }));

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith(
        '/estudiante/configuracion-perfil',
        { replace: true }
      )
    );
  });

  it('envía al estudiante con perfil completo a sus mazos', async () => {
    mocks.loginWithGoogle.mockResolvedValue({
      usuario: { rol: 'estudiante', id_usuario: 2 },
    });
    mocks.obtenerPerfil.mockResolvedValue({});
    mocks.calcularPerfilCompleto.mockReturnValue(true);
    mostrar();

    fireEvent.click(screen.getByRole('button', { name: 'Google success' }));

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith(
        '/estudiante/mazos',
        { replace: true }
      )
    );
  });

  it('permite entrar a los mazos si falla la consulta del perfil', async () => {
    mocks.loginWithGoogle.mockResolvedValue({
      usuario: { rol: 'estudiante', id_usuario: 2 },
    });
    mocks.obtenerPerfil.mockRejectedValue(new Error('Sin conexión'));
    mostrar();

    fireEvent.click(screen.getByRole('button', { name: 'Google success' }));

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith(
        '/estudiante/mazos',
        { replace: true }
      )
    );
  });

  it('muestra un error para roles desconocidos', async () => {
    mocks.loginWithGoogle.mockResolvedValue({
      usuario: { rol: 'desconocido', id_usuario: 3 },
    });
    mostrar();

    fireEvent.click(screen.getByRole('button', { name: 'Google success' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('login.errors.invalidRole');
  });

  it('muestra un error cuando falla el inicio de sesión', async () => {
    mocks.loginWithGoogle.mockRejectedValue(new Error('Acceso denegado'));
    mostrar();

    fireEvent.click(screen.getByRole('button', { name: 'Google success' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Acceso denegado');
  });
});
