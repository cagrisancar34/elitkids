import type { AdminViewServerProps } from "payload";

import { AdminDashboard } from "./AdminDashboard";

export async function EventsView(props: AdminViewServerProps) {
  return AdminDashboard(props);
}
