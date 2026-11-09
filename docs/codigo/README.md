# Documentación del código (generada con JSDoc)

Los comentarios del código de `src/` siguen el estilo Doxygen del proyecto (`@file`, `@brief`, `@param`,
`@return`, `@note`). [JSDoc](https://jsdoc.app/) lee esos comentarios y genera una página web con cada
archivo, componente, función, parámetro y descripción. Las pruebas (`*.test.js`, `*.test.jsx`) y
`setupTests.js` no se incluyen.

## Cómo generarla

Desde la raíz del repositorio:

```bash
npm install          # solo la primera vez (instala jsdoc, dependencia de desarrollo)
npm run docs:code
```

Abrir `docs-generados/index.html` en el navegador.

La carpeta `docs-generados/` **no se sube al repositorio** (está en `.gitignore` y la ignora ESLint):
cada quien la genera en su equipo cuando la necesita.

## Archivos de configuración

| Archivo | Para qué sirve |
| --- | --- |
| `jsdoc.json` | Qué leer (`src`, archivos `.js` y `.jsx` sin pruebas), dónde guardar la página (`docs-generados`) y qué plugins usar |
| `jsdoc/etiquetas.cjs` | Plugin del proyecto: traduce lo que JSDoc no entiende (ver tabla) |
| `jsdoc/INICIO.md` | Texto de la página de inicio del sitio generado |

## Qué traduce el plugin

Los comentarios **no se reescriben**; el plugin solo cambia cómo los lee JSDoc al generar la página:

| En el comentario | En la página |
| --- | --- |
| `@brief texto` | Descripción de la función, constante o archivo |
| `@file X.jsx` | Se quita el nombre del archivo; la descripción del archivo es su `@brief` |
| `@note texto` | Párrafo **Nota:** texto |
| `@warning texto` | Párrafo **Advertencia:** texto |
| `{{ token?: string }}` (campo opcional de TypeScript) | `{{ token: string }}` |
| `{() => Promise<void>}` (función de TypeScript) | `{function(): Promise<void>}` |

El back-end usa una versión de este plugin (`backend/jsdoc/etiquetas.cjs` en su repositorio), sin las
dos últimas traducciones porque su código no usa esos tipos.

## Mantenimiento

- Al agregar o cambiar código, documentarlo con el mismo estilo; la página se actualiza al volver a
  correr `npm run docs:code`.
- Si un tipo nuevo da error al generar la página ("Unable to parse a tag's type expression"), usar la
  sintaxis de JSDoc o agregar la traducción en `simplificarTipos` de `jsdoc/etiquetas.cjs`.
- Si se empieza a usar otra etiqueta de Doxygen, agregarla en `definirEtiquetaDeTexto`.
