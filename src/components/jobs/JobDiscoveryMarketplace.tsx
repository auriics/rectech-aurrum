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
  X,
  RotateCcw,
  Sliders,
  DollarSign,
  GraduationCap
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
import { JobRecommendationSkeleton } from '../Skeletons';
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
  const [refreshing, setRefreshing] = useState(false);
  const [allJobs, setAllJobs] = useState<JobOpening[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationSectionData | null>(null);
  const [consent, setConsent] = useState<CandidatePersonalizationConsent | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

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
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [minSalary, setMinSalary] = useState<number>(0);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'recommended' | 'skills' | 'career' | 'saved' | 'new'>('all');

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedArrangement !== 'all') count++;
    if (selectedIndustry !== 'all') count++;
    if (selectedExperience !== 'all') count++;
    if (minMatchScore > 0) count++;
    if (minSalary > 0) count++;
    return count;
  }, [selectedArrangement, selectedIndustry, selectedExperience, minMatchScore, minSalary]);

  // Load jobs, recommendations, and analytics
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorState(null);

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
        // Analytics endpoint failure is non-blocking
      }

      if (isManualRefresh) {
        showSuccess('✓ Recommendation model recalibrated with latest candidate telemetry.');
      }
    } catch (err: any) {
      console.error('[JobDiscovery] Error loading data:', err);
      setErrorState('Unable to load matching jobs. Please verify network connectivity and retry.');
      showError('Failed to load personalized job recommendations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      showInfo('Please select an active candidate profile to save opportunities.');
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
      setAnalytics(prev => prev ? { ...prev, saves: prev.saves + 1, totalInteractions: prev.totalInteractions + 1 } : null);
    } catch (e) {
      showError('Failed to save job.');
    }
  };

  const handleDismissJob = async (jobId: string) => {
    if (!currentCandidate?.id) return;
    try {
      await recordCandidateInteraction(currentCandidate.id, jobId, 'dismiss');
      showInfo('Opportunity dismissed. Matching weights adjusted.');
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
      showInfo('Please select an active candidate profile to register interest.');
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
      showInfo('Personalization paused. Showing standard market opportunities.');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedArrangement('all');
    setSelectedIndustry('all');
    setSelectedExperience('all');
    setMinMatchScore(0);
    setMinSalary(0);
    setActiveSectionTab('all');
    showInfo('Filters reset to default view.');
  };

  // Extract unique industries from open jobs
  const availableIndustries = useMemo(() => {
    const set = new Set<string>();
    allJobs.forEach(j => { if (j.industry) set.add(j.industry); });
    return Array.from(set);
  }, [allJobs]);

  // Comprehensive filter predicate
  const filterListByCriteria = (list: JobRecommendation[]) => {
    return list.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.job.title.toLowerCase().includes(q) ||
        item.job.company.toLowerCase().includes(q) ||
        item.job.location.toLowerCase().includes(q) ||
        item.job.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
        (item.job.description && item.job.description.toLowerCase().includes(q));

      const matchesArrangement = selectedArrangement === 'all' || item.job.workArrangement === selectedArrangement;
      const matchesIndustry = selectedIndustry === 'all' || item.job.industry === selectedIndustry;
      const matchesExperience = selectedExperience === 'all' || item.job.experienceLevel.toLowerCase() === selectedExperience.toLowerCase();
      const matchesScore = minMatchScore === 0 || item.explanation.overallScore >= minMatchScore;
      const matchesSalary = minSalary === 0 || (!item.job.salaryMax || item.job.salaryMax >= minSalary);

      return matchesSearch && matchesArrangement && matchesIndustry && matchesExperience && matchesScore && matchesSalary;
    });
  };

  // Top match percentage computation
  const topMatchScore = useMemo(() => {
    if (!recommendations || recommendations.recommendedForYou.length === 0) return 0;
    return Math.round(recommendations.recommendedForYou[0].matchScore.totalScore);
  }, [recommendations]);

  // Total filtered matches across all active shelves
  const totalFilteredCount = useMemo(() => {
    if (!recommendations) return 0;
    const recs = filterListByCriteria(recommendations.recommendedForYou);
    const skills = filterListByCriteria(recommendations.skillsBasedJobs);
    const moves = filterListByCriteria(recommendations.careerMoveJobs);
    const set = new Set<string>();
    recs.forEach(r => set.add(r.job.id));
    skills.forEach(r => set.add(r.job.id));
    moves.forEach(r => set.add(r.job.id));
    return set.size;
  }, [recommendations, searchQuery, selectedArrangement, selectedIndustry, selectedExperience, minMatchScore, minSalary]);

  if (loading) {
    return <JobRecommendationSkeleton />;
  }

  if (errorState) {
    return (
      <div className="p-8 my-8 text-center bg-[var(--card-bg)] border border-rose-500/30 rounded-2xl max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">Matching Service Offline</h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{errorState}</p>
        <button
          onClick={() => loadData(true)}
          className="crm-btn-gold px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* Recruiter / Admin Candidate Switcher Toolbar */}
      {candidatesList.length > 0 && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#003E5A]/10 text-[#003E5A] dark:text-[#CBB285] dark:bg-[#BA9E6A]/20 flex items-center justify-center shrink-0">
              <UserCheck size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                Active Matching Profile
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)] truncate">
                {currentCandidate?.fullName || currentCandidate?.name || 'Open Marketplace Overview'}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <label htmlFor="candidate-select" className="text-xs font-semibold text-[var(--text-muted)] whitespace-nowrap hidden lg:inline">
              Candidate:
            </label>
            <select
              id="candidate-select"
              aria-label="Select candidate for recommendations"
              value={currentCandidate?.id || ''}
              onChange={(e) => {
                const found = candidatesList.find(c => c.id === e.target.value);
                if (found) setCurrentCandidate(found);
              }}
              className="w-full sm:w-64 md:w-72 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#BA9E6A] cursor-pointer min-h-[44px] sm:min-h-[38px]"
            >
              {candidatesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName || c.name || 'Unnamed'} {c.domainFocus ? `(${c.domainFocus})` : ''}
                </option>
              ))}
            </select>

            {currentCandidate && onNavigateToCandidate && (
              <button
                type="button"
                onClick={() => onNavigateToCandidate(currentCandidate.id)}
                className="crm-btn-secondary min-h-[44px] sm:min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer hover:border-[#BA9E6A] flex items-center justify-center gap-1 active:scale-95"
                title="Open Candidate Profile"
              >
                <span>Profile</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Discovery Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#003E5A] via-[#00334A] to-[#002233] p-5 sm:p-7 md:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BA9E6A]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BA9E6A]/20 border border-[#BA9E6A]/40 text-[#CBB285] text-xs font-black tracking-wide uppercase">
              <Sparkles size={14} /> AI Talent Marketplace
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Personalized Job Discovery & Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Continuous neural career matching aligning candidate skills, verified experience, and workplace preferences with open recruitment mandates.
            </p>
          </div>

          {/* Privacy & Recalculate Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAnalyticsBanner(prev => !prev)}
              aria-label="Toggle marketplace analytics signals"
              className={`min-h-[44px] sm:min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                showAnalyticsBanner
                  ? 'bg-[#BA9E6A] text-white border-[#BA9E6A]'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
              }`}
            >
              <BarChart2 size={15} />
              <span>{showAnalyticsBanner ? 'Hide Signals' : 'Signals'}</span>
            </button>

            {currentCandidate && (
              <button
                type="button"
                onClick={handleTogglePersonalization}
                aria-label="Toggle AI personalization"
                className={`min-h-[44px] sm:min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  consent?.personalizationEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/10 text-white/70 border-white/20'
                }`}
                title="Toggle AI Personalization & Matching History"
              >
                <ShieldCheck size={15} />
                <span>{consent?.personalizationEnabled ? 'Active' : 'Paused'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              aria-label="Recalculate recommendations"
              className="min-h-[44px] sm:min-h-[38px] crm-btn-gold px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer active:scale-95 disabled:opacity-60"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Recalibrating...' : 'Recalculate'}</span>
            </button>
          </div>
        </div>

        {/* Search & Quick Controls Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" size={16} />
            <input
              type="text"
              aria-label="Search job opportunities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role title, skill (e.g. React, Python), or company..."
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#BA9E6A] min-h-[44px] sm:min-h-[40px] transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Drawer / Panel Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(prev => !prev)}
              aria-label="Open filter preferences"
              className={`min-h-[44px] sm:min-h-[40px] px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial active:scale-95 ${
                activeFilterCount > 0
                  ? 'bg-[#BA9E6A] text-white border-[#BA9E6A]'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#003E5A] text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Reset Filters Icon if active */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                aria-label="Reset all filters"
                className="min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] rounded-xl bg-white/10 border border-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Work-Arrangement Chips Row */}
        <div className="relative z-10 mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-white/60 whitespace-nowrap mr-1 hidden sm:inline">
            Model:
          </span>
          {(['all', 'remote', 'hybrid', 'on-site'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSelectedArrangement(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer shrink-0 min-h-[36px] flex items-center ${
                selectedArrangement === mode
                  ? 'bg-[#BA9E6A] text-white shadow-xs'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {mode}
            </button>
          ))}
          {totalFilteredCount > 0 && (
            <span className="text-xs font-bold text-[#CBB285] ml-auto shrink-0 pl-2">
              {totalFilteredCount} eligible {totalFilteredCount === 1 ? 'mandate' : 'mandates'}
            </span>
          )}
        </div>
      </div>

      {/* Expandable / Drawer Filter Panel */}
      {isFilterDrawerOpen && (
        <div 
          className="p-5 sm:p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm space-y-5 animate-in slide-in-from-top duration-200"
          role="region"
          aria-label="Job discovery filter options"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[#BA9E6A]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Refine Opportunities</h3>
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[#BA9E6A] cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Job Category / Industry */}
            <div className="space-y-1.5">
              <label htmlFor="filter-industry" className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1">
                <Briefcase size={12} /> Industry Domain
              </label>
              <select
                id="filter-industry"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#BA9E6A] min-h-[40px]"
              >
                <option value="all">All Domains</option>
                {availableIndustries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* 2. Experience Level */}
            <div className="space-y-1.5">
              <label htmlFor="filter-experience" className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1">
                <GraduationCap size={12} /> Experience Level
              </label>
              <select
                id="filter-experience"
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#BA9E6A] min-h-[40px]"
              >
                <option value="all">All Seniority Levels</option>
                <option value="junior">Junior / Associate (0-2y)</option>
                <option value="mid">Mid-Level (3-5y)</option>
                <option value="senior">Senior (6-8y)</option>
                <option value="lead">Lead / Principal (8+y)</option>
              </select>
            </div>

            {/* 3. Minimum Match Score */}
            <div className="space-y-1.5">
              <label htmlFor="filter-min-score" className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1">
                <Sparkles size={12} /> Min Match Affinity
              </label>
              <select
                id="filter-min-score"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#BA9E6A] min-h-[40px]"
              >
                <option value={0}>Any Match Score</option>
                <option value={70}>70%+ Affinity</option>
                <option value={80}>80%+ High Affinity</option>
                <option value={90}>90%+ Exact Match</option>
              </select>
            </div>

            {/* 4. Minimum Salary Filter */}
            <div className="space-y-1.5">
              <label htmlFor="filter-min-salary" className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1">
                <DollarSign size={12} /> Min Compensation
              </label>
              <select
                id="filter-min-salary"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#BA9E6A] min-h-[40px]"
              >
                <option value={0}>Any Compensation</option>
                <option value={50000}>£50,000+</option>
                <option value={75000}>£75,000+</option>
                <option value={100000}>£100,000+</option>
                <option value={125000}>£125,000+</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="crm-btn-primary min-h-[40px] px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
            >
              Apply Filter Criteria ({totalFilteredCount} Results)
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Badges Ribbon */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
            Active Filters:
          </span>
          {selectedArrangement !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">
              Work: {selectedArrangement}
              <button onClick={() => setSelectedArrangement('all')} className="hover:text-rose-500"><X size={12} /></button>
            </span>
          )}
          {selectedIndustry !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">
              Industry: {selectedIndustry}
              <button onClick={() => setSelectedIndustry('all')} className="hover:text-rose-500"><X size={12} /></button>
            </span>
          )}
          {selectedExperience !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">
              Level: {selectedExperience}
              <button onClick={() => setSelectedExperience('all')} className="hover:text-rose-500"><X size={12} /></button>
            </span>
          )}
          {minMatchScore > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">
              Affinity: {minMatchScore}%+
              <button onClick={() => setMinMatchScore(0)} className="hover:text-rose-500"><X size={12} /></button>
            </span>
          )}
          {minSalary > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">
              Min: £{minSalary.toLocaleString()}
              <button onClick={() => setMinSalary(0)} className="hover:text-rose-500"><X size={12} /></button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-[#BA9E6A] hover:underline cursor-pointer ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Analytics KPI Ribbon (collapsible) */}
      {showAnalyticsBanner && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-xs animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Briefcase size={12} className="text-[#003E5A] dark:text-[#CBB285]" /> Total Mandates
            </div>
            <div className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              {allJobs.length}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Verified open roles</div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#BA9E6A]" /> Top Match
            </div>
            <div className="text-lg sm:text-xl font-black text-[#BA9E6A]">
              {topMatchScore}%
            </div>
            <div className="text-[11px] text-[var(--text-muted)] truncate">For {currentCandidate?.fullName || 'Candidate'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Bookmark size={12} className="text-indigo-500" /> Saved Pipeline
            </div>
            <div className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              {analytics?.saves || recommendations?.becauseYouSaved.length || 0}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Bookmarked jobs</div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Heart size={12} className="text-emerald-500" /> Mutual Interest
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
              {analytics?.expressionsOfInterest || 0}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Introductions logged</div>
          </div>
        </div>
      )}

      {/* Responsive Shelf Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Shelves', icon: Layers },
          { id: 'recommended', label: 'Recommended for You', icon: Sparkles },
          { id: 'skills', label: 'Based on Skills', icon: CheckCircle2 },
          { id: 'career', label: 'Career Moves', icon: TrendingUp },
          { id: 'saved', label: 'Saved Pipeline', icon: Bookmark },
          { id: 'new', label: 'New This Week', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSectionTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSectionTab(tab.id as any)}
              className={`min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
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
       recommendations && filterListByCriteria(recommendations.recommendedForYou).length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles size={18} className="text-[#BA9E6A] shrink-0" /> Recommended for You
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Top eligible opportunities based on mandatory qualifications and full profile affinity.
              </p>
            </div>
            <span className="text-xs font-bold text-[#BA9E6A] shrink-0 pl-2">
              {filterListByCriteria(recommendations.recommendedForYou).length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {filterListByCriteria(recommendations.recommendedForYou).map((rec) => (
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
       recommendations && filterListByCriteria(recommendations.skillsBasedJobs).length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Layers size={18} className="text-emerald-500 shrink-0" /> Jobs Based on Demonstrated Skills
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Direct alignment with your core technical tools and framework proficiencies.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 pl-2">
              {filterListByCriteria(recommendations.skillsBasedJobs).length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {filterListByCriteria(recommendations.skillsBasedJobs).map((rec) => (
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
       recommendations && filterListByCriteria(recommendations.careerMoveJobs).length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-500 shrink-0" /> Explore Your Next Career Move
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Adjacent roles where transferable competencies unlock high-impact promotion tracks.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-500 shrink-0 pl-2">
              {filterListByCriteria(recommendations.careerMoveJobs).length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {filterListByCriteria(recommendations.careerMoveJobs).map((rec) => (
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
       recommendations && filterListByCriteria(recommendations.becauseYouSaved).length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Bookmark size={18} className="text-[#BA9E6A] shrink-0" /> Because You Saved Jobs
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Opportunities closely related to your active bookmarks and saved selections.
              </p>
            </div>
            <span className="text-xs font-bold text-[#BA9E6A] shrink-0 pl-2">
              {filterListByCriteria(recommendations.becauseYouSaved).length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {filterListByCriteria(recommendations.becauseYouSaved).map((rec) => (
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
       recommendations && filterListByCriteria(recommendations.newMatches).length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <Clock size={18} className="text-sky-500 shrink-0" /> New Opportunities This Week
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Newly published mandates added to the Aurrum Talent Marketplace.
              </p>
            </div>
            <span className="text-xs font-bold text-sky-500 shrink-0 pl-2">
              {filterListByCriteria(recommendations.newMatches).length} matches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {filterListByCriteria(recommendations.newMatches).map((rec) => (
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
      {recommendations && totalFilteredCount === 0 && (
        <div className="text-center py-12 sm:py-16 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#BA9E6A]/20 text-[#BA9E6A] mx-auto flex items-center justify-center">
            <Search size={22} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            No matching opportunities found
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            No active mandates match your current search and filter criteria. Adjust your filters or reset to discover all available openings.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="crm-btn-gold min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw size={14} />
              <span>Reset All Filters</span>
            </button>
          </div>
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
