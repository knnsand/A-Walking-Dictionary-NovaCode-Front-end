// contexto/AuthProvider.test.jsx
// HU-015 / HU-012: sesión global (login, registro, logout y restauración desde localStorage).

import { act, render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

vi.mock('../cliente-api/authApi', () => ({
  iniciarSesionConGoogle: vi.fn(),
  registrarConGoogle: vi.fn(),
}));
vi.mock('../cliente-api/perfilApi', () => ({
  obtenerPerfil: vi.fn(),
  obtenerContextoAcademico: vi.fn(),
}));

import { iniciarSesionConGoogle, registrarConGoogle } from '../cliente-api/authApi';
import { obtenerContextoAcademico, obtenerPerfil } from '../cliente-api/perfilApi';

const TOKEN_KEY = 'walking_dictionary_token';
const USER_KEY = 'walking_dictionary_usuario';

const ESTUDIANTE = { id_usuario: 5, rol: 'estudiante', nombre: 'Ana' };
const DOCENTE = { id_usuario: 2, rol: 'docente', nombre: 'Profe' };

function guardarSesion(usuario, token = 'tok-1') {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

function montar() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider });
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    obtenerPerfil.mockResolvedValue({ nivel_ingles: 'B2', codigo_estudiantil: '123' });
    obtenerContextoAcademico.mockResolvedValue({ id_inscripcion: 44 });
  });

  it('sin sesión guardada, el usuario no está autenticado', () => {
    const { result } = montar();

    expect(result.current.autenticado).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.usuario).toBeNull();
    expect(result.current.rol).toBeNull();
    expect(obtenerPerfil).not.toHaveBeenCalled();
  });

  it('restaura la sesión guardada de una docente sin consultar el perfil', () => {
    guardarSesion(DOCENTE);

    const { result } = montar();

    expect(result.current.autenticado).toBe(true);
    expect(result.current.rol).toBe('docente');
    expect(result.current.docenteId).toBe(2);
    expect(result.current.estudianteId).toBeNull();
    expect(result.current.perfilCompleto).toBeNull();
    expect(obtenerPerfil).not.toHaveBeenCalled();
  });

  it('restaura la sesión de un estudiante y carga perfil e inscripción', async () => {
    guardarSesion(ESTUDIANTE);

    const { result } = montar();

    expect(result.current.estudianteId).toBe(5);
    expect(result.current.inscripcionCargando).toBe(true);

    await waitFor(() => expect(result.current.inscripcionId).toBe(44));
    expect(result.current.inscripcionCargando).toBe(false);
    expect(result.current.perfilCompleto).toBe(true);
    expect(obtenerPerfil).toHaveBeenCalledWith(5);
    expect(obtenerContextoAcademico).toHaveBeenCalledWith(5);
  });

  it('marca el perfil como incompleto cuando faltan campos obligatorios', async () => {
    guardarSesion(ESTUDIANTE);
    obtenerPerfil.mockResolvedValue({ nivel_ingles: '', codigo_estudiantil: '' });

    const { result } = montar();

    await waitFor(() => expect(result.current.perfilCompleto).toBe(false));
  });

  it('si falla la consulta del perfil no se bloquea el menú (perfilCompleto null)', async () => {
    guardarSesion(ESTUDIANTE);
    obtenerPerfil.mockRejectedValue(new Error('fail'));

    const { result } = montar();

    await waitFor(() => expect(obtenerPerfil).toHaveBeenCalled());
    expect(result.current.perfilCompleto).toBeNull();
  });

  it('si falla el contexto académico usa la inscripción de respaldo (null sin variable de entorno)', async () => {
    guardarSesion(ESTUDIANTE);
    obtenerContextoAcademico.mockRejectedValue(new Error('fail'));

    const { result } = montar();

    await waitFor(() => expect(result.current.inscripcionCargando).toBe(false));
    expect(result.current.inscripcionId).toBeNull();
  });

  it('descarta una sesión guardada con JSON dañado y limpia el almacenamiento', () => {
    localStorage.setItem(TOKEN_KEY, 'tok');
    localStorage.setItem(USER_KEY, '{no-es-json');

    const { result } = montar();

    expect(result.current.autenticado).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('ignora la sesión si falta el token o el usuario', () => {
    localStorage.setItem(TOKEN_KEY, 'tok');

    const { result } = montar();

    expect(result.current.autenticado).toBe(false);
  });

  it('loginWithGoogle guarda token y usuario y autentica', async () => {
    iniciarSesionConGoogle.mockResolvedValue({ token: 'jwt', usuario: DOCENTE });
    const { result } = montar();

    await act(async () => {
      await result.current.loginWithGoogle('id-token');
    });

    expect(iniciarSesionConGoogle).toHaveBeenCalledWith('id-token');
    expect(result.current.autenticado).toBe(true);
    expect(result.current.rol).toBe('docente');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt');
    expect(JSON.parse(localStorage.getItem(USER_KEY))).toEqual(DOCENTE);
  });

  it('si el login falla, propaga el error y no deja sesión', async () => {
    iniciarSesionConGoogle.mockRejectedValue(new Error('Invalid token'));
    const { result } = montar();

    await act(async () => {
      await expect(result.current.loginWithGoogle('malo')).rejects.toThrow('Invalid token');
    });

    expect(result.current.autenticado).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('registrarConGoogle deja el perfil del estudiante recién registrado como incompleto', async () => {
    registrarConGoogle.mockResolvedValue({ token: 'jwt', usuario: ESTUDIANTE });
    obtenerPerfil.mockReturnValue(new Promise(() => {}));
    const { result } = montar();

    await act(async () => {
      await result.current.registrarConGoogle('id-token');
    });

    expect(registrarConGoogle).toHaveBeenCalledWith('id-token');
    expect(result.current.perfilCompleto).toBe(false);
    expect(result.current.rol).toBe('estudiante');
  });

  it('completarPerfilInicial marca el perfil como completo', async () => {
    guardarSesion(ESTUDIANTE);
    obtenerPerfil.mockResolvedValue({ nivel_ingles: '', codigo_estudiantil: '' });
    const { result } = montar();
    await waitFor(() => expect(result.current.perfilCompleto).toBe(false));

    act(() => result.current.completarPerfilInicial());

    expect(result.current.perfilCompleto).toBe(true);
  });

  it('logout borra la sesión del estado y del almacenamiento', async () => {
    guardarSesion(ESTUDIANTE);
    const { result } = montar();
    await waitFor(() => expect(result.current.perfilCompleto).toBe(true));

    act(() => result.current.logout());

    expect(result.current.autenticado).toBe(false);
    expect(result.current.perfilCompleto).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('renderiza a sus hijos', () => {
    const { getByText } = render(
      <AuthProvider>
        <p>contenido</p>
      </AuthProvider>
    );

    expect(getByText('contenido')).toBeInTheDocument();
  });
});
