import infiniteMockup from '../assets/product-shots/infinite-cutout-v2.png';
import infiniteModel from '../assets/product-shots/infinite-model-v2.webp';
import saviorMockup from '../assets/product-shots/savior-cutout-v2.png';
import saviorModel from '../assets/product-shots/savior-model-v2.webp';
import xrayMockup from '../assets/product-shots/xray-cutout-v2.png';
import xrayModel from '../assets/product-shots/xray-model-v2.webp';
import navyMockup from '../assets/product-shots/navy-cutout-v2.png';
import navyModel from '../assets/product-shots/navy-model-v2.webp';
import infiniteDetail from '../assets/product-shots/infinite-detail-v3.webp';
import saviorDetail from '../assets/product-shots/savior-detail-v3.webp';
import xrayDetail from '../assets/product-shots/xray-detail-v3.webp';
import navyDetail from '../assets/product-shots/navy-detail-v3.webp';

// Curated reference-based styling assets for the current catalog. Originals
// remain in each gallery; products without an asset set use their own photos.
const shoots = {
  6999: [saviorMockup, saviorModel, saviorDetail],
  7000: [infiniteMockup, infiniteModel, infiniteDetail],
  8101: [xrayMockup, xrayModel, xrayDetail],
  8102: [navyMockup, navyModel, navyDetail],
  8103: [infiniteMockup, infiniteModel, infiniteDetail],
};

export function getProductMedia(product) {
  const labels = [{fa: 'موکاپ استودیویی', en: 'Studio mockup'}, {fa: 'نمای روی مدل', en: 'Model styling'}, {fa: 'جزئیات پارچه و طرح', en: 'Fabric and design detail'}];
  const styled = (shoots[product.id] || []).map((src, index) => ({src, generated: true, cutout: index === 0, ...labels[index]}));
  return [...styled, ...(product.images || []).map(uuid => ({src: `/image/item/${uuid}/`, generated: false, fa: 'عکس اصلی محصول', en: 'Original product photo'}))];
}
