import {useLanguage} from '../language';
import React, {useEffect, useState} from 'react';
import Nav from './nav';
import {useStoreMotion, tiltCard, resetTilt} from './motion';
import Prod from './prods';
import Footer from './Footer';
import campaign from '../assets/campaign.png';
import infinite from '../assets/infinite.jpg';
export default function Main() {
  const {t, lang} = useLanguage();
  const motionRef = useStoreMotion();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('http://127.0.0.1:2000/product/recommend/', {signal:controller.signal})
      .then(r => {if (!r.ok) throw new Error('Request failed'); return r.json();})
      .then(catalog => {if (!controller.signal.aborted) setProducts(catalog.data);})
      .catch(e => {if (e.name !== 'AbortError') setError(true);})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, []);
  return <main className="lux-home" ref={motionRef}><div className="reading-progress" aria-hidden="true"/>
    <nav className="walkthrough-nav" aria-label={t('مسیر کشف مجموعه', 'Collection walkthrough')}><a href="#campaign">01 <span>{t('شروع', 'The edit')}</span></a><a href="#collections">02 <span>{t('مجموعه', 'Collection')}</span></a><a href="#pieces">03 <span>{t('محصولات', 'Pieces')}</span></a></nav>
    <section id="campaign" data-chapter className="lux-campaign">
      <img className="lux-campaign-image" src={campaign} alt={t('تیشرت بنیکو با طرح سیاره', 'Benico planet graphic T-shirt')} fetchpriority="high" />
      <Nav campaign />
      <div className="lux-campaign-copy" dir={lang === 'fa' ? 'rtl' : 'ltr'}><p className="lux-eyebrow">THE BENICO EDIT</p><h1>{t('فراتر از روزمره', 'Beyond the everyday')}</h1><a className="lux-button" href="/products/t-shirt/1/">{t('کشف مجموعه', 'Explore the collection')}</a></div>
      <a className="lux-scroll" href="#collections">{t('برای کشف بیشتر', 'SCROLL TO DISCOVER')} <span>↓</span></a>
    </section>
    <div className="brand-ticker" aria-hidden="true"><div>{Array.from({length: 4}, (_, i) => <span key={i}>BENICO <i>✳</i> WEAR YOUR PERSPECTIVE <i>✳</i> BE YOURSELF <i>✳</i> </span>)}</div></div>
    <section data-reveal data-chapter className="lux-intro" id="collections" dir={lang === 'fa' ? 'rtl' : 'ltr'}><p className="lux-eyebrow">02 / BENICO CLOTHING</p><h2>{t('بیان تازه\u200cای از استایل شما', 'Wear your own perspective')}</h2><p>{t('طرح\u200cهایی برای بیان شخصیت شما. مجموعه بنیکو را کشف کنید.', 'Individual expression, everyday essentials. Discover Benico.')}</p></section>
    <section className="lux-editorial-grid">
      <a data-reveal onPointerMove={tiltCard} onPointerLeave={resetTilt} className="lux-editorial" href="/products/t-shirt/1/"><img src={infinite} alt={t('تیشرت Infinite بنیکو', 'Benico Infinite T-shirt')} loading="lazy"/><div dir={lang === 'fa' ? 'rtl' : 'ltr'}><p className="lux-eyebrow">THE INFINITE EDIT</p><h2>{t('تیشرت\u200cها', 'The T-shirt edit')}</h2><span>{t('مشاهده مجموعه', 'Discover the collection')}</span></div></a>
      <a data-reveal onPointerMove={tiltCard} onPointerLeave={resetTilt} className="lux-editorial lux-editorial-photo" href="/item/7000/"><img src={campaign} alt={t('نمای استایل با تیشرت بنیکو', 'Benico campaign styling')} loading="lazy"/><div dir={lang === 'fa' ? 'rtl' : 'ltr'}><p className="lux-eyebrow">A DIFFERENT PERSPECTIVE</p><h2>{t('استایل، به شیوه شما', 'Style, your way')}</h2><span>{t('کشف محصول', 'Explore the piece')}</span></div></a>
    </section>
    <section id="pieces" data-chapter className="lux-selection"><div data-reveal className="lux-section-heading" dir={lang === 'fa' ? 'rtl' : 'ltr'}><p className="lux-eyebrow">03 / SELECTED FOR YOU</p><h2>{t('آخرین محصولات', 'Latest pieces')}</h2></div>
      {loading ? <p className="ui-message" role="status">{t('در حال بارگذاری محصولات…', 'Loading the collection…')}</p> : error ? <p className="ui-message" role="alert">{t('محصولات بارگذاری نشدند. لطفاً صفحه را دوباره بارگذاری کنید.', 'We could not load the collection. Please refresh to try again.')}</p> : products.length ? <div className="home-products">{products.map(product => <Prod key={product.id} prod={product} />)}</div> : <p className="ui-message">{t('محصولی یافت نشد.', 'No products found.')}</p>}
      <a className="lux-text-link" href="/products/">{t('مشاهده همه محصولات', 'View all products')}</a>
    </section>
    <section data-reveal className="lux-story" dir={lang === 'fa' ? 'rtl' : 'ltr'}><p className="lux-eyebrow">THE WORLD OF BENICO</p><h2>{t('شخصیت شما، امضای شما.', 'Your personality. Your signature.')}</h2><a className="lux-button lux-button-dark" href="/contact-us/">{t('ارتباط با بنیکو', 'Meet Benico')}</a></section>
    <Footer />
  </main>;
}
