# Guía de Compilación, Firma y Entrega Académica (.AAB, .APK, README y Código Fuente)

Esta guía contiene las instrucciones detalladas paso a paso para compilar la aplicación, generar el archivo de producción **.aab (Android App Bundle)**, la aplicación instalable **.apk**, configurar las firmas y preparar la entrega final para tu evaluador.

---

## 📦 Componentes de la Entrega Final

Al finalizar, tu carpeta de entrega para el evaluador de la competencia técnica (SENA / ADSO) debe contener:
1. **Código Fuente:** El repositorio clonado de GitHub (limpio, sin carpetas `node_modules`).
2. **Archivo `.aab`:** El paquete de distribución para Google Play Store.
3. **Archivo `.apk`:** El archivo instalable directamente en el celular del evaluador para su prueba.
4. **Archivo `README.md`:** La descripción del proyecto y arquitectura (ya incluido en la raíz).

---

## 🚀 Paso 1: Clonar e Instalar Dependencias (Para el Evaluador)

Si el evaluador clona el proyecto desde GitHub, debe ejecutar los siguientes comandos en la raíz del proyecto para dejarlo 100% operativo:

```bash
# 1. Instalar dependencias con compatibilidad para React 19 / Expo 56
npm install --legacy-peer-deps

# 2. Compilar la aplicación localmente en modo desarrollo
npx expo run:android
```

---

## 🔑 Paso 2: Generar la Firma Digital (Keystore)

Para que el archivo `.aab` y el `.apk` de producción sean válidos y seguros, deben estar firmados digitalmente. 

### Opción A: Compilación Local Manual (Recomendado y Gratis)

1. Abre tu terminal en la carpeta `android/app/` del proyecto.
2. Ejecuta el siguiente comando para generar tu firma digital (`my-upload-key.keystore`):

```bash
keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
*Nota: Te pedirá una contraseña (recuérdala, por ejemplo: `123456`) y algunos datos como nombre, organización, etc.*

3. Mueve el archivo generado `my-upload-key.keystore` a la carpeta `android/app/` (si no lo generaste ahí).
4. Edita el archivo `android/app/build.gradle` para añadir tu firma de producción. Busca la sección `signingConfigs` y configúrala así:

```groovy
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androidplaceholder'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        } else {
            // Fallback al keystore de depuración si no se especifican variables
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androidplaceholder'
            keyPassword 'android'
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        // ...
    }
}
```

5. Define las credenciales en el archivo `android/gradle.properties` agregando estas líneas al final:

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_STORE_PASSWORD=tu_contraseña_aquí
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_KEY_PASSWORD=tu_contraseña_aquí
```

---

## 🛠️ Paso 3: Compilar los Archivos de Entrega (.APK y .AAB)

Una vez configurada la firma, puedes compilar los binarios directamente desde tu computadora de manera local y 100% gratuita (sin consumir créditos de Expo):

### 1. Compilar el archivo .APK (Instalable)
El archivo `.apk` sirve para que tu evaluador lo instale directamente en su teléfono Android.

Ejecuta en la terminal de la raíz del proyecto:
```bash
# Ingresar al directorio de Android y compilar el APK de Release
cd android
./gradlew assembleRelease
```
El archivo compilado quedará en:
`android/app/build/outputs/apk/release/app-release.apk`
*Copia este archivo, renómbralo a `TaskBoard_Adso.apk` y colócalo en tu carpeta de entregables.*

### 2. Compilar el archivo .AAB (Android App Bundle)
El archivo `.aab` es el formato oficial requerido por Google Play para subir aplicaciones.

Ejecuta en la terminal del proyecto:
```bash
# Compilar el Bundle de Android para distribución
cd android
./gradlew bundleRelease
```
El archivo compilado quedará en:
`android/app/build/outputs/bundle/release/app-release.aab`
*Copia este archivo, renómbralo a `TaskBoard_Adso.aab` y colócalo en tu carpeta de entregables.*

---

## ☁️ Paso 4: Alternativa en la Nube (Expo EAS Build)

Si prefieres que Expo se encargue de la firma y la compilación en sus servidores automáticamente, puedes usar **EAS Build**:

1. Inicia sesión en tu cuenta de Expo:
   ```bash
   npx eas login
   ```
2. Configura el proyecto para EAS:
   ```bash
   npx eas build:configure
   ```
3. Ejecuta la compilación para Android (EAS generará la firma Keystore en la nube automáticamente y te dará los enlaces de descarga para el `.aab` y el `.apk`):
   ```bash
   npx eas build --platform android
   ```

---

## 💡 Recomendaciones para la Evaluación Académica

- **Cámara Lista:** Gracias a los ajustes realizados en `AndroidManifest.xml` (Queries para `IMAGE_CAPTURE` e inicialización de hardware de cámara) y a las reglas aplicadas en `proguard-rules.pro` para proteger el código nativo de la cámara y avatar contra la optimización del compilador, la cámara funcionará perfectamente tanto en el APK compilado como si el evaluador clona el código de GitHub y lo corre en su computadora.
- **Limpieza del Código:** Antes de subir el código fuente a GitHub o comprimirlo, recuerda borrar la carpeta `node_modules` y `.expo` para reducir el peso de megabytes del archivo final. El evaluador los regenerará ejecutando `npm install`.
