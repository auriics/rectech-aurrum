import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown,
  Building2, 
  Briefcase, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowRight,
  TrendingUp,
  Receipt,
  FileCheck
} from 'lucide-react';
import { DirectIntroduction, IntroductionStatus } from '../../types/marketplace';
import { getDirectIntroductions, updateIntroductionStatus } from '../../services/marketplaceService';
import { HiringAttributionModal } from './HiringAttributionModal';
import { useToast } from '../../contexts/ToastContext';

interface DirectIntroductionsManagerProps {
  currentRole?: string;
  currentUserId?: string;
  onNavigateToCandidate?: (candidateId: string) => void;
}

export const DirectIntroductionsManager: React.FC<DirectIntroductionsManagerProps> = ({
  currentRole = 'recruiter',
  currentUserId = 'user-admin',
  onNavigateToCandidate
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [introductions, setIntroductions] = useState<DirectIntroduction[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIntroId, setExpandedIntroId] = useState<string | null>(null);

  // Hiring attribution modal state
  const [hireModalIntro, setHireModalIntro] = useState<DirectIntroduction | null>(null);

  useEffect(() => {
    loadIntroductions();
  }, [currentRole, currentUserId]);

  const loadIntroductions = async () => {
    setLoading(true);
    try {
      const data = await getDirectIntroductions();
      setIntroductions(data);
    } catch (err: any) {
      console.error('Error loading introductions:', err);
      showError('Failed to load direct introductions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIntroductions();
    setRefreshing(false);
    showSuccess('Direct introductions refreshed');
  };

  const handleStatusChange = async (
    introId: string, 
    newStatus: IntroductionStatus, 
    actionName: string, 
    reason?: string
  ) => {
    try {
      const updated = await updateIntroductionStatus(
        introId,
        newStatus,
        currentUserId,
        currentRole === 'client' ? 'Client / Hiring Manager' : 'Recruitment Consultant',
        reason || `Status updated via Direct Introduction Manager: ${actionName}`
      );

      setIntroductions(prev => prev.map(item => item.id === introId ? updated : item));
      showSuccess(`Introduction updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
    } catch (err: any) {
      showError(err.message || 'Failed to update introduction status');
    }
  };

  // Filtered introductions
  const filteredIntros = introductions.filter(item => {
    // Status filter
    if (statusFilter === 'active') {
      if (['closed', 'expired', 'intro_declined', 'hired'].includes(item.status)) return false;
    } else if (statusFilter === 'mutual_interest') {
      if (item.status !== 'mutual_interest') return false;
    } else if (statusFilter === 'interviewing') {
      if (item.status !== 'interview_scheduled') return false;
    } else if (statusFilter === 'hired') {
      if (item.status !== 'hired') return false;
    } else if (statusFilter === 'declined') {
      if (item.status !== 'intro_declined') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCandidate = item.candidateName?.toLowerCase().includes(q);
      const matchJob = item.jobTitle?.toLowerCase().includes(q);
      const matchCompany = item.companyName?.toLowerCase().includes(q);
      if (!matchCandidate && !matchJob && !matchCompany) return false;
    }

    return true;
  });

  // Calculate statistics
  const stats = {
    total: introductions.length,
    active: introductions.filter(i => !['closed', 'expired', 'intro_declined'].includes(i.status)).length,
    mutualFit: introductions.filter(i => ['mutual_interest', 'intro_accepted'].includes(i.status)).length,
    interviewing: introductions.filter(i => i.status === 'interview_scheduled').length,
    hired: introductions.filter(i => i.status === 'hired').length
  };

  const getStatusBadge = (status: IntroductionStatus) => {
    switch (status) {
      case 'intro_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Intro Requested
          </span>
        );
      case 'mutual_interest':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Mutual Interest
          </span>
        );
      case 'intro_accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Intro Accepted
          </span>
        );
      case 'interview_scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Calendar className="w-3.5 h-3.5" /> Interview Scheduled
          </span>
        );
      case 'hired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#BA9E6A]/20 text-[#BA9E6A] border border-[#BA9E6A]/40 shadow-sm">
            <Receipt className="w-3.5 h-3.5" /> Placed & Hired
          </span>
        );
      case 'intro_declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#003E5A] via-[#00334A] to-[#002233] text-white shadow-lg border border-[#BA9E6A]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#BA9E6A] text-[#002233]">
              Direct Introduction Engine
            </span>
            <span className="text-xs text-slate-300">Mutual Fit State Machine</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Direct Introductions & Interview Pipeline
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Permissioned candidate-employer connections. Contact details remain securely shielded until mutual interest is confirmed, preventing cold spam.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Threads
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)] font-medium">Total Introductions</span>
          <p className="text-xl font-black text-[var(--text-primary)] mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)] font-medium">Active Pipeline</span>
          <p className="text-xl font-black text-amber-500 mt-1">{stats.active}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)] font-medium">Mutual Fit Established</span>
          <p className="text-xl font-black text-indigo-500 mt-1">{stats.mutualFit}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)] font-medium">Interviews Scheduled</span>
          <p className="text-xl font-black text-blue-500 mt-1">{stats.interviewing}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[#BA9E6A]/30 bg-[#BA9E6A]/5">
          <span className="text-xs text-[#BA9E6A] font-bold">Successful Placements</span>
          <p className="text-xl font-black text-[#BA9E6A] mt-1">{stats.hired}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Threads' },
            { id: 'active', label: 'Active Pipeline' },
            { id: 'mutual_interest', label: 'Mutual Interest' },
            { id: 'interviewing', label: 'Interviewing' },
            { id: 'hired', label: 'Placed / Hired' },
            { id: 'declined', label: 'Declined' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#003E5A] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search candidate, job, employer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#BA9E6A]"
          />
        </div>
      </div>

      {/* Introductions List */}
      {loading ? (
        <div className="p-12 text-center bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]">
          <div className="w-8 h-8 border-3 border-[#BA9E6A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[var(--text-muted)]">Loading direct introductions...</p>
        </div>
      ) : filteredIntros.length === 0 ? (
        <div className="p-12 text-center bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[var(--text-primary)]">No Introduction Threads Found</h4>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            {searchQuery 
              ? `No threads match query "${searchQuery}". Try a different search.` 
              : 'Direct introductions are established when candidates and employers discover mutual interest in the Talent Network.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIntros.map((intro) => {
            const isExpanded = expandedIntroId === intro.id;
            const isContactUnshielded = !intro.anonymizedUntilConsent || ['intro_accepted', 'interview_scheduled', 'hired'].includes(intro.status);

            return (
              <div 
                key={intro.id}
                className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm hover:border-[#BA9E6A]/50 transition-all overflow-hidden"
              >
                {/* Intro Card Main Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Candidate & Position Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-[var(--text-primary)] hover:text-[#BA9E6A] transition-colors cursor-pointer"
                        onClick={() => onNavigateToCandidate && onNavigateToCandidate(intro.candidateId)}
                      >
                        {intro.candidateName}
                      </h4>

                      {/* Shielded / Unshielded badge */}
                      {isContactUnshielded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <Unlock className="w-3 h-3" /> Contact Details Shared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <Lock className="w-3 h-3" /> Shielded Until Mutual Consent
                        </span>
                      )}

                      {getStatusBadge(intro.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
                        <Briefcase className="w-3.5 h-3.5 text-[#BA9E6A]" />
                        {intro.jobTitle}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {intro.companyName || intro.employerName}
                      </span>
                      {intro.matchScore && (
                        <span className="flex items-center gap-1 font-semibold text-[#BA9E6A]">
                          <Sparkles className="w-3.5 h-3.5" />
                          {intro.matchScore}% AI Match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: State Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    
                    {/* Action 1: If requested, Accept or Decline */}
                    {intro.status === 'intro_requested' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(intro.id, 'intro_accepted', 'Accept Introduction')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accept Intro
                        </button>
                        <button
                          onClick={() => handleStatusChange(intro.id, 'intro_declined', 'Decline Introduction')}
                          className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </>
                    )}

                    {/* Action 2: If accepted, Schedule Interview */}
                    {intro.status === 'intro_accepted' && (
                      <button
                        onClick={() => handleStatusChange(intro.id, 'interview_scheduled', 'Schedule Interview')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Schedule Interview
                      </button>
                    )}

                    {/* Action 3: If interviewing or accepted, Confirm Hire */}
                    {['intro_accepted', 'interview_scheduled'].includes(intro.status) && (
                      <button
                        onClick={() => setHireModalIntro(intro)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#BA9E6A] to-[#A88D5B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Confirm Hire & Invoice
                      </button>
                    )}

                    {/* Expand History / Messages Toggle */}
                    <button
                      onClick={() => setExpandedIntroId(isExpanded ? null : intro.id)}
                      className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                      title="View conversation history and audit trail"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                  </div>

                </div>

                {/* Expanded Thread Drawer */}
                {isExpanded && (
                  <div className="px-5 py-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)] space-y-4 text-xs text-[var(--text-primary)] animate-fadeIn">
                    
                    {/* Contact Details Card (if unshielded) */}
                    {isContactUnshielded && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <Unlock className="w-3.5 h-3.5" /> Direct Contact Unlocked
                          </span>
                          <p className="text-[var(--text-muted)]">
                            Both parties have confirmed mutual interest. Direct introductions can now proceed off-platform.
                          </p>
                        </div>
                        <div className="flex items-center gap-3 font-semibold text-xs text-[var(--text-primary)]">
                          <span>Email: {intro.candidateEmail || 'candidate@verified.talent'}</span>
                          <span>Phone: {intro.candidatePhone || '+44 7700 900123'}</span>
                        </div>
                      </div>
                    )}

                    {/* Messages Thread */}
                    {intro.messages && intro.messages.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--text-muted)]">
                          Introduction Messages
                        </span>
                        <div className="space-y-2">
                          {intro.messages.map((msg: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                                <span className="font-semibold text-[var(--text-primary)]">{msg.senderName} ({msg.senderRole})</span>
                                <span>{new Date(msg.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-[var(--text-muted)]">{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audit Trail / History */}
                    {intro.statusHistory && intro.statusHistory.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                        <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--text-muted)]">
                          State Transition Audit Log
                        </span>
                        <div className="space-y-1.5">
                          {intro.statusHistory.map((h: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                              <Clock className="w-3 h-3 text-[#BA9E6A] shrink-0" />
                              <span className="font-semibold text-[var(--text-primary)]">
                                {h.fromStatus} → {h.toStatus}
                              </span>
                              <span>by {h.changedBy}</span>
                              <span className="text-[10px] text-slate-400">({new Date(h.timestamp).toLocaleTimeString()})</span>
                              {h.reason && <span className="italic">— "{h.reason}"</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Hiring Attribution Modal */}
      {hireModalIntro && (
        <HiringAttributionModal
          isOpen={!!hireModalIntro}
          onClose={() => setHireModalIntro(null)}
          introduction={hireModalIntro}
          onHireRecorded={() => {
            loadIntroductions();
          }}
        />
      )}

    </div>
  );
};
