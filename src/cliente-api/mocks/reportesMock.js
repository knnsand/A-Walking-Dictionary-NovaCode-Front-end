
/**
 * HU-018: PDF de ejemplo sin dependencias ni acceso al backend.
 * Los datos utilizados son ficticios.
 */

// Prepara textos para escribirlos dentro de un PDF básico.
function pdfSeguro(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]/g, '?')
    .replace(/[\\()]/g, caracter => `\\${caracter}`);
}

// Construye un PDF básico con las líneas recibidas.
function crearPdfBasico(lineas) {
  const contenido = [
    'BT /F1 12 Tf 48 790 Td 17 TL',
    ...lineas.map(
      (linea, indice) =>
        `${indice ? 'T* ' : ''}(${pdfSeguro(linea)}) Tj`
    ),
    'ET',
  ].join('\n');

  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const posiciones = [0];

  for (let i = 0; i < objetos.length; i += 1) {
    posiciones.push(pdf.length);

    pdf += `${i + 1} 0 obj\n`;
    pdf += `${objetos[i]}\n`;
    pdf += 'endobj\n';
  }

  const inicioXref = pdf.length;

  pdf += `xref\n0 ${objetos.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (const posicion of posiciones.slice(1)) {
    pdf += `${String(posicion).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n`;
  pdf += `<< /Size ${objetos.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${inicioXref}\n%%EOF`;

  return new Blob([pdf], {
    type: 'application/pdf',
  });
}

// Genera y descarga el reporte ficticio de un estudiante.
export async function descargarProgresoMock(idEstudiante) {
  const lineas = [
    'A WALKING DICTIONARY - SAMPLE REPORT (MOCK DATA)',
    `Student ID: ${idEstudiante}`,
    'This report contains fictional data for frontend testing only.',
    '',

    '1. CONTRIBUTED WORDS',
    'Curious - curious (approved)',
    'Wander - to walk without a destination (approved)',
    'Strange - unusual (pending)',
    '',

    '2. QUIZ RESULTS',
    'Wonderland Vocabulary Quiz 1: 8/10',
    'Vocabulary Review Quiz: 9/10',
    '',

    '3. STUDY PROGRESS',
    'Review sessions: 6',
    'Reviewed words: 12',
    'Words requiring practice: 3',
  ];

  const blob = crearPdfBasico(lineas);

  const url = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `student-progress-${idEstudiante}-MOCK.pdf`;

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  // Liberamos el recurso temporal después de iniciar la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
