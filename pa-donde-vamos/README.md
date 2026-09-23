# Pa' Donde Vamos Hoy?

App para descubrir restaurantes, cafés, bares y eventos en Caracas, guardar tus lugares favoritos y armar planes con tus panas.

Hecha con **Expo (SDK 57) + React Native + expo-router**. Funciona en iPhone, Android y en el navegador con el mismo código.

## Cómo correrla en tu computadora (Windows, Mac o Linux)

Necesitas **Node.js 20 o superior** (Node 22 o 24 funcionan) y **Git**.

1. Abre una terminal (en Windows: **PowerShell**) y ve a la carpeta de la app:

   ```powershell
   cd ruta\a\prompt-\pa-donde-vamos
   ```

2. Instala las dependencias (solo la primera vez; tarda 1–3 minutos):

   ```powershell
   npm install
   ```

3. Arranca la app:

   ```powershell
   npx expo start
   ```

4. Ábrela:
   - **En tu teléfono:** instala la app **Expo Go** (App Store / Google Play) y escanea el código QR que aparece en la terminal. El teléfono y la computadora tienen que estar en el mismo Wi-Fi.
   - **En el navegador:** presiona la tecla **`w`** en la terminal. Se abre en `http://localhost:8081`.

Para detenerla: `Ctrl + C` en la terminal.

> Si el teléfono no conecta por Wi-Fi, usa `npx expo start --tunnel`.

## Qué puedes hacer en la app

- **Crear cuenta / entrar** (con correo, Google o Apple — en esta versión es simulado y todo se guarda en tu teléfono).
- **Inicio:** saludo, buscador, filtros (Café, Comer, Bebidas, Eventos), lugar destacado, "Cerca de ti", tus próximos planes.
- **Explorar y Mapa:** busca por nombre, zona o tipo; mira todos los lugares en el mapa.
- **Detalle de lugar:** calificación, horario (te dice si está abierto ahora), guardar, compartir e **Ir ahora** (abre Google Maps / Apple Maps con la ruta).
- **Eventos:** guarda eventos y "compra" entradas.
- **Crear plan:** elige tipo → lugar y hora → con quién vas → revisa → ¡listo!
- **Amigos y chat:** ve los planes en común y escríbeles (en la demo tus panas te responden solos).
- **Notificaciones, perfil, preferencias y configuración.**

## Datos de ejemplo

- La app **no usa servidor todavía**: lugares, eventos y amigos son datos de ejemplo en `src/data/`.
- Tu sesión, guardados, planes y chats se guardan en el dispositivo (AsyncStorage / localStorage).
- En **Perfil → ⚙️ → Restablecer datos de ejemplo** vuelves al estado inicial.
- Las fotos están en `assets/photos/` (se generaron para la demo). Para usar fotos reales, reemplaza los archivos **con el mismo nombre**.

## Estructura

```
src/
  app/            Pantallas (cada archivo es una ruta de expo-router)
    (tabs)/       Inicio, Explorar, Guardados, Amigos, Perfil, Mapa
    plan/         Flujo "Crear plan"
  components/     Componentes reutilizables (botones, chips, avatares, ilustraciones…)
  data/           Lugares, eventos, amigos y datos iniciales
  store/          Estado global (zustand, persistido)
  theme/          Colores, tipografías y espaciados
  lib/            Formato de fechas en español, acciones (mapas, compartir)
assets/photos/    Fotos de lugares, eventos y avatares
```

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npx expo start` | Arranca la app en modo desarrollo |
| `npx expo start --web` | La abre directo en el navegador |
| `npm run typecheck` | Revisa errores de TypeScript |
| `npx expo export --platform web` | Genera la versión web estática en `dist/` |

## Próximos pasos sugeridos

- Backend real (autenticación, amigos, planes y chat en tiempo real).
- Mapa interactivo real (p. ej. `react-native-maps`, requiere un development build).
- Fotos reales de los lugares y notificaciones push.
