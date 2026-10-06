import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthProvider';
import { ThemeProvider } from './contexto/ThemeProvider';
import { useAuth } from './contexto/useAuth';
import { LayoutPrincipal } from './componentes/comunes/LayoutPrincipal';

import { PanelDocente } from './vistas/docente/PanelDocente';
import { RevisionPalabras } from './vistas/docente/revision-palabras/RevisionPalabras';
import { PanelEstudiante } from './vistas/estudiante/PanelEstudiante';
import { CursosEstudiantes } from './vistas/docente/cursos/CursosEstudiantes';
import { DetalleCurso } from './vistas/docente/cursos/DetalleCurso';
import { ConfigurarPerfil } from './vistas/estudiante/configurar-perfil/ConfigurarPerfil';
import { Login } from './vistas/autenticacion/Login';
import { Registro } from './vistas/autenticacion/registro/Registro';
import { DiccionarioInvitado } from './vistas/invitado/DiccionarioInvitado';
import { ParticipacionMazo } from './vistas/docente/participacion/ParticipacionMazo';
import { PaginaEstudio } from './vistas/estudiante/estudiar-tarjetas/PaginaEstudio';
import { MazosEstudio } from './vistas/mazos-estudio/MazosEstudio';

function RutaSoloEstudiante({ children }) {
  const { autenticado, rol } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol !== 'estudiante') {
    return <Navigate to="/docente" replace />;
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
                  <LayoutPrincipal />
                </RutaSoloDocente>
              }
            >
              {/* /docente redirige a Mazos de estudio */}
              <Route index element={<Navigate to="mazos" replace />} />

              {/* PanelDocente renderiza la vista compartida MazosEstudio con rol docente */}
              <Route path="mazos" element={<PanelDocente />} />
              {/* Ruta anterior, se conserva por si hay enlaces guardados */}
              <Route path="mazoscreados" element={<Navigate to="/docente/mazos" replace />} />

              <Route
                path="revision-palabras"
                element={<RevisionPalabras />}
              />

              <Route
                path="cursos"
                element={<CursosEstudiantes />}
              />
              <Route
                path="cursos/:id"
                element={<DetalleCurso />}
              />
              <Route
                path="participacion"
                element={<ParticipacionMazo />}
              />
            </Route>

            <Route
              path="/estudiante"
              element={
                <RutaSoloEstudiante>
                  <LayoutPrincipal />
                </RutaSoloEstudiante>
              }
            >
              <Route index element={<PanelEstudiante />} />

              <Route path="mazos" element={<MazosEstudio rol="estudiante" />} />
              {/* Estudiar las palabras de un mazo concreto */}
              <Route path="mazos/:idMazo/estudio" element={<PaginaEstudio />} />

              <Route path="estudio" element={<PaginaEstudio />} />

              <Route
                path="configuracion-perfil"
                element={<ConfigurarPerfil />}
              />
            </Route>

            <Route
              path="/invitado"
              element={<LayoutPrincipal rolFijo="invitado" />}
            >
              <Route index element={<Navigate to="mazos" replace />} />
              <Route path="mazos" element={<MazosEstudio rol="invitado" />} />
              <Route path="diccionario" element={<DiccionarioInvitado />} />
            </Route>

            <Route
              path="/login"
              element={<Login />}
            />

            {/* HU-012: registro autónomo de estudiante con Google. */}
            <Route
              path="/registro"
              element={<Registro />}
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