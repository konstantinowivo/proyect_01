import { JWTPayload } from '@/lib/auth';
import { UserRole } from '@/types';

/**
 * Tenant Context - Multi-tenant data isolation helper
 *
 * This module provides utilities to ensure data isolation between tenants.
 * Every query should use these helpers to prevent cross-tenant data access.
 */

/**
 * Get tenant filter for Building queries
 * Ensures that users only access buildings they have permission to see
 */
export function getBuildingTenantFilter(session: JWTPayload) {
  if (session.role === UserRole.ADMIN) {
    // Admins can only see buildings they manage
    return {
      adminId: session.userId,
    };
  }

  if (session.role === UserRole.TENANT) {
    // Tenants can only see buildings they are assigned to
    return {
      tenants: {
        some: {
          userId: session.userId,
          isActive: true,
        },
      },
    };
  }

  // Super admin can see all buildings
  return {};
}

/**
 * Get tenant filter for Unit queries
 * Ensures that users only access units they have permission to see
 */
export function getUnitTenantFilter(session: JWTPayload) {
  if (session.role === UserRole.ADMIN) {
    // Admins can only see units in buildings they manage
    return {
      building: {
        adminId: session.userId,
      },
    };
  }

  if (session.role === UserRole.TENANT) {
    // Tenants can only see units they are assigned to
    return {
      tenants: {
        some: {
          userId: session.userId,
          isActive: true,
        },
      },
    };
  }

  // Super admin can see all units
  return {};
}

/**
 * Get tenant filter for Tenant queries
 * Ensures that users only access tenant records they have permission to see
 */
export function getTenantRecordFilter(session: JWTPayload) {
  if (session.role === UserRole.ADMIN) {
    // Admins can only see tenants in buildings they manage
    return {
      building: {
        adminId: session.userId,
      },
    };
  }

  if (session.role === UserRole.TENANT) {
    // Tenants can only see their own tenant records
    return {
      userId: session.userId,
    };
  }

  // Super admin can see all tenant records
  return {};
}

/**
 * Get tenant filter for Task queries
 */
export function getTaskTenantFilter(session: JWTPayload) {
  if (session.role === UserRole.ADMIN) {
    return {
      building: {
        adminId: session.userId,
      },
    };
  }

  if (session.role === UserRole.TENANT) {
    // Tenants can see tasks for units they occupy
    return {
      unit: {
        tenants: {
          some: {
            userId: session.userId,
            isActive: true,
          },
        },
      },
    };
  }

  return {};
}

/**
 * Get tenant filter for Payment queries
 */
export function getPaymentTenantFilter(session: JWTPayload) {
  if (session.role === UserRole.ADMIN) {
    return {
      building: {
        adminId: session.userId,
      },
    };
  }

  if (session.role === UserRole.TENANT) {
    // Tenants can only see their own payments
    return {
      tenant: {
        userId: session.userId,
      },
    };
  }

  return {};
}

/**
 * Get tenant filter for Announcement queries
 */
export function getAnnouncementTenantFilter(session: JWTPayload) {
  if (session.role === UserRole.ADMIN) {
    return {
      building: {
        adminId: session.userId,
      },
    };
  }

  if (session.role === UserRole.TENANT) {
    // Tenants can see announcements for buildings they are in
    return {
      building: {
        tenants: {
          some: {
            userId: session.userId,
            isActive: true,
          },
        },
      },
    };
  }

  return {};
}

/**
 * Get tenant filter for Document queries
 */
export function getDocumentTenantFilter(session: JWTPayload) {
  if (session.role === UserRole.ADMIN) {
    return {
      building: {
        adminId: session.userId,
      },
    };
  }

  if (session.role === UserRole.TENANT) {
    // Tenants can see documents for units they occupy
    return {
      unit: {
        tenants: {
          some: {
            userId: session.userId,
            isActive: true,
          },
        },
      },
    };
  }

  return {};
}

/**
 * Verify if a building belongs to the admin
 * Throws an error if not authorized
 */
export async function verifyBuildingOwnership(
  prisma: any,
  buildingId: string,
  adminId: string
): Promise<boolean> {
  const building = await prisma.building.findFirst({
    where: {
      id: buildingId,
      adminId: adminId,
    },
  });

  if (!building) {
    throw new Error('FORBIDDEN: Building not found or access denied');
  }

  return true;
}

/**
 * Verify if a unit belongs to an admin's building
 * Throws an error if not authorized
 */
export async function verifyUnitOwnership(
  prisma: any,
  unitId: string,
  adminId: string
): Promise<boolean> {
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      building: {
        adminId: adminId,
      },
    },
  });

  if (!unit) {
    throw new Error('FORBIDDEN: Unit not found or access denied');
  }

  return true;
}

/**
 * Generic tenant filter for any model that has a buildingId
 * Use this as a last resort if specific helpers don't exist
 */
export function getGenericTenantFilter(session: JWTPayload) {
  if (session.role === UserRole.ADMIN) {
    return {
      building: {
        adminId: session.userId,
      },
    };
  }

  if (session.role === UserRole.TENANT) {
    return {
      building: {
        tenants: {
          some: {
            userId: session.userId,
            isActive: true,
          },
        },
      },
    };
  }

  return {};
}

/**
 * Check if user has access to a specific building
 */
export async function hasAccessToBuilding(
  prisma: any,
  session: JWTPayload,
  buildingId: string
): Promise<boolean> {
  if (session.role === UserRole.ADMIN) {
    const building = await prisma.building.findFirst({
      where: {
        id: buildingId,
        adminId: session.userId,
      },
    });
    return !!building;
  }

  if (session.role === UserRole.TENANT) {
    const tenant = await prisma.tenant.findFirst({
      where: {
        buildingId: buildingId,
        userId: session.userId,
        isActive: true,
      },
    });
    return !!tenant;
  }

  // Super admin has access to all
  return session.role === UserRole.SUPER_ADMIN;
}
