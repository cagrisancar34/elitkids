type UserLike = {
  role?: string | null;
};

export function isAdmin(user: unknown) {
  return (user as UserLike | null)?.role === "admin";
}

export function canManageContent(user: unknown) {
  const role = (user as UserLike | null)?.role;
  return role === "admin" || role === "editor";
}

export function hideFromFormTracker({ user }: { user?: unknown }) {
  return (user as UserLike | null)?.role === "form-tracker";
}
