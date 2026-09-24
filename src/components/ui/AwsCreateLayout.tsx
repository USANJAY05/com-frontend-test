import React from 'react';

export interface CreateLayoutStep {
  label: string;
}

export interface CreateLayoutSummaryItem {
  label: string;
  value: React.ReactNode;
}

interface AwsCreateLayoutProps {
  breadcrumb: string;
  title: string;
  description: string;
  steps: CreateLayoutStep[];
  activeStep: number;
  summaryTitle: string;
  summaryDescription?: string;
  summary: CreateLayoutSummaryItem[];
  children: React.ReactNode;
  action?: React.ReactNode;
}

export default function AwsCreateLayout({
  breadcrumb,
  title,
  description,
  steps,
  activeStep,
  summaryTitle,
  summaryDescription,
  summary,
  children,
  action,
}: AwsCreateLayoutProps) {
  return (
    <div className="col-span-12 w-full min-w-0 px-3 sm:px-5 lg:px-6 xl:px-8 pb-10 pt-2">
      <div className="w-full min-w-0">
        <div className="mb-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="text-[11px] text-slate-500 dark:text-[var(--text-muted)]">
              {breadcrumb}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-[var(--text-primary)]">
                {title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-[var(--text-muted)] mt-1 max-w-3xl">
                {description}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-[var(--text-muted)] shrink-0">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const active = activeStep === stepNumber;
                const complete = activeStep > stepNumber;

                return (
                  <React.Fragment key={step.label}>
                    {index > 0 && <span className="text-slate-300 dark:text-slate-600 px-1">→</span>}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          active
                            ? 'h-6 w-6 rounded-full flex items-center justify-center font-bold bg-indigo-600 text-white'
                            : complete
                              ? 'h-6 w-6 rounded-full flex items-center justify-center font-bold bg-indigo-100 text-indigo-700'
                              : 'h-6 w-6 rounded-full flex items-center justify-center font-bold bg-slate-200 text-slate-600'
                        }
                      >
                        {stepNumber}
                      </span>
                      <span className={active ? 'font-semibold text-slate-700 dark:text-[var(--text-secondary)]' : ''}>
                        {step.label}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 2xl:gap-6 items-start">
          <main className="min-w-0 space-y-5">
            {children}
          </main>

          <aside className="xl:sticky xl:top-6 rounded-xl border border-slate-200 dark:border-[var(--border)] bg-white dark:bg-[var(--bg-surface)] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[var(--border)]">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[var(--text-primary)]">
                {summaryTitle}
              </h3>
              {summaryDescription && (
                <p className="text-[11px] text-slate-500 dark:text-[var(--text-muted)] mt-1">
                  {summaryDescription}
                </p>
              )}
            </div>

            <div className="p-5 space-y-4">
              {summary.map(({ label, value }) => (
                <div
                  key={label}
                  className="border-b border-slate-100 dark:border-[var(--border)] pb-3 last:border-0 last:pb-0"
                >
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    {label}
                  </p>
                  <p className="text-xs font-medium text-slate-700 dark:text-[var(--text-secondary)] mt-1 break-words">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
