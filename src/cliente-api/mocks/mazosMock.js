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