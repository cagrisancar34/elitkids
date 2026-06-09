import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";

import { toAdminPath } from "@/lib/routes";

export async function DashboardRedirectView(props: AdminViewServerProps) {
  if (props.initPageResult.req.user?.role === "form-tracker") {
    redirect(toAdminPath("/collections/applications"));
  }

  redirect(toAdminPath("/events"));
}
