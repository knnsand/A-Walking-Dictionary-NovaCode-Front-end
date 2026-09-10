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

export function mockListarPendientes() {
  return tarjetas.filter((t) => t.estado === 'pendiente_revision');
}

export function mockAprobarTarjeta(cardId, datosEditados) {
  tarjetas = tarjetas.map((t) =>
    t.id_tarjeta === cardId ? { ...t, ...datosEditados, estado: 'revisado_docente' } : t
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
  return tarjetas.filter((t) => t.estado === 'revisado_docente');
}

export function mockRegistrarTarjeta(idMazo, datos) {
  const nuevaTarjeta = {
    id_tarjeta: tarjetas.length + 1,
    mazo_id: idMazo,
    palabra: datos.palabra,
    traduccion: datos.traduccion,
    definicion: datos.definicion,
    ejemplo: datos.ejemplo || '',
    estado: 'pendiente_revision',
  };

  tarjetas = [...tarjetas, nuevaTarjeta];

  return nuevaTarjeta;
}

export function mockVerificarDuplicado(
  mazoId,
  palabra,
  definicion,
  ejemplo
) {
  const tarjetaExistente = tarjetas.find(
    (tarjeta) =>
      tarjeta.mazo_id === mazoId &&
      tarjeta.palabra.toLowerCase() === palabra.toLowerCase() &&
      tarjeta.definicion.toLowerCase() === definicion.toLowerCase() &&
      (tarjeta.ejemplo || '').toLowerCase() === (ejemplo || '').toLowerCase()
  );

  return {
    existe: Boolean(tarjetaExistente),
    tarjeta: tarjetaExistente || null,
  };
}