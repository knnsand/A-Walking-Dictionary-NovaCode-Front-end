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

let siguienteIdAporte = aportes.length + 1;

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

export function mockAprobarTarjeta(cardId) {
  tarjetas = tarjetas.map((t) =>
    t.id_tarjeta === cardId ? { ...t, estado: 'revisado_docente' } : t
  );
  return tarjetas.find((t) => t.id_tarjeta === cardId);
}

export function mockEditarTarjeta(cardId, datos) {
  tarjetas = tarjetas.map((t) =>
    t.id_tarjeta === cardId ? { ...t, ...datos } : t
  );
  return tarjetas.find((t) => t.id_tarjeta === cardId);
}

export function mockRechazarTarjeta(cardId) {
  tarjetas = tarjetas.map((t) =>
    t.id_tarjeta === cardId ? { ...t, estado: 'rechazada' } : t
  );
  return { id_tarjeta: cardId, estado: 'rechazada' };
}

export function mockActualizarContexto(cardId, contexto) {
  tarjetas = tarjetas.map((t) =>
    t.id_tarjeta === cardId ? { ...t, ...contexto } : t
  );
  return tarjetas.find((t) => t.id_tarjeta === cardId);
}

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
