export type WorkArrangement = 'remote' | 'hybrid' | 'on-site';
export type JobStatus = 'open' | 'paused' | 'closed' | 'archived';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export interface JobOpening {
  id: string;
  title: string;
  company: string;
  department?: string;
  industry: string;
  location: string;
  workArrangement: WorkArrangement;
  employmentType: EmploymentType;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  minExperienceYears: number;
  maxExperienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  mandatoryQualifications?: string[];
  status: JobStatus;
  publishedAt: string;
  updatedAt?: string;
  clientId?: string;
  clientName?: string;
  postedBy?: string;
}

export interface RecommendationReason {
  category: 'skills' | 'experience' | 'role' | 'industry' | 'location' | 'transferable';
  label: string;
  weight: number;
}

export interface JobMatchExplanation {
  overallScore: number; // 0 - 100
  skillsMatchScore: number;
  experienceMatchScore: number;
  preferencesScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  meetsMandatoryRequirements: boolean;
  reasons: RecommendationReason[];
  transferableHighlight?: string;
  computedAt: string;
}

export interface JobRecommendation {
  job: JobOpening;
  explanation: JobMatchExplanation;
  isSaved?: boolean;
  isDismissed?: boolean;
  hasExpressedInterest?: boolean;
}

export type CandidateFeedbackType = 'save' | 'view' | 'dismiss' | 'express_interest' | 'apply' | 'not_relevant';

export interface CandidateJobInteraction {
  id: string;
  candidateId: string;
  jobId: string;
  interactionType: CandidateFeedbackType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CandidatePersonalizationConsent {
  candidateId: string;
  personalizationEnabled: boolean;
  talentMarketplaceVisible: boolean;
  passiveCandidateSearchable: boolean;
  consentVersion: string;
  updatedAt: string;
}

export interface RecommendationSectionData {
  recommendedForYou: JobRecommendation[];
  similarJobs: JobRecommendation[];
  skillsBasedJobs: JobRecommendation[];
  moreLikeThis: JobRecommendation[];
  recentlyViewed: JobRecommendation[];
  newMatches: JobRecommendation[];
  becauseYouSaved: JobRecommendation[];
  careerMoveJobs: JobRecommendation[];
}
