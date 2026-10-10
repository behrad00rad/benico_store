import {useEffect, useState} from 'react';
import {useLanguage} from '../language';
import {getProductMedia} from './product-media';
export default function SearchBar() {
  const {t} = useLanguage();
  const [query,setQuery] = useState(''), [results,setResults] = useState([]), [suggestions,setSuggestions] = useState([]), [status,setStatus] = useState('idle'), [revision,setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/product/recommend/',{signal:controller.signal}).then(r => {if (!r.ok) throw Error(); return r.json();}).then(data => {if (!controller.signal.aborted) setSuggestions((data.data || []).slice(0,3));}).catch(() => {});
    return () => controller.abort();
  },[]);
  useEffect(() => {
    const term = query.trim();
    if (!term) {setResults([]); setStatus('idle'); return;}
    const controller = new AbortController();
    setStatus('loading'); setResults([]);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/product/search/?q=${encodeURIComponent(term)}`,{signal:controller.signal});
        if (!response.ok) throw Error();
        const data = await response.json();
        if (!controller.signal.aborted) {setResults(data.results || []); setStatus('ready');}
      } catch (error) {if (!controller.signal.aborted) setStatus('error');}
    },250);
    return () => {clearTimeout(timer); controller.abort();};
  },[query,revision]);
  const categories = [['/products/t-shirt/1/','تی‌شرت','T-shirts'],['/products/hoodie/1/','هودی','Hoodies'],['/products/sweatshirt/1/','دورس','Sweatshirts']];
  const pieces = query.trim() ? results : suggestions;
  return <div className="benico-search">
    <div className="search-heading"><label htmlFor="benico-search-input">{t('جستجو برای','Search for')}</label>
      <form role="search" onSubmit={event => event.preventDefault()} className="search-input-row">
        <input id="benico-search-input" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('نام محصول یا کد آن','Name or product code')} aria-label={t('جستجوی محصول','Search products')}/>
        {query && <button type="button" onClick={() => setQuery('')} aria-label={t('پاک کردن جستجو','Clear search')}>×</button>}
        <button type="submit" aria-label={t('جستجوی مجموعه','Search collection')}>→</button>
      </form>
      <div className="search-trending"><span>{t('دسته‌های محبوب','Explore categories')}</span>{categories.map(([href,fa,en]) => <a href={href} key={href}>{t(fa,en)}</a>)}</div>
    </div>
    <div className="search-body">
      <aside className="search-discover"><p className="nav-kicker">{t('مجموعه‌های بنیکو','COLLECTIONS')}</p>{categories.map(([href,fa,en]) => <a href={href} key={href}>{t(fa,en)}</a>)}<p className="nav-kicker">{t('بیشتر از بنیکو','MORE FROM BENICO')}</p><a href="/products/">{t('همه محصولات','All pieces')}</a><a href="/contact-us/">{t('تماس با ما','Contact us')}</a></aside>
      <div className="search-product-area">
        <p className="nav-kicker">{query.trim() ? t('نتایج جستجو','SEARCH RESULTS') : t('منتخب بنیکو','THE BENICO EDIT')}</p>
        <div aria-live="polite" aria-atomic="true" className="search-status">{status === 'loading' ? t('در حال جستجو…','Searching…') : status === 'ready' ? results.length ? t(`${results.length} محصول پیدا شد`,`${results.length} ${results.length === 1 ? 'piece' : 'pieces'} found`) : t('محصولی پیدا نشد. نام دیگری یا کد محصول را امتحان کن.','No pieces found. Try another name or product code.') : status === 'error' ? t('جستجو انجام نشد. دوباره امتحان کن.','Search could not load. Please try again.') : ''}</div>
        {status === 'error' && <button className="search-retry" onClick={() => setRevision(value => value + 1)}>{t('تلاش دوباره','Try again')}</button>}
        {!!pieces.length && (status === 'ready' || status === 'idle') && <div className="search-results">{pieces.map(product => {
          const image = getProductMedia({...product,images:product.image || product.images || []})[0];
          return <a href={`/item/${product.id}/`} className="search-result" key={product.id}>{image && <div><img src={image.src} alt=""/></div>}<p>{product.title}</p><span>{t('کد','Style')} {product.id} <span aria-hidden="true">↗</span></span></a>;
        })}</div>}
      </div>
    </div>
  </div>;
}
