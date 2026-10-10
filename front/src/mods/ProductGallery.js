import {useEffect, useRef, useState} from 'react';
import {useLanguage} from '../language';

export default function ProductGallery({media, title, price}) {
  const {t} = useLanguage();
  const [active, setActive] = useState(0);
  const [wide, setWide] = useState(() => window.innerWidth > 760);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const drag = useRef(null);
  const dragged = useRef(false);
  const zoom = useRef(null);
  const viewport = useRef(null);
  useEffect(() => {
    const resize = () => {
      const next = window.innerWidth > 760;
      if (next !== wide) {setWide(next); setActive(0); setOffset(0); drag.current = null;}
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [wide]);
  const move = step => setActive(index => Math.max(0, Math.min(media.length - 1, index + step)));
  const expanding = wide && ((active === 0 && offset < 0) || (active === 1 && offset > 0));
  const progress = Math.min(1, Math.abs(offset) / Math.max(1, (viewport.current?.clientWidth || window.innerWidth) * .5));
  const firstWidth = !wide ? 100 : active === 0 ? 100 - (expanding ? 50 * progress : 0) : 50 + (expanding ? 50 * progress : 0);
  const translation = wide ? Math.max(0, active - 1) * 50 : active * 100;
  const railOffset = expanding || (active === 0 && wide) ? 0 : offset;
  const visible = index => wide && active > 0 ? index === active - 1 || index === active : index === active;
  const pointerDown = event => {
    if (media.length < 2 || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag.current = {id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false};
    dragged.current = false;
  };
  const pointerMove = event => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const x = event.clientX - start.x, y = event.clientY - start.y;
    if (!start.horizontal && Math.abs(x) > 8 && Math.abs(x) > Math.abs(y)) {
      start.horizontal = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    if (start.horizontal) {dragged.current = true; setOffset(x);}
  };
  const pointerEnd = event => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const distance = event.clientX - start.x;
    if (start.horizontal && Math.abs(distance) > Math.min(80, event.currentTarget.clientWidth * .12)) move(distance < 0 ? 1 : -1);
    drag.current = null;
    setOffset(0);
  };
  const cancelDrag = () => {drag.current = null; setOffset(0);};
  const keyboard = event => {
    if (event.target !== event.currentTarget || media.length < 2) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);}
  };
  const openZoom = index => {
    if (dragged.current) {dragged.current = false; return;}
    setZoomIndex(index);
    zoom.current?.showModal();
  };
  return <section className={`pdp-gallery ${active === 0 ? 'pdp-hero' : 'pdp-pair'}`} aria-label={t('تصاویر محصول', 'Product gallery')} aria-roledescription={t('گالری تصاویر', 'carousel')} dir="ltr">
    {media.length ? <div ref={viewport} className={`pdp-viewport ${offset ? 'is-dragging' : ''}`} tabIndex={0} aria-label={t('برای تغییر تصویر، به چپ یا راست بکشید یا از کلیدهای جهت استفاده کنید.', 'Drag left or right, or use the arrow keys to change images.')} onKeyDown={keyboard} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={cancelDrag} onLostPointerCapture={event => {if (event.target === event.currentTarget) cancelDrag();}}>
      <div className="pdp-track" style={{transform: `translateX(calc(-${translation}% + ${railOffset}px))`}}>
        {media.map((image, index) => <div className="pdp-slide" key={image.src} aria-hidden={!visible(index)} style={{width: `${index === 0 ? firstWidth : wide ? 50 : 100}%`}}>
          <button className={`pdp-image ${image.cutout ? 'pdp-cutout' : ''}`} tabIndex={visible(index) ? 0 : -1} onClick={() => openZoom(index)} aria-label={`${t('بزرگ‌نمایی تصویر', 'Enlarge image')} ${index + 1}`}>
            <img src={image.src} alt={`${title} — ${t(image.fa, image.en)}`} draggable={false} loading={index < 2 ? 'eager' : 'lazy'}/>
          </button>
        </div>)}
      </div>
    </div> : <p className="pdp-state">{t('تصویر موجود نیست', 'No image available')}</p>}
    <div className="pdp-view-tools"><span className="pdp-drag-hint">{t('برای دیدن بیشتر بکشید', 'DRAG TO EXPLORE')} <span aria-hidden="true">↔</span></span></div>
    <a className="pdp-gallery-caption" href="#piece-details"><span dir="auto">{title}</span><span>{price}</span><span className="pdp-select-size">{t('انتخاب سایز', 'Select size')} <span aria-hidden="true">↓</span></span></a>
    {media.length > 1 && <div className="pdp-gallery-controls"><div className="pdp-thumbnails">{media.map((image, index) => <button key={image.src} aria-label={`${t('تصویر', 'Image')} ${index + 1}`} aria-pressed={active === index} onClick={() => {setActive(index); setOffset(0);}}><img src={image.src} alt="" draggable={false}/></button>)}</div><button disabled={active === 0} aria-label={t('تصویر قبلی', 'Previous image')} onClick={() => move(-1)}>‹</button><button disabled={active === media.length - 1} aria-label={t('تصویر بعدی', 'Next image')} onClick={() => move(1)}>›</button><span className="pdp-image-count" aria-live="polite" aria-atomic="true">{active + 1} / {media.length}</span></div>}
    {!!media.length && <p className="pdp-image-credit">{media[active].generated ? t('تصویرسازی با هوش مصنوعی؛ عکس اصلی در گالری', 'AI styling visualization · original photos in gallery') : t('عکس اصلی محصول', 'Original product photograph')}</p>}
    <dialog ref={zoom} className="pdp-zoom" aria-label={t('نمای بزرگ محصول', 'Enlarged product image')} onClick={event => {if (event.target === event.currentTarget) zoom.current.close();}}>
      <button className="pdp-zoom-close" aria-label={t('بستن', 'Close')} onClick={() => zoom.current.close()}>×</button>
      {media[zoomIndex] && <img src={media[zoomIndex].src} alt={title}/>}
      {media.length > 1 && <div><button aria-label={t('نمای بزرگ قبلی', 'Previous enlarged image')} onClick={() => setZoomIndex(index => (index - 1 + media.length) % media.length)}>←</button><span>{zoomIndex + 1} / {media.length}</span><button aria-label={t('نمای بزرگ بعدی', 'Next enlarged image')} onClick={() => setZoomIndex(index => (index + 1) % media.length)}>→</button></div>}
    </dialog>
  </section>;
}
