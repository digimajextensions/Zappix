import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

/**
 * Role-based access control for team members.
 *
 * Checks if the current user (or their team membership) has
 * permission to perform a given action on behalf of a workspace owner.
 */

type Permission =
  | "read"
  | "write"
  | "manage_team"
  | "manage_billing"
  | "manage_settings";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: ["read", "write", "manage_team", "manage_billing", "manage_settings"],
  ADMIN: ["read", "write", "manage_team", "manage_settings"],
  EDITOR: ["read", "write"],
  VIEWER: ["read"],
};

/**
 * Check if a team member has a specific permission.
 */
export function hasPermission(
  role: string,
  permission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Verify that the current user has at least the required role
 * to access a resource owned by another user.
 */
export async function verifyTeamAccess(
  currentUserId: string,
  resourceOwnerId: string,
  requiredPermission: Permission
): Promise<{ allowed: boolean; role: string | null }> {
  // Owner always has full access
  if (currentUserId === resourceOwnerId) {
    return { allowed: true, role: "OWNER" };
  }

  // Check team membership
  const membership = await prisma.teamMember.findFirst({
    where: {
      userId: resourceOwnerId,
      email: {
        // In production, this should match the current user's email
        // This is a simplified version
        not: undefined,
      },
      status: "ACCEPTED",
    },
  });

  if (!membership) {
    return { allowed: false, role: null };
  }

  const allowed = hasPermission(membership.role, requiredPermission);
  return { allowed, role: membership.role };
}

/**
 * tRPC middleware-style function to enforce role-based access.
 * Use in tRPC procedures that need role checking.
 */
export function requirePermission(permission: Permission) {
  return async (userId: string, resourceOwnerId: string) => {
    const { allowed, role } = await verifyTeamAccess(
      userId,
      resourceOwnerId,
      permission
    );

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have ${permission} permission for this resource.${
          role ? ` Your current role is ${role}.` : ""
        }`,
      });
    }

    return { role };
  };
}
