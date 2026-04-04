import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase env values are missing. Load .env.local before running the seed.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const defaults = {
  organization: {
    name: "Elit Kids Akademi",
    slug: "elit-kids-akademi",
    locale: "tr-TR",
    timezone: "Europe/Istanbul",
  },
  users: [
    {
      email: "cagrisancar@gmail.com",
      password: "Kartal1a",
      fullName: "Cagri Sancar",
      role: "admin",
      phone: null,
    },
    {
      email: "operasyon@elitkids.com",
      password: "ElitKids123",
      fullName: "Can Guler",
      role: "manager",
      phone: "05320000001",
    },
    {
      email: "ece.yilmaz@elitkids.com",
      password: "ElitKids123",
      fullName: "Ece Yilmaz",
      role: "coach",
      phone: "05320000002",
    },
    {
      email: "ayse.kaya@elitkids.com",
      password: "ElitKids123",
      fullName: "Ayse Kaya",
      role: "parent",
      phone: "05320000003",
    },
  ],
  branches: [
    {
      name: "Ana Pist",
      slug: "ana-pist",
      location: "Zeytinburnu Buz Pisti",
      active: true,
      archivedAt: null,
    },
    {
      name: "Mini Akademi",
      slug: "mini-akademi",
      location: "Atletik Gelisim Salonu",
      active: true,
      archivedAt: null,
    },
  ],
  seasons: [
    {
      title: "2026 Bahar Donemi",
      startsOn: "2026-03-01",
      endsOn: "2026-06-30",
      isActive: true,
      isDefault: true,
    },
    {
      title: "2026 Yaz Kampi",
      startsOn: "2026-07-01",
      endsOn: "2026-08-15",
      isActive: false,
      isDefault: false,
    },
  ],
  programs: [
    {
      title: "Mini Ice / 6-8 Yas",
      ageBand: "6-8 Yas",
      capacity: 16,
      monthlyPrice: 4800,
    },
    {
      title: "Power Skating / 9-12 Yas",
      ageBand: "9-12 Yas",
      capacity: 20,
      monthlyPrice: 6250,
    },
    {
      title: "Artistik Baslangic",
      ageBand: "8-12 Yas",
      capacity: 14,
      monthlyPrice: 5400,
    },
  ],
  students: [
    {
      fullName: "Mina Kaya",
      birthDate: "2018-03-14",
      active: true,
      programTitle: "Mini Ice / 6-8 Yas",
      parentEmail: "ayse.kaya@elitkids.com",
      chargeStatus: "paid",
      paidAmount: 4800,
      attendanceStatuses: ["present", "present", "present"],
    },
    {
      fullName: "Aras Demir",
      birthDate: "2015-09-22",
      active: true,
      programTitle: "Power Skating / 9-12 Yas",
      parentEmail: "ayse.kaya@elitkids.com",
      chargeStatus: "pending",
      paidAmount: 3200,
      attendanceStatuses: ["present", "late", "absent"],
    },
    {
      fullName: "Lina Aydin",
      birthDate: "2016-11-08",
      active: true,
      programTitle: "Artistik Baslangic",
      parentEmail: "ayse.kaya@elitkids.com",
      chargeStatus: "pending",
      paidAmount: 0,
      attendanceStatuses: ["present", "present", "excused"],
    },
  ],
};

async function ensureUser(user, organizationSlug) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    throw listError;
  }

  const existing = listed.users.find(
    (candidate) => candidate.email?.toLowerCase() === user.email.toLowerCase(),
  );

  const payload = {
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      full_name: user.fullName,
      app_role: user.role,
    },
    app_metadata: {
      app_role: user.role,
      organization_slug: organizationSlug,
    },
  };

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, payload);
    if (error) {
      throw error;
    }

    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser(payload);

  if (error) {
    throw error;
  }

  return data.user.id;
}

async function maybeSingle(queryBuilder) {
  const { data, error } = await queryBuilder.maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function ensureOrganization() {
  const existing = await maybeSingle(
    supabase
      .from("organizations")
      .select("id, slug")
      .eq("slug", defaults.organization.slug),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: defaults.organization.name,
      slug: defaults.organization.slug,
      locale: defaults.organization.locale,
      timezone: defaults.organization.timezone,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureProfile(userId, organizationId, fullName, phone) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      organization_id: organizationId,
      full_name: fullName,
      phone,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

async function ensureRole(userId, role) {
  const existing = await maybeSingle(
    supabase
      .from("user_roles")
      .select("id, role")
      .eq("profile_id", userId)
      .eq("role", role),
  );

  if (existing) {
    return;
  }

  const { error } = await supabase.from("user_roles").insert({
    profile_id: userId,
    role,
  });

  if (error) {
    throw error;
  }
}

async function ensureProgram(organizationId, program) {
  const existing = await maybeSingle(
    supabase
      .from("programs")
      .select("id, title")
      .eq("organization_id", organizationId)
      .eq("title", program.title),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("programs")
    .insert({
      organization_id: organizationId,
      title: program.title,
      age_band: program.ageBand,
      capacity: program.capacity,
      monthly_price: program.monthlyPrice,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureBranch(organizationId, branch) {
  const existing = await maybeSingle(
    supabase
      .from("branches")
      .select("id, slug")
      .eq("organization_id", organizationId)
      .eq("slug", branch.slug),
  );

  if (existing) {
    const { error: updateError } = await supabase
      .from("branches")
      .update({
        name: branch.name,
        location: branch.location,
        active: branch.active,
        archived_at: branch.archivedAt,
      })
      .eq("id", existing.id);

    if (updateError && updateError.code !== "42703") {
      throw updateError;
    }

    return existing.id;
  }

  const { data, error } = await supabase
    .from("branches")
    .insert({
      organization_id: organizationId,
      name: branch.name,
      slug: branch.slug,
      location: branch.location,
      active: branch.active,
      archived_at: branch.archivedAt,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureSeason(organizationId, season) {
  const existing = await maybeSingle(
    supabase
      .from("seasons")
      .select("id, title")
      .eq("organization_id", organizationId)
      .eq("title", season.title),
  );

  if (season.isDefault) {
    const { error: clearError } = await supabase
      .from("seasons")
      .update({ is_default: false })
      .eq("organization_id", organizationId);

    if (clearError && clearError.code !== "42703") {
      throw clearError;
    }
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("seasons")
      .update({
        starts_on: season.startsOn,
        ends_on: season.endsOn,
        is_active: season.isActive,
        is_default: season.isDefault,
      })
      .eq("id", existing.id);

    if (updateError && updateError.code !== "42703") {
      throw updateError;
    }

    return existing.id;
  }

  if (season.isActive) {
    const { error: deactivateError } = await supabase
      .from("seasons")
      .update({ is_active: false })
      .eq("organization_id", organizationId);

    if (deactivateError) {
      throw deactivateError;
    }
  }

  const { data, error } = await supabase
    .from("seasons")
    .insert({
      organization_id: organizationId,
      title: season.title,
      starts_on: season.startsOn,
      ends_on: season.endsOn,
      is_active: season.isActive,
      is_default: season.isDefault,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureFeePlan(organizationId, program) {
  const title = `${program.title} Aylik Ucret`;
  const existing = await maybeSingle(
    supabase
      .from("fee_plans")
      .select("id, title")
      .eq("organization_id", organizationId)
      .eq("title", title),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("fee_plans")
    .insert({
      organization_id: organizationId,
      title,
      amount: program.monthlyPrice,
      cadence: "monthly",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureStudent(organizationId, student) {
  const existing = await maybeSingle(
    supabase
      .from("students")
      .select("id, full_name")
      .eq("organization_id", organizationId)
      .eq("full_name", student.fullName),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("students")
    .insert({
      organization_id: organizationId,
      full_name: student.fullName,
      birth_date: student.birthDate,
      active: student.active,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureParentStudentLink(parentProfileId, studentId) {
  const existing = await maybeSingle(
    supabase
      .from("parent_student_links")
      .select("id")
      .eq("parent_profile_id", parentProfileId)
      .eq("student_id", studentId),
  );

  if (existing) {
    return;
  }

  const { error } = await supabase.from("parent_student_links").insert({
    parent_profile_id: parentProfileId,
    student_id: studentId,
    relationship: "Anne",
  });

  if (error) {
    throw error;
  }
}

async function ensureEnrollment(studentId, programId) {
  const existing = await maybeSingle(
    supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", studentId)
      .eq("program_id", programId),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("enrollments")
    .insert({
      student_id: studentId,
      program_id: programId,
      status: "active",
      starts_on: "2026-04-01",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureCharge(enrollmentId, feePlanId, amount, dueDate, status) {
  const existing = await maybeSingle(
    supabase
      .from("charges")
      .select("id, status")
      .eq("enrollment_id", enrollmentId)
      .eq("due_date", dueDate),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("charges")
    .insert({
      enrollment_id: enrollmentId,
      fee_plan_id: feePlanId,
      amount,
      due_date: dueDate,
      status,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensurePayment(chargeId, amount) {
  const existing = await maybeSingle(
    supabase
      .from("payments")
      .select("id")
      .eq("charge_id", chargeId)
      .eq("amount", amount),
  );

  if (existing || amount <= 0) {
    return;
  }

  const { error } = await supabase.from("payments").insert({
    charge_id: chargeId,
    amount,
    payment_method: "manual",
  });

  if (error) {
    throw error;
  }
}

async function ensureSession(programId, coachProfileId, title, startsAt, endsAt, location) {
  const existing = await maybeSingle(
    supabase
      .from("sessions")
      .select("id")
      .eq("program_id", programId)
      .eq("title", title)
      .eq("starts_at", startsAt),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      program_id: programId,
      coach_profile_id: coachProfileId,
      title,
      starts_at: startsAt,
      ends_at: endsAt,
      location,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureAttendance(sessionId, studentId, status, note) {
  const existing = await maybeSingle(
    supabase
      .from("attendance_records")
      .select("id")
      .eq("session_id", sessionId)
      .eq("student_id", studentId),
  );

  if (existing) {
    return;
  }

  const { error } = await supabase.from("attendance_records").insert({
    session_id: sessionId,
    student_id: studentId,
    status,
    note,
  });

  if (error) {
    throw error;
  }
}

async function ensureAnnouncement(organizationId, title, body, audienceRole, publishedAt) {
  const existing = await maybeSingle(
    supabase
      .from("announcements")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("title", title),
  );

  if (existing) {
    return;
  }

  const { error } = await supabase.from("announcements").insert({
    organization_id: organizationId,
    title,
    body,
    audience_role: audienceRole,
    published_at: publishedAt,
  });

  if (error) {
    throw error;
  }
}

async function ensureNotification(profileId, title, body, readAt = null) {
  const existing = await maybeSingle(
    supabase
      .from("notifications")
      .select("id")
      .eq("profile_id", profileId)
      .eq("title", title),
  );

  if (existing) {
    return;
  }

  const { error } = await supabase.from("notifications").insert({
    profile_id: profileId,
    title,
    body,
    channel: "in_app",
    read_at: readAt,
  });

  if (error) {
    throw error;
  }
}

async function ensureSupportThread(parentProfileId, subject, status) {
  const existing = await maybeSingle(
    supabase
      .from("support_threads")
      .select("id")
      .eq("parent_profile_id", parentProfileId)
      .eq("subject", subject),
  );

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("support_threads")
    .insert({
      parent_profile_id: parentProfileId,
      subject,
      status,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function ensureSupportMessage(threadId, authorProfileId, body) {
  const existing = await maybeSingle(
    supabase
      .from("support_messages")
      .select("id")
      .eq("thread_id", threadId)
      .eq("author_profile_id", authorProfileId)
      .eq("body", body),
  );

  if (existing) {
    return;
  }

  const { error } = await supabase.from("support_messages").insert({
    thread_id: threadId,
    author_profile_id: authorProfileId,
    body,
  });

  if (error) {
    throw error;
  }
}

async function main() {
  const organizationId = await ensureOrganization();
  const userMap = new Map();
  const profileMap = new Map();
  const roleSummary = {};

  for (const user of defaults.users) {
    const userId = await ensureUser(user, defaults.organization.slug);
    await ensureProfile(userId, organizationId, user.fullName, user.phone);
    await ensureRole(userId, user.role);
    userMap.set(user.email, userId);
    profileMap.set(user.email, userId);
    roleSummary[user.role] = user.email;
  }

  for (const branch of defaults.branches) {
    await ensureBranch(organizationId, branch);
  }

  for (const season of defaults.seasons) {
    await ensureSeason(organizationId, season);
  }

  const programMap = new Map();
  const feePlanMap = new Map();

  for (const program of defaults.programs) {
    const programId = await ensureProgram(organizationId, program);
    const feePlanId = await ensureFeePlan(organizationId, program);
    programMap.set(program.title, programId);
    feePlanMap.set(program.title, feePlanId);
  }

  const coachProfileId = profileMap.get("ece.yilmaz@elitkids.com");
  const parentProfileId = profileMap.get("ayse.kaya@elitkids.com");

  const sessionPlan = [
    {
      title: "Mini Ice Teknik",
      programTitle: "Mini Ice / 6-8 Yas",
      startsAt: "2026-04-06T09:00:00+03:00",
      endsAt: "2026-04-06T10:15:00+03:00",
      location: "Ana Pist",
    },
    {
      title: "Power Skating Hiz",
      programTitle: "Power Skating / 9-12 Yas",
      startsAt: "2026-04-06T11:00:00+03:00",
      endsAt: "2026-04-06T12:20:00+03:00",
      location: "Mavi Pist",
    },
    {
      title: "Artistik Baslangic",
      programTitle: "Artistik Baslangic",
      startsAt: "2026-04-07T15:00:00+03:00",
      endsAt: "2026-04-07T16:10:00+03:00",
      location: "Ana Pist",
    },
  ];

  const sessionMap = new Map();
  for (const session of sessionPlan) {
    const sessionId = await ensureSession(
      programMap.get(session.programTitle),
      coachProfileId,
      session.title,
      session.startsAt,
      session.endsAt,
      session.location,
    );
    sessionMap.set(session.programTitle, sessionId);
  }

  for (const student of defaults.students) {
    const studentId = await ensureStudent(organizationId, student);
    await ensureParentStudentLink(parentProfileId, studentId);

    const programId = programMap.get(student.programTitle);
    const feePlanId = feePlanMap.get(student.programTitle);
    const enrollmentId = await ensureEnrollment(studentId, programId);
    const chargeId = await ensureCharge(
      enrollmentId,
      feePlanId,
      defaults.programs.find((item) => item.title === student.programTitle).monthlyPrice,
      "2026-04-12",
      student.chargeStatus,
    );

    await ensurePayment(chargeId, student.paidAmount);

    const attendanceStatuses = student.attendanceStatuses;
    const allSessions = [
      sessionMap.get(student.programTitle),
      await ensureSession(
        programId,
        coachProfileId,
        `${student.programTitle} Ek Seans`,
        "2026-04-10T17:00:00+03:00",
        "2026-04-10T18:10:00+03:00",
        "Ana Pist",
      ),
      await ensureSession(
        programId,
        coachProfileId,
        `${student.programTitle} Hafta Sonu`,
        "2026-04-12T10:00:00+03:00",
        "2026-04-12T11:10:00+03:00",
        "Yan Pist",
      ),
    ];

    for (let index = 0; index < attendanceStatuses.length; index += 1) {
      await ensureAttendance(
        allSessions[index],
        studentId,
        attendanceStatuses[index],
        attendanceStatuses[index] === "absent" ? "Veli bilgilendirildi." : null,
      );
    }
  }

  await ensureAnnouncement(
    organizationId,
    "Cumartesi buz saatleri guncellendi",
    "Program yogunlugu nedeniyle iki grup icin pist gecisi 20 dakika otelendi.",
    "parent",
    "2026-04-04T09:30:00+03:00",
  );
  await ensureAnnouncement(
    organizationId,
    "Koc brifingi",
    "Yeni yoklama ve seans notu akisinin saha oncesi uyum toplantisi.",
    "coach",
    "2026-04-04T08:15:00+03:00",
  );
  await ensureAnnouncement(
    organizationId,
    "Tahsilat takibi listesi hazir",
    "Nisan donemi icin acik bakiye listesi guncellendi.",
    "manager",
    "2026-04-04T10:45:00+03:00",
  );

  await ensureNotification(
    profileMap.get("cagrisancar@gmail.com"),
    "Sistem ve rol yapisi dogrulandi",
    "Ilk canli admin ve demo veri seti Supabase tarafinda hazir.",
  );
  await ensureNotification(
    profileMap.get("operasyon@elitkids.com"),
    "14 ailenin borc hatirlatmasi hazir",
    "Nisan tahsilat listesi yayin bekliyor.",
  );
  await ensureNotification(
    profileMap.get("ece.yilmaz@elitkids.com"),
    "Bugun 3 seans rosteri hazir",
    "Yoklama ve saha notlari panelde acik.",
  );
  await ensureNotification(
    profileMap.get("ayse.kaya@elitkids.com"),
    "Nisan odeme ozeti guncellendi",
    "Mina ve Aras icin yeni tahakkuk durumu gorunuyor.",
  );

  const threadId = await ensureSupportThread(
    parentProfileId,
    "Yaz kampi yenileme talebi",
    "open",
  );
  await ensureSupportMessage(
    threadId,
    parentProfileId,
    "Mina Kaya icin yaz kampi kaydini ayni program grubunda yenilemek istiyorum.",
  );
  await ensureSupportMessage(
    threadId,
    profileMap.get("operasyon@elitkids.com"),
    "Kontenjan onayi sonrasi size donus yapacagiz.",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        organizationId,
        roles: roleSummary,
        seededUsers: defaults.users.map((user) => ({
          email: user.email,
          password: user.password,
          role: user.role,
        })),
        programs: defaults.programs.length,
        students: defaults.students.length,
        sessions: sessionPlan.length + defaults.students.length * 2,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
