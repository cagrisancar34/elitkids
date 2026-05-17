import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth";
import { getManagerStudentSheet } from "@/lib/dashboard/manager-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const auth = await getCurrentAuthContext();

  if (!auth || (auth.role !== "manager" && auth.role !== "admin")) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { studentId } = await params;
  const sheet = await getManagerStudentSheet(studentId);

  if (!sheet) {
    return NextResponse.json({ error: "Ogrenci bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ sheet });
}
