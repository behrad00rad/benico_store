import {useLanguage} from '../language';
import {useState, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import Cookies from 'universal-cookie';
import SearchBar from './searchbar';
import './navigation.css';
const Icon = ({type}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">{type === 'search' ? <><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></> : type === 'bag' ? <><path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/></> : <><circle cx="12" cy="7" r="3.5"/><path d="M5 22v-3a7 7 0 0 1 14 0v3"/></>}</svg>;
export default function Nav({campaign = false}) {
  const {t, lang, toggleLanguage} = useLanguage();
  const [panel, setPanel] = useState(null), [count, setCount] = useState(0), [scrolled, setScrolled] = useState(false), [hidden, setHidden] = useState(false);
  const sheet = useRef(null), opener = useRef(null);
  const immersive = campaign || window.location.pathname.startsWith('/item/');
  const close = () => {setPanel(null);};
  const show = (name, event) => {opener.current = event.currentTarget; setPanel(name); setHidden(false);};
  useEffect(() => {
    let last = window.scrollY, anchor = last;
    const update = () => {
      const y = Math.max(0, window.scrollY);
      setScrolled(y > 40);
      if (Math.abs(y - anchor) > 8) {setHidden(y > 220 && y > last); anchor = y;}
      if (y < 40) setHidden(false);
      last = y;
    };
    update(); window.addEventListener('scroll', update, {passive:true});
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    const update = () => {const bag = new Cookies().get('cartData'); setCount(Array.isArray(bag) ? bag.reduce((sum,p) => sum + (Number(p.quantity) || 0), 0) : 0);};
    update(); window.addEventListener('cartItemUpdated', update);
    return () => window.removeEventListener('cartItemUpdated', update);
  }, []);
  useEffect(() => {
    if (!panel) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = document.getElementById('root'), wasInert = root?.inert;
    if (root) root.inert = true;
    const controls = () => [...sheet.current.querySelectorAll('button, a, input')].filter(el => !el.disabled && el.tabIndex !== -1 && window.getComputedStyle(el).display !== 'none');
    (panel === 'search' ? sheet.current.querySelector('input') : controls()[0])?.focus();
    const keys = event => {
      if (event.key === 'Escape') {event.preventDefault(); setPanel(null);}
      if (event.key === 'Tab') {
        const list = controls(), first = list[0], last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
        else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
      }
    };
    document.addEventListener('keydown', keys);
    return () => {document.body.style.overflow = previous; if (root) root.inert = wasInert; document.removeEventListener('keydown', keys); opener.current?.focus();};
  }, [panel]);
  return <>
    {!immersive && <div className="nav-spacer"/>}
    <header className={`lux-header benico-navigation ${immersive ? 'nav-immersive' : ''} ${campaign ? 'nav-campaign' : ''} ${scrolled ? 'nav-scrolled' : ''} ${hidden && !panel ? 'nav-hidden' : ''}`}>
      <div className="lux-utility" dir="ltr">
        <div className="lux-utility-left">
          <button className="nav-icon nav-menu-trigger" onClick={event => show('menu',event)} aria-label={t('منو','Menu')} aria-expanded={panel === 'menu'} aria-controls="collection-menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg><span>{t('منو','Menu')}</span></button>
          <button className="nav-icon" onClick={event => show('search',event)} aria-label={t('جستجو','Search')} aria-expanded={panel === 'search'} aria-controls="search-flyout"><Icon type="search"/></button>
          <a href="/contact-us/" className="lux-contact">{t('تماس با ما','Contact us')}</a>
        </div>
        <a className="lux-small-wordmark" href="/" aria-label="Benico home">BENICO</a>
        <div className="lux-actions">
          <button className="language-switch" onClick={toggleLanguage} aria-label={t('Switch to English','تغییر زبان به فارسی')} dir="ltr"><span lang="fa" className={lang === 'fa' ? 'is-active' : ''}>فا</span><span className="language-divider" aria-hidden="true">/</span><span lang="en" className={lang === 'en' ? 'is-active' : ''}>eng</span></button>
          <a href="/accounts/" className="nav-icon nav-account" aria-label={t('حساب کاربری','Account')}><Icon type="account"/></a>
          <a href="/cart/" className="nav-icon" aria-label={t('سبد خرید','Shopping bag')}><Icon type="bag"/>{count > 0 && <span className="nav-bag-count">{count}</span>}</a>
        </div>
      </div>
    </header>
    {panel && createPortal(<div className={`nav-overlay-shell ${panel === 'search' ? 'is-search' : 'is-menu'}`} lang={lang} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <button className="nav-scrim" onClick={close} tabIndex={-1} aria-label={t('بستن پس‌زمینه منو','Close menu overlay')}/>
      <div ref={sheet} className="nav-sheet" role="dialog" aria-modal="true" aria-label={panel === 'search' ? t('جستجوی بنیکو','Search Benico') : t('منوی بنیکو','Benico menu')}>
        <div className="nav-sheet-top"><span>BENICO</span><button className="nav-close" onClick={close} aria-label={panel === 'search' ? t('بستن جستجو','Close search') : t('بستن منو','Close menu')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m5 5 14 14M5 19 19 5"/></svg></button></div>
        {panel === 'search' ? <div id="search-flyout"><SearchBar/></div> : <nav id="collection-menu" className="nav-collections" aria-label={t('دسته بندی محصولات','Product collections')}>
          <p className="nav-kicker">{t('به دنیای بنیکو خوش آمدی','THE WORLD OF BENICO')}</p>
          <div className="nav-primary-links">{[['/products/','همه محصولات','All pieces'],['/products/t-shirt/1/','تی‌شرت','T-shirts'],['/products/hoodie/1/','هودی','Hoodies'],['/products/sweatshirt/1/','دورس','Sweatshirts']].map(([href,fa,en],i) => <a key={href} href={href}><span className="nav-link-number">0{i+1}</span><span>{t(fa,en)}</span><span aria-hidden="true">↗</span></a>)}</div>
          <div className="nav-secondary-links"><button onClick={() => setPanel('search')}>{t('جستجوی محصولات','Search the collection')} <Icon type="search"/></button><a href="/accounts/">{t('حساب کاربری','Your account')}</a><a href="/contact-us/">{t('تماس با ما','Contact us')}</a></div>
          <div className="nav-sheet-bottom"><p>{t('ساده بپوش. خودت باش.','Wear your own perspective.')}</p><button onClick={toggleLanguage} dir="ltr">فا / eng</button></div>
        </nav>}
      </div>
    </div>,document.body)}
  </>;
}
