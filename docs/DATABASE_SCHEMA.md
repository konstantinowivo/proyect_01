# Modelo de Datos - Sistema de Gestión de Edificios

## 📊 Resumen de Entidades

Este documento describe el modelo de datos del sistema de gestión de tareas para administraciones de edificios.

---

## 🏗️ Entidades Principales

### 1. **User** (Usuario)
Entidad base para autenticación y autorización.

**Campos:**
- `id`: UUID único
- `email`: Email único del usuario
- `password`: Hash de contraseña
- `name`: Nombre completo
- `phone`: Teléfono (opcional)
- `role`: ADMIN | TENANT

**Relaciones:**
- Un ADMIN puede gestionar múltiples Buildings
- Un TENANT tiene un registro en Tenant

---

### 2. **Building** (Edificio)
Representa cada inmueble administrado.

**Campos:**
- `id`: UUID único
- `name`: Nombre del edificio
- `address`: Dirección completa
- `city`, `state`, `zipCode`: Ubicación
- `floors`: Cantidad de pisos
- `totalUnits`: Total de unidades
- `adminId`: Referencia al administrador

**Relaciones:**
- Pertenece a un User (Admin)
- Tiene múltiples Units
- Tiene múltiples Tenants
- Tiene múltiples Announcements, Tasks, Expenses, Payments, Documents

---

### 3. **Unit** (Unidad/Departamento)
Cada departamento, oficina o local dentro de un edificio.

**Campos:**
- `id`: UUID único
- `buildingId`: Referencia al edificio
- `number`: Número/identificador (ej: "101", "2A")
- `floor`: Número de piso
- `size`: Tamaño en m² (opcional)
- `status`: OCCUPIED | VACANT | MAINTENANCE

**Relaciones:**
- Pertenece a un Building
- Tiene múltiples Tenants (historial)
- Tiene múltiples Tasks, Payments, Documents

**Restricciones:**
- La combinación `buildingId + number` debe ser única

---

### 4. **Tenant** (Inquilino)
Representa la ocupación de una unidad por un usuario.

**Campos:**
- `id`: UUID único
- `userId`: Referencia al User
- `unitId`: Referencia a la Unit
- `buildingId`: Referencia al Building
- `startDate`: Fecha de inicio del contrato
- `endDate`: Fecha de fin (opcional si es indefinido)
- `isActive`: Si el inquilino está activo actualmente

**Relaciones:**
- Pertenece a un User, Unit y Building
- Tiene múltiples Payments

**Notas:**
- Permite mantener historial de inquilinos por unidad
- Un User solo puede tener un Tenant activo a la vez

---

### 5. **Announcement** (Aviso/Novedad)
Sistema de comunicación tipo boletín para los edificios.

**Campos:**
- `id`: UUID único
- `buildingId`: Referencia al edificio
- `title`: Título del aviso
- `content`: Contenido completo (texto largo)
- `priority`: NORMAL | IMPORTANT | URGENT
- `createdById`: Usuario que creó el aviso
- `targetUnits`: Array de IDs de unidades (vacío = todas)
- `expiresAt`: Fecha de expiración (opcional)

**Relaciones:**
- Pertenece a un Building
- Creado por un User
- Tiene múltiples AnnouncementRead (seguimiento de lectura)

---

### 6. **AnnouncementRead** (Lectura de Avisos)
Registra qué usuarios han leído cada aviso.

**Campos:**
- `id`: UUID único
- `announcementId`: Referencia al aviso
- `userId`: Usuario que leyó
- `readAt`: Timestamp de lectura

**Restricciones:**
- La combinación `announcementId + userId` debe ser única

---

### 7. **Task** (Tarea de Mantenimiento)
Gestión de tareas, reparaciones y mantenimiento.

**Campos:**
- `id`: UUID único
- `buildingId`: Referencia al edificio
- `unitId`: Referencia a unidad específica (opcional)
- `title`: Título de la tarea
- `description`: Descripción detallada
- `status`: PENDING | IN_PROGRESS | COMPLETED | CANCELLED
- `priority`: LOW | MEDIUM | HIGH | URGENT
- `assignedTo`: Responsable (puede ser contratista externo)
- `createdById`: Usuario que creó la tarea
- `dueDate`: Fecha límite (opcional)
- `completedAt`: Fecha de finalización

**Relaciones:**
- Pertenece a un Building
- Puede estar asociada a una Unit
- Creada por un User

---

### 8. **Expense** (Gasto del Edificio)
Gastos comunes que se distribuyen como expensas entre unidades.

**Campos:**
- `id`: UUID único
- `buildingId`: Referencia al edificio
- `description`: Descripción del gasto
- `amount`: Monto total
- `date`: Fecha del gasto
- `category`: Categoría (luz, agua, limpieza, etc.)
- `distributionType`: EQUAL | BY_SIZE | CUSTOM

**Relaciones:**
- Pertenece a un Building

**Notas:**
- `EQUAL`: Se divide por igual entre todas las unidades
- `BY_SIZE`: Se distribuye proporcionalmente al tamaño
- `CUSTOM`: Distribución manual personalizada

---

### 9. **Payment** (Expensa/Pago)
Expensas generadas para cada unidad en cada período.

**Campos:**
- `id`: UUID único
- `unitId`: Referencia a la unidad
- `tenantId`: Referencia al inquilino
- `buildingId`: Referencia al edificio
- `amount`: Monto a pagar
- `dueDate`: Fecha de vencimiento
- `status`: PENDING | PAID | OVERDUE | CANCELLED
- `period`: Período (formato: "YYYY-MM")
- `notes`: Notas adicionales (opcional)

**Relaciones:**
- Pertenece a Unit, Tenant, Building
- Tiene múltiples PaymentRecords (pagos parciales/completos)

---

### 10. **PaymentRecord** (Registro de Pago)
Registros de pagos efectivamente realizados.

**Campos:**
- `id`: UUID único
- `paymentId`: Referencia al Payment
- `amount`: Monto pagado
- `paidAt`: Fecha y hora del pago
- `method`: CASH | TRANSFER | DEBIT_CARD | CREDIT_CARD | CHECK
- `receipt`: URL o referencia al comprobante
- `notes`: Notas del pago

**Relaciones:**
- Pertenece a un Payment

**Notas:**
- Permite pagos parciales (múltiples registros para un Payment)
- El estado del Payment se actualiza cuando la suma de records = amount

---

### 11. **Document** (Documento)
Archivos adjuntos relacionados con edificios o unidades.

**Campos:**
- `id`: UUID único
- `buildingId`: Referencia al edificio
- `unitId`: Referencia a unidad (opcional)
- `name`: Nombre del archivo
- `url`: URL de almacenamiento
- `type`: CONTRACT | REGULATION | INVOICE | RECEIPT | OTHER
- `uploadedBy`: Usuario que subió el archivo

**Relaciones:**
- Pertenece a un Building
- Opcionalmente a una Unit
- Subido por un User

---

## 🔗 Diagrama de Relaciones

```
User (ADMIN)
  └── manages → Building(s)
                   ├── has → Unit(s)
                   │          ├── occupied by → Tenant(s) ← linked to → User (TENANT)
                   │          ├── has → Task(s)
                   │          ├── has → Payment(s)
                   │          └── has → Document(s)
                   ├── has → Announcement(s)
                   │          └── has → AnnouncementRead(s)
                   ├── has → Task(s)
                   ├── has → Expense(s)
                   ├── has → Payment(s)
                   └── has → Document(s)
```

---

## 🔐 Políticas de Eliminación (Cascade)

### onDelete: Cascade
- Si se elimina un **Building**, se eliminan todas sus entidades relacionadas
- Si se elimina un **User**, se eliminan sus relaciones directas
- Si se elimina un **Unit**, se eliminan sus Tenants, Tasks, Payments

### onDelete: SetNull
- Si se elimina una **Unit**, las Tasks relacionadas mantienen su registro pero unitId = null

---

## 📌 Índices Importantes

Para optimizar consultas frecuentes:
- **User**: email, role
- **Building**: adminId, name
- **Unit**: buildingId, status
- **Tenant**: userId, unitId, buildingId, isActive
- **Announcement**: buildingId, createdAt, priority
- **Task**: buildingId, status, priority, dueDate
- **Payment**: buildingId, status, period, dueDate

---

## 🚀 Entidades Futuras (Planeadas)

Para futuras versiones del sistema:
- **MaintenanceContract**: Contratos con proveedores de servicios
- **Meeting**: Actas de reuniones de consorcio
- **Amenity**: Amenidades del edificio (gym, piscina, sala de reuniones)
- **Reservation**: Sistema de reservas de amenidades

---

## 📝 Notas de Implementación

1. **UUIDs**: Se usan UUIDs en lugar de IDs incrementales por seguridad y distribución
2. **Timestamps**: Todas las entidades tienen `createdAt` y `updatedAt` automáticos
3. **Soft Deletes**: No implementado aún, pero considerar para entidades críticas
4. **Validaciones**: Las validaciones de negocio se implementarán en la capa de aplicación
5. **Migraciones**: Usar `prisma migrate dev` para desarrollo y `prisma migrate deploy` para producción
