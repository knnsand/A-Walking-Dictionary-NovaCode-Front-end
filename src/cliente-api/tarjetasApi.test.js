
 // cliente-api/tarjetasApi.test.js
 // HU-002 a HU-005: tarjetas (revisión de la docente, contexto, registro y duplicados).
 // Los módulos leen las variables de entorno al cargarse.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

async function cargar(usarMock, coautoriasHabilitadas = false) {
  vi.stubEnv('VITE_USE_MOCK', usarMock ? 'true' : 'false');
  vi.stubEnv(
    'VITE_ENABLE_COAUTHORSHIP',
    coautoriasHabilitadas ? 'true' : 'false'
  );

  vi.resetModules();

  vi.doMock('./httpClient', () => ({ apiRequest }));

  return import('./tarjetasApi');
}

describe('tarjetasApi con API real', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('listarTarjetasPendientes hace GET /cards/pending', async () => {
    const { listarTarjetasPendientes } = await cargar(false);

    apiRequest.mockResolvedValue([{ id_tarjeta: 1 }]);

    const datos = await listarTarjetasPendientes();

    expect(apiRequest).toHaveBeenCalledWith('/cards/pending');
    expect(datos).toEqual([{ id_tarjeta: 1 }]);
  });

  it('editarTarjeta hace PUT /cards/:id con las correcciones', async () => {
    const { editarTarjeta } = await cargar(false);

    apiRequest.mockResolvedValue({ id_tarjeta: 3 });

    await editarTarjeta(3, { traduccion: 'Doble' });

    expect(apiRequest).toHaveBeenCalledWith('/cards/3', {
      method: 'PUT',
      body: JSON.stringify({ traduccion: 'Doble' }),
    });
  });

  it('aprobarTarjeta hace PATCH /cards/:id/approve sin body', async () => {
    const { aprobarTarjeta } = await cargar(false);

    apiRequest.mockResolvedValue({ id_tarjeta: 3 });

    await aprobarTarjeta(3);

    expect(apiRequest).toHaveBeenCalledWith('/cards/3/approve', {
      method: 'PATCH',
    });
  });

  it('rechazarTarjeta hace PATCH /cards/:id/reject', async () => {
    const { rechazarTarjeta } = await cargar(false);

    apiRequest.mockResolvedValue({ id_tarjeta: 3 });

    await rechazarTarjeta(3);

    expect(apiRequest).toHaveBeenCalledWith('/cards/3/reject', {
      method: 'PATCH',
    });
  });

  it('actualizarContextoTarjeta hace PUT /cards/:id/context con registro y variante', async () => {
    const { actualizarContextoTarjeta } = await cargar(false);

    apiRequest.mockResolvedValue({ id_tarjeta: 3 });

    await actualizarContextoTarjeta(3, {
      registro: 'formal',
      variante_regional: 'britanico',
    });

    expect(apiRequest).toHaveBeenCalledWith('/cards/3/context', {
      method: 'PUT',
      body: JSON.stringify({
        registro: 'formal',
        variante_regional: 'britanico',
      }),
    });
  });

  it('listarTarjetasAprobadas hace GET /cards/approved', async () => {
    const { listarTarjetasAprobadas } = await cargar(false);

    apiRequest.mockResolvedValue([]);

    await listarTarjetasAprobadas();

    expect(apiRequest).toHaveBeenCalledWith('/cards/approved');
  });

  it('registrarTarjeta hace POST /decks/:idMazo/cards con los datos de la tarjeta', async () => {
    const { registrarTarjeta } = await cargar(false);

    const datos = {
      palabra: 'foil',
      traduccion: 'contrapunto',
      definicion: 'd',
      ejemplo: 'e',
    };

    apiRequest.mockResolvedValue({ resultado: 'creada' });

    const respuesta = await registrarTarjeta(2, datos);

    expect(apiRequest).toHaveBeenCalledWith('/decks/2/cards', {
      method: 'POST',
      body: JSON.stringify(datos),
    });

    expect(respuesta).toEqual({ resultado: 'creada' });
  });

  it('verificarDuplicado hace POST /cards/check-duplicate con mazo_id, palabra, definición y ejemplo', async () => {
    const { verificarDuplicado } = await cargar(false);

    apiRequest.mockResolvedValue({ duplicado: false });

    await verificarDuplicado(
      2,
      'foil',
      'una definición',
      'un ejemplo'
    );

    expect(apiRequest).toHaveBeenCalledWith(
      '/cards/check-duplicate',
      {
        method: 'POST',
        body: JSON.stringify({
          mazo_id: 2,
          palabra: 'foil',
          definicion: 'una definición',
          ejemplo: 'un ejemplo',
        }),
      }
    );
  });

  it('propaga el error del backend', async () => {
    const { aprobarTarjeta } = await cargar(false);

    apiRequest.mockRejectedValue(
      new Error('La tarjeta no está pendiente')
    );

    await expect(
      aprobarTarjeta(3)
    ).rejects.toThrow('La tarjeta no está pendiente');
  });
});

describe('tarjetasApi con datos simulados (mock)', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('lista las tarjetas pendientes con sus aportes, sin llamar al backend', async () => {
    const { listarTarjetasPendientes } = await cargar(true);

    const pendientes = await listarTarjetasPendientes();

    expect(pendientes).toHaveLength(2);
    expect(pendientes[0].aportes.length).toBeGreaterThan(0);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('editar y aprobar una tarjeta la mueve de pendientes a aprobadas', async () => {
    const {
      aprobarTarjeta,
      editarTarjeta,
      listarTarjetasAprobadas,
      listarTarjetasPendientes,
    } = await cargar(true);

    expect(await listarTarjetasAprobadas()).toHaveLength(0);

    const editada = await editarTarjeta(1, {
      traduccion: 'Doble corregido',
    });

    expect(editada.traduccion).toBe('Doble corregido');

    const aprobada = await aprobarTarjeta(1);

    expect(aprobada.estado).toBe('revisado_docente');

    expect(await listarTarjetasPendientes()).toHaveLength(1);
    expect(await listarTarjetasAprobadas()).toHaveLength(1);
  });

  it('rechazarTarjeta y actualizarContextoTarjeta actualizan la tarjeta', async () => {
    const {
      actualizarContextoTarjeta,
      listarTarjetasPendientes,
      rechazarTarjeta,
    } = await cargar(true);

    const contexto = await actualizarContextoTarjeta(1, {
      registro: 'formal',
    });

    expect(contexto.registro).toBe('formal');

    expect(await rechazarTarjeta(2)).toEqual({
      id_tarjeta: 2,
      estado: 'rechazada',
    });

    expect(await listarTarjetasPendientes()).toHaveLength(1);
  });

  it('registrarTarjeta crea la tarjeta la primera vez', async () => {
    const { registrarTarjeta } = await cargar(true);

    const respuesta = await registrarTarjeta(5, {
      palabra: ' Foil ',
      traduccion: 'contrapunto',
      definicion: 'Contrasta con otro personaje.',
      ejemplo: 'Helen Burns.',
    });

    expect(respuesta.resultado).toBe('creada');

    expect(respuesta.tarjeta).toMatchObject({
      mazo_id: 5,
      palabra: 'foil',
    });

    expect(respuesta.aporte.tipo_aporte).toBe('creada');
  });

  it('registrarTarjeta sin ejemplo guarda el ejemplo vacío', async () => {
    const { registrarTarjeta } = await cargar(true);

    const respuesta = await registrarTarjeta(5, {
      palabra: 'hubris',
      traduccion: 'desmesura',
      definicion: 'Orgullo excesivo.',
    });

    expect(respuesta.tarjeta.ejemplo).toBe('');
    expect(respuesta.aporte.ejemplo_aportado).toBeNull();
  });

  // ACTUALIZADA: con coautorías desactivadas no se admiten duplicados.
  it('rechaza registrar una palabra repetida cuando las coautorías están desactivadas', async () => {
    const { registrarTarjeta } = await cargar(true, false);

    const base = {
      palabra: 'foil',
      traduccion: 'contrapunto',
      definicion: 'Contrasta con otro personaje.',
      ejemplo: 'Helen Burns.',
    };

    await registrarTarjeta(5, base);

    await expect(
      registrarTarjeta(5, {
        ...base,
        definicion: ' CONTRASTA con otro personaje. ',
      })
    ).rejects.toThrow(
      'This word has already been submitted. Please choose a different word.'
    );

    await expect(
      registrarTarjeta(5, {
        ...base,
        definicion: 'Otro significado distinto.',
      })
    ).rejects.toThrow(
      'This word has already been submitted. Please choose a different word.'
    );

    expect(apiRequest).not.toHaveBeenCalled();
  });

  // ACTUALIZADA: la verificación detecta una palabra existente
  // sin ofrecer coautoría ni una acepción adicional.
  it('verificarDuplicado detecta palabras existentes con coautorías desactivadas', async () => {
    const {
      registrarTarjeta,
      verificarDuplicado,
    } = await cargar(true, false);

    const base = {
      palabra: 'foil',
      traduccion: 'contrapunto',
      definicion: 'Contrasta con otro personaje.',
      ejemplo: 'Helen Burns.',
    };

    expect(
      await verificarDuplicado(
        5,
        'foil',
        base.definicion,
        base.ejemplo
      )
    ).toEqual({
      duplicado: false,
      resultado: 'creada',
      tarjeta: null,
    });

    await registrarTarjeta(5, base);

    const igual = await verificarDuplicado(
      5,
      'FOIL',
      base.definicion,
      base.ejemplo
    );

    const distinta = await verificarDuplicado(
      5,
      'foil',
      'Otra definición',
      base.ejemplo
    );

    expect(igual).toMatchObject({
      duplicado: true,
      resultado: 'palabra_existente',
    });

    expect(distinta).toMatchObject({
      duplicado: true,
      resultado: 'palabra_existente',
    });

    expect(apiRequest).not.toHaveBeenCalled();
  });

  // NUEVA: conservamos la prueba del comportamiento original
  // cuando se habilitan explícitamente las coautorías.
  it('permite coautoría y acepción nueva cuando las coautorías están habilitadas', async () => {
    const { registrarTarjeta } = await cargar(true, true);

    const base = {
      palabra: 'foil',
      traduccion: 'contrapunto',
      definicion: 'Contrasta con otro personaje.',
      ejemplo: 'Helen Burns.',
    };

    await registrarTarjeta(5, base);

    const coautoria = await registrarTarjeta(5, {
      ...base,
      definicion: ' CONTRASTA con otro personaje. ',
    });

    const acepcion = await registrarTarjeta(5, {
      ...base,
      definicion: 'Otro significado distinto.',
    });

    expect(coautoria.resultado).toBe('coautoria');
    expect(acepcion.resultado).toBe('acepcion_nueva');
    expect(apiRequest).not.toHaveBeenCalled();
  });

  // NUEVA: verificamos que la detección original de duplicados
  // continúa disponible al habilitar la funcionalidad.
  it('verificarDuplicado distingue coautoría y acepción nueva cuando están habilitadas', async () => {
    const {
      registrarTarjeta,
      verificarDuplicado,
    } = await cargar(true, true);

    const base = {
      palabra: 'foil',
      traduccion: 'contrapunto',
      definicion: 'Contrasta con otro personaje.',
      ejemplo: 'Helen Burns.',
    };

    await registrarTarjeta(5, base);

    const igual = await verificarDuplicado(
      5,
      'FOIL',
      base.definicion,
      base.ejemplo
    );

    const distinta = await verificarDuplicado(
      5,
      'foil',
      'Otra definición',
      base.ejemplo
    );

    expect(igual).toMatchObject({
      duplicado: true,
      resultado: 'coautoria',
    });

    expect(distinta).toMatchObject({
      duplicado: true,
      resultado: 'acepcion_nueva',
    });

    expect(apiRequest).not.toHaveBeenCalled();
  });
});
