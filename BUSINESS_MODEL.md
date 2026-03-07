# 🏢 Modelo de Negocio - Sistema SaaS Multi-Tenant

## 📊 Estructura Propuesta

### Roles del Sistema

```typescript
enum UserRole {
  SUPER_ADMIN  // Tú/tu empresa - control total
  ADMIN        // Administradores de edificios (clientes)
  TENANT       // Inquilinos
}

enum AdminStatus {
  PENDING      // Esperando verificación de email
  ACTIVE       // Verificado y activo
  SUSPENDED    // Suspendido por falta de pago
  CANCELLED    // Cuenta cancelada
}
```

---

## 🔄 Flujos de Usuario

### 1. Registro de Administrador (Cliente Nuevo)

```
Usuario visita landing → Click "Registrarse como Administrador"
    ↓
Formulario de registro (solo nombre, email, password)
    ↓
Se crea cuenta con status PENDING
    ↓
Email de verificación enviado
    ↓
Usuario verifica email → status cambia a ACTIVE
    ↓
Onboarding: Crear primer edificio
    ↓
(Opcional) Seleccionar plan de pago
```

**Características:**
- ✅ Auto-registro permitido
- ✅ Verificación de email obligatoria
- ✅ No puede usar el sistema hasta verificar
- ✅ Trial de 30 días (opcional)

---

### 2. Invitación de Inquilino

```
Admin va a "Gestión de Unidades"
    ↓
Selecciona unidad → "Invitar Inquilino"
    ↓
Ingresa email del inquilino
    ↓
Sistema genera token de invitación único
    ↓
Email enviado: "Has sido invitado a [Edificio X], Unidad [Y]"
    ↓
Inquilino click en link → Formulario simple (nombre, password)
    ↓
Cuenta TENANT creada automáticamente vinculada a unidad
```

**Características:**
- ✅ Inquilinos NO pueden auto-registrarse
- ✅ Solo por invitación del admin
- ✅ Automáticamente vinculados a unidad correcta
- ✅ Email único por inquilino

---

### 3. Super Admin (Tú)

```
Login con credenciales especiales
    ↓
Dashboard global:
    - Ver todos los edificios
    - Ver todos los admins
    - Ver estadísticas globales
    - Suspender/activar cuentas
    - Ver pagos/suscripciones
```

**Características:**
- ✅ Acceso total a toda la data
- ✅ No editable por otros usuarios
- ✅ Dashboard especial con métricas del negocio

---

## 🗄️ Cambios en el Modelo de Datos

### Nuevo Schema Prisma

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  TENANT
}

enum AdminStatus {
  PENDING
  ACTIVE
  SUSPENDED
  CANCELLED
}

model User {
  id                String      @id @default(uuid())
  email             String      @unique
  password          String
  name              String
  phone             String?
  role              UserRole    @default(TENANT)
  emailVerified     DateTime?   // Nueva
  verificationToken String?     // Nueva
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  adminProfile      AdminProfile?
  tenant            Tenant?
  // ... resto de relaciones
}

// Nuevo modelo
model AdminProfile {
  id              String       @id @default(uuid())
  userId          String       @unique
  status          AdminStatus  @default(PENDING)
  company         String?      // Nombre de la empresa/consorcio
  subscriptionId  String?      // Para pagos (Stripe/MercadoPago)
  trialEndsAt     DateTime?    // Trial de 30 días
  suspendedAt     DateTime?
  cancelledAt     DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status])
  @@index([userId])
}

// Nuevo modelo
model TenantInvitation {
  id         String    @id @default(uuid())
  email      String
  token      String    @unique
  buildingId String
  unitId     String
  invitedBy  String    // Admin que invitó
  expiresAt  DateTime
  acceptedAt DateTime?
  createdAt  DateTime  @default(now())

  building   Building  @relation(fields: [buildingId], references: [id], onDelete: Cascade)
  unit       Unit      @relation(fields: [unitId], references: [id], onDelete: Cascade)
  inviter    User      @relation(fields: [invitedBy], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([email])
  @@index([unitId])
}
```

---

## 🎯 Reglas de Negocio

### Auto-Registro

| Rol | Puede auto-registrarse | Requiere verificación | Requiere aprobación |
|-----|------------------------|----------------------|---------------------|
| SUPER_ADMIN | ❌ No (solo creación manual) | - | - |
| ADMIN | ✅ Sí | ✅ Email | ❌ No (auto-aprobado) |
| TENANT | ❌ No (solo invitación) | ✅ Email | - |

### Permisos por Rol

| Acción | SUPER_ADMIN | ADMIN | TENANT |
|--------|-------------|-------|--------|
| Ver todos los edificios | ✅ | Solo los suyos | ❌ |
| Crear edificios | ✅ | ✅ | ❌ |
| Invitar inquilinos | ✅ | Solo a sus edificios | ❌ |
| Ver todas las estadísticas | ✅ | Solo sus edificios | ❌ |
| Suspender cuentas | ✅ | ❌ | ❌ |
| Ver pagos globales | ✅ | ❌ | ❌ |

---

## 💰 Modelo de Monetización (Opcional)

### Plan Freemium

```
GRATIS (Trial 30 días):
  - 1 edificio
  - Hasta 20 unidades
  - Funciones básicas

BÁSICO ($20/mes):
  - 3 edificios
  - Hasta 100 unidades
  - Todas las funciones
  - Soporte email

PRO ($50/mes):
  - Edificios ilimitados
  - Unidades ilimitadas
  - Reportes avanzados
  - Soporte prioritario
  - White-label

ENTERPRISE (Custom):
  - Todo lo de PRO
  - API access
  - Integración custom
  - Soporte dedicado
```

---

## 🔐 Seguridad Mejorada

### Verificación de Email

```typescript
// Al registrarse
1. Crear usuario con emailVerified = null
2. Generar token único
3. Enviar email con link: /verify-email?token=xxx
4. Al verificar, actualizar emailVerified = now()
5. Permitir acceso al sistema
```

### Invitaciones

```typescript
// Al invitar inquilino
1. Verificar que admin sea dueño del edificio
2. Verificar que unidad esté disponible
3. Generar token único con expiración 7 días
4. Enviar email con link: /accept-invitation?token=xxx
5. Al aceptar, crear usuario TENANT vinculado a unidad
```

### Multi-Tenancy (Aislamiento de Datos)

```typescript
// Cada admin solo ve SUS edificios
const buildings = await prisma.building.findMany({
  where: {
    adminId: session.userId, // 👈 Filtro obligatorio
  },
});

// Los inquilinos solo ven su edificio/unidad
const myData = await prisma.tenant.findUnique({
  where: {
    userId: session.userId,
  },
  include: {
    unit: true,
    building: true,
  },
});
```

---

## 🚀 Implementación Paso a Paso

### Fase 1: Estructura Base (Ya hecha ✅)
- [x] Sistema de auth
- [x] Roles básicos

### Fase 2: Multi-Tenancy (Siguiente)
- [ ] Agregar AdminProfile model
- [ ] Agregar TenantInvitation model
- [ ] Agregar verificación de email
- [ ] Middleware de aislamiento de datos

### Fase 3: Invitaciones
- [ ] API para enviar invitaciones
- [ ] Página de aceptación de invitación
- [ ] Sistema de emails (Resend/SendGrid)

### Fase 4: Super Admin Dashboard
- [ ] Dashboard global
- [ ] Gestión de admins
- [ ] Métricas del negocio
- [ ] Control de suscripciones

### Fase 5: Pagos (Opcional)
- [ ] Integración Stripe/MercadoPago
- [ ] Webhooks de pago
- [ ] Suspensión automática por falta de pago

---

## 📧 Plantillas de Email

### Email de Verificación
```
¡Bienvenido a [Tu App]!

Verifica tu email para comenzar a gestionar tus edificios.

[Verificar Email]

Este link expira en 24 horas.
```

### Email de Invitación a Inquilino
```
Has sido invitado como inquilino

Edificio: Torre Central
Unidad: 5B

[Aceptar Invitación]

Este link expira en 7 días.
```

---

## 🎨 UX Mejorado

### Página de Registro (para ADMIN)

```
¿Eres administrador de un edificio?

[ ] Email
[ ] Nombre completo
[ ] Contraseña
[x] Acepto términos y condiciones

[Crear cuenta gratis] → Trial 30 días
```

### Página de Invitación (para TENANT)

```
[Logo del Edificio]

Has sido invitado a:
Torre Central - Unidad 5B

[ ] Nombre completo
[ ] Teléfono (opcional)
[ ] Crear contraseña

[Aceptar invitación]
```

---

## ✅ Checklist de Implementación

- [ ] Actualizar schema Prisma con nuevos modelos
- [ ] Crear API de verificación de email
- [ ] Crear API de invitaciones
- [ ] Actualizar middleware con verificación de email
- [ ] Crear página /verify-email
- [ ] Crear página /accept-invitation
- [ ] Agregar filtro de multi-tenancy en todas las queries
- [ ] Crear dashboard de SUPER_ADMIN
- [ ] Configurar servicio de emails
- [ ] Testing completo del flujo

---

## 🎯 Resultado Final

**Para el Cliente (Admin):**
- Se registra fácilmente
- Verifica su email
- Crea su edificio
- Invita a sus inquilinos
- Gestiona todo desde un dashboard limpio

**Para el Inquilino:**
- Recibe invitación por email
- Acepta en 2 clicks
- Accede a su información
- Ve avisos, pagos, documentos

**Para Ti (Super Admin):**
- Dashboard con todas las métricas
- Control total del negocio
- Fácil monetización
- Escalable a miles de edificios

---

**¿Te gusta este modelo? ¿O prefieres uno de los otros?**
