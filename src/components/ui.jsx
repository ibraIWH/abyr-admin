import { IconCheck } from './Icons';

export function Button({
  children,
  variant = 'primary', // primary | ghost | danger | subtle
  size = 'md', // sm | md
  icon = null,
  loading = false,
  className = '',
  ...rest
}) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <span className="btn__spinner" /> : icon}
      {children && <span>{children}</span>}
    </button>
  );
}

export function Field({ label, hint, error, as, children, className = '', ...rest }) {
  return (
    <label className={`field ${className}`}>
      {label && <span className="field__label">{label}</span>}
      {children ? (
        children
      ) : as === 'textarea' ? (
        <textarea className={`input ${error ? 'input--error' : ''}`} {...rest} />
      ) : (
        <input className={`input ${error ? 'input--error' : ''}`} {...rest} />
      )}
      {error ? (
        <span className="field__error">{error}</span>
      ) : hint ? (
        <span className="field__hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function Select({ label, hint, value, onChange, options, className = '', ...rest }) {
  return (
    <label className={`field ${className}`}>
      {label && <span className="field__label">{label}</span>}
      <div className="select-wrap">
        <select className="input" value={value} onChange={onChange} {...rest}>
          {options.map((o) =>
            typeof o === 'string' ? (
              <option key={o} value={o}>
                {o}
              </option>
            ) : (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            )
          )}
        </select>
        <span className="select-caret" />
      </div>
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? 'toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="toggle__track"><span className="toggle__thumb" /></span>
      {label && <span className="toggle__label">{label}</span>}
    </button>
  );
}

export function Badge({ children, fg, bg, className = '' }) {
  return (
    <span className={`badge ${className}`} style={{ color: fg, background: bg }}>
      {children}
    </span>
  );
}

export function Spinner({ size = 22 }) {
  return <span className="spinner" style={{ width: size, height: size }} />;
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty">
      {icon && <div className="empty__icon">{icon}</div>}
      <div className="empty__title">{title}</div>
      {message && <div className="empty__message">{message}</div>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

// Multi-select chips (used for product sizes).
export function Chips({ options, value, onToggle }) {
  return (
    <div className="chips">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            className={`chip ${active ? 'chip--on' : ''}`}
            onClick={() => onToggle(opt)}
          >
            {active && <IconCheck size={13} />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}
