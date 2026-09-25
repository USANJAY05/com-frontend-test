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
        <div className="mb-5 rounded-2xl border border-slate-300 dark:border-[var(--border)] bg-slate-800 dark:bg-slate-800 px-4 py-3.5 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 text-sm font-semibold text-white dark:text-[var(--text-primary)] truncate">
              {breadcrumb}
            </div>
            {action && <div className="shrink-0">{action}</div>}
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
