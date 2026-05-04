// Mastery heatmap — students × skills with p_known cells
const SKILLS = [
  { id: 'sub_borrow', name: 'Resta c/reserva' },
  { id: 'add_carry',  name: 'Suma c/llevadas' },
  { id: 'frac_md',    name: 'Fracciones m.d.' },
  { id: 'mul_1d',     name: 'Multipl. 1d' },
  { id: 'div_long',   name: 'División larga' },
  { id: 'place',      name: 'Valor posicional' },
];

const STUDENTS = [
  { name: 'Antonia P.',  vals: [0.84, 0.71, 0.55, 0.32, 0.28, 0.78] },
  { name: 'Benjamín O.', vals: [0.62, 0.74, 0.48, 0.50, 0.35, 0.69] },
  { name: 'Camila R.',   vals: [0.91, 0.88, 0.76, 0.72, 0.61, 0.94] },
  { name: 'Diego V.',    vals: [0.31, 0.44, 0.29, 0.22, 0.18, 0.40] },
  { name: 'Elena S.',    vals: [0.75, 0.82, 0.58, 0.49, 0.46, 0.71] },
  { name: 'Felipe M.',   vals: [0.52, 0.66, 0.41, 0.38, 0.33, 0.55] },
  { name: 'Gabriela T.', vals: [0.88, 0.79, 0.67, 0.61, 0.55, 0.82] },
  { name: 'Hugo L.',     vals: [0.42, 0.51, 0.34, 0.30, 0.27, 0.48] },
];

const masteryClass = (v) => {
  if (v >= 0.7) return 'mastery-strong';
  if (v >= 0.4) return 'mastery-medium';
  return 'mastery-weak';
};

const MasteryHeatmap = ({ onCell }) => (
  <div className="t-heatmap">
    <table>
      <thead>
        <tr>
          <th></th>
          {SKILLS.map(s => <th key={s.id} className="t-heat-skill"><span>{s.name}</span></th>)}
        </tr>
      </thead>
      <tbody>
        {STUDENTS.map((st, i) => (
          <tr key={i}>
            <td className="t-heat-name">{st.name}</td>
            {st.vals.map((v, j) => (
              <td key={j}>
                <button
                  className={`mastery-cell ${masteryClass(v)}`}
                  onClick={() => onCell?.(st, SKILLS[j], v)}
                  title={`${st.name} · ${SKILLS[j].name} · p_known=${v.toFixed(2)}`}>
                  {v.toFixed(2).slice(1)}
                </button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

window.MasteryHeatmap = MasteryHeatmap;
window.SKILLS = SKILLS; window.STUDENTS = STUDENTS;
