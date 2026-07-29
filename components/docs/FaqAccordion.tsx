'use client';

import React, { useState } from 'react';
import { FAQ_ITEMS, FaqItem } from '@/lib/docs/docs-data';
import { ChevronDown, ChevronUp, Search, HelpCircle, Tag, CheckCircle2 } from 'lucide-react';

export const FaqAccordion: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [openItemIds, setOpenItemIds] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-3': true,
  });

  const categories = [
    'All',
    'General',
    'Organizations & Access',
    'Security & Compliance',
    'AI Workspace',
    'Billing & Infrastructure',
  ];

  const toggleItem = (id: string) => {
    setOpenItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      !faqSearch ||
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(faqSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="my-8 space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search FAQ Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-text" />
          <input
            type="text"
            placeholder="Search questions..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary font-sans"
          />
        </div>
      </div>

      {/* Accordion Cards List */}
      {filteredFaqs.length > 0 ? (
        <div className="space-y-3">
          {filteredFaqs.map((item) => {
            const isOpen = openItemIds[item.id];
            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'border-primary/40 bg-surface shadow-xs'
                    : 'border-border bg-surface/70 hover:border-border/80'
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-sm text-text-primary font-sans block">
                        {item.question}
                      </span>
                      <span className="text-[11px] font-mono text-text-secondary mt-0.5 inline-block">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-1 rounded-md text-text-secondary hover:text-text-primary shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-border/50 text-xs text-text-secondary leading-relaxed font-sans space-y-3">
                    <p>{item.answer}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Tag className="w-3 h-3 text-muted-text" />
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-secondary text-text-secondary border border-border"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-border rounded-xl p-6">
          <p className="text-sm font-medium text-text-primary">No questions found</p>
          <p className="text-xs text-text-secondary mt-1">
            Try adjusting your category filter or search keywords.
          </p>
        </div>
      )}
    </div>
  );
};
