import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  JobOpening, 
  JobRecommendation, 
  CandidateFeedbackType, 
  RecommendationSectionData,
  CandidatePersonalizationConsent 
} from '../types/jobRecommendations';
import { calculateJobMatch, calculateJobToJobSimilarity } from './recommendationEngine';

const JOBS_COLLECTION = 'marketplace_jobs';
const INTERACTIONS_COLLECTION = 'candidate_job_interactions';
const CONSENT_COLLECTION = 'candidate_personalization_consent';

// Pre-seeded high quality benchmark jobs for immediate discovery & recommendation
export const BENCHMARK_JOBS: JobOpening[] = [
  {
    id: 'job-aurrum-fullstack-01',
    title: 'Senior Full Stack Engineer (React & Node.js)',
    company: 'Aurrum Tech Solutions',
    industry: 'IT / Software',
    location: 'London, UK',
    workArrangement: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    minExperienceYears: 4,
    salaryMin: 85000,
    salaryMax: 110000,
    salaryCurrency: 'GBP',
    description: 'We are seeking an experienced Full Stack Engineer proficient with React, TypeScript, Node.js, and cloud backends to build modern, high-volume recruitment platforms.',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'SQL', 'REST API'],
    preferredSkills: ['Tailwind CSS', 'Docker', 'Firebase', 'AWS'],
    mandatoryQualifications: ['Bachelor degree or equivalent practical experience', '4+ years full stack development'],
    status: 'open',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    clientName: 'Aurrum Talent Cloud'
  },
  {
    id: 'job-aurrum-ai-ml-02',
    title: 'Lead AI / Machine Learning Engineer',
    company: 'Cognitive Insights Labs',
    industry: 'AI / Machine Learning',
    location: 'Remote, UK / Europe',
    workArrangement: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'lead',
    minExperienceYears: 5,
    salaryMin: 95000,
    salaryMax: 130000,
    salaryCurrency: 'GBP',
    description: 'Architect generative AI pipelines, LLM fine-tuning, embeddings search, and intelligent candidate-matching engines with Google Gemini and OpenAI.',
    requiredSkills: ['Python', 'Machine Learning', 'AI', 'NLP', 'PyTorch', 'TensorFlow'],
    preferredSkills: ['LLM', 'Gemini API', 'Vector DB', 'LangChain'],
    mandatoryQualifications: ['5+ years applying ML models in production'],
    status: 'open',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    clientName: 'Global AI Ventures'
  },
  {
    id: 'job-aurrum-frontend-03',
    title: 'Frontend React UI/UX Specialist',
    company: 'Creative Nexus Studio',
    industry: 'Design',
    location: 'Manchester, UK',
    workArrangement: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    minExperienceYears: 2,
    salaryMin: 50000,
    salaryMax: 68000,
    salaryCurrency: 'GBP',
    description: 'Design intuitive interfaces, responsive design systems, micro-interactions, and accessible web experiences using React and Tailwind CSS.',
    requiredSkills: ['React', 'CSS', 'HTML', 'JavaScript', 'UI/UX Design', 'Tailwind CSS'],
    preferredSkills: ['Figma', 'Framer Motion', 'Accessibility (WCAG)'],
    mandatoryQualifications: ['Portfolio of interactive web applications'],
    status: 'open',
    publishedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    clientName: 'Design First Ltd'
  },
  {
    id: 'job-aurrum-devops-04',
    title: 'Cloud DevOps & Infrastructure Engineer',
    company: 'CloudScale Networks',
    industry: 'Engineering',
    location: 'London, UK',
    workArrangement: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    minExperienceYears: 4,
    salaryMin: 80000,
    salaryMax: 105000,
    salaryCurrency: 'GBP',
    description: 'Deploy resilient multi-cloud environments, automated CI/CD pipelines, Kubernetes clusters, and zero-trust security architecture.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
    preferredSkills: ['GCP', 'Prometheus', 'Grafana', 'Python'],
    mandatoryQualifications: ['Demonstrated experience managing production container clusters'],
    status: 'open',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    clientName: 'CloudScale Group'
  },
  {
    id: 'job-aurrum-pm-05',
    title: 'Technical Project / Delivery Manager',
    company: 'Apex Digital Consulting',
    industry: 'Project Management',
    location: 'Birmingham, UK',
    workArrangement: 'on-site',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    minExperienceYears: 5,
    salaryMin: 70000,
    salaryMax: 90000,
    salaryCurrency: 'GBP',
    description: 'Lead cross-functional engineering squads, manage enterprise stakeholder communications, and deliver complex software releases on schedule.',
    requiredSkills: ['Project Management', 'Agile', 'Scrum', 'Jira', 'Stakeholder Management', 'Risk Management'],
    preferredSkills: ['PMP', 'Prince2', 'Technical Background'],
    mandatoryQualifications: ['5+ years delivering enterprise digital transformations'],
    status: 'open',
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    clientName: 'Apex Advisory'
  },
  {
    id: 'job-aurrum-sales-06',
    title: 'Enterprise SaaS Account Executive',
    company: 'Aurrum Cloud Revenue',
    industry: 'Sales',
    location: 'London, UK',
    workArrangement: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    minExperienceYears: 3,
    salaryMin: 60000,
    salaryMax: 85000,
    salaryCurrency: 'GBP',
    description: 'Drive new logo acquisitions, conduct high-impact product demonstrations, and close recurring B2B software partnerships.',
    requiredSkills: ['Sales', 'B2B Sales', 'Lead Generation', 'CRM', 'Negotiation', 'Account Management'],
    preferredSkills: ['SaaS Experience', 'Hubspot', 'Enterprise Accounts'],
    mandatoryQualifications: ['Proven track record hitting revenue quotas'],
    status: 'open',
    publishedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    clientName: 'Growth Partners UK'
  }
];

/**
 * Fetch all available open jobs from Firestore (or fallback to benchmark jobs)
 */
export async function getMarketplaceJobs(): Promise<JobOpening[]> {
  try {
    const q = query(collection(db, JOBS_COLLECTION), where('status', '==', 'open'), limit(100));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as JobOpening));
    }
  } catch (err) {
    console.warn('[JobDiscovery] Error querying marketplace_jobs from Firestore, using benchmark pool:', err);
  }
  return BENCHMARK_JOBS;
}

/**
 * Record a candidate interaction (view, save, dismiss, express_interest)
 */
export async function recordCandidateInteraction(
  candidateId: string, 
  jobId: string, 
  type: CandidateFeedbackType,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await addDoc(collection(db, INTERACTIONS_COLLECTION), {
      candidateId,
      jobId,
      interactionType: type,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    });
  } catch (err) {
    console.warn('[JobDiscovery] Failed to record candidate interaction:', err);
  }
}

/**
 * Get candidate interactions
 */
export async function getCandidateInteractions(candidateId: string): Promise<Record<string, CandidateFeedbackType[]>> {
  const result: Record<string, CandidateFeedbackType[]> = {};
  try {
    const q = query(
      collection(db, INTERACTIONS_COLLECTION), 
      where('candidateId', '==', candidateId), 
      limit(200)
    );
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (!result[data.jobId]) result[data.jobId] = [];
      result[data.jobId].push(data.interactionType);
    });
  } catch (err) {
    console.warn('[JobDiscovery] Could not load candidate interactions:', err);
  }
  return result;
}

/**
 * Check or update personalization consent
 */
export async function getCandidateConsent(candidateId: string): Promise<CandidatePersonalizationConsent> {
  try {
    const consentDoc = await getDoc(doc(db, CONSENT_COLLECTION, candidateId));
    if (consentDoc.exists()) {
      return consentDoc.data() as CandidatePersonalizationConsent;
    }
  } catch (e) {
    console.warn('[JobDiscovery] Error reading consent doc:', e);
  }

  // Default consented state with full privacy protection
  return {
    candidateId,
    personalizationEnabled: true,
    talentMarketplaceVisible: true,
    passiveCandidateSearchable: false,
    consentVersion: 'v1.0-GDPR',
    updatedAt: new Date().toISOString()
  };
}

export async function updateCandidateConsent(
  candidateId: string, 
  updates: Partial<CandidatePersonalizationConsent>
): Promise<void> {
  try {
    await setDoc(doc(db, CONSENT_COLLECTION, candidateId), {
      candidateId,
      personalizationEnabled: updates.personalizationEnabled ?? true,
      talentMarketplaceVisible: updates.talentMarketplaceVisible ?? true,
      passiveCandidateSearchable: updates.passiveCandidateSearchable ?? false,
      consentVersion: 'v1.0-GDPR',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error('[JobDiscovery] Error updating consent:', e);
  }
}

/**
 * Generate full personalized recommendation sections for a candidate
 */
export async function generatePersonalizedRecommendations(
  candidate: any,
  allJobs?: JobOpening[]
): Promise<RecommendationSectionData> {
  const jobs = allJobs || await getMarketplaceJobs();
  const interactions = candidate?.id ? await getCandidateInteractions(candidate.id) : {};

  // Score all jobs against candidate
  const scoredJobs: JobRecommendation[] = jobs.map(job => {
    const explanation = calculateJobMatch(candidate, job);
    const jobInteractions = interactions[job.id] || [];
    return {
      job,
      explanation,
      isSaved: jobInteractions.includes('save'),
      isDismissed: jobInteractions.includes('dismiss'),
      hasExpressedInterest: jobInteractions.includes('express_interest')
    };
  });

  // Filter out dismissed jobs
  const activeJobs = scoredJobs.filter(item => !item.isDismissed);

  // 1. Recommended for You (Highest overall score, eligible)
  const recommendedForYou = [...activeJobs]
    .filter(item => item.explanation.meetsMandatoryRequirements)
    .sort((a, b) => b.explanation.overallScore - a.explanation.overallScore)
    .slice(0, 6);

  // 2. Jobs Based on Your Skills (Top skill matches)
  const skillsBasedJobs = [...activeJobs]
    .sort((a, b) => b.explanation.skillsMatchScore - a.explanation.skillsMatchScore)
    .slice(0, 6);

  // 3. New Matches (Published within 7 days, sorted by publication date & relevance)
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const newMatches = [...activeJobs]
    .filter(item => new Date(item.job.publishedAt).getTime() > oneWeekAgo)
    .sort((a, b) => new Date(b.job.publishedAt).getTime() - new Date(a.job.publishedAt).getTime())
    .slice(0, 6);

  // 4. Because You Saved This Job (Similar to saved jobs)
  const savedJobIds = Object.keys(interactions).filter(jobId => interactions[jobId].includes('save'));
  let becauseYouSaved: JobRecommendation[] = [];
  if (savedJobIds.length > 0) {
    const savedJobs = jobs.filter(j => savedJobIds.includes(j.id));
    becauseYouSaved = activeJobs
      .filter(item => !savedJobIds.includes(item.job.id))
      .map(item => {
        let maxSim = 0;
        savedJobs.forEach(sj => {
          const sim = calculateJobToJobSimilarity(sj, item.job);
          if (sim > maxSim) maxSim = sim;
        });
        return { item, similarity: maxSim };
      })
      .filter(x => x.similarity > 30)
      .sort((a, b) => b.similarity - a.similarity)
      .map(x => x.item)
      .slice(0, 6);
  }

  // 5. Explore Your Next Career Move (Transferable skills with career progression)
  const careerMoveJobs = activeJobs
    .filter(item => item.explanation.transferableHighlight || item.explanation.overallScore >= 60)
    .sort((a, b) => (b.explanation.transferableHighlight ? 1 : 0) - (a.explanation.transferableHighlight ? 1 : 0))
    .slice(0, 6);

  // 6. Recently Viewed Jobs
  const viewedIds = Object.keys(interactions).filter(jobId => interactions[jobId].includes('view'));
  const recentlyViewed = activeJobs.filter(item => viewedIds.includes(item.job.id)).slice(0, 6);

  return {
    recommendedForYou,
    similarJobs: recommendedForYou.slice(0, 4),
    skillsBasedJobs,
    moreLikeThis: becauseYouSaved.length > 0 ? becauseYouSaved : skillsBasedJobs.slice(0, 4),
    recentlyViewed,
    newMatches,
    becauseYouSaved,
    careerMoveJobs
  };
}

/**
 * Get similar jobs for a specific job detail page
 */
export function getSimilarJobsForJob(
  targetJob: JobOpening,
  allJobs: JobOpening[],
  candidate?: any,
  limitCount: number = 4
): JobRecommendation[] {
  return allJobs
    .filter(j => j.id !== targetJob.id && j.status === 'open')
    .map(job => {
      const similarity = calculateJobToJobSimilarity(targetJob, job);
      const explanation = candidate 
        ? calculateJobMatch(candidate, job)
        : {
            overallScore: similarity,
            skillsMatchScore: similarity,
            experienceMatchScore: 80,
            preferencesScore: 80,
            matchingSkills: job.requiredSkills.filter(s => targetJob.requiredSkills.includes(s)),
            missingSkills: [],
            meetsMandatoryRequirements: true,
            reasons: [{ category: 'role' as const, label: `Shares ${similarity}% similarity with ${targetJob.title}`, weight: similarity }],
            computedAt: new Date().toISOString()
          };

      return {
        job,
        explanation
      };
    })
    .sort((a, b) => b.explanation.overallScore - a.explanation.overallScore)
    .slice(0, limitCount);
}
