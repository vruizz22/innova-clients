type FractionExample = {
  a: string
  b?: string
  op?: string
  wrong: string
  right: string
  kind?: 'frac'
}

type NumberExample = {
  a: number
  b?: number
  op: '−' | '+' | '×' | '÷'
  wrong: string
  right: string
  kind?: never
}

type ErrorExample = FractionExample | NumberExample | null

type ErrorDefinition = {
  topic: string
  grade: string
  title: string
  msg: string
  example: ErrorExample
}

const ERROR_LIBRARY: Record<string, ErrorDefinition> = {
  BORROW_OMITTED_TENS: {
    topic: 'Resta con reserva',
    grade: '3°-4°',
    title: 'Te faltó pedir prestado a las decenas',
    msg: 'Cuando el dígito de las unidades de arriba es menor que el de abajo, hay que pedir prestado a la columna de las decenas.',
    example: { a: 53, b: 26, op: '−', wrong: '33', right: '27' },
  },
  CARRY_OMITTED: {
    topic: 'Suma con llevadas',
    grade: '3°',
    title: 'Te faltó la llevada',
    msg: 'Cuando una columna suma 10 o más, se lleva 1 a la siguiente columna. Aquí faltó esa llevada.',
    example: { a: 38, b: 27, op: '+', wrong: '55', right: '65' },
  },
  ZERO_TIMES_X_NONZERO: {
    topic: 'Multiplicación',
    grade: '3°-4°',
    title: 'Cualquier número por 0 es 0',
    msg: '0 × 5 = 0. No importa qué tan grande sea el otro número.',
    example: { a: 0, b: 5, op: '×', wrong: '5', right: '0' },
  },
  COMMON_DENOMINATOR_MISSED: {
    topic: 'Fracciones (denom. distintos)',
    grade: '6°',
    title: 'Faltó buscar denominador común',
    msg: 'Cuando los denominadores son distintos, primero buscamos uno común y después sumamos los numeradores.',
    example: { a: '1/2', b: '1/3', op: '+', wrong: '2/5', right: '5/6', kind: 'frac' },
  },
}

type VisualErrorRendererProps = {
  slug: keyof typeof ERROR_LIBRARY | string
  compact?: boolean
}

function FracStack({ value }: { value: string }): JSX.Element {
  const match = value.match(/^(?:(\d+)\s+)?(-?\d+)\/(\d+)$/)

  if (!match) {
    return <span className="math">{value}</span>
  }

  const [, whole, numerator, denominator] = match

  return (
    <span className="vex-frac math">
      {whole ? <span className="vex-whole">{whole}</span> : null}
      <span className="vex-frac-stack">
        <span className="vex-num">{numerator}</span>
        <span className="vex-den">{denominator}</span>
      </span>
    </span>
  )
}

function VerticalStack({
  a,
  b,
  op,
  answer,
  highlight,
}: {
  a: number
  b?: number
  op: '−' | '+' | '×' | '÷'
  answer: string
  highlight: 'wrong' | 'right'
}): JSX.Element {
  return (
    <div className="vex-vstack math">
      <div className="vex-row">{a}</div>
      {b !== undefined ? (
        <div className="vex-row">
          <span className="vex-op">{op}</span>
          {b}
        </div>
      ) : null}
      <hr />
      <div className={`vex-row vex-ans ${highlight === 'wrong' ? 'is-wrong' : ''} ${highlight === 'right' ? 'is-right' : ''}`}>
        {answer}
      </div>
    </div>
  )
}

export function VisualErrorRenderer({ slug, compact = false }: VisualErrorRendererProps): JSX.Element {
  const definition = ERROR_LIBRARY[slug]

  if (!definition) {
    return (
      <div className="vex">
        <div className="vex-title">
          Tipo de error desconocido: <code className="t-code">{slug}</code>
        </div>
      </div>
    )
  }

  const example = definition.example
  const isFraction = example !== null && 'kind' in example && example.kind === 'frac'

  return (
    <article className={`vex ${compact ? 'vex-compact' : ''}`}>
      <header className="vex-head">
        <div>
          <span className="t-allcaps vex-tag">
            {definition.topic} · {definition.grade}
          </span>
          <h3 className="vex-title">{definition.title}</h3>
        </div>
        <code className="t-code vex-slug">{slug}</code>
      </header>

      {example !== null ? (
        <div className="vex-diff">
          <div className="vex-diff-col vex-diff-wrong">
            <div className="t-caption">Tu respuesta</div>
            {isFraction ? (
              <div className="vex-frac-line">
                <FracStack value={example.a} />
                {example.op ? <span className="vex-op">{example.op}</span> : null}
                {example.b ? <FracStack value={example.b} /> : null}
                <span className="vex-eq">=</span>
                <FracStack value={example.wrong} />
              </div>
            ) : (
              <VerticalStack a={example.a} b={example.b} op={example.op} answer={example.wrong} highlight="wrong" />
            )}
          </div>
          <div className="vex-diff-col vex-diff-right">
            <div className="t-caption">Cómo se hace</div>
            {isFraction ? (
              <div className="vex-frac-line">
                <FracStack value={example.a} />
                {example.op ? <span className="vex-op">{example.op}</span> : null}
                {example.b ? <FracStack value={example.b} /> : null}
                <span className="vex-eq">=</span>
                <FracStack value={example.right} />
              </div>
            ) : (
              <VerticalStack a={example.a} b={example.b} op={example.op} answer={example.right} highlight="right" />
            )}
          </div>
        </div>
      ) : null}

      <p className="vex-msg">{definition.msg}</p>
    </article>
  )
}
