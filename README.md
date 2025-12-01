# 📱 EasyLease Admin App

Aplicación móvil nativa para administradores de EasyLease, desarrollada con Expo y React Native.

## 🎯 Objetivo

Facilitar la gestión de propiedades, leads y owners desde dispositivos móviles, permitiendo a los administradores trabajar sobre la marcha con todas las funcionalidades del panel web.

---

## 🛠️ Stack Tecnológico

### Core
- **Framework**: Expo SDK (última versión estable)
- **Router**: Expo Router (navegación basada en archivos)
- **Lenguaje**: TypeScript
- **UI Framework**: Tamagui (componentes nativos optimizados)

### Backend & Autenticación
- **API**: Misma API que frontend-admin (`easylease-api`)
- **Arquitectura**: Contract-centric (Tenant ↔ Contract ↔ Listing)
- **Autenticación**: JWT (JSON Web Tokens) para administradores
- **Estado**: TBD (React Query / Zustand)
- **Internacionalización**: i18n-js + expo-localization (Inglés/Español)

### Modelo de Datos (Contract-Centric)

EasyLease usa una arquitectura centrada en contratos:

- **Owner** → Propietarios de las propiedades
- **Listing** → Propiedades disponibles para alquilar
- **Tenant** → Inquilinos
- **Contract** ⭐ → Entidad central que vincula Tenant + Listing + Owner

**Principios clave:**
- ✅ Los tenants se vinculan a propiedades mediante Contracts
- ✅ Toda la información del arriendo (fechas, renta, términos) vive en Contracts
- ❌ No hay relación directa tenant-to-listing

📖 **[Ver documentación completa del modelo de datos](../docs/DATA_MODEL.md)**

### Funcionalidades
- ✅ **Gestión Completa de Listings** (propiedades)
  - Ver, crear, editar y eliminar
  - Subir fotos desde cámara del dispositivo
  
- ✅ **Gestión Completa de Leads** (contactos)
  - Ver, editar y gestionar estados
  - Comunicación directa (llamadas, emails)
  - Estados: new, contacted, converted, discarded
  
- ✅ **Gestión Completa de Owners** (propietarios)
  - Ver, crear, editar
  - Estados: active, pending, inactive

- ✅ **Gestión Completa de Tenants** (inquilinos)
  - Ver, crear, editar
  - Asignar contratos
  - Estados: active, ending_soon, ended, available

- ✅ **Gestión de Contracts** (contratos)
  - Crear y asignar contratos
  - Vincular tenant + listing + owner
  - Gestión de términos y condiciones
  - Terminación de contratos
  
- 🔔 **Push Notifications**
  - Notificaciones cuando lleguen nuevos leads
  - Alertas de cambios importantes
  
- 📸 **Cámara & Multimedia**
  - Capturar fotos directamente para listings
  - Galería de imágenes

---

## 📁 Estructura del Proyecto

```
easylease-admin-app/
├── app/                    # Expo Router - rutas basadas en archivos
│   ├── (auth)/            # Grupo de autenticación
│   │   └── login.tsx      # Pantalla de login
│   ├── (tabs)/            # Navegación principal por tabs
│   │   ├── index.tsx      # Dashboard
│   │   ├── listings.tsx   # Lista de propiedades
│   │   ├── leads.tsx      # Lista de leads
│   │   ├── owners.tsx     # Lista de owners
│   │   └── tenants.tsx    # Lista de tenants
│   ├── listing/           # Detalle y creación de propiedades
│   ├── lead/              # Detalle y creación de leads
│   ├── owner/             # Detalle y creación de owners
│   ├── tenant/            # Detalle y creación de tenants
│   ├── contract/          # Creación y gestión de contratos
│   └── _layout.tsx        # Layout raíz
├── components/            # Componentes reutilizables
│   ├── listings/
│   ├── leads/
│   ├── owners/
│   ├── tenants/
│   └── ui/               # Componentes UI base (Tamagui)
├── lib/                  # Utilidades y configuración
│   ├── api.ts           # Cliente API
│   ├── auth.ts          # Helpers de autenticación
│   └── notifications.ts # Push notifications
├── hooks/               # Custom hooks
├── types/               # TypeScript types/interfaces
└── constants/           # Constantes y configuración
    ├── Colors.ts
    └── Config.ts
```

---

## 🎨 Paleta de Colores

Consistente con el frontend-admin:

```typescript
// Colores principales
Primary: Steel Blue #4D7EA8    // Navegación, botones principales
Accent: Rose Quartz #9E90A2     // Elementos destacados
Secondary: Powder Blue #B6C2D9  // Backgrounds secundarios
Coral: #E89E8C                  // CTAs, leads
Green: #7BA89E                  // Success, partners
Red: #D97373                    // Errores, alertas

// Neutrales
Raisin Black: #272932           // Texto principal
Gray: #828489                   // Texto secundario
Background: #F5F6F8             // Fondo general
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
node >= 18.x
npm >= 9.x
Expo CLI instalada globalmente (opcional)
```

### Instalación
```bash
cd easylease-admin-app
npm install

# Instalar dependencias adicionales
npm install @tamagui/config tamagui expo-camera expo-notifications
npm install @react-navigation/native expo-secure-store axios
```

### Variables de Entorno
Crear archivo `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_WEB_URL=http://localhost:3000
```

### Ejecutar
```bash
# iOS
npm run ios

# Android
npm run android

# Web (para desarrollo rápido)
npm run web
```

---

## 📋 Roadmap de Desarrollo

### Fase 1: Setup Base (Semana 1)
- [x] Crear proyecto con Expo
- [ ] Configurar Tamagui
- [ ] Configurar Expo Router
- [ ] Setup de TypeScript y ESLint
- [ ] Configurar cliente API
- [ ] Crear README

### Fase 2: Autenticación (Semana 1-2)
- [ ] Pantalla de login
- [ ] Implementar JWT authentication
- [ ] Secure storage de tokens
- [ ] Protección de rutas
- [ ] Logout y refresh tokens

### Fase 3: Dashboard & Listings (Semana 2-3)
- [ ] Dashboard con estadísticas
- [ ] Lista de listings
- [ ] Detalle de listing
- [ ] Crear/editar listing
- [ ] Integrar cámara para fotos
- [ ] Upload de imágenes a servidor

### Fase 4: Leads Management (Semana 3)
- [ ] Lista de leads
- [ ] Detalle de lead
- [ ] Editar estado de lead
- [ ] Acciones rápidas (call, email)
- [ ] Filtros y búsqueda

### Fase 5: Partners Management (Semana 4)
- [ ] Lista de partners
- [ ] Detalle de partner
- [ ] Crear/editar partner
- [ ] Gestión de estados

### Fase 6: Push Notifications (Semana 4-5)
- [ ] Configurar Expo Notifications
- [ ] Backend: envío de notificaciones
- [ ] Notificación de nuevos leads
- [ ] Configuración de preferencias
- [ ] Badge counts

### Fase 7: Polish & Testing (Semana 5-6)
- [ ] Optimización de rendimiento
- [ ] Manejo de errores
- [ ] Estados de loading
- [ ] Testing básico
- [ ] Iconos y splash screen
- [ ] Build para stores

---

## 🔐 Autenticación JWT

### Flujo
1. Admin ingresa credenciales en login
2. API valida y retorna JWT token
3. Token se guarda en `expo-secure-store`
4. Todas las peticiones incluyen token en headers
5. Refresh automático cuando expira

### Endpoints API
```typescript
POST /api/auth/login     // Login de admin
POST /api/auth/refresh   // Refresh token
POST /api/auth/logout    // Logout
GET  /api/auth/me        // Info del admin actual
```

---

## 📸 Uso de Cámara

```typescript
// Permisos necesarios en app.json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow EasyLease to access your camera to take photos of properties."
        }
      ]
    ]
  }
}
```

---

## 🔔 Push Notifications

### Setup
```bash
# Configurar en app.json
{
  "expo": {
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#4D7EA8"
    }
  }
}
```

### Triggers
- Nuevo lead creado
- Lead convertido
- Listing reservado/alquilado
- Partner actualizado

---

## 🌍 Internacionalización (i18n)

La aplicación está totalmente traducida a **Inglés** y **Español**.

### Configuración

El sistema de i18n está basado en:
- `i18n-js` - Gestión de traducciones
- `expo-localization` - Detección automática del idioma del dispositivo

### Estructura de Traducciones

```typescript
lib/i18n/
├── index.ts          # Configuración principal
└── locales/
    ├── en.json       # Traducciones en inglés
    └── es.json       # Traducciones en español
```

### Uso en Componentes

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t, language, changeLanguage } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.welcome')}</Text>
      <Button onPress={() => changeLanguage('es')}>
        Cambiar a Español
      </Button>
    </View>
  );
}
```

### Idiomas Soportados

| Código | Idioma | Completo |
|--------|--------|----------|
| `en`   | English | ✅ |
| `es`   | Español | ✅ |

### Detección Automática

Al iniciar la app:
1. Se detecta el idioma del dispositivo
2. Si el idioma está soportado, se usa automáticamente
3. Si no, se usa inglés por defecto
4. El usuario puede cambiar el idioma manualmente en Settings

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests (con Detox)
npm run test:e2e
```

---

## 📦 Build & Deploy

### Development Build
```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Production Build
```bash
eas build --profile production --platform all
```

### Submit to Stores
```bash
eas submit -p ios
eas submit -p android
```

---

## 🤝 Contribución

Este proyecto es parte del ecosistema EasyLease:
- `easylease-api` - Backend API (contract-centric architecture)
- `easylease-frontend-web` - Sitio público
- `easylease-frontend-admin` - Panel web de administración
- `easylease-admin-app` - App móvil de administración (este proyecto)

---

## 📝 Notas Importantes

- **No olvidar**: La app usa la misma API que el panel web
- **Seguridad**: Tokens JWT guardados en secure storage
- **Offline**: Considerar modo offline para consultas (futuro)
- **Performance**: Lazy loading de imágenes
- **UX**: Feedback visual en todas las acciones

---

## 📧 Contacto

Para dudas sobre el proyecto, contactar al equipo de desarrollo.

---

**Última actualización**: Noviembre 2025
**Versión**: 0.1.0 (En desarrollo)
