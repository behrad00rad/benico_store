import {useLanguage} from '../language';
import React, { useEffect, useState,useContext } from 'react';
import Cookies from 'universal-cookie';
import {ThemeContext} from './themeprovider'
const cookies = new Cookies 
 
const Cart = () => {
  const {t, lang} = useLanguage();
  const cookies = new Cookies();
  const items = cookies.getAll()
  const theme = useContext(ThemeContext);
  const [cartItems, setCartItems] = useState(items.cartData);
  const [finalP, setFinalP] = useState(0);
  const MAINURL = 'http://127.0.0.1:2000';

  const [prods, setProds] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [inverted,setin] = useState()
  const isFarsi = cookies.getAll().Lang === 'fa';


  useEffect(()=>{setin(theme == "benidark" ? " " : "invert" )},[theme])
  // Add a new useEffect hook to calculate the total price whenever cartItems changes
  useEffect(() => {
  // Calculate the total price based on the updated cartItems
    const totalPrice = calculateTotalPrice();
    setFinalP(totalPrice);
  }, [cartItems]);

  useEffect(() => {
    loadCartItems();
    handleCartItemUpdated();
    fetchImageUrls();
  }, []);
  
  
  const handleCartItemUpdated = async () => {
    const live =cookies.getAll().cartData
    setCartItems( await live);
  }; 

    // Fetch and store the image URLs when the component mounts
  const fetchImageUrls = async () => {
      const newImageUrls = {};
      for (const item of await cookies.getAll().cartData) {
        newImageUrls[item.productId] = await fetchImage(item.productId);
      }
      setImageUrls(newImageUrls);
    };



const loadCartItems = async () => {
  const cartData = cookies.get('cartData');
  if (cartData) {
    setCartItems(cartData);
  } else {
    setCartItems([]);
  }
};

  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;
    cartItems.forEach((cartItem) => {
      // Assuming that each product has a 'price' property, adjust this according to your actual data structure
      totalPrice += cartItem.price * cartItem.quantity;
    });
    return totalPrice;
  };

  const fetchImage = async (id) => {
    try {
      const response = await fetch(`${MAINURL}/product/filtered/${id}/`);
      const data = await response.json();
      // Return the URL of the first image of the product
      return `${MAINURL}/image/item/${data.data[0].images[0]}`;
    } catch (error) {
      console.error('Error fetching products:', error);
      return '';
    }
  };

  const handleDecreaseQuantity = async (productId,productSize) => {

    const updatedCartItems = cartItems.map((item) => {
      if (item.productId === productId && item.size === productSize) {
        const updatedQuantity = item.quantity - 1;
        return { ...item, quantity: updatedQuantity };
      } else {
        return item;
      }
    });

    // Remove items with quantity 0 or negative
    const filteredCartItems = updatedCartItems.filter((item) => item.quantity > 0);

    // Update the cart data in cookies
    cookies.set('cartData', filteredCartItems, { path: '/' });

    // Trigger a state update in the Nav component to reflect the changes in cart items count
    const cartItemCount = filteredCartItems.length;
    window.dispatchEvent(new CustomEvent('cartItemCountUpdated', { detail: cartItemCount }));

    // Update the cartItems state with the new cart items
    setProds(filteredCartItems);
    
    // Notify the parent component about the updated cartItems
    handleCartItemUpdated()
  };
  
  const handleIncreaseQuantity = async (productId,productSize) => {
    const updatedCartItems = cartItems.map((item) => {
      if (item.productId === productId && item.size === productSize && item.quantity < item.left) {
        const updatedQuantity = item.quantity + 1;
        return { ...item, quantity: updatedQuantity };
      } else {
        return item;
      }
    });

    // Update the cart data in cookies
    cookies.set('cartData', updatedCartItems, { path: '/' });

    // Trigger a state update in the Nav component to reflect the changes in cart items count
    const cartItemCount = updatedCartItems.length;
    window.dispatchEvent(new CustomEvent('cartItemCountUpdated', { detail: cartItemCount }));

    // Update the cartItems state with the new cart items
    setProds(updatedCartItems);

    // Notify the parent component about the updated cartItems
    handleCartItemUpdated()
  };
  

    // Fetch and store the image URLs when cartItems change


    const renderCartItems = () => {
      if (cartItems) {
        return cartItems.map((cartItem, index) => (
          <div className={`" flex items-center mb-3 rounded-sm overflow-hidden justify-center bg-secondary ${isFarsi?'font-yek':'font-mont'}`} key={index} data-theme={theme}>
                <div className='flex w-full h-full'>    
                      <div className='w-1/3 h-1/3 text-center'>
                          <span>{t('تعداد', 'Quantity')}</span>
                          <div className=' flex items-center'>
                              <button
                                  className=" sm:w-1/2 p-2 rounded-sm hover:bg-base-100 ease-linear w-full"
                                  onClick={() => handleDecreaseQuantity(cartItem.productId, cartItem.size)}
                              >
                              <svg className={inverted} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 11H5V13H19V11Z" fill="rgba(255,255,255,1)"></path></svg>
                              </button>
                              <span className='text-center font-2xl w-full'>{cartItem.quantity}</span>
                              <button
                              className=" sm:w-1/2 p-2 rounded-sm hover:bg-base-100 ease-linear w-full"
                              onClick={() => handleIncreaseQuantity(cartItem.productId, cartItem.size)}
                              >
                              <svg className={inverted} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" fill="rgba(255,255,255,1)"></path></svg>
                          </button>
                          </div>
                      </div>
                      <div className='flex flex-col  p-2 sm:w-1/3'>
                          <h1 className='sm:text-3xl text-sm text-accent'>{cartItem.title}</h1>
                          <span className='w-full text-xs sm:text-sm '>{isFarsi ? 'اندازه' : 'Size'} : {cartItem.size}</span>
                          <span className='w-full text-xs sm:text-sm '>{isFarsi ? cartItem.price + ',000 تومان' :cartItem.price + ',000 Tm' }</span>
                      </div>
                </div>
                <div className="sm:w-1/3 w-1/2">
                  <img className='bg-accent' src={imageUrls[cartItem.productId]} alt={`Product ${index}`} />
                </div>
          </div>
        ));
      }
    };
  

  return (
    <div className={`flex flex-col gap-4 min-h-screen ${isFarsi?'font-yek':'font-mont  font-thin '}`} data-theme={theme}>
            <div className="p-8 flex items-center justify-center min-w-screen">
                <ul className="steps w-full flex-reverse ">
                        <li className="step step-accent"><a href='/cart/'>{isFarsi?'سبد خرید':'Cart'}</a></li>
                        <li className="step">{isFarsi?'تسویه حساب':'Address information'}</li>
                        <li className="step">{isFarsi?'تکمیل سفارش':'PROCEED To CHECKOUT'}</li>
                </ul>
            </div>
            {!cartItems.length && 
              <span className="text-center">
                  {isFarsi?'.کالایی در سبد خرید نیست':'There is no items in cart'}
              </span>}

        {cartItems.length !== 0  &&
        <div className='sm:flex flex-col'>
            <div className="sm:w-2/3 p-5">
                {renderCartItems()}
            </div>
            <div className="p-5 sm:w-2/5 w-full h-fit ">
                      <div className=" w-full h-full p-5 text-center items-center justify-center rounded-sm bg-secondary text-accent">
                        <h1 className="text-xl">{isFarsi?'سبد خرید':'Checkout detail'}</h1>
                        <table className="table items-center  justify-center text-right text-xs">
                            <thead className="text-accent ">
                              <tr>
                                <td>{t('قیمت', 'Price')}</td>
                                <td>{t('تعداد', 'Quantity')}</td>
                                <td>{isFarsi?'محصول':'product'}</td>
                              </tr>
                              {cookies.getAll().cartData?cookies.getAll().cartData.map(
                                (product)=>(
                                  <tr>
                                    <td>{Number((product.price) * 1000).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')} {t('تومان', 'toman')}</td>
                                    <td>{product.quantity}x</td>
                                    <td className="flex flex-col">
                                      <span>
                                        {product.productId}# {product.title}
                                      </span>
                                      <span className="text-xs text-neutral">
                                        {t('سایز', 'Size')}: {product.size}

                                      </span>
                                      </td>
                                  </tr>

                                )
                              ):'none'}
                        </thead>
                        <tbody>
                              <tr>
                                <td>{Number((calculateTotalPrice()) * 1000).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')} {t('تومان', 'toman')}</td>
                                <td></td>
                                <td>{isFarsi?'مبلغ کل':'final price'}</td>
                              </tr>
                          </tbody>
                        </table>
                        <a
                        href='/checkout'
                        className="btn  hover:border-2 hover:border-accent rounded-sm m-6 bg-accent hover:bg-base-100 hover:text-accent text-base-100" 
                        >{t('ادامه ثبت سفارش', 'Continue to checkout')} </a>
                      </div>
                        
            </div>
        </div>
        }
    </div>
        )};
    export default Cart;
