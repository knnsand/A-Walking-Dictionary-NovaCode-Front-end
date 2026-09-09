let mazos = [];
let siguienteId = 1;

export function mockListarMazos() {
  return [...mazos];
}

export function mockCrearMazo(datos) {
  const nuevoMazo = {
    id_mazo: siguienteId++,
    ...datos,
    fecha_creacion: new Date().toISOString(),
  };

  mazos.push(nuevoMazo);
  return nuevoMazo;
}

export function mockActualizarEstadoMazo(idMazo, estado) {
  const indice = mazos.findIndex(
    (mazo) => mazo.id_mazo === idMazo
  );

  if (indice === -1) {
    throw new Error('Mazo no encontrado.');
  }

  mazos[indice] = {
    ...mazos[indice],
    estado,
  };

  return { ...mazos[indice] };
}