import { AttemptWorkbench } from '@components/AttemptWorkbench'

export default function Page(): JSX.Element {
  return (
    <main className="container">
      <div className="card">
        <h1>Práctica · SuperProfes</h1>
        <p>Resuelve ejercicios y envía los pasos al backend local para recibir feedback inmediato.</p>
        <AttemptWorkbench />
      </div>
    </main>
  )
}
