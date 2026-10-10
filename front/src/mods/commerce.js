import {useCallback, useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import {Link} from 'react-router-dom';
import {useLanguage} from '../language';
import './commerce.css';

export function readBag() {
  const value = new Cookies().get('cartData');
  const grouped = new Map();
  if (Array.isArray(value)) value.filter(p=>p && Number.isSafeInteger(p.quantity) && p.quantity>0 && ['L','XL','XXL'].includes(p.size) && /^\d+$/.test(String(p.productId))).forEach(p=>{
    const key=`${p.productId}-${p.size}`;
    grouped.set(key, {...p,productId:String(p.productId),quantity:p.quantity+(grouped.get(key)?.quantity||0)});
  });
  return [...grouped.values()];
}
export function writeBag(items) {
  new Cookies().set('cartData',items,{path:'/',sameSite:'lax'});
  window.dispatchEvent(new CustomEvent('cartItemCountUpdated',{detail:items.length}));
  window.dispatchEvent(new CustomEvent('cartItemUpdated'));
}
export function useBag() {
  const [items,setItems] = useState(readBag);
  const [products,setProducts] = useState({});
  const [status,setStatus] = useState('loading');
  const [revision,setRevision] = useState(0);
  const ids = [...new Set(items.map(p=>String(p.productId)))].sort().join(',');
  useEffect(()=>{
    const update=()=>setItems(readBag());
    window.addEventListener('cartItemUpdated',update);
    return()=>window.removeEventListener('cartItemUpdated',update);
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    setStatus(ids?'loading':'ready');
    if(!ids){setProducts({});return()=>controller.abort();}
    Promise.all(ids.split(',').map(async id=>{
      const r=await fetch(`/product/filtered/${id}/`,{signal:controller.signal});
      if(r.status===404)return [id,null];
      if(!r.ok)throw Error();
      const data=await r.json();return [id,data.data[0]];
    })).then(entries=>{if(!controller.signal.aborted){setProducts(Object.fromEntries(entries));setStatus('ready');}}).catch(e=>{if(e.name!=='AbortError')setStatus('error');});
    return()=>controller.abort();
  },[ids,revision]);
  const refresh=useCallback(()=>setRevision(v=>v+1),[]);
  const total=items.reduce((sum,p)=>sum+(products[p.productId]?.price||0)*p.quantity,0);
  const invalid=status!=='ready'||items.some(p=>!products[p.productId] || p.quantity>Math.max(0,products[p.productId][`${p.size}_count`]||0));
  return {items,products,status,total,invalid,refresh,update:writeBag};
}
export function money(value,lang,t) {return `${Number(value*1000).toLocaleString(lang==='fa'?'fa-IR':'en-GB')} ${t('تومان','toman')}`;}
export function CommerceHeader({title,subtitle,step}) {
  const {t}=useLanguage();
  return <header className="commerce-heading"><p className="commerce-eyebrow">BENICO / {step===1?'YOUR BAG':step===2?'DELIVERY':'YOUR ACCOUNT'}</p><h1>{title}</h1><p>{subtitle}</p>{step&&<nav className="commerce-steps" aria-label={t('مراحل سفارش','Order steps')}><Link to="/cart/" aria-current={step===1?'step':undefined}>01 {t('سبد خرید','Shopping bag')}</Link><span>/</span><Link to="/checkout/" aria-current={step===2?'step':undefined}>02 {t('اطلاعات ارسال','Delivery details')}</Link><span>/</span><span>03 {t('ثبت سفارش','Order confirmation')}</span></nav>}</header>;
}
export function BagSummary({bag,children}) {
  const {t,lang}=useLanguage();
  return <aside className="commerce-summary"><h2>{t('خلاصه سفارش','Order summary')}</h2><div className="summary-lines">{bag.items.map(p=><div key={`${p.productId}-${p.size}`}><span>{bag.products[p.productId]?.title||p.title}<small>{p.size} · {p.quantity} {t('عدد','pieces')}</small></span><b>{bag.products[p.productId]?money(bag.products[p.productId].price*p.quantity,lang,t):'—'}</b></div>)}</div><div className="summary-total"><span>{t('مجموع محصولات','Merchandise total')}</span><strong>{bag.status==='ready'?money(bag.total,lang,t):'—'}</strong></div><p className="commerce-note">{t('هزینه و روش ارسال توسط فروشگاه تأیید می‌شود و در این مبلغ لحاظ نشده است.','Shipping cost and method will be confirmed by the store and are not included in this total.')}</p>{children}<Link className="commerce-help" to="/contact-us/">{t('به کمک نیاز دارید؟ ارتباط با ما','Need help? Contact us')} ↗</Link></aside>;
}
export const emptyDelivery={fname:'',lname:'',state:'',city:'',address:'',PostalCode:'',phoneNumber:''};
export const digits=value=>String(value).replace(/[۰-۹٠-٩]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.includes(c)?'۰۱۲۳۴۵۶۷۸۹'.indexOf(c):'٠١٢٣٤٥٦٧٨٩'.indexOf(c));
export function validateDelivery(values,t) {
  const errors={};
  ['fname','lname','state','city','address'].forEach(key=>{if(!values[key]?.trim())errors[key]=t('این فیلد را تکمیل کنید.','Please complete this field.');});
  if(!/^[0-9]{10}$/.test(digits(values.PostalCode)))errors.PostalCode=t('کد پستی باید ۱۰ رقم باشد.','Enter a 10-digit postal code.');
  if(!/^[0-9]{11}$/.test(digits(values.phoneNumber)))errors.phoneNumber=t('شماره تلفن باید ۱۱ رقم باشد.','Enter an 11-digit phone number.');
  return errors;
}
export function DeliveryFields({value,onChange,errors={},disabled=false}) {
  const {t}=useLanguage();
  const [locations,setLocations]=useState({});
  useEffect(()=>{const c=new AbortController();fetch('/auth/get_loc/',{signal:c.signal}).then(r=>r.json()).then(setLocations).catch(()=>{});return()=>c.abort();},[]);
  const fields=[['fname',t('نام','First name'),'given-name'],['lname',t('نام خانوادگی','Last name'),'family-name'],['state',t('استان','Province'),'address-level1'],['city',t('شهر','City'),'address-level2'],['address',t('نشانی کامل','Street address'),'street-address'],['PostalCode',t('کد پستی','Postal code'),'postal-code'],['phoneNumber',t('شماره تلفن','Phone number'),'tel']];
  return <div className="delivery-fields">{fields.map(([key,label,complete])=><label key={key} className={key==='address'?'delivery-wide':''} htmlFor={`delivery-${key}`}>{label}{key==='address'?<textarea aria-label={label} id={`delivery-${key}`} rows={3} autoComplete={complete} disabled={disabled} maxLength={1024} value={value[key]} onChange={e=>onChange({...value,[key]:e.target.value})} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined}/>:<input aria-label={label} id={`delivery-${key}`} autoComplete={complete} disabled={disabled} maxLength={key==='PostalCode'?10:key==='phoneNumber'?11:255} inputMode={['PostalCode','phoneNumber'].includes(key)?'numeric':undefined} dir={['PostalCode','phoneNumber'].includes(key)?'ltr':undefined} list={key==='state'?'province-options':key==='city'?'city-options':undefined} value={value[key]} onChange={e=>{const next=['PostalCode','phoneNumber'].includes(key)?digits(e.target.value):e.target.value;onChange({...value,[key]:next,...(key==='state'?{city:''}:{})});}} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined}/ >}{errors[key]&&<small id={`error-${key}`} role="alert">{errors[key]}</small>}</label>)}<datalist id="province-options">{Object.keys(locations).map(province=><option key={province} value={province}/>)}</datalist><datalist id="city-options">{[...new Set(locations[value.state]||[])].map(city=><option key={city} value={city}/>)}</datalist></div>;
}
export async function accountRequest(path,options={}) {
  const token=new Cookies().get('token');
  const r=await fetch(`/auth/customer/${path}`,{...options,headers:{Authorization:`Token ${token}`, 'Content-Type':'application/json'}});
  if(r.status===204)return null;
  const data=await r.json();
  if(!r.ok){const error=new Error(data.error||(r.status===401?'Please sign in again.':'Unable to complete this request.'));error.fields=data.fields;throw error;}
  return data;
}
