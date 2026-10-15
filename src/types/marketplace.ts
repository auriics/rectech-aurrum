import { JobOpening } from './jobRecommendations';

export type MarketplaceVisibilityState = 'not_opted_in' | 'discoverable' | 'paused' | 'withdrawn';

export interface MarketplaceProfile {
  id: string; // matches candidateId
  candidateId: string;
  fullName: string;
  email: string;
  phone?: string;
  headline: string;
  summary: string;
  skills: string[];
  totalExperienceYears: number;
  industries: string[];
  preferredTitles: string[];
  preferredLocations: string[];
  workArrangement: 'remote' | 'hybrid' | 'on-site' | 'flexible';
  employmentType: 'full-time' | 'contract' | 'part-time';
  desiredSalaryMin?: number;
  desiredSalaryMax?: number;
  salaryCurrency: string;
  availability: 'immediate' | '2_weeks' | '1_month' | 'exploring';
  visibility: MarketplaceVisibilityState;
  anonymized: boolean; // shields email, phone until intro accepted
  optedInAt?: string;
  pausedAt?: string;
  withdrawnAt?: string;
  lastActiveAt: string;
  verifiedQualifications: string[];
  consentVersion: string;
}

export type IntroductionStatus = 
  | 'suggested'
  | 'pending_candidate_interest'
  | 'pending_employer_interest'
  | 'mutual_interest'
  | 'intro_requested'
  | 'intro_accepted'
  | 'intro_declined'
  | 'interview_scheduled'
  | 'hired'
  | 'closed'
  | 'expired';

export interface IntroductionStatusHistory {
  status: IntroductionStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface DirectIntroduction {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string; // Revealed only when status === 'intro_accepted' or 'interview_scheduled' or 'hired'
  candidatePhone?: string;
  candidateHeadline?: string;
  candidateSkills?: string[];
  candidateExperienceYears?: number;
  jobId: string;
  jobTitle: string;
  companyName: string;
  clientId: string; // employer/client ID
  clientName?: string;
  clientEmail?: string;
  recruiterId?: string; // sourcing agency/recruiter
  matchScore: number;
  matchReasons: string[];
  status: IntroductionStatus;
  statusHistory: IntroductionStatusHistory[];
  candidateInterestTimestamp?: string;
  employerInterestTimestamp?: string;
  introAcceptedTimestamp?: string;
  interviewScheduledDate?: string;
  hiredDate?: string;
  expiresAt: string; // e.g. 14 days from creation
  createdAt: string;
  updatedAt: string;
}

export type AttributionBillingStatus = 'pending_verification' | 'invoice_drafted' | 'invoiced' | 'paid' | 'disputed';

export interface HiringAttribution {
  id: string;
  introductionId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  agencyId?: string;
  hireConfirmedAt: string;
  confirmedBy: string;
  annualSalaryAgreed: number;
  currency: string;
  feeModel: 'percentage_of_ctc' | 'fixed_success_fee';
  feeRate: number; // percentage (e.g. 15) or fixed currency amount
  totalFeeAmount: number;
  billingStatus: AttributionBillingStatus;
  invoiceId?: string;
  notes?: string;
}

export interface MarketplaceNetworkAnalytics {
  totalDiscoverableCandidates: number;
  totalActiveJobs: number;
  totalIntroductions: number;
  mutualMatchesCount: number;
  interviewsScheduledCount: number;
  confirmedHiresCount: number;
  introductionAcceptanceRate: number; // percentage
  averageTimeToIntroductionHours: number;
  sourcingPipelineValue: number;
}
