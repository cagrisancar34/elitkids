import type { Route } from "next";

export type AppRole = "admin" | "manager" | "coach" | "parent";
export type SecurityRole = "super_admin" | "admin" | "manager" | "staff" | "user";

export type RoleNavItem = {
  href: Route;
  label: string;
  description: string;
};

export type NavSectionId = "admin" | "manager" | "coach" | "parent";

export type RoleNavSection = {
  id: NavSectionId;
  label: string;
  description: string;
  items: RoleNavItem[];
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
};

export type StudentListFilterState = {
  search: string;
  ageBand: "all" | "child" | "teen" | "adult";
  program: string;
  payment: "all" | "completed" | "pending" | "overdue";
};

export type PaymentLifecycleStatus = "pending" | "overdue" | "completed";
export type PaymentMethod = "cash" | "transfer" | "card" | "manual";
export type SupportThreadStatusKey = "open" | "waiting_parent" | "resolved";

export type CollectionTrendPoint = {
  label: string;
  value: number;
  status: string;
};

export type FinanceCockpitSummary = {
  outstandingTotal: number;
  paidTotal: number;
  followCount: number;
  collectionRate: number;
  trend: CollectionTrendPoint[];
};

export type ParentDashboardSummary = {
  metrics: Metric[];
  linkedStudentsLabel: string;
  linkedStudentsSummary: string;
  totalOutstandingValue: number;
  unreadNotifications: number;
  reportCardCount: number;
  upcomingSessions: SessionRecord[];
  actionItems: Array<{
    title: string;
    subtitle: string;
    state: string;
    actionLabel: string;
    href: string;
  }>;
  linkedStudentSummaries: ParentLinkedStudentSummary[];
  financeCharges: ChargeRecord[];
};

export type AdminOverviewSummary = {
  metrics: Metric[];
  notifications: NotificationRecord[];
};

export type ManagerDashboardStudentSummary = Pick<
  StudentRecord,
  "id" | "name" | "program" | "status" | "attendance" | "balance"
>;

export type ManagerDashboardSummary = {
  metrics: Metric[];
  todaySessions: SessionRecord[];
  announcements: AnnouncementRecord[];
  priorityPayments: ChargeRecord[];
  criticalStudents: ManagerDashboardStudentSummary[];
};

export type CoachDashboardAttentionItem = {
  sessionId: string;
  sessionTitle: string;
  dateLabel: string;
  studentName: string;
  reason?: string;
};

export type CoachDashboardSummary = {
  metrics: Metric[];
  focusSessions: Array<
    Pick<
      CoachSessionBoard,
      "sessionId" | "title" | "location" | "dateLabel" | "dayKey" | "dayShort" | "startTime" | "endTime"
    > & {
      studentCount: number;
      pendingAttendanceCount: number;
      firstSessionCount: number;
    }
  >;
  pendingAttendance: number;
  noteQueue: number;
  firstTimers: number;
  postSessionClosures: number;
  firstTimerStudents: CoachDashboardAttentionItem[];
  exceptionStudents: CoachDashboardAttentionItem[];
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
  enrollmentId?: string;
  initials: string;
  name: string;
  photoUrl?: string | null;
  club: string;
  category: string;
  gender: string;
  birthDate: string;
  program: string;
  coach: string;
  attendance: string;
  balance: string;
  status: string;
  paymentStatus?: PaymentLifecycleStatus;
  registrationSourceLabel?: string | null;
  parentName?: string | null;
  parentWhatsapp?: string | null;
  lastChargeLabel?: string | null;
  lastChargeStatusLabel?: string | null;
  lastCommunicationLabel?: string | null;
  lastWhatsAppStatusLabel?: string | null;
  lastSupportSubject?: string | null;
  lastCampaignLabel?: string | null;
  lastPaymentNote?: string | null;
  programId?: string;
  sessionSeriesId?: string | null;
  sessionSeriesLabel?: string | null;
  enrollmentStartsOn?: string | null;
  allocatedLessons?: number;
  consumedLessons?: number;
  remainingLessons?: number;
  nextAllocatedSessionAt?: string | null;
  lastAllocatedSessionAt?: string | null;
  chargeOptions?: ChargeOption[];
  detailSaved?: boolean;
  reportCard?: StudentReportCard | null;
  detailEntries?: DetailAnswerRecord[];
  crmTimeline?: StudentCrmTimelineItem[];
};

export type ManagerStudentListRow = Omit<
  StudentRecord,
  "chargeOptions" | "reportCard" | "detailEntries" | "crmTimeline"
> & {
  detailSaved?: boolean;
};

export type ManagerStudentSheet = Pick<
  StudentRecord,
  | "id"
  | "chargeOptions"
  | "reportCard"
  | "detailEntries"
  | "crmTimeline"
  | "lastSupportSubject"
  | "lastCampaignLabel"
  | "lastPaymentNote"
  | "lastChargeLabel"
  | "lastChargeStatusLabel"
  | "lastCommunicationLabel"
  | "lastWhatsAppStatusLabel"
  | "detailSaved"
>;

export type StudentCrmTimelineItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  tone: "sky" | "amber" | "rose" | "emerald" | "slate";
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
  remainingLessons?: number;
  lastAttendanceLabel?: string | null;
  coachNoteSummary?: string | null;
  firstSessionFlag?: boolean;
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
  studentNames?: string[];
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
  id?: string;
  enrollmentId?: string;
  studentId?: string;
  programId?: string;
  item: string;
  dueDate: string;
  amount: string;
  status: string;
  paymentStatus?: PaymentLifecycleStatus;
  billingPeriodLabel?: string;
  totalAmountValue?: number;
  paidAmountValue?: number;
  remainingAmountValue?: number;
  paidAmount?: string;
  remainingAmount?: string;
  lastPaymentLabel?: string | null;
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

export type AppNotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
};

export type PageDocumentationItem = {
  title: string;
  body: string;
};

export type PageDocumentation = {
  pageKey: string;
  title: string;
  purpose: string;
  actions: PageDocumentationItem[];
  areas: PageDocumentationItem[];
  workflow: PageDocumentationItem[];
  notes: string[];
};

export type WhatsAppTemplateEventKey =
  | "registration_completed"
  | "attendance_absent_manual"
  | "payment_reminder_manual"
  | "report_card_updated"
  | "bulk_broadcast";

export type MessageChannel = "whatsapp" | "panel" | "both";

export type MessageTopicKey =
  | "registration_completed"
  | "pre_registration_activated"
  | "student_created_manual"
  | "attendance_absent_manual"
  | "payment_reminder_manual"
  | "report_card_updated"
  | "bulk_broadcast"
  | "panel_notice_registration_completed"
  | "panel_notice_payment_risk"
  | "panel_notice_lesson_rights_expiring";

export type WhatsAppOptInStatus = "opted_in" | "opted_out" | "unknown";

export type MessageDeliveryStatus =
  | "blocked"
  | "queued"
  | "processing"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type RecipientSegment =
  | "all_parents"
  | "all_users"
  | "debt_parents"
  | "program_parents"
  | "branch_parents"
  | "session_series_members"
  | "specific_students"
  | "all_staff"
  | "coaches"
  | "managers";

export type MessageTopic = {
  id: string;
  topicKey: MessageTopicKey;
  title: string;
  description: string;
  channel: MessageChannel;
  bodyTemplate: string;
  availableVariables: string[];
  active: boolean;
  editableByManager: boolean;
};

export type WhatsAppTemplateDefinition = {
  id: string;
  eventKey: WhatsAppTemplateEventKey;
  locale: string;
  metaTemplateName: string;
  enabled: boolean;
  variableSchema: string[];
};

export type WhatsAppContact = {
  id: string;
  fullName: string;
  phone: string;
  normalizedPhone: string;
  recipientType: "profile" | "lead" | "pre_registration";
  optInStatus: WhatsAppOptInStatus;
  optInSource: string;
  lastOptInAt: string | null;
};

export type MessageDispatch = {
  id: string;
  eventKey: WhatsAppTemplateEventKey;
  recipientName: string;
  recipientPhone: string;
  status: MessageDeliveryStatus;
  scheduledFor: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  lastError: string | null;
};

export type MessageCampaign = {
  id: string;
  title: string;
  audienceType: RecipientSegment;
  topicKey?: MessageTopicKey | null;
  status: "draft" | "queued" | "processing" | "completed" | "failed";
  createdAt: string;
  sentAt: string | null;
};

export type WhatsAppSettingsStatus = {
  configured: boolean;
  missingKeys: string[];
  phoneNumberId: string | null;
  businessAccountId: string | null;
};

export type WhatsAppSettingsOverview = {
  status: WhatsAppSettingsStatus;
  templates: WhatsAppTemplateDefinition[];
  messageTopics: MessageTopic[];
  dispatches: MessageDispatch[];
  queueCount: number;
  blockedCount: number;
};

export type WhatsAppCampaignOverview = {
  templates: WhatsAppTemplateDefinition[];
  messageTopics: MessageTopic[];
  campaigns: MessageCampaign[];
  dispatches: MessageDispatch[];
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
  id?: string;
  subject: string;
  status: string;
  updatedAt: string;
  openedAtValue?: string | null;
  updatedAtValue?: string | null;
  latestMessagePreview?: string;
  messageCount?: number;
  parentName?: string;
  statusKey?: SupportThreadStatusKey;
  openedAtLabel?: string | null;
  responseAgeLabel?: string | null;
  responseAgeDays?: number | null;
  slaStatusLabel?: string | null;
  slaTone?: "rose" | "amber" | "emerald";
  messages?: SupportThreadMessage[];
};

export type SupportThreadMessage = {
  id: string;
  body: string;
  createdAt: string;
  authorLabel: string;
  authorType: "parent" | "staff";
};

export type PreRegistrationStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "documents_pending"
  | "trial_scheduled"
  | "ready_to_activate"
  | "approved"
  | "activated"
  | "lost"
  | "rejected"
  | "archived";

export type PreRegistrationSettings = {
  formEnabled: boolean;
  formEyebrow: string;
  formTitle: string;
  formDescription: string;
  formLogoUrl: string;
  formLogoPath: string;
  kvkkTitle: string;
  kvkkBody: string;
  kvkkCheckboxLabel: string;
  parentPermissionTitle: string;
  parentPermissionBody: string;
  parentPermissionCheckboxLabel: string;
  successMessage: string;
  helperNote: string;
};

export type PreRegistrationFieldInputType = "text" | "textarea" | "date" | "select" | "email" | "phone" | "file";
export type PreRegistrationFieldSection = "student" | "parent" | "application";

export type PreRegistrationFieldRecord = {
  id: string;
  fieldKey: string;
  label: string;
  inputType: PreRegistrationFieldInputType;
  helperText: string;
  placeholder: string;
  options: string[];
  required: boolean;
  active: boolean;
  sortOrder: number;
  section: PreRegistrationFieldSection;
  system: boolean;
  source?: "database" | "default";
};

export type PreRegistrationOption = {
  id: string;
  label: string;
};

export type PreRegistrationSessionSeriesOption = PreRegistrationOption & {
  programId: string;
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
  studentGender: string;
  tcIdentityNo: string;
  note: string;
  parentEmail: string;
  parentWhatsapp: string;
  emergencyContact: string;
  customAnswers?: Record<string, string>;
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
  latestTrialOutcome?: string | null;
  latestLostReason?: string | null;
};

export type AuditLogRow = {
  event: string;
  actor: string;
  scope: string;
  createdAt: string;
  createdAtValue?: string | null;
  actorRole?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  detail?: string | null;
};

export type LeadSubmissionRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  source?: string;
  createdAt: string;
};

export type CommunicationTimelineItem = {
  id: string;
  studentName: string;
  parentName: string;
  channel: string;
  summary: string;
  status: string;
  createdAt: string;
};

export type ParentLinkedStudentSummary = {
  studentId: string;
  studentName: string;
  ageBand: string;
  programName: string;
  sessionSeriesLabel: string;
  coachName: string;
  paymentStatus: PaymentLifecycleStatus;
  paymentStatusLabel: string;
  billingPeriodLabel: string;
  remainingAmountLabel: string;
  remainingAmountValue: number;
  nextPaymentDueLabel: string;
};

export type ChargeOption = {
  id: string;
  label: string;
  amount: string;
  status: string;
  paymentStatus?: PaymentLifecycleStatus;
  remainingAmountValue?: number;
  billingPeriodLabel?: string;
  dueDateLabel?: string;
};

export type PaymentHistoryEntry = {
  id: string;
  amountValue: number;
  amountLabel: string;
  paidAt: string | null;
  paidAtLabel: string;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  referenceNo: string;
  note: string;
};

export type BillingChargeRecord = {
  id: string;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentInitials: string;
  parentName: string;
  parentWhatsapp: string | null;
  programName: string;
  sessionSeriesLabel: string;
  billingPeriod: string | null;
  billingPeriodLabel: string;
  dueDate: string | null;
  dueDateLabel: string;
  totalAmountValue: number;
  totalAmountLabel: string;
  paidAmountValue: number;
  paidAmountLabel: string;
  remainingAmountValue: number;
  remainingAmountLabel: string;
  lastPaymentAt: string | null;
  lastPaymentLabel: string | null;
  paymentStatus: PaymentLifecycleStatus;
  statusLabel: string;
  statusTone: "amber" | "rose" | "emerald";
  history: PaymentHistoryEntry[];
  auditTrail?: AuditLogRow[];
  reminderPreview: string | null;
  webWhatsAppHref: string | null;
};

export type FinanceTimelineItem = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  amountLabel?: string | null;
  tone: "sky" | "amber" | "rose" | "emerald" | "slate";
  createdAt: string;
  createdAtValue?: string | null;
};

export type StudentPaymentSummary = {
  studentId: string;
  studentName: string;
  programName: string;
  sessionSeriesLabel: string;
  totalAmountValue: number;
  totalAmountLabel: string;
  paidAmountValue: number;
  paidAmountLabel: string;
  remainingAmountValue: number;
  remainingAmountLabel: string;
  paymentStatus: PaymentLifecycleStatus;
  statusLabel: string;
  dueDateLabel: string;
  billingPeriodLabel: string;
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

export type SessionSeriesOption = {
  id: string;
  programId: string;
  programTitle: string;
  title: string;
  label: string;
  startsOn: string;
  endsOn: string;
  status: "active" | "paused" | "cancelled";
};

export type StudentOption = {
  id: string;
  label: string;
  programLabel?: string;
  sessionSeriesLabel?: string;
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
  sessionSeriesCount?: number;
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
  hasAttendanceRecord?: boolean;
  firstSessionFlag?: boolean;
  allocationStatus?: "planned" | "consumed" | "cancelled";
};

export type EnrollmentSessionAllocation = {
  id: string;
  enrollmentId: string;
  studentId: string;
  sessionId: string;
  sessionSeriesId: string | null;
  sequenceNo: number;
  source: "initial" | "bonus" | "renewal";
  status: "planned" | "consumed" | "cancelled";
  consumedAt: string | null;
};

export type StudentLessonStatus = {
  allocatedLessons: number;
  consumedLessons: number;
  remainingLessons: number;
  nextAllocatedSessionAt: string | null;
  lastAllocatedSessionAt: string | null;
};

export type ExpiringStudentNotice = {
  studentId: string;
  studentName: string;
  programTitle: string;
  sessionSeriesLabel: string | null;
  remainingLessons: number;
  nextAllocatedSessionAt: string | null;
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
  dateLabel?: string;
  dayKey?: string;
  dayShort?: string;
  startTime?: string;
  endTime?: string;
  sessionClosingNote?: string | null;
  sessionClosingUpdatedAt?: string | null;
  students: AttendanceStudent[];
};

export type CoachSessionSummary = Omit<CoachSessionBoard, "students"> & {
  studentCount: number;
  pendingNotesCount: number;
  studentPreviewNames: string[];
};

export type CoachSessionDetail = CoachSessionBoard;

export type CoachClosingNoteArchiveItem = {
  sessionId: string;
  sessionTitle: string;
  note: string;
  createdAt: string;
  createdAtValue?: string | null;
};
