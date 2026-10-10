import React, { useContext, useEffect, useState } from 'react';
import ImageSlider from './imageslider';
import {useLanguage} from '../language';
import { useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Footer from './Footer';
import { ThemeContext } from './themeprovider';

const ItemPage = () => {
  const {t, lang} = useLanguage();
  const theme = useContext(ThemeContext);
  const [left, setLeft] = useState(0);
  const [mess, setMess] = useState();
  const [added, setAdded] = useState([' translate-y-full opacity-0 ']);
  const MAINURL = 'http://127.0.0.1:2000';
  const [timerStarted, setTimerStarted] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedSize, setSelectedSize] = useState();
  const [product, setProduct] = useState({});
  const { id } = useParams();
  const cookies = new Cookies();

  // Check if the language is Farsi
  const isFarsi = cookies.getAll().Lang === 'fa';

  useEffect(() => {
    let timer;
    if (timerStarted) {
      timer = setTimeout(() => {
        setAdded(' translate-y-full opacity-0 ');
        setTimerStarted(false);
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [timerStarted]);

  useEffect(() => {
    fetchProducts();
  }, [id]);

  const handlesizeselect = (S) => {
      setLeft(product[S + '_count']);
      setSelectedSize(S); // Set the selected size
  };
  

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${MAINURL}/product/filtered/${id}/`);
      const data = await response.json();
      setProduct(data.data[0]);
      setImages(data.data[0].images);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (productId, selectedSize) => {
    let cartData = cookies.get('cartData') || [];

    const existingItem = cartData.find(
      (item) => item.productId === productId && item.size === selectedSize
    );
    if (existingItem) {
      if (existingItem.left > existingItem.quantity) {
        existingItem.quantity += 1;
      } else {
        setMess(isFarsi ? "تعداد مورد نیاز به موجودی اضافه نشده است" : "No more left");
        setAdded('alert-error translate-y-0 opacity-1');
        setTimerStarted(true);
        return 1;
      }
    } else {
      cartData.push({ productId, quantity: 1, size: selectedSize, price: product.price, title: product.title, left: product[`${selectedSize}_count`] });
    }


    cookies.set('cartData', cartData, { path: '/' });

    const cartItemCount = cartData.length;
    window.dispatchEvent(new CustomEvent('cartItemCountUpdated', { detail: cartItemCount }));

    // Dispatch 'cartItemUpdated' event to notify the sidebar of cart data changes
    window.dispatchEvent(new CustomEvent('cartItemUpdated'), { detail: cookies.getAll() });

    setMess(isFarsi ? "به سبد خرید اضافه شد" : "Added to you cart");
    setAdded('translate-y-0 opacity-1 alert-success ');
    setTimerStarted(true);
  };

  return (
    <div className={`bg-base-100 min-w-screen h-full z-30 sm:p-10 flex flex-col items-center justify-center gap-10 font-yek`} data-theme={theme}>
      <div className=' text-neutral h-fit bg-secondary flex flex-col md:flex-row sm:rounded overflow-hidden product-layout'>
        <div className='md:w-2/5 product-media'>
          <ImageSlider uuids={images} />
        </div>
        <div className='divide-x divider hidden sm:block'></div>
        <div className='p-10 sm:w-3/5 sm:gap-16 gap-3 flex flex-col justify-start '>

          <div className='h-1/3 '>
            <h1 className='text-3xl text-accent'>
              {isFarsi ? `${product.title} #${product.id}` : `${product.title} #${product.id}`}
            </h1>
          </div>

          <div className={`'  font-light sm:w-full flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2`}>
          
                            <div className=' flex flex-row items-center sm:gap-3 sm:w-1/2 gap-2'>
                                    <select
                                      className="p-2 bg-base-100 sm:rounded text-accent w-1/2"
                                      value={selectedSize || ""}
                                      aria-label={t('انتخاب اندازه', 'Choose size')}
                                      onChange={(event) => {handlesizeselect(event.target.value)}}
                                    >
                                      <option disabled value="">{isFarsi ? "انتخاب اندازه" : "Size"}</option>
                                      <option value="L">L</option>
                                      <option value="XL">XL</option>
                                      <option value="XXL">2XL</option>
                                    </select>
                                    <span className='text-accent w-1/2  '>
                                       {selectedSize ? (left > 0 ? `${left} ${t('موجود', 'available')}` : t('ناموجود', 'Sold out')) : t('انتخاب کنید', 'Choose a size')}
                                    </span>
                            </div>
                          <button className="sm:w-1/4 rounded underline text-accent" onClick={()=>document.getElementById('my_modal_4').showModal()}>{isFarsi?'راهنمای اندازه':'Size Chart'}</button>
                          <dialog id="my_modal_4" className="modal">
                                <form method="dialog" className="bg-base-100 modal-box max-w-5xl rounded-lg font-bold">
                                  <div className="overflow-x-auto ">
                                    <table className="table bg-secondary rounded">
                                      {/* head */}
                                      <thead>
                                        <tr>
                                          <th></th>
                                          <th>{isFarsi?'اندازه':'size'}</th>
                                          <th>{isFarsi?'عرض شانه':'width'}</th>
                                          <th>{isFarsi?'ارتفاع':'hight'}</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* row 1 */}
                                        <tr>
                                          <th>1</th>
                                          <td>XL</td>
                                          <td>57</td>
                                          <td>79</td>
                                        </tr>
                                        {/* row 2 */}
                                        <tr>
                                          <th>2</th>
                                          <td>2xl</td>
                                          <td>63</td>
                                          <td>85</td>
                                        </tr>
                                        {/* row 3 */}
                                        <tr>
                                          <th>3</th>
                                          <td>3xl</td>
                                          <td>69</td>
                                          <td>91</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="modal-action font-ral">
                                    {/* if there is a button, it will close the modal */}
                                    <button className="text-accent">Close</button>
                                  </div>
                                </form>
                          </dialog>
          </div>
          <div className='flex flex-col gap-y-3 sm:w-full  '>
            <span className='text-accent sm:text-3xl  sm:items-center'>
              {Number((product.price || 0) * 1000).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')} {t('تومان', 'toman')}
            </span>
            <div>
              <button
                disabled={!(product[selectedSize + "_count"] > 0)}
                className={`${product[selectedSize+'_count'] > 0 || selectedSize === undefined &&  !product.out ?  'text-secondary':'disabled bg-base-100 text-red-600 ' } transition-color p-5 bg-accent rounded-sm sm:text-center sm:w-3/5 font-semibold  w-full `}
                onClick={() => product[selectedSize+'_count'] > 0 && addToCart(id, selectedSize)}
              >
                {selectedSize === undefined && !product.out ? t('یک سایز را انتخاب کنید', 'Choose a size') : product[selectedSize+'_count'] > 0 && !product.out ? t('افزودن به سبد خرید', 'Add to bag') : t('ناموجود', 'Sold out')}
              </button>
            </div>
          </div>
          <div className={`alert transform  rounded-none ease-in transition-all duration-300 bottom-0 my-10 left-0 right-0 fixed ${added}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{mess}</span>
          </div>
        </div>
      </div>
      <div className='w-full'>
        <Footer />
      </div>
    </div>
  );
};

export default ItemPage;
