'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Square,
  CheckCircle2,
  RotateCcw,
  X,
} from 'lucide-react';

export const AutonomousDemoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const simulationSteps = [
    {
      step: 1,
      role: 'SYSTEM_ADMIN',
      title: 'Authentication & Session Token Validation',
      detail: 'Validating OAuth2 PKCE Bearer token with RS256 algorithm. Injecting Org context: org_acme_enterprise.',
      module: 'Authentication',
      color: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    },
    {
      step: 2,
      role: 'SUPPORT_MANAGER',
      title: 'Create & Score Support Ticket',
      detail: 'Creating ticket TICK-2041 "High Latency in Webhook Processing". Assigned SLA priority CRITICAL. Target response: 30m.',
      module: 'Support Hub',
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    },
    {
      step: 3,
      role: 'STAFF_ENGINEER',
      title: 'Code Review Submission & PR Verification',
      detail: 'Submitted PR #405 "Fix Redis connection pool starvation". Mandatory 2/2 approvals threshold requested.',
      module: 'Review Console',
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    },
    {
      step: 4,
      role: 'SECURITY_AUDITOR',
      title: 'Immutable Audit Trail Dispatch',
      detail: 'Audit log entry created for PR approval. Payload state diff calculated and hashed to tamper-proof stream.',
      module: 'Audit Stream',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      step: 5,
      role: 'ORGANIZATION_ADMIN',
      title: 'Federated Resource Cross-Tenant Grant',
      detail: 'Created Cross-Tenant Resource Share token for org_stripe_partner. Permission scope: READ_REVIEW for 7 days.',
      module: 'Cross Sharing',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    },
    {
      step: 6,
      role: 'AI_WORKER',
      title: 'Executive AI Digest Generation',
      detail: 'Gemini LLM worker synthesized ticket backlog, pull request statuses, and security audits into daily briefing.',
      module: 'AI Engine',
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && isOpen) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= simulationSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isOpen]);

  const handleStartSimulation = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  if (!isOpen) return null;

  const currentStep = simulationSteps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl rounded-[10px] border border-[#D9D9D9] bg-white text-[#1F1F1F] overflow-hidden shadow-xs font-sans"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D9D9D9] bg-[#F2F2F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#174D38]" />
            <div>
              <h3 className="font-semibold text-sm text-[#1F1F1F]">Autonomous Enterprise Product Simulation</h3>
              <p className="text-[11px] font-mono text-[#6B7280]">Performing live end-to-end multi-tenant operations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white text-[#6B7280] hover:text-[#1F1F1F] transition-colors cursor-pointer border border-transparent hover:border-[#D9D9D9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Controls & Playback */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <button
                  onClick={handleStartSimulation}
                  className="px-4 py-2 rounded-md text-xs font-medium text-white bg-[#174D38] hover:bg-[#123A2B] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentStepIndex === simulationSteps.length - 1 ? 'Re-run Simulation' : 'Start Simulation'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-4 py-2 rounded-md text-xs font-medium text-white bg-[#D97706] hover:bg-[#B45309] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={handleReset}
                className="p-2 rounded-md border border-[#D9D9D9] hover:bg-[#F2F2F2] text-[#6B7280] hover:text-[#1F1F1F] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs font-mono text-[#6B7280]">
              Step <span className="text-[#1F1F1F] font-bold">{currentStepIndex + 1}</span> of {simulationSteps.length}
            </div>
          </div>

          {/* Current Step Card */}
          <motion.div
            key={currentStep.step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="p-5 rounded-md border border-[#D9D9D9] bg-[#F2F2F2]/50 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-white text-[#174D38] border border-[#D9D9D9]">
                ROLE: {currentStep.role}
              </span>
              <span className="text-[10px] font-mono text-[#6B7280]">MODULE: {currentStep.module}</span>
            </div>

            <h4 className="font-semibold text-base text-[#1F1F1F]">{currentStep.title}</h4>

            <p className="text-xs text-[#1F1F1F] leading-relaxed font-mono bg-white p-3 rounded-md border border-[#D9D9D9]">
              &gt; {currentStep.detail}
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-[#15803D]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Operation Executed & Cryptographically Signed</span>
            </div>
          </motion.div>

          {/* Steps Progress Bar */}
          <div className="grid grid-cols-6 gap-2">
            {simulationSteps.map((s, idx) => (
              <div
                key={s.step}
                className={`h-1.5 rounded-full transition-all ${
                  idx <= currentStepIndex ? 'bg-[#174D38]' : 'bg-[#D9D9D9]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D9D9D9] bg-[#F2F2F2] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium text-[#1F1F1F] border border-[#D9D9D9] bg-white hover:bg-[#F2F2F2] transition-colors cursor-pointer"
          >
            Close Simulation
          </button>
        </div>
      </motion.div>
    </div>
  );
};
