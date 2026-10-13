import { JobOpening, JobMatchExplanation, RecommendationReason } from '../types/jobRecommendations';

interface CandidateProfileLike {
  id?: string;
  fullName?: string;
  domain?: string;
  domainFocus?: string;
  summary?: string;
  skills?: string[];
  totalExperienceYears?: number;
  experience?: Array<{ title?: string; company?: string; duration?: string; description?: string }>;
  city?: string;
  state?: string;
  country?: string;
  preferredLocation?: string;
  preferredWorkArrangement?: string;
  preferredRole?: string;
  expectedSalary?: number;
}

// Weights for Content-Based Matching
const WEIGHTS = {
  SKILLS: 0.45,
  EXPERIENCE: 0.25,
  ROLE_TITLE: 0.15,
  LOCATION_ARRANGEMENT: 0.15,
};

// Normalize text for comparison
const normalize = (str: string = '') => str.toLowerCase().trim();

/**
 * Check if candidate meets mandatory job requirements
 */
export function verifyMandatoryEligibility(candidate: CandidateProfileLike, job: JobOpening): boolean {
  if (job.status !== 'open') return false;

  // Check mandatory minimum years of experience (if specified and candidate experience known)
  if (job.minExperienceYears > 0 && typeof candidate.totalExperienceYears === 'number') {
    if (candidate.totalExperienceYears < job.minExperienceYears * 0.7) {
      // Below 70% of absolute required years is considered ineligible for mandatory threshold
      return false;
    }
  }

  // Check mandatory qualifications keyword match in summary or experience
  if (job.mandatoryQualifications && job.mandatoryQualifications.length > 0) {
    const candidateCorpus = [
      candidate.summary || '',
      ...(candidate.skills || []),
      JSON.stringify(candidate.experience || [])
    ].join(' ').toLowerCase();

    for (const qual of job.mandatoryQualifications) {
      if (!candidateCorpus.includes(qual.toLowerCase())) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Computes explainable match score and details between candidate and job opening
 */
export function calculateJobMatch(
  candidate: CandidateProfileLike, 
  job: JobOpening
): JobMatchExplanation {
  const candidateSkills = (candidate.skills || []).map(normalize);
  const requiredSkills = (job.requiredSkills || []).map(normalize);
  const preferredSkills = (job.preferredSkills || []).map(normalize);

  // 1. Skill Analysis
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  job.requiredSkills.forEach((reqSkill) => {
    const norm = normalize(reqSkill);
    const hasSkill = candidateSkills.some(cs => cs.includes(norm) || norm.includes(cs));
    if (hasSkill) {
      matchingSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const preferredMatches = job.preferredSkills?.filter(ps => 
    candidateSkills.some(cs => cs.includes(normalize(ps)) || normalize(ps).includes(cs))
  ) || [];

  const requiredScore = requiredSkills.length > 0 ? (matchingSkills.length / requiredSkills.length) * 100 : 80;
  const preferredBonus = preferredSkills.length > 0 ? (preferredMatches.length / preferredSkills.length) * 15 : 0;
  const skillsScore = Math.min(100, Math.round(requiredScore + preferredBonus));

  // 2. Experience Level Analysis
  const candidateYears = Number(candidate.totalExperienceYears || 0);
  let expScore = 70;
  if (job.minExperienceYears > 0) {
    if (candidateYears >= job.minExperienceYears) {
      expScore = 100;
    } else {
      const ratio = candidateYears / job.minExperienceYears;
      expScore = Math.max(20, Math.round(ratio * 90));
    }
  }

  // 3. Role / Industry Alignment
  const candRole = normalize(candidate.domainFocus || candidate.domain || candidate.preferredRole || '');
  const jobTitleNorm = normalize(job.title);
  const jobIndustryNorm = normalize(job.industry);

  let roleScore = 50;
  if (candRole && (jobTitleNorm.includes(candRole) || candRole.includes(jobTitleNorm))) {
    roleScore = 100;
  } else if (candRole && jobIndustryNorm.includes(candRole)) {
    roleScore = 80;
  }

  // 4. Location & Work Arrangement
  let locationScore = 60;
  const candCity = normalize(candidate.city || '');
  const candCountry = normalize(candidate.country || '');
  const candArrangement = normalize(candidate.preferredWorkArrangement || '');

  if (job.workArrangement === 'remote') {
    locationScore = 100;
  } else if (candArrangement === job.workArrangement) {
    locationScore = 90;
  } else if (candCity && normalize(job.location).includes(candCity)) {
    locationScore = 95;
  } else if (candCountry && normalize(job.location).includes(candCountry)) {
    locationScore = 80;
  }

  // 5. Overall Weighted Score
  const overall = Math.round(
    skillsScore * WEIGHTS.SKILLS +
    expScore * WEIGHTS.EXPERIENCE +
    roleScore * WEIGHTS.ROLE_TITLE +
    locationScore * WEIGHTS.LOCATION_ARRANGEMENT
  );

  // 6. Generate Human-Readable Reasons
  const reasons: RecommendationReason[] = [];

  if (matchingSkills.length > 0) {
    reasons.push({
      category: 'skills',
      label: `Matches ${matchingSkills.length} key skill${matchingSkills.length > 1 ? 's' : ''} (${matchingSkills.slice(0, 3).join(', ')})`,
      weight: skillsScore
    });
  }

  if (candidateYears >= job.minExperienceYears) {
    reasons.push({
      category: 'experience',
      label: `${candidateYears}+ years meets or exceeds role requirement (${job.minExperienceYears} yrs)`,
      weight: expScore
    });
  }

  if (job.workArrangement === 'remote' || candCity && normalize(job.location).includes(candCity)) {
    reasons.push({
      category: 'location',
      label: job.workArrangement === 'remote' ? '100% Remote Opportunity' : `Location matches (${job.location})`,
      weight: locationScore
    });
  }

  if (roleScore >= 80) {
    reasons.push({
      category: 'role',
      label: `Strong industry fit with your background in ${candidate.domain || 'your domain'}`,
      weight: roleScore
    });
  }

  // Transferable skills highlight for career progression
  let transferableHighlight: string | undefined;
  if (roleScore < 80 && matchingSkills.length >= 2) {
    transferableHighlight = `Great career expansion role leveraging your core expertise in ${matchingSkills.slice(0, 2).join(' and ')}.`;
  }

  const meetsMandatory = verifyMandatoryEligibility(candidate, job);

  return {
    overallScore: Math.min(99, Math.max(10, overall)),
    skillsMatchScore: skillsScore,
    experienceMatchScore: expScore,
    preferencesScore: locationScore,
    matchingSkills,
    missingSkills,
    meetsMandatoryRequirements: meetsMandatory,
    reasons,
    transferableHighlight,
    computedAt: new Date().toISOString()
  };
}

/**
 * Calculates similarity between two job descriptions for "Similar Jobs"
 */
export function calculateJobToJobSimilarity(jobA: JobOpening, jobB: JobOpening): number {
  if (jobA.id === jobB.id) return 0;
  if (jobB.status !== 'open') return 0;

  let score = 0;

  // Title similarity
  if (normalize(jobA.title) === normalize(jobB.title)) score += 35;
  else if (normalize(jobA.title).includes(normalize(jobB.title)) || normalize(jobB.title).includes(normalize(jobA.title))) score += 20;

  // Industry overlap
  if (normalize(jobA.industry) === normalize(jobB.industry)) score += 20;

  // Skill overlap
  const skillsA = (jobA.requiredSkills || []).map(normalize);
  const skillsB = (jobB.requiredSkills || []).map(normalize);
  const commonSkills = skillsA.filter(s => skillsB.includes(s));
  if (skillsA.length > 0) {
    score += Math.round((commonSkills.length / Math.max(skillsA.length, skillsB.length)) * 30);
  }

  // Work arrangement
  if (jobA.workArrangement === jobB.workArrangement) score += 15;

  return Math.min(100, score);
}
