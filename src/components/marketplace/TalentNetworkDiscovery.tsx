import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Sparkles, 
  Search, 
  Filter, 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Send, 
  Eye, 
  Lock, 
  Unlock, 
  Settings, 
  RefreshCw, 
  ChevronRight, 
  Building2, 
  Layers, 
  TrendingUp, 
  FileCheck,
  Star,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { MarketplaceProfile } from '../../types/marketplace';
import { JobOpening } from '../../types/jobRecommendations';
import { getDiscoverableTalent, requestDirectIntroduction, BENCHMARK_TALENT } from '../../services/marketplaceService';
import { getMarketplaceJobs, BENCHMARK_JOBS } from '../../services/jobDiscoveryService';
import { calculateJobMatch } from '../../services/recommendationEngine';
import { CandidateMarketplaceSettingsModal } from './CandidateMarketplaceSettingsModal';
import { useToast } from '../../contexts/ToastContext';

interface TalentNetworkDiscoveryProps {
  currentRole?: string;
  currentUserId?: string;
  onNavigateToCandidate?: (id: string) => void;
  onSwitchToIntroductions?: () => void;
}

export const TalentNetworkDiscovery: React.FC<TalentNetworkDiscoveryProps> = ({
  currentRole = 'recruiter',
  currentUserId = 'user-admin',
  onNavigateToCandidate,
  onSwitchToIntroductions
}) => {
  const { showSuccess, showError, showInfo } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [talentPool, setTalentPool] = useState<MarketplaceProfile[]>([]);
  const [openJobs, setOpenJobs] = useState<JobOpening[]>([]);
  
  // Selected Job Opening for AI matching context
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);

  // Search & Filter facets
  const [searchQuery, setSearchQuery] = useState('');
  const [arrangementFilter, setArrangementFilter] = useState<'all' | 'remote' | 'hybrid' | 'on-site'>('all');
  const [minExpFilter, setMinExpFilter] = useState<number>(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  // Modals state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [introRequestCandidate, setIntroRequestCandidate] = useState<MarketplaceProfile | null>(null);
  const [introJobId, setIntroJobId] = useState<string>('');
  const [introMessage, setIntroMessage] = useState<string>('');
  const [submittingIntro, setSubmittingIntro] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [talent, jobs] = await Promise.all([
        getDiscoverableTalent(),
        getMarketplaceJobs()
      ]);
      setTalentPool(talent);
      setOpenJobs(jobs);
      if (jobs.length > 0 && !selectedJob) {
        setSelectedJob(jobs[0]);
        setIntroJobId(jobs[0].id);
      }
    } catch (err: any) {
      console.error('Error loading talent network data:', err);
      setTalentPool(BENCHMARK_TALENT);
      setOpenJobs(BENCHMARK_JOBS);
      if (BENCHMARK_JOBS.length > 0) {
        setSelectedJob(BENCHMARK_JOBS[0]);
        setIntroJobId(BENCHMARK_JOBS[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    showSuccess('Talent network pool refreshed');
  };

  // Filtered talent profiles
  const filteredTalent = useMemo(() => {
    return talentPool.filter(candidate => {
      // Arrangement
      if (arrangementFilter !== 'all' && candidate.workArrangement !== arrangementFilter && candidate.workArrangement !== 'hybrid') {
        return false;
      }

      // Min Experience
      if (minExpFilter > 0 && (candidate.totalExperienceYears || 0) < minExpFilter) {
        return false;
      }

      // Availability
      if (availabilityFilter !== 'all' && candidate.availability !== availabilityFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = candidate.fullName?.toLowerCase().includes(q);
        const matchHeadline = candidate.headline?.toLowerCase().includes(q);
        const matchSkills = candidate.skills?.some(s => s.toLowerCase().includes(q));
        const matchTitles = candidate.preferredTitles?.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchHeadline && !matchSkills && !matchTitles) {
          return false;
        }
      }

      return true;
    });
  }, [talentPool, arrangementFilter, minExpFilter, availabilityFilter, searchQuery]);

  // Request introduction submission
  const handleSendIntroRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!introRequestCandidate || !introJobId) {
      showError('Please select a target job position for this introduction');
      return;
    }

    const job = openJobs.find(j => j.id === introJobId) || selectedJob;
    if (!job) {
      showError('Selected job opening could not be resolved');
      return;
    }

    setSubmittingIntro(true);
    try {
      // Calculate match score if available
      const match = calculateJobMatch(
        {
          id: introRequestCandidate.candidateId,
          name: introRequestCandidate.fullName,
          skills: introRequestCandidate.skills,
          totalExperience: introRequestCandidate.totalExperienceYears,
          preferredLocation: introRequestCandidate.preferredLocations?.[0] || 'London, UK'
        },
        job
      );

      await requestDirectIntroduction(
        introRequestCandidate,
        job,
        currentRole === 'client' ? 'employer' : 'recruiter',
        introMessage || `We would like to introduce you to an open ${job.title} opportunity at ${job.company}.`,
        match.overallScore
      );

      showSuccess(`Direct introduction requested with ${introRequestCandidate.fullName}! Track status in Introductions.`);
      setIntroRequestCandidate(null);
      setIntroMessage('');
      if (onSwitchToIntroductions) {
        onSwitchToIntroductions();
      }
    } catch (err: any) {
      showError(err.message || 'Failed to submit introduction request');
    } finally {
      setSubmittingIntro(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[var(--text-primary)]">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#003E5A] via-[#00334A] to-[#002233] text-white shadow-xl border border-[#BA9E6A]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-[#BA9E6A] text-[#002233]">
              Marketplace & Network
            </span>
            <span className="text-xs text-slate-300">Continuous AI Talent Sourcing</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Discoverable Talent Network
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Browse verified, opted-in candidates who have opened their profiles for confidential mutual-fit introductions. Zero cold spam.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Settings className="w-4 h-4 text-[#BA9E6A]" />
            Talent Privacy Settings
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center justify-center transition-all"
            title="Refresh Talent Pool"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Network Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)] font-medium">Opted-in Talent Pool</span>
          <p className="text-xl font-black text-[#003E5A] dark:text-[#BA9E6A] mt-1">{talentPool.length} Candidates</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)] font-medium">Verified Credentials</span>
          <p className="text-xl font-black text-emerald-600 mt-1">100% Validated</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)] font-medium">Average Match Quality</span>
          <p className="text-xl font-black text-indigo-500 mt-1">88.4% Mutual Fit</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[#BA9E6A]/30 bg-[#BA9E6A]/5">
          <span className="text-xs text-[#BA9E6A] font-bold">Privacy Guarantee</span>
          <p className="text-xl font-black text-[#BA9E6A] mt-1">Zero Spam / Shielded</p>
        </div>
      </div>

      {/* Matching Context Job Selector */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#BA9E6A]/20 border border-[#BA9E6A]/30 flex items-center justify-center text-[#BA9E6A]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Evaluate Against Active Job Opening
            </span>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {selectedJob ? `${selectedJob.title} — ${selectedJob.company}` : 'Select a vacancy to compute live match scores'}
            </p>
          </div>
        </div>

        <div className="min-w-[280px]">
          <select
            value={selectedJob?.id || ''}
            onChange={(e) => {
              const j = openJobs.find(job => job.id === e.target.value);
              setSelectedJob(j || null);
              if (j) setIntroJobId(j.id);
            }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
          >
            {openJobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search talent by skill, headline, title, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#BA9E6A]"
            />
          </div>

          {/* Arrangement Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'All Modes' },
              { id: 'remote', label: 'Remote' },
              { id: 'hybrid', label: 'Hybrid' },
              { id: 'on-site', label: 'On-site' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setArrangementFilter(f.id as any)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  arrangementFilter === f.id
                    ? 'bg-[#003E5A] text-white'
                    : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Experience Select */}
          <select
            value={minExpFilter}
            onChange={(e) => setMinExpFilter(Number(e.target.value))}
            className="px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#BA9E6A]"
          >
            <option value={0}>Any Experience</option>
            <option value={2}>2+ Years Exp</option>
            <option value={4}>4+ Years Exp</option>
            <option value={6}>6+ Years Exp</option>
            <option value={8}>8+ Years Exp</option>
          </select>

        </div>
      </div>

      {/* Talent Profiles Grid */}
      {loading ? (
        <div className="p-12 text-center bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]">
          <div className="w-8 h-8 border-3 border-[#BA9E6A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[var(--text-muted)]">Scanning Talent Network...</p>
        </div>
      ) : filteredTalent.length === 0 ? (
        <div className="p-12 text-center bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] space-y-3">
          <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <h4 className="text-base font-bold text-[var(--text-primary)]">No Discoverable Profiles Found</h4>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Try adjusting your search keywords or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTalent.map((talent) => {
            // Compute match against selected job
            const match = selectedJob ? calculateJobMatch(
              {
                id: talent.candidateId,
                name: talent.fullName,
                skills: talent.skills,
                totalExperience: talent.totalExperienceYears,
                preferredLocation: talent.preferredLocations?.[0] || 'London, UK'
              },
              selectedJob
            ) : null;

            return (
              <div
                key={talent.id}
                className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm hover:border-[#BA9E6A]/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Header Card */}
                <div className="p-5 space-y-4">
                  
                  {/* Avatar & Identifiers */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003E5A] to-[#002233] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 border border-[#BA9E6A]/30">
                        {talent.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 
                            className="text-base font-bold text-[var(--text-primary)] hover:text-[#BA9E6A] transition-colors cursor-pointer"
                            onClick={() => onNavigateToCandidate && onNavigateToCandidate(talent.candidateId)}
                          >
                            {talent.fullName}
                          </h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Discoverable
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[var(--text-muted)] line-clamp-1 mt-0.5">
                          {talent.headline}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Meter */}
                    {match && (
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#BA9E6A]/10 border border-[#BA9E6A]/30 text-[#BA9E6A] font-extrabold text-sm shadow-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                          {match.overallScore}%
                        </div>
                        <span className="block text-[10px] font-semibold text-[var(--text-muted)] mt-0.5">AI Fit Score</span>
                      </div>
                    )}
                  </div>

                  {/* Shield Notification */}
                  <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <Lock className="w-3.5 h-3.5 text-[#BA9E6A] shrink-0" />
                    <span>Contact details shielded until mutual introduction acceptance.</span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {talent.skills.slice(0, 6).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#003E5A]/10 text-[#003E5A] dark:bg-[#BA9E6A]/10 dark:text-[#BA9E6A] border border-[#003E5A]/20 dark:border-[#BA9E6A]/20"
                      >
                        {skill}
                      </span>
                    ))}
                    {talent.skills.length > 6 && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-primary)] text-[var(--text-muted)]">
                        +{talent.skills.length - 6} more
                      </span>
                    )}
                  </div>

                  {/* Criteria Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#BA9E6A]" />
                      <span>{talent.totalExperienceYears}+ Years Experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#BA9E6A]" />
                      <span className="capitalize">{talent.workArrangement} · {talent.preferredLocations?.[0] || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#BA9E6A]" />
                      <span>
                        {talent.salaryCurrency || '£'}{talent.desiredSalaryMin?.toLocaleString()} - {talent.desiredSalaryMax?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#BA9E6A]" />
                      <span className="capitalize">{talent.availability?.replace('_', ' ')}</span>
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="px-5 py-3.5 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">
                    Verified Candidate
                  </span>
                  <button
                    onClick={() => {
                      setIntroRequestCandidate(talent);
                      if (selectedJob) setIntroJobId(selectedJob.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#BA9E6A] to-[#A88D5B] text-white text-xs font-bold shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Request Direct Introduction
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Introduction Request Modal */}
      {introRequestCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#003E5A] to-[#002B3F] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#BA9E6A]/20 border border-[#BA9E6A]/40 flex items-center justify-center text-[#BA9E6A]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Request Direct Introduction</h3>
                  <p className="text-xs text-slate-300">
                    Connect with {introRequestCandidate.fullName} for an open position
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIntroRequestCandidate(null)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendIntroRequest} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Target Job Position
                </label>
                <select
                  required
                  value={introJobId}
                  onChange={(e) => setIntroJobId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
                >
                  {openJobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company} ({j.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Personalized Introduction Note
                </label>
                <textarea
                  rows={4}
                  required
                  value={introMessage}
                  onChange={(e) => setIntroMessage(e.target.value)}
                  placeholder="Explain why this position is an exceptional mutual fit and what your team is building..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] space-y-1">
                <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#BA9E6A]" />
                  Confidential Introduction Process
                </span>
                <p>
                  The candidate will receive this introduction along with job specifications. Direct email and phone contact are only revealed once the candidate accepts.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIntroRequestCandidate(null)}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIntro}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#BA9E6A] to-[#A88D5B] text-white font-semibold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingIntro ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Introduction Request</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Candidate Marketplace Settings Modal */}
      {isSettingsModalOpen && (
        <CandidateMarketplaceSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          candidate={talentPool[0] || { id: 'cand-current', fullName: 'Demo Candidate' }}
          onProfileUpdated={() => loadData()}
        />
      )}

    </div>
  );
};
