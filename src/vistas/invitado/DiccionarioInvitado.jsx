import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listarMazos } from '../../cliente-api/mazosApi';
import { VARIANTE_REGIONAL_CLAVES } from '../docente/crear-mazo/crearMazo.constants';
import './DiccionarioInvitado.css';

export function DiccionarioInvitado() {
  const { t } = useTranslation();
  const [mazos, setMazos] = useState([]);
  const [cargando, setCargando] = useState(true);
  // { mensaje } con el texto del backend (se muestra tal cual; puede estar en español)
  // o { mensaje: null } para usar el texto propio traducido.
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarMazos() {
      try {
        const datos = await listarMazos();
        setMazos(Array.isArray(datos) ? datos : []);
      } catch (errorCarga) {
        setError({ mensaje: errorCarga.message || null });
      } finally {
        setCargando(false);
      }
    }

    cargarMazos();
  }, []);

  // La variante se guarda en español en la base de datos; aquí solo se traduce
  // lo que se muestra (si el valor no se conoce, se muestra tal cual).
  const textoVariante = (valor) =>
    VARIANTE_REGIONAL_CLAVES[valor] ? t(VARIANTE_REGIONAL_CLAVES[valor]) : valor;

  return (
    <section className="diccionario-invitado">
        <h1>{t('guestDictionary.title')}</h1>

        <p className="diccionario-invitado__descripcion">
        {t('guestDictionary.description')}
        </p>

        {cargando && <p>{t('guestDictionary.loading')}</p>}

        {error && (
        <p role="alert">
            {error.mensaje || t('guestDictionary.errors.loadFailed')}
        </p>
        )}

        {!cargando && !error && mazos.length === 0 && (
        <p>{t('guestDictionary.empty')}</p>
        )}

        {!cargando && !error && mazos.length > 0 && (
        <div className="diccionario-invitado__lista">
            {mazos.map((mazo) => (
            <article
                className="diccionario-invitado__mazo"
                key={mazo.id_mazo}
            >
                <h2>{mazo.nombre_lectura}</h2>

                <p>
                <strong>{t('guestDictionary.author')}</strong>{' '}
                {mazo.autor || t('guestDictionary.notSpecified')}
                </p>

                <p>
                <strong>{t('guestDictionary.variant')}</strong>{' '}
                {mazo.variante_regional_predeterminada
                  ? textoVariante(mazo.variante_regional_predeterminada)
                  : t('guestDictionary.notSpecified')}
                </p>

                <p>
                <strong>{t('guestDictionary.week')}</strong>{' '}
                {mazo.semana || t('guestDictionary.notSpecified')}
                </p>
            </article>
            ))}
        </div>
        )}
    </section>
    );
}