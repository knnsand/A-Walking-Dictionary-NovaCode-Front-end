import { useEffect, useState } from 'react';
import { listarMazos } from '../../cliente-api/mazosApi';
import './DiccionarioInvitado.css';

export function DiccionarioInvitado() {
  const [mazos, setMazos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarMazos() {
      try {
        const datos = await listarMazos();
        setMazos(Array.isArray(datos) ? datos : []);
      } catch (errorCarga) {
        setError(
          errorCarga.message || 'No fue posible cargar las lecturas.',
        );
      } finally {
        setCargando(false);
      }
    }

    cargarMazos();
  }, []);

  return (
    <section className="diccionario-invitado">
        <h1>Diccionario demostrativo</h1>

        <p className="diccionario-invitado__descripcion">
        Consulta las lecturas disponibles en modo invitado.
        </p>

        {cargando && <p>Cargando contenido...</p>}

        {error && (
        <p role="alert">
            {error}
        </p>
        )}

        {!cargando && !error && mazos.length === 0 && (
        <p>No hay lecturas disponibles.</p>
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
                <strong>Autor:</strong>{' '}
                {mazo.autor || 'No especificado'}
                </p>

                <p>
                <strong>Variante:</strong>{' '}
                {mazo.variante || 'No especificada'}
                </p>

                <p>
                <strong>Semana:</strong>{' '}
                {mazo.semana || 'No especificada'}
                </p>
            </article>
            ))}
        </div>
        )}
    </section>
    );
}