// vistas/docente/quices/generarQuiz.validation.test.js
// HU-3.1: validaciones del formulario de generación de quiz (docs/contrato-quiz.md).

import { describe, it, expect } from 'vitest';
import { validarFormularioQuiz } from './generarQuiz.validation';
import { ERRORES_VALIDACION } from './generarQuiz.constants';

// Hora de referencia fija (hora local, igual que los campos datetime-local).
const AHORA = new Date('2026-10-07T12:00');

function datosValidos() {
  return {
    cursoId: '1',
    mazosSeleccionados: [5, 6],
    form: {
      titulo: 'Quiz acumulativo semanas 1 a 4',
      fecha_apertura: '2026-10-12T15:00',
      fecha_cierre: '2026-10-14T15:00',
      tiempo_limite_min: '30',
      cantidad_preguntas: '',
    },
  };
}

// Valida los datos base aplicando cambios puntuales al formulario o a la raíz.
function validar(cambiosForm = {}, cambiosRaiz = {}) {
  const base = datosValidos();
  return validarFormularioQuiz(
    { ...base, ...cambiosRaiz, form: { ...base.form, ...cambiosForm } },
    AHORA
  );
}

describe('validarFormularioQuiz', () => {
  it('no devuelve errores cuando todos los datos son válidos', () => {
    expect(validar()).toEqual({});
  });

  it('exige seleccionar un curso', () => {
    expect(validar({}, { cursoId: '' }).curso).toBe(ERRORES_VALIDACION.curso);
  });

  it('exige al menos un mazo seleccionado', () => {
    expect(validar({}, { mazosSeleccionados: [] }).mazos).toBe(ERRORES_VALIDACION.mazos);
  });

  describe('título', () => {
    it('rechaza un título vacío o solo con espacios', () => {
      expect(validar({ titulo: '' }).titulo).toBe(ERRORES_VALIDACION.tituloVacio);
      expect(validar({ titulo: '   ' }).titulo).toBe(ERRORES_VALIDACION.tituloVacio);
    });

    it('acepta un título de exactamente 200 caracteres y rechaza uno de 201', () => {
      expect(validar({ titulo: 'a'.repeat(200) }).titulo).toBeUndefined();
      expect(validar({ titulo: 'a'.repeat(201) }).titulo).toBe(ERRORES_VALIDACION.tituloLargo);
    });
  });

  describe('fecha de apertura', () => {
    it('exige indicar la apertura', () => {
      expect(validar({ fecha_apertura: '' }).fecha_apertura).toBe(ERRORES_VALIDACION.aperturaVacia);
    });

    it('rechaza una apertura anterior o igual a la hora actual', () => {
      expect(validar({ fecha_apertura: '2026-10-06T10:00' }).fecha_apertura).toBe(
        ERRORES_VALIDACION.aperturaPasada
      );
      expect(validar({ fecha_apertura: '2026-10-07T12:00' }).fecha_apertura).toBe(
        ERRORES_VALIDACION.aperturaPasada
      );
    });
  });

  describe('fecha de cierre', () => {
    it('exige indicar el cierre', () => {
      expect(validar({ fecha_cierre: '' }).fecha_cierre).toBe(ERRORES_VALIDACION.cierreVacio);
    });

    it('rechaza un cierre igual o anterior a la apertura', () => {
      expect(validar({ fecha_cierre: '2026-10-12T15:00' }).fecha_cierre).toBe(
        ERRORES_VALIDACION.cierreAnterior
      );
      expect(validar({ fecha_cierre: '2026-10-11T15:00' }).fecha_cierre).toBe(
        ERRORES_VALIDACION.cierreAnterior
      );
    });
  });

  describe('tiempo límite', () => {
    it('rechaza vacío, cero, negativos, decimales y texto', () => {
      for (const valor of ['', '0', '-5', '2.5', 'abc']) {
        expect(validar({ tiempo_limite_min: valor }).tiempo_limite_min).toBe(
          ERRORES_VALIDACION.tiempoInvalido
        );
      }
    });

    it('acepta un entero mayor o igual a 1', () => {
      expect(validar({ tiempo_limite_min: '1' }).tiempo_limite_min).toBeUndefined();
      expect(validar({ tiempo_limite_min: '45' }).tiempo_limite_min).toBeUndefined();
    });
  });

  describe('ventana entre apertura y cierre', () => {
    it('rechaza una ventana menor que el tiempo límite', () => {
      const errores = validar({
        fecha_apertura: '2026-10-12T15:00',
        fecha_cierre: '2026-10-12T15:10',
        tiempo_limite_min: '30',
      });
      expect(errores.fecha_cierre).toBe(ERRORES_VALIDACION.ventanaCorta);
    });

    it('acepta una ventana exactamente igual al tiempo límite', () => {
      const errores = validar({
        fecha_apertura: '2026-10-12T15:00',
        fecha_cierre: '2026-10-12T15:30',
        tiempo_limite_min: '30',
      });
      expect(errores).toEqual({});
    });

    it('no reemplaza el error de cierre anterior a la apertura por el de ventana corta', () => {
      const errores = validar({ fecha_cierre: '2026-10-11T15:00', tiempo_limite_min: '30' });
      expect(errores.fecha_cierre).toBe(ERRORES_VALIDACION.cierreAnterior);
    });
  });

  describe('cantidad de preguntas (opcional)', () => {
    it('acepta el campo vacío', () => {
      expect(validar({ cantidad_preguntas: '' }).cantidad_preguntas).toBeUndefined();
    });

    it('rechaza cero, decimales y texto cuando se escribe algo', () => {
      for (const valor of ['0', '1.5', 'x', '-3']) {
        expect(validar({ cantidad_preguntas: valor }).cantidad_preguntas).toBe(
          ERRORES_VALIDACION.cantidadInvalida
        );
      }
    });

    it('acepta un entero mayor o igual a 1', () => {
      expect(validar({ cantidad_preguntas: '10' }).cantidad_preguntas).toBeUndefined();
    });
  });

  it('reporta todos los errores a la vez cuando el formulario está vacío', () => {
    const errores = validarFormularioQuiz(
      {
        cursoId: '',
        mazosSeleccionados: [],
        form: {
          titulo: '',
          fecha_apertura: '',
          fecha_cierre: '',
          tiempo_limite_min: '',
          cantidad_preguntas: '',
        },
      },
      AHORA
    );

    expect(Object.keys(errores).sort()).toEqual(
      ['curso', 'fecha_apertura', 'fecha_cierre', 'mazos', 'tiempo_limite_min', 'titulo'].sort()
    );
  });
});