// Stat row above the heatmap
const StatRow = ({ alertsCount = 4 }) => (
  <div className="t-stats">
    <div className="card t-stat-card">
      <div className="t-caption">Mastery promedio · curso</div>
      <div className="t-stat math">0.62</div>
      <div className="t-delta t-delta-up">+0.04 vs sem. anterior</div>
    </div>
    <div className="card t-stat-card">
      <div className="t-caption">Alumnos en riesgo</div>
      <div className="t-stat math">8 <span className="t-stat-of">/ 32</span></div>
      <div className="t-delta">2 nuevos esta semana</div>
    </div>
    <div className="card t-stat-card">
      <div className="t-caption">Alertas sin resolver</div>
      <div className="t-stat math">{alertsCount}</div>
      <div className="t-delta">2 AT_RISK · 2 COMMON_ERROR</div>
    </div>
    <div className="card t-stat-card">
      <div className="t-caption">Práctica asignada · semana</div>
      <div className="t-stat math">14</div>
      <div className="t-delta">73% completada</div>
    </div>
  </div>
);

window.StatRow = StatRow;
