import {useEffect, useRef, useState} from 'react';
import {Navigate} from 'react-router-dom';
import Cookies from 'universal-cookie';
import {useLanguage} from '../language';
import './admin-panel.css';

const blank = {description:'', materials_care:'', title:'', category:'t-shirt', price:0, L_count:0, XL_count:0, XXL_count:0};
export default function AdminPanel() {
  const {t, lang, toggleLanguage} = useLanguage();
  const cookies = new Cookies();
  const token = cookies.get('token');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState('');
  const [tab, setTab] = useState(() => {const section = new URLSearchParams(window.location.search).get('section'); return ['products','orders'].includes(section) ? section : 'overview';});
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editor, setEditor] = useState(null);
  const [order, setOrder] = useState(null);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState({});
  const [notice, setNotice] = useState('');
  const [denied, setDenied] = useState(false);
  const locale = lang === 'fa' ? 'fa-IR' : 'en-GB';
  const number = value => Number(value).toLocaleString(locale);
  const money = value => `${number(value * 1000)} ${t('تومان', 'toman')}`;
  const categories = {'t-shirt':t('تیشرت', 'T-shirts'), hoodie:t('هودی', 'Hoodies'), sweatshirt:t('دورس', 'Sweatshirts'), accessory:t('اکسسوری', 'Accessories')};
  const request = async (path, options = {}) => {
    const response = await fetch(`/auth/manage/${path}`, {...options, headers:{Authorization:`Token ${token}`, ...(options.body && !(options.body instanceof FormData) ? {'Content-Type':'application/json'} : {}), ...options.headers}});
    if (response.status === 401 || response.status === 403) {setDenied(true); throw new Error(t('این بخش فقط برای مدیر فروشگاه است.', 'This area is for store administrators.'));}
    const result = await response.json();
    if (!response.ok) {const error = new Error(result.error || t('عملیات ناموفق بود.', 'Request failed.')); error.fields = result.fields; throw error;}
    return result;
  };
  const refresh = async () => {
    setFailure('');
    try {setData(await request('overview/'));} catch (error) {setFailure(error.message);} finally {setLoading(false);}
  };
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    request('overview/', {signal:controller.signal}).then(setData).catch(error => {if (error.name !== 'AbortError') setFailure(error.message);}).finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
    // Session changes navigate or remount the panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  const navigate = next => {setTab(next); setQuery(''); setFilter('all'); setNotice(''); window.history.replaceState(null, '', `/admin/?section=${next}`);};
  const edit = product => {setEditor(product ? {...product, price:product.price * 1000} : {...blank}); setFiles([]); setFields({}); setNotice('');};
  const save = async event => {
    event.preventDefault(); setSaving(true); setFields({}); setNotice('');
    let saved;
    try {
      if (Number(editor.price) % 1000 !== 0) {setFields({price:t('قیمت باید مضربی از ۱۰۰۰ تومان باشد.', 'Use a multiple of 1,000 toman.')}); return;}
      const values = {...editor, price:Number(editor.price) / 1000};
      ['L_count','XL_count','XXL_count'].forEach(key => {values[key] = Number(editor[key]);});
      saved = (await request(editor.id ? `products/${editor.id}/` : 'products/', {method:editor.id ? 'PATCH' : 'POST', body:JSON.stringify(values)})).product;
      for (const file of files) {const body = new FormData(); body.append('image', file); saved = (await request(`products/${saved.id}/images/`, {method:'POST', body})).product;}
      await refresh(); setEditor(null); setNotice(t('محصول ذخیره شد.', 'Product saved.'));
    } catch (error) {
      setFields(error.fields || {});
      if (saved) {setEditor({...saved, price:saved.price * 1000}); setFiles([]); await refresh();}
      setNotice(saved ? t('محصول ذخیره شد، اما بارگذاری تصویر ناموفق بود. دوباره تصویر را انتخاب کنید.', 'Product saved, but an image upload failed. Choose the image again to retry.') : error.message);
    } finally {setSaving(false);}
  };
  const logout = () => {cookies.remove('token', {path:'/'}); cookies.remove('userinfo', {path:'/'}); window.location.href='/accounts/';};
  if (!token) return <Navigate to="/accounts/" replace/>;
  if (denied) return <section className="admin-denied"><h1>{t('دسترسی مدیر لازم است', 'Administrator access required')}</h1><p>{failure}</p><a href="/">{t('بازگشت به فروشگاه', 'Return to store')}</a><button onClick={logout}>{t('ورود با حساب مدیر', 'Sign in as administrator')}</button></section>;
  const products = data?.products || [];
  const orders = data?.orders || [];
  const stock = product => product.L_count + product.XL_count + product.XXL_count;
  const lowStock = products.filter(p => ['L_count','XL_count','XXL_count'].some(key=>p[key]<0) || stock(p) <= 3);
  const visibleProducts = products.filter(p => `${p.title} ${p.id}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || p.category === filter));
  const visibleOrders = orders.filter(o => `${o.id} ${o.customer} ${o.fname || ''} ${o.lname || ''}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || o.paid === (filter === 'paid')));
  const titles = {overview:t('نمای کلی', 'Overview'), products:t('محصولات', 'Products'), orders:t('سفارش‌ها', 'Orders')};
  return <div className="benico-admin">
    <aside className="admin-sidebar"><a className="admin-brand" href="/">BENICO<span>{t('مدیریت فروشگاه', 'STORE MANAGEMENT')}</span></a><nav aria-label={t('مدیریت فروشگاه', 'Store management')}>{Object.entries(titles).map(([key,title],index) => <button key={key} aria-current={tab===key?'page':undefined} onClick={()=>navigate(key)}><span>0{index+1}</span>{title}{key==='orders' && <b>{orders.length}</b>}</button>)}</nav><div className="admin-sidebar-bottom"><a href="/">↗ {t('مشاهده فروشگاه', 'View storefront')}</a><button onClick={logout}>{t('خروج از حساب', 'Sign out')}</button></div></aside>
    <main className="admin-main"><header className="admin-topbar"><div><p>BENICO / {t('فضای مدیریت', 'WORKSPACE')}</p><h1>{titles[tab]}</h1></div><div><span>{data?.user.username}</span><button className="admin-language" onClick={toggleLanguage} aria-label={t('Switch to English', 'تغییر زبان به فارسی')}>{lang==='fa'?'EN':'فارسی'}</button></div></header>
      {notice && !editor && <p className="admin-notice" role="status">{notice}</p>}
      {loading ? <p className="admin-state" role="status">{t('در حال بارگذاری فروشگاه…', 'Loading your store…')}</p> : failure ? <div className="admin-state" role="alert"><p>{failure}</p><button onClick={refresh}>{t('تلاش مجدد', 'Try again')}</button></div> : <>
      {tab==='overview' && <><section className="admin-metrics">{[[t('محصولات', 'Products'), products.length], [t('سفارش‌های پرداخت نشده', 'Unpaid orders'), orders.filter(o=>!o.paid).length], [t('فروش پرداخت شده', 'Paid revenue'), money(orders.filter(o=>o.paid).reduce((total,o)=>total+o.price,0))], [t('نیازمند بررسی موجودی', 'Stock to review'), lowStock.length]].map(([label,value])=><article key={label}><p>{label}</p><strong>{typeof value==='number'?number(value):value}</strong></article>)}</section>
      <section className="admin-welcome"><div><p className="admin-kicker">YOUR STORE, YOUR WAY</p><h2>{t('همه چیز برای مدیریت بنیکو', 'Everything you need to run Benico')}</h2><p>{t('محصول جدید اضافه کنید، موجودی را تنظیم کنید و سفارش‌ها را بررسی کنید.', 'Add pieces, update your stock and keep track of every order.')}</p></div><button className="admin-primary" onClick={()=>{navigate('products'); edit(null);}}>+ {t('محصول جدید', 'New product')}</button></section>
      <div className="admin-overview-grid"><section className="admin-box"><div className="admin-box-heading"><h2>{t('آخرین سفارش‌ها', 'Recent orders')}</h2><button onClick={()=>navigate('orders')}>{t('مشاهده همه', 'View all')} ↗</button></div>{!orders.length?<p>{t('هنوز سفارشی نیست.', 'No orders yet.')}</p>:orders.slice(0,5).map(o=><button className="admin-recent-order" key={o.id} onClick={()=>setOrder(o)}><strong>#{o.id}</strong><span>{o.customer}</span><span className={`admin-badge ${o.paid?'paid':''}`}>{o.paid?t('پرداخت شده', 'Paid'):t('پرداخت نشده', 'Unpaid')}</span><span>{money(o.price)}</span></button>)}</section>
      <section className="admin-box"><h2>{t('بررسی موجودی', 'Stock review')}</h2>{!lowStock.length?<p>{t('موجودی‌ها آماده هستند.', 'Stock is ready.')}</p>:lowStock.map(p=><button className="admin-stock-row" key={p.id} onClick={()=>{navigate('products'); edit(p);}}><span>{p.title}</span><b>{stock(p)<0?t('موجودی منفی', 'Negative stock'):t('موجودی کم', 'Low stock')} ↗</b></button>)}</section></div>
      <p className="admin-payment-note">{t('درگاه پرداخت هنوز متصل نیست. سفارش‌های پرداخت نشده، فروش پرداخت شده محسوب نمی‌شوند.', 'The payment gateway is not connected. Unpaid orders are excluded from paid revenue.')}</p></>}
      {tab!=='overview' && <><div className="admin-toolbar"><label><span className="sr-only">{t('جستجو', 'Search')}</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='products'?t('جستجوی محصول یا شناسه…', 'Search title or product ID…'):t('جستجوی سفارش یا مشتری…', 'Search order or customer…')}/></label><select aria-label={t('فیلتر', 'Filter')} value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">{t('همه', 'All')}</option>{tab==='products'?Object.entries(categories).map(([key,value])=><option key={key} value={key}>{value}</option>):<><option value="unpaid">{t('پرداخت نشده', 'Unpaid')}</option><option value="paid">{t('پرداخت شده', 'Paid')}</option></>}</select>{tab==='products' && <button className="admin-primary" onClick={()=>edit(null)}>+ {t('محصول جدید', 'New product')}</button>}<button className="admin-secondary" onClick={refresh}>{t('تازه‌سازی', 'Refresh')}</button></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{(tab==='products'?[t('محصول', 'Product'),t('دسته', 'Category'),t('قیمت', 'Price'),'L / XL / XXL',t('عملیات', 'Actions')]:[t('سفارش', 'Order'),t('مشتری', 'Customer'),t('تاریخ', 'Date'),t('مبلغ', 'Total'),t('وضعیت', 'Status'),t('عملیات', 'Actions')]).map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{tab==='products'?visibleProducts.map(p=><tr key={p.id}><td><div className="admin-product-cell">{p.images[0]?<img src={`/image/item/${p.images[0]}/`} alt=""/>:<span className="admin-image-empty">↗</span>}<div><strong>{p.title}</strong><small>#{p.id}</small></div></div></td><td>{categories[p.category]}</td><td>{money(p.price)}</td><td><span className={stock(p)<0?'admin-stock-error':''}>{p.L_count} / {p.XL_count} / {p.XXL_count}</span></td><td><button className="admin-secondary" onClick={()=>edit(p)}>{t('ویرایش', 'Edit')}</button></td></tr>):visibleOrders.map(o=><tr key={o.id}><td><strong>#{o.id}</strong></td><td>{o.fname || o.customer} {o.lname || ''}<small>{o.customer}</small></td><td>{new Date(o.date).toLocaleDateString(locale)}</td><td>{money(o.price)}</td><td><span className={`admin-badge ${o.paid?'paid':''}`}>{o.paid?t('پرداخت شده', 'Paid'):t('پرداخت نشده', 'Unpaid')}</span></td><td><button className="admin-secondary" onClick={()=>setOrder(o)}>{t('مشاهده', 'View')}</button></td></tr>)}</tbody></table>{!(tab==='products'?visibleProducts:visibleOrders).length && <p className="admin-state">{t('نتیجه‌ای یافت نشد.', 'No results found.')}</p>}</div></>}
      </>}
    </main>
    {editor && <AdminDialog title={editor.id?t('ویرایش محصول', 'Edit product'):t('محصول جدید', 'New product')} onClose={()=>!saving&&setEditor(null)}><form className="admin-editor" onSubmit={save}><div className="admin-editor-fields"><label>{t('نام محصول', 'Product title')}<input autoFocus required maxLength={255} value={editor.title} onChange={e=>setEditor({...editor,title:e.target.value})}/>{fields.title&&<small role="alert">{fields.title}</small>}</label><label>{t('دسته‌بندی', 'Category')}<select value={editor.category} onChange={e=>setEditor({...editor,category:e.target.value})}>{Object.entries(categories).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></label><label>{t('قیمت به تومان', 'Price in toman')}<input required type="number" min="0" step="1000" value={editor.price} onChange={e=>setEditor({...editor,price:e.target.value})}/>{fields.price&&<small role="alert">{fields.price}</small>}</label>{[['description',t('توضیحات محصول','Product description')],['materials_care',t('جنس و نگهداری','Materials & care')]].map(([key,label])=><label key={key}>{label}<textarea rows={4} maxLength={8000} value={editor[key] || ''} onChange={e=>setEditor({...editor,[key]:e.target.value})}/>{fields[key]&&<small role="alert">{fields[key]}</small>}</label>)}<fieldset><legend>{t('موجودی هر سایز', 'Stock by size')}</legend><div className="admin-size-inputs">{['L','XL','XXL'].map(size=><label key={size}>{size}<input required type="number" min="0" step="1" value={editor[`${size}_count`]} onChange={e=>setEditor({...editor,[`${size}_count`]:e.target.value})}/>{fields[`${size}_count`]&&<small role="alert">{fields[`${size}_count`]}</small>}</label>)}</div></fieldset></div><div className="admin-editor-media"><h3>{t('تصاویر محصول', 'Product images')}</h3><div className="admin-image-list">{editor.images?.map(id=><img key={id} src={`/image/item/${id}/`} alt={editor.title}/>)}</div><label className="admin-upload">+ {t('انتخاب تصاویر', 'Choose images')}<input type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files))}/><small>{t('حداکثر ۱۰ مگابایت برای هر تصویر', 'Up to 10 MB per image')}</small></label>{files.map((file,i)=><p className="admin-file" key={`${file.name}-${i}`}>{file.name}<button type="button" aria-label={`${t('حذف انتخاب', 'Remove selected file')} ${file.name}`} onClick={()=>setFiles(files.filter((_,index)=>index!==i))}>×</button></p>)}</div>{notice&&<p role="alert" className="admin-form-error">{notice}</p>}<footer className="admin-editor-actions"><button type="button" className="admin-secondary" disabled={saving} onClick={()=>setEditor(null)}>{t('انصراف', 'Cancel')}</button><button className="admin-primary" disabled={saving}>{saving?t('در حال ذخیره…', 'Saving…'):t('ذخیره محصول', 'Save product')}</button></footer></form></AdminDialog>}
    {order && <AdminDialog title={`${t('سفارش', 'Order')} #${order.id}`} onClose={()=>setOrder(null)}><div className="admin-order-detail"><span className={`admin-badge ${order.paid?'paid':''}`}>{order.paid?t('پرداخت شده', 'Paid'):t('پرداخت نشده', 'Unpaid')}</span><p>{new Date(order.date).toLocaleString(locale)}</p><h3>{t('اقلام سفارش', 'Order items')}</h3>{order.products.map((p,i)=><div className="admin-order-line" key={i}><span>{p.title}</span><b>{p.quantity} × {p.size}</b></div>)}<div className="admin-order-total"><span>{t('مبلغ سفارش', 'Order total')}</span><strong>{money(order.price)}</strong></div><h3>{t('مشتری و ارسال', 'Customer & delivery')}</h3><p>{order.fname} {order.lname} · {order.customer}</p><p>{order.state} / {order.city}</p><p>{order.address}</p><p>{t('تلفن', 'Phone')}: <bdi>{order.phone || '—'}</bdi></p><p>{t('کد پستی', 'Postal code')}: {order.postal_code || '—'}</p></div></AdminDialog>}
  </div>;
}

function AdminDialog({title, onClose, children}) {
  const {t} = useLanguage();
  const dialog = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialog.current.querySelector('input, button')?.focus();
    const key = e => {
      if (e.key==='Escape') close.current();
      if (e.key==='Tab') {const controls=Array.from(dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')); const first=controls[0],last=controls[controls.length-1]; if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();} else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    };
    document.addEventListener('keydown',key);
    return ()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus();};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div className="admin-dialog-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={dialog} className="admin-dialog" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button type="button" aria-label={t('بستن', 'Close')} onClick={onClose}>×</button></header>{children}</section></div>;
}
