export type ExpertStatus = "active" | "suspended" | "blocked";

export type ExpertStats = {
  completedCount: number;
  missedDeadlineCount: number;
  avgCompletionHoursLast5: number | null;
};

export type Expert = {
  _id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  oneLineDescription: string | null;
  isInternal: boolean;
  isAvailableForRequests: boolean;
  supportedCountries: string[];
  status: ExpertStatus;
  activeCommittedRequestCount: number;
  stats: ExpertStats;
  lastOfferedAt: string | null;
  lastAssignedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  _id: string;
  externalUserId: string;
  name: string;
  email: string;
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
};

export type CreditLedger = {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  purchaseId: string | null;
  requestId: string | null;
  metadata: {
    adjustedBy: string;
    reason: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AdminRequest = {
  _id: string;
  displayId: string;
  coinTitle: string | null;
  userId: string;
  country: string;
  payload: {
    media?: {
      obverse?: string[];
      reverse?: string[];
      edge?: string[];
      video?: string | null;
    };
  };
  status: string;
  creditLedgerId: string;
  assignedExpertId: string | null;
  previousExpertIds: string[];
  internalExpertId: string;
  allocationRound: number;
  isAdminCreated: boolean;
  firstAcceptanceWindowEndsAt: string;
  ttlExpiresAt: string;
  deadlineAt: string;
  acceptedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  acceptedByFallback: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AllocationSummaryRow = {
  expertId: string;
  workloadPenalty: number;
  speedPenalty: number;
  score: number;
  rank: number;
  offered: boolean;
};

export type AllocationAttempt = {
  attemptId: string;
  round: number;
  attemptedAt: string;
  summary: AllocationSummaryRow[];
};

export type AllocationStage =
  | "initial"
  | "first_window_expired"
  | "skip_refill";

export type AllocationSummaryByStage = {
  requestId: string;
  stages: Record<AllocationStage, AllocationAttempt[]>;
};

export type AllocationSummaryForStage = {
  requestId: string;
  stage: AllocationStage;
  attempts: AllocationAttempt[];
};

export type ApiEnvelope<T> = {
  error: boolean;
  message: string | null;
  data: T;
};

export type CreateExpertBody = {
  name: string;
  email: string;
  password: string;
  supportedCountries: string[];
  profilePicture?: string;
  oneLineDescription?: string;
};

export type UpdateExpertBody = Partial<CreateExpertBody>;

export type CreditAdjustBody = {
  amount: number;
  reason: string;
};

export type CreateUserRequestBody = {
  country: string;
  payload?: {
    media?: {
      obverse?: string[];
      reverse?: string[];
      edge?: string[];
      video?: string | null;
    };
  };
};
