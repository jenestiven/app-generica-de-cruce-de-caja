# App de Control de Ventas y Caja — Mobile

App React Native (Expo) para que el dueño de un negocio de comida rápida registre sus ventas, gastos y cierre de caja diario desde el celular, con análisis de su operación diaria y mensual. No reemplaza la operación manual del local — es una herramienta de control paralela.

Contexto completo del producto, decisiones de alcance y por qué existen ciertas restricciones: [`docs/architecture.md`](../../docs/architecture.md).

## Stack

| Capa | Tecnología |
|---|---|
| App | React Native + Expo |
| Almacenamiento local | expo-sqlite (local-first, la app funciona 100% offline) |
| Navegación | React Navigation (bottom tabs) |
| Gráficas | react-native-chart-kit |
| Exportación de respaldo | xlsx (SheetJS) + expo-file-system + expo-sharing |
| Recordatorios | expo-notifications (notificaciones locales) |
| Imágenes de producto | expo-image-picker + expo-file-system |
| Build / distribución | Expo EAS |

No hay backend ni base de datos en la nube — es una decisión de alcance, no una limitación técnica olvidada. Ver la sección "Respaldo de datos" en `docs/architecture.md` para el porqué.

## Requisitos previos

- Node.js LTS
- `npm install -g eas-cli` (solo si vas a generar builds)
- Android Studio con un emulador configurado, o un dispositivo físico Android con depuración USB habilitada
- Cuenta de Expo (gratuita) si vas a usar EAS Build

## Instalación

```bash
git clone <repo>
cd apps/mobile
npm install
```

## Correr en desarrollo

Esta app usa **development build**, no Expo Go — `expo-notifications` requiere módulos nativos que Expo Go dejó de soportar completamente en Android desde el SDK 53. Ver "Problemas conocidos" más abajo si es la primera vez que configuras el entorno.

```bash
npx expo run:android
```

Esto compila e instala el development build en el emulador/dispositivo conectado. Para sesiones posteriores, con el build ya instalado, basta con:

```bash
npx expo start --dev-client
```

## Estructura del proyecto

```
src/
  db/            # capa de acceso a SQLite — un archivo por entidad
                 # (productos.ts, ventas.ts, gastos.ts, cierresCaja.ts, config.ts)
  screens/       # una carpeta por pantalla: Vender, Gastos, Caja, Analisis, Menu
  components/
    ui/          # sistema de diseño reutilizable (Button, Card, Input, Chip,
                 # StepperControl, SummaryRow, StatusBadge)
  theme/         # tokens de diseño: colors.ts, spacing.ts, typography.ts
  navigation/
  utils/         # exportarRespaldo.ts, recordatorios.ts, imagenes.ts
  types/
scripts/
  check-prod-flags.js   # valida que no se compile producción con flags de dev activos
docs/                    # (raíz del repo, no dentro de apps/mobile)
  architecture.md         # modelo de datos, decisiones de alcance, stack completo
  sprint-XX.md             # checklist de cada sprint
  sprint-XX-prompts.md     # prompts listos para Claude Code, uno por sprint
```

La app sigue una convención de "un archivo de queries por entidad" — no hay queries SQL sueltas dentro de componentes. Si necesitas agregar una consulta nueva, va en `src/db/`, no en la pantalla.

## Cómo se construyó este proyecto (flujo con Claude Code)

Este proyecto se desarrolla sprint por sprint con Claude Code. El contexto persistente vive en [`CLAUDE.md`](../../CLAUDE.md) (raíz del repo) — ahí están las convenciones de código y los principios de diseño que debe respetar cualquier cambio.

Cada sprint tiene dos archivos en `docs/`:
- `sprint-XX.md`: qué se construye y su checklist de verificación
- `sprint-XX-prompts.md`: los prompts exactos para pegar en Claude Code, en orden

Al iniciar un sprint nuevo en Claude Code, se referencian ambos archivos de contexto:
```
@docs/sprint-XX.md @docs/architecture.md
```

Después de cada prompt del sprint: probar lo que se construyó, y `/clear` antes del siguiente. No se avanza al siguiente checkbox sin haber corrido la app y confirmado que funciona.

## Modelo de datos y decisiones de negocio

No se documentan aquí para evitar que se desactualicen en dos lugares — la referencia única es [`docs/architecture.md`](../../docs/architecture.md), que incluye:

- Esquema completo de `productos`, `ventas`, `venta_items`, `gastos`, `cierres_caja`, `config`
- Por qué no hay backend en la nube (y qué se hace en su lugar: exportación a Excel + recordatorio)
- Cómo funciona la corrección de un cierre de caja del mismo día (sin reabrir libremente el historial)
- Por qué las imágenes de producto son solo locales

## Herramientas de desarrollo

El botón **"Reiniciar datos de prueba"** (pantalla Menú) solo se muestra cuando **ambas** condiciones son verdaderas:

- `__DEV__` (build de desarrollo, no producción)
- `expo.extra.mostrarHerramientasDev` en `app.json` es `true`

Esto evita que herramientas destructivas de prueba queden accesibles en un build de producción, incluso si por error se compilara con configuración de desarrollo.

## Build de producción (Android)

```bash
npm run build:production
```

Este comando corre primero `npm run check:prod-flags` (ver [`scripts/check-prod-flags.js`](scripts/check-prod-flags.js)), que falla si `mostrarHerramientasDev` sigue en `true` en `app.json`. Solo si pasa, ejecuta `eas build --platform android --profile production`. El build de producción no puede arrancar con el flag de herramientas de desarrollo encendido.

**Checklist antes de compilar para entregar:**
1. `"mostrarHerramientasDev": false` en `app.json` (el check lo valida, pero revísalo igual)
2. Confirmar que el perfil `production` en `eas.json` no tiene `developmentClient: true`
3. Instalar el `.apk`/`.aab` resultante y confirmar a simple vista que el botón de reset no aparece

Si solo necesitas un build instalable para pruebas internas (no para entregar), usa el perfil `preview` en su lugar — sin pasar por el check de flags, ya que ese perfil sí puede llevar herramientas de desarrollo:
```bash
eas build --platform android --profile preview
```

## Problemas conocidos y cómo resolverlos

**`Unable to resolve module expo-constants` (u otro módulo Expo) al correr `expo start`**
Alguna dependencia de Expo quedó desalineada con el SDK del proyecto, normalmente después de instalar varias librerías nuevas seguidas. Solución:
```bash
npx expo install --fix
```
Si persiste, reinstalación limpia: borrar `node_modules` y `package-lock.json`, y repetir `npx expo install --fix && npm install`.

**`[runtime not ready]` mencionando push notifications al usar `expo-notifications`**
Expo Go dejó de soportar notificaciones (incluso locales, por cómo se inicializa el módulo) en Android desde el SDK 53. No es un bug del código de este proyecto — es una limitación de Expo Go como entorno de pruebas. Solución: usar development build (`npx expo run:android`), no Expo Go, para cualquier trabajo que involucre `expo-notifications`.

**Gráficas rotas o error de resolución con `victory-native`**
Se evaluó `victory-native` en el Sprint 04 y se reemplazó por `react-native-chart-kit` por problemas de compatibilidad con Expo. Si ves `victory-native` mencionado en algún prompt o commit viejo, es historial — la librería actual es `react-native-chart-kit`.

## Alcance actual y pendientes

Ver la sección "Pendientes" de `docs/architecture.md` para lo que falta definir con el cliente (métodos de pago finales, tipo de comprobante) y lo que quedó deliberadamente fuera de alcance por presupuesto (backend en la nube, sync automático — reemplazado por exportación manual a Excel).