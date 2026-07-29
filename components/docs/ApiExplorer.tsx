'use client';

import React, { useState } from 'react';
import { API_ENDPOINTS_SPEC, ApiEndpointSpec } from '@/lib/docs/docs-data';
import { CodeBlock } from './CodeBlock';
import { Play, Copy, Check, Send, Sparkles, RefreshCw, Key, Layers } from 'lucide-react';

export const ApiExplorer: React.FC = () => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(
    API_ENDPOINTS_SPEC[0].id
  );
  const [selectedCodeTab, setSelectedCodeTab] = useState<'typescript' | 'javascript' | 'curl' | 'serverActions'>('typescript');
  const [requestBodyText, setRequestBodyText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<{
    status: number;
    statusText: string;
    json: string;
  } | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const activeEndpoint: ApiEndpointSpec =
    API_ENDPOINTS_SPEC.find((e) => e.id === selectedEndpointId) || API_ENDPOINTS_SPEC[0];

  const handleSelectEndpoint = (id: string) => {
    setSelectedEndpointId(id);
    const ep = API_ENDPOINTS_SPEC.find((e) => e.id === id);
    if (ep && ep.requestBody) {
      setRequestBodyText(ep.requestBody.sampleJson);
    } else {
      setRequestBodyText('');
    }
    setResponseOutput(null);
  };

  const handleExecuteMockRequest = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const defaultResp = activeEndpoint.responses[0];
      setResponseOutput({
        status: defaultResp.status,
        statusText: defaultResp.status === 200 ? 'OK' : defaultResp.status === 201 ? 'Created' : 'Accepted',
        json: defaultResp.sampleJson,
      });
    }, 600);
  };

  const handleCopyResponse = () => {
    if (responseOutput && typeof window !== 'undefined') {
      navigator.clipboard.writeText(responseOutput.json);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const methodColorMap: Record<string, string> = {
    GET: 'bg-info/10 text-info border-info/20',
    POST: 'bg-primary/10 text-primary border-primary/20',
    PUT: 'bg-warning/10 text-warning border-warning/20',
    DELETE: 'bg-error/10 text-error border-error/20',
  };

  return (
    <div className="my-8 rounded-xl border border-border bg-surface p-6 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-text-primary font-sans">
              Interactive REST API Explorer
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Test live mock API endpoints, edit request headers, and inspect formatted JSON responses.
          </p>
        </div>

        {/* Endpoint Selector Dropdown */}
        <div className="w-full sm:w-64">
          <label className="block text-[11px] font-mono font-semibold text-text-secondary uppercase mb-1">
            Select Endpoint
          </label>
          <select
            value={selectedEndpointId}
            onChange={(e) => handleSelectEndpoint(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
          >
            {API_ENDPOINTS_SPEC.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.method} {ep.path} ({ep.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Endpoint Details Bar */}
      <div className="p-4 rounded-lg bg-surface-secondary/70 border border-border space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                methodColorMap[activeEndpoint.method]
              }`}
            >
              {activeEndpoint.method}
            </span>
            <span className="font-mono text-xs font-bold text-text-primary">
              {activeEndpoint.path}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeEndpoint.authRequired && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                <Key className="w-3 h-3" />
                <span>Auth Bearer Required</span>
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-text-secondary">{activeEndpoint.description}</p>
      </div>

      {/* Request Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Headers & Request Body */}
        <div className="space-y-4">
          {/* Headers */}
          <div>
            <span className="text-xs font-mono font-semibold text-text-primary block mb-2">
              Request Headers
            </span>
            <div className="space-y-2">
              {activeEndpoint.headers.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-md bg-surface border border-border text-xs font-mono"
                >
                  <span className="text-text-primary font-semibold">{h.key}</span>
                  <span className="text-text-secondary truncate max-w-[200px]">{h.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Request Body (if POST/PUT) */}
          {activeEndpoint.requestBody && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-text-primary">
                  Request Body (JSON)
                </span>
                <span className="text-[11px] text-text-secondary">Editable</span>
              </div>
              <textarea
                rows={6}
                value={requestBodyText || activeEndpoint.requestBody.sampleJson}
                onChange={(e) => setRequestBodyText(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#0F1115] text-[#F8F8F8] font-mono text-xs border border-[#32363F] focus:outline-none focus:border-primary"
              />
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={handleExecuteMockRequest}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold font-sans flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing API Request...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Request (Mock Mode)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Code Snippet & Live Response */}
        <div className="space-y-4">
          {/* Code Snippet Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-text-primary">
                Code Snippet
              </span>
              <div className="flex items-center gap-1">
                {(['typescript', 'javascript', 'curl', 'serverActions'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedCodeTab(tab)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                      selectedCodeTab === tab
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab === 'serverActions' ? 'Next.js' : tab}
                  </button>
                ))}
              </div>
            </div>
            <CodeBlock
              code={activeEndpoint.codeSamples[selectedCodeTab]}
              language={selectedCodeTab === 'curl' ? 'bash' : 'typescript'}
              filename={`example-${selectedCodeTab}`}
            />
          </div>

          {/* Response Box */}
          {responseOutput && (
            <div className="rounded-lg border border-border bg-[#0F1115] overflow-hidden text-xs font-mono">
              <div className="flex items-center justify-between px-3 py-2 bg-[#171A1F] border-b border-[#32363F]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/20 text-success border border-success/30">
                    HTTP {responseOutput.status} {responseOutput.statusText}
                  </span>
                  <span className="text-[#8B9099] text-[11px]">24ms response time</span>
                </div>
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1 text-[#B8BEC8] hover:text-white text-[11px]"
                >
                  {copiedResponse ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 text-[#F8F8F8] overflow-x-auto max-h-64">
                <code>{responseOutput.json}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
