import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { AuthProvider } from './contexto/AuthProvider';
import { ThemeProvider } from './contexto/ThemeProvider';
import { useAuth } from './contexto/useAuth';

import { LayoutPrincipal } from './componentes/comunes/LayoutPrincipal';
import { PanelDocente } from './vistas/docente/PanelDocente';
import { RevisionPalabras } from './vistas/docente/revision-palabras/RevisionPalabras';
import { PanelEstudiante } from './vistas/estudiante/PanelEstudiante';
import { CursosEstudiantes } from './vistas/docente/cursos/CursosEstudiantes';
import { ConfigurarPerfil } from './vistas/estudiante/configurar-perfil/ConfigurarPerfil';

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
      <button onClick={() => cambiarRol('docente')}>Ver como Docente</button>
      <button onClick={() => cambiarRol('estudiante')}>Ver como Estudiante</button>
      <button onClick={() => cambiarRol('invitado')}>Ver como Invitado</button>
    </div>
  );
}

function RutaSoloDocente({ children }) {
  const { rol } = useAuth();

  if (rol !== 'docente') {
    return <p style={{ padding: '1rem' }}>Esta sección está disponible solo para el rol Docente.</p>;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SelectorDeRolTemporal />

          <Routes>
            <Route path="/docente" element={<LayoutPrincipal contadores={{ pendientes: 2 }} />}>
              <Route index element={<PanelDocente />} />
              <Route
                path="revision-palabras"
                element={
                  <RutaSoloDocente>
                    <RevisionPalabras />
                  </RutaSoloDocente>
                }
              />
              <Route
                path="cursos"
                element={
                  <RutaSoloDocente>
                    <CursosEstudiantes />
                  </RutaSoloDocente>
                }
              />
            </Route>

            <Route path="/estudiante" element={<LayoutPrincipal />}>
              <Route index element={<PanelEstudiante />} />
            </Route>

            <Route path="/invitado" element={<LayoutPrincipal />}>
              <Route index element={<p>Vista de demostración para invitados (en construcción)</p>} />
            </Route>

            <Route path="/" element={<Navigate to="/docente" replace />} />

            <Route path="/estudiante" element={<LayoutPrincipal />}>
              <Route index element={<PanelEstudiante />} />
              <Route path="configuracion-perfil" element={<ConfigurarPerfil />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}