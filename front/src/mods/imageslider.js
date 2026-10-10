import {useLanguage} from '../language';
import React, { useState, useEffect } from 'react';
const ImageSlider = ({ uuids = [] }) => {
  const {t} = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  useEffect(() => setCurrentSlide(0), [uuids]);
  const move = step => setCurrentSlide(index => Math.max(0, Math.min(uuids.length - 1, index + step)));
  return <div className="product-gallery" dir="ltr"
    onTouchStart={e => setTouchStart(e.touches[0].clientX)}
    onTouchEnd={e => { if (touchStart !== null) { const distance = touchStart - e.changedTouches[0].clientX; if (Math.abs(distance) > 50) move(distance > 0 ? 1 : -1); } setTouchStart(null); }}>
    {uuids.length ? <>
      <div className="gallery-track" style={{transform: `translateX(-${currentSlide * 100}%)`}}>
        {uuids.map((uuid, index) => <img key={uuid} src={`http://127.0.0.1:2000/image/item/${uuid}/`} alt={`${t('تصویر محصول', 'Product image')} ${index + 1}`} loading={index ? 'lazy' : 'eager'} />)}
      </div>
      {uuids.length > 1 && <>
        <button type="button" className="gallery-arrow gallery-prev" aria-label={t('تصویر قبلی', 'Previous image')} disabled={!currentSlide} onClick={() => move(-1)}>‹</button>
        <button type="button" className="gallery-arrow gallery-next" aria-label={t('تصویر بعدی', 'Next image')} disabled={currentSlide === uuids.length - 1} onClick={() => move(1)}>›</button>
        <span className="gallery-count">{currentSlide + 1} / {uuids.length}</span>
      </>}
    </> : <div className="gallery-empty">{t('تصویر محصول موجود نیست', 'No product image available')}</div>}
  </div>;
};
export default ImageSlider;
