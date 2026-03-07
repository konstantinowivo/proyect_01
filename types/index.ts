// ============================================
// ENUMS
// ============================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TENANT = 'TENANT',
}

export enum AdminStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM',
}

export enum UnitStatus {
  OCCUPIED = 'OCCUPIED',
  VACANT = 'VACANT',
  MAINTENANCE = 'MAINTENANCE',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum AnnouncementPriority {
  NORMAL = 'NORMAL',
  IMPORTANT = 'IMPORTANT',
  URGENT = 'URGENT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  CHECK = 'CHECK',
}

export enum ExpenseDistributionType {
  EQUAL = 'EQUAL',
  BY_SIZE = 'BY_SIZE',
  CUSTOM = 'CUSTOM',
}

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  REGULATION = 'REGULATION',
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  OTHER = 'OTHER',
}

// ============================================
// BASE TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  emailVerified?: Date;
  verificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  floors: number;
  totalUnits: number;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  buildingId: string;
  number: string;
  floor: number;
  size?: number;
  status: UnitStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  userId: string;
  unitId: string;
  buildingId: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  buildingId: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  createdById: string;
  targetUnits: string[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnouncementRead {
  id: string;
  announcementId: string;
  userId: string;
  readAt: Date;
}

export interface Task {
  id: string;
  buildingId: string;
  unitId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  createdById: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  buildingId: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  distributionType: ExpenseDistributionType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  unitId: string;
  tenantId: string;
  buildingId: string;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  period: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  amount: number;
  paidAt: Date;
  method: PaymentMethod;
  receipt?: string;
  notes?: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  buildingId: string;
  unitId?: string;
  name: string;
  url: string;
  type: DocumentType;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProfile {
  id: string;
  userId: string;
  status: AdminStatus;
  company?: string;
  plan: SubscriptionPlan;
  maxBuildings: number;
  maxUnits: number;
  maxInvitations: number;
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;
  currentBuildings: number;
  currentUnits: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  suspendedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantInvitation {
  id: string;
  email: string;
  token: string;
  buildingId: string;
  unitId: string;
  invitedBy: string;
  startDate: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

// ============================================
// EXTENDED TYPES (with relations)
// ============================================

export interface BuildingWithAdmin extends Building {
  admin: User;
}

export interface UnitWithTenant extends Unit {
  tenants: Tenant[];
}

export interface TenantWithUser extends Tenant {
  user: User;
  unit: Unit;
}

export interface AnnouncementWithCreator extends Announcement {
  createdBy: User;
  reads: AnnouncementRead[];
}

export interface TaskWithRelations extends Task {
  building: Building;
  unit?: Unit;
  createdBy: User;
}

export interface PaymentWithRelations extends Payment {
  unit: Unit;
  tenant: Tenant;
  paymentRecords: PaymentRecord[];
}

export interface DocumentWithRelations extends Document {
  building: Building;
  unit?: Unit;
  uploader: User;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

// Building
export interface CreateBuildingRequest {
  name: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  floors: number;
  totalUnits: number;
}

export interface UpdateBuildingRequest extends Partial<CreateBuildingRequest> {}

// Unit
export interface CreateUnitRequest {
  buildingId: string;
  number: string;
  floor: number;
  size?: number;
}

export interface UpdateUnitRequest extends Partial<Omit<CreateUnitRequest, 'buildingId'>> {
  status?: UnitStatus;
}

// Tenant
export interface CreateTenantRequest {
  userId: string;
  unitId: string;
  buildingId: string;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateTenantRequest extends Partial<CreateTenantRequest> {
  isActive?: boolean;
}

// Announcement
export interface CreateAnnouncementRequest {
  buildingId: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetUnits?: string[];
  expiresAt?: Date;
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {}

// Task
export interface CreateTaskRequest {
  buildingId: string;
  unitId?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: Date;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
  completedAt?: Date;
}

// Expense
export interface CreateExpenseRequest {
  buildingId: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  distributionType: ExpenseDistributionType;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

// Payment
export interface CreatePaymentRequest {
  unitId: string;
  tenantId: string;
  buildingId: string;
  amount: number;
  dueDate: Date;
  period: string;
  notes?: string;
}

export interface UpdatePaymentRequest extends Partial<CreatePaymentRequest> {
  status?: PaymentStatus;
}

export interface CreatePaymentRecordRequest {
  paymentId: string;
  amount: number;
  method: PaymentMethod;
  receipt?: string;
  notes?: string;
}

// Document
export interface CreateDocumentRequest {
  buildingId: string;
  unitId?: string;
  name: string;
  url: string;
  type: DocumentType;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  maintenanceUnits: number;
  activeTenants: number;
  pendingTasks: number;
  urgentTasks: number;
  pendingPayments: number;
  overduePayments: number;
  totalRevenue: number;
  collectionRate: number;
}

export interface BuildingDashboard extends Building {
  stats: DashboardStats;
  recentAnnouncements: Announcement[];
  urgentTasks: Task[];
}

// ============================================
// FILTER & PAGINATION TYPES
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskFilters {
  buildingId?: string;
  unitId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
}

export interface PaymentFilters {
  buildingId?: string;
  unitId?: string;
  tenantId?: string;
  status?: PaymentStatus;
  period?: string;
}

export interface AnnouncementFilters {
  buildingId?: string;
  priority?: AnnouncementPriority;
}

// ============================================
// ERROR TYPES
// ============================================

export interface ApiError {
  message: string;
  code: string;
  field?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
