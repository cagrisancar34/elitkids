import { requireRole } from "@/lib/auth";

export default async function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole("manager");

  return children;
}
