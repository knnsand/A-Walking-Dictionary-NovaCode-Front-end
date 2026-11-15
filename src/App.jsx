
/**
 * @file App.jsx
 * @brief Componente raíz: define las rutas de la aplicación por rol
 * (docente, estudiante e invitado) y las protege según la sesión.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthProvider';
import { ThemeProvider } from './contexto/ThemeProvider';
import { useAuth } from './contexto/useAuth';
import { LayoutPrincipal } from './componentes/comunes/LayoutPrincipal';

import { PanelDocente } from './vistas/docente/PanelDocente';
import { RevisionPalabras } from './vistas/docente/revision-palabras/RevisionPalabras';
import { ProgresoEstudiante } from './vistas/estudiante/reportes/ProgresoEstudiante';

import { CursosEstudiantes } from './vistas/docente/cursos/CursosEstudiantes';
import { DetalleCurso } from './vistas/docente/cursos/DetalleCurso';
import { ConfigurarPerfil } from './vistas/estudiante/configurar-perfil/ConfigurarPerfil';
import { Login } from './vistas/autenticacion/Login';
import { Registro } from './vistas/autenticacion/registro/Registro';

import { ParticipacionMazo } from './vistas/docente/participacion/ParticipacionMazo';
import { PaginaEstudio } from './vistas/estudiante/estudiar-tarjetas/PaginaEstudio';
import { MazosEstudio } from './vistas/mazos-estudio/MazosEstudio';
import { GenerarQuiz } from './vistas/docente/quices/GenerarQuiz';
import { ListaQuices } from './vistas/quices/ListaQuices';
import { ResponderQuiz } from './vistas/estudiante/responder-quiz/ResponderQuiz';
import { DiccionarioGlobal } from './vistas/diccionario-global/DiccionarioGlobal';
import { PalabrasMazo } from './vistas/diccionario-global/PalabrasMazo';

// HU-022: panel docente de análisis de resultados de quices.
import { RevisionResultadosQuices } from './vistas/docente/quices/RevisionResultadosQuices';

// Sección About / Acerca de con tutoriales filtrados por rol.
import { AcercaDe } from './vistas/acerca-de/AcercaDe';

// HU-023: gestión de usuarios y roles del administrador.
import { GestionUsuarios } from './vistas/administrador/usuarios/GestionUsuarios';

/** @brief Página de inicio de cada rol con sesión. */
const INICIO_POR_ROL = {
  docente: '/docente',
  estudiante: '/estudiante',
  administrador: '/admin',
};

/**
 * @brief Protege una ruta para que solo la vea un rol.
 * Sin sesión redirige a /login; con otro rol, a la página de inicio de ese rol
 * (o a /login si el rol no tiene vista), así no hay bucles de redirección (CA-23.3).
 *
 * @param {Object} props
 * @param {string} props.rolPermitido - Rol que puede ver la ruta.
 * @param {React.ReactNode} props.children - Contenido protegido.
 * @return {JSX.Element}
 */
function RutaSoloRol({ rolPermitido, children }) {
  const { autenticado, rol } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol !== rolPermitido) {
    return <Navigate to={INICIO_POR_ROL[rol] ?? '/login'} replace />;
  }

  return children;
}

/**
 * @brief Protege una ruta para que solo la vea un estudiante autenticado.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido protegido.
 * @return {JSX.Element}
 */
function RutaSoloEstudiante({ children }) {
  return <RutaSoloRol rolPermitido="estudiante">{children}</RutaSoloRol>;
}

/**
 * @brief Protege una ruta para que solo la vea la docente autenticada.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido protegido.
 * @return {JSX.Element}
 */
function RutaSoloDocente({ children }) {
  return <RutaSoloRol rolPermitido="docente">{children}</RutaSoloRol>;
}

/**
 * @brief HU-023 (CA-23.3): protege una ruta para que solo la vea el administrador.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido protegido.
 * @return {JSX.Element}
 */
function RutaSoloAdministrador({ children }) {
  return <RutaSoloRol rolPermitido="administrador">{children}</RutaSoloRol>;
}

/**
 * @brief Arma los proveedores (router, tema y sesión)
 * y la tabla de rutas de la aplicación.
 *
 * @return {JSX.Element}
 */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>

            {/* ========================================= */}
            {/* RUTAS DEL DOCENTE                         */}
            {/* ========================================= */}

            <Route
              path="/docente"
              element={
                <RutaSoloDocente>
                  <LayoutPrincipal />
                </RutaSoloDocente>
              }
            >
              {/* About: solo muestra introducción y tutoriales docentes */}
              <Route
                path="acerca-de"
                element={<AcercaDe rol="docente" />}
              />

              {/* /docente redirige a Mazos de estudio */}
              <Route
                index
                element={<Navigate to="mazos" replace />}
              />

              {/* PanelDocente renderiza MazosEstudio con rol docente */}
              <Route
                path="mazos"
                element={<PanelDocente />}
              />

              {/* Ruta anterior conservada para enlaces guardados */}
              <Route
                path="mazoscreados"
                element={<Navigate to="/docente/mazos" replace />}
              />

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

              <Route
                path="quices"
                element={<GenerarQuiz />}
              />
              {/* HU-022 (CA-22.1): revisión de resultados de un quiz. */}
              <Route
                path="quices/:idQuiz/resultados"
                element={<RevisionResultadosQuices />}
              />

              <Route
                path="diccionario"
                element={<DiccionarioGlobal />}
              />

            </Route>

            {/* ========================================= */}
            {/* RUTAS DEL ESTUDIANTE                      */}
            {/* ========================================= */}

            <Route
              path="/estudiante"
              element={
                <RutaSoloEstudiante>
                  <LayoutPrincipal />
                </RutaSoloEstudiante>
              }
            >
              <Route
                index
                element={<Navigate to="mazos" replace />}
              />

              {/* About: solo muestra introducción y tutoriales estudiantiles */}
              <Route
                path="acerca-de"
                element={<AcercaDe rol="estudiante" />}
              />

              {/* HU-018: reporte individual de progreso */}
              <Route
                path="progreso"
                element={<ProgresoEstudiante />}
              />

              <Route
                path="mazos"
                element={<MazosEstudio rol="estudiante" />}
              />

              {/* Palabras aprobadas de un mazo */}
              <Route
                path="mazos/:idMazo/palabras"
                element={<PalabrasMazo />}
              />

              {/* Estudiar las palabras de un mazo */}
              <Route
                path="mazos/:idMazo/estudio"
                element={<PaginaEstudio />}
              />

              <Route
                path="estudio"
                element={<PaginaEstudio />}
              />

              {/* HU-3.2: responder un quiz y recibir la nota */}
              <Route
                path="quices/:idQuiz"
                element={<ResponderQuiz />}
              />

              {/* HU-009: lista de quices del estudiante */}
              <Route
                path="quices"
                element={<ListaQuices rol="estudiante" />}
              />

              <Route
                path="configuracion-perfil"
                element={<ConfigurarPerfil />}
              />

              <Route
                path="diccionario"
                element={<DiccionarioGlobal />}
              />

            </Route>

            {/* ========================================= */}
            {/* RUTAS DEL ADMINISTRADOR (HU-023)          */}
            {/* ========================================= */}

            <Route
              path="/admin"
              element={
                <RutaSoloAdministrador>
                  <LayoutPrincipal />
                </RutaSoloAdministrador>
              }
            >
              <Route
                index
                element={<Navigate to="usuarios" replace />}
              />

              {/* CA-23.1 y CA-23.2: listar, buscar, cambiar rol y estado */}
              <Route
                path="usuarios"
                element={<GestionUsuarios />}
              />
            </Route>

            {/* ========================================= */}
            {/* RUTAS DEL INVITADO                        */}
            {/* ========================================= */}

            <Route
              path="/invitado"
              element={<LayoutPrincipal rolFijo="invitado" />}
            >
              {/* About: solo muestra el video introductorio */}
              <Route
                path="acerca-de"
                element={<AcercaDe rol="invitado" />}
              />

              <Route
                index
                element={<Navigate to="mazos" replace />}
              />

              <Route
                path="mazos"
                element={<MazosEstudio rol="invitado" />}
              />

              {/* Palabras aprobadas de un mazo */}
              <Route
                path="mazos/:idMazo/palabras"
                element={<PalabrasMazo />}
              />

              <Route
                path="diccionario"
                element={<DiccionarioGlobal />}
              />

            </Route>

            {/* ========================================= */}
            {/* AUTENTICACIÓN                             */}
            {/* ========================================= */}

            <Route
              path="/login"
              element={<Login />}
            />

            {/* HU-012: registro autónomo con Google */}
            <Route
              path="/registro"
              element={<Registro />}
            />

            {/* Ruta inicial */}
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
