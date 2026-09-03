import { useRef, useState } from 'react';
import api, { apiError } from '../api';
import { IconImage } from './Icons';

// Image is set either by uploading a file (goes through our backend to
// Cloudinary) or by pasting a direct URL. Both write the final URL back
// through onChange, so every screen using this field works the same way.
export default function ImageField({ label, value, onChange, hint, aspect = '3 / 4' }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const looksLikeUrl = typeof value === 'string' && /^https?:\/\//i.test(value.trim());

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);

      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url) {
        onChange(res.data.url);
      } else {
        setError('Upload did not return a URL.');
      }
    } catch (err) {
      setError(apiError(err));
    } finally {
      setUploading(false);
      // reset so selecting the same file again still fires onChange
      if (fileRef.current) fileRef.current.value = '';
    }
  };

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
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />

          <button
            type="button"
            className="btn btn--dark"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ marginBottom: 8 }}
          >
            {uploading ? 'Uploading…' : 'Choose from device'}
          </button>

          <input
            className="input"
            placeholder="…or paste an image link (https://…)"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />

          {error
            ? <span className="field__hint" style={{ color: '#c0392b' }}>{error}</span>
            : <span className="field__hint">{hint || 'Upload a photo, or paste a direct image link.'}</span>}
        </div>
      </div>
    </div>
  );
}