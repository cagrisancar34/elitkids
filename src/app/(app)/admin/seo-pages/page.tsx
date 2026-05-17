import { redirect } from "next/navigation";

export default function AdminSeoPagesPage() {
  redirect("/admin/public-site?scope=seo");
}
