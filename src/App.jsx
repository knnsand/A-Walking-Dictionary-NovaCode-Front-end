import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { AuthProvider } from './contexto/AuthProvider';

import { useAuth } from './contexto/useAuth';

import { PanelDocente } from './vistas/docente/PanelDocente';

import { PanelEstudiante } from './vistas/estudiante/PanelEstudiante';

import './App.css';

function SelectorDeRolTemporal() {
  const { rol, setRol } = useAuth();
  const navigate = useNavigate();

  function cambiarRol(nuevoRol) {
    setRol(nuevoRol);
    navigate(`/${nuevoRol}`);
  }

  return (
    <div style={{ padding: '0.5rem', background: '#eee' }}>
      Rol simulado actual: <strong>{rol}</strong>{' '}
      <button onClick={() => cambiarRol('docente')}>
        Ver como Docente
      </button>
      <button onClick={() => cambiarRol('estudiante')}>
        Ver como Estudiante
      </button>
    </div>
  );
}

// Restricción de acceso por rol (HU-001: "Solo un usuario con rol docente
// puede realizar la acción"). Es una restricción de UX sobre el rol simulado
// del Sprint 1, no un mecanismo de seguridad real; la validación definitiva
// debe existir en el backend.
function RutaSoloDocente({ children }) {
  const { rol } = useAuth();

  if (rol !== 'docente') {
    return (
      <p style={{ padding: '1rem' }}>
        Esta sección está disponible solo para el rol Docente.
      </p>
    );
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SelectorDeRolTemporal />

        <Routes>
          <Route
            path="/docente"
            element={
              <RutaSoloDocente>
                <PanelDocente />
              </RutaSoloDocente>
            }
          />

          <Route
            path="/estudiante"
            element={<PanelEstudiante />}
          />

          <Route
            path="/"
            element={<Navigate to="/docente" />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;