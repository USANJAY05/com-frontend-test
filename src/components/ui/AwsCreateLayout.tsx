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
        <div className="w-full min-w-0">
          <main className="min-w-0 space-y-5">
            {children}
          </main>
        </div>    </div>
    </div>
  );
}
