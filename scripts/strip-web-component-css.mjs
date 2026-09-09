/**
 * Kopieert de NLDS web-component IIFE-bundels van node_modules naar static/js/web-components/,
 * en haalt de CSS-injectie eruit zodat ze binnen style-src 'self' blijven (CSP).
 *
 * Twee patronen worden verwijderd uit elke bundel:
 *  1. styleInject(css_...);          -- zet een <style> element in <head>
 *  2. const stylesheet = new CSSStyleSheet(); ... adoptedStyleSheets = [...];
 *                                    -- injecteert CSS in de shadow DOM
 *
 * Het JS-gedrag van het component blijft ongewijzigd. Alle bijbehorende CSS zit al in ds.css
 * via @gemeentenijmegen/components-css.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const components = [
  'nijmegen-header',
  'nijmegen-mobile-menu',
  'nijmegen-toolbar-button',
];

const srcDir = resolve('node_modules/@gemeentenijmegen/web-components/dist');
const outDir = resolve('src/app/static-resources/static/js/web-components');

mkdirSync(outDir, { recursive: true });

for (const name of components) {
  let src = readFileSync(resolve(srcDir, `${name}.js`), 'utf8');

  const before = src;

  src = src.replace(/\n  styleInject\([^)]+\);\n/, '\n');

  src = src.replace(
    /\n\s+const stylesheet = new CSSStyleSheet\(\);\n\s+stylesheet\.replaceSync\([^)]+\);\n\s+shadowRoot\.adoptedStyleSheets = \[stylesheet\];/,
    '',
  );

  if (src === before) {
    console.error(`WARNING: geen CSS-injectiepatroon gevonden in ${name}.js, check of het dist-formaat is gewijzigd`);
    process.exitCode = 1;
  }

  writeFileSync(resolve(outDir, `${name}.js`), src);
  console.log(`stripped: ${name}.js`);
}
