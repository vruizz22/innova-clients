import { AttemptWorkbench } from '../components/AttemptWorkbench'

export default function Page(): JSX.Element {
  return (
    <main className="container">
      <div className="card">
        <h1>Practice · SuperProfes</h1>
        <p>Demo environment. Use this page to run a practice attempt and preview the error renderer.</p>
        <AttemptWorkbench />
      </div>
    </main>
  )
}
