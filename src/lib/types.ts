import type { Route } from "next";

export type AppRole = "admin" | "manager" | "coach" | "parent";

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

export type StudentRecord = {
  name: string;
  program: string;
  coach: string;
  attendance: string;
  balance: string;
  status: string;
};

export type CoachStudentRecord = {
  name: string;
  program: string;
  coach: string;
  attendance: string;
  status: string;
};

export type SessionRecord = {
  title: string;
  slot: string;
  coach: string;
  roster: string;
  location: string;
};

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
};

export type CoachOption = {
  id: string;
  name: string;
};

export type AttendanceStudent = {
  studentId: string;
  name: string;
  status: string;
};

export type CoachSessionBoard = {
  sessionId: string;
  title: string;
  slot: string;
  location: string;
  roster: string;
  students: AttendanceStudent[];
};
