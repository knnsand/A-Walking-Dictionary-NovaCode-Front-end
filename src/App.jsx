import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthProvider';
import { ThemeProvider } from './contexto/ThemeProvider';
import { useAuth } from './contexto/useAuth';
import { LayoutPrincipal } from './componentes/comunes/LayoutPrincipal';
import { LayoutInvitado } from './componentes/comunes/LayoutInvitado';

import { PanelDocente } from './vistas/docente/PanelDocente';
import { RevisionPalabras } from './vistas/docente/revision-palabras/RevisionPalabras';
import { PanelEstudiante } from './vistas/estudiante/PanelEstudiante';
import { CursosEstudiantes } from './vistas/docente/cursos/CursosEstudiantes';
import { ConfigurarPerfil } from './vistas/estudiante/configurar-perfil/ConfigurarPerfil';
import { Login } from './vistas/autenticacion/Login';
import { DiccionarioInvitado } from './vistas/invitado/DiccionarioInvitado';
import { ParticipacionMazo } from './vistas/docente/participacion/ParticipacionMazo';

function RutaProtegida({ children }) {
  const { autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RutaSoloDocente({ children }) {
  const { autenticado, rol } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol !== 'docente') {
    return <Navigate to="/estudiante" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>

            <Route
              path="/docente"
              element={
                <RutaSoloDocente>
                  <LayoutPrincipal contadores={{ pendientes: 2 }} />
                </RutaSoloDocente>
              }
            >
              <Route index element={<PanelDocente />} />

              <Route
                path="revision-palabras"
                element={<RevisionPalabras />}
              />

              <Route
                path="cursos"
                element={<CursosEstudiantes />}
              />
              <Route
  path="participacion"
  element={
    <RutaSoloDocente>{/* o el guard real que exista ahora */}
      <ParticipacionMazo />
    </RutaSoloDocente>
  }
/>
            </Route>

            <Route
              path="/estudiante"
              element={
                <RutaProtegida>
                  <LayoutPrincipal />
                </RutaProtegida>
              }
            >
              <Route index element={<PanelEstudiante />} />

              <Route
                path="configuracion-perfil"
                element={<ConfigurarPerfil />}
              />
            </Route>

            <Route
              path="/invitado"
              element={<LayoutInvitado />}
            >
              <Route
                index
                element={<DiccionarioInvitado />}
              />
            </Route>

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}