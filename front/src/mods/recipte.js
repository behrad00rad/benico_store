import {useParams} from 'react-router-dom';
import {useLanguage} from '../language';
export default function Recipte() {
  const {id} = useParams();
  const {t} = useLanguage();
  return <section className="order-confirmation"><p className="lux-eyebrow">BENICO / ORDER</p><h1>{t('سفارش ثبت شد', 'Order received')} #{id}</h1><p>{t('این سفارش پرداخت نشده است. درگاه پرداخت هنوز متصل نیست.', 'This order is unpaid. The payment gateway is not connected yet.')}</p><a className="lux-button lux-button-dark" href="/dashboard/orders/">{t('سفارش‌های من', 'My orders')}</a><a className="lux-text-link" href="/products/">{t('ادامه خرید', 'Continue shopping')}</a></section>;
}
