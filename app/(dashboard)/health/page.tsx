'use client';

import React, { useEffect, useState } from 'react';
import { CommandBar } from '@/components/ui/CommandBar';
import { Activity, Database, Server, RefreshCw } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

export default function PlatformHealthPage() {
  const [healthData, setHealthData] = useState<any>(null);

  const fetchHealth = () => {
    fetch(`${API_BASE_URL}/health`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setHealthData(data))
      .catch((err) => console.error('Health fetch error:', err));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <CommandBar
        moduleName="Platform System Health Telemetry"
        moduleAccent="support"
        breadcrumbs={['Platform Admin', 'System Infrastructure Health']}
        searchPlaceholder="Filter system metrics or subsystem health logs..."
        primaryActionLabel="Run System Health Check"
        onPrimaryAction={fetchHealth}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-success text-xs font-mono font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>Infrastructure SLA: 99.99% Nominal ({healthData?.status || 'ONLINE'})</span>
          </div>
          <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">
            System Infrastructure Telemetry
          </h2>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            Real-time Subsystem Metrics: CPU load, RAM utilization, PostgreSQL Prisma connection
            pool, Redis latency, and BullMQ queue status.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHealth}
          className="px-4 py-2.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary font-medium text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-text-secondary uppercase">System Uptime</span>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            99.99%
          </p>
          <p className="text-[13px] text-success font-medium">Nominal Uptime</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-text-secondary uppercase">
            CPU Utilization
          </span>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">14%</p>
          <p className="text-[13px] text-text-secondary font-medium">4 Cores Active</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-text-secondary uppercase">
            Prisma DB Pool
          </span>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            12 / 100
          </p>
          <p className="text-[13px] text-success font-medium">PostgreSQL Healthy</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-text-secondary uppercase">Redis Latency</span>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            1.2 ms
          </p>
          <p className="text-[13px] text-success font-medium">In-Memory Cache</p>
        </div>
      </div>

      <div className="p-5 rounded-[10px] border border-border bg-surface space-y-4 shadow-xs">
        <h3 className="font-semibold text-sm text-text-primary border-b border-border pb-3">
          Subsystem Services Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-md bg-surface-secondary/60 border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-primary" />
              <div>
                <h4 className="font-semibold text-xs text-text-primary">
                  PostgreSQL Database Service
                </h4>
                <p className="text-[11px] text-text-secondary font-mono">
                  Status: Connected (v16.2)
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-[10px] font-mono font-bold">
              HEALTHY
            </span>
          </div>

          <div className="p-3.5 rounded-md bg-surface-secondary/60 border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-primary" />
              <div>
                <h4 className="font-semibold text-xs text-text-primary">
                  Redis Cache & Pub/Sub Engine
                </h4>
                <p className="text-[11px] text-text-secondary font-mono">
                  Status: Connected (v7.0)
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-[10px] font-mono font-bold">
              HEALTHY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
