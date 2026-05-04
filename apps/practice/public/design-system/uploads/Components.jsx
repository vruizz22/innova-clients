// Auth UI kit — pairs with Nest auth.controller endpoints.
// All copy in es-CL. Roles map directly to backend Role enum.

const ROLES = [
  { id: 'student', label: 'Estudiante', icon: 'graduation-cap' },
  { id: 'teacher', label: 'Profesor/a', icon: 'school' },
  { id: 'admin',   label: 'Admin',     icon: 'shield' },
];

const Aside = () => (
  <aside className="auth-aside">
    <div className="auth-brand">
      <img src="../../assets/superprofes-logo-inverse.svg" alt="SuperProfes"/>
    </div>
    <div className="auth-pitch">
      <h2>Aprendizaje que se adapta a cada estudiante.</h2>
      <p>SuperProfes detecta dónde se traba cada niño y guía la práctica con explicaciones simples, en español.</p>
    </div>
    <div className="auth-pitch-foot">
      <span className="dot"/> Datos protegidos · Cumple Ley 19.628
    </div>
  </aside>
);

const RoleChooser = ({ value, onChange }) => (
  <div className="auth-roles" role="tablist" aria-label="Tipo de cuenta">
    {ROLES.map(r => (
      <button
        key={r.id}
        type="button"
        role="tab"
        className="auth-role"
        aria-pressed={value === r.id}
        onClick={() => onChange(r.id)}
      >
        <Icon name={r.icon} size={18}/>
        {r.label}
      </button>
    ))}
  </div>
);

const passwordStrength = (pw = '') => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

// ──────────────────────────────────────────────────────────────────────
// SCREEN: Login
// ──────────────────────────────────────────────────────────────────────
const LoginScreen = () => {
  const [role, setRole] = React.useState('student');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  return (
    <div className="auth-shell">
      <Aside/>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-logo-mobile">
            <img src="../../assets/superprofes-logo.svg" alt="SuperProfes"/>
          </div>
          <h1 className="auth-title">Iniciar sesión</h1>
          <p className="auth-sub">Ingresa con tu correo y contraseña institucional.</p>

          <RoleChooser value={role} onChange={setRole}/>

          <form className="auth-form" onSubmit={e => e.preventDefault()}>
            <div className="auth-row">
              <label htmlFor="login-email">Correo</label>
              <input id="login-email" className="auth-input" type="email"
                placeholder="tu.correo@colegio.cl" value={email}
                onChange={e => setEmail(e.target.value)} autoComplete="email"/>
            </div>
            <div className="auth-row">
              <label htmlFor="login-pw">Contraseña</label>
              <input id="login-pw" className="auth-input" type="password"
                placeholder="Mínimo 8 caracteres" value={pw}
                onChange={e => setPw(e.target.value)} autoComplete="current-password"/>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div className="auth-row-checkbox">
                <input id="login-remember" type="checkbox"/>
                <label htmlFor="login-remember">Recordarme</label>
              </div>
              <a href="#forgot" className="auth-link">¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" className="auth-submit">Entrar</button>
          </form>

          <div className="auth-foot">
            ¿Eres nuevo en SuperProfes? <a href="#register" className="auth-link-inline">Crea una cuenta</a>
          </div>
        </div>
      </main>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// SCREEN: Register
// ──────────────────────────────────────────────────────────────────────
const RegisterScreen = () => {
  const [role, setRole] = React.useState('student');
  const [pw, setPw] = React.useState('');
  const strength = passwordStrength(pw);
  return (
    <div className="auth-shell">
      <Aside/>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-logo-mobile">
            <img src="../../assets/superprofes-logo.svg" alt="SuperProfes"/>
          </div>
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-sub">Empieza gratis. Tu colegio puede vincularse después con un código de invitación.</p>

          <RoleChooser value={role} onChange={setRole}/>

          <form className="auth-form" onSubmit={e => e.preventDefault()}>
            <div className="auth-row">
              <label htmlFor="reg-email">Correo institucional</label>
              <input id="reg-email" className="auth-input" type="email"
                placeholder="tu.correo@colegio.cl" autoComplete="email"/>
              <p className="auth-help">Te enviaremos un enlace para verificar este correo.</p>
            </div>
            <div className="auth-row">
              <label htmlFor="reg-pw">Contraseña</label>
              <input id="reg-pw" className="auth-input" type="password"
                placeholder="Crea una contraseña segura" value={pw}
                onChange={e => setPw(e.target.value)} autoComplete="new-password"/>
              <div className={`auth-strength s-${strength}`}>
                <span/><span/><span/><span/>
              </div>
              <p className="auth-help">
                {strength === 0 && 'Mínimo 8 caracteres.'}
                {strength === 1 && 'Débil — agrega mayúsculas y números.'}
                {strength === 2 && 'Aceptable — agrega un símbolo para mejorar.'}
                {strength === 3 && 'Buena contraseña.'}
                {strength === 4 && 'Excelente contraseña.'}
              </p>
            </div>
            {role === 'student' && (
              <div className="auth-row">
                <label htmlFor="reg-code">Código del colegio (opcional)</label>
                <input id="reg-code" className="auth-input" type="text"
                  placeholder="P. ej. STMARIA-2025" autoComplete="off"/>
                <p className="auth-help">Pídeselo a tu profesor/a si tu colegio ya usa SuperProfes.</p>
              </div>
            )}
            <div className="auth-row-checkbox">
              <input id="reg-tos" type="checkbox"/>
              <label htmlFor="reg-tos">
                Acepto los <a href="#tos" className="auth-link-inline">términos</a> y la <a href="#privacy" className="auth-link-inline">política de privacidad</a>.
              </label>
            </div>
            <button type="submit" className="auth-submit">Crear cuenta</button>
          </form>

          <div className="auth-foot">
            ¿Ya tienes cuenta? <a href="#login" className="auth-link-inline">Inicia sesión</a>
          </div>
        </div>
      </main>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// SCREEN: Forgot password (request reset)
// ──────────────────────────────────────────────────────────────────────
const ForgotScreen = ({ sent = false }) => (
  <div className="auth-shell">
    <Aside/>
    <main className="auth-main">
      <div className="auth-card">
        <div className="auth-logo-mobile">
          <img src="../../assets/superprofes-logo.svg" alt="SuperProfes"/>
        </div>
        <h1 className="auth-title">Recuperar contraseña</h1>
        <p className="auth-sub">Ingresa tu correo y te enviaremos un enlace para crear una nueva.</p>

        {sent && (
          <div className="auth-email-sent">
            <Icon name="check-circle" size={20}/>
            <div>
              <strong>Revisa tu correo</strong>
              <p>Si existe una cuenta con ese correo, recibirás un enlace en los próximos minutos. El código expira en 15 minutos.</p>
            </div>
          </div>
        )}

        <form className="auth-form" onSubmit={e => e.preventDefault()}>
          <div className="auth-row">
            <label htmlFor="forgot-email">Correo</label>
            <input id="forgot-email" className="auth-input" type="email"
              placeholder="tu.correo@colegio.cl" autoComplete="email"/>
          </div>
          <button type="submit" className="auth-submit">
            {sent ? 'Reenviar enlace' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="auth-foot">
          <a href="#login" className="auth-link-inline">← Volver a iniciar sesión</a>
        </div>
      </div>
    </main>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// SCREEN: Reset password (confirm with code + new password)
// ──────────────────────────────────────────────────────────────────────
const ResetScreen = () => {
  const [code, setCode] = React.useState(['','','','','','']);
  const refs = React.useRef([]);
  const setDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code]; next[i] = v; setCode(next);
    if (v && i < 5) refs.current[i+1]?.focus();
  };
  return (
    <div className="auth-shell">
      <Aside/>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-logo-mobile">
            <img src="../../assets/superprofes-logo.svg" alt="SuperProfes"/>
          </div>
          <div className="auth-steps">
            <div className="step is-done"><span className="num"><Icon name="check" size={12}/></span>Correo</div>
            <div className="sep"/>
            <div className="step is-active"><span className="num">2</span>Código</div>
            <div className="sep"/>
            <div className="step"><span className="num">3</span>Nueva clave</div>
          </div>
          <h1 className="auth-title">Ingresa tu código</h1>
          <p className="auth-sub">Enviamos un código de 6 dígitos a <strong>antonia@colegio.cl</strong>. Expira en 15 minutos.</p>

          <form className="auth-form" onSubmit={e => e.preventDefault()}>
            <div className="auth-row">
              <label>Código de verificación</label>
              <div className="auth-otp">
                {code.map((d, i) => (
                  <input
                    key={i} ref={el => refs.current[i] = el}
                    inputMode="numeric" maxLength={1} value={d}
                    onChange={e => setDigit(i, e.target.value)}
                    aria-label={`Dígito ${i+1}`}
                  />
                ))}
              </div>
            </div>
            <div className="auth-row">
              <label htmlFor="reset-pw">Nueva contraseña</label>
              <input id="reset-pw" className="auth-input" type="password"
                placeholder="Mínimo 8 caracteres" autoComplete="new-password"/>
            </div>
            <div className="auth-row">
              <label htmlFor="reset-pw2">Confirmar contraseña</label>
              <input id="reset-pw2" className="auth-input" type="password"
                placeholder="Repite la nueva contraseña" autoComplete="new-password"/>
            </div>
            <button type="submit" className="auth-submit">Cambiar contraseña</button>
          </form>

          <div className="auth-foot">
            ¿No recibiste el código? <a href="#resend" className="auth-link-inline">Reenviar</a>
          </div>
        </div>
      </main>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// SCREEN: Success (after password reset / register confirmation)
// ──────────────────────────────────────────────────────────────────────
const SuccessScreen = ({
  title = '¡Listo!',
  message = 'Tu contraseña fue actualizada. Ya puedes entrar con tu nueva clave.',
  cta = 'Ir a iniciar sesión',
}) => (
  <div className="auth-shell">
    <Aside/>
    <main className="auth-main">
      <div className="auth-card auth-success">
        <div className="auth-success-icon"><Icon name="check-circle" size={32}/></div>
        <h1 className="auth-title" style={{textAlign:'center'}}>{title}</h1>
        <p className="auth-sub" style={{textAlign:'center'}}>{message}</p>
        <button className="auth-submit">{cta}</button>
      </div>
    </main>
  </div>
);

// ──────────────────────────────────────────────────────────────────────
// SCREEN: Verify email (post-register, awaits link click)
// ──────────────────────────────────────────────────────────────────────
const VerifyEmailScreen = () => (
  <div className="auth-shell">
    <Aside/>
    <main className="auth-main">
      <div className="auth-card">
        <div className="auth-logo-mobile">
          <img src="../../assets/superprofes-logo.svg" alt="SuperProfes"/>
        </div>
        <div className="auth-success-icon" style={{margin:'0 0 20px'}}>
          <Icon name="mail" size={28}/>
        </div>
        <h1 className="auth-title">Verifica tu correo</h1>
        <p className="auth-sub">Te enviamos un enlace a <strong>antonia@colegio.cl</strong>. Haz clic en el enlace para activar tu cuenta. El correo puede tardar un par de minutos.</p>

        <button className="auth-submit" style={{background:'#fff', color:'var(--fg-1)', border:'1px solid var(--border-strong)'}}>
          <Icon name="refresh-cw" size={16}/> Reenviar correo
        </button>
        <div className="auth-foot">
          <a href="#login" className="auth-link-inline">Cambiar correo</a>
        </div>
      </div>
    </main>
  </div>
);

window.LoginScreen = LoginScreen;
window.RegisterScreen = RegisterScreen;
window.ForgotScreen = ForgotScreen;
window.ResetScreen = ResetScreen;
window.SuccessScreen = SuccessScreen;
window.VerifyEmailScreen = VerifyEmailScreen;
