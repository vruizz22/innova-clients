'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMe, getMastery, getItems, getMyStudentClassrooms, type MasteryRecord, type UserProfile, type PracticeItem } from '@/lib/api'
import { clearStoredSession } from '@shared/auth-session'

type Tab = 'home' | 'progress' | 'me'

const SKILL_NAMES: Record<string, string> = {
  subtraction_borrow: 'Resta con reserva',
  addition_carry: 'Suma con llevadas',
  multiplication_table: 'Tablas de multiplicar',
  long_division: 'División larga',
}

const pkColor = (p: number) =>
  p >= 0.7 ? 'var(--mint-500)' : p >= 0.4 ? 'var(--mastery-medium,#E8A33D)' : 'var(--mastery-weak,#D86060)'

export default function StudentDashboard(): JSX.Element {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('home')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [mastery, setMastery] = useState<MasteryRecord[]>([])
  const [items, setItems] = useState<PracticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [profile, itemList, classrooms] = await Promise.all([
          getMe(),
          getItems({ limit: 10 }),
          getMyStudentClassrooms().catch(() => []),
        ])
        setUser(profile.user)
        setItems(itemList)
        if (profile.user.profileId) {
          const m = await getMastery(profile.user.profileId).catch(() => [])
          setMastery(m)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const firstName = user?.email?.split('@')[0] ?? 'Alumno'
  const initials = firstName.slice(0, 2).toUpperCase()

  function handleLogout(): void {
    clearStoredSession()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--bg-student,#EEF7FC)' }}>
        <p style={{ color: 'var(--fg-2)' }}>Cargando...</p>
      </div>
    )
  }

  return (
    <div data-screen-label="Practice web · Dashboard">
      {/* ── Nav ── */}
      <nav className="pr-nav">
        <div className="pr-logo">
          <div className="mark">SP</div>
          Super<span style={{ color: 'var(--sky-500)' }}>Profes</span>
        </div>
        <div className="pr-tabs">
          {(['home', 'progress', 'me'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`pr-tab ${tab === t ? 'is-active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'home' ? 'Inicio' : t === 'progress' ? 'Progreso' : 'Mi perfil'}
            </button>
          ))}
        </div>
        <div className="pr-avatar">{initials}</div>
      </nav>

      <div className="pr-shell">
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 14, color: '#7A2E2E', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* ── HOME ── */}
        {tab === 'home' && (
          <div data-screen-label="Practice web · Home">
            <div className="pr-greeting">
              <h1>Hola, {firstName}</h1>
              <p>Tienes {items.length} ejercicios disponibles hoy.</p>
            </div>
            <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--fg-2)' }}>
              Practicar ahora
            </div>
            {items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="pr-lesson"
                onClick={() => router.push(`/practice/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="ico">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                </div>
                <div>
                  <div className="nm">{SKILL_NAMES[item.skillKey] ?? item.skillLabel ?? item.skillKey}</div>
                  <div className="sub">{item.content.problem} · POST /attempts</div>
                </div>
                <span className="pr-badge">Practicar</span>
              </div>
            ))}
            {items.length === 0 && (
              <p style={{ color: 'var(--fg-2)', padding: 16 }}>No hay ejercicios disponibles por ahora.</p>
            )}

            {/* Scan CTA */}
            <div
              className="pr-scan"
              onClick={() => router.push('/scan')}
              style={{ cursor: 'pointer', marginTop: 16 }}
            >
              <div className="ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              </div>
              <div>
                <div className="nm">Escanear hoja de ejercicios</div>
                <div className="sub">POST /attempts/ocr-extract · Gemini 2.0 Flash</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        )}

        {/* ── PROGRESO ── */}
        {tab === 'progress' && (
          <div data-screen-label="Practice web · Progress">
            <h2 style={{ margin: '0 0 16px', fontSize: 20 }}>Mi progreso</h2>
            {mastery.length > 0 ? (
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '0 16px' }}>
                {mastery.map((s) => {
                  const c = pkColor(s.pKnown)
                  return (
                    <div key={s.skillKey} className="pr-mastery-row">
                      <span className="nm">{SKILL_NAMES[s.skillKey] ?? s.skillLabel ?? s.skillKey}</span>
                      <div className="bar">
                        <span className="fill" style={{ width: `${s.pKnown * 100}%`, background: c }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'ui-monospace,monospace', fontWeight: 700, color: c, width: 36, textAlign: 'right' }}>
                        {Math.round(s.pKnown * 100)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--fg-2)' }}>Aún no tienes progreso registrado. ¡Completa algunos ejercicios!</p>
            )}
          </div>
        )}

        {/* ── MI PERFIL ── */}
        {tab === 'me' && user && (
          <div data-screen-label="Practice web · Me">
            <h2 style={{ margin: '0 0 16px', fontSize: 20 }}>Mi perfil · GET /auth/me</h2>
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: 9999, background: 'var(--sky-100)', color: 'var(--sky-700)', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{user.email}</div>
                  <span style={{ padding: '3px 10px', borderRadius: 9999, background: 'var(--sky-100)', color: 'var(--sky-800)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    alumno
                  </span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '0' }}>
                {[
                  { k: 'Correo', v: user.email },
                  { k: 'Rol', v: user.role },
                  { k: 'ID', v: user.id },
                ].map((kv) => (
                  <div key={kv.k} className="pr-me-kv">
                    <span style={{ color: 'var(--fg-2)', fontWeight: 600 }}>{kv.k}</span>
                    <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13 }}>{kv.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button
                  onClick={handleLogout}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 0, background: 'var(--mastery-weak,#D86060)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pr-nav { position:sticky; top:0; z-index:20; background:rgba(240,247,251,.94); backdrop-filter:blur(10px); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:16px; padding:0 24px; height:58px; }
        .pr-logo { font-weight:700; font-size:15px; color:var(--fg-1); display:flex; align-items:center; gap:8px; }
        .pr-logo .mark { width:30px; height:30px; border-radius:8px; background:var(--sky-600,#2887B0); display:grid; place-items:center; color:#fff; font-weight:800; font-size:12px; }
        .pr-tabs { display:flex; gap:4px; flex:1; justify-content:center; }
        .pr-tab { padding:8px 16px; border-radius:8px; border:0; background:transparent; font:inherit; font-size:14px; font-weight:600; cursor:pointer; color:var(--fg-2); }
        .pr-tab.is-active { background:var(--sky-100); color:var(--sky-800); }
        .pr-avatar { width:32px; height:32px; border-radius:9999px; background:var(--sky-400,#3FA7D6); color:#fff; display:grid; place-items:center; font-weight:700; font-size:12px; }
        .pr-shell { max-width:800px; margin:0 auto; padding:28px 20px 60px; }
        .pr-greeting { margin-bottom:20px; }
        .pr-greeting h1 { margin:0 0 4px; font-size:28px; font-weight:700; letter-spacing:-.02em; }
        .pr-greeting p { margin:0; color:var(--fg-2); font-size:15px; }
        .pr-lesson { display:flex; align-items:center; gap:14px; padding:16px; background:#fff; border:1px solid var(--border); border-radius:14px; transition:box-shadow .15s; }
        .pr-lesson:hover { box-shadow:0 4px 12px rgba(0,0,0,.1); }
        .pr-lesson + .pr-lesson { margin-top:10px; }
        .pr-lesson .ico { width:44px; height:44px; border-radius:12px; background:var(--sky-100); color:var(--sky-700); display:grid; place-items:center; flex-shrink:0; }
        .pr-lesson .nm { font-weight:700; font-size:15px; }
        .pr-lesson .sub { font-size:13px; color:var(--fg-2); }
        .pr-badge { padding:3px 10px; border-radius:9999px; font-size:11px; font-weight:700; background:var(--sky-500,#3FA7D6); color:#fff; margin-left:auto; white-space:nowrap; }
        .pr-scan { display:flex; align-items:center; gap:14px; padding:16px; background:linear-gradient(135deg,var(--sky-700,#1E6FA5),var(--sky-800,#15537C)); border-radius:14px; color:#fff; }
        .pr-scan .ico { width:44px; height:44px; border-radius:12px; background:rgba(255,255,255,.15); display:grid; place-items:center; flex-shrink:0; }
        .pr-scan .nm { font-weight:700; font-size:15px; }
        .pr-scan .sub { font-size:13px; opacity:.8; }
        .pr-mastery-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border); }
        .pr-mastery-row:last-child { border-bottom:0; }
        .pr-mastery-row .nm { flex:1; font-weight:600; }
        .pr-mastery-row .bar { flex:2; height:8px; background:var(--slate-100); border-radius:9999px; overflow:hidden; }
        .pr-mastery-row .fill { height:100%; border-radius:9999px; display:block; }
        .pr-me-kv { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border); font-size:14px; }
        .pr-me-kv:last-child { border-bottom:0; }
      `}</style>
    </div>
  )
}
