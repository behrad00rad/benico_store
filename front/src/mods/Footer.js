import {useLanguage} from '../language';
export default function Footer() {
  const {t, lang} = useLanguage();
  return <footer className="site-footer" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
    <div className="footer-grid">
      <div className="footer-brand"><a className="footer-wordmark" href="/" aria-label={t('صفحه اصلی بنیکو', 'Benico home')} dir="ltr">BENICO</a><p>{t('برای روزهای معمولی، با سلیقه‌ای که معمولی نیست. بنیکو را به شیوهٔ خودت بپوش.', 'Everyday pieces, with a perspective of your own. Wear Benico your way.')}</p></div>
      <div className="footer-links"><h2>{t('همراه بنیکو', 'Stay connected')}</h2><a href="/contact-us/">{t('تماس با ما', 'Contact us')}</a><a href="/accounts/">{t('حساب کاربری', 'Your account')}</a><a href="https://www.instagram.com/benico.clothing/">{t('اینستاگرام بنیکو', 'Instagram')}</a></div>
      <div className="footer-links"><h2>{t('مجموعه‌ها', 'Collections')}</h2><a href="/products/t-shirt/1/">{t('تی‌شرت', 'T-shirts')}</a><a href="/products/hoodie/1/">{t('هودی', 'Hoodies')}</a><a href="/products/sweatshirt/1/">{t('دورس', 'Sweatshirts')}</a></div>
    </div>
    <div className="footer-bottom"><p className="footer-copyright">{t(`© ${new Date().getFullYear()} بنیکو. همهٔ حقوق محفوظ است.`, `© ${new Date().getFullYear()} Benico. All rights reserved.`)}</p><a href="mailto:benico.clothing@gmail.com"><bdi>benico.clothing@gmail.com</bdi></a></div>
  </footer>;
}
