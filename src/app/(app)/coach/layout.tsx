import { requireRole } from "@/lib/auth";

export default async function CoachLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole("coach");

  return children;
}
