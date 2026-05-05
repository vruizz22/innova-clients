import React from 'react';

type AlertType = 'AT_RISK_SKILL' | 'COMMON_ERROR_DETECTED' | 'STUDENT_DROP';

interface AlertCardProps {
  alertType: AlertType;
  title: string;
  description?: string;
  createdAt?: string;
  onResolve?: () => void;
  resolved?: boolean;
  className?: string;
}

const alertConfig: Record<
  AlertType,
  { border: string; bg: string; badgeText: string; badgeBg: string; badgeColor: string; icon: string }
> = {
  AT_RISK_SKILL: {
    border: '#f5b8b8',
    bg: '#fff8f8',
    badgeText: 'En riesgo',
    badgeBg: '#fce8e8',
    badgeColor: '#7a1a1a',
    icon: '⚠️',
  },
  COMMON_ERROR_DETECTED: {
    border: '#F0D9A0',
    bg: '#FFFBF0',
    badgeText: 'Error común',
    badgeBg: '#FFF4DB',
    badgeColor: '#7A4F00',
    icon: '🔍',
  },
  STUDENT_DROP: {
    border: '#CDD3DD',
    bg: '#F7F8FA',
    badgeText: 'Caída de actividad',
    badgeBg: '#E5E9F0',
    badgeColor: '#232C3A',
    icon: '📉',
  },
};

export function AlertCard({
  alertType,
  title,
  description,
  createdAt,
  onResolve,
  resolved = false,
  className = '',
}: AlertCardProps): JSX.Element {
  const cfg = alertConfig[alertType];

  return (
    <div
      className={['rounded-2xl border p-4 flex gap-3', resolved ? 'opacity-50' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}
    >
      <span className="text-xl leading-none mt-0.5" aria-hidden="true">
        {cfg.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#1F2937]">{title}</p>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: cfg.badgeBg,
              color: cfg.badgeColor,
              borderColor: cfg.border,
            }}
          >
            {cfg.badgeText}
          </span>
        </div>
        {description ? (
          <p className="mt-1 text-xs text-[#4F5868]">{description}</p>
        ) : null}
        <div className="mt-2 flex items-center justify-between">
          {createdAt ? (
            <span className="text-[11px] text-[#717A8B]">
              {new Date(createdAt).toLocaleDateString('es-CL')}
            </span>
          ) : null}
          {onResolve && !resolved ? (
            <button
              onClick={onResolve}
              className="text-xs text-[#3FA7D6] font-semibold hover:text-[#2F8DBA] transition-colors"
            >
              Resolver
            </button>
          ) : null}
          {resolved ? (
            <span className="text-xs text-[#3DAA72] font-semibold">✓ Resuelta</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
