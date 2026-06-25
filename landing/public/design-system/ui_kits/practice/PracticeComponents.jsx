// Student practice screens — built around a vertical math problem + keypad
const PracticeHeader = ({ student = 'Antonia', streak = 4, xp = 240 }) => (
  <header className="p-header">
    <button className="p-icon-btn" aria-label="Inicio"><Icon name="home" size={20}/></button>
    <div className="p-header-meta">
      <div className="p-streak"><Icon name="flag" size={14}/> {streak} días</div>
      <div className="p-xp math">{xp} <span className="muted">xp</span></div>
    </div>
  </header>
);

const ProblemDisplay = ({ a = 53, b = 26, op = '−', answer = '', step = 'Paso 2 de 3' }) => {
  const aStr = String(a).padStart(String(b).length, ' ');
  return (
    <section className="p-problem">
      <div className="t-caption" style={{textAlign:'center', marginBottom:8}}>{step}</div>
      <div className="p-stack math">
        <div className="p-stack-row">{aStr}</div>
        <div className="p-stack-row"><span className="p-op">{op}</span>{String(b)}</div>
        <hr/>
        <div className="p-stack-row p-answer">{answer || <span className="p-placeholder">__</span>}</div>
      </div>
    </section>
  );
};

const Keypad = ({ onKey }) => {
  const keys = ['7','8','9','del','4','5','6','-','1','2','3','+','0',',','done'];
  return (
    <div className="p-keypad" role="group" aria-label="Teclado numérico">
      {keys.map((k, i) => {
        const isOp = ['del','-','+'].includes(k);
        const isGo = k === 'done';
        return (
          <button key={i}
            className={`p-key ${isOp ? 'p-key-op' : ''} ${isGo ? 'p-key-go' : ''}`}
            onClick={() => onKey?.(k)}>
            {k === 'del' ? '⌫' : k === 'done' ? 'Listo' : k}
          </button>
        );
      })}
    </div>
  );
};

const ScanCTA = ({ onScan }) => (
  <button className="p-scan" onClick={onScan}>
    <Icon name="camera" size={22}/>
    <span>
      <strong>Escanear cuaderno</strong>
      <small>Toma una foto de tu hoja</small>
    </span>
    <Icon name="chevron-right" size={18}/>
  </button>
);

const FeedbackCorrect = ({ onNext }) => (
  <div className="p-feedback p-feedback-good">
    <div className="p-feedback-icon"><Icon name="check-circle" size={32}/></div>
    <h2>¡Lo lograste!</h2>
    <p>Has completado la resta paso a paso. Sigamos con la siguiente.</p>
    <button className="btn btn-primary" style={{minWidth:160}} onClick={onNext}>
      Siguiente <Icon name="arrow-right" size={16}/>
    </button>
  </div>
);

const FeedbackError = ({ errorType = 'BORROW_OMITTED_TENS', onRetry }) => {
  const messages = {
    BORROW_OMITTED_TENS: 'Mira la columna de las decenas. Cuando 6 es mayor que 3, le pedimos prestado: el 5 se vuelve 4 y el 3 pasa a 13.',
    OPERATOR_CONFUSION: 'Casi lo tienes. Esta vez nos pidieron restar, no sumar. Vuelve a leer el signo.',
    CARRY_FORGOTTEN: 'Recuerda llevar 1 cuando la suma de una columna pasa de 10.',
  };
  return (
    <div className="p-feedback p-feedback-error">
      <span className="t-allcaps" style={{color: 'var(--error-fg)'}}>Error procedural</span>
      <h2>Casi lo tienes — fíjate en la columna</h2>
      <div className="p-feedback-diff">
        <div>
          <div className="t-caption">Tu respuesta</div>
          <div className="p-stack p-stack-sm math">
            <div>5 3</div><div>− 2 6</div><hr/>
            <div><span className="p-digit-bad">3</span> <span className="p-digit-bad">3</span></div>
          </div>
        </div>
        <div>
          <div className="t-caption">Cómo se hace</div>
          <div className="p-stack p-stack-sm math">
            <div><sup style={{fontSize:'.55em',color:'var(--mint-700)',fontWeight:700}}>4¹</sup>5 3</div>
            <div>− 2 6</div><hr/>
            <div>2 7</div>
          </div>
        </div>
      </div>
      <p className="p-feedback-msg">{messages[errorType]}</p>
      <button className="btn btn-primary" onClick={onRetry}>Intentar de nuevo</button>
    </div>
  );
};

const ScannerView = ({ status = 'idle', onCapture, onCancel, onContinue }) => {
  // statuses: idle, processing, done
  return (
    <div className="p-scanner">
      <div className="p-scanner-frame">
        <div className="p-scanner-corners">
          <span/><span/><span/><span/>
        </div>
        {status === 'idle' && <div className="p-scanner-hint">Centra tu hoja dentro del marco</div>}
        {status === 'processing' && (
          <div className="p-scanner-status">
            <div className="p-spinner"/>
            <div>Procesando…</div>
            <div className="t-caption">Analizando los pasos de tu solución</div>
          </div>
        )}
        {status === 'done' && (
          <div className="p-scanner-status">
            <Icon name="check-circle" size={32}/>
            <div>¡Listo!</div>
          </div>
        )}
      </div>
      <div className="p-scanner-bar">
        <div className="p-privacy"><Icon name="lock" size={14}/> Foto anónima · sin EXIF</div>
        {status === 'idle' && (
          <div className="p-scanner-actions">
            <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
            <button className="p-shutter" onClick={onCapture} aria-label="Capturar"><span/></button>
            <span style={{width:80}}/>
          </div>
        )}
        {status === 'done' && (
          <button className="btn btn-primary" style={{width:'100%'}} onClick={onContinue}>Ver feedback</button>
        )}
      </div>
    </div>
  );
};

window.PracticeHeader = PracticeHeader;
window.ProblemDisplay = ProblemDisplay;
window.Keypad = Keypad;
window.ScanCTA = ScanCTA;
window.FeedbackCorrect = FeedbackCorrect;
window.FeedbackError = FeedbackError;
window.ScannerView = ScannerView;
