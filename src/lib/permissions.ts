import type { AppRole } from "@/lib/types";

export function canManageSystem(role: AppRole) {
  return role === "admin";
}

export function canManageOperations(role: AppRole) {
  return role === "admin" || role === "manager";
}

export function canViewFinance(role: AppRole) {
  return role === "admin" || role === "manager" || role === "parent";
}

export function canTakeAttendance(role: AppRole) {
  return role === "admin" || role === "manager" || role === "coach";
}
