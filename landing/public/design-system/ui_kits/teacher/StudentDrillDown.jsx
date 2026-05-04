// Student drill-down panel — error frequency + attempts
const ERROR_FREQ = [
  { label: 'BORROW_OMITTED_TENS', count: 7 },
  { label: 'OPERATOR_CONFUSION',  count: 3 },
  { label: 'PLACE_VALUE_ERROR',   count: 2 },
  { label: 'CARRY_FORGOTTEN',     count: 1 },
];

const ATTEMPTS = [0.3, 0.4, 0.35, 0.5, 0.55, 0.45, 0.6, 0.7, 0.65, 0.75, 0.7, 0.8];

const Sparkline = ({ data, w = 240, h = 60 }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * stepX},${h - ((v - min) / range) * (h - 8) - 4}`).join(' ');
  return (
    <svg width={w} height={h} style={{display:'block'}}>
      <polyline points={pts} fill="none" stroke="var(--mint-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v, i) => (
        <circle key={i} cx={i*stepX} cy={h - ((v - min) / range) * (h - 8) - 4} r="2.5" fill="var(--mint-500)"/>
      ))}
    </svg>
  );
};

const StudentDrillDown = ({ student, skill, p, onClose, onAssign }) => (
  <aside className="t-drill">
    <div className="t-drill-head">
      <div>
        <div className="t-caption">{skill?.name || 'Resta con reserva'}</div>
        <h2 className="t-h1">{student?.name || 'Diego V.'}</h2>
      </div>
      <button className="t-icon-btn" onClick={onClose} aria-label="Cerrar"><Icon name="x" size={18}/></button>
    </div>

    <section className="card" style={{marginTop:16}}>
      <div className="t-drill-stat">
        <div>
          <div className="t-caption">Mastery actual</div>
          <div className="t-stat math">{(p ?? 0.31).toFixed(2)}</div>
        </div>
        <div className="t-stat-bar">
          <Sparkline data={ATTEMPTS}/>
          <div className="t-caption">Últimos 12 intentos · tendencia ↑</div>
        </div>
      </div>
    </section>

    <section className="card" style={{marginTop:12}}>
      <h4 className="t-h2" style={{margin:'0 0 12px'}}>Errores frecuentes</h4>
      {ERROR_FREQ.map(e => {
        const max = ERROR_FREQ[0].count;
        return (
          <div key={e.label} className="t-bar">
            <span className="t-bar-label"><code className="t-code">{e.label}</code></span>
            <span className="t-bar-track"><span className="t-bar-fill" style={{width: (e.count/max*100)+'%'}}/></span>
            <span className="t-bar-num math">{e.count}</span>
          </div>
        );
      })}
    </section>

    <section style={{marginTop:16}}>
      <button className="btn btn-primary" style={{width:'100%'}} onClick={onAssign}>
        <Icon name="book" size={18}/> Asignar práctica focalizada
      </button>
      <p className="t-caption" style={{marginTop:8, textAlign:'center'}}>
        15 problemas de <code className="t-code">subtraction_borrow</code> · ~10 min
      </p>
    </section>
  </aside>
);

window.StudentDrillDown = StudentDrillDown;
