import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  FileText, 
  Receipt, 
  Sparkles, 
  Building2, 
  UserCheck,
  TrendingUp,
  Percent
} from 'lucide-react';
import { DirectIntroduction } from '../../types/marketplace';
import { recordHiringAttribution } from '../../services/marketplaceService';
import { useToast } from '../../contexts/ToastContext';

interface HiringAttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  introduction: DirectIntroduction;
  onHireRecorded?: (attribution: any) => void;
}

export const HiringAttributionModal: React.FC<HiringAttributionModalProps> = ({
  isOpen,
  onClose,
  introduction,
  onHireRecorded
}) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [salary, setSalary] = useState<number>(85000);
  const [feeModel, setFeeModel] = useState<'percentage_salary' | 'flat_fee'>('percentage_salary');
  const [feeRatePercent, setFeeRatePercent] = useState<number>(15);
  const [flatFeeAmount, setFlatFeeAmount] = useState<number>(12500);
  const [currency, setCurrency] = useState<string>('GBP');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const calculatedFee = feeModel === 'flat_fee' 
    ? flatFeeAmount 
    : Math.round(salary * (feeRatePercent / 100));

  const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'د.إ ';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salary || salary <= 0) {
      showError('Please enter a valid agreed annual salary');
      return;
    }

    setLoading(true);
    try {
      const attribution = await recordHiringAttribution({
        introductionId: introduction.id,
        candidateId: introduction.candidateId,
        candidateName: introduction.candidateName,
        jobId: introduction.jobId,
        jobTitle: introduction.jobTitle,
        employerId: introduction.employerId,
        employerName: introduction.companyName || introduction.employerName,
        annualSalaryAgreed: Number(salary),
        feeModel,
        feeRate: feeModel === 'flat_fee' ? flatFeeAmount : (feeRatePercent / 100),
        totalFeeAmount: calculatedFee,
        currency,
        billingStatus: 'pending_invoice',
        hiredAt: new Date().toISOString(),
        startDate: new Date(startDate).toISOString(),
        notes,
        verifiedByAdmin: true,
        attributionWindowDays: 90
      });

      showSuccess(`Hire confirmed! Placement fee: ${currencySymbol}${calculatedFee.toLocaleString()}. Draft invoice queued.`);
      if (onHireRecorded) {
        onHireRecorded(attribution);
      }
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to record hiring attribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#003E5A] to-[#002B3F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BA9E6A]/20 border border-[#BA9E6A]/40 flex items-center justify-center text-[#BA9E6A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Confirm Placement & Placement Fee</h3>
              <p className="text-xs text-slate-300">
                Record successful hire attribution and auto-queue client placement invoice
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-[var(--text-primary)]">
          
          {/* Match Summary Pill */}
          <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Candidate</span>
              <p className="text-sm font-bold text-[var(--text-primary)]">{introduction.candidateName}</p>
              <p className="text-xs text-[var(--text-muted)]">{introduction.jobTitle}</p>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Employer</span>
              <p className="text-sm font-bold text-[var(--text-primary)]">{introduction.companyName || introduction.employerName}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#BA9E6A]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mutual Fit Verified
              </span>
            </div>
          </div>

          {/* Salary & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Agreed Annual Base Salary
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-[var(--text-muted)]">{currencySymbol}</span>
                <input
                  type="number"
                  step="500"
                  required
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
          </div>

          {/* Fee Model & Calculation */}
          <div className="p-4 rounded-xl border border-[#BA9E6A]/30 bg-[#BA9E6A]/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#BA9E6A]" />
                Monetization & Placement Fee
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFeeModel('percentage_salary')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    feeModel === 'percentage_salary'
                      ? 'bg-[#BA9E6A] text-white'
                      : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)]'
                  }`}
                >
                  % Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setFeeModel('flat_fee')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    feeModel === 'flat_fee'
                      ? 'bg-[#BA9E6A] text-white'
                      : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)]'
                  }`}
                >
                  Flat Fee
                </button>
              </div>
            </div>

            {feeModel === 'percentage_salary' ? (
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Commission Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="40"
                      value={feeRatePercent}
                      onChange={(e) => setFeeRatePercent(Number(e.target.value))}
                      className="w-full pr-8 pl-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                    />
                    <Percent className="w-4 h-4 absolute right-2.5 top-2.5 text-[var(--text-muted)]" />
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-[var(--text-muted)]">Calculated Placement Fee</span>
                  <span className="text-xl font-extrabold text-[#BA9E6A]">
                    {currencySymbol}{calculatedFee.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Agreed Flat Fee</label>
                  <input
                    type="number"
                    step="500"
                    value={flatFeeAmount}
                    onChange={(e) => setFlatFeeAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  />
                </div>
                <div className="text-right">
                  <span className="block text-xs text-[var(--text-muted)]">Calculated Placement Fee</span>
                  <span className="text-xl font-extrabold text-[#BA9E6A]">
                    {currencySymbol}{calculatedFee.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            <p className="text-[11px] text-[var(--text-muted)]">
              Candidate is never charged. Fee is invoiced directly to employer upon confirmed offer acceptance.
            </p>
          </div>

          {/* Start Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Candidate Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Placement Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Standard 90-day rebate guarantee"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#BA9E6A]"
              />
            </div>
          </div>

          {/* Integration Note */}
          <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center gap-2.5 text-xs text-[var(--text-muted)]">
            <Receipt className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              A pending invoice for <strong>{currencySymbol}{calculatedFee.toLocaleString()}</strong> will be automatically created in the Invoicing module for 1-click generation.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-sm shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Placement & Create Invoice</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
