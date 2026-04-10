import type { ReactNode } from "react";
import type { Route } from "next";

import { AppShell } from "@/components/app-shell";
import type { AppRole } from "@/lib/types";

export type DashboardContextCard = {
  eyebrow: string;
  title: string;
  description?: string;
  badge?: string;
};

export type DashboardPrimaryAction = {
  href: Route;
  label: string;
};

type DashboardPageProps = {
  role: AppRole;
  title: string;
  description?: string;
  eyebrow?: string;
  contextCard?: DashboardContextCard;
  primaryAction?: DashboardPrimaryAction;
  children: ReactNode;
};

export function DashboardPage({
  role,
  title,
  description,
  eyebrow,
  contextCard,
  primaryAction,
  children,
}: DashboardPageProps) {
  return (
    <AppShell
      role={role}
      title={title}
      description={description}
      eyebrow={eyebrow}
      contextCard={contextCard}
      primaryAction={primaryAction}
    >
      {children}
    </AppShell>
  );
}
