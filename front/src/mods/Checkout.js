import {useEffect,useRef,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import Cookies from 'universal-cookie';
import {useLanguage} from '../language';
import Footer from './Footer';
import {useBag,writeBag,CommerceHeader,BagSummary,DeliveryFields,emptyDelivery,validateDelivery,accountRequest} from './commerce';

export default function Checkout(){
  const {t}=useLanguage(), navigate=useNavigate();
  const token=new Cookies().get('token');
  const bag=useBag();
  const [delivery,setDelivery]=useState({...emptyDelivery});
  const [addresses,setAddresses]=useState([]),[selected,setSelected]=useState('');
  const [errors,setErrors]=useState({}),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[addressError,setAddressError]=useState(false);
  const lock=useRef(false),key=useRef(null);
  useEffect(()=>{if(!token)return;const c=new AbortController();accountRequest('addresses/',{signal:c.signal}).then(d=>setAddresses(d.addresses)).catch(e=>{if(e.name!=='AbortError')setAddressError(true);});return()=>c.abort();},[token]);
  const choose=value=>{setSelected(value);setErrors({});if(!value){setDelivery({...emptyDelivery});return;}const a=addresses.find(a=>String(a.id)===value);if(a)setDelivery({fname:a.fname,lname:a.lname,address:a.address,state:a.state,city:a.city,PostalCode:String(a.postal_code).padStart(10,'0'),phoneNumber:String(a.phone_number).padStart(11,'0')});};
  const submit=async event=>{
    event.preventDefault();if(lock.current)return;
    const problems=validateDelivery(delivery,t);setErrors(problems);setNotice('');
    if(Object.keys(problems).length){document.getElementById(`delivery-${Object.keys(problems)[0]}`)?.focus();return;}
    if(!bag.items.length||bag.invalid){setNotice(t('ابتدا موجودی سبد خرید را بررسی کنید.','Please review your bag’s availability first.'));return;}
    lock.current=true;setBusy(true);
    if(!key.current)key.current=window.crypto.randomUUID();
    try{
      const r=await fetch('/auth/submit_order/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...delivery,token:token||null,checkout_key:key.current,products:bag.items.map(p=>[{productId:p.productId,productQ:p.quantity,productS:p.size}])})});
      const data=await r.json();
      if(!r.ok){setErrors(data.fields||{});if(r.status===409){bag.refresh();setNotice(t('موجودی تغییر کرده است. سبد خرید را بررسی کنید و دوباره تلاش کنید.','Availability has changed. Review your bag before trying again.'));}else setNotice(data.error||t('ثبت سفارش ناموفق بود.','Unable to place your order.'));return;}
      writeBag([]);navigate(`/recipte/${data.order_id}/`,{replace:true});
    }catch(e){setNotice(t('ارتباط قطع شد. سبد شما حفظ شده است؛ دوباره تلاش کنید.','Connection failed. Your bag is safe; please try again.'));}
    finally{lock.current=false;setBusy(false);}
  };
  return <><main className="commerce-page"><CommerceHeader step={2} title={t('جزئیات ارسال','Delivery details')} subtitle={t('آخرین قدم برای ثبت انتخاب‌های شما.','The final details for your chosen pieces.')}/>
    {!bag.items.length?<section className="commerce-empty"><h2>{t('سبد خرید شما خالی است','Your bag is empty')}</h2><Link className="commerce-primary" to="/products/">{t('مشاهده محصولات','Explore the collection')} ↗</Link></section>:<form className="commerce-columns" noValidate onSubmit={submit}>
      <section className="delivery-panel"><div className="delivery-title"><span>01</span><div><h2>{t('گیرنده و نشانی','Recipient & address')}</h2><p>{token?t('نشانی ذخیره‌شده را انتخاب کنید یا نشانی جدید وارد کنید.','Choose a saved address or enter a new one.'):t('می‌توانید مهمان سفارش دهید. برای مشاهده سفارش‌ها در حساب، ابتدا وارد شوید.','You can order as a guest. Sign in first to keep orders in your account.')}</p></div></div>{!token&&<Link className="commerce-text-button" to="/accounts/">{t('ورود به حساب','Sign in to your account')} ↗</Link>}
      {!!addresses.length&&<label className="saved-address-label">{t('نشانی ذخیره‌شده','Saved address')}<select disabled={busy} value={selected} onChange={e=>choose(e.target.value)}><option value="">{t('نشانی جدید','New address')}</option>{addresses.map(a=><option key={a.id} value={a.id}>{a.fname} {a.lname} · {a.city} · {a.address}</option>)}</select></label>}{addressError&&<p className="commerce-note">{t('نشانی‌های ذخیره‌شده بارگذاری نشد. می‌توانید نشانی را دستی وارد کنید.','Saved addresses could not load. You can enter your address manually.')}</p>}
      <DeliveryFields value={delivery} onChange={v=>{setDelivery(v);setErrors({});setSelected('');}} errors={errors} disabled={busy}/>
      <div className="delivery-payment"><span>02</span><div><h2>{t('وضعیت پرداخت','Payment status')}</h2><p>{t('درگاه پرداخت هنوز فعال نیست. این دکمه سفارش پرداخت‌نشده ثبت می‌کند و موجودی آن را رزرو می‌کند.','Online payment is not connected yet. This button places an unpaid order and reserves its stock.')}</p></div></div><Link className="commerce-back" to="/cart/">← {t('بازگشت به سبد خرید','Return to your bag')}</Link></section>
      <BagSummary bag={bag}>{bag.status==='loading'&&<p role="status" className="commerce-note">{t('بررسی موجودی…','Checking availability…')}</p>}{bag.status==='error'&&<p className="commerce-error" role="alert">{t('بررسی موجودی ناموفق بود.','Unable to check stock.')} <button type="button" onClick={bag.refresh}>{t('تلاش مجدد','Try again')}</button></p>}{bag.status==='ready'&&bag.invalid&&<p className="commerce-error" role="alert">{t('موجودی کافی نیست؛ سبد خرید را اصلاح کنید.','Some pieces are unavailable. Update your bag.')}</p>}{notice&&<p role="alert" className="commerce-error">{notice}</p>}<button className="commerce-primary" disabled={busy||bag.invalid}>{busy?t('در حال ثبت سفارش…','Placing your order…'):t('ثبت سفارش پرداخت‌نشده','Place unpaid order')} ↗</button></BagSummary>
    </form>}
  </main><Footer/></>;
}
