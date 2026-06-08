import type { AdminViewServerProps } from "payload";
import { redirect } from "next/navigation";

import { getPublicInventory } from "@/lib/publicInventory";
import { PublicSiteInventory } from "./PublicSiteInventory";

export async function PublicSiteView(props: AdminViewServerProps) {
  if (props.initPageResult.req.user?.role === "form-tracker") {
    redirect("/admin2/collections/applications");
  }
  const items = await getPublicInventory(props.initPageResult.req.payload);
  return <PublicSiteInventory items={items} />;
}
