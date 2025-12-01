# 🚀 EAS Build & Deploy - Guía de Configuración

## ✅ Ya Configurado

- ✅ `eas.json` creado con 3 perfiles (development, preview, production)
- ✅ `app.json` actualizado con permisos iOS y metadata
- ✅ API URL apunta a producción: `https://easylease-api.vercel.app/api`
- ✅ `.easignore` configurado

---

## 📋 PASOS PARA COMPLETAR LA CONFIGURACIÓN

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login en Expo

```bash
eas login
```

Usa tus credenciales de Expo. Si no tienes cuenta, créala en [expo.dev](https://expo.dev)

### 3. Configurar el Proyecto

```bash
cd easylease-admin-app
eas build:configure
```

Esto te preguntará:
- ✅ **Project ID**: Se generará automáticamente
- ✅ **Owner**: Usa tu username de Expo (ya configurado: `magguer`)

**IMPORTANTE**: Copia el `projectId` que te dé y actualiza:
1. `app.json` → `extra.eas.projectId`
2. `app.json` → `updates.url`

### 4. Configurar Credenciales de Apple

**Opción A: Automática (Recomendado)**
```bash
eas credentials
```
Selecciona:
- Platform: iOS
- Action: "Set up a new iOS Distribution Certificate and Provisioning Profile"

EAS creará automáticamente:
- ✅ Distribution Certificate
- ✅ Provisioning Profile
- ✅ Push Notification Key (si es necesario)

**Opción B: Manual**
Si ya tienes certificados de Apple Developer:
```bash
eas credentials
```
Selecciona "Use existing credentials" y sigue los pasos.

### 5. Actualizar `eas.json` con tus datos

Abre `eas.json` y actualiza en la sección `submit.production.ios`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "tu-email@apple.com",        // ← Tu Apple ID
        "ascAppId": "1234567890",               // ← De App Store Connect (después de crear la app)
        "appleTeamId": "ABCD123456"             // ← Tu Team ID de Apple Developer
      }
    }
  }
}
```

**Dónde encontrar estos datos:**

- **appleId**: El email de tu Apple Developer Account
- **ascAppId**: 
  1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
  2. Crea tu app (My Apps → +)
  3. El ID estará en App Information
- **appleTeamId**: 
  1. Ve a [Apple Developer](https://developer.apple.com/account)
  2. Membership → Team ID

---

## 🏗️ HACER TU PRIMER BUILD

### Build de Desarrollo (Para Testing Local)

```bash
eas build --platform ios --profile development
```

Esto crea un build que puedes instalar en tu iPhone vía TestFlight o directamente.

### Build de Preview (Para Testing Interno)

```bash
eas build --platform ios --profile preview
```

Ideal para compartir con testers antes de enviar a App Store.

### Build de Producción (Para App Store)

```bash
eas build --platform ios --profile production
```

Este es el build final que subirás a App Store.

**Tiempo estimado por build**: 10-20 minutos

---

## 📲 TESTING CON TESTFLIGHT

### 1. Configurar TestFlight en App Store Connect

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. My Apps → Tu App → TestFlight
3. Click en "+" para crear un nuevo grupo de testers

### 2. Subir Build a TestFlight

**Opción A: Automático con EAS Submit**
```bash
eas submit --platform ios --profile production
```

**Opción B: Manual**
1. Descarga el `.ipa` del build desde [expo.dev/builds](https://expo.dev/builds)
2. Sube manualmente en App Store Connect → TestFlight → Builds

### 3. Agregar Testers

1. TestFlight → Testers
2. Agregar emails de personas que quieres que prueben
3. Ellos recibirán invitación por email

---

## 🍎 CONFIGURACIÓN PARA APP STORE

### 1. Crear App en App Store Connect

1. [App Store Connect](https://appstoreconnect.apple.com) → My Apps → "+"
2. Completar:
   - **Name**: EasyLease Admin
   - **Primary Language**: English / Spanish
   - **Bundle ID**: com.easylease.admin (ya configurado)
   - **SKU**: easylease-admin-001

### 2. Completar Metadata

**App Information**
- Subtitle: Property Management Made Easy
- Category: Business
- Privacy Policy URL: https://easylease.com/privacy (necesitas crear esto)

**Pricing**
- Free (si es solo para tus empleados/clientes)

**Screenshots Requeridos**
Necesitas screenshots para iPhone:
- 6.7" Display (iPhone 15 Pro Max): **1290 x 2796 pixels** - Mínimo 3, máximo 10
- 6.5" Display (iPhone 11 Pro Max): 1242 x 2688 pixels

**Cómo tomarlos:**
```bash
# Abrir simulador
npm run ios

# Cmd + S para screenshot
# Se guardan en Desktop
```

### 3. Build Number y Version

EAS incrementa automáticamente el `buildNumber` (ya configurado con `autoIncrement: true`).

Si necesitas cambiar la versión:
```json
// app.json
{
  "expo": {
    "version": "1.0.1"  // ← Cambia esto para updates
  }
}
```

---

## 🔐 CREDENTIALS MANAGEMENT

### Ver Credenciales Actuales

```bash
eas credentials
```

### Crear Nuevas Credenciales

```bash
eas credentials --platform ios
```

Opciones:
1. **Distribution Certificate**: Para builds de producción
2. **Provisioning Profile**: Para firma de la app
3. **Push Notification Key**: Para notificaciones (opcional por ahora)

### Sincronizar con Apple Developer

Si actualizas algo en Apple Developer Portal, sincroniza:
```bash
eas credentials --platform ios --sync
```

---

## 📊 MONITOREO DE BUILDS

### Ver Builds en Progreso

```bash
eas build:list
```

O ve a [expo.dev/accounts/magguer/projects/easylease-admin-app/builds](https://expo.dev/builds)

### Descargar Build

```bash
eas build:list
# Copia el ID del build que quieres
eas build:download [BUILD_ID]
```

---

## 🚨 TROUBLESHOOTING

### Error: "No bundle identifier found"

✅ Solución: Verifica que `app.json` tenga:
```json
{
  "ios": {
    "bundleIdentifier": "com.easylease.admin"
  }
}
```

### Error: "Invalid Provisioning Profile"

✅ Solución: Regenerar:
```bash
eas credentials --platform ios
# Selecciona "Remove Provisioning Profile and create a new one"
```

### Error: "Team not found"

✅ Solución: Verifica tu Team ID:
1. [developer.apple.com/account](https://developer.apple.com/account)
2. Membership → Team ID
3. Actualiza en `eas.json`

### Build falla por "Missing dependencies"

✅ Solución:
```bash
cd easylease-admin-app
rm -rf node_modules
npm install
eas build --platform ios --profile production --clear-cache
```

---

## 💰 COSTOS EAS

### Plan Gratis
- ✅ 30 builds/mes gratis para iOS + Android
- ✅ Suficiente para desarrollo y testing

### Plan Paid ($29/mes)
- 🚀 Builds ilimitados
- ⚡ Priority queue (builds más rápidos)
- 📦 Más storage

**Recomendación**: Empieza con plan gratis, actualiza si necesitas más builds.

---

## ✅ CHECKLIST ANTES DEL PRIMER BUILD

- [ ] `npm install -g eas-cli` ejecutado
- [ ] `eas login` completado
- [ ] `eas build:configure` ejecutado
- [ ] `projectId` copiado a `app.json`
- [ ] Íconos actualizados (icon.png, splash-icon.png, adaptive-icon.png)
- [ ] Apple Developer Account activo ($99/año)
- [ ] Bundle ID registrado en Apple Developer
- [ ] Credenciales de iOS configuradas (`eas credentials`)
- [ ] `eas.json` actualizado con appleId, ascAppId, appleTeamId

---

## 🎯 COMANDOS RÁPIDOS

```bash
# Login
eas login

# Configurar proyecto
eas build:configure

# Build para testing
eas build --platform ios --profile preview

# Build para producción
eas build --platform ios --profile production

# Subir a TestFlight/App Store
eas submit --platform ios --profile production

# Ver builds
eas build:list

# Ver credenciales
eas credentials

# Ver logs de un build
eas build:view [BUILD_ID]
```

---

## 📚 RECURSOS

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [Apple Developer Portal](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Expo Dashboard](https://expo.dev)

---

## 🆘 SOPORTE

Si tienes problemas:
1. Revisa los logs: `eas build:view [BUILD_ID]`
2. Consulta la documentación: [docs.expo.dev](https://docs.expo.dev)
3. Foro de Expo: [forums.expo.dev](https://forums.expo.dev)

---

**Última Actualización**: 23 Noviembre 2025  
**Próximo Paso**: Ejecutar `eas build:configure` y hacer tu primer build de preview
