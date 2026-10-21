// vistas/estudiante/estudiar-tarjetas/EstudiarTarjetas.test.jsx
// HU-010: flujo de estudio con flashcards y repetición espaciada.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EstudiarTarjetas } from './EstudiarTarjetas';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';

// El título de la página lo pinta el layout, que esta prueba no renderiza: se simula
// el hook para comprobar lo que el componente le entrega.
vi.mock('../../../contexto/useEncabezadoPagina', () => ({
  useEncabezadoPagina: vi.fn(),
}));

// SugerenciasPalabras (HU-011) consulta la API de enriquecimiento: se simula para que la
// prueba no dependa de un backend (en CI no existe y mostraría un role="alert" propio).
vi.mock('../../../cliente-api/enriquecimientoApi', () => ({
  obtenerFamiliaPalabras: vi.fn().mockResolvedValue({ sugerencias: [] }),
}));

const tarjeta = (id, palabra, extra = {}) => ({
  id_tarjeta: id,
  mazo_id: 1,
  palabra,
  traduccion: `tr-${palabra}`,
  definicion: `def-${palabra}`,
  ejemplo: `ej-${palabra}`,
  progreso: null,
  ...extra,
});

/** Servicio simulado: guarda las llamadas y permite forzar fallos. */
function crearServicio(tarjetas, { fallosAlGuardar = 0, fallosAlCargar = 0 } = {}) {
  const valoraciones = [];
  let porFallarGuardado = fallosAlGuardar;
  let porFallarCarga = fallosAlCargar;

  return {
    valoraciones,
    iniciarSesionRepaso: async () => {
      if (porFallarCarga > 0) {
        porFallarCarga -= 1;
        throw new Error('Inscripción no encontrada');
      }
      return { tarjetas };
    },
    registrarValoracion: async (inscripcionId, tarjetaId, valoracion) => {
      if (porFallarGuardado > 0) {
        porFallarGuardado -= 1;
        throw new Error('fallo de red');
      }
      valoraciones.push([inscripcionId, tarjetaId, valoracion]);
      return { intervalo_dias: 6 };
    },
  };
}

const girar = () => fireEvent.click(screen.getByRole('button', { name: 'Flip card' }));
const pulsarTecla = (key) => fireEvent.keyDown(document.body, { key });
const terminarSesion = () =>
  fireEvent.click(screen.getByRole('button', { name: 'End review session' }));

describe('EstudiarTarjetas', () => {
  it('muestra la palabra al frente y deshabilita la valoración hasta girar la tarjeta', async () => {
    const servicio = crearServicio([tarjeta(1, 'anachronism')]);
    render(<EstudiarTarjetas inscripcionId={1} servicio={servicio} />);

    await screen.findByText('Card 1 of 1');
    expect(screen.getByRole('button', { name: /Good/ })).toBeDisabled();

    girar();
    expect(screen.getByRole('button', { name: /Good/ })).toBeEnabled();
    expect(screen.getByText('tr-anachronism')).toBeInTheDocument();
    expect(screen.getByText('def-anachronism')).toBeInTheDocument();
  });

  it('CA-4.1.3: "Repetir" reintroduce la tarjeta al final y el resumen sale al terminar la sesión', async () => {
    const servicio = crearServicio([tarjeta(1, 'uno'), tarjeta(2, 'dos')]);
    render(<EstudiarTarjetas inscripcionId={7} servicio={servicio} />);

    await screen.findByText('Card 1 of 2');

    // Tarjeta 1: Repetir -> pasa al final de la cola
    girar();
    fireEvent.click(screen.getByRole('button', { name: /Repeat/ }));
    expect(await screen.findByText(/will return at the end of the session/)).toBeInTheDocument();
    expect(screen.getByText('Card 1 of 2')).toBeInTheDocument();

    // Tarjeta 2: Buena (con teclado)
    pulsarTecla(' ');
    pulsarTecla('3');
    expect(await screen.findByText('Card 2 of 2')).toBeInTheDocument();
    expect(screen.getByText(/Next review in 6 days/)).toBeInTheDocument();
    expect(screen.getByText('Again')).toBeInTheDocument();

    // Tarjeta 1 de nuevo: Fácil (con teclado)
    pulsarTecla(' ');
    pulsarTecla('4');

    // Las tarjetas no se acaban: el mazo reinicia hasta que el estudiante termine.
    expect(await screen.findByText('Card 1 of 2')).toBeInTheDocument();
    expect(screen.queryByText('Session completed')).not.toBeInTheDocument();

    terminarSesion();
    expect(await screen.findByText('Session completed')).toBeInTheDocument();
    expect(screen.getByText(/You reviewed 2 cards/)).toBeInTheDocument();

    // CA-4.1.2: se envía el texto exacto que valida el back (en español, NO se traduce),
    // con la tarjeta y la inscripción
    expect(servicio.valoraciones).toEqual([
      [7, 1, 'Repetir'],
      [7, 2, 'Buena'],
      [7, 1, 'Fácil'],
    ]);
  });

  it('las tarjetas no se acaban: el mazo reinicia y el resumen solo sale al pulsar terminar', async () => {
    const servicio = crearServicio([tarjeta(1, 'uno')]);
    render(<EstudiarTarjetas inscripcionId={1} servicio={servicio} />);

    await screen.findByText('Card 1 of 1');
    girar();
    fireEvent.click(screen.getByRole('button', { name: /Good/ }));
    expect(await screen.findByText(/Next review in 6 days/)).toBeInTheDocument();

    // Sigue habiendo tarjeta y todavía no hay resumen
    expect(screen.getByText('Card 1 of 1')).toBeInTheDocument();
    expect(screen.queryByText('Session completed')).not.toBeInTheDocument();

    terminarSesion();
    expect(await screen.findByText('Session completed')).toBeInTheDocument();
    expect(screen.getByText(/You reviewed 1 card/)).toBeInTheDocument();
  });

  it('no valora con las teclas 1-4 si la respuesta todavía no se ha visto', async () => {
    const servicio = crearServicio([tarjeta(1, 'uno')]);
    render(<EstudiarTarjetas inscripcionId={1} servicio={servicio} />);

    await screen.findByText('Card 1 of 1');
    pulsarTecla('3');
    await Promise.resolve();
    expect(servicio.valoraciones).toHaveLength(0);
  });

  it('muestra los campos opcionales del diseño solo cuando existen', async () => {
    const servicio = crearServicio([
      tarjeta(1, 'bildungsroman', {
        fonetica: '/ˈbɪldʊŋz/',
        categoria_gramatical: 'Noun',
        etiquetas: ['Academic', 'Literary'],
      }),
    ]);
    render(
      <EstudiarTarjetas
        inscripcionId={1}
        servicio={servicio}
        mazosPorId={{ 1: { nombre: 'Introduction to the Victorian Era', semana: 1 } }}
      />
    );

    await screen.findByText('Card 1 of 1');
    expect(screen.getByText('/ˈbɪldʊŋz/')).toBeInTheDocument();
    expect(screen.getAllByText('Noun').length).toBeGreaterThan(0);
    expect(screen.getByText('Academic')).toBeInTheDocument();
        // El nombre del mazo y la semana van al encabezado de la página (lo pinta el layout).
    expect(useEncabezadoPagina).toHaveBeenCalledWith(
      'Introduction to the Victorian Era',
      'Week 1 · Interactive 3D flashcards mode'
    );
  });

  it('muestra el estado vacío cuando no hay tarjetas por repasar', async () => {
    render(<EstudiarTarjetas inscripcionId={1} servicio={crearServicio([])} />);
    expect(await screen.findByText(/You have no cards to review/)).toBeInTheDocument();
  });

  it('muestra el error de carga y permite reintentar', async () => {
    const servicio = crearServicio([tarjeta(1, 'uno')], { fallosAlCargar: 1 });
    render(<EstudiarTarjetas inscripcionId={9} servicio={servicio} />);

    expect(await screen.findByText('Inscripción no encontrada')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Card 1 of 1')).toBeInTheDocument();
  });

  it('si falla el guardado no avanza de tarjeta y permite reintentar', async () => {
    const servicio = crearServicio([tarjeta(1, 'uno')], { fallosAlGuardar: 1 });
    render(<EstudiarTarjetas inscripcionId={1} servicio={servicio} />);

    await screen.findByText('Card 1 of 1');
    girar();
    fireEvent.click(screen.getByRole('button', { name: /Good/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('fallo de red');
    expect(screen.getByText('Card 1 of 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Good/ }));
    expect(await screen.findByText(/Next review in 6 days/)).toBeInTheDocument();

    terminarSesion();
    expect(await screen.findByText('Session completed')).toBeInTheDocument();
  });

  it('avisa si no llega la inscripción del estudiante', async () => {
    render(<EstudiarTarjetas servicio={crearServicio([])} />);
    expect(await screen.findByText(/Your course enrollment was not found/)).toBeInTheDocument();
  });
});