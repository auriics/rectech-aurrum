import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Layers, 
  Bookmark, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight,
  Briefcase,
  AlertCircle,
  User,
  UserCheck,
  BarChart2,
  Heart,
  Eye,
  SlidersHorizontal,
  X
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
  candidate?: any;
  candidatesList?: any[];
  onNavigateToCandidate?: (id: string) => void;
}

export const JobDiscoveryMarketplace: React.FC<JobDiscoveryMarketplaceProps> = ({
  candidate,
  candidatesList = [],
  onNavigateToCandidate
}) => {
  const { showSuccess, showInfo, showError } = useToast();
  
  // Active candidate selection
  const [currentCandidate, setCurrentCandidate] = useState<any>(
    candidate || (candidatesList && candidatesList.length > 0 ? candidatesList[0] : null)
  );

  useEffect(() => {
    if (candidate) {
      setCurrentCandidate(candidate);
    } else if (candidatesList && candidatesList.length > 0 && !currentCandidate) {
      setCurrentCandidate(candidatesList[0]);
    }
  }, [candidate, candidatesList]);

  const [loading, setLoading] = useState(true);
  const [allJobs, setAllJobs] = useState<JobOpening[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationSectionData | null>(null);
  const [consent, setConsent] = useState<CandidatePersonalizationConsent | null>(null);
  
  // Analytics state
  const [analytics, setAnalytics] = useState<{
    totalInteractions: number;
    views: number;
    saves: number;
    dismissals: number;
    expressionsOfInterest: number;
  } | null>(null);
  const [showAnalyticsBanner, setShowAnalyticsBanner] = useState(false);

  // Active selected job for detail modal
  const [selectedRec, setSelectedRec] = useState<JobRecommendation | null>(null);
  const [similarJobs, setSimilarJobs] = useState<JobRecommendation[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArrangement, setSelectedArrangement] = useState<'all' | 'remote' | 'hybrid' | 'on-site'>('all');
  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'recommended' | 'skills' | 'career' | 'saved' | 'new'>('all');

  // Load jobs, recommendations, and analytics
  const loadData = async () => {
    setLoading(true);
    try {
      const jobs = await getMarketplaceJobs();
      setAllJobs(jobs);

      if (currentCandidate?.id) {
        const consentData = await getCandidateConsent(currentCandidate.id);
        setConsent(consentData);
      } else {
        setConsent(null);
      }

      const recData = await generatePersonalizedRecommendations(currentCandidate, jobs);
      setRecommendations(recData);

      // Fetch background analytics
      try {
        const res = await fetch('/api/marketplace/analytics');
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.metrics) {
            setAnalytics(data.metrics);
          }
        }
      } catch (err) {
        // Analytics endpoint non-critical fallback
      }
    } catch (err) {
      console.error('[JobDiscovery] Error loading data:', err);
      showError('Failed to load personalized job recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCandidate?.id]);

  // Open detail modal and calculate similar jobs
  const handleViewJob = (rec: JobRecommendation) => {
    setSelectedRec(rec);
    if (currentCandidate?.id) {
      recordCandidateInteraction(currentCandidate.id, rec.job.id, 'view');
    }
    const similar = getSimilarJobsForJob(rec.job, allJobs, currentCandidate);
    setSimilarJobs(similar);
  };

  // Actions
  const handleSaveJob = async (jobId: string) => {
    if (!currentCandidate?.id) {
      showInfo('Please select a candidate profile to save opportunities.');
      return;
    }
    try {
      await recordCandidateInteraction(currentCandidate.id, jobId, 'save');
      showSuccess('✓ Opportunity saved to candidate career tracker!');
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
      // Increment save count in analytics locally
      setAnalytics(prev => prev ? { ...prev, saves: prev.saves + 1, totalInteractions: prev.totalInteractions + 1 } : null);
    } catch (e) {
      showError('Failed to save job.');
    }
  };

  const handleDismissJob = async (jobId: string) => {
    if (!currentCandidate?.id) return;
    try {
      await recordCandidateInteraction(currentCandidate.id, jobId, 'dismiss');
      showInfo('Opportunity dismissed. Matching model adjusted.');
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
      setAnalytics(prev => prev ? { ...prev, dismissals: prev.dismissals + 1, totalInteractions: prev.totalInteractions + 1 } : null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExpressInterest = async (jobId: string) => {
    if (!currentCandidate?.id) {
      showInfo('Please select a candidate profile to register mutual interest.');
      return;
    }
    try {
      await recordCandidateInteraction(currentCandidate.id, jobId, 'express_interest');
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
      setAnalytics(prev => prev ? { ...prev, expressionsOfInterest: prev.expressionsOfInterest + 1, totalInteractions: prev.totalInteractions + 1 } : null);
    } catch (e) {
      showError('Failed to record expression of interest.');
    }
  };

  // Toggle personalization consent
  const handleTogglePersonalization = async () => {
    if (!currentCandidate?.id || !consent) {
      showInfo('Personalization toggle requires an active candidate record.');
      return;
    }
    const nextState = !consent.personalizationEnabled;
    await updateCandidateConsent(currentCandidate.id, { personalizationEnabled: nextState });
    setConsent(prev => prev ? { ...prev, personalizationEnabled: nextState } : null);
    if (nextState) {
      showSuccess('✓ Personalized AI job discovery enabled.');
    } else {
      showInfo('Personalization paused. Standard marketplace view active.');
    }
  };

  // Filter recommendations based on search query & arrangement
  const filterListBySearch = (list: JobRecommendation[]) => {
    return list.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.job.title.toLowerCase().includes(q) ||
        item.job.company.toLowerCase().includes(q) ||
        item.job.location.toLowerCase().includes(q) ||
        item.job.requiredSkills.some(s => s.toLowerCase().includes(q));
      
      const matchesArrangement = selectedArrangement === 'all' || item.job.workArrangement === selectedArrangement;
      return matchesSearch && matchesArrangement;
    });
  };

  // Top match percentage computation for candidate
  const topMatchScore = useMemo(() => {
    if (!recommendations || recommendations.recommendedForYou.length === 0) return 0;
    return Math.round(recommendations.recommendedForYou[0].matchScore.totalScore);
  }, [recommendations]);

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
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Recruiter / Admin Candidate Switcher Toolbar */}
      {candidatesList.length > 0 && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#003E5A]/10 text-[#003E5A] dark:text-[#CBB285] dark:bg-[#BA9E6A]/20 flex items-center justify-center shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                Active Matching Profile
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {currentCandidate?.fullName || currentCandidate?.name || 'All Open Marketplace Jobs'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label htmlFor="candidate-select" className="text-xs font-semibold text-[var(--text-muted)] whitespace-nowrap hidden sm:inline">
              Switch Candidate:
            </label>
            <select
              id="candidate-select"
              value={currentCandidate?.id || ''}
              onChange={(e) => {
                const found = candidatesList.find(c => c.id === e.target.value);
                if (found) setCurrentCandidate(found);
              }}
              className="w-full md:w-72 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#BA9E6A] cursor-pointer"
            >
              {candidatesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName || c.name || 'Unnamed'} {c.domainFocus ? `(${c.domainFocus})` : ''}
                </option>
              ))}
            </select>

            {currentCandidate && onNavigateToCandidate && (
              <button
                onClick={() => onNavigateToCandidate(currentCandidate.id)}
                className="crm-btn-secondary px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer hover:border-[#BA9E6A]"
                title="Open Candidate Profile in Modal"
              >
                View Profile
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Discovery Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#003E5A] via-[#00334A] to-[#002233] p-6 sm:p-8 text-white shadow-xl border border-white/10">
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
              Continuous neural career matching aligning candidate skills, verified experience, and workplace preferences with open recruitment mandates.
            </p>
          </div>

          {/* Privacy & Recalculate Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAnalyticsBanner(prev => !prev)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                showAnalyticsBanner
                  ? 'bg-[#BA9E6A] text-white border-[#BA9E6A]'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
              }`}
            >
              <BarChart2 size={15} />
              <span>{showAnalyticsBanner ? 'Hide Signals' : 'Marketplace Signals'}</span>
            </button>

            {currentCandidate && (
              <button
                onClick={handleTogglePersonalization}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  consent?.personalizationEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/10 text-white/70 border-white/20'
                }`}
                title="Toggle AI Personalization & Matching History"
              >
                <ShieldCheck size={15} />
                <span>Personalization: {consent?.personalizationEnabled ? 'Active' : 'Paused'}</span>
              </button>
            )}

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

      {/* Analytics KPI Ribbon (collapsible or active) */}
      {showAnalyticsBanner && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-xs animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Briefcase size={12} className="text-[#003E5A] dark:text-[#CBB285]" /> Total Mandates
            </div>
            <div className="text-xl font-black text-[var(--text-primary)]">
              {allJobs.length}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Verified open roles</div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#BA9E6A]" /> Top Match Score
            </div>
            <div className="text-xl font-black text-[#BA9E6A]">
              {topMatchScore}%
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">For {currentCandidate?.fullName || 'Candidate'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Bookmark size={12} className="text-indigo-500" /> Saved Pipeline
            </div>
            <div className="text-xl font-black text-[var(--text-primary)]">
              {analytics?.saves || recommendations?.becauseYouSaved.length || 0}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Candidate career bookmarks</div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Heart size={12} className="text-emerald-500" /> Mutual Introductions
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {analytics?.expressionsOfInterest || 0}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Expressions of interest</div>
          </div>
        </div>
      )}

      {/* Shelf Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Shelves', icon: Layers },
          { id: 'recommended', label: 'Recommended for You', icon: Sparkles },
          { id: 'skills', label: 'Based on Skills', icon: CheckCircle2 },
          { id: 'career', label: 'Career Moves', icon: TrendingUp },
          { id: 'saved', label: 'Saved Jobs', icon: Bookmark },
          { id: 'new', label: 'New This Week', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSectionTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSectionTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#003E5A] text-white shadow-xs dark:bg-[#BA9E6A]'
                  : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[#BA9E6A]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#BA9E6A] dark:text-[#003E5A]' : 'text-[var(--text-muted)]'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Recommended for You (Highest Relevance & Eligible) */}
      {(activeSectionTab === 'all' || activeSectionTab === 'recommended') && 
       recommendations && recommendations.recommendedForYou.length > 0 && (
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
      {(activeSectionTab === 'all' || activeSectionTab === 'skills') && 
       recommendations && recommendations.skillsBasedJobs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Layers size={18} className="text-emerald-500" /> Jobs Based on Demonstrated Skills
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Direct alignment with your core technical tools and framework proficiencies.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {filterListBySearch(recommendations.skillsBasedJobs).length} matches
            </span>
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
      {(activeSectionTab === 'all' || activeSectionTab === 'career') && 
       recommendations && recommendations.careerMoveJobs.length > 0 && (
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
            <span className="text-xs font-bold text-indigo-500">
              {filterListBySearch(recommendations.careerMoveJobs).length} matches
            </span>
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
      {(activeSectionTab === 'all' || activeSectionTab === 'saved') && 
       recommendations && recommendations.becauseYouSaved.length > 0 && (
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
            <span className="text-xs font-bold text-[#BA9E6A]">
              {filterListBySearch(recommendations.becauseYouSaved).length} matches
            </span>
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
      {(activeSectionTab === 'all' || activeSectionTab === 'new') && 
       recommendations && recommendations.newMatches.length > 0 && (
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
            <span className="text-xs font-bold text-sky-500">
              {filterListBySearch(recommendations.newMatches).length} matches
            </span>
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

      {/* Empty State when search or filter yields no results */}
      {recommendations && 
       filterListBySearch(recommendations.recommendedForYou).length === 0 &&
       filterListBySearch(recommendations.skillsBasedJobs).length === 0 &&
       filterListBySearch(recommendations.careerMoveJobs).length === 0 && (
        <div className="text-center py-16 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#BA9E6A]/20 text-[#BA9E6A] mx-auto flex items-center justify-center">
            <Search size={22} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            No matching opportunities found
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Try adjusting your search criteria, switching work arrangements, or clearing search filters.
          </p>
          {(searchQuery || selectedArrangement !== 'all' || activeSectionTab !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedArrangement('all');
                setActiveSectionTab('all');
              }}
              className="crm-btn-secondary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
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
