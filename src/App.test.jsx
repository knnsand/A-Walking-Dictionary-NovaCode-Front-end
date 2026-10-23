import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const authMock = vi.hoisted(() => ({
  autenticado: false,
  rol: null,
}));

// Simulamos los proveedores para aislar las pruebas del enrutamiento.
vi.mock('./contexto/AuthProvider', () => ({
  AuthProvider: ({ children }) => children,
}));

vi.mock('./contexto/ThemeProvider', () => ({
  ThemeProvider: ({ children }) => children,
}));

vi.mock('./contexto/useAuth', () => ({
  useAuth: () => authMock,
}));

// Conservamos los componentes reales de React Router,
// excepto BrowserRouter, que sustituimos para controlar la ruta inicial.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    BrowserRouter: ({ children }) => children,
  };
});

vi.mock('./componentes/comunes/LayoutPrincipal', async () => {
  const { Outlet } = await vi.importActual('react-router-dom');

  return {
    LayoutPrincipal: () => (
      <div>
        <div>Layout principal</div>
        <Outlet />
      </div>
    ),
  };
});

vi.mock('./vistas/autenticacion/Login', () => ({
  Login: () => <div>Pantalla de login</div>,
}));

vi.mock('./vistas/autenticacion/registro/Registro', () => ({
  Registro: () => <div>Pantalla de registro</div>,
}));

vi.mock('./vistas/docente/PanelDocente', () => ({
  PanelDocente: () => <div>Panel docente</div>,
}));

vi.mock('./vistas/estudiante/PanelEstudiante', () => ({
  PanelEstudiante: () => <div>Panel estudiante</div>,
}));

vi.mock('./vistas/docente/revision-palabras/RevisionPalabras', () => ({
  RevisionPalabras: () => <div>Revisión de palabras</div>,
}));

vi.mock('./vistas/docente/cursos/CursosEstudiantes', () => ({
  CursosEstudiantes: () => <div>Cursos del docente</div>,
}));

vi.mock('./vistas/docente/cursos/DetalleCurso', () => ({
  DetalleCurso: () => <div>Detalle del curso</div>,
}));

vi.mock('./vistas/estudiante/configurar-perfil/ConfigurarPerfil', () => ({
  ConfigurarPerfil: () => <div>Configuración del perfil</div>,
}));

vi.mock('./vistas/docente/participacion/ParticipacionMazo', () => ({
  ParticipacionMazo: () => <div>Participación del mazo</div>,
}));

vi.mock('./vistas/estudiante/estudiar-tarjetas/PaginaEstudio', () => ({
  PaginaEstudio: () => <div>Página de estudio</div>,
}));

vi.mock('./vistas/mazos-estudio/MazosEstudio', () => ({
  MazosEstudio: ({ rol }) => <div>Mazos de {rol}</div>,
}));

vi.mock('./vistas/docente/quices/GenerarQuiz', () => ({
  GenerarQuiz: () => <div>Generar quiz</div>,
}));

vi.mock('./vistas/quices/ListaQuices', () => ({
  ListaQuices: ({ rol }) => <div>Lista de quices de {rol}</div>,
}));

vi.mock('./vistas/estudiante/responder-quiz/ResponderQuiz', () => ({
  ResponderQuiz: () => <div>Responder quiz</div>,
}));

vi.mock('./vistas/diccionario-global/DiccionarioGlobal', () => ({
  DiccionarioGlobal: () => <div>Diccionario global</div>,
}));

function renderApp(ruta, { autenticado = false, rol = null } = {}) {
  authMock.autenticado = autenticado;
  authMock.rol = rol;

  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App - configuración de rutas', () => {
  beforeEach(() => {
    authMock.autenticado = false;
    authMock.rol = null;
  });

  afterEach(() => {
    cleanup();
  });

  it('redirige la ruta raíz al login', () => {
    renderApp('/');

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('muestra el login', () => {
    renderApp('/login');

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('muestra el registro', () => {
    renderApp('/registro');

    expect(screen.getByText('Pantalla de registro')).toBeInTheDocument();
  });

  it('redirige al login si no hay sesión al entrar como docente', () => {
    renderApp('/docente');

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('redirige al login si no hay sesión al entrar como estudiante', () => {
    renderApp('/estudiante');

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('redirige al estudiante cuando un docente intenta entrar en la ruta de estudiante', () => {
    renderApp('/estudiante', {
      autenticado: true,
      rol: 'docente',
    });

    expect(screen.getByText('Panel docente')).toBeInTheDocument();
  });

  it('redirige al docente cuando un estudiante intenta entrar en la ruta de docente', () => {
    renderApp('/docente', {
      autenticado: true,
      rol: 'estudiante',
    });

    expect(screen.getByText('Panel estudiante')).toBeInTheDocument();
  });

  it('permite al docente acceder a sus mazos', () => {
    renderApp('/docente/mazos', {
      autenticado: true,
      rol: 'docente',
    });

    expect(screen.getByText('Panel docente')).toBeInTheDocument();
  });

  it('permite al estudiante acceder a su panel', () => {
    renderApp('/estudiante', {
      autenticado: true,
      rol: 'estudiante',
    });

    expect(screen.getByText('Panel estudiante')).toBeInTheDocument();
  });

  it('redirige la ruta antigua mazoscreados a los mazos del docente', () => {
    renderApp('/docente/mazoscreados', {
      autenticado: true,
      rol: 'docente',
    });

    expect(screen.getByText('Panel docente')).toBeInTheDocument();
  });

  it('redirige la ruta principal del invitado a sus mazos', () => {
    renderApp('/invitado');

    expect(screen.getByText('Mazos de invitado')).toBeInTheDocument();
  });

  it('muestra los cursos del docente', () => {
    renderApp('/docente/cursos', {
      autenticado: true,
      rol: 'docente',
    });

    expect(screen.getByText('Cursos del docente')).toBeInTheDocument();
  });

  it('muestra los mazos del estudiante', () => {
    renderApp('/estudiante/mazos', {
      autenticado: true,
      rol: 'estudiante',
    });

    expect(screen.getByText('Mazos de estudiante')).toBeInTheDocument();
  });

  it('muestra el diccionario global del invitado', () => {
    renderApp('/invitado/diccionario');

    expect(screen.getByText('Diccionario global')).toBeInTheDocument();
  });
});