import { useState } from 'react';
import { AuthContext } from './AuthContext';

// TEMPORAL (Sprint 1): no existe login real todavía (HU-015 es Sprint 2).
//
// docenteId también es temporal: viene de una variable de entorno (VITE_DOCENTE_ID_SIMULADO),
// no de una sesión autenticada, porque HU-015 (login) no existe todavía. Debe coincidir con
// el id_usuario del docente sembrado en seed.sql del backend ("Ana Docente").
// Cuando se implemente HU-015, este valor debe eliminarse y derivarse del token de sesión,
// tal como ya lo anticipa el comentario de MazoController.crear() en el backend.
const DOCENTE_ID_SIMULADO = Number(import.meta.env.VITE_DOCENTE_ID_SIMULADO) || null;
const ESTUDIANTE_ID_SIMULADO = Number(import.meta.env.VITE_ESTUDIANTE_ID_SIMULADO) || null;

if (!DOCENTE_ID_SIMULADO) {
  // Aviso solo en consola de desarrollo: si falta la variable de entorno, cualquier
  // creación de mazo fallará en el backend con 400 "docente_id es obligatorio".
  console.warn(
    'VITE_DOCENTE_ID_SIMULADO no está configurado o no es un número válido. ' +
    'La creación de mazos fallará contra el backend real hasta configurarlo en .env.local.'
  );
}

// TEMPORAL (Sprint 1): mismo mecanismo que DOCENTE_ID_SIMULADO, pero para el estudiante que
// registra palabras (HU-1.2 / CA-1.2.1). Debe coincidir con un id_inscripcion sembrado en
// seed.sql del backend (con una BD recién creada: 1 = Juan, 2 = María, 3 = Carlos). Se
// elimina cuando exista login real (HU-5.4) y el inscripcion_id se derive de la sesión.
const INSCRIPCION_ID_SIMULADA = Number(import.meta.env.VITE_INSCRIPCION_ID_SIMULADA) || null;

if (!INSCRIPCION_ID_SIMULADA) {
  // Aviso solo en consola de desarrollo: si falta la variable de entorno, registrar una
  // palabra fallará en el backend con 400 "inscripcion_id es obligatorio".
  console.warn(
    'VITE_INSCRIPCION_ID_SIMULADA no está configurado o no es un número válido. ' +
    'Registrar palabras fallará contra el backend real hasta configurarlo en .env.local.'
  );
}

if (!ESTUDIANTE_ID_SIMULADO) {
  console.warn(
    'VITE_ESTUDIANTE_ID_SIMULADO no está configurado o no es un número válido. ' +
    'Unirse a un curso (HU-014) fallará contra el backend real hasta configurarlo en .env.local.'
  );
}

export function AuthProvider({ children }) {
  const [rol, setRol] = useState('docente');

  return (
    <AuthContext.Provider
      value={{
        rol,
        setRol,
        docenteId: DOCENTE_ID_SIMULADO,
        inscripcionId: INSCRIPCION_ID_SIMULADA,
        estudianteId: ESTUDIANTE_ID_SIMULADO,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}