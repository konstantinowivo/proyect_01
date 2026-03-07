# 💰 Modelo de Pricing - Building Management System

## 🎯 Estrategia Recomendada: Por Cantidad de Unidades

### ¿Por qué cobrar por unidades y no por inquilinos?

- ✅ **Más predecible** para el cliente (el edificio no cambia de tamaño)
- ✅ **Más estable** para tu revenue (no sube/baja con rotación de inquilinos)
- ✅ **Más fácil de explicar** ("$X por cada Y unidades")
- ✅ **Evita gaming del sistema** (admin no puede "borrar" inquilinos para pagar menos)

---

## 📊 Planes Propuestos

### 🆓 PLAN GRATIS (Trial 14 días → luego limitado)
```
Precio: $0/mes
Límites:
  • 1 edificio
  • Hasta 10 unidades
  • Hasta 10 inquilinos
  • Funciones básicas

Ideal para: Edificios pequeños o testing
```

### 🏢 PLAN BÁSICO
```
Precio: $15/mes
Límites:
  • 1 edificio
  • Hasta 30 unidades
  • Inquilinos ilimitados
  • Todas las funciones core
  • Soporte por email

Ideal para: Edificio mediano (hasta 30 deptos)
```

### 🏘️ PLAN PROFESIONAL
```
Precio: $35/mes
Límites:
  • Hasta 3 edificios
  • Hasta 100 unidades totales
  • Inquilinos ilimitados
  • Todas las funciones
  • Reportes avanzados
  • Soporte prioritario

Ideal para: Pequeña inmobiliaria o consorcio
```

### 🏙️ PLAN ENTERPRISE
```
Precio: $70/mes
Límites:
  • Edificios ilimitados
  • Hasta 300 unidades totales
  • Inquilinos ilimitados
  • Todas las funciones premium
  • API access
  • White-label (opcional)
  • Soporte dedicado

Ideal para: Gran inmobiliaria o administradora
```

### ⭐ PLAN CUSTOM
```
Precio: A medida
Límites:
  • Más de 300 unidades
  • Todo personalizado
  • Integración custom
  • SLA garantizado
  • Account manager

Ideal para: Grandes empresas
```

---

## 📈 Crecimiento del Cliente (Path to Upgrade)

```
Nuevo Admin → Gratis (10 unidades) → Prueba el sistema
              ↓
         Le gusta → Básico ($15/mes) → 1 edificio pequeño
              ↓
      Crece → Profesional ($35/mes) → Agrega más edificios
              ↓
   Gran éxito → Enterprise ($70/mes) → Muchos edificios
              ↓
     Enorme → Custom (precio especial) → Cientos de edificios
```

---

## 🎁 Estrategia de Lanzamiento

### Fase 1: MVP (Primeros 6 meses)
```
GRATIS EXTENDIDO (30 días trial)
  • Hasta 20 unidades (más generoso)
  • Todas las funciones
  • Sin tarjeta de crédito

BÁSICO: $10/mes (50% descuento early adopter)
  • Hasta 30 unidades
  • Precio bloqueado por 1 año

PROFESIONAL: $25/mes (50% descuento)
  • Hasta 100 unidades
  • Precio bloqueado por 1 año
```

**Objetivo:** Conseguir primeros 50 clientes de pago

### Fase 2: Crecimiento (Mes 6-12)
```
Subir precios gradualmente a:
BÁSICO: $15/mes
PROFESIONAL: $35/mes
ENTERPRISE: $70/mes

Los early adopters mantienen su precio forever
```

---

## 🔢 Cálculo de Revenue

### Escenario Conservador (Año 1)
```
10 clientes Gratis       = $0/mes
20 clientes Básico      = $300/mes  ($15 x 20)
15 clientes Profesional = $525/mes  ($35 x 15)
5 clientes Enterprise   = $350/mes  ($70 x 5)
─────────────────────────────────────────
Total MRR (Monthly Recurring Revenue): $1,175/mes
ARR (Annual Recurring Revenue): $14,100/año
```

### Escenario Optimista (Año 2)
```
5 clientes Gratis       = $0/mes
50 clientes Básico      = $750/mes
30 clientes Profesional = $1,050/mes
15 clientes Enterprise  = $1,050/mes
3 clientes Custom       = $600/mes (promedio $200 c/u)
─────────────────────────────────────────
Total MRR: $3,450/mes
ARR: $41,400/año
```

---

## 🎯 Implementación Técnica

### Estructura en Base de Datos

```typescript
enum SubscriptionPlan {
  FREE
  BASIC
  PROFESSIONAL
  ENTERPRISE
  CUSTOM
}

model AdminProfile {
  id                String            @id @default(uuid())
  userId            String            @unique
  status            AdminStatus       @default(PENDING)

  // Suscripción
  plan              SubscriptionPlan  @default(FREE)
  maxBuildings      Int               @default(1)
  maxUnits          Int               @default(10)
  maxInvitations    Int               @default(10)  // por mes
  trialEndsAt       DateTime?
  subscriptionEndsAt DateTime?

  // Contadores actuales
  currentBuildings  Int               @default(0)
  currentUnits      Int               @default(0)

  // Pagos
  stripeCustomerId  String?
  stripeSubscriptionId String?

  user              User              @relation(fields: [userId], references: [id])
}
```

### Límites por Plan

```typescript
const PLAN_LIMITS = {
  FREE: {
    maxBuildings: 1,
    maxUnits: 10,
    maxInvitationsPerMonth: 10,
    price: 0,
    features: ['basic_dashboard', 'announcements', 'tenants', 'tasks']
  },
  BASIC: {
    maxBuildings: 1,
    maxUnits: 30,
    maxInvitationsPerMonth: 50,
    price: 15,
    features: ['basic_dashboard', 'announcements', 'tenants', 'tasks', 'payments', 'documents']
  },
  PROFESSIONAL: {
    maxBuildings: 3,
    maxUnits: 100,
    maxInvitationsPerMonth: 150,
    price: 35,
    features: ['all_basic', 'advanced_reports', 'priority_support', 'bulk_operations']
  },
  ENTERPRISE: {
    maxBuildings: -1, // ilimitado
    maxUnits: 300,
    maxInvitationsPerMonth: 500,
    price: 70,
    features: ['all_professional', 'api_access', 'custom_branding', 'dedicated_support']
  },
  CUSTOM: {
    maxBuildings: -1,
    maxUnits: -1,
    maxInvitationsPerMonth: -1,
    price: null, // custom
    features: ['everything']
  }
};
```

---

## 🚦 Validaciones al Crear Edificio/Unidad

```typescript
// Al crear un edificio
async function createBuilding(adminId, buildingData) {
  const adminProfile = await getAdminProfile(adminId);

  // Verificar límite de edificios
  if (adminProfile.currentBuildings >= adminProfile.maxBuildings) {
    throw new Error('Has alcanzado el límite de edificios de tu plan. Upgrade para agregar más.');
  }

  // Verificar límite de unidades totales
  const totalUnits = adminProfile.currentUnits + buildingData.totalUnits;
  if (totalUnits > adminProfile.maxUnits) {
    throw new Error(`Tu plan permite hasta ${adminProfile.maxUnits} unidades. Tienes ${adminProfile.currentUnits} y quieres agregar ${buildingData.totalUnits}. Upgrade tu plan.`);
  }

  // Todo OK, crear edificio
  const building = await prisma.building.create({ data: buildingData });

  // Actualizar contadores
  await updateAdminCounters(adminId);

  return building;
}
```

---

## 💳 Integración de Pagos

### Opción 1: Stripe (Internacional)
```
✅ Fácil de implementar
✅ Suscripciones automáticas
✅ Webhooks para actualizar estado
✅ Acepta tarjetas internacionales
❌ Comisión 2.9% + $0.30 por transacción
```

### Opción 2: MercadoPago (LATAM)
```
✅ Popular en Argentina/LATAM
✅ Suscripciones automáticas
✅ Webhooks
✅ Acepta pagos locales
❌ Comisión ~3-5%
```

### Opción 3: Híbrido (Recomendado para inicio)
```
• Stripe para internacional
• MercadoPago para LATAM
• Transferencia bancaria para grandes clientes
```

---

## 📱 UX del Upgrade

### Escenario: Admin llega al límite

```
┌────────────────────────────────────────────────────┐
│  ⚠️  Has alcanzado el límite de tu plan           │
│                                                    │
│  Plan actual: GRATIS                               │
│  Edificios: 1/1 ✅                                 │
│  Unidades: 10/10 ✅                                │
│                                                    │
│  Para agregar más unidades, upgrade tu plan:      │
│                                                    │
│  [BÁSICO - $15/mes]    → Hasta 30 unidades        │
│  [PROFESIONAL - $35/mes] → Hasta 100 unidades     │
│                                                    │
│  [Ver todos los planes]                           │
└────────────────────────────────────────────────────┘
```

### Página de Pricing

```
┌─────────────────────────────────────────────────────┐
│              Elige tu plan                          │
│                                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │GRATIS│  │BÁSICO│  │ PRO  │  │ENTER │          │
│  │      │  │      │  │FESIO-│  │PRISE │          │
│  │      │  │      │  │ NAL  │  │      │          │
│  ├──────┤  ├──────┤  ├──────┤  ├──────┤          │
│  │ $0   │  │ $15  │  │ $35  │  │ $70  │          │
│  │/mes  │  │/mes  │  │/mes  │  │/mes  │          │
│  ├──────┤  ├──────┤  ├──────┤  ├──────┤          │
│  │1 edif│  │1 edif│  │3 edif│  │Ilimit│          │
│  │10 uni│  │30 uni│  │100uni│  │300uni│          │
│  │      │  │      │  │Report│  │API   │          │
│  │      │  │      │  │Priori│  │White │          │
│  │      │  │      │  │      │  │label │          │
│  └──────┘  └──────┘  └──────┘  └──────┘          │
│  [Actual]  [Elegir]  [Elegir]  [Elegir]          │
└─────────────────────────────────────────────────────┘
```

---

## 🎁 Extras para Aumentar Conversión

### 1. Trial Extendido
```
"Prueba GRATIS por 30 días - No requiere tarjeta"
```

### 2. Garantía de Devolución
```
"Si no te gusta, te devolvemos el dinero en los primeros 30 días"
```

### 3. Descuento Anual
```
Pago mensual: $15/mes
Pago anual: $150/año (ahorras $30 = 2 meses gratis)
```

### 4. Descuento por Referidos
```
"Invita a otro administrador y ambos reciben 1 mes gratis"
```

### 5. Early Adopter Lifetime Deal
```
"Los primeros 100 clientes pagan $10/mes forever"
```

---

## 🚀 Roadmap de Monetización

### Mes 1-2: Lanzamiento
- [ ] Implementar límites por plan
- [ ] Página de pricing
- [ ] Sistema de upgrade/downgrade
- [ ] Trial de 30 días

### Mes 3-4: Pagos
- [ ] Integrar Stripe/MercadoPago
- [ ] Webhooks para actualizar suscripciones
- [ ] Email de recordatorio de pago
- [ ] Suspensión automática por falta de pago

### Mes 5-6: Optimización
- [ ] A/B testing de precios
- [ ] Analytics de conversión
- [ ] Emails de retención
- [ ] Programa de referidos

---

## 💡 Recomendación Final

### Para empezar HOY:

```
1. Implementa los límites técnicos (max edificios, max unidades)
2. Crea la página de planes (sin pagos aún)
3. Permite cambiar plan manualmente (tú lo actualizas en DB)
4. Agrega trial de 30 días
5. Lanza a primeros clientes beta GRATIS

Luego de 1-2 meses con feedback:
6. Integra pagos con Stripe
7. Automatiza todo
8. Escala
```

---

## 📊 KPIs a Trackear

```
• Signups (registros)
• Conversion rate (trial → pago)
• Churn rate (cancelaciones)
• MRR (monthly recurring revenue)
• LTV (lifetime value del cliente)
• CAC (costo de adquirir cliente)
```

---

**¿Te gusta este modelo? ¿Cambiarias algo de los precios/límites?**
