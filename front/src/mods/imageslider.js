import {useLanguage} from '../language';
import React, { useState, useEffect } from 'react';
const ImageSlider = ({ uuids = [], media }) => {
  const {t} = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const images = media || uuids.map(uuid => ({src: `/image/item/${uuid}/`}));
  useEffect(() => setCurrentSlide(0), [uuids]);
  const move = step => setCurrentSlide(index => Math.max(0, Math.min(images.length - 1, index + step)));
  return <div className="product-gallery" dir="ltr"
    onTouchStart={e => setTouchStart(e.touches[0].clientX)}
    onTouchEnd={e => { if (touchStart !== null) { const distance = touchStart - e.changedTouches[0].clientX; if (Math.abs(distance) > 50) move(distance > 0 ? 1 : -1); } setTouchStart(null); }}>
    {images.length ? <>
      <div className="gallery-track" style={{transform: `translateX(-${currentSlide * 100}%)`}}>
        {images.map((image, index) => <img key={image.src} src={image.src} alt={`${t('تصویر محصول', 'Product image')} ${index + 1}`} loading={index ? 'lazy' : 'eager'} />)}
      </div>
      {images.length > 1 && <>
        <button type="button" className="gallery-arrow gallery-prev" aria-label={t('تصویر قبلی', 'Previous image')} disabled={!currentSlide} onClick={() => move(-1)}>‹</button>
        <button type="button" className="gallery-arrow gallery-next" aria-label={t('تصویر بعدی', 'Next image')} disabled={currentSlide === images.length - 1} onClick={() => move(1)}>›</button>
        <span className="gallery-count">{currentSlide + 1} / {images.length}</span>
      </>}
    </> : <div className="gallery-empty">{t('تصویر محصول موجود نیست', 'No product image available')}</div>}
  </div>;
};
export default ImageSlider;
