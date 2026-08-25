import { IconImage } from './Icons';

// Phase 2: image is set by URL with a live preview.
// Phase 3 will add a "Choose from device" button here that uploads to
// Cloudinary and writes the returned secure URL back through onChange —
// every screen that uses this field upgrades for free.
export default function ImageField({ label, value, onChange, hint, aspect = '3 / 4' }) {
  const looksLikeUrl = typeof value === 'string' && /^https?:\/\//i.test(value.trim());

  return (
    <div className="field imagefield">
      {label && <span className="field__label">{label}</span>}
      <div className="imagefield__row">
        <div className="imagefield__preview" style={{ aspectRatio: aspect }}>
          {looksLikeUrl ? (
            <img src={value} alt="" onError={(e) => (e.currentTarget.style.opacity = 0.2)} />
          ) : (
            <span className="imagefield__placeholder"><IconImage size={22} /></span>
          )}
        </div>
        <div className="imagefield__input">
          <input
            className="input"
            placeholder="https://…"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="field__hint">{hint || 'Paste a direct image link (https://…).'}</span>
        </div>
      </div>
    </div>
  );
}
