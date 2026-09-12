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

if (!DOCENTE_ID_SIMULADO) {
  // Aviso solo en consola de desarrollo: si falta la variable de entorno, cualquier
  // creación de mazo fallará en el backend con 400 "docente_id es obligatorio".
  console.warn(
    'VITE_DOCENTE_ID_SIMULADO no está configurado o no es un número válido. ' +
    'La creación de mazos fallará contra el backend real hasta configurarlo en .env.local.'
  );
}

export function AuthProvider({ children }) {
  const [rol, setRol] = useState('docente');

  return (
    <AuthContext.Provider value={{ rol, setRol, docenteId: DOCENTE_ID_SIMULADO }}>
      {children}
    </AuthContext.Provider>
  );
}