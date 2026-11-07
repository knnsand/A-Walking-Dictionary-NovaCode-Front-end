/**
 * @file tarjetasMock.js
 * @brief Datos simulados de tarjetas y aportes para trabajar el front sin back: registro de
 * palabras y detección de duplicados (HE-01) y curaduría de la docente (HE-02).
 *
 * Se usa cuando VITE_USE_MOCK=true. Las tarjetas y aportes viven en memoria y se pierden al
 * recargar la página.
 */

/**
 * @brief Permite desactivar temporalmente las coautorías y
 * el registro de palabras existentes sin eliminar el flujo original.
 *
 * false: cada palabra se registra una sola vez en el diccionario.
 * true: se conserva el comportamiento anterior de coautorías
 * y nuevas acepciones.
 */
const COAUTORIAS_HABILITADAS =
  import.meta.env.VITE_ENABLE_COAUTHORSHIP === 'true';

/**
 * @brief Normaliza una palabra para comparar duplicados.
 */
function normalizarPalabra(palabra) {
  return String(palabra ?? '').trim().toLocaleLowerCase();
}


/** @brief Tarjetas de ejemplo (en memoria); empiezan en "pendiente_revision". */
let tarjetas = [
  {
    id_tarjeta: 1,
    palabra: 'Doppelgänger',
    tipo_gramatical: 'Noun',
    traduccion: 'Doble',
    definicion: 'Aparición o doble de una persona viva; en literatura, un alter ego que atormenta al protagonista.',
    ejemplo: "The Creature functions as Victor's dark doppelgänger.",
    estado: 'pendiente_revision',
    estudiante: 'Lucia G.',
    correo_estudiante: 'lucia.g@unicauca.edu.co',
    fecha_aporte: '2024-10-23',
    registro: null,
    variante_regional: null,
  },
  {
    id_tarjeta: 2,
    palabra: 'Picaresque',
    tipo_gramatical: 'Adjective',
    traduccion: 'Picaresco',
    definicion: 'Relativo a un estilo episódico de ficción sobre las aventuras de un héroe rudo pero atractivo.',
    ejemplo: "Defoe's Moll Flanders adheres to the picaresque tradition.",
    estado: 'pendiente_revision',
    estudiante: 'Javier D.',
    correo_estudiante: 'javier.d@unicauca.edu.co',
    fecha_aporte: '2024-10-24',
    registro: null,
    variante_regional: null,
  },
];

/** @brief Aportes de ejemplo (en memoria): un aporte "creada" por cada tarjeta inicial. */
let aportes = [
  {
    id_aporte: 1,
    tarjeta_id: 1,
    inscripcion_id: 1,
    traduccion_aportada: tarjetas[0].traduccion,
    definicion_aportada: tarjetas[0].definicion,
    ejemplo_aportado: tarjetas[0].ejemplo,
    tipo_aporte: 'creada',
    fecha_aporte: tarjetas[0].fecha_aporte,
  },
  {
    id_aporte: 2,
    tarjeta_id: 2,
    inscripcion_id: 2,
    traduccion_aportada: tarjetas[1].traduccion,
    definicion_aportada: tarjetas[1].definicion,
    ejemplo_aportado: tarjetas[1].ejemplo,
    tipo_aporte: 'creada',
    fecha_aporte: tarjetas[1].fecha_aporte,
  },
];

/** @brief Id que recibirá el próximo aporte registrado. */
let siguienteIdAporte = aportes.length + 1;

/**
 * @brief Simula GET /api/v1/cards/pending: tarjetas en "pendiente_revision" con sus aportes (CA-2.1.1).
 * @return {Object[]} Tarjetas pendientes, cada una con su lista de aportes.
 */
export function mockListarPendientes() {
  return tarjetas
    .filter(tarjeta => tarjeta.estado === 'pendiente_revision')
    .map(tarjeta => ({
      ...tarjeta,
      aportes: aportes.filter(
        aporte => aporte.tarjeta_id === tarjeta.id_tarjeta
      ),
    }));
}

/**
 * @brief Simula la aprobación de una tarjeta: pasa a "revisado_docente" (CA-2.1.2).
 * @param {number} cardId - Id de la tarjeta.
 * @return {Object|undefined} Tarjeta aprobada, o undefined si no existe.
 */
export function mockAprobarTarjeta(cardId) {
  tarjetas = tarjetas.map((t) =>
    t.id_tarjeta === cardId ? { ...t, estado: 'revisado_docente' } : t
  );
  return tarjetas.find((t) => t.id_tarjeta === cardId);
}

/**
 * @brief Simula la corrección de una tarjeta por la docente antes de aprobarla (CA-2.1.2).
 * @param {number} cardId - Id de la tarjeta.
 * @param {Object} datos - Campos corregidos (palabra, traduccion, definicion, ejemplo...).
 * @return {Object|undefined} Tarjeta editada, o undefined si no existe.
 */
export function mockEditarTarjeta(cardId, datos) {
  tarjetas = tarjetas.map((t) =>
    t.id_tarjeta === cardId ? { ...t, ...datos } : t
  );
  return tarjetas.find((t) => t.id_tarjeta === cardId);
}

/**
 * @brief Simula el rechazo de una tarjeta: pasa a "rechazada" (CA-2.1.3).
 * @param {number} cardId - Id de la tarjeta.
 * @return {{id_tarjeta: number, estado: string}} Id y estado nuevo.
 */
export function mockRechazarTarjeta(cardId) {
  tarjetas = tarjetas.map((t) =>
    t.id_tarjeta === cardId ? { ...t, estado: 'rechazada' } : t
  );
  return { id_tarjeta: cardId, estado: 'rechazada' };
}

/**
 * @brief Simula PUT /api/v1/cards/{id}/context: guarda registro y variante regional (CA-2.2.1).
 * @param {number} cardId - Id de la tarjeta.
 * @param {Object} contexto - Etiquetas de contexto (registro, variante_regional).
 * @return {Object|undefined} Tarjeta actualizada, o undefined si no existe.
 */
export function mockActualizarContexto(cardId, contexto) {
  tarjetas = tarjetas.map((t) =>
    t.id_tarjeta === cardId ? { ...t, ...contexto } : t
  );
  return tarjetas.find((t) => t.id_tarjeta === cardId);
}

/**
 * @brief Simula GET /api/v1/cards/approved: tarjetas en "revisado_docente" con sus aportes
 * (pestaña "Historial Aprobadas" del panel de curaduría).
 * @return {Object[]} Tarjetas aprobadas, cada una con su lista de aportes.
 */
export function mockListarAprobadas() {
  return tarjetas
    .filter(tarjeta => tarjeta.estado === 'revisado_docente')
    .map(tarjeta => ({
      ...tarjeta,
      aportes: aportes.filter(
        aporte => aporte.tarjeta_id === tarjeta.id_tarjeta
      ),
    }));
}


/**
 * @brief Registra una tarjeta nueva.
 *
 * Cuando las coautorías están desactivadas, impide registrar
 * palabras existentes en cualquier mazo.
 *
 * Cuando están habilitadas, conserva el flujo original
 * de creación, coautoría y nuevas acepciones.
 */
export function mockRegistrarTarjeta(idMazo, datos) {
  const palabraNormalizada = normalizarPalabra(datos.palabra);

  const tarjetaExistente = tarjetas.find((tarjeta) => {
    const mismaPalabra =
      normalizarPalabra(tarjeta.palabra) === palabraNormalizada;

    if (!COAUTORIAS_HABILITADAS) {
      return mismaPalabra;
    }

    return (
      tarjeta.mazo_id === idMazo &&
      mismaPalabra
    );
  });

  const fechaAporte = new Date().toISOString();

  // Bloqueo de duplicados cuando las coautorías están desactivadas.
  if (tarjetaExistente && !COAUTORIAS_HABILITADAS) {
    throw new Error(
      'This word has already been submitted. Please choose a different word.'
    );
  }

  // Registro normal de una palabra nueva.
  if (!tarjetaExistente) {
    const nuevaTarjeta = {
      id_tarjeta:
        Math.max(0, ...tarjetas.map((tarjeta) => tarjeta.id_tarjeta)) + 1,
      mazo_id: idMazo,
      palabra: palabraNormalizada,
      traduccion: datos.traduccion,
      definicion: datos.definicion,
      ejemplo: datos.ejemplo || '',
      estado: 'pendiente_revision',
    };

    tarjetas = [...tarjetas, nuevaTarjeta];

    const nuevoAporte = {
      id_aporte: siguienteIdAporte++,
      tarjeta_id: nuevaTarjeta.id_tarjeta,
      inscripcion_id: datos.inscripcion_id ?? 1,
      traduccion_aportada: datos.traduccion,
      definicion_aportada: datos.definicion,
      ejemplo_aportado: datos.ejemplo || null,
      tipo_aporte: 'creada',
      fecha_aporte: fechaAporte,
    };

    aportes = [...aportes, nuevoAporte];

    return {
      resultado: 'creada',
      tarjeta: nuevaTarjeta,
      aporte: nuevoAporte,
    };
  }

  // Flujo original: se conserva para una posible reactivación.
  const mismaDefinicion =
    tarjetaExistente.definicion.trim().toLowerCase() ===
    datos.definicion.trim().toLowerCase();

  const mismoEjemplo =
    (tarjetaExistente.ejemplo || '').trim().toLowerCase() ===
    (datos.ejemplo || '').trim().toLowerCase();

  const tipoAporte =
    mismaDefinicion && mismoEjemplo
      ? 'coautoria'
      : 'acepcion_nueva';

  const nuevoAporte = {
    id_aporte: siguienteIdAporte++,
    tarjeta_id: tarjetaExistente.id_tarjeta,
    inscripcion_id: datos.inscripcion_id ?? 1,
    traduccion_aportada: datos.traduccion,
    definicion_aportada: datos.definicion,
    ejemplo_aportado: datos.ejemplo || null,
    tipo_aporte: tipoAporte,
    fecha_aporte: fechaAporte,
  };

  aportes = [...aportes, nuevoAporte];

  return {
    resultado: tipoAporte,
    tarjeta: tarjetaExistente,
    aporte: nuevoAporte,
  };
}


/**
 * @brief Verifica si una palabra ya existe.
 *
 * Con coautorías desactivadas, busca en todo el diccionario.
 * Con coautorías habilitadas, conserva la búsqueda original
 * por mazo y la clasificación de coautorías o nuevas acepciones.
 */
export function mockVerificarDuplicado(
  mazoId,
  palabra,
  definicion,
  ejemplo
) {
  const palabraNormalizada = normalizarPalabra(palabra);

  const tarjetaExistente = tarjetas.find((tarjeta) => {
    const mismaPalabra =
      normalizarPalabra(tarjeta.palabra) === palabraNormalizada;

    if (!COAUTORIAS_HABILITADAS) {
      return mismaPalabra;
    }

    return (
      tarjeta.mazo_id === mazoId &&
      mismaPalabra
    );
  });

  if (!tarjetaExistente) {
    return {
      duplicado: false,
      resultado: 'creada',
      tarjeta: null,
    };
  }

  if (!COAUTORIAS_HABILITADAS) {
    return {
      duplicado: true,
      resultado: 'palabra_existente',
      tarjeta: tarjetaExistente,
    };
  }

  // Flujo original: coautorías y nuevas acepciones.
  const mismaDefinicion =
    tarjetaExistente.definicion.trim().toLowerCase() ===
    definicion.trim().toLowerCase();

  const mismoEjemplo =
    (tarjetaExistente.ejemplo || '').trim().toLowerCase() ===
    (ejemplo || '').trim().toLowerCase();

  return {
    duplicado: true,
    resultado:
      mismaDefinicion && mismoEjemplo
        ? 'coautoria'
        : 'acepcion_nueva',
    tarjeta: tarjetaExistente,
  };
}
