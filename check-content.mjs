#!/usr/bin/env node
/* ================================================================
   tools/check-content.mjs  —  Comprobador de contenido (opcional)
   ================================================================
   Una web estática NO puede leer carpetas desde el navegador, así que
   el "índice" del contenido vive en data.js. Este script te ayuda a
   mantenerlo sincronizado SIN sobrescribir nada:

     • Te dice qué PDFs/imágenes hay en tus carpetas pero NO están
       en data.js  (los que "olvidaste añadir").
     • Te dice qué entradas de data.js apuntan a archivos que NO
       existen en disco (enlaces rotos).
     • Te imprime el fragmento listo para PEGAR en data.js.

   USO (desde la raíz del proyecto):
     node tools/check-content.mjs
   ================================================================ */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Cargar los arrays de data.js en un "window" falso */
const window = {};
eval(readFileSync(join(ROOT, 'data.js'), 'utf8'));
const MACHINES = window.MACHINES || [];
const FORENSIC = window.FORENSIC_CASES || [];
const CERTS    = window.CERTS || [];

/* Helpers */
const C = { g:'\x1b[32m', y:'\x1b[33m', r:'\x1b[31m', b:'\x1b[36m', d:'\x1b[2m', x:'\x1b[0m' };
const base = p => basename(String(p || ''));
function diskFiles(dir, exts) {
  const p = join(ROOT, dir);
  if (!existsSync(p)) return null; // carpeta inexistente
  return readdirSync(p).filter(f => exts.some(e => f.toLowerCase().endsWith(e)) && !f.startsWith('.'));
}

let problems = 0;

function report(section, dir, exts, referenced, snippetFor) {
  console.log(`\n${C.b}══ ${section}  (carpeta ${dir}/)${C.x}`);
  const disk = diskFiles(dir, exts);
  if (disk === null) {
    console.log(`   ${C.y}⚠  la carpeta ${dir}/ no existe todavía${C.x}`);
    return;
  }
  const refSet  = new Set(referenced.map(base));
  const diskSet = new Set(disk);

  // Archivos en disco que NO están en data.js
  const missing = disk.filter(f => !refSet.has(f));
  // Entradas en data.js cuyo archivo NO existe
  const broken  = referenced.filter(p => !diskSet.has(base(p)));

  if (!missing.length && !broken.length) {
    console.log(`   ${C.g}✓ todo sincronizado (${disk.length} archivo(s))${C.x}`);
  }
  missing.forEach(f => {
    problems++;
    console.log(`   ${C.y}＋ "${f}" está en disco pero NO en data.js${C.x}`);
    console.log(C.d + snippetFor(f).split('\n').map(l => '       ' + l).join('\n') + C.x);
  });
  broken.forEach(p => {
    problems++;
    console.log(`   ${C.r}✗ data.js apunta a "${p}" pero el archivo NO existe${C.x}`);
  });
}

console.log(`${C.b}x224 · comprobación de contenido${C.x}  ${C.d}(no modifica nada)${C.x}`);

/* WRITEUPS */
report('WRITEUPS', 'writeups', ['.pdf'],
  MACHINES.map(m => m.pdf).filter(Boolean),
  f => {
    const name = f.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `{
  name:       '${name}',
  difficulty: 'easy',          // easy | medium | hard
  os:         'linux',         // windows | linux | other
  platform:   'htb',           // htb | thm | other
  pdf:        'writeups/${f}',
  tools:      [],
  techniques: []
},`;
  });

/* FORENSE */
report('FORENSE', 'forensic', ['.pdf'],
  FORENSIC.map(c => c.pdf).filter(Boolean),
  f => {
    const title = f.replace(/\.pdf$/i, '');
    return `{
  filename: '${f.replace(/\s+/g, '_')}',
  title:    '${title}',
  icon:     '🔍',
  pdf:      'forensic/${f}',
  tags:     [{ label: 'Forense', cls: 'tag-forense' }],
  summary:  '',
  findings: [],
  tools:    []
},`;
  });

/* CERTS */
report('CERTIFICACIONES', 'certs', ['.png', '.jpg', '.jpeg', '.webp', '.pdf'],
  CERTS.map(c => c.img).filter(Boolean),
  f => {
    const short = f.replace(/\.[a-z0-9]+$/i, '');
    return `{
  name:     '${short}',
  short:    '${short}',
  issuer:   '',
  img:      'certs/${f}',
  date:     '',                // ej: "30 may 2026"
  category: 'pentest',         // pentest | security | cloud
  verify:   null
},`;
  });

console.log('\n' + (problems
  ? `${C.y}→ ${problems} cosa(s) por revisar. Pega los fragmentos en data.js.${C.x}`
  : `${C.g}→ Todo en orden. data.js y tus carpetas coinciden.${C.x}`) + '\n');
