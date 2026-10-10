import {useLanguage} from '../language';
import {useState, useEffect, useRef} from 'react';
import Cookies from 'universal-cookie';
const Icon = ({type}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">{type === 'search' ? <><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></> : type === 'bag' ? <><path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/></> : <><circle cx="12" cy="7" r="3.5"/><path d="M5 22v-3a7 7 0 0 1 14 0v3"/></>}</svg>;
export default function Nav({campaign = false}) {
  const {t, lang, toggleLanguage} = useLanguage();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  useEffect(()=>{
    const update=()=>{const bag=new Cookies().get('cartData');setCount(Array.isArray(bag)?bag.reduce((sum,p)=>sum+(Number(p.quantity)||0),0):0);};
    update();window.addEventListener('cartItemUpdated',update);
    return()=>window.removeEventListener('cartItemUpdated',update);
  },[]);
  const menuButton = useRef(null);
  const closeButton = useRef(null);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = e => {
      if (e.key === 'Escape') {setOpen(false); menuButton.current?.focus();}
      if (e.key === 'Tab') {
        const controls = Array.from(document.querySelectorAll('#collection-menu button, #collection-menu a'));
        const first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {e.preventDefault(); last.focus();}
        else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first.focus();}
      }
    };
    document.addEventListener('keydown', escape);
    return () => {document.body.style.overflow = previous; document.removeEventListener('keydown', escape);};
  }, [open]);
  return <header className={`lux-header ${campaign ? 'lux-header-campaign' : ''}`}>
    <div className="lux-utility" dir="ltr">
      <div className="lux-utility-left"><button ref={menuButton} type="button" className="lux-menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="collection-menu"><span aria-hidden="true">☰</span><span>{t('منو', 'Menu')}</span></button><a href="/contact-us/" className="lux-contact">{t('ارتباط با ما', 'Contact us')}</a></div>
      {!campaign && <a className="lux-small-wordmark" href="/" aria-label="Benico home">BENICO</a>}
      <div className="lux-actions"><button className="language-switch" type="button" onClick={toggleLanguage} aria-label={t('Switch to English', 'تغییر زبان به فارسی')}>{lang === 'fa' ? 'EN' : 'فارسی'}</button><a href="/search/" aria-label={t('جستجو', 'Search')}><Icon type="search"/></a><a href="/accounts/" aria-label={t('حساب کاربری', 'Account')}><Icon type="account"/></a><a href="/cart/" aria-label={t('سبد خرید', 'Shopping bag')}><Icon type="bag"/>{count>0&&<span className="nav-bag-count">{count}</span>}</a></div>
    </div>
    {campaign && <a href="/" className="lux-wordmark" aria-label="Benico home">BENICO</a>}
    {open && <><button className="menu-backdrop" onClick={() => {setOpen(false); menuButton.current?.focus();}} aria-label={t('بستن پس‌زمینه منو', 'Close menu overlay')} tabIndex={-1}/><nav id="collection-menu" className="lux-menu" aria-label={t('دسته بندی محصولات', 'Product collections')} dir={lang === 'fa' ? 'rtl' : 'ltr'}><button ref={closeButton} type="button" onClick={() => {setOpen(false); menuButton.current?.focus();}} aria-label={t('بستن منو', 'Close menu')}>×</button><p className="lux-eyebrow">EXPLORE BENICO</p><a href="/products/">{t('همه محصولات', 'All products')}</a><a href="/products/t-shirt/1/">{t('تیشرت', 'T-shirts')}</a><a href="/products/hoodie/1/">{t('هودی', 'Hoodies')}</a><a href="/products/sweatshirt/1/">{t('دورس', 'Sweatshirts')}</a><a href="/contact-us/">{t('دنیای بنیکو', 'The world of Benico')}</a></nav></>}
  </header>;
}
