// vistas/docente/cursos/DetalleCurso.test.jsx
// HU-020: la docente descarga el reporte consolidado del curso desde su detalle.
// HU-018: y el reporte individual de cada estudiante desde la tabla.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { DetalleCurso } from './DetalleCurso';

const logout = vi.fn();
vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ logout }),
}));
vi.mock('../../../cliente-api/cursosApi', () => ({
  obtenerCurso: vi.fn(),
  listarEstudiantesCurso: vi.fn(),
}));
vi.mock('../../../cliente-api/reportesApi', () => ({
  exportarReporteCursoPdf: vi.fn(),
  exportarProgresoEstudiantePdf: vi.fn(),
}));

import { obtenerCurso, listarEstudiantesCurso } from '../../../cliente-api/cursosApi';
import {
  exportarReporteCursoPdf,
  exportarProgresoEstudiantePdf,
} from '../../../cliente-api/reportesApi';

const CURSO = { id_curso: 3, nombre: 'Anglophone Literature I' };
const ESTUDIANTES = [
  {
    id_usuario: 7,
    nombre_completo: 'Lucía Gómez',
    palabras_aportadas: 3,
    nivel_ingles: 'B2',
    codigo_estudiantil: '104620',
  },
];

const BOTON_CURSO = 'Download the report of all students in Anglophone Literature I';

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/docente/cursos/3']}>
      <Routes>
        <Route path="/docente/cursos/:id" element={<DetalleCurso />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DetalleCurso — reportes en PDF', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    obtenerCurso.mockResolvedValue(CURSO);
    listarEstudiantesCurso.mockResolvedValue(ESTUDIANTES);
  });

  it('HU-020: descarga el reporte del curso de la URL', async () => {
    exportarReporteCursoPdf.mockResolvedValue(undefined);
    renderizar();

    fireEvent.click(await screen.findByRole('button', { name: BOTON_CURSO }));

    expect(exportarReporteCursoPdf).toHaveBeenCalledTimes(1);
    expect(exportarReporteCursoPdf).toHaveBeenCalledWith('3');
    expect(await screen.findByRole('button', { name: BOTON_CURSO })).toBeEnabled();
  });

  it('HU-020: el botón del curso aparece aunque el curso no tenga estudiantes', async () => {
    listarEstudiantesCurso.mockResolvedValue([]);
    renderizar();

    expect(await screen.findByRole('button', { name: BOTON_CURSO })).toBeInTheDocument();
    expect(screen.getByText('This course has no enrolled students yet.')).toBeInTheDocument();
  });

  it('HU-020: si el backend responde 403, muestra el aviso de que no es docente', async () => {
    exportarReporteCursoPdf.mockRejectedValue(
      new Error('No tiene permisos para acceder a este recurso')
    );
    renderizar();

    fireEvent.click(await screen.findByRole('button', { name: BOTON_CURSO }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your account does not have the teacher role, so it cannot export to PDF.'
    );
    expect(logout).not.toHaveBeenCalled();
  });

  it('HU-020: si la sesión venció (401), cierra la sesión', async () => {
    exportarReporteCursoPdf.mockRejectedValue(new Error('Token inválido o expirado'));
    renderizar();

    fireEvent.click(await screen.findByRole('button', { name: BOTON_CURSO }));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });

  it('no muestra el botón del curso si no se pudo cargar el curso', async () => {
    obtenerCurso.mockRejectedValue(new Error('Curso no encontrado'));
    renderizar();

    expect(await screen.findByText('Curso no encontrado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: BOTON_CURSO })).not.toBeInTheDocument();
  });

  it('HU-018: descarga el reporte individual de cada estudiante', async () => {
    exportarProgresoEstudiantePdf.mockResolvedValue(undefined);
    renderizar();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Download progress report for Lucía Gómez' })
    );

    expect(exportarProgresoEstudiantePdf).toHaveBeenCalledWith(7);
  });
});
