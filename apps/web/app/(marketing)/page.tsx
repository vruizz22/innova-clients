export default function MarketingPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-mint-50">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm font-black text-white">
            SP
          </div>
          <span className="text-lg font-extrabold text-slate-900">
            Super<span className="text-sky-500">Profes</span>
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <a href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            Iniciar sesión
          </a>
          <a
            href="/register"
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600"
          >
            Crear cuenta
          </a>
        </nav>
      </header>

      <section className="mx-auto max-w-[820px] px-6 py-16 text-center sm:py-24">
        <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-700 shadow-card">
          Matemáticas · 1° básico a 4° medio
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Detecta el error de cada alumno{' '}
          <span className="text-sky-600">antes</span> de la prueba.
        </h1>
        <p className="mx-auto mt-5 max-w-[52ch] text-lg leading-relaxed text-slate-600">
          SuperProfes identifica el procedimiento exacto donde se traba cada estudiante y asigna
          práctica dirigida, paso a paso.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/register"
            className="rounded-xl bg-gradient-to-br from-sky-500 to-mint-600 px-6 py-3 text-base font-bold text-white shadow-pop transition hover:-translate-y-px"
          >
            Comenzar gratis
          </a>
          <a
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-base font-bold text-slate-700 hover:bg-slate-50"
          >
            Ya tengo cuenta
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1000px] gap-4 px-6 pb-24 sm:grid-cols-3">
        {[
          { t: 'Alumnos', d: 'Resuelven y reciben feedback procedimental, sin notas que castiguen.' },
          { t: 'Profesores', d: 'Heatmap por unidad y tema, alertas y banco de ejercicios multi-grado.' },
          { t: 'Apoderados', d: 'Resumen claro del progreso, sin jerga ni probabilidades crudas.' },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="text-base font-bold text-slate-900">{c.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
