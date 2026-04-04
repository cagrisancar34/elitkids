import { requireRole } from "@/lib/auth";

export default async function ParentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole("parent");

  return children;
}
