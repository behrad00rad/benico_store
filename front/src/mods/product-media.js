export function getProductMedia(product) {
  const labels = {
    mockup: {fa: 'موکاپ استودیویی', en: 'Studio mockup'},
    model: {fa: 'نمای روی مدل', en: 'Model styling'},
    detail: {fa: 'جزئیات پارچه و طرح', en: 'Fabric and design detail'},
    original: {fa: 'عکس اصلی محصول', en: 'Original product photo'},
  };
  const media = product.image_media || (product.images || []).map(id => ({id, role:'original'}));
  return media.map(({id, role}) => ({src:`/image/item/${id}/`, generated:role !== 'original', cutout:role === 'mockup', ...(labels[role] || labels.original)}));
}
