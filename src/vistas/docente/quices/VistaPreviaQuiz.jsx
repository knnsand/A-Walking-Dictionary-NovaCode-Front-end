import { TEXTOS } from './generarQuiz.constants';

const LETRAS = ['a', 'b', 'c', 'd'];

/**
 * Vista previa de las preguntas de un quiz recién generado (HU-3.1).
 * SOLO para la docente: muestra la respuesta correcta. Nunca usar este
 * componente con el quiz que ve el estudiante.
 *
 * @param {Object} props
 * @param {Array<{
 *   id_pregunta: number, enunciado: string, orden: number,
 *   opcion_a: string|null, opcion_b: string|null,
 *   opcion_c: string|null, opcion_d: string|null,
 *   respuesta_correcta: string
 * }>} props.preguntas
 */
export function VistaPreviaQuiz({ preguntas }) {
  if (!preguntas || preguntas.length === 0) return null;

  const ordenadas = [...preguntas].sort((x, y) => x.orden - y.orden);

  return (
    <div className="vista-previa-quiz">
      <h2 className="vista-previa-quiz__titulo">{TEXTOS.vistaPreviaTitulo}</h2>

      <ol className="vista-previa-quiz__lista">
        {ordenadas.map((pregunta) => (
          <li key={pregunta.id_pregunta} className="vista-previa-quiz__pregunta">
            <p className="vista-previa-quiz__enunciado">{pregunta.enunciado}</p>

            <ul className="vista-previa-quiz__opciones">
              {LETRAS.map((letra) => {
                const texto = pregunta[`opcion_${letra}`];
                // Las opciones null no se pintan (pregunta con menos de 4 opciones).
                if (texto === null || texto === undefined || texto === '') return null;

                const esCorrecta = texto === pregunta.respuesta_correcta;

                return (
                  <li
                    key={letra}
                    className={`vista-previa-quiz__opcion${
                      esCorrecta ? ' vista-previa-quiz__opcion--correcta' : ''
                    }`}
                  >
                    <span className="vista-previa-quiz__letra">{letra.toUpperCase()}.</span>{' '}
                    <span className="vista-previa-quiz__texto">{texto}</span>
                    {esCorrecta && (
                      <span className="vista-previa-quiz__marca">
                        {' '}
                        ✓ {TEXTOS.respuestaCorrecta}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}