'use client';

import { useMemo, useState } from 'react';
import {
  GradeBandSelector,
  HeatmapCollapsedByUnit,
  type HeatmapStudentRow,
  type HeatmapUnit,
} from '@innova/ui';
import { GRADE_BANDS, gradeLabel, type Grade } from '@innova/error-catalog';

// Mock courses/heatmap until GET /teacher/courses + /heatmap-by-unit are wired (v8 C2.4).
interface Course {
  id: string;
  name: string;
  bandCode: string;
  grade: Grade;
  students: number;
  attemptsWeek: number;
  alerts: number;
}

const COURSES: Course[] = [
  { id: 'c1', name: '3°A Matemática', bandCode: 'BASICA_BAJA', grade: 'G3', students: 28, attemptsWeek: 142, alerts: 3 },
  { id: 'c2', name: '6°B Matemática', bandCode: 'BASICA_ALTA', grade: 'G6', students: 31, attemptsWeek: 98, alerts: 1 },
  { id: 'c3', name: '8°A Matemática', bandCode: 'SEPTIMO_OCTAVO', grade: 'G8', students: 26, attemptsWeek: 120, alerts: 2 },
  { id: 'c4', name: '1° medio B Matemática', bandCode: 'MEDIA_1_2', grade: 'G9', students: 34, attemptsWeek: 76, alerts: 4 },
];

const UNITS: HeatmapUnit[] = [
  { code: 'U1', name_es: 'Números' },
  { code: 'U2', name_es: 'Operatoria' },
  { code: 'U3', name_es: 'Fracciones' },
  { code: 'U4', name_es: 'Geometría' },
  { code: 'U5', name_es: 'Datos' },
];

function mockStudents(seed: number): HeatmapStudentRow[] {
  const names = ['Antonia F.', 'Benjamín S.', 'Catalina P.', 'Diego V.', 'Emilia R.', 'Felipe N.'];
  return names.map((studentName, i) => ({
    studentId: `s${seed}-${i}`,
    studentName,
    cells: Object.fromEntries(
      UNITS.map((u, j) => [u.code, Math.round((((i + 1) * (j + 2) * (seed + 3)) % 10) / 10 * 100) / 100]),
    ),
  }));
}

export default function TeacherDashboardPage(): JSX.Element {
  const [band, setBand] = useState<string>('BASICA_BAJA');
  const [courseId, setCourseId] = useState<string | null>(null);

  const bandsWithCourses = useMemo(
    () => GRADE_BANDS.filter((b) => COURSES.some((c) => c.bandCode === b.code)),
    [],
  );
  const courses = COURSES.filter((c) => c.bandCode === band);
  const course = COURSES.find((c) => c.id === courseId) ?? null;
  const students = useMemo(() => (course ? mockStudents(course.grade.length) : []), [course]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis cursos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Navega por banda de grado y abre el heatmap por unidad.
          </p>
        </div>
        <GradeBandSelector
          value={band}
          onChange={(c) => {
            setBand(c);
            setCourseId(null);
          }}
          bands={bandsWithCourses}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <button
            key={c.id}
            onClick={() => setCourseId(c.id === courseId ? null : c.id)}
            className={[
              'rounded-xl border bg-white p-5 text-left shadow-card transition',
              c.id === courseId ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-slate-100 hover:border-sky-300',
            ].join(' ')}
          >
            <p className="text-base font-bold text-slate-900">{c.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{gradeLabel(c.grade)}</p>
            <div className="mt-3 flex gap-4 text-xs text-slate-600">
              <span>{c.students} alumnos</span>
              <span>{c.attemptsWeek} intentos/sem</span>
              {c.alerts > 0 ? (
                <span className="font-semibold text-[#7a1a1a]">{c.alerts} alertas</span>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {course ? (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Heatmap por unidad · {course.name}
            </h2>
            <span className="text-xs text-slate-500">Click en una celda para ver los temas</span>
          </div>
          <HeatmapCollapsedByUnit
            units={UNITS}
            students={students}
            onUnitDrillDown={(unitCode, studentId) =>
              // eslint-disable-next-line no-alert
              alert(`Drill-down: ${unitCode} · ${studentId} → temas de la unidad (v8 C2.3)`)
            }
          />
        </section>
      ) : (
        <p className="mt-8 text-sm text-slate-400">Selecciona un curso para ver su heatmap.</p>
      )}
    </div>
  );
}
