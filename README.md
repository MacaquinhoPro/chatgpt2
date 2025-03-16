# ChatGPT2

Este proyecto es una aplicación móvil desarrollada con [Expo](https://expo.dev/) (React Native) que incluye funcionalidades de autenticación (registro e inicio de sesión) y un sistema de conversaciones simulando un chat, utilizando diferentes *contexts* para la gestión de estado global (tema y menú/conversaciones).

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Uso de la Aplicación](#uso-de-la-aplicación)
- [Contextos Principales](#contextos-principales)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Requisitos

- **Node.js** (se recomienda la versión LTS, por ejemplo, 16.x).
- **npm** o **Yarn** como gestor de dependencias.
- **Expo CLI** local (se recomienda usar `npx expo` en lugar de la CLI global).
- **Xcode** (si deseas compilar o emular para iOS).
- **Android Studio** (si deseas compilar o emular para Android).
- **Cuenta de Firebase** (para la autenticación con Firebase).

## Instalación

1. **Clona este repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/chatgpt2-1.git
   cd chatgpt2-1
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```
   o, si usas Yarn:
   ```bash
   yarn
   ```

3. **Configura Firebase**:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
   - Añade una app web y obtén las credenciales de configuración (apiKey, authDomain, etc.).
   - Asegúrate de que en `utils/firebaseconfig.ts` (o el archivo equivalente) hayas puesto tus credenciales de Firebase.

4. **Instala CocoaPods (solo para iOS)**:
   - Abre la carpeta `ios` y ejecuta:
     ```bash
     cd ios
     pod install
     ```
   - Si tienes problemas de permisos, revisa tu configuración de usuario y ejecuta `sudo gem install cocoapods` o `brew install cocoapods`.

## Estructura del Proyecto

Una vista simplificada de la estructura de archivos podría verse así:

```
chatgpt2-1
├─ app
│  ├─ login.tsx
│  ├─ register.tsx
│  ├─ menuContext.tsx
│  ├─ themeContext.tsx
│  ├─ _layout.tsx  
├─ utils
│  └─ firebaseconfig.ts
├─ ios
│  └─ ... proyecto iOS (generado por Expo )
├─ android
│  └─ ... proyecto Android (generado por Expo) ...
├─ package.json
├─ tsconfig.json
├─ README.md
└─ ...
```

- **app/menuContext.tsx**: Maneja la apertura/cierre del menú y la gestión de conversaciones.
- **app/themeContext.tsx**: Provee el modo oscuro o claro para toda la aplicación.
- **app/login.tsx** y **app/register.tsx**: Pantallas de autenticación con Firebase.
- **utils/firebaseconfig.ts**: Configuración de Firebase (importar `auth` y otras utilidades).

## Scripts Disponibles

En el archivo `package.json` encontrarás varios scripts. Los más comunes son:

- **`npm run start`** o **`expo start`**: Inicia el servidor de desarrollo y Metro Bundler.
- **`npm run ios`**: Inicia la aplicación en el simulador de iOS (requiere Mac y Xcode).
- **`npm run android`**: Inicia la aplicación en un emulador o dispositivo Android.
- **`npm run web`**: Inicia la aplicación en el navegador (modo web).

## Uso de la Aplicación

1. **Inicia el proyecto**:
   ```bash
   npm run start
   ```
2. **Elige una plataforma**:
   - Pulsa **`i`** para abrir el simulador de iOS (si estás en macOS con Xcode instalado).
   - Pulsa **`a`** para abrir un emulador de Android (si tienes Android Studio instalado).
   - Pulsa **`w`** para abrir la versión web.

3. **Autenticación**:
   - Ve a la pantalla de **Registro** para crear una nueva cuenta con email y contraseña.
   - Ve a la pantalla de **Login** para iniciar sesión con las credenciales creadas.

4. **Menú y Conversaciones**:
   - El *MenuContext* se encarga de manejar la lista de conversaciones.
   - Puedes crear nuevas conversaciones, actualizar sus títulos y guardar el historial de mensajes (simulando un chat).

## Contextos Principales

### MenuContext
- **`isMenuOpen`**: Indica si el menú está abierto.
- **`toggleMenu()`**: Alterna el estado del menú.
- **`conversations`**: Lista de conversaciones creadas.
- **`createConversation()`**: Crea una nueva conversación.
- **`removeConversation(id: string)`**: Elimina una conversación.
- **`updateConversationTitle(id: string, newTitle: string)`**: Actualiza el título de una conversación.
- **`conversationHistories`**: Almacena el historial de mensajes para cada conversación.
- **`addMessage(conversationId, message)`**: Agrega un nuevo mensaje a una conversación.
- **`updateConversationHistory(conversationId, messages)`**: Sobrescribe el historial de una conversación.

### ThemeContext
- **`darkMode`**: Indica si el modo oscuro está activo.
- **`toggleDarkMode()`**: Alterna entre modo claro y oscuro.

## Contribuciones

¡Las contribuciones son bienvenidas! Para contribuir:

1. Haz un fork de este repositorio.
2. Crea una rama para tu contribución:
   ```bash
   git checkout -b feature/mi-feature
   ```
3. Realiza los cambios y haz commit:
   ```bash
   git commit -m 'Añadir nueva característica'
   ```
4. Haz push a la rama:
   ```bash
   git push origin feature/mi-feature
   ```
5. Abre un Pull Request en GitHub.
