import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AcercaDe } from './AcercaDe';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('../../contexto/useEncabezadoPagina', () => ({
  useEncabezadoPagina: vi.fn(),
}));

describe('AcercaDe', () => {
  it('muestra el tutorial de introducción inicialmente', () => {
    const { container } = render(<AcercaDe rol="estudiante" />);

    expect(screen.getByText('aboutPage.tutorials.inicio.title')).toBeInTheDocument();
    expect(container.querySelector('video source')).toHaveAttribute(
      'src',
      expect.stringContaining('Estudiante/IniciodeSesion.mp4.mp4')
    );
  });

  it('permite al estudiante ver sus tutoriales, pero no los de docente', () => {
    render(<AcercaDe rol="estudiante" />);

    expect(screen.queryByRole('button', { name: 'aboutPage.categories.teacher' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'aboutPage.categories.student' }));

    expect(screen.getByRole('heading', { name: 'aboutPage.tutorials.perfil-reportes.title' })).toBeInTheDocument();
    expect(screen.getByText('aboutPage.tutorials.palabras-estudio.title')).toBeInTheDocument();
  });

  it('permite cambiar entre tutoriales de estudiante', () => {
    const { container } = render(<AcercaDe rol="estudiante" />);

    fireEvent.click(screen.getByRole('button', { name: 'aboutPage.categories.student' }));
    fireEvent.click(screen.getByRole('button', { name: /aboutPage.tutorials.quices-estudiante.title/ }));

    expect(container.querySelector('video source')).toHaveAttribute(
      'src',
      expect.stringContaining('Estudiante/ResolucionQuices.mp4.mp4')
    );
  });

  it('permite al docente acceder a sus tutoriales', () => {
    const { container } = render(<AcercaDe rol="docente" />);

    fireEvent.click(screen.getByRole('button', { name: 'aboutPage.categories.teacher' }));

    expect(container.querySelector('video source')).toHaveAttribute(
      'src',
      expect.stringContaining('Docente/CreacionMazo_')
    );
  });
});
