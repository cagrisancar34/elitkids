import { NextResponse } from "next/server";
import { format } from "date-fns";

import { getCurrentAuthContext } from "@/lib/auth";
import { getOrCreateOrganizationContext } from "@/lib/organization-context";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppNotificationItem } from "@/lib/types";

function formatDateLabel(value: string) {
  return format(new Date(value), "dd MMM yyyy");
}

export async function GET() {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId) {
    return NextResponse.json({ items: [], unreadCount: 0 }, { status: 401 });
  }

  if (auth.role !== "admin" && auth.role !== "manager") {
    return NextResponse.json({ items: [], unreadCount: 0 });
  }

  const supabase = await createSupabaseServerClient();
  const organizationContext = await getOrCreateOrganizationContext(auth.userId);

  if (!supabase || !organizationContext.organizationId) {
    return NextResponse.json({ items: [], unreadCount: 0 });
  }

  const { data: existingNotifications } = await supabase
    .from("notifications")
    .select("id, title, body, channel, read_at")
    .eq("profile_id", auth.userId)
    .like("channel", "landing_lead:%")
    .order("read_at", { ascending: true, nullsFirst: true })
    .limit(24);

  const existingLeadIds = new Set(
    (existingNotifications ?? [])
      .map((row) => (row.channel?.startsWith("landing_lead:") ? row.channel.split(":")[1] : null))
      .filter((value): value is string => Boolean(value)),
  );

  const { data: recentLeads } = await supabase
    .from("lead_submissions")
    .select("id, full_name, email, phone, branch_interest, created_at, status")
    .eq("organization_id", organizationContext.organizationId)
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(24);

  const missingLeads = (recentLeads ?? []).filter((lead) => !existingLeadIds.has(lead.id));

  if (missingLeads.length) {
    const adminClient = createSupabaseAdminClient();

    if (adminClient) {
      await adminClient.from("notifications").insert(
        missingLeads.map((lead) => ({
          profile_id: auth.userId,
          title: lead.full_name,
          body: `${lead.branch_interest?.trim() || "Yeni landing basvurusu"} · ${lead.phone} · ${lead.email}`,
          channel: `landing_lead:${lead.id}`,
        })),
      );
    }
  }

  const { data: notificationsData } =
    missingLeads.length
      ? await supabase
          .from("notifications")
          .select("id, title, body, channel, read_at")
          .eq("profile_id", auth.userId)
          .like("channel", "landing_lead:%")
          .order("read_at", { ascending: true, nullsFirst: true })
          .limit(24)
      : { data: existingNotifications ?? [] };

  const notifications = notificationsData ?? [];

  const leadIds = Array.from(
    new Set(
      notifications
        .map((row) => (row.channel?.startsWith("landing_lead:") ? row.channel.split(":")[1] : null))
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const { data: leadRows } = leadIds.length
    ? await supabase
        .from("lead_submissions")
        .select("id, full_name, email, phone, branch_interest, created_at")
        .in("id", leadIds)
    : {
        data: [] as Array<{
          id: string;
          full_name: string;
          email: string;
          phone: string;
          branch_interest: string | null;
          created_at: string;
        }>,
      };

  const leadMap = new Map((leadRows ?? []).map((row) => [row.id, row]));
  const hrefBase = auth.role === "admin" ? "/admin/security" : "/manager/reports";
  const hrefHash = auth.role === "admin" ? "#landing-basvurulari" : "#lead-akisi";

  const items = notifications
    .map((notification) => {
      const leadId = notification.channel?.startsWith("landing_lead:")
        ? notification.channel.split(":")[1]
        : null;
      const lead = leadId ? leadMap.get(leadId) : null;

      if (!leadId || !lead) {
        return null;
      }

      return {
        id: notification.id,
        title: lead.full_name,
        body: `${lead.branch_interest?.trim() || "Yeni landing basvurusu"} · ${lead.phone} · ${lead.email}`,
        href: `${hrefBase}?highlightLead=${lead.id}${hrefHash}`,
        createdAt: formatDateLabel(lead.created_at),
        read: Boolean(notification.read_at),
      } satisfies AppNotificationItem;
    })
    .filter((item): item is AppNotificationItem => Boolean(item));

  items.sort((left, right) => {
    if (left.read !== right.read) {
      return left.read ? 1 : -1;
    }

    const leftLeadId = left.href.split("highlightLead=")[1]?.split("#")[0] ?? "";
    const rightLeadId = right.href.split("highlightLead=")[1]?.split("#")[0] ?? "";
    const leftLeadDate = leadMap.get(leftLeadId)?.created_at ?? "";
    const rightLeadDate = leadMap.get(rightLeadId)?.created_at ?? "";

    return rightLeadDate.localeCompare(leftLeadDate);
  });

  return NextResponse.json({
    unreadCount: items.filter((item) => !item.read).length,
    items,
  });
}

export async function POST(request: Request) {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (auth.role !== "admin" && auth.role !== "manager") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as
    | { action?: "read" | "read_all"; notificationId?: string }
    | null;

  const timestamp = new Date().toISOString();

  if (body?.action === "read" && body.notificationId) {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: timestamp })
      .eq("id", body.notificationId)
      .eq("profile_id", auth.userId)
      .like("channel", "landing_lead:%")
      .is("read_at", null);

    return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
  }

  if (body?.action === "read_all") {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: timestamp })
      .eq("profile_id", auth.userId)
      .like("channel", "landing_lead:%")
      .is("read_at", null);

    return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
