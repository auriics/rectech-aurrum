import React, { useEffect } from 'react';
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
  ShieldCheck,
  Layers,
  ArrowRight
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
  // Support Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !recommendation) return null;

  const { job, explanation, isSaved, hasExpressedInterest } = recommendation;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-details-modal-title"
    >
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-20 p-4 sm:p-6 md:p-8 border-b border-[var(--border-color)] flex items-start justify-between gap-4 bg-[var(--bg-primary)]/95 backdrop-blur-md">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#003E5A] text-white">
                {job.industry}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {job.workArrangement}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                {job.employmentType}
              </span>
            </div>

            <h2 
              id="job-details-modal-title" 
              className="text-lg sm:text-2xl font-black text-[var(--text-primary)] leading-tight break-words"
            >
              {job.title}
            </h2>

            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--text-secondary)] flex-wrap">
              <span className="font-bold flex items-center gap-1 text-[var(--text-primary)]">
                <Building2 size={15} className="text-[#BA9E6A] shrink-0" /> {job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[var(--text-muted)]">
                <MapPin size={15} className="shrink-0" /> {job.location}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Bookmark button */}
            <button
              type="button"
              onClick={() => onSaveJob(job.id)}
              aria-label={isSaved ? `Job ${job.title} saved` : `Save job ${job.title}`}
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isSaved 
                  ? 'bg-[#BA9E6A]/20 text-[#BA9E6A] border-[#BA9E6A]' 
                  : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[#BA9E6A]'
              }`}
              title={isSaved ? 'Job Saved' : 'Save Job'}
            >
              {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>

            {/* Close button with >= 44px target */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close job details modal"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 sm:space-y-8 flex-1 custom-scrollbar">
          {/* AI Match Overview Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#003E5A]/10 to-[#BA9E6A]/15 border border-[#BA9E6A]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#BA9E6A] shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                  Why you're matched: <span className="text-[#BA9E6A] font-black">{explanation.overallScore}% Relevance Score</span>
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Calculated securely from verified skills, career domain, and location preferences.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full md:w-auto shrink-0">
              <div className="text-center px-3 py-2 bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] shadow-xs">
                <p className="text-[10px] text-[var(--text-muted)] font-medium">Skills</p>
                <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">{explanation.skillsMatchScore}%</p>
              </div>
              <div className="text-center px-3 py-2 bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] shadow-xs">
                <p className="text-[10px] text-[var(--text-muted)] font-medium">Experience</p>
                <p className="text-xs sm:text-sm font-black text-[#003E5A] dark:text-[#CBB285]">{explanation.experienceMatchScore}%</p>
              </div>
              <div className="text-center px-3 py-2 bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] shadow-xs">
                <p className="text-[10px] text-[var(--text-muted)] font-medium">Preferences</p>
                <p className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">{explanation.preferencesScore}%</p>
              </div>
            </div>
          </div>

          {/* Key Opportunity Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Compensation</span>
              <p className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] mt-1">
                {job.salaryMin && job.salaryMax ? `£${job.salaryMin.toLocaleString()} - £${job.salaryMax.toLocaleString()}` : 'Market Competitive'}
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Experience Requirement</span>
              <p className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] mt-1">
                {job.minExperienceYears}+ Years ({job.experienceLevel} level)
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Work Model</span>
              <p className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] mt-1 capitalize">
                {job.workArrangement} ({job.location})
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Role Overview</h3>
            <div className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
              {job.description}
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Skills & Technologies</h3>
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
                      {hasSkill ? <CheckCircle2 size={13} className="text-emerald-600 shrink-0" /> : <AlertCircle size={13} className="text-slate-400 shrink-0" />}
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

          {/* Section: Similar Jobs You May Like (Responsive Shelf) */}
          {similarJobs.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-[var(--border-color)]">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Layers size={18} className="text-[#BA9E6A] shrink-0" /> Similar Jobs You May Like
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Opportunities related by shared skill sets, seniority, and department.
                </p>
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

        {/* Modal Action Footer: Responsive & Touch-Ready */}
        <div className="sticky bottom-0 z-20 p-4 sm:p-6 bg-[var(--bg-primary)]/95 backdrop-blur-md border-t border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <ShieldCheck size={16} className="text-[#BA9E6A] shrink-0" />
            <span className="leading-snug">Privacy Protected: CV is never shared without your consent.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="crm-btn-secondary min-h-[44px] px-5 py-2.5 text-xs font-bold rounded-xl flex-1 sm:flex-initial cursor-pointer active:scale-95"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => onExpressInterest(job.id)}
              disabled={hasExpressedInterest}
              className={`min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md flex-1 sm:flex-initial cursor-pointer active:scale-95 ${
                hasExpressedInterest 
                  ? 'bg-emerald-600 text-white cursor-default opacity-90' 
                  : 'crm-btn-gold text-white'
              }`}
            >
              {hasExpressedInterest ? (
                <>
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span className="whitespace-nowrap">Interest Recorded</span>
                </>
              ) : (
                <>
                  <Send size={16} className="shrink-0" />
                  <span className="whitespace-nowrap">Express Interest</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
