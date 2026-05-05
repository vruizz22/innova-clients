'use client'

import { useEffect, useMemo, useState } from 'react'
import { AuthGuard } from '@shared/auth-guard'
import { getAccessToken, clearStoredSession } from '@shared/auth-session'
import { getPublicRuntimeConfig } from '@shared/runtime-config'
import { createApiClient } from '@shared/api-client'
import type { MasteryState } from '@shared/api-client'

const PARENT_ROLES = ['parent'] as const

const SKILL_NAMES: Record<string, string> = {
  subtraction_borrow: 'Resta con reserva',
  addition_carry: 'Suma con llevadas',
  multiplication_table: 'Tablas de multiplicar',
  long_division: 'División larga',
  fractions_same_denom: 'Fracciones mismo denom.',
  fractions_diff_denom: 'Fracciones denom. dist.',
}

const pkColor = (p: number) =>
  p >= 0.7
    ? { fill: 'var(--mint-500)', text: 'var(--mint-700)' }
    : p >= 0.4
      ? { fill: 'var(--mastery-medium,#E8A33D)', text: '#7A4F00' }
      : { fill: 'var(--mastery-weak,#D86060)', text: '#7A2E2E' }

const masteryWord = (p: number) =>
  p >= 0.7 ? 'Va bien' : p >= 0.4 ? 'En proceso' : 'Necesita apoyo'

type Tab = 'summary' | 'supervise' | 'me'

interface UserProfile {
  id: string
  email: string
  role: string
  profileId?: string
}

function ParentDashboardContent(): JSX.Element {
  const runtimeConfig = getPublicRuntimeConfig()
  const apiClient = useMemo(
    () => createApiClient({ baseUrl: runtimeConfig.apiUrl, getAccessToken }),
    [runtimeConfig.apiUrl],
  )

  const [skills, setSkills] = useState<MasteryState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('summary')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [notif, setNotif] = useState(true)
  const [photo, setPhoto] = useState(false)
  const [weekly, setWeekly] = useState(true)
  const [alertToggle, setAlertToggle] = useState(true)

  useEffect(() => {
    async function loadProgress(): Promise<void> {
      setLoading(true)
      setError('')
      try {
        const profile = await apiClient.me()
        setUser(profile.user as UserProfile)
        const studentId = profile.user.profileId
        if (!studentId) {
          // Fallback for demo: use seed student
          try {
            const mastery = await apiClient.getMastery('seed-student-001')
            setSkills(mastery)
          } catch {
            setError('No hay ningún alumno vinculado a tu cuenta de apoderado.')
          }
          setLoading(false)
          return
        }
        try {
          const mastery = await apiClient.getMastery(studentId)
          setSkills(mastery)
        } catch {
          // Fallback for demo: parent profileId may differ from studentId
          const mastery = await apiClient.getMastery('seed-student-001')
          setSkills(mastery)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la información')
      } finally {
        setLoading(false)
      }
    }
    void loadProgress()
  }, [apiClient])

  const avgMastery =
    skills.length > 0 ? skills.reduce((sum, s) => sum + s.pKnown, 0) / skills.length : 0
  const atRisk = skills.filter((s) => s.pKnown < 0.4).length
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'PA'

  function handleLogout(): void {
    clearStoredSession()
    window.location.href = '/login'
  }

  return (
    <div data-screen-label="Parent web · dashboard">
      {/* ── Nav ── */}
      <nav className="pa-nav">
        <div className="pa-logo">
          <div className="mark">SP</div>
          <span>Super<span style={{ color: 'var(--mint-500)' }}>Profes</span></span>
        </div>
        <div className="pa-tabs">
          {(['summary', 'supervise', 'me'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`pa-tab ${tab === t ? 'is-active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'summary' ? 'Resumen' : t === 'supervise' ? 'Supervisión' : 'Mi perfil'}
            </button>
          ))}
        </div>
        <div className="pa-actions">
          <button
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <div className="pa-avatar">{initials}</div>
        </div>
      </nav>

      <div className="pa-shell">
        {loading && <p style={{ color: 'var(--fg-3)', padding: 32 }}>Cargando información...</p>}

        {!loading && error && (
          <div role="alert" style={{
            padding: 16, background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 12, color: '#7A2E2E', marginBottom: 24,
          }}>
            {error}
          </div>
        )}

        {/* ── RESUMEN ── */}
        {!loading && !error && tab === 'summary' && (
          <>
            <div className="pa-hero">
              <div>
                <h1>Hola, apoderado/a</h1>
                <p>Tu hijo/a · {skills.length} habilidades monitoreadas</p>
              </div>
              <div className="pa-hero-stats">
                <div className="pa-hero-stat">
                  <div className="v">{Math.round(avgMastery * 100)}%</div>
                  <div className="l">dominio promedio</div>
                </div>
                <div className="pa-hero-stat">
                  <div className="v">{atRisk}</div>
                  <div className="l">necesitan apoyo</div>
                </div>
              </div>
            </div>

            <div className="pa-grid">
              <div className="pa-card span2">
                <h3>Dominio por habilidad · GET /mastery/:studentId</h3>
                {skills.map((s) => {
                  const c = pkColor(s.pKnown)
                  const label = SKILL_NAMES[s.skillKey] ?? s.skillLabel ?? s.skillKey
                  return (
                    <div key={s.skillKey} className="pa-skill">
                      <span className="nm">{label}</span>
                      <div className="bar">
                        <span className="fill" style={{ width: `${s.pKnown * 100}%`, background: c.fill }} />
                      </div>
                      <span className="pct" style={{ color: c.text }}>{Math.round(s.pKnown * 100)}%</span>
                      <span style={{ fontSize: 12, color: c.text }}>{masteryWord(s.pKnown)}</span>
                    </div>
                  )
                })}
                {skills.length === 0 && (
                  <p style={{ color: 'var(--fg-2)', fontSize: 14 }}>
                    Tu hijo/a aún no tiene actividad registrada.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── SUPERVISIÓN ── */}
        {!loading && tab === 'supervise' && (
          <div className="pa-card" style={{ maxWidth: 560 }}>
            <h3>Configuración de supervisión</h3>
            {[
              { lab: 'Notificaciones push', sub: 'Avisos cuando el profesor activa una alerta', v: notif, set: setNotif },
              { lab: 'Autorizo subida de fotos', sub: 'Hojas escaneadas — anonimizadas y eliminadas a 30 días', v: photo, set: setPhoto },
              { lab: 'Resumen semanal', sub: 'Email los viernes con el progreso de la semana', v: weekly, set: setWeekly },
              { lab: 'Alertas de riesgo', sub: 'Aviso inmediato si el dominio cae bajo 0.4', v: alertToggle, set: setAlertToggle },
            ].map((ctrl) => (
              <div key={ctrl.lab} className="pa-ctrl">
                <div>
                  <div className="lab">{ctrl.lab}</div>
                  <div className="sub">{ctrl.sub}</div>
                </div>
                <button
                  className={`toggle ${ctrl.v ? 'on' : ''}`}
                  onClick={() => ctrl.set((v: boolean) => !v)}
                  aria-pressed={ctrl.v}
                />
              </div>
            ))}
            <div style={{ marginTop: 14, padding: 12, background: 'var(--slate-50)', borderRadius: 10, fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.6 }}>
              Todos los datos se tratan bajo <strong>Ley 19.628</strong> y <strong>COPPA</strong>. Puedes revocar cualquier permiso aquí.
            </div>
          </div>
        )}

        {/* ── MI PERFIL ── */}
        {!loading && tab === 'me' && user && (
          <div className="pa-card" style={{ maxWidth: 560 }}>
            <h3>Mi perfil · GET /auth/me</h3>
            <div className="pa-me">
              <div className="pa-me-av">{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.email}</div>
                <span style={{ padding: '3px 10px', borderRadius: 9999, background: 'var(--mint-100)', color: 'var(--mint-700)', fontSize: 11, fontWeight: 700 }}>
                  APODERADO
                </span>
              </div>
            </div>
            <div style={{ marginTop: 16, background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '0 16px' }}>
              {[
                { k: 'Correo', v: user.email },
                { k: 'Rol', v: user.role },
                { k: 'ID', v: user.id },
              ].map((kv) => (
                <div key={kv.k} className="pa-me-kv">
                  <span className="k">{kv.k}</span>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13 }}>{kv.v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <button
                onClick={handleLogout}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 0, background: 'var(--mastery-weak,#D86060)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pa-nav { position:sticky; top:0; z-index:20; background:rgba(255,255,255,.94); backdrop-filter:blur(10px); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:16px; padding:0 28px; height:60px; }
        .pa-logo { display:flex; align-items:center; gap:8px; font-weight:700; font-size:16px; color:var(--slate-900); }
        .pa-logo .mark { width:32px; height:32px; border-radius:9px; background:var(--mint-500); display:grid; place-items:center; color:#fff; font-weight:800; font-size:13px; }
        .pa-tabs { display:flex; gap:4px; flex:1; justify-content:center; }
        .pa-tab { padding:8px 18px; border-radius:8px; border:0; background:transparent; font:inherit; font-size:14px; font-weight:600; cursor:pointer; color:var(--fg-2); }
        .pa-tab.is-active { background:var(--mint-50); color:var(--mint-700); }
        .pa-actions { display:flex; align-items:center; gap:10px; }
        .pa-avatar { width:34px; height:34px; border-radius:9999px; background:var(--mint-400); color:#fff; display:grid; place-items:center; font-weight:700; font-size:13px; }
        .pa-shell { max-width:1100px; margin:0 auto; padding:28px 24px 60px; }
        .pa-hero { background:linear-gradient(135deg,var(--mint-600,#2ba37a) 0%,var(--mint-800,#1a6b50) 100%); border-radius:20px; padding:28px 32px; color:#fff; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; margin-bottom:24px; }
        .pa-hero h1 { margin:0 0 4px; font-size:26px; font-weight:700; letter-spacing:-.01em; }
        .pa-hero p { margin:0; font-size:14px; opacity:.8; }
        .pa-hero-stats { display:flex; gap:24px; flex-wrap:wrap; }
        .pa-hero-stat { text-align:center; }
        .pa-hero-stat .v { font-size:28px; font-weight:700; font-family:ui-monospace,monospace; }
        .pa-hero-stat .l { font-size:11px; opacity:.7; }
        .pa-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .pa-card { background:#fff; border:1px solid var(--border); border-radius:14px; padding:20px; }
        .pa-card h3 { margin:0 0 14px; font-size:13px; text-transform:uppercase; letter-spacing:.05em; color:var(--fg-2); font-weight:700; }
        .span2 { grid-column:span 2; }
        .pa-skill { display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid var(--border); }
        .pa-skill:last-child { border-bottom:0; }
        .pa-skill .nm { flex:1; font-size:14px; font-weight:600; }
        .pa-skill .bar { flex:2; height:8px; background:var(--slate-100); border-radius:9999px; overflow:hidden; }
        .pa-skill .fill { height:100%; border-radius:9999px; display:block; }
        .pa-skill .pct { font-size:12px; font-family:ui-monospace,monospace; font-weight:700; width:36px; text-align:right; }
        .pa-ctrl { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border); }
        .pa-ctrl:last-child { border-bottom:0; }
        .pa-ctrl .lab { font-weight:600; font-size:14px; }
        .pa-ctrl .sub { font-size:12px; color:var(--fg-2); }
        .toggle { position:relative; width:44px; height:24px; background:var(--slate-200); border-radius:9999px; cursor:pointer; flex-shrink:0; transition:background .2s; border:0; }
        .toggle.on { background:var(--mint-500); }
        .toggle::after { content:''; position:absolute; top:2px; left:2px; width:20px; height:20px; background:#fff; border-radius:9999px; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
        .toggle.on::after { transform:translateX(20px); }
        .pa-me { display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; }
        .pa-me-av { width:72px; height:72px; border-radius:9999px; background:var(--mint-100); color:var(--mint-700); display:grid; place-items:center; font-size:24px; font-weight:700; flex-shrink:0; }
        .pa-me-kv { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid var(--border); font-size:14px; }
        .pa-me-kv:last-child { border-bottom:0; }
        .pa-me-kv .k { color:var(--fg-2); font-weight:600; }
        @media(max-width:860px) { .pa-grid { grid-template-columns:1fr; } .span2 { grid-column:span 1; } }
      `}</style>
    </div>
  )
}

export default function ParentDashboardPage(): JSX.Element {
  return (
    <AuthGuard allowedRoles={PARENT_ROLES} loginPath="/login">
      <ParentDashboardContent />
    </AuthGuard>
  )
}
