'use client';

import React, { useState } from 'react';
import type { TeacherAlert } from '../lib/types';

interface AlertsPanelProps {
  alerts: TeacherAlert[];
  onResolve: (id: string) => void;
}

interface AlertItemProps {
  alert: TeacherAlert;
  onResolve: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────

type AlertTone = 'risk' | 'amber' | 'red';

interface AlertDef {
  tone: AlertTone;
  badgeLabel: string;
  getMessage: (payload: TeacherAlert['payload']) => string;
  hint: string;
}

const ALERT_DEFS: Record<TeacherAlert['alertType'], AlertDef> = {
  AT_RISK_SKILL: {
    tone: 'amber',
    badgeLabel: 'Habilidad en riesgo',
    getMessage: (p) =>
      `${p.studentIds?.length ?? 0} alumnos están en riesgo en ${p.skillLabel ?? p.skillKey ?? 'habilidad desconocida'}`,
    hint: 'Asignar práctica focalizada al grupo',
  },
  COMMON_ERROR_DETECTED: {
    tone: 'amber',
    badgeLabel: 'Error común',
    getMessage: (p) =>
      `Error común detectado: ${p.errorType ?? '—'} en ${p.studentIds?.length ?? 0} alumnos esta semana`,
    hint: 'Revisar recurso pedagógico sugerido',
  },
  STUDENT_DROP: {
    tone: 'risk',
    badgeLabel: 'Caída de alumno',
    getMessage: (p) =>
      `${p.studentName ?? p.studentId ?? 'Alumno'} bajó de ${p.previousLevel ?? '—'} a ${p.currentLevel ?? '—'} en ${p.skillLabel ?? p.skillKey ?? '—'}`,
    hint: 'Notificar apoderado · ofrecer mini-lección',
  },
};

const TONE_STYLES: Record<AlertTone, { border: string; iconBg: string; iconColor: string; badgeBg: string; badgeFg: string }> = {
  risk: {
    border: '#F8D7D7',
    iconBg: '#FCE3E3',
    iconColor: '#5A1F1F',
    badgeBg: '#FCE3E3',
    badgeFg: '#5A1F1F',
  },
  amber: {
    border: 'var(--error-border)',
    iconBg: 'var(--error-bg)',
    iconColor: 'var(--error-fg)',
    badgeBg: 'var(--error-bg)',
    badgeFg: 'var(--error-fg)',
  },
  red: {
    border: '#F8D7D7',
    iconBg: '#FCE3E3',
    iconColor: '#5A1F1F',
    badgeBg: '#FCE3E3',
    badgeFg: '#5A1F1F',
  },
};

// Icon per alert type
const AlertIcon = ({ alertType }: { alertType: TeacherAlert['alertType'] }) => {
  if (alertType === 'STUDENT_DROP') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
        <polyline points="17 18 23 18 23 12"/>
      </svg>
    );
  }
  if (alertType === 'COMMON_ERROR_DETECTED') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    );
  }
  // AT_RISK_SKILL
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
};

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── AlertItem ──────────────────────────────────────────────────────────────

function AlertItem({ alert, onResolve }: AlertItemProps): JSX.Element {
  const [resolved, setResolved] = useState(false);
  const def = ALERT_DEFS[alert.alertType];
  const toneStyles = TONE_STYLES[def.tone];

  function handleResolve(): void {
    setResolved(true);
    setTimeout(() => { onResolve(alert.id); }, 400);
  }

  return (
    <article
      className="t-alert"
      data-testid="alert-item"
      data-alert-id={alert.id}
      data-alert-type={alert.alertType}
      role="article"
      aria-label={`Alerta: ${def.getMessage(alert.payload)}`}
      style={{
        borderColor: toneStyles.border,
        opacity: resolved ? 0 : 1,
        transition: 'opacity 350ms var(--ease-standard)',
        pointerEvents: resolved ? 'none' : undefined,
      }}
    >
      {/* Icon */}
      <div
        className="t-alert-icon"
        aria-hidden="true"
        style={{ background: toneStyles.iconBg, color: toneStyles.iconColor }}
      >
        <AlertIcon alertType={alert.alertType} />
      </div>

      {/* Body */}
      <div className="t-alert-body">
        <div className="t-alert-meta">
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: toneStyles.badgeBg,
              color: toneStyles.badgeFg,
              padding: '2px 8px',
              borderRadius: 'var(--r-pill)',
            }}
          >
            {def.badgeLabel}
          </span>
          <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>
            · {new Date(alert.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <h3 style={{ margin: '4px 0 2px', fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>
          {def.getMessage(alert.payload)}
        </h3>
        <p className="t-caption" style={{ margin: 0 }}>{def.hint}</p>
      </div>

      {/* Resolve button */}
      <button
        className="btn btn-secondary"
        data-testid="resolve-btn"
        data-alert-id={alert.id}
        onClick={handleResolve}
        aria-label={`Resolver alerta: ${def.getMessage(alert.payload)}`}
        style={{ minHeight: 36, padding: '8px 12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <CheckIcon />
        Resolver
      </button>
    </article>
  );
}

// ── AlertsPanel ────────────────────────────────────────────────────────────

export function AlertsPanel({ alerts, onResolve }: AlertsPanelProps): JSX.Element {
  if (alerts.length === 0) {
    return (
      <div className="t-empty" role="status" aria-live="polite" data-testid="alerts-empty">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mint-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3 style={{ margin: '8px 0 4px', color: 'var(--fg-1)' }}>Sin alertas pendientes</h3>
        <p style={{ margin: 0, color: 'var(--fg-2)', fontSize: 14 }}>Buen trabajo — el curso está al día.</p>
      </div>
    );
  }

  return (
    <section
      role="region"
      aria-label={`Alertas activas — ${alerts.length} sin resolver`}
      data-testid="alerts-panel"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alerts.map(alert => React.createElement(AlertItem, { key: alert.id, alert, onResolve }))}
      </div>
    </section>
  );
}
