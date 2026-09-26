import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../contexto/useAuth';
import { obtenerParticipacionMazo } from '../../../cliente-api/analiticasApi';
import { listarMazos } from '../../../cliente-api/mazosApi';
import { FilaEstudianteParticipacion } from './FilaEstudianteParticipacion';
import { TEXTOS, COLUMNAS } from './participacionMazo.constants';
import './participacion-mazo.css';

// Se usa solo si listarMazos() falla o devuelve vacío (p. ej. sin conexión al
// backend), para que la vista no quede en blanco.
const MAZOS_FALLBACK = [
  { mazo_id: 1, nombre: 'Semana 3 · Their Eyes Were Watching God' },
];

// Mensajes exactos que devuelve el backend en rutas protegidas
// (docs/CONTRATO_AUTENTICACION_FRONTEND.md, sección 4).
const ES_SESION_INVALIDA = (msg) =>
  /token de autenticación no proporcionado|token inválido o expirado/i.test(msg ?? '');
const ES_SIN_PERMISO = (msg) => /no tiene permisos para acceder a este recurso/i.test(msg ?? '');

// listarMazos() pega a GET /decks (docs/contrato-mazo.md) y devuelve las
// columnas reales de la tabla "mazo" tal cual (id_mazo, semana,
// nombre_lectura, ...). Nota: ese endpoint no filtra por curso — mientras
// solo exista un curso en el entorno de desarrollo no es un problema, pero
// si se agregan varios cursos habría que filtrar aquí por curso_id (o pedirle
// al backend un query param para eso).
function mapearMazoApi(m) {
  return { mazo_id: m.id_mazo, nombre: `Semana ${m.semana} · ${m.nombre_lectura}` };
}

/**
 * Panel docente de HU-2.3: participación individual por mazo y semana.
 * Requiere sesión con rol docente (el endpoint está protegido, ver contrato
 * de autenticación).
 *
 * @param {Object} [props]
 * @param {Array<{ mazo_id: number, nombre: string }>} [props.mazos] - Si se
 *   pasa, se usa tal cual y NO se llama a listarMazos(). Si se omite, la
 *   vista trae los mazos reales del backend.
 */
export function ParticipacionMazo({ mazos: mazosProp }) {
  const { token, logout } = useAuth();
  const [mazosDisponibles, setMazosDisponibles] = useState(mazosProp ?? MAZOS_FALLBACK);
  const [mazoId, setMazoId] = useState(mazosProp?.[0]?.mazo_id ?? MAZOS_FALLBACK[0].mazo_id);
  const [sinAportes, setSinAportes] = useState(false);
  const [filas, setFilas] = useState([]);
  const [todasLasFilas, setTodasLasFilas] = useState([]); // para las tarjetas de stats, sin el filtro
  const [estado, setEstado] = useState('inactivo'); // inactivo | cargando | listo | error
  const [error, setError] = useState(null);

  // Trae los mazos reales una sola vez, salvo que el padre ya los haya pasado
  // por props (útil para tests o para cuando algún día PanelDocente ya tenga
  // esta lista cargada y quiera reusarla en vez de pedirla de nuevo).
  useEffect(() => {
    if (mazosProp) return;
    let cancelado = false;

    listarMazos()
      .then((datos) => {
        if (cancelado || !Array.isArray(datos) || datos.length === 0) return;
        const opciones = datos.map(mapearMazoApi);
        setMazosDisponibles(opciones);
        setMazoId((actual) => (opciones.some((o) => String(o.mazo_id) === String(actual)) ? actual : opciones[0].mazo_id));
      })
      .catch(() => {
        // Se conserva MAZOS_FALLBACK ya seteado como estado inicial.
      });

    return () => {
      cancelado = true;
    };
  }, [mazosProp]);

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
            {mazosDisponibles.map((m) => (
              <option key={m.mazo_id} value={m.mazo_id}>
                {m.nombre}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={cargar}>
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
