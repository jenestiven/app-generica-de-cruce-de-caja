# mobile

App Expo (React Native) del proyecto.

## Herramientas de desarrollo

El botón **"Reiniciar datos de prueba"** (pantalla Menú) solo se muestra cuando **ambas** condiciones son verdaderas:

- `__DEV__` (build de desarrollo, no producción)
- `expo.extra.mostrarHerramientasDev` en `app.json` es `true`

Esto evita que herramientas destructivas de prueba queden accesibles en un build de producción, incluso si por error se compilara con configuración de desarrollo.

### Check de banderas antes de build

```bash
npm run check:prod-flags
```

Esto ejecuta [`scripts/check-prod-flags.js`](scripts/check-prod-flags.js), que:

- Lee `app.json`.
- Falla (exit code `1`) con un mensaje claro si `expo.extra.mostrarHerramientasDev` es `true`.
- Termina en éxito (exit code `0`) si es `false` o no está definido.

### Build de producción (Android)

```bash
npm run build:production
```

Este script corre `check:prod-flags` primero y **solo si pasa** (exit code `0`) ejecuta `eas build --platform android --profile production`. Si `mostrarHerramientasDev` sigue en `true`, el comando falla antes de invocar `eas build` — el build de producción no puede arrancar con el flag encendido, sin depender de acordarse de correr el check a mano.

Flujo recomendado:

1. Cambia `"mostrarHerramientasDev": true` a `"mostrarHerramientasDev": false` en [`app.json`](app.json).
2. Corre `npm run build:production`.
