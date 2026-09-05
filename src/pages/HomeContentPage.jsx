import { useEffect, useState } from 'react';
import api, { apiError } from '../api';
import ImageField from '../components/ImageField';
import { PageHeader } from '../components/Layout';
import { Button, Field, Loading, Toggle } from '../components/ui';
import { useToast } from '../context/ToastContext';

export default function HomeContentPage() {
  const toast = useToast();
  const [hero, setHero] = useState(null);
  const [news, setNews] = useState({ newsText: '', newsActive: true });
  const [promo, setPromo] = useState({ code: '', line1: '', line2: '', subtitle: '', active: true });
  const [savingPromo, setSavingPromo] = useState(false);
  const [error, setError] = useState('');
  const [savingHero, setSavingHero] = useState(false);
  const [savingNews, setSavingNews] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        const d = res.data || {};
        setHero({
          eyebrow: d.hero?.eyebrow || '',
          title: d.hero?.title || '',
          subtitle: d.hero?.subtitle || '',
          imageUrl: d.hero?.imageUrl || '',
          ctaText: d.hero?.ctaText || '',
          ctaLink: d.hero?.ctaLink || '',
        });
        setNews({ newsText: d.newsText || '', newsActive: d.newsActive ?? true });
        setPromo({
          code: d.promo?.code || '',
          line1: d.promo?.line1 || '',
          line2: d.promo?.line2 || '',
          subtitle: d.promo?.subtitle || '',
          active: d.promo?.active ?? true,
        });
      })
      .catch((err) => setError(apiError(err)));
  }, []);

  const setH = (k, v) => setHero((f) => ({ ...f, [k]: v }));

  const saveHero = async () => {
    setSavingHero(true);
    try {
      await api.put('/settings', { hero });
      toast.success('Home hero updated');
    } catch (e) { toast.error(apiError(e)); }
    setSavingHero(false);
  };

  const saveNews = async () => {
    setSavingNews(true);
    try {
      await api.put('/settings', { newsText: news.newsText, newsActive: news.newsActive });
      toast.success('Banner updated');
    } catch (e) { toast.error(apiError(e)); }
    setSavingNews(false);
  };

  const savePromo = async () => {
    setSavingPromo(true);
    try {
      await api.put('/settings', { promo });
      toast.success('Promo banner updated');
    } catch (e) { toast.error(apiError(e)); }
    setSavingPromo(false);
  };

  if (error) return (<><PageHeader title="Home & Banner" /><div className="card card__pad muted">{error}</div></>);
  if (!hero) return (<><PageHeader title="Home & Banner" /><Loading /></>);

  return (
    <>
      <PageHeader title="Home & Banner" subtitle="The first things customers see when they open your store." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
        {/* Hero */}
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">Home hero</div>
              <div className="card__hint">The big banner at the top of the home screen.</div>
            </div>
          </div>
          <div className="card__pad">
            <div className="form-stack">
              <Field label="Eyebrow" placeholder="New Season" value={hero.eyebrow} onChange={(e) => setH('eyebrow', e.target.value)} hint="Small line above the title." />
              <Field label="Title" placeholder="Timeless Modesty" value={hero.title} onChange={(e) => setH('title', e.target.value)} />
              <Field as="textarea" label="Subtitle" placeholder="Discover our latest abaya collection." value={hero.subtitle} onChange={(e) => setH('subtitle', e.target.value)} />
              <ImageField label="Background image" aspect="16 / 9" value={hero.imageUrl} onChange={(v) => setH('imageUrl', v)} />
              <div className="field-row">
                <Field label="Button text" placeholder="Shop now" value={hero.ctaText} onChange={(e) => setH('ctaText', e.target.value)} />
                <Field label="Button link" placeholder="/shop" value={hero.ctaLink} onChange={(e) => setH('ctaLink', e.target.value)} />
              </div>
              <div><Button onClick={saveHero} loading={savingHero}>Save hero</Button></div>
            </div>
          </div>
        </div>

        {/* News banner */}
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">News banner</div>
              <div className="card__hint">The thin strip across the top — usually a delivery or promo message.</div>
            </div>
          </div>
          <div className="card__pad">
            <div className="form-stack">
              <Field label="Message" placeholder="Free delivery on orders over SAR 300" value={news.newsText} onChange={(e) => setNews((n) => ({ ...n, newsText: e.target.value }))} />
              <div className="field">
                <span className="field__label">Visibility</span>
                <Toggle checked={news.newsActive} onChange={(v) => setNews((n) => ({ ...n, newsActive: v }))} label={news.newsActive ? 'Showing on storefront' : 'Hidden'} />
              </div>
              <div><Button onClick={saveNews} loading={savingNews}>Save banner</Button></div>
            </div>
          </div>
        </div>

        {/* Promo banner (deep red, middle of home) */}
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">Promo banner</div>
              <div className="card__hint">The deep-red offer banner in the middle of the home screen.</div>
            </div>
          </div>
          <div className="card__pad">
            <div className="form-stack">
              <Field label="Code" placeholder="B2G3" value={promo.code} onChange={(e) => setPromo((p) => ({ ...p, code: e.target.value }))} hint="Shown as 'CODE B2G3' above the title." />
              <div className="field-row">
                <Field label="Line 1" placeholder="Buy 2" value={promo.line1} onChange={(e) => setPromo((p) => ({ ...p, line1: e.target.value }))} />
                <Field label="Line 2" placeholder="Get 3rd Free" value={promo.line2} onChange={(e) => setPromo((p) => ({ ...p, line2: e.target.value }))} />
              </div>
              <Field label="Subtitle" placeholder="On all summer abayas" value={promo.subtitle} onChange={(e) => setPromo((p) => ({ ...p, subtitle: e.target.value }))} />
              <div className="field">
                <span className="field__label">Visibility</span>
                <Toggle checked={promo.active} onChange={(v) => setPromo((p) => ({ ...p, active: v }))} label={promo.active ? 'Showing on home' : 'Hidden'} />
              </div>
              <div><Button onClick={savePromo} loading={savingPromo}>Save promo</Button></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}