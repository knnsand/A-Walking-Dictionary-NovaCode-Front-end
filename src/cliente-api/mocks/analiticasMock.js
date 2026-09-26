/**
 * analiticasMock.js
 * Datos de demostración para HU-2.3, con la forma exacta de la respuesta 200
 * documentada en doc/CONTRATO_FRONTEND_HU-2.3.md. Se activa cuando
 * VITE_USE_MOCK=true (ver apiConfig.js). Lanza `Error` normal en los casos de
 * falla, igual que `apiRequest` en modo real, para que la vista no tenga que
 * distinguir entre mock y backend real.
 */

const PARTICIPACION_POR_MAZO = {
  12: [
    { estudiante_id: 1, nombre_completo: 'Mateo Rodríguez', palabras_aportadas: 5, coautorias: 1, tarjetas_pendientes: 1, tarjetas_aprobadas: 4 },
    { estudiante_id: 2, nombre_completo: 'Lucía Gómez', palabras_aportadas: 3, coautorias: 0, tarjetas_pendientes: 2, tarjetas_aprobadas: 1 },
    { estudiante_id: 3, nombre_completo: 'Javier Delgado', palabras_aportadas: 0, coautorias: 0, tarjetas_pendientes: 0, tarjetas_aprobadas: 0 },
    { estudiante_id: 4, nombre_completo: 'Thomas Avery', palabras_aportadas: 6, coautorias: 2, tarjetas_pendientes: 0, tarjetas_aprobadas: 6 },
    { estudiante_id: 5, nombre_completo: 'Laura Erazo', palabras_aportadas: 0, coautorias: 0, tarjetas_pendientes: 0, tarjetas_aprobadas: 0 },
  ],
  13: [
    { estudiante_id: 1, nombre_completo: 'Mateo Rodríguez', palabras_aportadas: 4, coautorias: 0, tarjetas_pendientes: 0, tarjetas_aprobadas: 4 },
    { estudiante_id: 2, nombre_completo: 'Lucía Gómez', palabras_aportadas: 0, coautorias: 0, tarjetas_pendientes: 0, tarjetas_aprobadas: 0 },
    { estudiante_id: 3, nombre_completo: 'Javier Delgado', palabras_aportadas: 2, coautorias: 1, tarjetas_pendientes: 1, tarjetas_aprobadas: 1 },
  ],
};

/**
 * Simula GET /teacher/analytics/deck/:id (+ ?sinAportes=true), incluyendo los
 * mismos errores documentados en el contrato, para poder probar la vista sin backend.
 */
export function obtenerParticipacionMazoMock(mazoId, { sinAportes = false } = {}) {
  const id = Number(mazoId);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Number.isNaN(id)) {
        reject(new Error('El id del mazo debe ser numérico.'));
        return;
      }
      const filas = PARTICIPACION_POR_MAZO[id];
      if (!filas) {
        reject(new Error('Mazo no encontrado.'));
        return;
      }
      const resultado = sinAportes
        ? filas.filter((f) => f.palabras_aportadas === 0 && f.coautorias === 0)
        : filas;
      resolve(resultado);
    }, 300);
  });
}
