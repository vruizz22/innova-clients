import { AttemptWorkbench } from '@components/AttemptWorkbench'

export default function Page(): JSX.Element {
  return (
    <main className="container">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg-on-sky, #0F2A3D)' }}>
          Practica · SuperProfes
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--fg-2, #4F5868)' }}>
          Resuelve ejercicios paso a paso y recibe feedback inmediato.
        </p>
        <AttemptWorkbench />
      </div>
    </main>
  )
}
