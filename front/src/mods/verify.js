import {useLanguage} from '../language';
import Footer from './Footer';

export default function ContactUs() {
  const {t} = useLanguage();
  const channels = [
    {name: t('ایمیل', 'Email'), detail: 'benico.clothing@gmail.com', href: 'mailto:benico.clothing@gmail.com', text: t('برای پیگیری سفارش یا مطرح کردن پیشنهادها، برایمان بنویسید.', 'Write to us about an order, a question, or an idea.'), action: t('نوشتن ایمیل', 'Write an email')},
    {name: t('اینستاگرام', 'Instagram'), detail: '@benico.clothing', href: 'https://www.instagram.com/benico.clothing/', text: t('مجموعه‌ها را ببینید و سؤال‌هایتان را در دایرکت از ما بپرسید.', 'Explore the collections and send us your questions in a direct message.'), action: t('رفتن به اینستاگرام', 'Visit Instagram')},
    {name: t('تلگرام', 'Telegram'), detail: '@benico_clothing', href: 'https://t.me/benico_clothing', text: t('از طریق تلگرام هم می‌توانید با بنیکو در ارتباط باشید.', 'You can also reach Benico on Telegram.'), action: t('رفتن به تلگرام', 'Open Telegram')},
  ];
  return <>
    <main className="contact-page">
      <a className="contact-breadcrumb" href="/">{t('بنیکو', 'Benico')} <span aria-hidden="true">/</span> {t('تماس با ما', 'Contact us')}</a>
      <section className="contact-intro" aria-labelledby="contact-title">
        <p className="contact-kicker">{t('یک گفت‌وگو، یک شروع', 'LET’S START A CONVERSATION')}</p>
        <h1 id="contact-title">{t('از شما می‌شنویم.', 'We’re listening.')}</h1>
        <p>{t('از انتخاب سایز تا پیگیری سفارش، سؤال‌هایتان را با ما در میان بگذارید. اگر پیشنهادی برای بنیکو دارید، خوشحال می‌شویم بشنویم.', 'From finding your size to following up on an order, share your questions with us. Have an idea for Benico? We’d love to hear it.')}</p>
      </section>
      <section className="contact-channels" aria-label={t('راه‌های ارتباط با بنیکو', 'Ways to contact Benico')}>
        {channels.map((channel, index) => <a className="contact-channel" key={channel.href} href={channel.href} {...(channel.href.startsWith('https:') ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
          <div className="contact-channel-heading"><span className="contact-number" aria-hidden="true">0{index + 1}</span><span className="contact-arrow" aria-hidden="true">↗</span></div>
          <h2>{channel.name}</h2><p className="contact-channel-detail"><bdi>{channel.detail}</bdi></p><p className="contact-channel-copy">{channel.text}</p><span className="contact-channel-action">{channel.action}</span>
        </a>)}
      </section>
      <aside className="contact-order-note"><h2>{t('دربارهٔ سفارشتان می‌پرسید؟', 'Getting in touch about an order?')}</h2><p>{t('شمارهٔ سفارش و نامی را که با آن خرید کرده‌اید در پیامتان بنویسید تا راحت‌تر بتوانیم پیگیری کنیم. وضعیت سفارش را هم می‌توانید در حساب کاربری ببینید.', 'Include your order number and the name used at checkout so we can help you more easily. You can also check your order status in your account.')}</p><a href="/dashboard/orders/">{t('مشاهدهٔ سفارش‌ها', 'View your orders')} <span aria-hidden="true">↗</span></a></aside>
    </main>
    <Footer/>
  </>;
}
