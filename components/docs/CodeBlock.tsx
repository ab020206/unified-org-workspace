'use client';

import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  tabs?: { label: string; code: string; language: string }[];
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
  tabs,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentCode = tabs && tabs.length > 0 ? tabs[activeTabIndex].code : code;
  const currentLang = tabs && tabs.length > 0 ? tabs[activeTabIndex].language : language;
  const currentFilename =
    tabs && tabs.length > 0 ? tabs[activeTabIndex].label : filename;

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = currentCode.trim().split('\n');

  return (
    <div className="my-6 rounded-xl border border-border bg-[#0F1115] text-[#F8F8F8] overflow-hidden shadow-md font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#171A1F] border-b border-[#32363F]">
        {/* Tabs or Filename */}
        {tabs && tabs.length > 0 ? (
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTabIndex(idx)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-medium transition-colors ${
                  activeTabIndex === idx
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-[#B8BEC8] hover:text-white hover:bg-[#20242B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#B8BEC8] font-sans text-xs font-medium">
            <FileCode className="w-3.5 h-3.5 text-primary" />
            <span>{currentFilename || currentLang}</span>
          </div>
        )}

        {/* Copy Code Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#20242B] hover:bg-[#32363F] text-[#B8BEC8] hover:text-white text-[11px] font-sans transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-success" />
              <span className="text-success font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="p-4 overflow-x-auto leading-relaxed">
        <pre className="flex gap-4">
          {/* Line Numbers */}
          <div className="flex flex-col text-[#8B9099] select-none text-right pr-2 border-r border-[#32363F]">
            {lines.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>

          {/* Code Text */}
          <code className="flex-1 text-[#F8F8F8] whitespace-pre">
            {lines.map((line, i) => (
              <div key={i}>{line || ' '}</div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
