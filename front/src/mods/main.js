import {useLanguage} from '../language';
import React, {useEffect, useState} from 'react';
import Nav from './nav';
import {useStoreMotion, tiltCard, resetTilt} from './motion';
import Prod from './prods';
import Footer from './Footer';
import campaign from '../assets/home-campaign-v4.webp';
import campaignMobile from '../assets/home-campaign-mobile-v4.webp';
import infinite from '../assets/product-shots/infinite-model-v2.webp';
import detail from '../assets/product-shots/infinite-detail-v3.webp';
export default function Main() {
  const {t, lang} = useLanguage();
  const motionRef = useStoreMotion();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [content, setContent] = useState({});
  const copy = (section, key, fallback) => content[section]?.[`${key}_${lang}`] ?? fallback;
  const value = (section, key, fallback) => content[section]?.[key] ?? fallback;
  useEffect(() => {
    const controller = new AbortController();
    fetch('/product/content/', {signal:controller.signal}).then(r=>{if(!r.ok) throw Error();return r.json();}).then(data=>setContent(data.content || {})).catch(()=>{});
    return ()=>controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/product/recommend/', {signal:controller.signal})
      .then(r => {if (!r.ok) throw new Error('Request failed'); return r.json();})
      .then(catalog => {if (!controller.signal.aborted) setProducts(catalog.data);})
      .catch(e => {if (e.name !== 'AbortError') setError(true);})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, []);
  return <main className="lux-home" ref={motionRef}><Nav campaign/><div className="reading-progress" aria-hidden="true"/>
    <nav className="walkthrough-nav" aria-label={t('مسیر دیدن مجموعه', 'Collection walkthrough')}><a href="#campaign">01 <span>{t('شروع', 'The edit')}</span></a><a href="#collections">02 <span>{t('مجموعه', 'Collection')}</span></a><a href="#pieces">03 <span>{t('محصولات', 'Pieces')}</span></a></nav>
    <section id="campaign" data-chapter className="lux-campaign">
      <picture><source media="(max-width:760px)" srcSet={campaignMobile}/><img className="lux-campaign-image" src={value('hero','image','') || campaign} style={{objectPosition:value('hero','position','center')}} alt={copy('hero','alt',t('استایل بنیکو روی صندلی کرومی در استودیوی خاکستری', 'Benico floating outfit on a chrome chair in a gray studio'))} fetchpriority="high" /></picture>
      <div className="lux-campaign-copy" dir={lang === 'fa' ? 'rtl' : 'ltr'}><p className="lux-eyebrow">{value('hero','eyebrow','THE BENICO EDIT')}</p><h1>{copy('hero','title',t('روزمره را به سبک خودت بپوش', 'Beyond the everyday'))}</h1><a className="lux-button" href={value('hero','link','/products/t-shirt/1/')}>{copy('hero','button',t('دیدن مجموعه', 'Explore the collection'))}</a></div>
      <a className="lux-scroll" href="#collections">{t('برای کشف بیشتر', 'SCROLL TO DISCOVER')} <span>↓</span></a>
    </section>
    <div className="brand-ticker" aria-hidden="true"><div>{Array.from({length: 4}, (_, i) => <span key={i}>BENICO <i>✳</i> WEAR YOUR PERSPECTIVE <i>✳</i> BE YOURSELF <i>✳</i> </span>)}</div></div>
    <section data-reveal data-chapter className="lux-intro" id="collections" dir={lang === 'fa' ? 'rtl' : 'ltr'}><p className="lux-eyebrow">02 / BENICO CLOTHING</p><h2>{copy('intro','title',t('ساده بپوش. خودت باش.', 'Wear your own perspective'))}</h2><p>{copy('intro','text',t('تی‌شرت، هودی و دورس؛ برای ترکیب‌های ساده و روزهایی که می‌خواهی خودت باشی. از مجموعه‌های بنیکو، چیزی را انتخاب کن که به سلیقه‌ات نزدیک است.', 'Individual expression, everyday essentials. Discover Benico.'))}</p></section>
    <section className="lux-editorial-grid">
      {['editorial_one','editorial_two'].filter(section=>value(section,'enabled',true)).map(section=><a key={section} data-reveal onPointerMove={tiltCard} onPointerLeave={resetTilt} className={`lux-editorial ${section==='editorial_two' ? 'lux-editorial-photo' : ''}`} href={value(section,'link',section==='editorial_one'?'/products/t-shirt/1/':'/item/7000/')}><img src={value(section,'image','') || (section==='editorial_one'?infinite:detail)} alt={copy(section,'alt',t('محصولات بنیکو','Benico clothing'))} loading="lazy"/><div dir={lang==='fa'?'rtl':'ltr'}><p className="lux-eyebrow">{value(section,'eyebrow',section==='editorial_one'?'THE INFINITE EDIT':'IN THE DETAILS')}</p><h2>{copy(section,'title',section==='editorial_one'?t('تی‌شرت‌های بنیکو','The T-shirt edit'):t('جزئیات، از نزدیک','A closer look'))}</h2><span>{copy(section,'button',t('مشاهده مجموعه','Discover the collection'))}</span></div></a>)}
    </section>
    <section id="pieces" data-chapter className="lux-selection"><div data-reveal className="lux-section-heading" dir={lang === 'fa' ? 'rtl' : 'ltr'}><p className="lux-eyebrow">03 / SELECTED FOR YOU</p><h2>{t('آخرین محصولات', 'Latest pieces')}</h2></div>
      {loading ? <p className="ui-message" role="status">{t('در حال بارگذاری محصولات…', 'Loading the collection…')}</p> : error ? <p className="ui-message" role="alert">{t('محصولات بارگذاری نشدند. لطفاً صفحه را دوباره بارگذاری کنید.', 'We could not load the collection. Please refresh to try again.')}</p> : products.length ? <div className="home-products">{products.map(product => <Prod key={product.id} prod={product} />)}</div> : <p className="ui-message">{t('محصولی یافت نشد.', 'No products found.')}</p>}
      <a className="lux-text-link" href="/products/">{t('مشاهده همه محصولات', 'View all products')}</a>
    </section>
    {value('story','enabled',true) && <section data-reveal className="lux-story" dir={lang==='fa'?'rtl':'ltr'}><p className="lux-eyebrow">{value('story','eyebrow','THE WORLD OF BENICO')}</p><h2>{copy('story','title',t('سلیقهٔ تو، امضای استایل تو.','Your personality. Your signature.'))}</h2><a className="lux-button lux-button-dark" href={value('story','link','/contact-us/')}>{copy('story','button',t('گفت‌وگو با بنیکو','Meet Benico'))}</a></section>}
    <Footer />
  </main>;
}
