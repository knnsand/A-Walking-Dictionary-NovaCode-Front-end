// cliente-api/mocks/estudioMock.js
// HU-010: datos simulados para trabajar la vista de estudio sin back.
//
// Los campos base (id_tarjeta, mazo_id, palabra, traduccion, definicion, ejemplo, estado,
// progreso) son los que ya devuelve POST /api/v1/study/review-session.
//
// Los campos marcados como "opcional" (fonetica, categoria_gramatical, etiquetas) los muestra
// el diseño, pero el back todavía NO los devuelve: la vista los pinta solo si existen.

export const mockTarjetasEstudio = [
  {
    id_tarjeta: 1,
    mazo_id: 1,
    palabra: 'Anachronism',
    traduccion: 'Anacronismo',
    definicion:
      'A thing belonging or appropriate to a period other than that in which it exists, especially a thing that is conspicuously old-fashioned or placed in the wrong historical epoch.',
    ejemplo:
      "The clock striking in Shakespeare's Julius Caesar is a famous historical anachronism that humanizes ancient Rome with Elizabethan stagecraft.",
    estado: 'revisado_docente',
    progreso: null,
    fonetica: '/əˈnæk.rə.nɪz.əm/', // opcional
    categoria_gramatical: 'Noun', // opcional
    etiquetas: ['Academic', 'Literary'], // opcional
  },
  {
    id_tarjeta: 2,
    mazo_id: 1,
    palabra: 'Bildungsroman',
    traduccion: 'Novela de formación',
    definicion:
      "A novel dealing with one person's formative years or spiritual education; a coming-of-age story tracking moral and psychological growth.",
    ejemplo:
      "Great Expectations is widely considered one of the finest examples of the bildungsroman in Victorian literature, tracking Pip's moral journey.",
    estado: 'revisado_docente',
    progreso: null,
    fonetica: '/ˈbɪldʊŋz.roʊˌmɑːn/',
    categoria_gramatical: 'Noun',
    etiquetas: ['Academic', 'Literary'],
  },
  {
    id_tarjeta: 3,
    mazo_id: 1,
    palabra: 'Synecdoche',
    traduccion: 'Sinécdoque',
    definicion:
      'A figure of speech in which a part is made to represent the whole, or the whole is made to represent a part.',
    ejemplo:
      'When Dickens calls the factory workers of Hard Times "the Hands", he reduces people to a body part: a synecdoche for industrial dehumanization.',
    estado: 'revisado_docente',
    progreso: null,
    fonetica: '/sɪˈnɛkdəki/',
    categoria_gramatical: 'Noun',
    etiquetas: ['Academic', 'Literary'],
  },
  {
    id_tarjeta: 4,
    mazo_id: 1,
    palabra: 'Pathetic fallacy',
    traduccion: 'Falacia patética',
    definicion:
      "The attribution of human emotions to nature or inanimate objects, so that the weather or landscape mirrors a character's mood.",
    ejemplo:
      "The storm raging over the moors in Wuthering Heights mirrors Heathcliff's turbulent passion.",
    estado: 'revisado_docente',
    progreso: null,
    fonetica: '/pəˈθɛtɪk ˈfæləsi/',
    categoria_gramatical: 'Noun',
    etiquetas: ['Literary'],
  },
  {
    id_tarjeta: 5,
    mazo_id: 1,
    palabra: 'Epistolary',
    traduccion: 'Epistolar',
    definicion:
      'Written in the form of letters or documents; describing a narrative told through correspondence.',
    ejemplo:
      "Bram Stoker's Dracula is epistolary: it is assembled from diary entries, letters and newspaper clippings.",
    estado: 'revisado_docente',
    progreso: { factor_facilidad: 2.5, intervalo_dias: 1, repeticiones: 1 },
    fonetica: '/ɪˈpɪstələri/',
    categoria_gramatical: 'Adjective',
    etiquetas: ['Literary'],
  },
  {
    id_tarjeta: 6,
    mazo_id: 1,
    palabra: 'Foil',
    traduccion: 'Personaje contrapunto',
    definicion:
      'A character who contrasts with another, usually the protagonist, in order to highlight particular qualities of the latter.',
    ejemplo:
      "In Jane Eyre, the serene Helen Burns acts as a foil to young Jane's fiery temper.",
    estado: 'revisado_docente',
    progreso: { factor_facilidad: 2.36, intervalo_dias: 6, repeticiones: 2 },
    fonetica: '/fɔɪl/',
    categoria_gramatical: 'Noun',
    etiquetas: ['Academic', 'Literary'],
  },
];

// Para el encabezado de la vista (semana y nombre del mazo). En producción esto sale de mazosApi.
export const mockMazosEstudio = {
  1: { nombre: 'Introduction to the Victorian Era', semana: 1 },
};

export function mockIniciarSesionRepaso(inscripcionId) {
  return {
    inscripcion_id: Number(inscripcionId),
    total_tarjetas: mockTarjetasEstudio.length,
    tarjetas: mockTarjetasEstudio,
  };
}

// Aproximación del resultado de SM-2 solo para simular la respuesta (el cálculo real lo hace el back).
const INTERVALOS_MOCK = { Repetir: 1, Difícil: 1, Buena: 6, Fácil: 6 };

export function mockRegistrarValoracion(inscripcionId, tarjetaId, valoracion) {
  return {
    inscripcion_id: Number(inscripcionId),
    tarjeta_id: Number(tarjetaId),
    ultima_valoracion: valoracion,
    intervalo_dias: INTERVALOS_MOCK[valoracion] ?? 1,
  };
}