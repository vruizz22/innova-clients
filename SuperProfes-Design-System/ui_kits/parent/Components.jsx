// Parent app — Spanish, Expo-style mobile. No raw probabilities.
// Mastery summary, supervision, push notifications.

const masteryWord = (p) => p >= 0.7 ? 'Va bien' : p >= 0.4 ? 'En proceso' : 'Necesita apoyo';
const masteryColor = (p) => p >= 0.7 ? 'mint' : p >= 0.4 ? 'amber' : 'rose';

const ParentHeader = ({ child = 'Antonia' }) => (
  <header className="pa-header">
    <div className="pa-avatar">A</div>
    <div>
      <div className="t-caption">Hijo/a</div>
      <strong>{child}</strong>
    </div>
    <button className="pa-icon-btn" aria-label="Ajustes" style={{marginLeft:'auto'}}><Icon name="settings" size={20}/></button>
  </header>
);

const SkillRow = ({ skill, p, days }) => (
  <div className={`pa-skill pa-skill-${masteryColor(p)}`}>
    <div className="pa-skill-dot"/>
    <div className="pa-skill-body">
      <strong>{skill}</strong>
      <small>{masteryWord(p)} · practicó {days} días esta semana</small>
    </div>
    <Icon name="chevron-right" size={18}/>
  </div>
);

const ParentSummary = ({ child = 'Antonia' }) => (
  <section className="pa-content">
    <h1>Esta semana</h1>
    <div className="card pa-hero">
      <div className="pa-hero-icon"><Icon name="check-circle" size={28}/></div>
      <div>
        <div className="t-caption">Resumen general</div>
        <strong>{child} va bien en matemáticas</strong>
        <p>Practicó 4 de 7 días. Domina sumas con llevadas y está aprendiendo restas con reserva.</p>
      </div>
    </div>

    <div className="pa-section">
      <h3>Habilidades</h3>
      <SkillRow skill="Suma con llevadas" p={0.82} days={3}/>
      <SkillRow skill="Resta con reserva" p={0.55} days={4}/>
      <SkillRow skill="Multiplicación 1d" p={0.32} days={1}/>
    </div>

    <div className="pa-section">
      <h3>Recomendación de la profesora</h3>
      <div className="card pa-recommend">
        <Icon name="book" size={18}/>
        <div>
          <strong>Practicar resta con reserva 10 min hoy</strong>
          <small>Asignado por Sra. González · vence hoy</small>
        </div>
      </div>
    </div>
  </section>
);

const SupervisionFlow = () => (
  <section className="pa-content">
    <h1>Supervisión</h1>

    <div className="card pa-supervise">
      <div className="pa-toggle-row">
        <div>
          <strong>Modo supervisado</strong>
          <small>Tú apruebas cada práctica antes de empezar</small>
        </div>
        <div className="pa-toggle is-on"><span/></div>
      </div>
      <div className="divider"/>
      <div className="pa-toggle-row">
        <div>
          <strong>Notificaciones diarias</strong>
          <small>Resumen cada tarde a las 19:00</small>
        </div>
        <div className="pa-toggle is-on"><span/></div>
      </div>
      <div className="divider"/>
      <div className="pa-toggle-row">
        <div>
          <strong>Compartir progreso con la profe</strong>
          <small>Para que pueda apoyar mejor en clase</small>
        </div>
        <div className="pa-toggle is-on"><span/></div>
      </div>
    </div>

    <div className="pa-privacy">
      <Icon name="shield" size={18}/>
      <div>
        <strong>Tus datos están protegidos</strong>
        <p>Las fotos del cuaderno se anonimizan automáticamente. No guardamos el nombre del archivo ni la fecha original. Sin trackers de terceros.</p>
      </div>
    </div>

    <button className="btn btn-secondary" style={{width:'100%', marginTop: 16}}>Ver política de privacidad</button>
  </section>
);

// Push notification mocks (iOS-style)
const PushStack = () => {
  const pushes = [
    { app: 'SuperProfes', time: 'ahora', title: 'Tu hijo debe practicar resta', body: 'La Sra. González asignó 15 problemas de resta con reserva. ~10 min.' },
    { app: 'SuperProfes', time: 'hace 2 h', title: '¡Antonia completó su práctica!', body: '13 de 15 correctas. Sigue mejorando en restas con reserva.' },
    { app: 'SuperProfes', time: 'ayer', title: 'Resumen del día · Antonia', body: 'Practicó 12 min. Va bien en sumas; está aprendiendo restas.' },
  ];
  return (
    <section className="pa-pushes">
      <div className="pa-lockscreen-time">9:41<br/><span>martes 5 de mayo</span></div>
      {pushes.map((p, i) => (
        <div key={i} className="pa-push" style={{transform:`translateY(${i*-4}px) scale(${1-i*0.02})`, zIndex: pushes.length-i}}>
          <div className="pa-push-icon"><img src="../../assets/superprofes-mark.svg" width="22" height="22" alt=""/></div>
          <div className="pa-push-body">
            <div className="pa-push-meta"><strong>{p.app}</strong><span>{p.time}</span></div>
            <strong>{p.title}</strong>
            <p>{p.body}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

window.ParentHeader = ParentHeader;
window.ParentSummary = ParentSummary;
window.SupervisionFlow = SupervisionFlow;
window.PushStack = PushStack;
