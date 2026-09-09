/**
 * NOTA DE ALCANCE: esta funcionalidad ("Citas y Sentidos") replica
 * una pestaña visible en el mockup de referencia del equipo, pero
 * NO corresponde a ninguna Historia de Usuario documentada en
 * HU-004 ni HU-005 del backlog (Tabla 2, Proyecto II). Se construye
 * como UI de demostración visual. Si el equipo decide mantenerla,
 * debe formalizarse como HU nueva con sus propios criterios de
 * aceptación antes del cierre de sprint.
 */
let citas = [
  {
    id_cita: 1,
    palabra: 'Bildungsroman',
    tipo_gramatical: 'Noun',
    etiqueta: 'FEMALE BILDUNGSROMAN',
    sentido: 'Variante de la novela de formación enfocada en los obstáculos específicos de género y autonomía social en la heroína victoriana.',
    texto_cita: 'I am no bird; and no net ensnares me; I am a free human being with an independent will.',
    fuente: 'Jane Eyre (1847) (Charlotte Brontë)',
    estudiante: 'Mateo Rodríguez',
    estado: 'pendiente_revision',
  },
  {
    id_cita: 2,
    palabra: 'Serendipity',
    tipo_gramatical: 'Noun',
    etiqueta: 'TEXTUAL SERENDIPITY',
    sentido: 'El hallazgo afortunado de una clave hermenéutica o manuscrito extraviado que reordena el sentido de la trama.',
    texto_cita: "By mere serendipity among the damp folios, the forgotten confession revealed Frankenstein's true descent.",
    fuente: 'Critical Notes on Romanticism (Prof. J. Sterling)',
    estudiante: 'Lucía Gómez',
    estado: 'pendiente_revision',
  },
];

export function mockListarCitasPendientes() {
  return citas.filter((c) => c.estado === 'pendiente_revision');
}

export function mockAprobarCita(idCita) {
  citas = citas.map((c) => (c.id_cita === idCita ? { ...c, estado: 'aprobada' } : c));
  return citas.find((c) => c.id_cita === idCita);
}

export function mockDeclinarCita(idCita) {
  citas = citas.map((c) => (c.id_cita === idCita ? { ...c, estado: 'declinada' } : c));
  return { id_cita: idCita, estado: 'declinada' };
}