import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexto/useAuth';
import { obtenerParticipacionMazo } from '../../../cliente-api/analiticasApi';
import { listarMazos } from '../../../cliente-api/mazosApi';
import { FilaEstudianteParticipacion } from './FilaEstudianteParticipacion';
import { TEXTOS_CLAVES, COLUMNAS } from './participacionMazo.constants';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';
import './participacion-mazo.css';

// Se usa solo si listarMazos() falla o devuelve vacío (p. ej. sin conexión al
// backend), para que la vista no quede en blanco. La etiqueta ("Week 3 · ...")
// se arma al mostrarla, con la semana y el nombre por separado.
const MAZOS_FALLBACK = [
  { mazo_id: 1, semana: 3, nombre_lectura: 'Their Eyes Were Watching God' },
];

// Mensajes exactos que devuelve el backend en rutas protegidas
// (docs/CONTRATO_AUTENTICACION_FRONTEND.md, sección 4).
// NO TRADUCIR: se comparan contra el texto en español que envía el backend.
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
  return {
    mazo_id: m.id_mazo,
    semana: Number(m.semana),
    nombre_lectura: m.nombre_lectura,
  };
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
  const { t } = useTranslation();
  const { token, logout } = useAuth();
  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina(t(TEXTOS_CLAVES.titulo), t(TEXTOS_CLAVES.descripcion));
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
        const opciones = datos
          .map(mapearMazoApi)
          .sort((a, b) => (a.semana - b.semana) || (a.mazo_id - b.mazo_id));
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
    void cargar();
  }, [cargar]);

  const total = todasLasFilas.length;
  const conAporte = todasLasFilas.filter((f) => f.palabras_aportadas > 0 || f.coautorias > 0).length;
  const totalPalabras = todasLasFilas.reduce((acc, f) => acc + f.palabras_aportadas, 0);

  return (
    <section className="participacion-mazo">
      <div className="participacion-mazo__acciones">
        <select
          className="form-select"
          aria-label={t('participationPage.deckLabel')}
          value={mazoId}
          onChange={(e) => setMazoId(e.target.value)}
        >
          {mazosDisponibles.map((m) => (
            <option key={m.mazo_id} value={m.mazo_id}>
              {m.nombre ?? t('participationPage.deckOption', { week: m.semana, name: m.nombre_lectura })}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary" onClick={cargar}>
          {t(TEXTOS_CLAVES.botonActualizar)}
        </button>
      </div>

      {estado === 'listo' && (
        <div className="participacion-mazo__stats">
          <div className="participacion-mazo__stat"><span>{t('participationPage.stats.enrolled')}</span><strong>{total}</strong></div>
          <div className="participacion-mazo__stat"><span>{t('participationPage.stats.withContribution')}</span><strong>{conAporte}</strong></div>
          <div className="participacion-mazo__stat"><span>{t('participationPage.stats.wordsContributed')}</span><strong>{totalPalabras}</strong></div>
          <div className="participacion-mazo__stat"><span>{t('participationPage.stats.withoutContributions')}</span><strong>{total - conAporte}</strong></div>
        </div>
      )}

      <div className="participacion-mazo__panel">
        <div className="participacion-mazo__panel-toolbar">
          <strong>{t('participationPage.roster')}</strong>
          <label className="participacion-mazo__filtro">
            <input
              type="checkbox"
              checked={sinAportes}
              onChange={(e) => setSinAportes(e.target.checked)}
            />
            {t(TEXTOS_CLAVES.filtroSinAportes)}
          </label>
        </div>

        {estado === 'cargando' && <div className="participacion-mazo__estado">{t(TEXTOS_CLAVES.cargando)}</div>}

        {estado === 'error' && (
          <div className="participacion-mazo__estado es-error">
            ⚠️{' '}
            {ES_SESION_INVALIDA(error?.message)
              ? t('participationPage.errors.sessionExpired')
              : ES_SIN_PERMISO(error?.message)
                ? t('participationPage.errors.notTeacher')
                : (error?.message ?? t(TEXTOS_CLAVES.errorGenerico))}
          </div>
        )}

        {estado === 'listo' && filas.length === 0 && (
          <div className="participacion-mazo__estado">{t(TEXTOS_CLAVES.sinResultadosFiltro)}</div>
        )}

        {estado === 'listo' && filas.length > 0 && (
          <table className="participacion-mazo__tabla">
            <thead>
              <tr>
                {COLUMNAS.map((c) => (
                  <th key={c.key}>{t(c.labelKey)}</th>
                ))}
                <th>{t('participationPage.columns.remarks')}</th>
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