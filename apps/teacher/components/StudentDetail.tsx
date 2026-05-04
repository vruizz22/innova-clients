'use client';

import type { AttemptHistory, ErrorFrequency } from '../lib/types';

interface StudentDetailProps {
  studentId: string;
  studentName: string;
  attempts: AttemptHistory[];
  errorFrequency: ErrorFrequency[];
  onBack: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────

const ERROR_TYPE_LABELS: Record<string, string> = {
  BORROW_OMITTED_TENS: 'Olvido de préstamo (decenas)',
  PLACE_VALUE_ERROR:   'Error de valor posicional',
  OPERATOR_CONFUSION:  'Confusión de operador',
  CARRY_FORGOTTEN:     'Acarreo olvidado',
  DIGIT_REVERSAL:      'Dígitos invertidos',
};

function humanizeError(errorType: string): string {
  return ERROR_TYPE_LABELS[errorType] ?? errorType.replace(/_/g, ' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mastery-strong)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mastery-weak)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

interface ErrorFrequencyChartProps {
  data: ErrorFrequency[];
}

function ErrorFrequencyChart({ data }: ErrorFrequencyChartProps): JSX.Element {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const top5 = data.slice(0, 5);

  return (
    <div data-testid="error-frequency-chart" role="list" aria-label="Frecuencia de errores">
      {top5.map(item => (
        <div
          key={item.errorType}
          className="t-bar"
          role="listitem"
          aria-label={`${humanizeError(item.errorType)}: ${item.count} veces`}
          data-testid="error-bar"
          data-error-type={item.errorType}
        >
          <span className="t-bar-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <code className="t-code" title={item.errorType}>{item.errorType}</code>
          </span>
          <span className="t-bar-track" role="presentation">
            <span
              className="t-bar-fill"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </span>
          <span className="t-bar-num math">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

interface AttemptTableProps {
  attempts: AttemptHistory[];
}

function AttemptTable({ attempts }: AttemptTableProps): JSX.Element {
  if (attempts.length === 0) {
    return (
      <p style={{ color: 'var(--fg-2)', fontSize: 14, fontStyle: 'italic' }}>
        Sin intentos registrados.
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }} data-testid="attempt-history-table">
      <table
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-body-sm)' }}
        aria-label="Historial de intentos"
      >
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            {['Fecha', 'Problema', 'Respuesta', 'Error detectado', 'Fuente'].map(col => (
              <th
                key={col}
                scope="col"
                style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--fg-2)', fontSize: 12, letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attempts.map(attempt => (
            <tr
              key={attempt.id}
              data-testid="attempt-row"
              data-attempt-id={attempt.id}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {/* Fecha */}
              <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--fg-2)', fontSize: 12 }}>
                {formatDate(attempt.createdAt)}
              </td>

              {/* Problema */}
              <td style={{ padding: '10px 12px' }}>
                <code className="t-code" style={{ fontSize: 13 }}>{attempt.itemContent.problem}</code>
              </td>

              {/* Respuesta */}
              <td style={{ padding: '10px 12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {attempt.isCorrect ? <CheckIcon /> : <XIcon />}
                  <span
                    style={{
                      fontWeight: 600,
                      color: attempt.isCorrect ? 'var(--mastery-strong)' : 'var(--mastery-weak)',
                    }}
                  >
                    {attempt.finalAnswer}
                  </span>
                </span>
              </td>

              {/* Error detectado */}
              <td style={{ padding: '10px 12px' }}>
                {attempt.errorType ? (
                  <span
                    style={{
                      background: 'var(--error-bg)',
                      color: 'var(--error-fg)',
                      padding: '2px 8px',
                      borderRadius: 'var(--r-pill)',
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                    title={attempt.errorType}
                    data-testid="error-badge"
                  >
                    {humanizeError(attempt.errorType)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--fg-3)', fontSize: 12 }}>—</span>
                )}
              </td>

              {/* Fuente */}
              <td style={{ padding: '10px 12px' }}>
                <span
                  style={{
                    background: attempt.classifierSource === 'llm' ? '#EDE9FE' : '#DCEDF6',
                    color:      attempt.classifierSource === 'llm' ? '#5B21B6' : 'var(--info-fg)',
                    padding: '2px 8px',
                    borderRadius: 'var(--r-pill)',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                  title={`${attempt.classifierSource}${attempt.confidence != null ? ` (conf. ${(attempt.confidence * 100).toFixed(0)}%)` : ''}`}
                  data-testid="source-badge"
                >
                  {attempt.classifierSource === 'llm' ? 'LLM' : 'Regla'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── StudentDetail ──────────────────────────────────────────────────────────

export function StudentDetail({ studentId, studentName, attempts, errorFrequency, onBack }: StudentDetailProps): JSX.Element {
  const totalAttempts = attempts.length;
  const correctCount  = attempts.filter(a => a.isCorrect).length;
  const accuracyPct   = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  return (
    <div data-testid="student-detail" data-student-id={studentId}>
      {/* Back button */}
      <button
        className="btn btn-ghost"
        onClick={onBack}
        data-testid="back-btn"
        aria-label="Volver al dashboard"
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: '8px 12px', color: 'var(--fg-2)' }}
      >
        <BackIcon />
        Volver al resumen
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-2)' }}>
            Alumno
          </p>
          <h1 className="t-h1" style={{ margin: 0 }} data-testid="student-name">
            {studentName}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="card" style={{ padding: '12px 20px', textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-2)', marginBottom: 4 }}>Intentos</div>
            <div className="math" style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg-1)' }}>{totalAttempts}</div>
          </div>
          <div className="card" style={{ padding: '12px 20px', textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-2)', marginBottom: 4 }}>Precisión</div>
            <div className="math" style={{ fontSize: 24, fontWeight: 700, color: accuracyPct >= 70 ? 'var(--mastery-strong)' : accuracyPct >= 40 ? 'var(--mastery-medium)' : 'var(--mastery-weak)' }}>
              {accuracyPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Error frequency */}
      {errorFrequency.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="t-h2" style={{ margin: '0 0 16px' }}>Errores frecuentes</h2>
          <ErrorFrequencyChart data={errorFrequency} />
        </div>
      )}

      {/* Attempt history */}
      <div className="card">
        <h2 className="t-h2" style={{ margin: '0 0 16px' }}>Historial de intentos</h2>
        <AttemptTable attempts={attempts} />
      </div>

      {/* Practice assignment CTA */}
      <div style={{ marginTop: 24 }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          data-testid="assign-practice-btn"
          aria-label={`Asignar práctica focalizada a ${studentName}`}
          onClick={() => {/* TODO: wire to API */}}
        >
          Asignar práctica focalizada
        </button>
        <p className="t-caption" style={{ marginTop: 8, textAlign: 'center' }}>
          15 problemas de la habilidad más débil · ~10 min
        </p>
      </div>
    </div>
  );
}
