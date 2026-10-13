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
  Clock
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

  // Score badge coloring
  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (score >= 70) return 'bg-[#BA9E6A]/15 text-[#8A6E3F] dark:text-[#CBB285] border-[#BA9E6A]/30';
    return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
  };

  return (
    <div className="crm-card relative flex flex-col justify-between group hover:border-[#BA9E6A] transition-all duration-300 p-5 shadow-xs">
      {/* Top Header: Company, Arrangement & Score */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
              {job.industry}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {job.workArrangement}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Match Score Badge */}
            <div 
              className={`px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${getScoreBadgeClass(explanation.overallScore)}`}
              onClick={() => setShowMatchDetails(!showMatchDetails)}
              title="Click to view AI match breakdown"
            >
              <Sparkles size={12} />
              <span>{explanation.overallScore}% Match</span>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismissJob(job.id)}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Dismiss recommendation"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Job Title & Company */}
        <h3 
          onClick={() => onViewJob(recommendation)}
          className="text-base font-bold text-[var(--text-primary)] hover:text-[#BA9E6A] transition-colors cursor-pointer line-clamp-1 mb-1"
        >
          {job.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-3">
          <span className="font-semibold">{job.company}</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[var(--text-muted)]">
            <MapPin size={12} /> {job.location}
          </span>
        </div>

        {/* Salary & Experience row */}
        <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)] mb-3 pb-3 border-b border-[var(--border-subtle)]">
          {job.salaryMin && job.salaryMax ? (
            <span className="flex items-center gap-1 text-[#003E5A] dark:text-[#CBB285] font-bold">
              <DollarSign size={13} />
              £{job.salaryMin.toLocaleString()} - £{job.salaryMax.toLocaleString()}
            </span>
          ) : (
            <span>Competitive Salary</span>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {job.minExperienceYears}+ yrs exp
          </span>
        </div>

        {/* Explainability Highlight Pill */}
        {explanation.reasons.length > 0 && (
          <div className="mb-3 p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] flex items-start gap-2">
            <Sparkles size={13} className="text-[#BA9E6A] shrink-0 mt-0.5" />
            <span className="leading-snug">{explanation.reasons[0].label}</span>
          </div>
        )}

        {/* Transferable Skills Banner if available */}
        {explanation.transferableHighlight && (
          <div className="mb-3 p-2 rounded-xl bg-[#BA9E6A]/10 border border-[#BA9E6A]/20 text-[10px] text-[#8A6E3F] dark:text-[#CBB285] flex items-center gap-1.5 font-semibold">
            <TrendingUp size={12} className="shrink-0" />
            <span>{explanation.transferableHighlight}</span>
          </div>
        )}

        {/* Required Skills Chips */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {job.requiredSkills.slice(0, 4).map((skill, idx) => {
            const isMatch = explanation.matchingSkills.includes(skill);
            return (
              <span 
                key={idx}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
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
            <span className="text-[9px] text-[var(--text-muted)] font-medium">
              +{job.requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSaveJob(job.id)}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isSaved 
              ? 'bg-[#BA9E6A]/15 text-[#BA9E6A] border-[#BA9E6A]' 
              : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[#BA9E6A] hover:border-[#BA9E6A]'
          }`}
          title={isSaved ? 'Job Saved' : 'Save Job for Later'}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            type="button"
            onClick={() => onExpressInterest(job.id)}
            disabled={hasExpressedInterest}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              hasExpressedInterest
                ? 'bg-emerald-600 text-white opacity-80 cursor-default'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[#BA9E6A] border border-[var(--border-color)] hover:text-[#BA9E6A]'
            }`}
          >
            {hasExpressedInterest ? (
              <>
                <CheckCircle2 size={13} />
                <span>Interested</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Express Interest</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onViewJob(recommendation)}
            className="crm-btn-primary px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <span>View Job</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Expandable Match Breakdown Drawer */}
      {showMatchDetails && (
        <div className="mt-4 pt-3 border-t border-[var(--border-color)] text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
            <span className="flex items-center gap-1"><Sparkles size={13} className="text-[#BA9E6A]" /> Match Breakdown</span>
            <button onClick={() => setShowMatchDetails(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={12} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <p className="text-[var(--text-muted)]">Skills</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">{explanation.skillsMatchScore}%</p>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <p className="text-[var(--text-muted)]">Experience</p>
              <p className="font-bold text-[#003E5A] dark:text-[#CBB285]">{explanation.experienceMatchScore}%</p>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <p className="text-[var(--text-muted)]">Preferences</p>
              <p className="font-bold text-indigo-600 dark:text-indigo-400">{explanation.preferencesScore}%</p>
            </div>
          </div>
          {explanation.missingSkills.length > 0 && (
            <p className="text-[10px] text-[var(--text-muted)]">
              <strong>Skills to grow:</strong> {explanation.missingSkills.slice(0, 3).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
