// cliente-api/coautoriaApi.test.js
// Coautorías/acepciones nuevas pendientes de revisión. API real y modo mock.
// Este módulo lee VITE_USE_MOCK al cargarse, por eso se simula con vi.stubEnv.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

async function cargar(usarMock) {
  vi.stubEnv('VITE_USE_MOCK', usarMock ? 'true' : 'false');
  vi.resetModules();
  vi.doMock('./httpClient', () => ({ apiRequest }));
  return import('./coautoriaApi');
}

describe('coautoriaApi', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('con API real', () => {
    it('listarCoautoriasPendientes hace GET /aportes/pending', async () => {
      const { listarCoautoriasPendientes } = await cargar(false);
      apiRequest.mockResolvedValue([{ id_aporte: 1 }]);

      const datos = await listarCoautoriasPendientes();

      expect(apiRequest).toHaveBeenCalledWith('/aportes/pending');
      expect(datos).toEqual([{ id_aporte: 1 }]);
    });

    it('aprobarCoautoria hace PATCH /aportes/:id/approve con las correcciones', async () => {
      const { aprobarCoautoria } = await cargar(false);
      apiRequest.mockResolvedValue({ ok: true });

      await aprobarCoautoria(4, { sentido: 'texto corregido' });

      expect(apiRequest).toHaveBeenCalledWith('/aportes/4/approve', {
        method: 'PATCH',
        body: JSON.stringify({ sentido: 'texto corregido' }),
      });
    });

    it('aprobarCoautoria sin correcciones envía un objeto vacío', async () => {
      const { aprobarCoautoria } = await cargar(false);
      apiRequest.mockResolvedValue({ ok: true });

      await aprobarCoautoria(4);

      expect(apiRequest).toHaveBeenCalledWith('/aportes/4/approve', {
        method: 'PATCH',
        body: '{}',
      });
    });
  });

  describe('con datos simulados (mock)', () => {
    it('lista las coautorías pendientes y deja de listar la que se aprueba, sin llamar al backend', async () => {
      const { aprobarCoautoria, listarCoautoriasPendientes } = await cargar(true);

      expect(await listarCoautoriasPendientes()).toHaveLength(2);

      const aprobada = await aprobarCoautoria(1, { sentido: 'corregido' });
      expect(aprobada).toMatchObject({ id_coautoria: 1, estado: 'aprobada', sentido: 'corregido' });

      const pendientes = await listarCoautoriasPendientes();
      expect(pendientes).toHaveLength(1);
      expect(pendientes[0].id_coautoria).toBe(2);
      expect(apiRequest).not.toHaveBeenCalled();
    });
  });
});
