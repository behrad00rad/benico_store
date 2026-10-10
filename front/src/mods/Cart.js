import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useLanguage} from '../language';
import Footer from './Footer';
import {useBag,money,CommerceHeader,BagSummary} from './commerce';

export default function Cart(){
  const {t,lang}=useLanguage();
  const bag=useBag();
  const [notice,setNotice]=useState('');
  const change=(index,quantity,size=bag.items[index].size)=>{
    const current=bag.items[index], product=bag.products[current.productId];
    const stock=Math.max(0,product?.[`${size}_count`]||0);
    if(quantity>stock && quantity>current.quantity){setNotice(t('موجودی بیشتری از این سایز نیست.','No more pieces of this size are available.'));return;}
    const duplicate=bag.items.findIndex((p,i)=>i!==index&&String(p.productId)===String(current.productId)&&p.size===size);
    if(size!==current.size && (quantity+(duplicate>=0?bag.items[duplicate].quantity:0))>stock){setNotice(t('موجودی این سایز کافی نیست.','Not enough stock in that size.'));return;}
    const items=bag.items.map((p,i)=>i===index?{...p,size,quantity,price:product?.price??p.price,title:product?.title??p.title,left:stock}:p);
    if(duplicate>=0){items[duplicate]={...items[duplicate],quantity:items[duplicate].quantity+quantity};items.splice(index,1);}
    bag.update(items);setNotice('');
  };
  return <><main className="commerce-page"><CommerceHeader step={1} title={t('سبد خرید شما','Your shopping bag')} subtitle={t('انتخاب‌های شما، آماده قدم بعدی.','Your chosen pieces, ready for the next step.')}/>
    {!bag.items.length?<section className="commerce-empty"><span>＋</span><h2>{t('سبد خرید شما خالی است','Your bag is waiting')}</h2><p>{t('محصولات بنیکو را کشف کنید و انتخاب خود را اضافه کنید.','Explore Benico and add something that feels like you.')}</p><Link className="commerce-primary" to="/products/">{t('کشف مجموعه','Explore the collection')} ↗</Link></section>:<>
    {bag.status==='loading'&&<p className="commerce-message" role="status">{t('بررسی قیمت و موجودی…','Checking current prices and stock…')}</p>}{bag.status==='error'&&<p className="commerce-error" role="alert">{t('بررسی موجودی ناموفق بود.','Unable to check stock.')} <button onClick={bag.refresh}>{t('تلاش مجدد','Try again')}</button></p>}{notice&&<p className="commerce-message" role="status">{notice}</p>}
    <div className="commerce-columns"><section className="bag-lines">{bag.items.map((p,index)=>{const product=bag.products[p.productId];const stock=Math.max(0,product?.[`${p.size}_count`]||0);return <article className="bag-line" key={`${p.productId}-${p.size}`}><Link className="bag-image" to={`/item/${p.productId}/`}>{product?.images[0]?<img src={`/image/item/${product.images[0]}/`} alt={product.title}/>:<span>BENICO</span>}</Link><div className="bag-line-content"><p className="commerce-eyebrow">BENICO / #{p.productId}</p><h2><Link to={`/item/${p.productId}/`}>{product?.title||p.title}</Link></h2><p className="bag-price">{product?money(product.price,lang,t):'—'}</p><label>{t('سایز','Size')}<select aria-label={`${t('سایز','Size')} ${p.title}`} disabled={bag.status!=='ready'||!product} value={p.size} onChange={e=>change(index,p.quantity,e.target.value)}>{['L','XL','XXL'].map(s=><option key={s} disabled={!(product?.[`${s}_count`]>0)} value={s}>{s}{product?.[`${s}_count`]<=0?` — ${t('ناموجود','Sold out')}`:''}</option>)}</select></label><div className="bag-actions"><div className="bag-quantity" dir="ltr"><button aria-label={`${t('کاهش تعداد','Decrease quantity')} ${p.title}`} disabled={p.quantity<=1} onClick={()=>change(index,p.quantity-1)}>−</button><span aria-label={t('تعداد','Quantity')}>{p.quantity}</span><button aria-label={`${t('افزایش تعداد','Increase quantity')} ${p.title}`} disabled={bag.status!=='ready'||p.quantity>=stock} onClick={()=>change(index,p.quantity+1)}>＋</button></div><button className="commerce-text-button" onClick={()=>bag.update(bag.items.filter((_,i)=>i!==index))}>{t('حذف','Remove')}</button></div>{bag.status==='ready'&&(!product||p.quantity>stock)&&<p role="alert" className="commerce-error">{product?t('موجودی تغییر کرده است. تعداد را کاهش دهید یا محصول را حذف کنید.','Stock has changed. Reduce the quantity or remove this piece.'):t('این محصول دیگر موجود نیست. آن را حذف کنید.','This product no longer exists. Please remove it.')}</p>}{product&&product.price!==p.price&&<small className="commerce-note">{t('قیمت به‌روز فروشگاه نمایش داده می‌شود.','The current store price is shown.')}</small>}</div><strong className="bag-line-total">{product?money(product.price*p.quantity,lang,t):'—'}</strong></article>;})}<Link className="commerce-back" to="/products/">← {t('ادامه انتخاب محصولات','Continue exploring')}</Link></section><BagSummary bag={bag}>{bag.invalid?<button className="commerce-primary" disabled>{t('ابتدا سبد خرید را بررسی کنید','Review your bag to continue')}</button>:<Link className="commerce-primary" to="/checkout/">{t('ادامه ثبت سفارش','Continue to checkout')} ↗</Link>}</BagSummary></div></>}
  </main><Footer/></>;
}
