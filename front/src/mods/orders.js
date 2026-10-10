import {useLanguage} from '../language';
import {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
export default function Orders() {
  const {t, lang} = useLanguage();
  const token = new Cookies().get('token');
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/auth/get_order/', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token}), signal:controller.signal})
      .then(response => {if (!response.ok) throw new Error(); return response.json();})
      .then(data => {setOrders(data.orders); setStatus('ready');})
      .catch(error => {if (error.name !== 'AbortError') setStatus('error');});
    return () => controller.abort();
  }, [token]);
  const locale = lang === 'fa' ? 'fa-IR' : 'en-GB';
  return <section className="orders-panel"><h1>{t('سفارش‌های شما', 'Your orders')}</h1>
    {status === 'loading' ? <p role="status">{t('در حال بارگذاری…', 'Loading orders…')}</p> : status === 'error' ? <p role="alert">{t('سفارش‌ها بارگذاری نشد. دوباره وارد شوید.', 'Unable to load orders. Please sign in again.')}</p> : !orders.length ? <p>{t('هنوز سفارشی ثبت نشده است.', 'You have no orders yet.')}</p> : orders.map(order => <details key={order.order_id} className="order-row">
      <summary><span>#{order.order_id}</span><span>{new Date(order.date).toLocaleDateString(locale)}</span><span className="order-status">{order.paid ? t('پرداخت شده', 'Paid') : t('پرداخت نشده', 'Unpaid')}</span></summary>
      <ul>{order.products.map((product, i) => <li key={i}>{product}</li>)}</ul>
      <p>{Number(order.price * 1000).toLocaleString(locale)} {t('تومان', 'toman')}</p><p>{order.address}</p>
    </details>)}
  </section>;
}
