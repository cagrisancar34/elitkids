import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import type { AppRole } from "@/lib/types";

type DashboardPageProps = {
  role: AppRole;
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
};

export function DashboardPage({
  role,
  title,
  description,
  eyebrow,
  children,
}: DashboardPageProps) {
  return (
    <AppShell role={role} title={title} description={description} eyebrow={eyebrow}>
      {children}
    </AppShell>
  );
}
