import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Layers, 
  Bookmark, 
  TrendingUp, 
  Clock, 
  Flame, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { 
  JobOpening, 
  JobRecommendation, 
  RecommendationSectionData,
  CandidatePersonalizationConsent 
} from '../../types/jobRecommendations';
import { 
  getMarketplaceJobs, 
  generatePersonalizedRecommendations, 
  getSimilarJobsForJob, 
  recordCandidateInteraction, 
  getCandidateConsent, 
  updateCandidateConsent 
} from '../../services/jobDiscoveryService';
import { JobRecommendationCard } from './JobRecommendationCard';
import { JobDetailsModal } from './JobDetailsModal';
import { useToast } from '../../contexts/ToastContext';

interface JobDiscoveryMarketplaceProps {
  candidate: any;
  onNavigateToCandidate?: (id: string) => void;
}

export const JobDiscoveryMarketplace: React.FC<JobDiscoveryMarketplaceProps> = ({
  candidate,
  onNavigateToCandidate
}) => {
  const { showSuccess, showInfo, showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [allJobs, setAllJobs] = useState<JobOpening[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationSectionData | null>(null);
  const [consent, setConsent] = useState<CandidatePersonalizationConsent | null>(null);
  
  // Active selected job for detail modal
  const [selectedRec, setSelectedRec] = useState<JobRecommendation | null>(null);
  const [similarJobs, setSimilarJobs] = useState<JobRecommendation[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArrangement, setSelectedArrangement] = useState<'all' | 'remote' | 'hybrid' | 'on-site'>('all');
  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'recommended' | 'skills' | 'saved' | 'career'>('all');

  // Load jobs and recommendations
  const loadData = async () => {
    setLoading(true);
    try {
      const jobs = await getMarketplaceJobs();
      setAllJobs(jobs);

      if (candidate?.id) {
        const consentData = await getCandidateConsent(candidate.id);
        setConsent(consentData);
      }

      const recData = await generatePersonalizedRecommendations(candidate, jobs);
      setRecommendations(recData);
    } catch (err) {
      console.error('[JobDiscovery] Error loading data:', err);
      showError('Failed to load personalized job recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [candidate?.id]);

  // Open detail modal and calculate similar jobs
  const handleViewJob = (rec: JobRecommendation) => {
    setSelectedRec(rec);
    if (candidate?.id) {
      recordCandidateInteraction(candidate.id, rec.job.id, 'view');
    }
    const similar = getSimilarJobsForJob(rec.job, allJobs, candidate);
    setSimilarJobs(similar);
  };

  // Actions
  const handleSaveJob = async (jobId: string) => {
    if (!candidate?.id) return;
    try {
      await recordCandidateInteraction(candidate.id, jobId, 'save');
      showSuccess('✓ Job saved to your personal career tracker!');
      // Update local state
      setRecommendations(prev => {
        if (!prev) return null;
        const updateList = (list: JobRecommendation[]) =>
          list.map(item => item.job.id === jobId ? { ...item, isSaved: !item.isSaved } : item);
        return {
          ...prev,
          recommendedForYou: updateList(prev.recommendedForYou),
          skillsBasedJobs: updateList(prev.skillsBasedJobs),
          newMatches: updateList(prev.newMatches),
          careerMoveJobs: updateList(prev.careerMoveJobs),
          recentlyViewed: updateList(prev.recentlyViewed)
        };
      });
    } catch (e) {
      showError('Failed to save job.');
    }
  };

  const handleDismissJob = async (jobId: string) => {
    if (!candidate?.id) return;
    try {
      await recordCandidateInteraction(candidate.id, jobId, 'dismiss');
      showInfo('Job dismissed. Your recommendation model will adapt.');
      // Remove from view
      setRecommendations(prev => {
        if (!prev) return null;
        const filterList = (list: JobRecommendation[]) => list.filter(item => item.job.id !== jobId);
        return {
          ...prev,
          recommendedForYou: filterList(prev.recommendedForYou),
          skillsBasedJobs: filterList(prev.skillsBasedJobs),
          newMatches: filterList(prev.newMatches),
          careerMoveJobs: filterList(prev.careerMoveJobs),
          recentlyViewed: filterList(prev.recentlyViewed),
          becauseYouSaved: filterList(prev.becauseYouSaved)
        };
      });
      if (selectedRec?.job.id === jobId) setSelectedRec(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExpressInterest = async (jobId: string) => {
    if (!candidate?.id) return;
    try {
      await recordCandidateInteraction(candidate.id, jobId, 'express_interest');
      showSuccess('✓ Mutual Interest Recorded! Aurrum matching team notified.');
      setRecommendations(prev => {
        if (!prev) return null;
        const updateList = (list: JobRecommendation[]) =>
          list.map(item => item.job.id === jobId ? { ...item, hasExpressedInterest: true } : item);
        return {
          ...prev,
          recommendedForYou: updateList(prev.recommendedForYou),
          skillsBasedJobs: updateList(prev.skillsBasedJobs),
          newMatches: updateList(prev.newMatches),
          careerMoveJobs: updateList(prev.careerMoveJobs)
        };
      });
      if (selectedRec && selectedRec.job.id === jobId) {
        setSelectedRec(prev => prev ? { ...prev, hasExpressedInterest: true } : null);
      }
    } catch (e) {
      showError('Failed to record expression of interest.');
    }
  };

  // Toggle personalization consent
  const handleTogglePersonalization = async () => {
    if (!candidate?.id || !consent) return;
    const nextState = !consent.personalizationEnabled;
    await updateCandidateConsent(candidate.id, { personalizationEnabled: nextState });
    setConsent(prev => prev ? { ...prev, personalizationEnabled: nextState } : null);
    if (nextState) {
      showSuccess('✓ Personalized AI job discovery enabled.');
    } else {
      showInfo('Personalization paused. Showing standard market opportunities.');
    }
  };

  // Filter recommendations based on search term
  const filterListBySearch = (list: JobRecommendation[]) => {
    return list.filter(item => {
      const matchesSearch = !searchQuery || 
        item.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesArrangement = selectedArrangement === 'all' || item.job.workArrangement === selectedArrangement;
      return matchesSearch && matchesArrangement;
    });
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <RefreshCw size={32} className="animate-spin text-[#BA9E6A]" />
        <p className="text-sm font-bold text-[var(--text-secondary)]">
          Analyzing skills, qualifications & matching job catalogue...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      {/* Hero Discovery Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#003E5A] via-[#00334A] to-[#002233] p-8 text-white shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BA9E6A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BA9E6A]/20 border border-[#BA9E6A]/40 text-[#CBB285] text-xs font-black tracking-wide uppercase">
              <Sparkles size={14} /> AI Talent Marketplace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Personalized Job Discovery & Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Continuous neural career matching aligning your demonstrated skills, verified experience, and workplace preferences with open recruitment mandates.
            </p>
          </div>

          {/* Privacy & Recalculate Widget */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleTogglePersonalization}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                consent?.personalizationEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/10 text-white/70 border-white/20'
              }`}
              title="Toggle AI Personalization & Matching History"
            >
              <ShieldCheck size={16} />
              <span>Personalization: {consent?.personalizationEnabled ? 'Active' : 'Paused'}</span>
            </button>

            <button
              onClick={loadData}
              className="crm-btn-gold px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Recalculate Matches</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role title, technology (e.g. React, Python), or company..."
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#BA9E6A] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(['all', 'remote', 'hybrid', 'on-site'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedArrangement(mode)}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  selectedArrangement === mode
                    ? 'bg-[#BA9E6A] text-white shadow-xs'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 1: Recommended for You (Highest Relevance & Eligible) */}
      {recommendations && recommendations.recommendedForYou.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles size={18} className="text-[#BA9E6A]" /> Recommended for You
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Top eligible opportunities based on mandatory qualifications and full profile affinity.
              </p>
            </div>
            <span className="text-xs font-bold text-[#BA9E6A]">
              {filterListBySearch(recommendations.recommendedForYou).length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filterListBySearch(recommendations.recommendedForYou).map((rec) => (
              <JobRecommendationCard
                key={rec.job.id}
                recommendation={rec}
                onViewJob={handleViewJob}
                onSaveJob={handleSaveJob}
                onDismissJob={handleDismissJob}
                onExpressInterest={handleExpressInterest}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: Jobs Based on Your Skills */}
      {recommendations && recommendations.skillsBasedJobs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Layers size={18} className="text-emerald-500" /> Jobs Based on Your Demonstrated Skills
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Direct alignment with your core technical tools and framework proficiencies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filterListBySearch(recommendations.skillsBasedJobs).map((rec) => (
              <JobRecommendationCard
                key={rec.job.id}
                recommendation={rec}
                onViewJob={handleViewJob}
                onSaveJob={handleSaveJob}
                onDismissJob={handleDismissJob}
                onExpressInterest={handleExpressInterest}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Explore Your Next Career Move (Transferable Skills) */}
      {recommendations && recommendations.careerMoveJobs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-500" /> Explore Your Next Career Move
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Adjacent roles where your transferable competencies unlock high-impact promotion tracks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filterListBySearch(recommendations.careerMoveJobs).map((rec) => (
              <JobRecommendationCard
                key={rec.job.id}
                recommendation={rec}
                onViewJob={handleViewJob}
                onSaveJob={handleSaveJob}
                onDismissJob={handleDismissJob}
                onExpressInterest={handleExpressInterest}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: Because You Saved This Job */}
      {recommendations && recommendations.becauseYouSaved.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Bookmark size={18} className="text-[#BA9E6A]" /> Because You Saved Jobs
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Opportunities closely related to your active bookmarks and saved selections.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filterListBySearch(recommendations.becauseYouSaved).map((rec) => (
              <JobRecommendationCard
                key={rec.job.id}
                recommendation={rec}
                onViewJob={handleViewJob}
                onSaveJob={handleSaveJob}
                onDismissJob={handleDismissJob}
                onExpressInterest={handleExpressInterest}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: Recently Viewed / New Matches */}
      {recommendations && recommendations.newMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Clock size={18} className="text-sky-500" /> New Opportunities This Week
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Newly published mandates added to the Aurrum Talent Marketplace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filterListBySearch(recommendations.newMatches).map((rec) => (
              <JobRecommendationCard
                key={rec.job.id}
                recommendation={rec}
                onViewJob={handleViewJob}
                onSaveJob={handleSaveJob}
                onDismissJob={handleDismissJob}
                onExpressInterest={handleExpressInterest}
              />
            ))}
          </div>
        </section>
      )}

      {/* Job Details Modal with Similar Jobs */}
      <JobDetailsModal
        isOpen={Boolean(selectedRec)}
        recommendation={selectedRec}
        similarJobs={similarJobs}
        onClose={() => setSelectedRec(null)}
        onSaveJob={handleSaveJob}
        onDismissJob={handleDismissJob}
        onExpressInterest={handleExpressInterest}
        onSelectSimilarJob={(simRec) => handleViewJob(simRec)}
      />
    </div>
  );
};
