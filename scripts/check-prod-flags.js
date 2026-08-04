#!/usr/bin/env node
/**
 * Verifica que las banderas de desarrollo en app.json esten apagadas
 * antes de generar un build de produccion (p.ej. `eas build`).
 */
const fs = require('fs');
const path = require('path');

const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');

function main() {
  const raw = fs.readFileSync(APP_JSON_PATH, 'utf8');
  const appJson = JSON.parse(raw);
  const extra = appJson.expo?.extra ?? {};

  if (extra.mostrarHerramientasDev === true) {
    console.error(
      '\n[check-prod-flags] ERROR: "expo.extra.mostrarHerramientasDev" esta en true en app.json.\n' +
        'Esto deja visibles las herramientas de desarrollo (p.ej. "Reiniciar datos de prueba") en produccion.\n' +
        'Cambia el valor a false en app.json antes de generar el build.\n'
    );
    process.exit(1);
  }

  console.log('[check-prod-flags] OK: mostrarHerramientasDev esta en false (o ausente).');
}

main();
