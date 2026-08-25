import { useEffect, useState } from 'react';
import api, { apiError } from '../api';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/Layout';
import { Button, Field, Toggle, Loading } from '../components/ui';
import ImageField from '../components/ImageField';

export default function HomeContentPage() {
  const toast = useToast();
  const [hero, setHero] = useState(null);
  const [news, setNews] = useState({ newsText: '', newsActive: true });
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
      </div>
    </>
  );
}
