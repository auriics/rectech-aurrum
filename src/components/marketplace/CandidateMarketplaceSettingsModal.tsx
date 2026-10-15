import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  PauseCircle, 
  DollarSign, 
  MapPin, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import { MarketplaceProfile, MarketplaceVisibilityState } from '../../types/marketplace';
import { getCandidateMarketplaceProfile, updateCandidateVisibility } from '../../services/marketplaceService';
import { useToast } from '../../contexts/ToastContext';

interface CandidateMarketplaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onProfileUpdated?: (profile: MarketplaceProfile) => void;
}

export const CandidateMarketplaceSettingsModal: React.FC<CandidateMarketplaceSettingsModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onProfileUpdated
}) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);

  // Form states
  const [visibility, setVisibility] = useState<MarketplaceVisibilityState>('discoverable');
  const [preferredTitles, setPreferredTitles] = useState<string>('');
  const [preferredLocations, setPreferredLocations] = useState<string>('');
  const [workArrangement, setWorkArrangement] = useState<'remote' | 'hybrid' | 'on-site' | 'flexible'>('hybrid');
  const [employmentType, setEmploymentType] = useState<'full-time' | 'contract' | 'part-time'>('full-time');
  const [desiredSalaryMin, setDesiredSalaryMin] = useState<number>(75000);
  const [desiredSalaryMax, setDesiredSalaryMax] = useState<number>(95000);
  const [salaryCurrency, setSalaryCurrency] = useState<string>('GBP');
  const [availability, setAvailability] = useState<'immediate' | '2_weeks' | '1_month' | '3_months' | 'passive'>('1_month');
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && candidate) {
      loadProfile();
    }
  }, [isOpen, candidate]);

  const loadProfile = async () => {
    if (!candidate?.id) return;
    setLoading(true);
    try {
      const p = await getCandidateMarketplaceProfile(candidate.id, candidate);
      setProfile(p);
      setVisibility(p.visibility || 'discoverable');
      setPreferredTitles((p.preferredTitles || []).join(', '));
      setPreferredLocations((p.preferredLocations || []).join(', '));
      setWorkArrangement(p.workArrangement || 'hybrid');
      setEmploymentType(p.employmentType || 'full-time');
      setDesiredSalaryMin(p.desiredSalaryMin || 75000);
      setDesiredSalaryMax(p.desiredSalaryMax || 95000);
      setSalaryCurrency(p.salaryCurrency || 'GBP');
      setAvailability(p.availability || '1_month');
    } catch (err) {
      console.error('Error loading candidate marketplace profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!candidate?.id) return;
    if (visibility === 'discoverable' && !consentAcknowledged) {
      showError('Please confirm the privacy and consent acknowledgment to activate discoverability');
      return;
    }

    setLoading(true);
    try {
      const titlesArray = preferredTitles.split(',').map(t => t.trim()).filter(Boolean);
      const locationsArray = preferredLocations.split(',').map(l => l.trim()).filter(Boolean);

      const updated = await updateCandidateVisibility(
        candidate.id,
        visibility,
        {
          preferredTitles: titlesArray.length > 0 ? titlesArray : [candidate.desiredRole || candidate.title || 'Professional'],
          preferredLocations: locationsArray.length > 0 ? locationsArray : [candidate.location || 'London, UK'],
          workArrangement,
          employmentType,
          desiredSalaryMin: Number(desiredSalaryMin),
          desiredSalaryMax: Number(desiredSalaryMax),
          salaryCurrency,
          availability
        },
        candidate
      );

      showSuccess(`Marketplace profile status set to: ${visibility.toUpperCase()}`);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to update marketplace settings');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#003E5A] to-[#002B3F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BA9E6A]/20 border border-[#BA9E6A]/40 flex items-center justify-center text-[#BA9E6A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Talent Network & Marketplace Settings</h3>
              <p className="text-xs text-slate-300">
                Manage discoverability, mutual-fit introduction rules, and privacy protections
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[var(--text-primary)]">

          {/* Privacy Guarantee Banner */}
          <div className="p-4 rounded-xl bg-[#003E5A]/5 dark:bg-[#003E5A]/20 border border-[#003E5A]/20 flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#BA9E6A] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-[var(--text-primary)]">Contact Shield Active</span>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Direct phone and email contact details are <strong className="text-[var(--text-primary)]">strictly shielded</strong> from employers and agencies until you explicitly accept a mutual introduction request. Zero mass spam or unsolicited calls.
              </p>
            </div>
          </div>

          {/* Visibility Mode Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Marketplace Discoverability Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('discoverable')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  visibility === 'discoverable'
                    ? 'border-[#BA9E6A] bg-[#BA9E6A]/10 shadow-sm'
                    : 'border-[var(--border-color)] hover:border-slate-400 bg-[var(--card-bg)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Discoverable</span>
                  </div>
                  {visibility === 'discoverable' && (
                    <CheckCircle2 className="w-4 h-4 text-[#BA9E6A]" />
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Opt in to AI matching and receive high-fit introduction requests from verified employers.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('paused')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  visibility === 'paused'
                    ? 'border-[#BA9E6A] bg-[#BA9E6A]/10 shadow-sm'
                    : 'border-[var(--border-color)] hover:border-slate-400 bg-[var(--card-bg)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                    <PauseCircle className="w-4 h-4" />
                    <span>Paused</span>
                  </div>
                  {visibility === 'paused' && (
                    <CheckCircle2 className="w-4 h-4 text-[#BA9E6A]" />
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Temporarily pause new introduction requests while maintaining your profile and saved matches.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('withdrawn')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  visibility === 'withdrawn'
                    ? 'border-[#BA9E6A] bg-[#BA9E6A]/10 shadow-sm'
                    : 'border-[var(--border-color)] hover:border-slate-400 bg-[var(--card-bg)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                    <EyeOff className="w-4 h-4" />
                    <span>Withdrawn</span>
                  </div>
                  {visibility === 'withdrawn' && (
                    <CheckCircle2 className="w-4 h-4 text-[#BA9E6A]" />
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Completely opt out from the talent network. No employers can discover your profile.
                </p>
              </button>
            </div>
          </div>

          {/* Target Positions & Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Target Job Titles (Comma-separated)
              </label>
              <input
                type="text"
                value={preferredTitles}
                onChange={(e) => setPreferredTitles(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer, Tech Lead"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Preferred Locations (Comma-separated)
              </label>
              <input
                type="text"
                value={preferredLocations}
                onChange={(e) => setPreferredLocations(e.target.value)}
                placeholder="e.g. London, UK, Remote UK"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
              />
            </div>
          </div>

          {/* Work Arrangement & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Work Arrangement
              </label>
              <select
                value={workArrangement}
                onChange={(e) => setWorkArrangement(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
              >
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-Site</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
              >
                <option value="full-time">Permanent / Full-Time</option>
                <option value="contract">Contract / Freelance</option>
                <option value="part-time">Part-Time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Joining Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
              >
                <option value="immediate">Immediate</option>
                <option value="2_weeks">2 Weeks</option>
                <option value="1_month">1 Month Notice</option>
                <option value="3_months">3 Months Notice</option>
                <option value="passive">Passive Looking</option>
              </select>
            </div>
          </div>

          {/* Salary Expectations */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              Desired Annual Salary Range
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-[var(--text-muted)] font-bold">Min</span>
                <input
                  type="number"
                  step="1000"
                  value={desiredSalaryMin}
                  onChange={(e) => setDesiredSalaryMin(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
                />
              </div>
              <span className="text-[var(--text-muted)] font-bold">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-[var(--text-muted)] font-bold">Max</span>
                <input
                  type="number"
                  step="1000"
                  value={desiredSalaryMax}
                  onChange={(e) => setDesiredSalaryMax(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
                />
              </div>
              <select
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="w-24 px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-start gap-3">
            <input
              type="checkbox"
              id="consent-check"
              checked={consentAcknowledged}
              onChange={(e) => setConsentAcknowledged(e.target.checked)}
              className="mt-1 h-4 w-4 rounded text-[#BA9E6A] focus:ring-[#BA9E6A] border-slate-300"
            />
            <label htmlFor="consent-check" className="text-xs text-[var(--text-muted)] leading-relaxed cursor-pointer">
              I acknowledge that Aurrum CRM uses AI matching to pair my skills and expectations with verified employer openings. I understand my personal contact information will remain shielded until I actively review and accept a direct introduction request. Participation in the network is completely free for candidates.
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#BA9E6A] to-[#A88D5B] text-white font-semibold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Marketplace Preferences</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
