// vistas/estudiante/estudiar-tarjetas/EstudiarTarjetas.test.jsx
// HU-010: flujo de estudio con flashcards y repetición espaciada.

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EstudiarTarjetas } from './EstudiarTarjetas';

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

const girar = () => fireEvent.click(screen.getByRole('button', { name: 'Girar tarjeta' }));
const pulsarTecla = (key) => fireEvent.keyDown(document.body, { key });

describe('EstudiarTarjetas', () => {
  it('muestra la palabra al frente y deshabilita la valoración hasta girar la tarjeta', async () => {
    const servicio = crearServicio([tarjeta(1, 'anachronism')]);
    render(<EstudiarTarjetas inscripcionId={1} servicio={servicio} />);

    await screen.findByText('Tarjeta 1 de 1');
    expect(screen.getByRole('button', { name: /Buena/ })).toBeDisabled();

    girar();
    expect(screen.getByRole('button', { name: /Buena/ })).toBeEnabled();
    expect(screen.getByText('tr-anachronism')).toBeInTheDocument();
    expect(screen.getByText('def-anachronism')).toBeInTheDocument();
  });

  it('CA-4.1.3: "Repetir" reintroduce la tarjeta al final y luego muestra el resumen', async () => {
    const servicio = crearServicio([tarjeta(1, 'uno'), tarjeta(2, 'dos')]);
    render(<EstudiarTarjetas inscripcionId={7} servicio={servicio} />);

    await screen.findByText('Tarjeta 1 de 2');

    // Tarjeta 1: Repetir -> pasa al final de la cola
    girar();
    fireEvent.click(screen.getByRole('button', { name: /Repetir/ }));
    expect(await screen.findByText(/volverá al final de la sesión/)).toBeInTheDocument();
    expect(screen.getByText('Tarjeta 1 de 2')).toBeInTheDocument();

    // Tarjeta 2: Buena (con teclado)
    pulsarTecla(' ');
    pulsarTecla('3');
    expect(await screen.findByText('Tarjeta 2 de 2')).toBeInTheDocument();
    expect(screen.getByText(/Próximo repaso en 6 días/)).toBeInTheDocument();
    expect(screen.getByText('Otra vez')).toBeInTheDocument();

    // Tarjeta 1 de nuevo: Fácil (con teclado)
    pulsarTecla(' ');
    pulsarTecla('4');
    expect(await screen.findByText('Sesión completada')).toBeInTheDocument();
    expect(screen.getByText(/Repasaste 2 tarjetas/)).toBeInTheDocument();

    // CA-4.1.2: se envía el texto exacto que valida el back, con la tarjeta y la inscripción
    expect(servicio.valoraciones).toEqual([
      [7, 1, 'Repetir'],
      [7, 2, 'Buena'],
      [7, 1, 'Fácil'],
    ]);
  });

  it('no valora con las teclas 1-4 si la respuesta todavía no se ha visto', async () => {
    const servicio = crearServicio([tarjeta(1, 'uno')]);
    render(<EstudiarTarjetas inscripcionId={1} servicio={servicio} />);

    await screen.findByText('Tarjeta 1 de 1');
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

    await screen.findByText('Tarjeta 1 de 1');
    expect(screen.getByText('/ˈbɪldʊŋz/')).toBeInTheDocument();
    expect(screen.getAllByText('Noun').length).toBeGreaterThan(0);
    expect(screen.getByText('Academic')).toBeInTheDocument();
    expect(screen.getByText('Introduction to the Victorian Era')).toBeInTheDocument();
    expect(screen.getByText('Semana 1')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay tarjetas por repasar', async () => {
    render(<EstudiarTarjetas inscripcionId={1} servicio={crearServicio([])} />);
    expect(await screen.findByText(/No tienes tarjetas para repasar/)).toBeInTheDocument();
  });

  it('muestra el error de carga y permite reintentar', async () => {
    const servicio = crearServicio([tarjeta(1, 'uno')], { fallosAlCargar: 1 });
    render(<EstudiarTarjetas inscripcionId={9} servicio={servicio} />);

    expect(await screen.findByText('Inscripción no encontrada')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Tarjeta 1 de 1')).toBeInTheDocument();
  });

  it('si falla el guardado no avanza de tarjeta y permite reintentar', async () => {
    const servicio = crearServicio([tarjeta(1, 'uno')], { fallosAlGuardar: 1 });
    render(<EstudiarTarjetas inscripcionId={1} servicio={servicio} />);

    await screen.findByText('Tarjeta 1 de 1');
    girar();
    fireEvent.click(screen.getByRole('button', { name: /Buena/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('fallo de red');
    expect(screen.getByText('Tarjeta 1 de 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Buena/ }));
    expect(await screen.findByText('Sesión completada')).toBeInTheDocument();
  });

  it('avisa si no llega la inscripción del estudiante', async () => {
    render(<EstudiarTarjetas servicio={crearServicio([])} />);
    expect(await screen.findByText(/No se encontró tu inscripción/)).toBeInTheDocument();
  });
});
