import type { Route } from "next";

export type AppRole = "admin" | "manager" | "coach" | "parent";
export type SecurityRole = "super_admin" | "admin" | "manager" | "staff" | "user";

export type RoleNavItem = {
  href: Route;
  label: string;
  description: string;
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
};

export type DetailQuestionInputType = "text" | "textarea" | "number" | "select";

export type DetailQuestionRecord = {
  id: string;
  fieldKey: string;
  label: string;
  inputType: DetailQuestionInputType;
  helperText: string;
  placeholder: string;
  options: string[];
  required: boolean;
  active: boolean;
  sortOrder: number;
  source?: "database" | "default";
};

export type DetailAnswerRecord = {
  questionId: string;
  fieldKey: string;
  label: string;
  inputType: DetailQuestionInputType;
  value: string;
  sortOrder: number;
};

export type StudentReportCard = {
  id: string;
  summary: string;
  generatedAt: string;
  entries: DetailAnswerRecord[];
};

export type StudentRecord = {
  id: string;
  initials: string;
  name: string;
  club: string;
  category: string;
  gender: string;
  birthDate: string;
  program: string;
  coach: string;
  attendance: string;
  balance: string;
  status: string;
  programId?: string;
  chargeOptions?: ChargeOption[];
  detailSaved?: boolean;
  reportCard?: StudentReportCard | null;
  detailEntries?: DetailAnswerRecord[];
};

export type CoachStudentRecord = {
  id: string;
  initials: string;
  name: string;
  club: string;
  category: string;
  gender: string;
  birthDate: string;
  program: string;
  coach: string;
  attendance: string;
  status: string;
  detailSaved?: boolean;
  reportCard?: StudentReportCard | null;
  detailEntries?: DetailAnswerRecord[];
};

export type SessionRecord = {
  id: string;
  title: string;
  slot: string;
  coach: string;
  roster: string;
  location: string;
  programTitle?: string;
  branchName?: string;
  sportsBranchName?: string;
  areaName?: string;
  studentCount?: number;
  capacity?: number;
  sessionSeriesId?: string | null;
  programId?: string;
  coachId?: string | null;
  areaId?: string | null;
  notes?: string;
  startsAt?: string;
  endsAt?: string;
  status?: "active" | "cancelled";
};

export type SessionSeries = {
  id: string;
  title: string;
  programId: string;
  coachId?: string | null;
  areaId?: string | null;
  startsOn: string;
  endsOn: string;
  startTime: string;
  endTime: string;
  weekdays: number[];
  sessionCount: number;
  status: "active" | "paused" | "cancelled";
  notes: string;
};

export type SessionCalendarCell = {
  dayKey: string;
  hour: number;
  sessions: SessionRecord[];
};

export type AttendanceStatus = "present" | "absent" | "excused";

export type ChargeRecord = {
  item: string;
  dueDate: string;
  amount: string;
  status: string;
};

export type AnnouncementRecord = {
  title: string;
  audience: string;
  time: string;
  summary: string;
};

export type NotificationRecord = {
  title: string;
  channel: string;
  status: string;
};

export type OrganizationSettings = {
  id: string;
  name: string;
  slug: string;
  locale: string;
  timezone: string;
};

export type BranchSetting = {
  id: string;
  name: string;
  slug: string;
  location: string;
  status: string;
  active: boolean;
  archived: boolean;
};

export type SeasonSetting = {
  id: string;
  title: string;
  duration: string;
  status: string;
  startsOn: string;
  endsOn: string;
  isActive: boolean;
  isDefault: boolean;
};

export type ParentNotification = {
  id: string;
  title: string;
  body: string;
  channel: string;
  status: string;
};

export type SupportThread = {
  subject: string;
  status: string;
  updatedAt: string;
};

export type PreRegistrationStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "approved"
  | "activated"
  | "rejected"
  | "archived";

export type PreRegistrationSettings = {
  formEnabled: boolean;
  kvkkTitle: string;
  kvkkBody: string;
  kvkkCheckboxLabel: string;
  parentPermissionTitle: string;
  parentPermissionBody: string;
  parentPermissionCheckboxLabel: string;
  successMessage: string;
  helperNote: string;
};

export type PreRegistrationOption = {
  id: string;
  label: string;
};

export type PreRegistrationAsset = {
  id: string;
  fileType: string;
  url: string;
};

export type PreRegistrationNote = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
};

export type PreRegistrationRecord = {
  id: string;
  studentFullName: string;
  studentBirthDate: string;
  tcIdentityNo: string;
  note: string;
  parentEmail: string;
  parentWhatsapp: string;
  emergencyContact: string;
  motherName: string;
  motherPhone: string;
  motherOccupation: string;
  fatherName: string;
  fatherPhone: string;
  fatherOccupation: string;
  address: string;
  branchId: string | null;
  branchLabel: string;
  seasonId: string | null;
  seasonLabel: string;
  programId: string | null;
  programLabel: string;
  status: PreRegistrationStatus;
  statusLabel: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  activatedStudentId: string | null;
  activatedParentProfileId: string | null;
  kvkkAcceptedAt: string | null;
  parentPermissionAcceptedAt: string | null;
  submittedIp: string | null;
  forwardedIp: string | null;
  userAgent: string | null;
  deviceSummary: string | null;
  clientPlatform: string | null;
  clientBrowser: string | null;
  clientDeviceType: string | null;
  sourceLabel: string;
  assets: PreRegistrationAsset[];
  notes: PreRegistrationNote[];
};

export type AuditLogRow = {
  event: string;
  actor: string;
  scope: string;
  createdAt: string;
};

export type LeadSubmissionRow = {
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
};

export type ChargeOption = {
  id: string;
  label: string;
  amount: string;
  status: string;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  scope: string;
  status: string;
};

export type AdminUserOption = {
  id: string;
  label: string;
  role: string;
};

export type ProgramOption = {
  id: string;
  title: string;
  branchName?: string;
  categoryName?: string;
  areaName?: string;
};

export type ProgramRecord = {
  id: string;
  title: string;
  detail: string;
  ageBand: string;
  capacity: number;
  monthlyPrice: number;
  programTypeId?: string | null;
  programTypeName?: string;
  seasonId?: string | null;
  seasonTitle?: string;
  categoryId?: string | null;
  categoryName?: string;
  branchId?: string | null;
  branchName?: string;
  sportsBranchId?: string | null;
  sportsBranchName?: string;
  coachProfileId?: string | null;
  coachName?: string;
  areaId?: string | null;
  areaName?: string;
  notes?: string;
  enrolledCount?: number;
  monthlyLessonQuota?: number;
  status?: "active" | "archived";
};

export type ProgramType = {
  id: string;
  name: string;
  slug?: string;
};

export type Category = {
  id: string;
  name: string;
  slug?: string;
};

export type Area = {
  id: string;
  name: string;
  branchId?: string | null;
  branchName?: string;
  slug?: string;
};

export type SportsBranch = {
  id: string;
  name: string;
  slug?: string;
};

export type ProgramResourceAdminData = {
  branches: Array<{ id: string; label: string }>;
  programTypes: ProgramType[];
  categories: Category[];
  sportsBranches: SportsBranch[];
  areas: Area[];
};

export type ProgramFormOptions = {
  seasons: Array<{ id: string; label: string }>;
  branches: Array<{ id: string; label: string }>;
  programTypes: ProgramType[];
  categories: Category[];
  sportsBranches: SportsBranch[];
  areas: Area[];
  coaches: CoachOption[];
};

export type CoachOption = {
  id: string;
  name: string;
};

export type AttendanceStudent = {
  studentId: string;
  name: string;
  status: string;
  note?: string;
};

export type StudentPackageCycle = {
  id: string;
  studentId: string;
  enrollmentId: string;
  programId: string;
  cycleStart: string;
  cycleEnd: string;
  totalLessons: number;
  usedLessons: number;
  remainingLessons: number;
  status: "active" | "closed";
};

export type CoachSessionBoard = {
  sessionId: string;
  title: string;
  slot: string;
  location: string;
  roster: string;
  students: AttendanceStudent[];
};
