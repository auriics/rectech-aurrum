import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Send, 
  Info, 
  TrendingUp, 
  DollarSign, 
  Layers,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { JobRecommendation } from '../../types/jobRecommendations';

interface JobRecommendationCardProps {
  recommendation: JobRecommendation;
  onViewJob: (recommendation: JobRecommendation) => void;
  onSaveJob: (jobId: string) => void;
  onDismissJob: (jobId: string) => void;
  onExpressInterest: (jobId: string) => void;
}

export const JobRecommendationCard: React.FC<JobRecommendationCardProps> = ({
  recommendation,
  onViewJob,
  onSaveJob,
  onDismissJob,
  onExpressInterest,
}) => {
  const { job, explanation, isSaved, hasExpressedInterest } = recommendation;
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  // Score badge coloring conforming to Aurrum brand system
  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    if (score >= 70) return 'bg-[#BA9E6A]/15 text-[#8A6E3F] dark:text-[#CBB285] border-[#BA9E6A]/40';
    return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30';
  };

  return (
    <article 
      className="crm-card relative flex flex-col justify-between group hover:border-[#BA9E6A] transition-all duration-200 p-4 sm:p-5 shadow-xs w-full overflow-hidden"
      aria-label={`${job.title} at ${job.company}`}
    >
      {/* Top Header: Industry, Arrangement & Score */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] truncate max-w-[130px] sm:max-w-[160px]">
              {job.industry}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 whitespace-nowrap">
              {job.workArrangement}
            </span>
          </div>

          {/* Right controls: Match Badge + Dismiss */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Match Score Badge with ARIA */}
            <button
              type="button"
              onClick={() => setShowMatchDetails(!showMatchDetails)}
              aria-label={`Match score ${explanation.overallScore} percent. Click to toggle breakdown`}
              aria-expanded={showMatchDetails}
              className={`min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1 cursor-pointer transition-transform active:scale-95 hover:scale-105 ${getScoreBadgeClass(explanation.overallScore)}`}
              title="Click to view AI match breakdown"
            >
              <Sparkles size={13} className="shrink-0" />
              <span>{explanation.overallScore}%</span>
              {showMatchDetails ? <ChevronUp size={12} className="shrink-0" /> : <ChevronDown size={12} className="shrink-0" />}
            </button>

            {/* Dismiss Button with comfortable touch target */}
            <button
              type="button"
              onClick={() => onDismissJob(job.id)}
              aria-label={`Dismiss recommendation for ${job.title}`}
              className="min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors cursor-pointer"
              title="Dismiss recommendation"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Job Title & Company */}
        <div>
          <h3 
            onClick={() => onViewJob(recommendation)}
            className="text-sm sm:text-base font-bold text-[var(--text-primary)] hover:text-[#BA9E6A] transition-colors cursor-pointer line-clamp-2 leading-snug break-words"
            title={job.title}
          >
            {job.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1.5 flex-wrap">
            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[140px] sm:max-w-[200px]">
              {job.company}
            </span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="flex items-center gap-1 text-[var(--text-muted)] truncate max-w-[140px] sm:max-w-[180px]">
              <MapPin size={12} className="shrink-0" /> {job.location}
            </span>
          </div>
        </div>

        {/* Salary & Experience row */}
        <div className="flex items-center gap-3 text-xs font-medium text-[var(--text-muted)] pb-2.5 border-b border-[var(--border-subtle)] flex-wrap">
          {job.salaryMin && job.salaryMax ? (
            <span className="flex items-center gap-1 text-[#003E5A] dark:text-[#CBB285] font-bold">
              <DollarSign size={13} className="shrink-0" />
              £{job.salaryMin.toLocaleString()} - £{job.salaryMax.toLocaleString()}
            </span>
          ) : (
            <span className="font-semibold text-[var(--text-secondary)]">Competitive Salary</span>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="shrink-0" /> {job.minExperienceYears}+ yrs exp
          </span>
        </div>

        {/* Explainability Highlight Pill */}
        {explanation.reasons.length > 0 && (
          <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] flex items-start gap-2">
            <Sparkles size={13} className="text-[#BA9E6A] shrink-0 mt-0.5" />
            <span className="leading-snug break-words">{explanation.reasons[0].label}</span>
          </div>
        )}

        {/* Transferable Skills Banner if available */}
        {explanation.transferableHighlight && (
          <div className="p-2 rounded-xl bg-[#BA9E6A]/10 border border-[#BA9E6A]/20 text-[10px] text-[#8A6E3F] dark:text-[#CBB285] flex items-center gap-1.5 font-semibold">
            <TrendingUp size={12} className="shrink-0" />
            <span className="break-words">{explanation.transferableHighlight}</span>
          </div>
        )}

        {/* Required Skills Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {job.requiredSkills.slice(0, 4).map((skill, idx) => {
            const isMatch = explanation.matchingSkills.includes(skill);
            return (
              <span 
                key={idx}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border truncate max-w-[120px] ${
                  isMatch 
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold' 
                    : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border-color)]'
                }`}
              >
                {isMatch ? `✓ ${skill}` : skill}
              </span>
            );
          })}
          {job.requiredSkills.length > 4 && (
            <span className="text-[10px] text-[var(--text-muted)] font-medium">
              +{job.requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Action Footer: Touch-optimized >= 44px */}
      <div className="pt-3.5 mt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
        {/* Bookmark Button */}
        <button
          type="button"
          onClick={() => onSaveJob(job.id)}
          aria-label={isSaved ? `Job ${job.title} saved` : `Save job ${job.title}`}
          className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            isSaved 
              ? 'bg-[#BA9E6A]/15 text-[#BA9E6A] border-[#BA9E6A]' 
              : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[#BA9E6A] hover:border-[#BA9E6A]'
          }`}
          title={isSaved ? 'Job Saved' : 'Save Job for Later'}
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>

        {/* Main Actions Container */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-[200px]">
          {/* Express Interest */}
          <button
            type="button"
            onClick={() => onExpressInterest(job.id)}
            disabled={hasExpressedInterest}
            aria-label={hasExpressedInterest ? "Mutual interest registered" : `Express interest in ${job.title}`}
            className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial active:scale-95 ${
              hasExpressedInterest
                ? 'bg-emerald-600 text-white opacity-90 cursor-default'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[#BA9E6A] border border-[var(--border-color)] hover:text-[#BA9E6A]'
            }`}
          >
            {hasExpressedInterest ? (
              <>
                <CheckCircle2 size={14} className="shrink-0" />
                <span className="whitespace-nowrap">Interested</span>
              </>
            ) : (
              <>
                <Send size={14} className="shrink-0" />
                <span className="whitespace-nowrap">Interest</span>
              </>
            )}
          </button>

          {/* View Job Details */}
          <button
            type="button"
            onClick={() => onViewJob(recommendation)}
            aria-label={`View full details for ${job.title}`}
            className="min-h-[44px] crm-btn-primary px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs flex-1 sm:flex-initial cursor-pointer active:scale-95"
          >
            <span className="whitespace-nowrap">View</span>
            <ArrowRight size={14} className="shrink-0" />
          </button>
        </div>
      </div>

      {/* Expandable Match Breakdown Drawer */}
      {showMatchDetails && (
        <div 
          className="mt-3 pt-3 border-t border-[var(--border-color)] text-xs space-y-2.5 animate-in fade-in duration-200"
          role="region"
          aria-label="Detailed match breakdown"
        >
          <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
            <span className="flex items-center gap-1.5 text-xs">
              <Sparkles size={13} className="text-[#BA9E6A]" /> Match Breakdown
            </span>
            <button 
              type="button"
              onClick={() => setShowMatchDetails(false)} 
              aria-label="Close match breakdown"
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={13} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <p className="text-[var(--text-muted)]">Skills</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                {explanation.skillsMatchScore}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <p className="text-[var(--text-muted)]">Experience</p>
              <p className="font-bold text-[#003E5A] dark:text-[#CBB285] text-xs sm:text-sm">
                {explanation.experienceMatchScore}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <p className="text-[var(--text-muted)]">Preferences</p>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
                {explanation.preferencesScore}%
              </p>
            </div>
          </div>

          {explanation.missingSkills.length > 0 && (
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              <strong className="text-[var(--text-secondary)]">Skills to grow:</strong> {explanation.missingSkills.slice(0, 3).join(', ')}
            </p>
          )}
        </div>
      )}
    </article>
  );
};
