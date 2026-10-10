import {useLanguage} from '../language';
import ImageSlider from './imageslider';
import {getProductMedia} from './product-media';
export default function Prod({prod}) {
  const {lang, t} = useLanguage();
  const available = ['L_count', 'XL_count', 'XXL_count'].some(key => Number(prod[key]) > 0);
  return <article className="product-card">
    <ImageSlider uuids={prod.images} media={getProductMedia(prod)} />
    <a href={`/item/${prod.id}/`}><h2 dir="auto">{prod.title}</h2></a>
    <div className="product-card-meta"><span>{Number(prod.price * 1000).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')} {t('تومان', 'toman')}</span><span>#{prod.id}</span></div>
    <a className="product-card-status" href={`/item/${prod.id}/`} style={{display:'block'}}>{available ? t('مشاهده و خرید', 'View and shop') : t('ناموجود · مشاهده محصول', 'Sold out · View product')}</a>
  </article>;
}
