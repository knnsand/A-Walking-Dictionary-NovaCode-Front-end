// cliente-api/quizzesApi.test.js
// HU-3.2: cliente de API para responder un quiz y recibir la nota.
// `apiRequest` se simula: aquí solo se comprueba qué ruta se llama y cómo se
// interpretan las respuestas, sin tocar la red.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './httpClient';
import { enviarRespuestasQuiz, obtenerPreguntasQuiz } from './quizzesApi';

vi.mock('./httpClient', () => ({ apiRequest: vi.fn() }));

const resultado = {
  id_resultado: 5,
  quiz_id: 12,
  estudiante_id: 3,
  fecha_inicio: '2026-10-10T15:00:00.000Z',
  fecha_envio: '2026-10-10T15:08:00.000Z',
  puntaje_obtenido: 1,
  puntaje_maximo: 2,
  calificacion: 2.5,
  tiempo_empleado_seg: 480,
};

const respuestas = [
  {
    id_respuesta: 1,
    resultado_id: 5,
    pregunta_id: 101,
    respuesta_estudiante: 'tr-uno',
    es_correcta: true,
    puntaje_obtenido: 1,
  },
  {
    id_respuesta: 2,
    resultado_id: 5,
    pregunta_id: 102,
    respuesta_estudiante: null,
    es_correcta: false,
    puntaje_obtenido: 0,
  },
];

const datosEnvio = {
  fecha_inicio: '2026-10-10T15:00:00.000Z',
  respuestas: [
    { pregunta_id: 101, respuesta_estudiante: 'tr-uno' },
    { pregunta_id: 102, respuesta_estudiante: null },
  ],
};

/** Imita el error que lanza `apiRequest` (httpClient.js) ante un HTTP no exitoso. */
function errorHttp(status, cuerpo) {
  const error = new Error(cuerpo?.error ?? `Error ${status}`);
  error.status = status;
  error.cuerpo = cuerpo;
  return error;
}

describe('quizzesApi (HU-3.2)', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('obtenerPreguntasQuiz llama a GET /quizzes/:id/preguntas y devuelve la respuesta', async () => {
    const respuesta = {
      quiz: { id_quiz: 12, titulo: 'Quiz semana 3', tiempo_limite_min: 10 },
      preguntas: [{ id_pregunta: 101, enunciado: 'uno', opcion_a: 'a', opcion_b: 'b', orden: 1 }],
    };
    apiRequest.mockResolvedValue(respuesta);

    const datos = await obtenerPreguntasQuiz(12);

    expect(apiRequest).toHaveBeenCalledWith('/quizzes/12/preguntas');
    expect(datos).toEqual(respuesta);
  });

  it('enviarRespuestasQuiz envía POST /quizzes/:id/submit y marca yaEnviado en false', async () => {
    apiRequest.mockResolvedValue({ resultado, respuestas });

    const datos = await enviarRespuestasQuiz(12, datosEnvio);

    expect(apiRequest).toHaveBeenCalledWith('/quizzes/12/submit', {
      method: 'POST',
      body: JSON.stringify(datosEnvio),
    });
    expect(datos).toEqual({ resultado, respuestas, yaEnviado: false });
  });

  it('CA-3.2.3: un 409 devuelve el resultado previo con yaEnviado en true, sin lanzar error', async () => {
    apiRequest.mockRejectedValue(
      errorHttp(409, { error: 'Ya enviaste este quiz', resultado, respuestas })
    );

    const datos = await enviarRespuestasQuiz(12, datosEnvio);

    expect(datos).toEqual({ resultado, respuestas, yaEnviado: true });
  });

  it('un 409 sin resultado en el cuerpo se trata como error normal', async () => {
    apiRequest.mockRejectedValue(errorHttp(409, { error: 'Conflicto' }));

    await expect(enviarRespuestasQuiz(12, datosEnvio)).rejects.toThrow('Conflicto');
  });

  it('un 400 (quiz cerrado o tiempo agotado) lanza el error con su mensaje', async () => {
    apiRequest.mockRejectedValue(errorHttp(400, { error: 'El quiz ya cerró' }));

    await expect(enviarRespuestasQuiz(12, datosEnvio)).rejects.toThrow('El quiz ya cerró');
  });
});