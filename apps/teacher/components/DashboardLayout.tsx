'use client';

import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children?: React.ReactNode;
  unresolvedAlertCount: number;
}

// Inline SVG icons — no external icon dependency
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconBell = ({ count }: { count?: number }) => (
  <span style={{ position: 'relative', display: 'inline-flex' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
    {count != null && count > 0 && (
      <span style={{
        position: 'absolute', top: -6, right: -6,
        background: 'var(--mastery-weak)', color: '#fff',
        fontSize: 10, fontWeight: 700,
        width: 16, height: 16, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        lineHeight: 1,
      }} aria-label={`${count} alertas sin resolver`}>
        {count}
      </span>
    )}
  </span>
);

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const navItems: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',      icon: <IconHome /> },
  { id: 'alerts',       label: 'Alertas',         icon: <IconBell /> },
  { id: 'students',     label: 'Alumnos',         icon: <IconUsers /> },
  { id: 'assignments',  label: 'Asignaciones',    icon: <IconBook /> },
];

export function DashboardLayout({ children, unresolvedAlertCount }: DashboardLayoutProps): JSX.Element {
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="t-app" data-testid="dashboard-layout">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <nav
        className="t-sidebar"
        aria-label="Navegación principal"
        data-open={sidebarOpen ? 'true' : 'false'}
        data-testid="sidebar"
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--sky-500)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '-0.03em' }}>SP</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--slate-900)', letterSpacing: '-0.01em' }}>
            Super<span style={{ color: 'var(--sky-500)' }}>Profes</span>
          </span>
          {/* Mobile close button */}
          <button
            className="t-icon-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
            style={{ marginLeft: 'auto', display: 'none' }}
            data-testid="sidebar-close-btn"
          >
            <IconX />
          </button>
        </div>

        <div className="t-side-section" style={{ flex: 1 }}>
          <div className="t-side-label">Sala 4°A</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`t-side-item${activeNav === item.id ? ' is-active' : ''}`}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              aria-current={activeNav === item.id ? 'page' : undefined}
              data-testid={`nav-item-${item.id}`}
            >
              {item.id === 'alerts'
                ? <IconBell count={activeNav !== 'alerts' ? unresolvedAlertCount : 0} />
                : item.icon
              }
              <span>{item.label}</span>
              {item.id === 'alerts' && unresolvedAlertCount > 0 && (
                <span className="t-side-badge" aria-label={`${unresolvedAlertCount} sin resolver`}>
                  {unresolvedAlertCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="t-side-section">
          <div className="t-side-meta">
            <div>Período activo</div>
            <strong>Sem. 18 · 2026</strong>
          </div>
        </div>
      </nav>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="t-topbar" data-testid="topbar">
        {/* Mobile hamburger */}
        <button
          className="t-icon-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={sidebarOpen}
          style={{ marginRight: 8 }}
          data-testid="sidebar-open-btn"
        >
          <IconMenu />
        </button>

        <div className="t-brand" style={{ gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg-1)' }}>
            Sala 4°A · Colegio San Agustín
          </span>
        </div>

        <div className="t-actions" aria-label="Acciones de usuario">
          <button
            className="t-icon-btn"
            aria-label={`Alertas — ${unresolvedAlertCount} sin resolver`}
            data-testid="alerts-bell-btn"
            style={{ position: 'relative' }}
          >
            <IconBell count={unresolvedAlertCount} />
          </button>
          <div
            className="t-avatar"
            role="img"
            aria-label="Sra. González — avatar"
            title="Sra. González"
            data-testid="user-avatar"
          >
            SG
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="t-main" id="main-content" data-testid="main-content">
        {children}
      </main>

      {/* ── Mobile sidebar overlay ───────────────────────────── */}
      {sidebarOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,20,27,0.4)',
            zIndex: 9, display: 'none',
          }}
          data-testid="sidebar-overlay"
        />
      )}
    </div>
  );
}
