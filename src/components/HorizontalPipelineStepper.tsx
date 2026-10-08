import React, { useState } from 'react';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import { STAGES, getStageConfig } from '../lib/pipelineStages';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logActivity } from '../services/activityService';
import { createNotification, notifyMultiple, formatNotificationMessage } from '../services/notificationService';

// Define core high-level steps for the stepper
// We'll map existing detailed stages into these main buckets for the horizontal view
const MAIN_STEPS = [
  { id: 'cv_upload', label: 'Applied', matches: ['cv_upload', 'lead', 'in_review'] },
  { id: 'screening', label: 'Screening', matches: ['screening', 'contacted'] },
  { id: 'shortlisted', label: 'Shortlisted', matches: ['shortlisted'] },
  { id: 'client_review', label: 'Client Review', matches: ['client_review'] },
  { id: 'interview_stage', label: 'Interview', matches: ['interview_stage', 'assessment', 'client_interview_round_1', 'client_interview_round_2', 'final_interview'] },
  { id: 'offer_received', label: 'Offer', matches: ['offer_received', 'offer_accepted_declined'] },
  { id: 'joining', label: 'Hired', matches: ['joining', 'invoice_generated'] }
];

interface HorizontalPipelineStepperProps {
  candidateId: string;
  candidateName: string;
  currentStage: string;
  stageHistory: any[];
  assignedTo?: string; // Recruiter ID
  assignedBy?: string; // Admin ID
  isPrivileged: boolean;
  role: string;
  user: any;
  getUserDisplayName: () => string;
  getUserRole: () => string;
  showAlert: (title: string, msg: string) => void;
}

export default function HorizontalPipelineStepper({
  candidateId,
  candidateName,
  currentStage,
  stageHistory,
  assignedTo,
  assignedBy,
  isPrivileged,
  role,
  user,
  getUserDisplayName,
  getUserRole,
  showAlert
}: HorizontalPipelineStepperProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);

  // Determine current main step index based on currentStage
  const currentMainStepIndex = MAIN_STEPS.findIndex(step => 
    step.id === currentStage || step.matches.includes(currentStage)
  );

  const canEdit = isPrivileged || role === 'recruiter';

  const handleStageClick = async (stepId: string) => {
    if (!canEdit || isUpdating || stepId === currentStage) return;

    setIsUpdating(true);
    setUpdatingStageId(stepId);

    try {
      const timestamp = new Date().toISOString();
      const author = getUserDisplayName() || user?.email || 'System';

      const updateData: any = {
        pipelineStage: stepId,
        status: stepId,
        updatedAt: timestamp
      };

      const currentStageHistory = stageHistory || [];
      const isDuplicateStage = currentStageHistory.some((h: any) => h.stage === stepId);
      if (!isDuplicateStage) {
        updateData.stageHistory = [
          ...currentStageHistory,
          { stage: stepId, timestamp, author }
        ];
      }

      await updateDoc(doc(db, 'candidates', candidateId), updateData);

      const stageObj = STAGES.find(s => s.id === stepId);
      const stageLabel = stageObj ? stageObj.label : stepId;

      await logActivity(
        getUserDisplayName(),
        user!.uid,
        getUserRole(),
        'Pipeline Stage Updated',
        candidateName,
        null,
        `Updated pipeline stage to: ${stageLabel}`,
        'Candidate'
      );

      // Trigger relationship-aware notifications
      const recipients = [];
      if (assignedTo && assignedTo !== user?.uid) recipients.push(assignedTo);
      if (assignedBy && assignedBy !== user?.uid && assignedBy !== assignedTo) recipients.push(assignedBy);

      if (recipients.length > 0) {
        const msg = formatNotificationMessage(
          getUserDisplayName(),
          getUserRole(),
          `Updated pipeline stage to ${stageLabel}`
        );

        await notifyMultiple(
          msg,
          user!.uid,
          getUserDisplayName(),
          getUserRole(),
          recipients,
          candidateId
        );
      }

      showAlert('Success', `Moved to ${stageLabel} stage.`);
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to update candidate pipeline stage.');
    } finally {
      setIsUpdating(false);
      setUpdatingStageId(null);
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Mobile view: Stacked list */}
      <div className="md:hidden space-y-2 bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-color)]">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Pipeline Stage</h3>
        {MAIN_STEPS.map((step, idx) => {
          const isCompleted = currentMainStepIndex > idx;
          const isCurrent = currentMainStepIndex === idx;
          const isFuture = currentMainStepIndex < idx;

          return (
            <button
              key={step.id}
              onClick={() => handleStageClick(step.id)}
              disabled={!canEdit || isUpdating}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                isCurrent 
                  ? 'bg-[var(--primary-gold)]/10 border-[var(--primary-gold)] text-[var(--primary-gold)] font-bold shadow-sm' 
                  : isCompleted
                    ? 'bg-[var(--bg-secondary)] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
              } ${!canEdit ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isCurrent ? 'bg-[var(--primary-gold)] text-white' : 
                  isCompleted ? 'bg-emerald-500 text-white' : 
                  'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)]'
                }`}>
                  {updatingStageId === step.id ? (
                    <Loader2 size={12} className="animate-spin text-current" />
                  ) : isCompleted ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>
                <span>{step.label}</span>
              </div>
              {isCurrent && <span className="text-[10px] uppercase tracking-wider font-black">Current</span>}
            </button>
          );
        })}
      </div>

      {/* Desktop view: Horizontal Stepper */}
      <div className="hidden md:flex bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] overflow-x-auto shadow-sm">
        <div className="flex items-center min-w-max w-full justify-between">
          {MAIN_STEPS.map((step, idx) => {
            const isCompleted = currentMainStepIndex > idx;
            const isCurrent = currentMainStepIndex === idx;
            const isFuture = currentMainStepIndex < idx;
            
            // Find who updated it and when, if completed or current
            let historyRecord = null;
            if (stageHistory && (isCompleted || isCurrent)) {
              // Try to find exact match or a match in the bucket
              historyRecord = [...stageHistory].reverse().find(h => 
                h.stage === step.id || step.matches.includes(h.stage)
              );
            }

            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <div className="flex flex-col items-center relative group">
                  <button
                    onClick={() => handleStageClick(step.id)}
                    disabled={!canEdit || isUpdating}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 z-10 transition-all duration-300 shadow-sm ${
                      isCurrent 
                        ? 'border-[var(--primary-gold)] bg-[var(--bg-primary)] ring-4 ring-[var(--primary-gold)]/20' 
                        : isCompleted
                          ? 'border-emerald-500 bg-emerald-500 hover:bg-emerald-600 hover:border-emerald-600'
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-muted)]'
                    } ${!canEdit ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
                  >
                    {updatingStageId === step.id ? (
                      <Loader2 size={18} className="animate-spin text-[var(--primary-gold)]" />
                    ) : isCompleted ? (
                      <Check size={18} className="text-white" strokeWidth={3} />
                    ) : isCurrent ? (
                      <div className="w-3 h-3 rounded-full bg-[var(--primary-gold)] shadow-sm" />
                    ) : (
                      <span className="text-sm font-bold text-[var(--text-muted)]">{idx + 1}</span>
                    )}
                  </button>
                  
                  <div className="mt-3 text-center w-28">
                    <span className={`block text-xs font-bold ${
                      isCurrent ? 'text-[var(--primary-gold)]' : 
                      isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 
                      'text-[var(--text-muted)]'
                    }`}>
                      {step.label}
                    </span>
                    {historyRecord && (
                      <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute w-max left-1/2 -translate-x-1/2 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-lg shadow-md z-20 text-left pointer-events-none">
                        <p className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-0.5">Updated By</p>
                        <p className="text-[10px] font-bold text-[var(--text-primary)]">{historyRecord.author}</p>
                        <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">
                          {new Date(historyRecord.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {idx < MAIN_STEPS.length - 1 && (
                  <div className="flex-1 mx-2 mt-[-24px] z-0 flex items-center">
                    <div className={`h-1 w-full rounded-full transition-colors duration-500 ${
                      currentMainStepIndex > idx ? 'bg-emerald-500' : 'bg-[var(--border-color)]'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
