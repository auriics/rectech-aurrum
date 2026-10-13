import React from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Share2
} from 'lucide-react';
import { JobRecommendation } from '../../types/jobRecommendations';
import { JobRecommendationCard } from './JobRecommendationCard';

interface JobDetailsModalProps {
  recommendation: JobRecommendation | null;
  similarJobs: JobRecommendation[];
  isOpen: boolean;
  onClose: () => void;
  onSaveJob: (jobId: string) => void;
  onDismissJob: (jobId: string) => void;
  onExpressInterest: (jobId: string) => void;
  onSelectSimilarJob: (rec: JobRecommendation) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  recommendation,
  similarJobs,
  isOpen,
  onClose,
  onSaveJob,
  onDismissJob,
  onExpressInterest,
  onSelectSimilarJob
}) => {
  if (!isOpen || !recommendation) return null;

  const { job, explanation, isSaved, hasExpressedInterest } = recommendation;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-[var(--border-color)] flex items-start justify-between gap-4 bg-[var(--bg-primary)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[var(--brand-color)] text-white">
                {job.industry}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {job.workArrangement}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                {job.employmentType}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-tight">
              {job.title}
            </h2>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-secondary)] flex-wrap">
              <span className="font-bold flex items-center gap-1.5">
                <Building2 size={16} className="text-[#BA9E6A]" /> {job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[var(--text-muted)]">
                <MapPin size={16} /> {job.location}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveJob(job.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSaved 
                  ? 'bg-[#BA9E6A]/20 text-[#BA9E6A] border-[#BA9E6A]' 
                  : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[#BA9E6A]'
              }`}
              title={isSaved ? 'Job Saved' : 'Save Job'}
            >
              {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          {/* AI Match Overview Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#003E5A]/10 to-[#BA9E6A]/15 border border-[#BA9E6A]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#BA9E6A]" />
                <span className="text-sm font-extrabold text-[var(--text-primary)]">
                  Why you're matched: <span className="text-[#BA9E6A] font-black">{explanation.overallScore}% Relevance Score</span>
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Calculated securely from your verified technical profile, career domain, and location preferences.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-3 py-1.5 bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] shadow-xs">
                <p className="text-[10px] text-[var(--text-muted)] font-medium">Skills</p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{explanation.skillsMatchScore}%</p>
              </div>
              <div className="text-center px-3 py-1.5 bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] shadow-xs">
                <p className="text-[10px] text-[var(--text-muted)] font-medium">Experience</p>
                <p className="text-sm font-black text-[#003E5A] dark:text-[#CBB285]">{explanation.experienceMatchScore}%</p>
              </div>
              <div className="text-center px-3 py-1.5 bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] shadow-xs">
                <p className="text-[10px] text-[var(--text-muted)] font-medium">Preferences</p>
                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{explanation.preferencesScore}%</p>
              </div>
            </div>
          </div>

          {/* Key Opportunity Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Compensation</span>
              <p className="text-base font-extrabold text-[var(--text-primary)] mt-1">
                {job.salaryMin && job.salaryMax ? `£${job.salaryMin.toLocaleString()} - £${job.salaryMax.toLocaleString()}` : 'Market Competitive'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Experience Requirement</span>
              <p className="text-base font-extrabold text-[var(--text-primary)] mt-1">
                {job.minExperienceYears}+ Years ({job.experienceLevel} level)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Work Model</span>
              <p className="text-base font-extrabold text-[var(--text-primary)] mt-1 capitalize">
                {job.workArrangement} ({job.location})
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Role Overview</h3>
            <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
              {job.description}
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Skills & Technologies</h3>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--text-secondary)]">Required Technologies:</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, idx) => {
                  const hasSkill = explanation.matchingSkills.includes(skill);
                  return (
                    <span 
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                        hasSkill 
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' 
                          : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'
                      }`}
                    >
                      {hasSkill ? <CheckCircle2 size={13} className="text-emerald-600" /> : <AlertCircle size={13} className="text-slate-400" />}
                      <span>{skill}</span>
                    </span>
                  );
                })}
              </div>

              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] pt-2">Preferred Additional Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((ps, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
                        {ps}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 4: Similar Jobs You May Like (Mandatory Requirement) */}
          {similarJobs.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Layers size={18} className="text-[#BA9E6A]" /> Similar Jobs You May Like
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Opportunities related by shared skill sets, seniority, and department.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarJobs.slice(0, 4).map((simRec) => (
                  <JobRecommendationCard
                    key={simRec.job.id}
                    recommendation={simRec}
                    onViewJob={onSelectSimilarJob}
                    onSaveJob={onSaveJob}
                    onDismissJob={onDismissJob}
                    onExpressInterest={onExpressInterest}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <ShieldCheck size={16} className="text-[#BA9E6A]" />
            <span>GDPR-Protected: Your CV is never shared without your explicit consent.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="crm-btn-secondary px-5 py-2.5 text-xs font-bold rounded-xl"
            >
              Close
            </button>

            <button
              onClick={() => onExpressInterest(job.id)}
              disabled={hasExpressedInterest}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                hasExpressedInterest 
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'crm-btn-gold text-white'
              }`}
            >
              {hasExpressedInterest ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Interest Recorded</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Express Interest in Opportunity</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
