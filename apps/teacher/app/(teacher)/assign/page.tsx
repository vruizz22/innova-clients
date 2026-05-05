'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  createApiClient,
  getAccessToken,
} from '@shared/api-client'
import { getPublicRuntimeConfig } from '@shared/runtime-config'

interface Student {
  id: string
  name: string
  hasAlert: boolean
}

interface Skill {
  id: string
  key: string
  name: string
  description: string
  itemCount: number
}

interface StudentWithInfo extends Student {
  selected: boolean
  fisherInfo?: number
}

type Step = 1 | 2 | 3

export default function AssignPracticePage(): JSX.Element {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [students, setStudents] = useState<StudentWithInfo[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [selectedSkill, setSelectedSkill] = useState<string>('')
  const [onlyWithAlerts, setOnlyWithAlerts] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const runtimeConfig = getPublicRuntimeConfig()
        const baseUrl = runtimeConfig.apiUrl
        const authClient = createApiClient({ baseUrl, getAccessToken })

        const studentsRes = await authClient.get('/classroom/students')
        const skillsRes = await authClient.get('/skills')

        const studentsData = (await studentsRes.json()) as Student[]
        const skillsData = (await skillsRes.json()) as Skill[]

        setStudents(
          studentsData.map((s) => ({
            ...s,
            selected: false,
          }))
        )
        setSkills(skillsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const handleStudentToggle = (id: string): void => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedStudents(newSelected)
  }

  const handleToggleAll = (): void => {
    if (selectedStudents.size === visibleStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(visibleStudents.map((s) => s.id)))
    }
  }

  const handleSubmit = async (): Promise<void> => {
    try {
      setSubmitting(true)
      const runtimeConfig = getPublicRuntimeConfig()
      const baseUrl = runtimeConfig.apiUrl
      const authClient = createApiClient({ baseUrl, getAccessToken })

      await authClient.post('/practice/assign', {
        studentIds: Array.from(selectedStudents),
        skillId: selectedSkill,
      })

      router.push('/teacher/classrooms')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar práctica')
      setSubmitting(false)
    }
  }

  const visibleStudents = onlyWithAlerts ? students.filter((s) => s.hasAlert) : students

  return (
    <main style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', minHeight: '100vh', padding: '32px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        .apw-card { background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); max-width: 600px; width: 100%; }
        .apw-header { background: linear-gradient(135deg, var(--sky-600) 0%, var(--sky-700) 100%); color: #fff; padding: 32px 28px; border-radius: 16px 16px 0 0; }
        .apw-step-indicator { display: flex; gap: 12px; margin-bottom: 16px; }
        .apw-step { width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .apw-step.active { background: #fff; color: var(--sky-600); }
        .apw-step.done { background: #d1fae5; color: #065f46; }
        .apw-title { font-size: 24px; font-weight: 700; margin: 0; }
        .apw-subtitle { font-size: 14px; opacity: 0.9; margin: 4px 0 0; }
        
        .apw-body { padding: 32px 28px; }
        .apw-section { display: none; }
        .apw-section.active { display: block; }
        
        /* Step 1 */
        .apw-filter-bar { display: flex; gap: 12px; margin-bottom: 20px; }
        .apw-checkbox { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
        .apw-checkbox input { cursor: pointer; }
        
        .apw-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
        .apw-list-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-2); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .apw-list-item:hover { background: var(--sky-50); }
        .apw-list-item.selected { background: var(--sky-100); }
        .apw-list-item input { cursor: pointer; }
        
        /* Step 2 */
        .apw-skills { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .apw-skill-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-2); border: 2px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .apw-skill-card:hover { border-color: var(--sky-300); background: var(--sky-50); }
        .apw-skill-card.selected { border-color: var(--sky-600); background: var(--sky-100); }
        .apw-skill-radio { cursor: pointer; }
        .apw-skill-name { font-weight: 600; }
        .apw-skill-desc { font-size: 13px; color: var(--fg-2); margin: 4px 0 0; }
        
        /* Step 3 */
        .apw-review { display: flex; flex-direction: column; gap: 16px; }
        .apw-review-item { padding: 12px; background: var(--bg-2); border-radius: 8px; }
        .apw-review-label { font-size: 11px; text-transform: uppercase; color: var(--fg-3); font-weight: 600; margin-bottom: 4px; }
        .apw-review-value { font-weight: 600; }
        
        /* Footer */
        .apw-footer { padding: 20px 28px; background: var(--bg-2); border-radius: 0 0 16px 16px; display: flex; gap: 12px; }
        .apw-btn { padding: 10px 20px; border-radius: 8px; border: none; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .apw-btn-secondary { background: var(--border); color: var(--fg-1); }
        .apw-btn-secondary:hover { background: var(--bg-1); }
        .apw-btn-primary { background: var(--sky-600); color: #fff; flex: 1; }
        .apw-btn-primary:hover:not(:disabled) { background: var(--sky-700); }
        .apw-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="apw-card">
        <div className="apw-header">
          <div className="apw-step-indicator">
            <div className={`apw-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`apw-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`apw-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
          <h1 className="apw-title">
            {step === 1 && 'Selecciona alumnos'}
            {step === 2 && 'Elige habilidad'}
            {step === 3 && 'Revisa'}
          </h1>
          <p className="apw-subtitle">
            {step === 1 && `${selectedStudents.size} alumno${selectedStudents.size !== 1 ? 's' : ''} seleccionado${selectedStudents.size !== 1 ? 's' : ''}`}
            {step === 2 && 'Selecciona la habilidad a practicar'}
            {step === 3 && 'Revisa los detalles antes de asignar'}
          </p>
        </div>

        <div className="apw-body">
          {error && <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', marginBottom: '16px' }}>{error}</div>}

          {/* Step 1: Student Selection */}
          <div className={`apw-section ${step === 1 ? 'active' : ''}`}>
            <div className="apw-filter-bar">
              <label className="apw-checkbox">
                <input
                  type="checkbox"
                  checked={onlyWithAlerts}
                  onChange={(e) => setOnlyWithAlerts(e.target.checked)}
                />
                Solo con alertas
              </label>
            </div>
            <div className="apw-list">
              <label className="apw-checkbox" style={{ padding: '8px 12px', background: 'var(--bg-2)', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  checked={selectedStudents.size === visibleStudents.length}
                  onChange={handleToggleAll}
                />
                <strong>Seleccionar todos ({visibleStudents.length})</strong>
              </label>
              {visibleStudents.map((student) => (
                <div
                  key={student.id}
                  className={`apw-list-item ${selectedStudents.has(student.id) ? 'selected' : ''}`}
                  onClick={() => handleStudentToggle(student.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{student.name}</span>
                  {student.hasAlert && <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>⚠️ Alerta</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Skill Selection */}
          <div className={`apw-section ${step === 2 ? 'active' : ''}`}>
            <div className="apw-skills">
              {skills.map((skill) => (
                <label
                  key={skill.id}
                  className={`apw-skill-card ${selectedSkill === skill.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="skill"
                    value={skill.id}
                    checked={selectedSkill === skill.id}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                  />
                  <div>
                    <div className="apw-skill-name">{skill.name}</div>
                    <div className="apw-skill-desc">{skill.description}</div>
                    <div style={{ fontSize: '11px', color: 'var(--fg-3)', marginTop: '4px' }}>
                      {skill.itemCount} ejercicios
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Review */}
          <div className={`apw-section ${step === 3 ? 'active' : ''}`}>
            <div className="apw-review">
              <div className="apw-review-item">
                <div className="apw-review-label">Alumnos</div>
                <div className="apw-review-value">{selectedStudents.size} seleccionado{selectedStudents.size !== 1 ? 's' : ''}</div>
              </div>
              <div className="apw-review-item">
                <div className="apw-review-label">Habilidad</div>
                <div className="apw-review-value">{skills.find((s) => s.id === selectedSkill)?.name}</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--sky-50)', borderRadius: '8px', border: '1px solid var(--sky-200)', fontSize: '13px', color: 'var(--sky-900)' }}>
                Se asignarán ejercicios seleccionados adaptativamente basados en el desempeño de cada alumno.
              </div>
            </div>
          </div>
        </div>

        <div className="apw-footer">
          {step > 1 && (
            <button className="apw-btn apw-btn-secondary" onClick={() => setStep((s) => (s - 1) as Step)}>
              ← Atrás
            </button>
          )}
          {step < 3 && (
            <button
              className="apw-btn apw-btn-primary"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={step === 1 ? selectedStudents.size === 0 : step === 2 ? !selectedSkill : false}
            >
              Siguiente →
            </button>
          )}
          {step === 3 && (
            <button
              className="apw-btn apw-btn-primary"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? 'Asignando...' : `Asignar a ${selectedStudents.size} alumno${selectedStudents.size !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
