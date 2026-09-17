let inscripciones = [
  { id_inscripcion: 1, curso_id: 1, estudiante_id: 2, email_estudiante: 'juan.estudiante@correo.edu', nombre_estudiante: 'Juan Estudiante', fecha_inscripcion: '2026-09-01', estado: 'activo' },
  { id_inscripcion: 2, curso_id: 1, estudiante_id: 3, email_estudiante: 'maria.estudiante@correo.edu', nombre_estudiante: 'Maria Estudiante', fecha_inscripcion: '2026-09-01', estado: 'activo' },
];

// Estudiantes "conocidos" en el sistema (simulan la tabla usuario), usados para
// simular la búsqueda por correo de CA-5.3.2, incluyendo el caso "no encontrado".
// Los correos son inventados para esta simulación -- no están confirmados contra
// los datos reales de seed.sql.
const estudiantesConocidos = [
  { id_usuario: 2, nombre_completo: 'Juan Estudiante', email: 'juan.estudiante@correo.edu' },
  { id_usuario: 3, nombre_completo: 'Maria Estudiante', email: 'maria.estudiante@correo.edu' },
  { id_usuario: 4, nombre_completo: 'Carlos Estudiante', email: 'carlos.estudiante@correo.edu' },
];

// CA-5.3.1: código de acceso fijo simulado (el campo real todavía no existe en la BD).
// Mock temporal para HU-014.
// El backend todavía no implementa el código de acceso ni los endpoints
// de inscripción; este valor permite validar el flujo del frontend.
const CODIGO_ACCESO_MOCK = 'LIT2026';

let siguienteId = 3;

export function mockUnirseCurso(codigoAcceso, estudianteId) {
  if (codigoAcceso.trim().toUpperCase() !== CODIGO_ACCESO_MOCK) {
    throw new Error('El código ingresado no corresponde a ningún curso activo.');
  }
  const yaInscrito = inscripciones.some(
  (inscripcion) =>
    inscripcion.curso_id === 1 &&
    inscripcion.estudiante_id === Number(estudianteId)
);

if (yaInscrito) {
  throw new Error('Ya estás inscrito en este curso.');
}
  const nueva = {
    id_inscripcion: siguienteId++,
    curso_id: 1,
    estudiante_id: Number(estudianteId),
    estado: 'activo',
    fecha_inscripcion: new Date().toISOString().slice(0, 10),
  };
  inscripciones.push(nueva);
  return nueva;
}

export function mockInscribirEstudiante(cursoId, email) {
  const estudiante = estudiantesConocidos.find(
    (e) => e.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!estudiante) {
    throw new Error('No se encontró ningún estudiante registrado con ese correo.');
  }
  const yaInscrito = inscripciones.some(
    (i) => i.curso_id === Number(cursoId) && i.estudiante_id === estudiante.id_usuario
  );
  if (yaInscrito) {
    throw new Error('Este estudiante ya está inscrito en el curso seleccionado.');
  }
  const nueva = {
    id_inscripcion: siguienteId++,
    curso_id: Number(cursoId),
    estudiante_id: estudiante.id_usuario,
    nombre_estudiante: estudiante.nombre_completo,
    email_estudiante: estudiante.email,
    estado: 'activo',
    fecha_inscripcion: new Date().toISOString().slice(0, 10),
  };
  inscripciones.push(nueva);
  return nueva;
}