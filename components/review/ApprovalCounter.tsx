import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface Props {
  approvedCount: number;
  requiredApprovals: number;
  size?: 'sm' | 'md';
}

export function ApprovalCounter({ approvedCount, requiredApprovals, size = 'md' }: Props) {
  const isComplete = approvedCount >= requiredApprovals;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-bold font-mono rounded-md border ${
        isComplete
          ? 'bg-success/10 text-success border-success/20'
          : 'bg-warning/10 text-warning border-warning/20'
      } ${sizeClasses[size]}`}
    >
      {isComplete ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-warning" />
      )}
      <span>
        {approvedCount} / {requiredApprovals} Approvals
      </span>
    </div>
  );
}
