# 🔄 Flujos de Usuario - Diagrama Completo

## 🎯 Modelo SaaS Multi-Tenant

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN (TÚ)                         │
│  Dashboard Global | Métricas | Gestión de Cuentas | Pagos      │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
        ┌─────────────────────┐     ┌─────────────────────┐
        │   ADMIN EDIFICIO A  │     │   ADMIN EDIFICIO B  │
        │   (Cliente 1)       │     │   (Cliente 2)       │
        └─────────────────────┘     └─────────────────────┘
                    │                           │
        ┌───────────┼───────────┐   ┌──────────┼──────────┐
        ▼           ▼           ▼   ▼          ▼          ▼
    Edificio 1  Edificio 2      │  Edificio 3 Edificio 4
        │           │            │      │          │
        ▼           ▼            ▼      ▼          ▼
    Inquilinos  Inquilinos   Inquilinos Inquilinos Inquilinos
```

---

## 📝 Flujo 1: Registro de Administrador

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                                 │
│  [Iniciar Sesión]  [Registrarse como Administrador]            │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              FORMULARIO DE REGISTRO (ADMIN)                     │
│  • Email: ____________________                                  │
│  • Nombre: ___________________                                  │
│  • Empresa (opcional): ________                                 │
│  • Contraseña: _______________                                  │
│  [ ] Acepto términos y condiciones                             │
│                                                                 │
│  [Crear cuenta gratis - Trial 30 días]                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│         CUENTA CREADA CON STATUS: PENDING                       │
│         emailVerified: null                                     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EMAIL DE VERIFICACIÓN                          │
│  ┌────────────────────────────────────────────────────┐        │
│  │ ¡Bienvenido a BuildingMS!                          │        │
│  │                                                     │        │
│  │ Verifica tu email para comenzar:                   │        │
│  │ [Verificar mi cuenta]                              │        │
│  │                                                     │        │
│  │ Expira en 24 horas                                 │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│   CLICK EN LINK → /verify-email?token=abc123                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│         STATUS ACTUALIZADO: ACTIVE                              │
│         emailVerified: 2026-02-28 10:30:00                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              ONBOARDING: CREAR PRIMER EDIFICIO                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │ ¡Cuenta verificada! Crea tu primer edificio:       │        │
│  │                                                     │        │
│  │ Nombre: Torre Central                              │        │
│  │ Dirección: Av. Corrientes 1234                     │        │
│  │ Pisos: 10                                          │        │
│  │ Unidades: 40                                       │        │
│  │                                                     │        │
│  │ [Crear edificio →]                                 │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DASHBOARD PRINCIPAL                           │
│  Bienvenido! Ya puedes empezar a gestionar tu edificio         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👥 Flujo 2: Invitación de Inquilino

```
┌─────────────────────────────────────────────────────────────────┐
│         ADMIN EN DASHBOARD → Gestión de Unidades               │
│  ┌────────────────────────────────────────────────────┐        │
│  │ Torre Central - Piso 5                             │        │
│  │                                                     │        │
│  │ Unidad 5A: [Ocupada] Juan Pérez                    │        │
│  │ Unidad 5B: [Vacante] [+ Invitar Inquilino]  ←─────┘        │
│  │ Unidad 5C: [Vacante] [+ Invitar Inquilino]                 │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│            MODAL: INVITAR INQUILINO A UNIDAD 5B                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │ Email del inquilino:                               │        │
│  │ [inquilino@email.com]                              │        │
│  │                                                     │        │
│  │ Fecha de inicio:                                   │        │
│  │ [01/03/2026]                                       │        │
│  │                                                     │        │
│  │ [Cancelar]  [Enviar invitación]                    │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  SISTEMA CREA: TenantInvitation                                 │
│  • email: inquilino@email.com                                   │
│  • token: xyz789abc (único)                                     │
│  • unitId: 5B                                                   │
│  • buildingId: Torre Central                                    │
│  • expiresAt: 7 días                                            │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              EMAIL DE INVITACIÓN AL INQUILINO                   │
│  ┌────────────────────────────────────────────────────┐        │
│  │ Has sido invitado como inquilino                   │        │
│  │                                                     │        │
│  │ 🏢 Edificio: Torre Central                         │        │
│  │ 🏠 Unidad: 5B                                      │        │
│  │ 📅 Desde: 01/03/2026                               │        │
│  │                                                     │        │
│  │ [Aceptar invitación]                               │        │
│  │                                                     │        │
│  │ Invitado por: admin@edificio.com                   │        │
│  │ Expira en 7 días                                   │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  INQUILINO CLICK → /accept-invitation?token=xyz789abc           │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│         PÁGINA DE ACEPTACIÓN DE INVITACIÓN                      │
│  ┌────────────────────────────────────────────────────┐        │
│  │ Aceptar invitación                                 │        │
│  │                                                     │        │
│  │ Serás inquilino de:                                │        │
│  │ Torre Central - Unidad 5B                          │        │
│  │                                                     │        │
│  │ Nombre completo:                                   │        │
│  │ [________________]                                 │        │
│  │                                                     │        │
│  │ Teléfono (opcional):                               │        │
│  │ [________________]                                 │        │
│  │                                                     │        │
│  │ Crear contraseña:                                  │        │
│  │ [________________]                                 │        │
│  │                                                     │        │
│  │ [Aceptar y crear cuenta]                           │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  SISTEMA CREA:                                                  │
│  1. User (role: TENANT, email verificado automáticamente)      │
│  2. Tenant (vinculado a unitId: 5B)                            │
│  3. Marca invitación como acceptedAt: now()                    │
│  4. Actualiza Unit status: OCCUPIED                            │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              AUTO-LOGIN Y REDIRECCIÓN                           │
│              → /tenant/dashboard                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Flujo 3: Verificación de Email

```
NUEVO USUARIO (ADMIN)
    │
    ▼
Registro → User creado
    │       • emailVerified: null
    │       • verificationToken: "abc123xyz"
    │
    ▼
Email enviado → "Verifica tu cuenta"
    │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
NO VERIFICA            VERIFICA
(24h expira)           (click link)
    │                       │
    ▼                       ▼
❌ No puede           ✅ emailVerified: now()
   acceder              ✅ Puede acceder
    │                       ▼
    ▼                  Onboarding
Puede pedir              (crear edificio)
reenvío de email
```

---

## 🏢 Flujo 4: Aislamiento Multi-Tenant

```
┌──────────────────────────────────────────────────────────────┐
│                    ADMIN 1 LOGIN                             │
│                    userId: user-abc                          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Query: await prisma.building.findMany({                     │
│    where: { adminId: "user-abc" }  ← FILTRO OBLIGATORIO     │
│  })                                                          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  RESULTADO: Solo edificios donde adminId = "user-abc"       │
│  • Torre Central (su edificio)                              │
│  • Edificio Norte (su edificio)                             │
│                                                              │
│  NO VE:                                                      │
│  • Torre Sur (de otro admin) ← Aislado                      │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                    TENANT LOGIN                              │
│                    userId: tenant-123                        │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Query: await prisma.tenant.findUnique({                     │
│    where: { userId: "tenant-123" },                         │
│    include: { building, unit }                              │
│  })                                                          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  RESULTADO: Solo SU información                              │
│  • Building: Torre Central                                   │
│  • Unit: 5B                                                  │
│  • Sus pagos                                                 │
│  • Sus avisos                                                │
│                                                              │
│  NO VE:                                                      │
│  • Otros inquilinos ← Privacidad                            │
│  • Otros edificios ← Aislado                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 👑 Flujo 5: Super Admin (Tú)

```
┌──────────────────────────────────────────────────────────────┐
│              SUPER ADMIN DASHBOARD                           │
│                                                              │
│  📊 MÉTRICAS GLOBALES                                        │
│  ┌────────────┬────────────┬────────────┬────────────┐     │
│  │ Admins     │ Edificios  │ Inquilinos │ Revenue    │     │
│  │ 24         │ 87         │ 1,245      │ $12,400    │     │
│  └────────────┴────────────┴────────────┴────────────┘     │
│                                                              │
│  📈 GRÁFICO DE CRECIMIENTO                                   │
│  [Gráfico de nuevos registros por mes]                      │
│                                                              │
│  👥 GESTIÓN DE ADMINS                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ admin1@email.com | ACTIVE   | 3 edificios | [Ver] │    │
│  │ admin2@email.com | PENDING  | 0 edificios | [Ver] │    │
│  │ admin3@email.com | SUSPENDED| 1 edificios | [Ver] │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🏢 TODOS LOS EDIFICIOS                                      │
│  [Lista global de todos los edificios de todos los admins]  │
│                                                              │
│  💰 PAGOS/SUSCRIPCIONES                                      │
│  [Estado de pagos de cada admin]                            │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Flujo 6: Estados de Cuenta

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN STATUS: ACTIVE                           │
│              ✅ Todo funciona normal                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ADMIN STATUS: PENDING                          │
│              ⏳ No puede acceder hasta verificar email      │
│              Muestra: "Verifica tu email para continuar"    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ADMIN STATUS: SUSPENDED                        │
│              ⚠️  Falta de pago / Violación términos         │
│              Solo puede:                                     │
│              • Ver sus datos (read-only)                    │
│              • Actualizar método de pago                    │
│              No puede:                                       │
│              • Crear/editar/eliminar nada                   │
│              Muestra: "Renueva tu suscripción"              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ADMIN STATUS: CANCELLED                        │
│              ❌ Cuenta cerrada                               │
│              • No puede hacer login                          │
│              • Data archivada (soft delete)                  │
│              • Puede reactivar contactando soporte          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Matriz de Permisos

```
┌──────────────────┬──────────────┬──────────┬──────────┐
│ ACCIÓN           │ SUPER_ADMIN  │ ADMIN    │ TENANT   │
├──────────────────┼──────────────┼──────────┼──────────┤
│ Ver Dashboard    │ Global       │ Suyo     │ Suyo     │
│ Crear Edificio   │ ✅ Todos     │ ✅ Suyo  │ ❌       │
│ Editar Edificio  │ ✅ Todos     │ ✅ Suyo  │ ❌       │
│ Ver Edificios    │ ✅ Todos     │ Solo suyo│ Solo suyo│
│ Invitar Tenant   │ ✅ Todos     │ ✅ Suyo  │ ❌       │
│ Ver Inquilinos   │ ✅ Todos     │ Solo suyo│ ❌       │
│ Crear Avisos     │ ✅ Todos     │ ✅ Suyo  │ ❌       │
│ Ver Avisos       │ ✅ Todos     │ ✅ Suyo  │ ✅ Suyo  │
│ Ver Pagos        │ ✅ Todos     │ ✅ Suyo  │ ✅ Suyo  │
│ Suspender Admin  │ ✅           │ ❌       │ ❌       │
│ Ver Métricas     │ ✅ Global    │ ✅ Suyo  │ ❌       │
└──────────────────┴──────────────┴──────────┴──────────┘
```

---

## ✅ Resumen de Protecciones

1. **TENANT no puede auto-registrarse** → Solo por invitación
2. **ADMIN ve solo sus edificios** → Multi-tenancy
3. **TENANT ve solo su unidad** → Privacidad
4. **Email verificado obligatorio** → Seguridad
5. **Invitaciones con expiración** → Control
6. **SUPER_ADMIN ve todo** → Gestión completa
7. **Status de cuenta** → Control de pagos
8. **Filtros automáticos** → No puede hackear queries

---

**Este es el flujo completo. ¿Te parece bien? ¿Quieres que empecemos a implementarlo?**
