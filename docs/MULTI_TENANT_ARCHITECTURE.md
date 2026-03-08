# 🏢 Multi-Tenant Architecture

Este documento describe la arquitectura multi-tenant implementada en el sistema de gestión de edificios.

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Modelo de Datos](#modelo-de-datos)
3. [Separación de Datos](#separación-de-datos)
4. [Implementación de Seguridad](#implementación-de-seguridad)
5. [Guía para Desarrolladores](#guía-para-desarrolladores)
6. [Mejores Prácticas](#mejores-prácticas)

---

## Visión General

Este sistema implementa una arquitectura **multi-tenant de base de datos compartida** donde:

- Múltiples administradores (tenants) usan la misma aplicación
- Cada administrador solo puede ver y gestionar sus propios datos
- Los datos se separan lógicamente usando `adminId` como identificador de tenant
- La separación se aplica en **backend**, no solo en frontend

### Roles del Sistema

```
SUPER_ADMIN → Acceso total al sistema (futuro)
     ↓
   ADMIN → Gestiona edificios, unidades, inquilinos (TENANT)
     ↓
  TENANT → Inquilinos que ocupan unidades
```

---

## Modelo de Datos

### Jerarquía de Tenants

```
Admin (tenant_id = userId)
  └── Buildings (adminId)
       ├── Units (buildingId → adminId)
       ├── Tenants (buildingId → adminId)
       ├── Tasks (buildingId → adminId)
       ├── Payments (buildingId → adminId)
       ├── Announcements (buildingId → adminId)
       └── Documents (buildingId → adminId)
```

### Campos Clave

| Tabla | Campo Tenant | Descripción |
|-------|-------------|-------------|
| `Building` | `adminId` | ID del administrador (tenant) |
| `Unit` | `buildingId` | Referencia al edificio → `adminId` |
| `Tenant` | `buildingId` | Referencia al edificio → `adminId` |
| `Task` | `buildingId` | Referencia al edificio → `adminId` |
| `Payment` | `buildingId` | Referencia al edificio → `adminId` |

---

## Separación de Datos

### 1. Autenticación con JWT

Cuando un usuario inicia sesión, se genera un JWT con:

```typescript
interface JWTPayload {
  userId: string;    // Identificador único
  email: string;
  role: UserRole;    // ADMIN, TENANT, SUPER_ADMIN
}
```

Para administradores, el `userId` actúa como `tenant_id`.

### 2. Filtrado Automático

Todas las queries deben filtrar por tenant:

```typescript
// ❌ INCORRECTO - Acceso a todos los edificios
const buildings = await prisma.building.findMany();

// ✅ CORRECTO - Solo edificios del admin
const buildings = await prisma.building.findMany({
  where: {
    adminId: session.userId  // Filtro de tenant
  }
});
```

### 3. Helpers Centralizados

Usamos helpers en `src/lib/tenant-context.ts`:

```typescript
import { getBuildingTenantFilter } from '@/lib/tenant-context';

// Obtener filtro automático basado en el rol del usuario
const whereClause = getBuildingTenantFilter(session);

const buildings = await prisma.building.findMany({
  where: whereClause
});
```

---

## Implementación de Seguridad

### 1. Middleware de Prisma

En `src/lib/prisma.ts`, un middleware detecta queries sin filtro de tenant:

```typescript
prisma.$use(async (params, next) => {
  if (tenantScopedModels.includes(params.model)) {
    if (!hasTenantFilter(params.args.where)) {
      console.warn('⚠️  Query sin filtro de tenant detectada!');
      // En producción, lanzar error
    }
  }
  return next(params);
});
```

**Modelos protegidos:**
- Building
- Unit
- Tenant
- Task
- Payment
- Announcement
- Document
- Expense

### 2. Verificación de Ownership

```typescript
import { verifyBuildingOwnership } from '@/lib/tenant-context';

// Verificar que el building pertenece al admin
await verifyBuildingOwnership(prisma, buildingId, session.userId);
// Lanza error si no tiene acceso
```

### 3. Helpers Disponibles

| Helper | Uso |
|--------|-----|
| `getBuildingTenantFilter()` | Filtrar edificios |
| `getUnitTenantFilter()` | Filtrar unidades |
| `getTenantRecordFilter()` | Filtrar registros de inquilinos |
| `getTaskTenantFilter()` | Filtrar tareas |
| `getPaymentTenantFilter()` | Filtrar pagos |
| `verifyBuildingOwnership()` | Verificar propiedad de edificio |
| `verifyUnitOwnership()` | Verificar propiedad de unidad |
| `hasAccessToBuilding()` | Verificar acceso a edificio |

---

## Guía para Desarrolladores

### Al crear un nuevo endpoint API:

#### 1. Importar herramientas necesarias

```typescript
import { requireAuth } from '@/lib/auth';
import { getUnitTenantFilter } from '@/lib/tenant-context';
import { prisma } from '@/lib/prisma';
```

#### 2. Obtener sesión y aplicar filtro

```typescript
export async function GET(request: Request) {
  const session = requireAuth();

  // Usar helper para obtener filtro de tenant
  const whereClause = getUnitTenantFilter(session);

  // Agregar filtros adicionales
  whereClause.status = 'ACTIVE';

  const units = await prisma.unit.findMany({
    where: whereClause
  });

  return NextResponse.json({ data: units });
}
```

#### 3. Verificar ownership en operaciones de escritura

```typescript
export async function PUT(request: Request, { params }) {
  const session = requireAuth();

  // Verificar que el recurso pertenece al admin
  await verifyUnitOwnership(prisma, params.id, session.userId);

  // Proceder con la actualización
  const updated = await prisma.unit.update({
    where: { id: params.id },
    data: body
  });

  return NextResponse.json({ data: updated });
}
```

---

## Mejores Prácticas

### ✅ DO - Hacer

1. **Siempre usar helpers de tenant-context**
   ```typescript
   const whereClause = getBuildingTenantFilter(session);
   ```

2. **Verificar ownership en operaciones de escritura**
   ```typescript
   await verifyBuildingOwnership(prisma, buildingId, adminId);
   ```

3. **Testear con múltiples tenants**
   - Crear 2+ admins en desarrollo
   - Verificar que no hay cross-tenant access

4. **Revisar logs del middleware**
   - Warnings indican queries sin filtro de tenant
   - Corregir antes de producción

### ❌ DON'T - No hacer

1. **NO hacer queries directas sin filtro**
   ```typescript
   // ❌ MAL
   const all = await prisma.building.findMany();
   ```

2. **NO confiar solo en validaciones de frontend**
   - El filtrado DEBE estar en backend

3. **NO usar IDs sin verificar ownership**
   ```typescript
   // ❌ MAL
   const building = await prisma.building.findUnique({
     where: { id: req.body.buildingId }
   });
   ```

4. **NO ignorar warnings del middleware**
   - Cada warning es un potencial bug de seguridad

---

## Casos de Ejemplo

### Escenario 1: Admin A y Admin B

```
Admin A (userId: "aaa")
  └── Building "Torre A" (id: "b1", adminId: "aaa")
       └── Unit 101 (id: "u1", buildingId: "b1")

Admin B (userId: "bbb")
  └── Building "Torre B" (id: "b2", adminId: "bbb")
       └── Unit 201 (id: "u2", buildingId: "b2")
```

**Resultado esperado:**
- Admin A solo ve Building "Torre A" y Unit 101
- Admin B solo ve Building "Torre B" y Unit 201
- **NO hay cross-tenant access**

### Escenario 2: Tenant (Inquilino)

```
Tenant C (userId: "ccc")
  ├── Asignado a Unit 101 (Building "Torre A")
  └── Asignado a Unit 305 (Building "Torre C")
```

**Resultado esperado:**
- Tenant C solo ve Units 101 y 305
- Tenant C solo ve Buildings "Torre A" y "Torre C"
- **NO ve otras unidades ni edificios**

---

## Monitoreo y Debugging

### Ver warnings de tenant filter

En desarrollo, el middleware de Prisma logea warnings:

```
⚠️  SECURITY WARNING: Query without tenant filter detected!
Model: Building
Action: findMany
Args: { "where": {} }

This query may access data across multiple tenants.
Please add proper tenant filtering using helpers from src/lib/tenant-context.ts
```

### Habilitar modo estricto en producción

En `src/lib/prisma.ts`, descomentar:

```typescript
if (!hasTenantFilter_any) {
  // En producción, lanzar error
  throw new Error(`SECURITY: Query without tenant filter on ${params.model}`);
}
```

---

## Roadmap Futuro

- [ ] Añadir modelo `Company` explícito
- [ ] Añadir campo `companyId` en `User`
- [ ] Permitir múltiples admins por company
- [ ] Implementar rol `SUPER_ADMIN` con acceso total
- [ ] Tests automatizados de aislamiento de datos
- [ ] Dashboard de auditoría de accesos

---

## Referencias

- [Prisma Middleware](https://www.prisma.io/docs/concepts/components/prisma-client/middleware)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- [OWASP Top 10 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)

---

**Última actualización**: 2026-03-08
**Autor**: Sistema de Gestión de Edificios
