import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  DOCS_ARTICLES,
  getDocArticle,
  getAllDocArticles,
  DocArticle,
} from '@/lib/docs/docs-data';
import { DocsToc } from '@/components/docs/DocsToc';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ApiExplorer } from '@/components/docs/ApiExplorer';
import { FaqAccordion } from '@/components/docs/FaqAccordion';
import { ChangelogTimeline } from '@/components/docs/ChangelogTimeline';
import { DocsFeedback } from '@/components/docs/DocsFeedback';
import {
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface DocPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getDocArticle(slug);

  if (!article) {
    return {
      title: 'Page Not Found | Froncort Docs',
    };
  }

  return {
    title: `${article.title} | Froncort Documentation`,
    description: article.summary || article.subtitle,
    openGraph: {
      title: `${article.title} | Froncort Documentation`,
      description: article.summary || article.subtitle,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  const articles = getAllDocArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function DocArticlePage({ params }: DocPageProps) {
  const { slug } = await params;
  const article = getDocArticle(slug);

  if (!article) {
    notFound();
  }

  const allArticles = getAllDocArticles();
  const currentIndex = allArticles.findIndex((a) => a.slug === slug);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < allArticles.length - 1
      ? allArticles[currentIndex + 1]
      : null;

  const renderCallout = (callout: NonNullable<typeof article.sections[0]['callout']>) => {
    const configMap = {
      note: { bg: 'bg-info/10 border-info/30 text-info', icon: Info },
      tip: { bg: 'bg-success/10 border-success/30 text-success', icon: Lightbulb },
      important: { bg: 'bg-primary/10 border-primary/30 text-primary', icon: CheckCircle },
      warning: { bg: 'bg-warning/10 border-warning/30 text-warning', icon: AlertTriangle },
      caution: { bg: 'bg-error/10 border-error/30 text-error', icon: AlertCircle },
    };

    const config = configMap[callout.type] || configMap.note;
    const IconComponent = config.icon;

    return (
      <div className={`my-4 p-4 rounded-xl border ${config.bg} space-y-1`}>
        <div className="flex items-center gap-2 font-bold text-xs font-sans">
          <IconComponent className="w-4 h-4 shrink-0" />
          <span>{callout.title}</span>
        </div>
        <p className="text-xs text-text-primary/90 leading-relaxed font-sans pl-6">
          {callout.text}
        </p>
      </div>
    );
  };

  return (
    <div className="flex gap-8 items-start">
      {/* Main Content Article */}
      <article className="flex-1 min-w-0 font-sans space-y-8 pb-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-text-secondary">
          <Link href="/docs" className="hover:text-text-primary transition-colors">
            Docs
          </Link>
          <ChevronRight className="w-3 h-3 text-muted-text" />
          <span>{article.category}</span>
          <ChevronRight className="w-3 h-3 text-muted-text" />
          <span className="text-text-primary font-semibold truncate">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-3 border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              {article.category}
            </span>
            <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingTime}</span>
            </span>
            <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Updated {article.lastUpdated}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight font-sans">
            {article.title}
          </h1>

          <p className="text-base text-text-secondary leading-relaxed">{article.subtitle}</p>
        </header>

        {/* Overview Section */}
        {article.overview && (
          <section id="overview" className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary font-sans border-b border-border/50 pb-2">
              Overview
            </h2>
            <p className="text-sm text-text-primary leading-relaxed">{article.overview}</p>
          </section>
        )}

        {/* Architecture Concept */}
        {article.concept && (
          <section id="concept" className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary font-sans border-b border-border/50 pb-2">
              Concept & Architecture
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">{article.concept}</p>
          </section>
        )}

        {/* Features Bullet List */}
        {article.features && article.features.length > 0 && (
          <section id="key-features" className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary font-sans border-b border-border/50 pb-2">
              Key Features
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-primary">
              {article.features.map((feat, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-secondary/60 border border-border"
                >
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Custom Component Pages */}
        {slug === 'api' && <ApiExplorer />}
        {slug === 'faq' && <FaqAccordion />}
        {slug === 'changelog' && <ChangelogTimeline />}

        {/* Detailed Sections */}
        {article.sections &&
          article.sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="space-y-4">
              <h2 className="text-xl font-bold text-text-primary font-sans border-b border-border/50 pb-2">
                {sec.title}
              </h2>

              <p className="text-sm text-text-primary leading-relaxed">{sec.content}</p>

              {sec.callout && renderCallout(sec.callout)}

              {sec.steps && (
                <div className="space-y-3 my-4">
                  {sec.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-border"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {st.stepNumber}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-text-primary font-sans">
                          {st.title}
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">{st.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sec.bullets && (
                <ul className="space-y-2 text-xs text-text-primary pl-4 list-disc">
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="leading-relaxed">
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {sec.codeSnippet && (
                <CodeBlock
                  code={sec.codeSnippet.code}
                  language={sec.codeSnippet.language}
                  filename={sec.codeSnippet.filename}
                />
              )}
            </section>
          ))}

        {/* Best Practices */}
        {article.bestPractices && article.bestPractices.length > 0 && (
          <section id="best-practices" className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary font-sans border-b border-border/50 pb-2">
              Best Practices
            </h2>
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              {article.bestPractices.map((bp, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-text-primary">
                  <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{bp}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tips & Common Mistakes */}
        {(article.tips.length > 0 || article.commonMistakes.length > 0) && (
          <section id="tips-and-troubleshooting" className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary font-sans border-b border-border/50 pb-2">
              Tips & Troubleshooting
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.tips.length > 0 && (
                <div className="p-4 rounded-xl bg-success/10 border border-success/30 space-y-2">
                  <h4 className="text-xs font-bold text-success font-sans flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    <span>Pro Tips</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-text-primary">
                    {article.tips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">
                        &bull; {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {article.commonMistakes.length > 0 && (
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 space-y-2">
                  <h4 className="text-xs font-bold text-warning font-sans flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Common Pitfalls</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-text-primary">
                    {article.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="leading-relaxed">
                        &bull; {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Previous / Next Page Pagination */}
        <div className="pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevArticle ? (
            <Link
              href={`/docs/${prevArticle.slug}`}
              className="p-4 rounded-xl border border-border bg-surface hover:border-primary/40 text-left transition-all group space-y-1"
            >
              <div className="flex items-center gap-1 text-[11px] font-mono text-text-secondary">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Previous Page</span>
              </div>
              <div className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors font-sans">
                {prevArticle.title}
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextArticle && (
            <Link
              href={`/docs/${nextArticle.slug}`}
              className="p-4 rounded-xl border border-border bg-surface hover:border-primary/40 text-right transition-all group space-y-1"
            >
              <div className="flex items-center justify-end gap-1 text-[11px] font-mono text-text-secondary">
                <span>Next Page</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors font-sans">
                {nextArticle.title}
              </div>
            </Link>
          )}
        </div>

        {/* Feedback Widget */}
        <DocsFeedback
          currentSlug={slug}
          relatedSlugs={article.relatedSlugs}
          lastUpdated={article.lastUpdated}
        />
      </article>

      {/* Right Table of Contents (Sticky Desktop) */}
      <DocsToc toc={article.toc} />
    </div>
  );
}
