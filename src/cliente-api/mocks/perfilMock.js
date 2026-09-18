// Perfiles simulados, pre-cargados con los estudiantes sembrados en seed.sql del backend.
let perfiles = {
  2: { estudiante_id: 2, nombre_completo: 'Juan Estudiante', correo: 'juan.estudiante@correo.edu', rol: 'Estudiante', nivel_ingles: '', codigo_estudiantil: '', avatar: '' },
  3: { estudiante_id: 3, nombre_completo: 'Maria Estudiante', correo: 'maria.estudiante@correo.edu', rol: 'Estudiante', nivel_ingles: '', codigo_estudiantil: '', avatar: '' },
  4: { estudiante_id: 4, nombre_completo: 'Carlos Estudiante', correo: 'carlos.estudiante@correo.edu', rol: 'Estudiante', nivel_ingles: '', codigo_estudiantil: '', avatar: '' },
};

export function mockObtenerPerfil(estudianteId) {
  const id = Number(estudianteId);
  return perfiles[id] || { estudiante_id: id, nombre_completo: '', correo: '', rol: 'Estudiante', nivel_ingles: '', codigo_estudiantil: '', avatar: '' };
}

export function mockActualizarPerfil(estudianteId, datos) {
  const id = Number(estudianteId);
  const actual = mockObtenerPerfil(id);

  const actualizado = {
    ...actual,
    nivel_ingles: datos.nivel_ingles,
    codigo_estudiantil: datos.codigo_estudiantil,
    avatar: datos.avatar,
  };

  perfiles[id] = actualizado;
  return actualizado;
}

// PLACEHOLDER: no existe todavía ningún endpoint que agregue esta información
// (proviene de curso + inscripción, y "Departamento & Universidad" es dato institucional
// fijo). Se documentará como brecha pendiente en docs/contrato-perfil.md.
export function mockObtenerContextoAcademico(estudianteId) {
  return {
    estudiante_id: Number(estudianteId),
    curso_asignado: 'Literatura Anglófona',
    semestre_activo: '2026-2',
    departamento_universidad: 'Universidad del Cauca - Departamento de Sistemas',
  };
}