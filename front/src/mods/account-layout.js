import {NavLink,Link} from 'react-router-dom';
import Cookies from 'universal-cookie';
import {useLanguage} from '../language';
import Footer from './Footer';
import './account.css';

export const signOut=()=>{const c=new Cookies();c.remove('token',{path:'/'});c.remove('userinfo',{path:'/'});window.location.href='/accounts/';};
export default function AccountLayout({title,children}){
  const {t}=useLanguage();
  return <><main className="customer-account-page"><header className="account-heading"><p className="commerce-eyebrow">BENICO / YOUR WORLD</p><h1>{t('حساب شما','Your account')}</h1><p>{t('اطلاعات شما و انتخاب‌های شما، در یک جا.','Your details and your chosen pieces, all in one place.')}</p></header><div className="account-columns"><aside className="account-sidebar"><nav aria-label={t('بخش‌های حساب','Account sections')}>{[['detail',t('اطلاعات حساب','Account details')],['orders',t('سفارش‌های من','My orders')],['address',t('نشانی‌ها','Address book')]].map(([key,label],i)=><NavLink key={key} to={`/dashboard/${key}/`} className={({isActive})=>isActive?'active':''}><span>0{i+1}</span>{label} ↗</NavLink>)}</nav><Link to="/products/">{t('بازگشت به مجموعه','Back to the collection')} ↗</Link><button onClick={signOut}>{t('خروج از حساب','Sign out')}</button></aside><section className="account-content"><p className="commerce-eyebrow">YOUR BENICO</p><h2>{title}</h2>{children}</section></div></main><Footer/></>;
}
