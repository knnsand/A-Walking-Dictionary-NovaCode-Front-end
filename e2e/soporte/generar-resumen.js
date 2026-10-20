// Genera el resumen con métricas de una ejecución de las pruebas E2E.
//
// Lee los resultados de Playwright (reporter "json", ver playwright.config.js) y la lista de
// criterios de aceptación en alcance (criterios.json de las pruebas funcionales del backend, para
// que ambas suites midan contra la misma lista), saca el CA del nombre de cada prueba
// ("CA-1.2.3 ...") y calcula: tasa de éxito, cobertura de CA, pruebas inestables, duración,
// resultados por épica e HU, fallas con sus capturas y la matriz de trazabilidad.
//
// Salidas:
//   - reportes-e2e/resumen.html: tablero autocontenido (va en el artefacto de GitHub Actions).
//   - En GitHub Actions, el mismo resumen en Markdown en la página de la ejecución ($GITHUB_STEP_SUMMARY).
//
// Uso: npm run test:e2e:resumen  (después de npm run test:e2e)
//   Opcionales: --resultados <json> --criterios <json> --salida <html>
// No hace fallar el job: si no hay resultados, lo dice en el resumen.

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BACK_REPO } from './entorno.js';

const raizFront = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = Object.fromEntries(
  process.argv.slice(2).reduce((pares, valor, i, todos) => (i % 2 === 0 ? [...pares, [valor.replace(/^--/, ''), todos[i + 1]]] : pares), [])
);
const RESULTADOS = args.resultados || path.join(raizFront, 'reportes-e2e/resultados.json');
const CRITERIOS = args.criterios || path.join(BACK_REPO, 'backend/pruebas-funcionales/criterios.json');
const SALIDA = args.salida || path.join(raizFront, 'reportes-e2e/resumen.html');

const ESTADO = { PASA: 'pasa', FALLA: 'falla', CONOCIDO: 'error conocido', PENDIENTE: 'pendiente' };
const RE_CA = /CA-\d+\.\d+\.\d+/g;
const RE_HU = /HU-\d+\.\d+/;

/** Épicas del backlog (CLAUDE.md del backend). */
const EPICAS = {
  'HE-01': 'Gestión Curricular de Mazos y Vocabulario',
  'HE-02': 'Supervisión y Curaduría Pedagógica Docente',
  'HE-03': 'Evaluación Automatizada y Exportación',
  'HE-04': 'Repaso Adaptativo y Enriquecimiento Léxico',
  'HE-05': 'Gestión de Usuarios, Perfiles e Inscripción',
};

// Códigos de color de la terminal (ESC[...m) que traen los mensajes de error.
const COLOR_TERMINAL = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const limpiar = (texto) => String(texto ?? '').replace(COLOR_TERMINAL, '').replace(/\s+/g, ' ').trim();
const html = (texto) =>
  String(texto ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const md = (texto) => limpiar(texto).replace(/\|/g, '\\|');
const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1).replace('.', ',')} %` : '—');
const segundos = (ms) => (ms == null ? '—' : `${(ms / 1000).toFixed(1).replace('.', ',')} s`);
const ordenNatural = (a, b) => a.localeCompare(b, 'es', { numeric: true });

/** HU de la prueba: del primer CA del nombre, o del título del grupo (test.describe). */
function huDe(nombre, contexto) {
  const ca = (nombre.match(RE_CA) || [])[0];
  if (ca) return `HU-${ca.slice(3).split('.').slice(0, 2).join('.')}`;
  return (nombre.match(RE_HU) || contexto.match(RE_HU) || ['Otras'])[0];
}

/** Playwright (reporter "json"): suites anidadas con specs[].tests[].results[]. */
function desdePlaywright(json) {
  const carpetaReporte = path.dirname(SALIDA);
  const pruebas = [];
  const recorrer = (suite, titulos) => {
    for (const spec of suite.specs || []) {
      for (const t of spec.tests) {
        const ultimo = t.results[t.results.length - 1];
        const conocido = t.expectedStatus === 'failed';
        let estado;
        let error = ultimo?.error?.message;
        if (t.status === 'skipped') estado = ESTADO.PENDIENTE;
        else if (t.status === 'expected' && conocido) estado = ESTADO.CONOCIDO;
        else if (t.status === 'expected' || t.status === 'flaky') estado = ESTADO.PASA;
        else {
          estado = ESTADO.FALLA;
          if (conocido && !error) error = 'Está marcada como error conocido (test.fail) y ahora PASA: el defecto se corrigió, hay que quitar el test.fail.';
        }
        const contexto = titulos.join(' › ');
        const hu = huDe(spec.title, contexto);
        // Capturas y traces de la última ejecución, con rutas relativas al resumen para que los
        // enlaces funcionen dentro del artefacto descargado.
        const adjuntos = (ultimo?.attachments || [])
          .filter((a) => a.path)
          .map((a) => ({ nombre: a.name, ruta: encodeURI(path.relative(carpetaReporte, a.path).split(path.sep).join('/')) }));
        pruebas.push({
          nombre: spec.title,
          contexto,
          archivo: spec.file || '',
          hu,
          epica: hu.startsWith('HU-') ? `HE-${hu.slice(3).split('.')[0].padStart(2, '0')}` : 'Otras',
          estado,
          inestable: t.status === 'flaky',
          intentos: t.results.length,
          duracionMs: t.results.reduce((total, r) => total + (r.duration || 0), 0),
          error,
          // test.fail / test.fixme dentro de la prueba quedan en las anotaciones del test o del resultado
          motivo: [...(t.annotations || []), ...(ultimo?.annotations || [])].find((a) => ['fail', 'fixme', 'skip'].includes(a.type))?.description,
          adjuntos,
        });
      }
    }
    for (const hija of suite.suites || []) recorrer(hija, hija.title.endsWith('.js') ? titulos : [...titulos, hija.title]);
  };
  (json.suites || []).forEach((s) => recorrer(s, []));
  return {
    pruebas,
    duracionMs: json.stats?.duration ?? null,
    inicio: json.stats?.startTime ?? null,
    erroresGlobales: (json.errors || []).map((e) => e.message),
  };
}

function leerJson(archivo) {
  if (!archivo || !existsSync(archivo)) return null;
  try {
    return JSON.parse(readFileSync(archivo, 'utf8').replace(new RegExp('^' + String.fromCharCode(0xfeff)), ''));
  } catch (error) {
    console.error(`No se pudo leer ${archivo}: ${error.message}`);
    return null;
  }
}

/** Estado de un CA según sus pruebas: falla > error conocido > cubierto > pendiente > sin prueba. */
function estadoCa(estados = []) {
  if (estados.includes(ESTADO.FALLA)) return 'falla';
  if (estados.includes(ESTADO.CONOCIDO)) return 'error conocido';
  if (estados.includes(ESTADO.PASA)) return 'cubierto';
  if (estados.includes(ESTADO.PENDIENTE)) return 'pendiente';
  return 'sin prueba';
}

function contar(pruebas) {
  const c = { pasan: 0, fallan: 0, conocidos: 0, pendientes: 0, inestables: 0 };
  for (const p of pruebas) {
    if (p.estado === ESTADO.PASA) c.pasan += 1;
    if (p.estado === ESTADO.FALLA) c.fallan += 1;
    if (p.estado === ESTADO.CONOCIDO) c.conocidos += 1;
    if (p.estado === ESTADO.PENDIENTE) c.pendientes += 1;
    if (p.inestable) c.inestables += 1;
  }
  c.ejecutadas = c.pasan + c.fallan + c.conocidos;
  c.total = c.ejecutadas + c.pendientes;
  return c;
}

function agrupar(pruebas, clave) {
  const grupos = new Map();
  for (const p of pruebas) grupos.set(p[clave], [...(grupos.get(p[clave]) || []), p]);
  return [...grupos.keys()].sort(ordenNatural).map((k) => ({ clave: k, ...contar(grupos.get(k)) }));
}

function calcular() {
  const json = leerJson(RESULTADOS);
  if (!json) return null;
  const { pruebas, duracionMs, inicio, erroresGlobales } = desdePlaywright(json);
  const totales = contar(pruebas);

  // Cobertura de CA: cruza los CA de los nombres de las pruebas con los CA en alcance
  const criterios = leerJson(CRITERIOS) || [];
  const porCa = new Map(criterios.map((c) => [c.ca, []]));
  for (const p of pruebas) {
    for (const ca of new Set(p.nombre.match(RE_CA) || [])) porCa.get(ca)?.push(p.estado);
  }
  const matriz = criterios.map((c) => ({ ...c, estado: estadoCa(porCa.get(c.ca)) }));
  const probados = matriz.filter((c) => ['cubierto', 'error conocido', 'falla'].includes(c.estado)).length;
  const aprobados = matriz.filter((c) => c.estado === 'cubierto').length;

  const ejecutadas = pruebas.filter((p) => p.estado !== ESTADO.PENDIENTE);
  const duracionPruebas = ejecutadas.reduce((total, p) => total + p.duracionMs, 0);

  return {
    pruebas,
    totales,
    duracionMs,
    inicio,
    erroresGlobales,
    criterios,
    matriz,
    probados,
    aprobados,
    promedioMs: ejecutadas.length ? duracionPruebas / ejecutadas.length : null,
    lentas: [...ejecutadas].sort((a, b) => b.duracionMs - a.duracionMs).slice(0, 5),
    porEpica: agrupar(pruebas, 'epica'),
    porHu: agrupar(pruebas, 'hu'),
  };
}

function datosEjecucion() {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return { origen: 'Ejecución local' };
  return {
    origen: 'GitHub Actions',
    rama: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME,
    commit: (process.env.GITHUB_SHA || '').slice(0, 7),
    enlace: `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  };
}

// ---------------------------------------------------------------------------------------------
// Markdown (página de la ejecución en GitHub Actions)
// ---------------------------------------------------------------------------------------------

function generarMarkdown(m) {
  const lineas = ['## Pruebas E2E (front)', ''];
  const ej = datosEjecucion();
  if (ej.enlace) lineas.push(`Rama \`${ej.rama}\` · commit \`${ej.commit}\` · [ejecución](${ej.enlace}) · ${new Date().toISOString().slice(0, 10)}`, '');
  if (!m) {
    lineas.push('> ⚠️ No se encontraron resultados: la suite no llegó a ejecutarse. Revisa los pasos anteriores del job.', '');
    return lineas.join('\n');
  }

  const t = m.totales;
  if (m.erroresGlobales.length) lineas.push(`> ❌ Error antes de ejecutar las pruebas: ${md(m.erroresGlobales[0]).slice(0, 300)}`, '');
  lineas.push(
    t.fallan === 0 && !m.erroresGlobales.length ? '**✅ Todas las pruebas ejecutadas pasan o son errores conocidos.**' : `**❌ ${t.fallan} prueba(s) fallan.**`,
    '',
    '| Tasa de éxito | Cobertura de CA | CA aprobados | Inestables | Duración | Promedio por prueba |',
    '|---|---|---|---|---|---|',
    `| **${pct(t.pasan, t.ejecutadas)}** | **${m.probados} / ${m.criterios.length} (${pct(m.probados, m.criterios.length)})** | ${m.aprobados} / ${m.criterios.length} (${pct(m.aprobados, m.criterios.length)}) | ${t.inestables} (${pct(t.inestables, t.ejecutadas)}) | ${segundos(m.duracionMs)} | ${segundos(m.promedioMs)} |`,
    '',
    '| Ejecutadas | Pasan | Fallan | Errores conocidos | Pendientes |',
    '|---|---|---|---|---|',
    `| ${t.ejecutadas} | ${t.pasan} | ${t.fallan} | ${t.conocidos} | ${t.pendientes} |`,
    ''
  );

  if (t.fallan > 0) {
    lineas.push('### Pruebas que fallan', '', '| Prueba | Error |', '|---|---|');
    for (const p of m.pruebas.filter((x) => x.estado === ESTADO.FALLA)) lineas.push(`| ${md(p.nombre)} | ${md(p.error).slice(0, 200)} |`);
    lineas.push('');
  }
  if (t.inestables > 0) {
    lineas.push('### Pruebas inestables (pasaron al reintentar)', '');
    for (const p of m.pruebas.filter((x) => x.inestable)) lineas.push(`- ${md(p.nombre)} — ${p.intentos} intentos`);
    lineas.push('');
  }

  lineas.push('### Por épica', '', '| Épica | Pasan | Fallan | Errores conocidos | Pendientes | Tasa de éxito |', '|---|---|---|---|---|---|');
  for (const e of m.porEpica) lineas.push(`| ${e.clave} ${EPICAS[e.clave] || ''} | ${e.pasan} | ${e.fallan} | ${e.conocidos} | ${e.pendientes} | ${pct(e.pasan, e.ejecutadas)} |`);
  lineas.push('');

  const sinCubrir = m.matriz.filter((c) => ['pendiente', 'sin prueba'].includes(c.estado));
  if (sinCubrir.length) {
    lineas.push('<details><summary>Criterios sin prueba E2E ejecutada (' + sinCubrir.length + ')</summary>', '');
    for (const c of sinCubrir) lineas.push(`- **${c.ca}** ${c.criterio} — ${c.estado}`);
    lineas.push('', '</details>', '');
  }
  lineas.push('<sub>Tablero completo (por HU, pruebas más lentas, capturas y matriz de trazabilidad): artefacto `reporte-pruebas-e2e` → `resumen.html`.</sub>', '');
  return lineas.join('\n');
}

// ---------------------------------------------------------------------------------------------
// HTML (artefacto)
// ---------------------------------------------------------------------------------------------

const ETIQUETA = {
  [ESTADO.PASA]: ['ok', 'Pasa'],
  [ESTADO.FALLA]: ['mal', 'Falla'],
  [ESTADO.CONOCIDO]: ['aviso', 'Error conocido'],
  [ESTADO.PENDIENTE]: ['neutro', 'Pendiente'],
  cubierto: ['ok', 'Cubierto'],
  falla: ['mal', 'Falla'],
  'error conocido': ['aviso', 'Error conocido'],
  pendiente: ['neutro', 'Pendiente'],
  'sin prueba': ['vacio', 'Sin prueba'],
};
const chip = (estado) => {
  const [clase, texto] = ETIQUETA[estado] || ['neutro', estado];
  return `<span class="chip ${clase}">${html(texto)}</span>`;
};

/** Barra apilada pasan / errores conocidos / fallan / pendientes. */
function barra(c) {
  const partes = [
    ['ok', c.pasan, 'pasan'],
    ['aviso', c.conocidos, 'errores conocidos'],
    ['mal', c.fallan, 'fallan'],
    ['neutro', c.pendientes, 'pendientes'],
  ].filter(([, n]) => n > 0);
  if (!c.total) return '';
  return `<div class="barra" role="img" aria-label="${html(partes.map(([, n, t]) => `${n} ${t}`).join(', '))}">${partes
    .map(([clase, n, t]) => `<span class="${clase}" style="width:${(n / c.total) * 100}%" title="${n} ${t}"></span>`)
    .join('')}</div>`;
}

function tablaGrupos(grupos, titulo, nombreDe) {
  return `<table><thead><tr><th>${titulo}</th><th class="num">Pasan</th><th class="num">Fallan</th><th class="num">Err. conocidos</th><th class="num">Pendientes</th><th>Tasa de éxito</th></tr></thead><tbody>${grupos
    .map(
      (g) =>
        `<tr><td>${nombreDe(g.clave)}</td><td class="num">${g.pasan}</td><td class="num">${g.fallan}</td><td class="num">${g.conocidos}</td><td class="num">${g.pendientes}</td><td><div class="tasa"><b>${pct(g.pasan, g.ejecutadas)}</b>${barra(g)}</div></td></tr>`
    )
    .join('')}</tbody></table>`;
}

function kpi(titulo, valor, detalle, tono = '') {
  return `<div class="kpi ${tono}"><span class="kpi-titulo">${html(titulo)}</span><span class="kpi-valor">${html(valor)}</span><span class="kpi-detalle">${html(detalle)}</span></div>`;
}

function generarHtml(m) {
  const ej = datosEjecucion();
  const fecha = new Date(m?.inicio || Date.now()).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short' });
  const meta = [ej.origen, fecha, ej.rama && `rama <code>${html(ej.rama)}</code>`, ej.commit && `commit <code>${html(ej.commit)}</code>`, ej.enlace && `<a href="${html(ej.enlace)}">ver ejecución</a>`]
    .filter(Boolean)
    .join(' · ');

  let cuerpo;
  if (!m) {
    cuerpo = `<div class="veredicto mal">No se encontraron resultados (<code>${html(path.relative(raizFront, RESULTADOS))}</code>): la suite no llegó a ejecutarse. Revisa los pasos anteriores del job.</div>`;
  } else {
    const t = m.totales;
    const fallas = m.pruebas.filter((p) => p.estado === ESTADO.FALLA);
    const inestables = m.pruebas.filter((p) => p.inestable);
    const deuda = m.pruebas.filter((p) => p.estado === ESTADO.CONOCIDO || p.estado === ESTADO.PENDIENTE);
    const exito = t.ejecutadas ? t.pasan / t.ejecutadas : 0;
    const veredicto =
      m.erroresGlobales.length
        ? `<div class="veredicto mal">Error antes de ejecutar las pruebas: ${html(limpiar(m.erroresGlobales[0]).slice(0, 400))}</div>`
        : t.fallan === 0
          ? `<div class="veredicto ok">Todas las pruebas ejecutadas pasan o son errores conocidos.</div>`
          : `<div class="veredicto mal">${t.fallan} prueba(s) fallan. Detalle en «Pruebas que fallan».</div>`;

    cuerpo = `${veredicto}
<section class="kpis">
  ${kpi('Tasa de éxito', pct(t.pasan, t.ejecutadas), `${t.pasan} de ${t.ejecutadas} ejecutadas pasan`, exito === 1 ? 'ok' : t.fallan ? 'mal' : 'aviso')}
  ${kpi('Cobertura de CA', pct(m.probados, m.criterios.length), `${m.probados} de ${m.criterios.length} criterios con prueba E2E`)}
  ${kpi('CA aprobados', pct(m.aprobados, m.criterios.length), `${m.aprobados} criterios con todas sus pruebas en verde`)}
  ${kpi('Pruebas inestables', pct(t.inestables, t.ejecutadas), `${t.inestables} pasaron solo al reintentar`, t.inestables ? 'aviso' : '')}
  ${kpi('Duración total', segundos(m.duracionMs), `promedio ${segundos(m.promedioMs)} por prueba`)}
  ${kpi('Deuda abierta', String(t.conocidos + t.pendientes), `${t.conocidos} errores conocidos · ${t.pendientes} pendientes`, t.conocidos + t.pendientes ? 'aviso' : '')}
</section>

<section>
  <h2>Distribución de las ${t.total} pruebas</h2>
  ${barra(t)}
  <ul class="leyenda">
    <li><i class="ok"></i>Pasan <b>${t.pasan}</b></li>
    <li><i class="aviso"></i>Errores conocidos <b>${t.conocidos}</b></li>
    <li><i class="mal"></i>Fallan <b>${t.fallan}</b></li>
    <li><i class="neutro"></i>Pendientes <b>${t.pendientes}</b></li>
  </ul>
</section>

${
  fallas.length
    ? `<section><h2>Pruebas que fallan</h2><table><thead><tr><th>Prueba</th><th>Error</th><th>Evidencia</th></tr></thead><tbody>${fallas
        .map(
          (p) =>
            `<tr><td><b>${html(p.nombre)}</b><br><small>${html(p.contexto)}</small></td><td><code class="error">${html(limpiar(p.error).slice(0, 500))}</code></td><td>${
              p.adjuntos.map((a) => `<a href="${html(a.ruta)}">${html(a.nombre)}</a>`).join('<br>') || '—'
            }</td></tr>`
        )
        .join('')}</tbody></table><p class="nota">Los traces se abren con <code>npx playwright show-trace &lt;archivo&gt;.zip</code> o en trace.playwright.dev.</p></section>`
    : ''
}

${
  inestables.length
    ? `<section><h2>Pruebas inestables</h2><p class="nota">Fallaron y pasaron al reintentar (en CI hay 1 reintento). Cuentan como «pasa», pero suelen indicar esperas o datos compartidos entre pruebas.</p><table><thead><tr><th>Prueba</th><th class="num">Intentos</th></tr></thead><tbody>${inestables
        .map((p) => `<tr><td>${html(p.nombre)}</td><td class="num">${p.intentos}</td></tr>`)
        .join('')}</tbody></table></section>`
    : ''
}

<section>
  <h2>Por épica</h2>
  ${tablaGrupos(m.porEpica, 'Épica', (k) => `<b>${html(k)}</b> ${html(EPICAS[k] || '')}`)}
</section>

<section>
  <h2>Por historia de usuario</h2>
  ${tablaGrupos(m.porHu, 'HU', (k) => `<b>${html(k)}</b>`)}
</section>

<section>
  <h2>Pruebas más lentas</h2>
  <table><thead><tr><th>Prueba</th><th>HU</th><th class="num">Duración</th></tr></thead><tbody>${m.lentas
    .map((p) => `<tr><td>${html(p.nombre)}</td><td>${html(p.hu)}</td><td class="num">${segundos(p.duracionMs)}${p.intentos > 1 ? ` <small>(${p.intentos} intentos)</small>` : ''}</td></tr>`)
    .join('')}</tbody></table>
</section>

${
  deuda.length
    ? `<section><h2>Errores conocidos y pendientes</h2><table><thead><tr><th>Prueba</th><th>Estado</th><th>Motivo</th></tr></thead><tbody>${deuda
        .map((p) => `<tr><td>${html(p.nombre)}</td><td>${chip(p.estado)}</td><td><small>${html(p.motivo || '—')}</small></td></tr>`)
        .join('')}</tbody></table></section>`
    : ''
}

<section>
  <h2>Matriz de trazabilidad</h2>
  ${
    m.criterios.length
      ? `<details><summary>Ver los ${m.criterios.length} criterios en alcance</summary><table><thead><tr><th>CA</th><th>HU</th><th>Criterio</th><th>Estado</th></tr></thead><tbody>${m.matriz
          .map((c) => `<tr><td><b>${html(c.ca)}</b></td><td>${html(c.hu)}</td><td>${html(c.criterio)}</td><td>${chip(c.estado)}</td></tr>`)
          .join('')}</tbody></table></details>`
      : `<p class="nota">No se encontró la lista de criterios (<code>${html(CRITERIOS)}</code>): la cobertura de CA no se puede calcular.</p>`
  }
</section>

<section class="glosario">
  <h2>Cómo se calcula</h2>
  <dl>
    <dt>Tasa de éxito</dt><dd>pasan ÷ ejecutadas. Ejecutadas = pasan + fallan + errores conocidos (las pendientes no se ejecutan).</dd>
    <dt>Cobertura de CA</dt><dd>criterios con al menos una prueba E2E ejecutada ÷ criterios en alcance (<code>criterios.json</code> de las pruebas funcionales del backend, la misma lista para ambas suites).</dd>
    <dt>CA aprobados</dt><dd>criterios cuyas pruebas pasan todas ÷ criterios en alcance.</dd>
    <dt>Pruebas inestables</dt><dd>pruebas que fallaron y pasaron al reintentar ÷ ejecutadas.</dd>
    <dt>Error conocido</dt><dd>prueba marcada con <code>test.fail</code> por un defecto abierto: describe el comportamiento correcto y hoy falla a propósito.</dd>
    <dt>Pendiente</dt><dd>prueba marcada con <code>test.fixme</code>: la funcionalidad aún no existe.</dd>
  </dl>
  <p class="nota">Reporte detallado de Playwright (pasos, capturas, traces): carpeta <code>html/</code> de este mismo artefacto, o <code>npx playwright show-report reportes-e2e/html</code>.</p>
</section>`;
  }

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Resumen pruebas E2E</title>
<style>
:root {
  --fondo: #f6f7f9; --superficie: #ffffff; --borde: #e3e6eb; --texto: #1b2330; --suave: #5d6878;
  --ok: #1e8a4c; --ok-fondo: #e3f4ea; --mal: #c0362c; --mal-fondo: #fbe6e4;
  --aviso: #b26b00; --aviso-fondo: #fdf0d9; --neutro: #8a94a3; --neutro-fondo: #eceef2;
}
@media (prefers-color-scheme: dark) {
  :root {
    --fondo: #12161c; --superficie: #1a2029; --borde: #2c3440; --texto: #e6e9ee; --suave: #9aa5b4;
    --ok: #4cc27f; --ok-fondo: #173326; --mal: #f0766b; --mal-fondo: #3a1d1b;
    --aviso: #e8a840; --aviso-fondo: #3a2c14; --neutro: #7d8796; --neutro-fondo: #262d38;
  }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--fondo); color: var(--texto); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
main { max-width: 1100px; margin: 0 auto; padding: 32px 16px 48px; }
h1 { font-size: 26px; margin: 0 0 4px; }
h2 { font-size: 17px; margin: 0 0 12px; }
a { color: inherit; }
code { font: 13px ui-monospace, Consolas, monospace; background: var(--neutro-fondo); padding: 1px 5px; border-radius: 4px; }
small, .nota, .meta { color: var(--suave); }
.meta { margin: 0 0 20px; }
section { background: var(--superficie); border: 1px solid var(--borde); border-radius: 10px; padding: 18px; margin-top: 16px; overflow-x: auto; }
.veredicto { border-radius: 10px; padding: 14px 18px; font-weight: 600; border: 1px solid; }
.veredicto.ok { background: var(--ok-fondo); color: var(--ok); }
.veredicto.mal { background: var(--mal-fondo); color: var(--mal); }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; background: none; border: 0; padding: 0; }
.kpi { background: var(--superficie); border: 1px solid var(--borde); border-top: 4px solid var(--neutro); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 2px; }
.kpi.ok { border-top-color: var(--ok); } .kpi.mal { border-top-color: var(--mal); } .kpi.aviso { border-top-color: var(--aviso); }
.kpi-titulo { font-size: 13px; color: var(--suave); }
.kpi-valor { font-size: 28px; font-weight: 700; font-variant-numeric: tabular-nums; }
.kpi-detalle { font-size: 12.5px; color: var(--suave); }
.barra { display: flex; height: 12px; border-radius: 6px; overflow: hidden; background: var(--neutro-fondo); min-width: 80px; gap: 2px; }
.barra span.ok, .leyenda i.ok { background: var(--ok); } .barra span.mal, .leyenda i.mal { background: var(--mal); }
.barra span.aviso, .leyenda i.aviso { background: var(--aviso); } .barra span.neutro, .leyenda i.neutro { background: var(--neutro); }
.leyenda { list-style: none; display: flex; flex-wrap: wrap; gap: 6px 18px; padding: 0; margin: 10px 0 0; font-size: 13.5px; }
.leyenda i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--borde); vertical-align: top; }
th { font-size: 12.5px; color: var(--suave); font-weight: 600; }
tr:last-child td { border-bottom: 0; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.tasa { display: flex; align-items: center; gap: 10px; min-width: 170px; } .tasa b { width: 62px; font-variant-numeric: tabular-nums; } .tasa .barra { flex: 1; }
.chip { display: inline-block; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
.chip.ok { background: var(--ok-fondo); color: var(--ok); } .chip.mal { background: var(--mal-fondo); color: var(--mal); }
.chip.aviso { background: var(--aviso-fondo); color: var(--aviso); } .chip.neutro, .chip.vacio { background: var(--neutro-fondo); color: var(--suave); }
code.error { display: block; white-space: pre-wrap; word-break: break-word; background: var(--mal-fondo); color: var(--texto); }
details summary { cursor: pointer; font-weight: 600; margin-bottom: 8px; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; margin: 0; }
dt { font-weight: 600; } dd { margin: 0; color: var(--suave); }
@media (max-width: 600px) { dl { grid-template-columns: 1fr; } dd { margin-bottom: 8px; } .kpi-valor { font-size: 24px; } }
</style>
</head>
<body>
<main>
<h1>Resumen de pruebas E2E</h1>
<p class="meta">A Walking Dictionary · Playwright · ${meta}</p>
${cuerpo}
</main>
</body>
</html>
`;
}

const metricas = calcular();
mkdirSync(path.dirname(SALIDA), { recursive: true });
writeFileSync(SALIDA, generarHtml(metricas));
const markdown = generarMarkdown(metricas);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
console.log(markdown);
console.log(`\nResumen HTML: ${path.relative(raizFront, SALIDA)}`);
