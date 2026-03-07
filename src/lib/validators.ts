import { z } from 'zod';
import {
  UserRole,
  UnitStatus,
  TaskStatus,
  TaskPriority,
  AnnouncementPriority,
  PaymentStatus,
  PaymentMethod,
  ExpenseDistributionType,
  DocumentType,
} from '@/types';

// ============================================
// AUTH VALIDATORS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole),
});

// ============================================
// BUILDING VALIDATORS
// ============================================

export const createBuildingSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  floors: z.number().int().positive('El número de pisos debe ser positivo'),
  totalUnits: z.number().int().positive('El número de unidades debe ser positivo'),
});

export const updateBuildingSchema = createBuildingSchema.partial();

// ============================================
// UNIT VALIDATORS
// ============================================

export const createUnitSchema = z.object({
  buildingId: z.string().uuid('ID de edificio inválido'),
  number: z.string().min(1, 'El número de unidad es requerido'),
  floor: z.number().int('El piso debe ser un número entero'),
  size: z.number().positive('El tamaño debe ser positivo').optional(),
});

export const updateUnitSchema = createUnitSchema.partial().extend({
  status: z.nativeEnum(UnitStatus).optional(),
});

// ============================================
// TENANT VALIDATORS
// ============================================

export const createTenantSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  unitId: z.string().uuid('ID de unidad inválido'),
  buildingId: z.string().uuid('ID de edificio inválido'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export const updateTenantSchema = createTenantSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ============================================
// ANNOUNCEMENT VALIDATORS
// ============================================

export const createAnnouncementSchema = z.object({
  buildingId: z.string().uuid('ID de edificio inválido'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  priority: z.nativeEnum(AnnouncementPriority),
  targetUnits: z.array(z.string().uuid()).optional(),
  expiresAt: z.coerce.date().optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

// ============================================
// TASK VALIDATORS
// ============================================

export const createTaskSchema = z.object({
  buildingId: z.string().uuid('ID de edificio inválido'),
  unitId: z.string().uuid('ID de unidad inválido').optional(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  priority: z.nativeEnum(TaskPriority),
  assignedTo: z.string().optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.nativeEnum(TaskStatus).optional(),
  completedAt: z.coerce.date().optional(),
});

// ============================================
// EXPENSE VALIDATORS
// ============================================

export const createExpenseSchema = z.object({
  buildingId: z.string().uuid('ID de edificio inválido'),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  amount: z.number().positive('El monto debe ser positivo'),
  date: z.coerce.date(),
  category: z.string().min(2, 'La categoría debe tener al menos 2 caracteres'),
  distributionType: z.nativeEnum(ExpenseDistributionType),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// ============================================
// PAYMENT VALIDATORS
// ============================================

export const createPaymentSchema = z.object({
  unitId: z.string().uuid('ID de unidad inválido'),
  tenantId: z.string().uuid('ID de inquilino inválido'),
  buildingId: z.string().uuid('ID de edificio inválido'),
  amount: z.number().positive('El monto debe ser positivo'),
  dueDate: z.coerce.date(),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Formato de período inválido (debe ser YYYY-MM)'),
  notes: z.string().optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial().extend({
  status: z.nativeEnum(PaymentStatus).optional(),
});

export const createPaymentRecordSchema = z.object({
  paymentId: z.string().uuid('ID de pago inválido'),
  amount: z.number().positive('El monto debe ser positivo'),
  method: z.nativeEnum(PaymentMethod),
  receipt: z.string().url('URL de recibo inválida').optional(),
  notes: z.string().optional(),
});

// ============================================
// DOCUMENT VALIDATORS
// ============================================

export const createDocumentSchema = z.object({
  buildingId: z.string().uuid('ID de edificio inválido'),
  unitId: z.string().uuid('ID de unidad inválido').optional(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  url: z.string().url('URL inválida'),
  type: z.nativeEnum(DocumentType),
});

// ============================================
// PAGINATION VALIDATORS
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// ============================================
// FILTER VALIDATORS
// ============================================

export const taskFiltersSchema = z.object({
  buildingId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedTo: z.string().optional(),
});

export const paymentFiltersSchema = z.object({
  buildingId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  period: z.string().optional(),
});

export const announcementFiltersSchema = z.object({
  buildingId: z.string().uuid().optional(),
  priority: z.nativeEnum(AnnouncementPriority).optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateBuildingInput = z.infer<typeof createBuildingSchema>;
export type UpdateBuildingInput = z.infer<typeof updateBuildingSchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type CreatePaymentRecordInput = z.infer<typeof createPaymentRecordSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;
export type PaymentFiltersInput = z.infer<typeof paymentFiltersSchema>;
export type AnnouncementFiltersInput = z.infer<typeof announcementFiltersSchema>;
