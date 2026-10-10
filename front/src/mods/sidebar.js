import React, { useEffect, useState,useContext } from 'react';
import Cookies from 'universal-cookie';
import ImageSlider from './imageslider';
import {ThemeContext} from './themeprovider'

 
const CartSidebar = ({ items, onCartItemsChange }) => {

  const theme = useContext(ThemeContext);
  const [cartItems, setCartItems] = useState(items.cartData);
  const [finalP, setFinalP] = useState(0);
  const MAINURL = 'http://127.0.0.1:2000';
  const cookies = new Cookies();
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
    window.addEventListener('CartOpened', handleCartItemUpdated);
    window.addEventListener('CartOpened',fetchImageUrls);
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
    return (formatNumberWithCommas(totalPrice));
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
    onCartItemsChange(filteredCartItems);
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
    onCartItemsChange(updatedCartItems);
    handleCartItemUpdated()
  };
  

    // Fetch and store the image URLs when cartItems change


    const renderCartItems = () => {
      if (cartItems) {
        return cartItems.map((cartItem, index) => (
          <div className={`" flex items-center justify-between bg-secondary h-fit m-2 ${isFarsi?'font-yek':'font-mont'}`} key={index} data-theme={theme}>
            <div className='sm:flex-row flex flex-col sm:w-full w-1/2'>
              <div className="gap-2 p-4 flex items-center justify-center sm:w-1/3 w-full ">
                <button
                  className=" sm:w-1/2 p-2 rounded-sm hover:bg-base-100 ease-linear w-full"
                  onClick={() => handleDecreaseQuantity(cartItem.productId, cartItem.size)}
                >
                  <svg className={inverted} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 11H5V13H19V11Z" fill="rgba(255,255,255,1)"></path></svg>
                </button>
                <button
                  className=" sm:w-1/2 p-2 rounded-sm hover:bg-base-100 ease-linear w-full"
                  onClick={() => handleIncreaseQuantity(cartItem.productId, cartItem.size)}
                >
                  <svg className={inverted} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" fill="rgba(255,255,255,1)"></path></svg>
                </button>
              </div>
    
              <div className="flex flex-col p-2 text-neutral  ">
                <span className='sm:text-2xl text-accent'>{cartItem.title}</span>
                <span className='w-full'>{isFarsi ? 'اندازه' : 'Size'} : {cartItem.size}</span>
                <span className='w-full'>{isFarsi ? ' تعداد' : 'QTY'} : {cartItem.quantity}</span>
                <span className='text-accent'>{isFarsi ? cartItem.price + ',000 تومان' :cartItem.price + ',000 Tm' }</span>
              </div>
            </div>
            <a  href={'/item/'+cartItem.productId} className="md:w-1/3 w-1/2">
              <img className='bg-white' src={imageUrls[cartItem.productId]} alt={`Product ${index}`} />
            </a>
          </div>
        ));
      }
    };
    
  

  return (
    <div className={`flex flex-col gap-4 min-h-screen ${isFarsi?'font-yek':'font-mont  font-thin '}`} data-theme={theme}>
        {!cartItems.length && 
          <span className="text-center">
              {isFarsi?'.کالایی در سبد خرید نیست':'There is no items in cart'}
          </span>}

        {cartItems.length !== 0  &&<>
        <div className="h-full w-full ">
            {renderCartItems()}
        </div>

          <div className='divide-x divider '></div>
        <div className='text-center text-accent'>
          <span>
            {isFarsi?'جمع کل خرید':'Total'} :<b> {calculateTotalPrice()},000{isFarsi?' تومان ':'Tm'}</b>
          </span>
        </div>
        <div className='divide-x divider '></div>
        <div className='flex flex-col gap-2 items-center justify-center pb-11'>
              <a href='/cart' className=' w-2/3  bg-secondary p-2 rounded-full text-center text-accent'>
              <span>
              {isFarsi?' رفتن به سبد خرید':'view cart'}
              </span>
              </a>
              <a href='/checkout' className=' w-2/3  font-bold bg-accent p-2 rounded-full text-center text-secondary'>
              <span>
              {isFarsi?'تسویه حساب':'PROCEED TO CHECKOUT'}
              </span>
              </a>
        </div>
        </>
        }
    </div>
        )};
    export default CartSidebar;
