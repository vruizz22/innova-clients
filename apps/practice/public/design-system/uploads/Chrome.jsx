// Teacher dashboard chrome: top bar + sidebar
const TeacherTopBar = ({ user = { name: 'Sra. González', course: '4° A · Matemáticas' }, onSearch }) => (
  <header className="t-topbar">
    <div className="t-brand">
      <img src="../../assets/superprofes-mark.svg" width="28" height="28" alt=""/>
      <strong>Super<span style={{color:'var(--sky-500)'}}>Profes</span></strong>
      <span className="t-allcaps muted" style={{marginLeft:8}}>Docente</span>
    </div>
    <div className="t-search">
      <Icon name="search" size={16}/>
      <input placeholder="Buscar alumno, curso o habilidad…"/>
    </div>
    <div className="t-actions">
      <button className="t-icon-btn" aria-label="Alertas"><Icon name="bell" size={20}/><span className="t-dot"/></button>
      <button className="t-icon-btn" aria-label="Configuración"><Icon name="settings" size={20}/></button>
      <div className="t-avatar">SG</div>
    </div>
  </header>
);

const TeacherSidebar = ({ active = 'dashboard', onNav }) => {
  const items = [
    { id: 'dashboard', label: 'Resumen', icon: 'home' },
    { id: 'mastery', label: 'Mastery', icon: 'chart' },
    { id: 'alerts', label: 'Alertas', icon: 'bell', badge: 3 },
    { id: 'students', label: 'Alumnos', icon: 'users' },
    { id: 'practice', label: 'Asignar práctica', icon: 'book' },
  ];
  return (
    <nav className="t-sidebar">
      <div className="t-side-section">
        <div className="t-side-label">4° A · Matemáticas</div>
        {items.map(it => (
          <button key={it.id}
            className={`t-side-item ${active === it.id ? 'is-active' : ''}`}
            onClick={() => onNav?.(it.id)}>
            <Icon name={it.icon} size={18}/>
            <span>{it.label}</span>
            {it.badge ? <span className="t-side-badge">{it.badge}</span> : null}
          </button>
        ))}
      </div>
      <div className="t-side-section" style={{marginTop:'auto'}}>
        <div className="t-side-meta">
          <div>Período activo</div>
          <strong>Sem. 28 · 2025</strong>
        </div>
      </div>
    </nav>
  );
};

window.TeacherTopBar = TeacherTopBar;
window.TeacherSidebar = TeacherSidebar;
