import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthProvider';
import{ useAuth } from './contexto/useAuth';
import { PanelDocente } from './vistas/docente/PanelDocente';
import { PanelEstudiante } from './vistas/estudiante/PanelEstudiante';
import './App.css';

// Selector TEMPORAL de rol, solo para probar el enrutamiento mientras no
// existe login real (ver nota en AuthContext.jsx).
function SelectorDeRolTemporal() {
  const { rol, setRol } = useAuth();
  return (
    <div style={{ padding: '0.5rem', background: '#eee' }}>
      Rol simulado actual: <strong>{rol}</strong>{' '}
      <button onClick={() => setRol('docente')}>Ver como Docente</button>
      <button onClick={() => setRol('estudiante')}>Ver como Estudiante</button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SelectorDeRolTemporal />
        <Routes>
          <Route path="/docente" element={<PanelDocente />} />
          <Route path="/estudiante" element={<PanelEstudiante />} />
          <Route path="/" element={<Navigate to="/docente" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;