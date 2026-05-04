// VisualErrorRenderer — renders a procedural-math error with side-by-side diff
// + friendly Spanish explanation. Slugs follow docs/error-taxonomy.md.

const ERROR_LIBRARY = {
  // ---- subtraction_borrow ----
  BORROW_OMITTED_TENS: {
    topic: 'Resta con reserva', grade: '3°-4°',
    title: 'Te faltó pedir prestado a las decenas',
    msg: 'Cuando el dígito de las unidades de arriba es menor que el de abajo, hay que pedir prestado a la columna de las decenas.',
    example: { a: 53, b: 26, op: '−', wrong: '33', right: '27', hint: 'tens' },
  },
  BORROW_OMITTED_HUNDREDS: {
    topic: 'Resta con reserva', grade: '3°-4°',
    title: 'Te faltó pedir prestado a las centenas',
    msg: 'En la columna de las centenas: si el dígito de arriba es menor, le pedimos a la columna de la izquierda.',
    example: { a: 423, b: 156, op: '−', wrong: '337', right: '267', hint: 'hundreds' },
  },
  SUBTRAHEND_MINUEND_SWAPPED: {
    topic: 'Resta con reserva', grade: '3°-4°',
    title: 'Restaste al revés',
    msg: 'En una resta, el primer número (arriba) es mayor. Mira de nuevo cuál va arriba y cuál va abajo.',
    example: { a: 53, b: 26, op: '−', wrong: '−27', right: '27' },
  },
  BORROW_FROM_ZERO_INCORRECT: {
    topic: 'Resta con reserva', grade: '4°',
    title: 'Pedir prestado al 0 tiene un truco',
    msg: 'Cuando hay un 0 en la columna donde queremos pedir prestado, primero le pedimos a la columna de la izquierda — el 0 se vuelve 9.',
    example: { a: 100, b: 27, op: '−', wrong: '83', right: '73' },
  },
  STOP_BORROW_PROPAGATION: {
    topic: 'Resta con reserva', grade: '4°',
    title: 'El préstamo tiene que seguir',
    msg: 'Cuando hay varios ceros seguidos, el préstamo se propaga por todos. No se detiene a la mitad.',
    example: { a: 1000, b: 1, op: '−', wrong: '900', right: '999' },
  },
  DIGIT_TRANSPOSITION: {
    topic: 'Resta con reserva', grade: '3°-4°',
    title: 'Cambiaste el orden de los dígitos',
    msg: 'Los dígitos están bien, pero en el orden equivocado. Vuelve a leer el resultado de derecha a izquierda.',
    example: { a: 53, b: 26, op: '−', wrong: '72', right: '27' },
  },
  COLUMN_MISALIGNMENT: {
    topic: 'Resta con reserva', grade: '3°-4°',
    title: 'Las columnas no quedaron alineadas',
    msg: 'Unidades con unidades, decenas con decenas. Si las columnas se desalinean, los cálculos también.',
    example: { a: 53, b: 6, op: '+', wrong: '113', right: '59' },
  },
  ARITHMETIC_FACT_ERROR: {
    topic: 'General', grade: '3°-6°',
    title: 'Te equivocaste en una suma o resta básica',
    msg: 'El procedimiento es correcto. Sólo falta repasar la operación básica de una columna (por ejemplo: 7 − 3).',
    example: { a: 53, b: 26, op: '−', wrong: '26', right: '27' },
  },

  // ---- addition_carry ----
  CARRY_OMITTED: {
    topic: 'Suma con llevadas', grade: '3°',
    title: 'Te faltó la llevada',
    msg: 'Cuando una columna suma 10 o más, se "lleva" 1 a la siguiente columna. Aquí faltó esa llevada.',
    example: { a: 38, b: 27, op: '+', wrong: '55', right: '65' },
  },
  CARRY_ADDED_TO_WRONG_COLUMN: {
    topic: 'Suma con llevadas', grade: '3°',
    title: 'La llevada fue a la columna equivocada',
    msg: 'La llevada de las unidades va a las decenas (columna de la izquierda), no a la misma columna.',
    example: { a: 38, b: 27, op: '+', wrong: '75', right: '65' },
  },

  // ---- fractions ----
  SUM_NUMERATORS_AND_DENOMINATORS: {
    topic: 'Fracciones (mismo denom.)', grade: '5°',
    title: 'Sólo sumamos los numeradores',
    msg: 'Cuando los denominadores son iguales, se mantienen. Sólo sumamos los números de arriba.',
    example: { a: '2/5', b: '1/5', op: '+', wrong: '3/10', right: '3/5', kind: 'frac' },
  },
  IMPROPER_FRACTION_NOT_REDUCED: {
    topic: 'Fracciones', grade: '5°',
    title: 'La fracción se puede simplificar',
    msg: 'El resultado es correcto, pero podemos dividir numerador y denominador por el mismo número para dejarla más simple.',
    example: { a: '2/4', b: '', op: '', wrong: '2/4', right: '1/2', kind: 'frac' },
  },
  INVERTED_FRACTION: {
    topic: 'Fracciones', grade: '5°',
    title: 'Se invirtieron los números',
    msg: 'Numerador arriba, denominador abajo. Aquí están al revés.',
    example: { a: '3/5', b: '', op: '', wrong: '5/3', right: '3/5', kind: 'frac' },
  },
  WHOLE_NUMBER_LOST: {
    topic: 'Fracciones', grade: '5°',
    title: 'Te olvidaste de la parte entera',
    msg: 'En los números mixtos hay una parte entera y una parte fraccionaria. No la dejes fuera del resultado.',
    example: { a: '1 1/4', b: '1/4', op: '+', wrong: '2/4', right: '1 2/4', kind: 'frac' },
  },

  // ---- multiplication ----
  TABLE_RECALL_ERROR: {
    topic: 'Multiplicación', grade: '4°-5°',
    title: 'Hay que repasar las tablas',
    msg: 'El procedimiento está bien, pero el resultado de la tabla no es ese. Vuelve a verla.',
    example: { a: 7, b: 8, op: '×', wrong: '54', right: '56' },
  },
  CARRY_OMITTED_MULT: {
    topic: 'Multiplicación', grade: '4°',
    title: 'Te faltó la llevada al multiplicar',
    msg: 'Cuando 3 × 7 = 21, escribimos 1 y llevamos 2 a la siguiente columna.',
    example: { a: 27, b: 3, op: '×', wrong: '61', right: '81' },
  },
  ZERO_TIMES_X_NONZERO: {
    topic: 'Multiplicación', grade: '3°-4°',
    title: 'Cualquier número por 0 es 0',
    msg: '0 × 5 = 0. No importa qué tan grande sea el otro número — si uno es 0, el resultado es 0.',
    example: { a: 0, b: 5, op: '×', wrong: '5', right: '0' },
  },

  // ---- division ----
  DIVISOR_DIVIDEND_SWAPPED: {
    topic: 'División larga', grade: '5°-6°',
    title: 'Cambiaste el dividendo y el divisor',
    msg: 'En 124 ÷ 4, dividimos 124 entre 4. El dividendo (124) va dentro, el divisor (4) afuera.',
    example: { a: 124, b: 4, op: '÷', wrong: '0', right: '31' },
  },
  REMAINDER_GREATER_THAN_DIVISOR: {
    topic: 'División larga', grade: '5°-6°',
    title: 'El resto no puede ser mayor que el divisor',
    msg: 'Si el resto es mayor o igual al divisor, todavía cabe una vez más. Sigue dividiendo.',
    example: { a: 17, b: 5, op: '÷', wrong: '2 r 7', right: '3 r 2' },
  },
  BRING_DOWN_OMITTED: {
    topic: 'División larga', grade: '5°-6°',
    title: 'Te olvidaste de bajar el siguiente dígito',
    msg: 'En la división larga, después de cada paso bajamos el siguiente dígito del dividendo.',
    example: { a: 124, b: 4, op: '÷', wrong: '3', right: '31' },
  },

  // ---- different denominators ----
  COMMON_DENOMINATOR_MISSED: {
    topic: 'Fracciones (denom. distintos)', grade: '6°',
    title: 'Faltó buscar denominador común',
    msg: 'Cuando los denominadores son distintos, primero buscamos uno común y después sumamos los numeradores.',
    example: { a: '1/2', b: '1/3', op: '+', wrong: '2/5', right: '5/6', kind: 'frac' },
  },
  WRONG_LCM: {
    topic: 'Fracciones (denom. distintos)', grade: '6°',
    title: 'El denominador común no es ese',
    msg: 'El denominador común tiene que ser un múltiplo de ambos. Para 4 y 6 es 12, no 10.',
    example: { a: '1/4', b: '1/6', op: '+', wrong: '?/10', right: '5/12', kind: 'frac' },
  },

  // ---- specials ----
  UNCLASSIFIED: {
    topic: 'En revisión', grade: '—',
    title: 'Estamos revisando tu respuesta',
    msg: 'Tu respuesta no coincide con la esperada, pero el procedimiento no encaja con un patrón conocido. Un docente la revisará.',
    example: null,
  },
};

const FracStack = ({ value }) => {
  if (!value) return null;
  const m = String(value).match(/^(?:(\d+)\s+)?(-?\d+)\/(\d+)$/);
  if (!m) return <span className="math">{value}</span>;
  const [, whole, num, den] = m;
  return (
    <span className="vex-frac math">
      {whole && <span className="vex-whole">{whole}</span>}
      <span className="vex-frac-stack">
        <span className="vex-num">{num}</span>
        <span className="vex-den">{den}</span>
      </span>
    </span>
  );
};

const VerticalStack = ({ a, b, op, answer, highlight }) => (
  <div className="vex-vstack math">
    <div className="vex-row">{a}</div>
    {b !== undefined && b !== '' && <div className="vex-row"><span className="vex-op">{op}</span>{b}</div>}
    <hr/>
    <div className={`vex-row vex-ans ${highlight === 'wrong' ? 'is-wrong' : ''} ${highlight === 'right' ? 'is-right' : ''}`}>{answer}</div>
  </div>
);

const VisualErrorRenderer = ({ slug, compact = false }) => {
  const def = ERROR_LIBRARY[slug];
  if (!def) {
    return <div className="vex"><div className="vex-title">Tipo de error desconocido: <code className="t-code">{slug}</code></div></div>;
  }
  const ex = def.example;
  const isFrac = ex?.kind === 'frac';

  return (
    <article className={`vex ${compact ? 'vex-compact' : ''}`}>
      <header className="vex-head">
        <div>
          <span className="t-allcaps vex-tag">{def.topic} · {def.grade}</span>
          <h3 className="vex-title">{def.title}</h3>
        </div>
        <code className="t-code vex-slug">{slug}</code>
      </header>

      {ex && (
        <div className="vex-diff">
          <div className="vex-diff-col vex-diff-wrong">
            <div className="t-caption">Tu respuesta</div>
            {isFrac
              ? <div className="vex-frac-line">
                  <FracStack value={ex.a}/>
                  {ex.op && <span className="vex-op">{ex.op}</span>}
                  <FracStack value={ex.b}/>
                  <span className="vex-eq">=</span>
                  <FracStack value={ex.wrong}/>
                </div>
              : <VerticalStack a={ex.a} b={ex.b} op={ex.op} answer={ex.wrong} highlight="wrong"/>}
          </div>
          <div className="vex-diff-col vex-diff-right">
            <div className="t-caption">Cómo se hace</div>
            {isFrac
              ? <div className="vex-frac-line">
                  <FracStack value={ex.a}/>
                  {ex.op && <span className="vex-op">{ex.op}</span>}
                  <FracStack value={ex.b}/>
                  <span className="vex-eq">=</span>
                  <FracStack value={ex.right}/>
                </div>
              : <VerticalStack a={ex.a} b={ex.b} op={ex.op} answer={ex.right} highlight="right"/>}
          </div>
        </div>
      )}

      <p className="vex-msg">{def.msg}</p>
    </article>
  );
};

window.VisualErrorRenderer = VisualErrorRenderer;
window.ERROR_LIBRARY = ERROR_LIBRARY;
