import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CursosEstudiantes } from './CursosEstudiantes';
import { listarCursos, generarCodigoAcceso } from '../../../cliente-api/cursosApi';

const navegar = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navegar,
}));

const traduccionEstable = (clave) => ({
  'coursesPage.loading': 'Loading',
  'coursesPage.empty': 'No courses',
  'coursesPage.noCode': 'No code',
  'coursesPage.actions.generate': 'Generate code',
  'coursesPage.actions.generating': 'Generating',
  'coursesPage.actions.regenerate': 'Regenerate code',
  'coursesPage.actions.copied': 'Copied',
  'coursesPage.actions.addStudent': 'Add student',
  'coursesPage.actions.viewStudents': 'View students',
  'coursesPage.errors.loadFailed': 'Load failed',
  'coursesPage.errors.generateFailed': 'Generate failed',
  'coursesPage.errors.copyFailed': 'Copy failed',
  'coursesPage.confirmRegenerate': 'Regenerate?',
})[clave] ?? clave;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: traduccionEstable,
      'coursesPage.loading': 'Loading',
      'coursesPage.empty': 'No courses',
      'coursesPage.noCode': 'No code',
      'coursesPage.actions.generate': 'Generate code',
      'coursesPage.actions.generating': 'Generating',
      'coursesPage.actions.regenerate': 'Regenerate code',
      'coursesPage.actions.copied': 'Copied',
      'coursesPage.actions.addStudent': 'Add student',
      'coursesPage.actions.viewStudents': 'View students',
      'coursesPage.errors.loadFailed': 'Load failed',
      'coursesPage.errors.generateFailed': 'Generate failed',
      'coursesPage.errors.copyFailed': 'Copy failed',
      'coursesPage.confirmRegenerate': 'Regenerate?',

  }),
}));

vi.mock('../../../contexto/useEncabezadoPagina', () => ({
  useEncabezadoPagina: vi.fn(),
}));

vi.mock('../../../cliente-api/cursosApi', () => ({
  listarCursos: vi.fn(),
  generarCodigoAcceso: vi.fn(),
}));

vi.mock('../inscribir-estudiante/ModalInscribirEstudiante', () => ({
  ModalInscribirEstudiante: ({ onCerrar }) => (
    <button onClick={onCerrar}>Close enrollment</button>
  ),
}));

const curso = {
  id_curso: 3,
  nombre: 'Literatura Anglófona',
  codigo_acceso: null,
};

function mostrar() {
  return render(
    <MemoryRouter>
      <CursosEstudiantes />
    </MemoryRouter>
  );
}

describe('CursosEstudiantes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listarCursos.mockResolvedValue([curso]);
  });

  it('muestra los cursos y permite navegar al detalle', async () => {
    mostrar();

    expect(await screen.findByText('Anglophone Literature')).toBeInTheDocument();
    expect(screen.getByText('No code')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View students' }));
    expect(navegar).toHaveBeenCalledWith('/docente/cursos/3');
  });

  it('muestra un estado vacío cuando no existen cursos', async () => {
    listarCursos.mockResolvedValue([]);
    mostrar();

    expect(await screen.findByText('No courses')).toBeInTheDocument();
  });

  it('muestra errores al cargar los cursos', async () => {
    listarCursos.mockRejectedValue(new Error('Error de conexión'));
    mostrar();

    expect(await screen.findByText('Error de conexión')).toBeInTheDocument();
  });

  it('genera un código de acceso y actualiza la tarjeta', async () => {
    generarCodigoAcceso.mockResolvedValue({ codigo_acceso: 'ABCD1234' });
    mostrar();

    fireEvent.click(await screen.findByRole('button', { name: 'Generate code' }));

    expect(await screen.findByText('ABCD1234')).toBeInTheDocument();
    expect(generarCodigoAcceso).toHaveBeenCalledWith(3);
    expect(screen.getByRole('button', { name: 'Regenerate code' })).toBeInTheDocument();
  });

  it('muestra un error cuando falla la generación del código', async () => {
    generarCodigoAcceso.mockRejectedValue(new Error('No se pudo generar'));
    mostrar();

    fireEvent.click(await screen.findByRole('button', { name: 'Generate code' }));

    expect(await screen.findByText('No se pudo generar')).toBeInTheDocument();
  });

  it('permite cancelar la regeneración del código', async () => {
    listarCursos.mockResolvedValue([{ ...curso, codigo_acceso: 'ABCD1234' }]);
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);

    try {
      mostrar();
      fireEvent.click(await screen.findByRole('button', { name: 'Regenerate code' }));

      expect(generarCodigoAcceso).not.toHaveBeenCalled();
    } finally {
      confirmar.mockRestore();
    }
  });

  it('abre y cierra el formulario de inscripción', async () => {
    mostrar();

    fireEvent.click(await screen.findByRole('button', { name: 'Add student' }));
    expect(screen.getByRole('button', { name: 'Close enrollment' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close enrollment' }));
    expect(screen.queryByRole('button', { name: 'Close enrollment' })).not.toBeInTheDocument();
  });
});
