import React from 'react';
import { Globe2, LayoutDashboard, Building2, Users, ScrollText, LogOut, Settings, IndianRupee, MessageSquareText, Sun, Moon } from 'lucide-react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import OverviewPage from './OverviewPage';
import OrganizationsPage from './OrganizationsPage';
import CreateWorkspacePage from './CreateWorkspacePage';
import UsersPage from './UsersPage';
import ActivityPage from './ActivityPage';
import SettingsPage from './SettingsPage';
import CostPage from './CostPage';
import PromptsPage from './PromptsPage';
import ThemeToggle from '../shared/theme/ThemeToggle';
import { useTheme } from '../shared/theme/ThemeContext';

const NAV: { path: string; label: string; icon: React.ElementType }[] = [
  { path: 'overview',       label: 'Overview',           icon: LayoutDashboard },
  { path: 'organizations',  label: 'Organizations',      icon: Building2 },
  { path: 'users',          label: 'Users',              icon: Users },
  { path: 'activity',       label: 'Activity',           icon: ScrollText },
  { path: 'cost',           label: 'Cost & Pricing',     icon: IndianRupee },
  { path: 'settings',       label: 'Features',           icon: Settings },
  { path: 'prompts',        label: 'Prompts',             icon: MessageSquareText },
];

export default function AdminShell({ email, onLogout }: { email: string; onLogout: () => void }) {
  const { resolved } = useTheme();
  return (
    <div className="admin-shell flex h-screen w-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
      <aside className="admin-sidebar w-60 flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-[var(--border)]">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Globe2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)] leading-none">ChiefVoice</div>
            <div className="text-[9px] text-amber-500 uppercase tracking-widest mt-0.5">Platform Admin</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/admin/${path}`}
              className={({ isActive }) =>
                `w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'admin-nav-active' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <Icon className="h-4 w-4 mr-3" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <div className="px-3 py-2 text-xs text-[var(--text-muted)] truncate">{email}</div>
          <button onClick={onLogout} className="w-full flex items-center px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
            <LogOut className="h-4 w-4 mr-3" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="h-16 bg-[var(--header-bg)] border-b border-[var(--border)] flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Platform control center
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              {resolved === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              {resolved} mode
            </span>
            <ThemeToggle />
          </div>
        </div>
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview"      element={<PageWrap title="Overview"><OverviewPage /></PageWrap>} />
          <Route path="organizations" element={<PageWrap title="Organizations"><OrganizationsPage /></PageWrap>} />
          <Route path="organizations/create" element={<PageWrap title="Create Workspace"><CreateWorkspacePage /></PageWrap>} />
          <Route path="users"         element={<PageWrap title="Users"><UsersPage /></PageWrap>} />
          <Route path="activity"      element={<PageWrap title="Activity"><ActivityPage /></PageWrap>} />
          <Route path="cost"          element={<PageWrap title="Cost & Pricing"><CostPage /></PageWrap>} />
          <Route path="settings"      element={<PageWrap title="Features"><SettingsPage /></PageWrap>} />
          <Route path="prompts"       element={<PageWrap title="Prompts"><PromptsPage /></PageWrap>} />
          <Route path="*"             element={<Navigate to="overview" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function PageWrap({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-page">
      <div className="px-8 pt-7 pb-2">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
      </div>
      <div className="p-8 pt-5">{children}</div>
    </div>
  );
}
