import { SubscriptionPlan, AdminStatus } from '@/types';
import prisma from './prisma';

// Plan limits configuration
export const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    maxBuildings: 1,
    maxUnits: 10,
    maxInvitationsPerMonth: 10,
    price: 0,
    trialDays: 14,
    features: ['basic_dashboard', 'announcements', 'tenants', 'tasks'],
  },
  [SubscriptionPlan.BASIC]: {
    maxBuildings: 1,
    maxUnits: 30,
    maxInvitationsPerMonth: 50,
    price: 15,
    trialDays: 0,
    features: ['basic_dashboard', 'announcements', 'tenants', 'tasks', 'payments', 'documents'],
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    maxBuildings: 3,
    maxUnits: 100,
    maxInvitationsPerMonth: 150,
    price: 35,
    trialDays: 0,
    features: ['all_basic', 'advanced_reports', 'priority_support', 'bulk_operations'],
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxBuildings: -1, // unlimited
    maxUnits: 300,
    maxInvitationsPerMonth: 500,
    price: 70,
    trialDays: 0,
    features: ['all_professional', 'api_access', 'custom_branding', 'dedicated_support'],
  },
  [SubscriptionPlan.CUSTOM]: {
    maxBuildings: -1, // unlimited
    maxUnits: -1, // unlimited
    maxInvitationsPerMonth: -1, // unlimited
    price: null,
    trialDays: 0,
    features: ['everything'],
  },
} as const;

/**
 * Get admin profile with current usage
 */
export async function getAdminProfile(userId: string) {
  const profile = await prisma.adminProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error('Admin profile not found');
  }

  return profile;
}

/**
 * Check if admin can create a new building
 */
export async function canCreateBuilding(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const profile = await getAdminProfile(userId);

  // Check if account is active
  if (profile.status !== AdminStatus.ACTIVE) {
    return {
      allowed: false,
      reason: `Tu cuenta está ${profile.status.toLowerCase()}. ${
        profile.status === AdminStatus.PENDING
          ? 'Verifica tu email para continuar.'
          : profile.status === AdminStatus.SUSPENDED
          ? 'Renueva tu suscripción para continuar.'
          : 'Contacta a soporte.'
      }`,
    };
  }

  // Check building limit
  const limits = PLAN_LIMITS[profile.plan];
  if (limits.maxBuildings !== -1 && profile.currentBuildings >= limits.maxBuildings) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de edificios de tu plan ${profile.plan} (${limits.maxBuildings} edificios). Upgrade tu plan para agregar más.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if admin can add units to a building
 */
export async function canAddUnits(
  userId: string,
  unitsToAdd: number
): Promise<{ allowed: boolean; reason?: string }> {
  const profile = await getAdminProfile(userId);

  // Check if account is active
  if (profile.status !== AdminStatus.ACTIVE) {
    return {
      allowed: false,
      reason: `Tu cuenta está ${profile.status.toLowerCase()}. Verifica tu email o renueva tu suscripción.`,
    };
  }

  // Check units limit
  const limits = PLAN_LIMITS[profile.plan];
  const totalUnits = profile.currentUnits + unitsToAdd;

  if (limits.maxUnits !== -1 && totalUnits > limits.maxUnits) {
    return {
      allowed: false,
      reason: `Tu plan ${profile.plan} permite hasta ${limits.maxUnits} unidades. Actualmente tienes ${profile.currentUnits} y quieres agregar ${unitsToAdd}. Upgrade tu plan para continuar.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if admin can send an invitation
 */
export async function canSendInvitation(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const profile = await getAdminProfile(userId);

  // Check if account is active
  if (profile.status !== AdminStatus.ACTIVE) {
    return {
      allowed: false,
      reason: 'Tu cuenta debe estar activa para enviar invitaciones.',
    };
  }

  // Check monthly invitation limit
  const limits = PLAN_LIMITS[profile.plan];

  if (limits.maxInvitationsPerMonth === -1) {
    return { allowed: true }; // unlimited
  }

  // Count invitations sent this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const invitationsThisMonth = await prisma.tenantInvitation.count({
    where: {
      invitedBy: userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  if (invitationsThisMonth >= limits.maxInvitationsPerMonth) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de invitaciones de este mes (${limits.maxInvitationsPerMonth}). Upgrade tu plan o espera hasta el próximo mes.`,
    };
  }

  return { allowed: true };
}

/**
 * Update admin usage counters
 */
export async function updateAdminCounters(userId: string) {
  const buildings = await prisma.building.count({
    where: { adminId: userId },
  });

  const units = await prisma.unit.count({
    where: {
      building: {
        adminId: userId,
      },
    },
  });

  await prisma.adminProfile.update({
    where: { userId },
    data: {
      currentBuildings: buildings,
      currentUnits: units,
    },
  });
}

/**
 * Initialize trial period for new admin
 */
export function calculateTrialEnd(plan: SubscriptionPlan): Date | null {
  const limits = PLAN_LIMITS[plan];
  if (limits.trialDays === 0) return null;

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + limits.trialDays);
  return trialEnd;
}

/**
 * Check if admin is in trial period
 */
export function isInTrial(profile: { trialEndsAt?: Date | null; plan: SubscriptionPlan }): boolean {
  if (!profile.trialEndsAt) return false;
  if (profile.plan !== SubscriptionPlan.FREE) return false;

  return new Date() < new Date(profile.trialEndsAt);
}

/**
 * Check if trial has expired
 */
export function isTrialExpired(profile: { trialEndsAt?: Date | null; plan: SubscriptionPlan }): boolean {
  if (!profile.trialEndsAt) return false;
  if (profile.plan !== SubscriptionPlan.FREE) return false;

  return new Date() >= new Date(profile.trialEndsAt);
}

/**
 * Get upgrade suggestions based on current usage
 */
export function getSuggestedPlan(currentPlan: SubscriptionPlan, currentUsage: {
  buildings: number;
  units: number;
}): SubscriptionPlan | null {
  const currentLimits = PLAN_LIMITS[currentPlan];

  // Check if exceeded current limits
  const needsUpgrade =
    (currentLimits.maxBuildings !== -1 && currentUsage.buildings > currentLimits.maxBuildings) ||
    (currentLimits.maxUnits !== -1 && currentUsage.units > currentLimits.maxUnits);

  if (!needsUpgrade) return null;

  // Suggest next plan
  const planOrder = [
    SubscriptionPlan.FREE,
    SubscriptionPlan.BASIC,
    SubscriptionPlan.PROFESSIONAL,
    SubscriptionPlan.ENTERPRISE,
    SubscriptionPlan.CUSTOM,
  ];

  const currentIndex = planOrder.indexOf(currentPlan);
  if (currentIndex < planOrder.length - 1) {
    return planOrder[currentIndex + 1];
  }

  return SubscriptionPlan.CUSTOM;
}

/**
 * Format plan name for display
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  const names = {
    [SubscriptionPlan.FREE]: 'Gratis',
    [SubscriptionPlan.BASIC]: 'Básico',
    [SubscriptionPlan.PROFESSIONAL]: 'Profesional',
    [SubscriptionPlan.ENTERPRISE]: 'Enterprise',
    [SubscriptionPlan.CUSTOM]: 'Personalizado',
  };
  return names[plan];
}

/**
 * Get plan price
 */
export function getPlanPrice(plan: SubscriptionPlan): number | null {
  return PLAN_LIMITS[plan].price;
}
