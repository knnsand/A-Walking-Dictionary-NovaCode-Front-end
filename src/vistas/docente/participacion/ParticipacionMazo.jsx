import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../contexto/useAuth';
import { obtenerParticipacionMazo } from '../../../cliente-api/analiticasApi';
import { FilaEstudianteParticipacion } from './FilaEstudianteParticipacion';
import { TEXTOS, COLUMNAS } from './participacionMazo.constants';
import './participacion-mazo.css';

// TODO(mazosApi): reemplazar por los mazos reales del curso activo en cuanto
// se confirme la función/forma de mazosApi.js (p. ej. obtenerMazos()).
// Se deja este fallback para que la vista funcione de una al conectarla al
// Sidebar, con los mismos IDs que ya usa analiticasMock.js.
const MAZOS_FALLBACK = [
  { mazo_id: 12, nombre: 'Semana 3 · Their Eyes Were Watching God' },
  { mazo_id: 13, nombre: 'Semana 5 · Beloved' },
];

// Mensajes exactos que devuelve el backend en rutas protegidas
// (docs/CONTRATO_AUTENTICACION_FRONTEND.md, sección 4).
const ES_SESION_INVALIDA = (msg) =>
  /token de autenticación no proporcionado|token inválido o expirado/i.test(msg ?? '');
const ES_SIN_PERMISO = (msg) => /no tiene permisos para acceder a este recurso/i.test(msg ?? '');

/**
 * Panel docente de HU-2.3: participación individual por mazo y semana.
 * Requiere sesión con rol docente (el endpoint está protegido, ver contrato
 * de autenticación).
 *
 * @param {Object} [props]
 * @param {Array<{ mazo_id: number, nombre: string }>} [props.mazos] - Si no se
 *   pasa, usa MAZOS_FALLBACK de arriba.
 */
export function ParticipacionMazo({ mazos = MAZOS_FALLBACK }) {
  const { token, logout } = useAuth();
  const [mazoId, setMazoId] = useState(mazos[0]?.mazo_id ?? '');
  const [sinAportes, setSinAportes] = useState(false);
  const [filas, setFilas] = useState([]);
  const [todasLasFilas, setTodasLasFilas] = useState([]); // para las tarjetas de stats, sin el filtro
  const [estado, setEstado] = useState('inactivo'); // inactivo | cargando | listo | error
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!mazoId) return;
    setEstado('cargando');
    setError(null);
    try {
      const [conFiltro, completas] = await Promise.all([
        obtenerParticipacionMazo(mazoId, { sinAportes, token }),
        sinAportes ? obtenerParticipacionMazo(mazoId, { sinAportes: false, token }) : Promise.resolve(null),
      ]);
      setFilas(conFiltro);
      setTodasLasFilas(sinAportes ? completas : conFiltro);
      setEstado('listo');
    } catch (err) {
      setError(err);
      setEstado('error');
      // Sesión vencida o token inválido: igual que indica el contrato de auth,
      // se borra y se deja que la protección de rutas del resto de la app
      // mande de vuelta al login.
      if (ES_SESION_INVALIDA(err?.message)) {
        logout();
      }
    }
  }, [mazoId, sinAportes, token, logout]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const total = todasLasFilas.length;
  const conAporte = todasLasFilas.filter((f) => f.palabras_aportadas > 0 || f.coautorias > 0).length;
  const totalPalabras = todasLasFilas.reduce((acc, f) => acc + f.palabras_aportadas, 0);

  return (
    <section>
      <div className="participacion-mazo__header">
        <div>
          <h1>{TEXTOS.titulo}</h1>
          <p>{TEXTOS.descripcion}</p>
        </div>
        <div className="participacion-mazo__acciones">
          <select value={mazoId} onChange={(e) => setMazoId(e.target.value)}>
            {mazos.map((m) => (
              <option key={m.mazo_id} value={m.mazo_id}>
                {m.nombre}
              </option>
            ))}
          </select>
          <button type="button" onClick={cargar}>
            {TEXTOS.botonActualizar}
          </button>
        </div>
      </div>

      {estado === 'listo' && (
        <div className="participacion-mazo__stats">
          <div className="participacion-mazo__stat"><span>Estudiantes matriculados</span><strong>{total}</strong></div>
          <div className="participacion-mazo__stat"><span>Con al menos un aporte</span><strong>{conAporte}</strong></div>
          <div className="participacion-mazo__stat"><span>Palabras aportadas</span><strong>{totalPalabras}</strong></div>
          <div className="participacion-mazo__stat"><span>Sin aportes</span><strong>{total - conAporte}</strong></div>
        </div>
      )}

      <div className="participacion-mazo__panel">
        <div className="participacion-mazo__panel-toolbar">
          <strong>Nómina de Aportes</strong>
          <label className="participacion-mazo__filtro">
            <input
              type="checkbox"
              checked={sinAportes}
              onChange={(e) => setSinAportes(e.target.checked)}
            />
            {TEXTOS.filtroSinAportes}
          </label>
        </div>

        {estado === 'cargando' && <div className="participacion-mazo__estado">{TEXTOS.cargando}</div>}

        {estado === 'error' && (
          <div className="participacion-mazo__estado es-error">
            ⚠️{' '}
            {ES_SESION_INVALIDA(error?.message)
              ? 'Tu sesión venció. Vuelve a iniciar sesión.'
              : ES_SIN_PERMISO(error?.message)
                ? 'Tu cuenta no tiene rol docente, así que no puede ver esta analítica.'
                : (error?.message ?? TEXTOS.errorGenerico)}
          </div>
        )}

        {estado === 'listo' && filas.length === 0 && (
          <div className="participacion-mazo__estado">{TEXTOS.sinResultadosFiltro}</div>
        )}

        {estado === 'listo' && filas.length > 0 && (
          <table className="participacion-mazo__tabla">
            <thead>
              <tr>
                {COLUMNAS.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <FilaEstudianteParticipacion key={fila.estudiante_id} fila={fila} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
