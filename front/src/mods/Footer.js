import {useLanguage} from '../language';
import logo from '../logo.png';
import { useContext } from 'react';
import { ThemeContext } from './themeprovider';
export default function Footer() {
  const {t, lang} = useLanguage();
  const theme = useContext(ThemeContext);
  return <footer className="site-footer" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
    <div className="footer-grid">
      <div className="footer-brand"><a href="/"><img src={logo} className={theme === 'benilight' ? 'invert' : ''} alt="Benico" /></a><p>{t('بیش از مد و زیبایی؛ معرف شخصیت شما هستیم.', 'More than fashion. An expression of you.')}</p></div>
      <div><h2>{t('بنیکو', 'Benico')}</h2><a href="/contact-us/">{t('ارتباط با ما', 'Contact us')}</a><a href="https://www.instagram.com/benico.clothing/" dir="ltr">@benico.clothing</a><a href="/admin/">{t('مدیریت فروشگاه', 'Store admin')} ↗</a></div>
      <div><h2>{t('محصولات', 'Products')}</h2><a href="/products/t-shirt/1/">{t('تیشرت', 'T-shirts')}</a><a href="/products/hoodie/1/">{t('هودی', 'Hoodies')}</a><a href="/products/sweatshirt/1/">{t('دورس', 'Sweatshirts')}</a></div>
    </div>
    <p className="footer-copyright" dir="ltr">© {new Date().getFullYear()} Benico clothing. All rights reserved.</p>
  </footer>;
}
