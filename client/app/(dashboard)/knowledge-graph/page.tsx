'use client';

import React, { useState } from 'react';
import { CommandBar } from '@/components/ui/CommandBar';
import { Network, Building2, Ticket, GitPullRequest, Shield, User, ArrowRight } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'organization' | 'ticket' | 'pr' | 'audit' | 'user';
  subtext: string;
  connections: string[];
  status: 'nominal' | 'risk' | 'active';
}

export default function KnowledgeGraphPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-org-1');
  const [filterType, setFilterType] = useState<string>('ALL');

  const nodes: GraphNode[] = [
    {
      id: 'node-org-1',
      label: 'Acme Engineering',
      type: 'organization',
      subtext: 'Primary Org Slug: acme-eng',
      connections: ['node-user-1', 'node-ticket-1', 'node-pr-1', 'node-audit-1'],
      status: 'nominal',
    },
    {
      id: 'node-user-1',
      label: 'Rahul Sharma (Admin)',
      type: 'user',
      subtext: 'rahul@froncort.ai',
      connections: ['node-org-1', 'node-ticket-1', 'node-pr-1'],
      status: 'active',
    },
    {
      id: 'node-ticket-1',
      label: 'Ticket #TICK-1082',
      type: 'ticket',
      subtext: 'API Gateway Rate Limiting Defect',
      connections: ['node-org-1', 'node-user-1', 'node-audit-1'],
      status: 'risk',
    },
    {
      id: 'node-pr-1',
      label: 'PR #PR-402',
      type: 'pr',
      subtext: 'Refactor RBAC Permission Check',
      connections: ['node-org-1', 'node-user-1'],
      status: 'nominal',
    },
    {
      id: 'node-audit-1',
      label: 'Audit #AUDIT-99412',
      type: 'audit',
      subtext: 'SECURITY_POLICY_UPDATED',
      connections: ['node-org-1', 'node-ticket-1'],
      status: 'nominal',
    },
  ];

  const filteredNodes = nodes.filter(
    (n) => filterType === 'ALL' || n.type.toUpperCase() === filterType
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const connectedNodes = nodes.filter((n) => selectedNode.connections.includes(n.id));

  return (
    <div className="space-y-6">
      {/* Context Command Bar */}
      <CommandBar
        moduleName="Organization Knowledge Graph"
        moduleAccent="reviews"
        breadcrumbs={['Workspace', 'Entity Graph']}
        searchPlaceholder="Filter graph entities by name or type..."
      />

      {/* Filter Chips */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {['ALL', 'ORGANIZATION', 'TICKET', 'PR', 'AUDIT', 'USER'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === t
                ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Graph Visualizer & Node Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Graph Canvas (2 Cols) */}
        <div className="lg:col-span-2 panel-card p-6 min-h-[500px] flex flex-col justify-between relative overflow-hidden bg-slate-950/40">
          <div className="flex items-center justify-between pb-4 border-b border-border z-10">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-sm text-foreground">
                Interactive Knowledge Topology
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              Click entity node to inspect links
            </span>
          </div>

          {/* Node Grid Visualization */}
          <div className="py-12 grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10">
            {filteredNodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500 text-foreground ring-2 ring-purple-500/30 shadow-lg'
                      : 'bg-card border-border hover:border-slate-700 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      {node.type === 'organization' && (
                        <Building2 className="w-4 h-4 text-blue-400" />
                      )}
                      {node.type === 'ticket' && <Ticket className="w-4 h-4 text-rose-400" />}
                      {node.type === 'pr' && <GitPullRequest className="w-4 h-4 text-purple-400" />}
                      {node.type === 'audit' && <Shield className="w-4 h-4 text-emerald-400" />}
                      {node.type === 'user' && <User className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        node.status === 'risk'
                          ? 'bg-rose-500 animate-ping'
                          : node.status === 'active'
                            ? 'bg-cyan-400'
                            : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground truncate">{node.label}</h4>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {node.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl border border-border bg-card/60 text-[11px] text-muted-foreground font-mono flex items-center justify-between z-10">
            <span>Graph Nodes: {nodes.length} entities</span>
            <span>Semantic Relations: Active</span>
          </div>
        </div>

        {/* Node Inspector Side Panel (1 Col) */}
        <div className="panel-card module-accent-reviews p-6 space-y-4">
          <div className="pb-3 border-b border-border">
            <span className="text-[10px] font-mono font-bold uppercase text-purple-400">
              Inspecting Entity
            </span>
            <h3 className="text-base font-bold text-foreground mt-0.5">{selectedNode.label}</h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{selectedNode.subtext}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase font-mono">
              Direct Connections ({connectedNodes.length})
            </h4>
            <div className="space-y-2">
              {connectedNodes.map((conn) => (
                <div
                  key={conn.id}
                  onClick={() => setSelectedNodeId(conn.id)}
                  className="p-3 rounded-xl border border-border bg-card hover:bg-secondary transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">{conn.label}</span>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {conn.type.toUpperCase()}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
