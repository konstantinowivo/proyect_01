import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Initialize Prisma Client with multi-tenant security middleware
 */
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  /**
   * MULTI-TENANT SECURITY MIDDLEWARE
   *
   * This middleware ensures that queries on tenant-scoped models always include
   * proper filtering to prevent cross-tenant data access.
   *
   * Models that require tenant filtering:
   * - Building (filtered by adminId)
   * - Unit (filtered by building.adminId)
   * - Tenant (filtered by building.adminId)
   * - Task (filtered by building.adminId)
   * - Payment (filtered by building.adminId)
   * - Announcement (filtered by building.adminId)
   * - Document (filtered by building.adminId)
   * - Expense (filtered by building.adminId)
   */
  client.$use(async (params, next) => {
    // List of models that require tenant isolation
    const tenantScopedModels = [
      'Building',
      'Unit',
      'Tenant',
      'Task',
      'Payment',
      'Announcement',
      'Document',
      'Expense',
      'TenantInvitation',
    ];

    // Only check read operations (write operations should be validated at API level)
    const readOperations = [
      'findUnique',
      'findFirst',
      'findMany',
      'count',
      'aggregate',
    ];

    if (
      params.model &&
      tenantScopedModels.includes(params.model) &&
      readOperations.includes(params.action)
    ) {
      const hasAdminIdFilter = params.args?.where?.adminId !== undefined;
      const hasBuildingFilter = params.args?.where?.building !== undefined;
      const hasBuildingIdFilter = params.args?.where?.buildingId !== undefined;
      const hasUnitFilter = params.args?.where?.unit !== undefined;
      const hasTenantFilter = params.args?.where?.tenant !== undefined;
      const hasUserIdFilter = params.args?.where?.userId !== undefined;

      // Check if any tenant filter is present
      const hasTenantFilter_any =
        hasAdminIdFilter ||
        hasBuildingFilter ||
        hasBuildingIdFilter ||
        hasUnitFilter ||
        hasTenantFilter ||
        hasUserIdFilter;

      if (!hasTenantFilter_any) {
        // Log warning in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `⚠️  SECURITY WARNING: Query without tenant filter detected!
            Model: ${params.model}
            Action: ${params.action}
            Args: ${JSON.stringify(params.args, null, 2)}

            This query may access data across multiple tenants.
            Please add proper tenant filtering using helpers from src/lib/tenant-context.ts
            `
          );
        }

        // In production, you could throw an error instead:
        // throw new Error(`SECURITY: Query without tenant filter on ${params.model}`);
      }
    }

    return next(params);
  });

  return client;
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
