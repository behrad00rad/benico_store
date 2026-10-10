import {Link,useParams} from 'react-router-dom';
import Cookies from 'universal-cookie';
import {useLanguage} from '../language';
import './commerce.css';
export default function Recipte(){
  const {id}=useParams(),{t}=useLanguage();
  const signedIn=!!new Cookies().get('token');
  return <main className="commerce-page"><section className="commerce-confirmation"><span className="commerce-confirmation-mark">✓</span><p className="commerce-eyebrow">BENICO / ORDER #{id}</p><h1>{t('سفارش شما ثبت شد','Your order is received')}</h1><p>{t('این سفارش پرداخت نشده است. درگاه پرداخت هنوز فعال نیست؛ برای هماهنگی مراحل بعدی با فروشگاه تماس بگیرید.','This order is unpaid. Online payment is not connected yet; contact the store to arrange the next steps.')}</p>{!signedIn&&<p>{t('شماره سفارش را نگه دارید تا بتوانید از فروشگاه پیگیری کنید.','Keep your order number so the store can help you track your guest order.')}</p>}<Link className="commerce-primary" to={signedIn?'/dashboard/orders/':'/contact-us/'}>{signedIn?t('مشاهده سفارش‌های من','View my orders'):t('ارتباط با فروشگاه','Contact the store')} ↗</Link><Link className="commerce-text-button" to="/products/">{t('ادامه انتخاب محصولات','Keep exploring')}</Link></section></main>;
}
