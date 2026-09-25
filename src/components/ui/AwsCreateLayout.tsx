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
  summaryTitle?: string;
  summaryDescription?: string;
  summary?: CreateLayoutSummaryItem[];
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
        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-[var(--border)] dark:bg-slate-800 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="text-[11px] font-medium text-slate-500 dark:text-[var(--text-muted)]">
              {breadcrumb}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-[var(--text-primary)]">
                {title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-[var(--text-muted)] mt-1 max-w-3xl">
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
                    {index > 0 && <span className="text-slate-400 dark:text-slate-500 px-1">→</span>}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          active
                            ? 'h-6 w-6 rounded-full flex items-center justify-center font-bold bg-indigo-600 text-white'
                            : complete
                              ? 'h-6 w-6 rounded-full flex items-center justify-center font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                              : 'h-6 w-6 rounded-full flex items-center justify-center font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                        }
                      >
                        {stepNumber}
                      </span>
                      <span className={active ? 'font-semibold text-slate-800 dark:text-[var(--text-secondary)]' : ''}>
                        {step.label}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full min-w-0">
          <main className="min-w-0 space-y-5">
            {children}
          </main>
        </div>    </div>
    </div>
  );
}
