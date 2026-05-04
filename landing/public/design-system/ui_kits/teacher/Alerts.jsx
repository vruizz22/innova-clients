// Alerts panel
const ALERT_DEFS = {
  AT_RISK_SKILL:        { tone: 'risk',  title: (a) => `${a.skill} — ${a.count} alumnos bajo 0.4`, hint: 'Ver detalle del cluster · asignar práctica focalizada', icon: 'alert' },
  COMMON_ERROR_DETECTED:{ tone: 'amber', title: (a) => <><code className="t-code">{a.error}</code> en {a.count} intentos hoy</>, hint: 'Recurso pedagógico sugerido', icon: 'users' },
  STUDENT_DROP:         { tone: 'risk',  title: (a) => `${a.student} cayó −${a.delta} en ${a.skill}`, hint: 'Notificar apoderado · ofrecer mini-lección', icon: 'trending-down' },
};

const AlertItem = ({ alert, onResolve }) => {
  const def = ALERT_DEFS[alert.type];
  return (
    <article className={`t-alert t-alert-${def.tone}`}>
      <div className={`t-alert-icon t-alert-icon-${def.tone}`}>
        <Icon name={def.icon} size={18}/>
      </div>
      <div className="t-alert-body">
        <div className="t-alert-meta">
          <span className="t-allcaps" style={{color: def.tone === 'risk' ? '#5A1F1F' : '#7A4F00'}}>{alert.type}</span>
          <span>· {alert.when}</span>
        </div>
        <h3>{def.title(alert)}</h3>
        <p className="t-caption">{def.hint}</p>
      </div>
      <button className="btn btn-secondary" style={{minHeight:36, padding:'8px 12px'}} onClick={() => onResolve?.(alert)}>
        <Icon name="check" size={16}/> Resolver
      </button>
    </article>
  );
};

const AlertsPanel = ({ alerts, onResolve }) => {
  if (!alerts.length) return (
    <div className="t-empty">
      <Icon name="check-circle" size={28}/>
      <h3>Sin alertas pendientes</h3>
      <p>Buen trabajo — el curso está al día.</p>
    </div>
  );
  return (
    <div className="col gap-3">
      {alerts.map(a => <AlertItem key={a.id} alert={a} onResolve={onResolve}/>)}
    </div>
  );
};

window.AlertsPanel = AlertsPanel;
window.ALERTS_SEED = [
  { id: 1, type: 'AT_RISK_SKILL', skill: 'Resta con reserva', count: 6, when: 'hace 12 min' },
  { id: 2, type: 'COMMON_ERROR_DETECTED', error: 'BORROW_OMITTED_TENS', count: 9, when: 'hace 1 h' },
  { id: 3, type: 'STUDENT_DROP', student: 'Diego V.', delta: 0.18, skill: 'Multipl. 1d', when: 'ayer' },
  { id: 4, type: 'COMMON_ERROR_DETECTED', error: 'OPERATOR_CONFUSION', count: 4, when: 'ayer' },
];
